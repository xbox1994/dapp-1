import { useCallback, useEffect,useState,useMemo,useRef,useContext } from 'react'
// import logo from './logo.jpg';
import './App.css';
import {Web3ReactProvider, useWeb3React, UnsupportedChainIdError} from '@web3-react/core'
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from "@web3-react/walletconnect-connector";
import rarityABI from './abi/rarityABI.json';
import adventureTimeABI from './abi/adventureTimeABI.json';
import { Contract } from '@ethersproject/contracts'
import axios from "axios";
import Adv from './view/advendure';
import Summon from './view/summon';
import LevelUp from './view/levelUp';
import Craftine from './view/craftine';
import Gold from './view/gold';
import Point from './view/point';
import ApproveAll from './view/approveAll';
import TransferGold from './view/transferGold';
import TransferRM from './view/transferRM';
import { LanguageContext } from './context/localization/Provider'
import useLanguage from './context/localization/useLanguage'
import Cloak from "./view/cloak";

const injected = new InjectedConnector({ supportedChainIds: [250] })
export const AddressZero = "0x0000000000000000000000000000000000000000";

const useActiveWeb3React = () => {
  const { library, chainId, ...web3React } = useWeb3React();
  const refEth = useRef(library);
  const [provider, setprovider] = useState(library );

  useEffect(() => {
    if (library !== refEth.current) {
      setprovider(library );
      refEth.current = library
    }
  }, [library]);

  return { library: provider, chainId: 250, ...web3React }
}

export function getAddress(address: string): string {
  let result = null;

  if (typeof(address) !== "string") {
    console.log("invalid address", "address", address);
  }

  if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {

    // Missing the 0x prefix
    if (address.substring(0, 2) !== "0x") { address = "0x" + address; }

    // result = getChecksumAddress(address);

    // It is a checksummed address with a bad checksum
    if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
      console.log("bad address checksum", "address", address);
    }

    // Maybe ICAP? (we only support direct mode)
  } else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {

    // It is an ICAP address with a bad checksum
    // if (address.substring(2, 4) !== ibanChecksum(address)) {
    //   console.log("bad icap checksum", "address", address);
    // }

    // result = _base36To16(address.substring(4));
    // while (result.length < 40) { result = "0" + result; }
    // result = getChecksumAddress("0x" + result);

  } else {
    console.log("invalid address", "address", address);
  }

  return result;
}

export function isAddress(address: string): boolean {
  try {
    getAddress(address);
    return true;
  } catch (error) { }
  return false;
}

export function useWINETokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, rarityABI, withSignerIfPossible)
}

export function useAdventureContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, adventureTimeABI, withSignerIfPossible)
}

export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account))
}

export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function hex2int(hex) {
  if (hex.startsWith('0x'))
    hex = hex.substr(2);
  let len = hex.length, a = new Array(len), code;
  for (let i = 0; i < len; i++) {
    code = hex.charCodeAt(i);
    if (48<=code && code < 58) {
      code -= 48;
    } else {
      code = (code & 0xdf) - 65 + 10;
    }
    a[i] = code;
  }

  return a.reduce(function(acc, c) {
    acc = 16 * acc + c;
    return acc;
  }, 0);
}

function App() {

  const {activate, account, chainId} = useWeb3React();
  const languageContext = useContext(LanguageContext)
  const [language,setLanguage] = useState('en')
  const {t} = useLanguage()
  const selectRefZh = useRef()
  const selectRefEn = useRef()

  const getGas = ()=>{
    const url = 'https://rpc.ftm.tools';
    const data = {"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":73};
    axios.post(url, data)
        .then((response) => {
          setGasPrice(hex2int(response.data.result)/10**9)
        })
  };

  const [gasPrice, setGasPrice] = useState(0);


  const [btn, setBtn] = useState('adv');
  const changeBtn = (e)=> {
    setBtn(e.target.value);
  };

  // useEffect(()=>{
  //   setInterval(()=>{
  //     getGas();
  //   }, 10000);
  // }, [getGas]);

  useEffect(
      ()=>{
        if (injected) {
          activate(injected, async (error: Error) => {
            if (error instanceof UnsupportedChainIdError) {
              console.log('Metamask not Network config')
            } else {
              if (error instanceof NoEthereumProviderError) {
                // Provider Error: No provider was found
                console.log('Provider Error: No provider was found')
              } else if (
                  error instanceof UserRejectedRequestErrorInjected ||
                  error instanceof UserRejectedRequestErrorWalletConnect
              ) {
                console.log('Authorization Error: Please authorize to access your account')
              } else {
                console.log(error.name, error.message)
              }
            }
          });
        }
      }, [activate]);

  useEffect(()=>{
    const localStorageLanguange = window.localStorage.getItem('language')
    if(localStorageLanguange){
      languageContext.setLanguage(localStorageLanguange)
      setLanguage(localStorageLanguange)
      if(selectRefZh.current && selectRefZh.current.value === localStorageLanguange){
        selectRefZh.current.selected = "selected"
      }
      if(selectRefEn.current && selectRefEn.current.value === localStorageLanguange){
        selectRefEn.current.selected = "selected"
      }
    }else{
      languageContext.setLanguage('en')
      window.localStorage.setItem('language','en')
      selectRefEn.current.selected = "selected"
    }
  },[])

  const handleSelectChange = (e)=>{
    if(e.target){
      const lang = e.target.value
      setLanguage(lang)
      languageContext.setLanguage(lang)
      window.localStorage.setItem('language',lang)
    }
  }

  return (
    <div className="App">
      <div style={{display: 'flex', marginLeft: '20px', marginTop: '5px'}}>
        <div style={{display: 'flex'}}>
          <a href='https://discord.gg/79b3udGGRE' style={{marginLeft: '0px'}} target="_blank">Discord</a>
          {
            language === 'en'
            ? <a href='https://t.me/EN0xAdventure' style={{marginLeft: '10px'}} target="_blank">Telegram</a> 
            : <a href='https://t.me/CN0xAdventure' style={{marginLeft: '10px'}} target="_blank">电报</a> 
          }
          <a href='https://twitter.com/0xAdventure' style={{marginLeft: '10px'}} target="_blank">Twitter</a>
          <a href='https://weibo.com/u/7522502889' style={{marginLeft: '10px'}} target="_blank">{t('weibo')}</a>
          <a href='https://book.auto-adventure.club/rarity-guideline/intro' style={{marginLeft: '10px'}} target="_blank">{t('Cookbook')}</a>
        </div>
        <div style={{display: 'flex', width:'70%', justifyContent: 'flex-end'}}>
          <a href='https://ftmscan.com/address/0x1835E91747d3982f5a4d031eD3b3613b23dFdF06' target="_blank" style={{fontSize: '20px'}}>{t('Donate')}</a>
          <div style={{display:'flex', marginLeft:'40px'}}>
            <span>{language === 'en' ? '语言' : 'language'}：</span>
            <select onChange={handleSelectChange}>
              <option ref={selectRefZh} name="switch-language" value ="zh">中文</option>
              <option ref={selectRefEn} name="switch-language" value ="en">English</option>
            </select>
          </div>
        </div>
      </div>
      <header className="App-header">
        <div style={{marginTop: '10px'}} dangerouslySetInnerHTML={{ __html: t('Welcome to 0xAdventure Guild. Receptionist – Telegram:@JJ_OntheRoad Smart tools supported by 0xAdventure, Enjoy free! All contracts have been verified in ftmscan. Use at your risk.')}} />
        {/*<div style={{marginTop: "20px", fontSize: '18px'}}>*/}
        {/*  gasPrice参考: {gasPrice} Gwei, <text style={{fontSize:"15px", color: "red"}}>FTM手续费波动比较大，可以在gas低的时候操作，注意调整小狐狸的gas pirce，量大可以节约不少手续费</text>*/}
        {/*</div>*/}
        <div style={{marginTop: "10px", fontSize: '18px'}}>
          {t('Wallet Address:')}{account}
        </div>
        {/* <div style={{marginTop:'5px', fontSize:'14px', color: 'red'}}>rarity-game.netlify.app并非官方网站， 目前存在授权后无法查看的bug，可以用 <a href='https://rarity.game/' target="_blank">https://rarity.game/</a> 或者 <a href='https://www.raritymanifested.com/' target='_blank'>https://www.raritymanifested.com/</a> 查看</div> */}
      </header>

      <div style={{display: 'flex', marginTop: '25px', marginLeft: '80px'}}>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='adv'>{t('Smart Adventure')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='summon'>{t('Mass Recruit')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='levelUp'>{t('Smart Level Up')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='fu'>{t('Dungeon')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='gold'>{t('Claim All Gold')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='point'>{t('Ability Score')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='approve'>{t('Approval-For-All')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='transfer'>{t('Collect Materials')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='transferRM'>{t('Collect Summoners')}</button>
        <button style={{ marginLeft: '10px', height: "40px", width: "120px"}} onClick={changeBtn} value='cloak'>{t('Invisibility Cloak btn')}</button>
      </div>

      {
        btn === 'adv' ? <Adv/> : (btn === 'summon' ? <Summon/> : (btn === 'levelUp' ? <LevelUp/> : (btn === 'fu' ? <Craftine/> :(btn === 'gold'?<Gold/>: (btn==='point'?<Point/>:(btn==='approve'?<ApproveAll/>: (btn==='transfer'?<TransferGold/>: (btn==='transferRM'?<TransferRM/>:<Cloak/>))))))) )
      }
      {/*<Adv/>*/}
      {/*<Summon/>*/}
      {/*<LevelUp/>*/}
      {/*<Craftine/>*/}
      {/*<Gold/>*/}
    </div>
  );
}

export default App;
