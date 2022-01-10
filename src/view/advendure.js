import { useCallback, useEffect,useState,useMemo,useRef } from 'react'
import useLanguage from '../context/localization/useLanguage'
import axios from "axios";
import {BigNumber} from "bignumber.js";
import {UnsupportedChainIdError, useWeb3React} from "@web3-react/core";
import {
    InjectedConnector,
    NoEthereumProviderError,
    UserRejectedRequestError as UserRejectedRequestErrorInjected
} from "@web3-react/injected-connector";
import {UserRejectedRequestError as UserRejectedRequestErrorWalletConnect} from "@web3-react/walletconnect-connector";
import {hex2int} from '../App';
import {useRarityContract, adventureTimeContractV1Address, adventureTimeContractV2Address, approveAllContactV1Address, useAdventureTimeContractV1, useAdventureTimeContractV2} from '../utils/contracts'

const injected = new InjectedConnector({ supportedChainIds: [250] })
export const AddressZero = "0x0000000000000000000000000000000000000000";

function Adv() {
    const {t} = useLanguage()
    const {activate, account, chainId} = useWeb3React();
    const [nftIDS, setNftIDS] = useState("");
    const [advedIDS, setAdvedIDS] = useState("");
    const [advingIDS, setAdvingIDS] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [adventureBtn, setAdventureBtn] = useState(t('Smart Adventure'));

    const [version, setVersion] = useState('v1');
    const changeVersion = ()=>{
        setVersion(version === 'v1' ? 'v2' : 'v1');
    }

    const contract = useRarityContract();
    const [setIds, setsetIds] = useState('');
    const [notice, setNotice] = useState('');
    const changeIds = (e)=>{
        setsetIds(e.target.value);
    };

    useEffect(()=>{
        setAdventureBtn(t('Smart Adventure'))
    },[adventureBtn,setAdventureBtn,t])

    // const updateIDs = useCallback( ()=>{
    useEffect( ()=>{
        if (!account){
            console.log(account)
            return
        } else {
            setsetIds('');
            // const url = 'https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress=0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb&address=' + account + '&tag=latest&apikey=RTR3W4VHBSVYIJ11PJ3J3UIQ6G8XGUJGGI'
            // // const url = 'https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress=0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb&address=0x7139b7f8a249FD58a5151b1b92f91ca32551D7Db&tag=latest&apikey=81CTWCS4N63GKQ4FUZ2YMC85M98YGUNTCN'
            // console.log(url)
            // axios.get(url)
            //     .then(
            const url = 'https://api.rarity.game/subgraphs/name/rarity';
            const data = {"operationName":"getSummoners","variables":{"owner": account},"query":"query getSummoners($owner: String!) {\n  summoners(first: 1000, where: {owner: $owner}) {\n    id\n    owner\n    _class\n    _level\n    __typename\n  }\n}\n"}

            axios.post(url, data)
                .then(
                    async (response) => {
                        const result = response.data.data.summoners;
                        let n = '';
                        let ned = '';
                        let ning = '';
                        let time = Date.now()/1000;
                        for (const i in result){
                            let summoner = result[i].id;
                            if (summoner) {
                                n = i === 0 ? hex2int(summoner)+'' : (n + ',' + hex2int(summoner));
                                contract.adventurers_log(summoner).then(
                                    x => {
                                        if (x>=(time)){
                                            ned = ned === '' ? hex2int(summoner)+'' : (ned + ',' + hex2int(summoner));
                                        } else {
                                            ning = ning === '' ? hex2int(summoner)+'' : (ning + ',' + hex2int(summoner));
                                        }
                                        setAdvedIDS(ned);
                                        setAdvingIDS(ning);
                                    }
                                );

                            }
                        }
                        //console.log('nnnnnn===========')
                        setNftIDS(n);
                    }
                )
                .catch(
                    (error1) => {
                        console.log(error1)
                    }
                )
        }
    }, [account, contract]);

    /**
    useEffect(()=>{
        if (account){
            const url = 'https://api.rarity.game/subgraphs/name/rarity';
            const data = {"operationName":"getSummoners","variables":{"owner": account},"query":"query getSummoners($owner: String!) {\n  summoners(first: 1000, where: {owner: $owner}) {\n    id\n    owner\n    _class\n    _level\n    __typename\n  }\n}\n"}

            axios.post(url, data)
                .then(
                    async (response) => {
                        console.log(response.data)
                    })
        }
    }, [account, contract]);
     */

    const [aedAmount, setaedAmount] = useState(0);
    const [aingAmount, setaingAmount] = useState(0);


    const unique = (arr)=>{
        const newArr = [];
        for(let i = 0; i < arr.length; i++){
            if(newArr.indexOf(arr[i]) == -1){
                newArr.push(arr[i])
            }
        }
        return newArr;
    }

    useEffect(()=>{
        // console.log('0000000011dfsdew');
        if (advedIDS){
            const aed = advedIDS ? advedIDS.replace('，', ','):'';
            const ids = aed.split(',');
            const un = unique(ids);
            let n = '';
            for (let i=0;i<un.length;i++){
                n = i == 0 ? un[i] +'' : (n + ',' + un[i]);
            }
            setAdvedIDS(n);
            setaedAmount(un.length);
        }

        if (advingIDS){
            const aing = advingIDS ? advingIDS.replace('，', ','):'';
            const ids = aing.split(',');
            const un = unique(ids);
            let n = '';
            for (let i=0;i<un.length;i++){
                n = i == 0 ? un[i] +'' : (n + ',' + un[i]);
            }
            setAdvingIDS(n);
            setaingAmount(un.length);
        }

    }, [advedIDS, advingIDS, setaedAmount, setaingAmount]);


    useEffect(
        ()=>{
            if (injected) {
                activate(injected, async (error) => {
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

    const [canAdventure, setCanAdventure] = useState(true);
    const adventureContractTemp1 = useAdventureTimeContractV1();
    const adventureContractTemp2 = useAdventureTimeContractV2();
    const adventureContract = version==='v2'? adventureContractTemp2 : adventureContractTemp1; //useAdventureContract(adventureTimeContractV1Address, true);
    const adventure = async () => {
        if (!canAdventure){
            return;
        }
        if (!advingIDS || advingIDS === ''){
            alert(t('Already adventured today'))
            return;
        }
        setAdventureBtn("loading...");
        setCanAdventure(false);
        setNotice(t('Loading'));
        try {
            setAdvingIDS(advingIDS.replace('，', ','));
            setsetIds(setIds.replace('，', ','));
            const ids = setIds&&setIds!==''?setIds.split(','):advingIDS.split(',');

            const datas = [];
            for (let id in ids) {
                if (ids[id]) {
                    const idDecimals = new BigNumber(ids[id]);
                    datas.push(`0x${idDecimals.toString(16)}`);
                }
            }
            const txReceipt = await contract.isApprovedForAll(account, version==='v2'?adventureTimeContractV2Address:adventureTimeContractV1Address);
            if (txReceipt) {
                const adventureTime = await adventureContract.adventureTime(datas);
                const w = await adventureTime.wait();
                if (w.status) {
                    window.location.href = '/';
                }
            } else {
                alert(t('Please approve first'));
                const approveAll = await contract.setApprovalForAll(adventureTimeContractV1Address, `0x1`);
                const w = await approveAll.wait();
                if (w.status) {
                    console.log('approve success')
                }
            }
        } catch (e) {
            console.error(e);
            let code = e.code;
            if (code === 4001){
                alert(t('Transaction refused'));
            } else if (code === -32603){
                alert(e.data.message);
            } else {
                alert(t('The fantom network error, please try again'))
            }
        }
        setAdventureBtn(t('Smart Adventure'));
        setCanAdventure(true);
        setNotice("")
    };

    return (
        <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
            {/*<div style={{color: 'red', marginTop: '10px'}}><span>你正在使用{version}</span> <button onClick={changeVersion}>切换到{version==='v2'?'v1':'v2'}</button> </div>*/}
            <h3 style={{display: 'flex'}}>{t('Smart Adventure')}</h3>
            <div style={{display: 'flex', marginLeft: "40px", fontSize: '10px', color: "red"}}>{t('Smart adventure can help you save much transaction fees.')}</div>
            <div style={{display: 'flex', marginLeft: "40px", fontSize: '10px', color: "red"}}>{t('Rarity contract address:')}<a href='https://ftmscan.com/address/0xce761d788df608bd21bdd59d6f4b54b2e27f25bb#code' target='_blank'>https://ftmscan.com/address/0xce761d788df608bd21bdd59d6f4b54b2e27f25bb#code </a> </div>
            <div style={{display: 'flex', marginLeft: "40px", fontSize: '10px', color: "red"}}>{t('Auto-adventure contract address')+version}：<a href={`https://ftmscan.com/address/${version==='v2'?adventureTimeContractV2Address:adventureTimeContractV1Address}#code`} target='_blank'>https://ftmscan.com/address/{version==='v2'?adventureTimeContractV2Address:adventureTimeContractV1Address}#code </a> </div>
            <div style={{display: 'flex', marginLeft: "40px", fontSize: '10px', color: "red"}}>{t('Approval-For-All contract address')+version}：<a href={`https://ftmscan.com/address/${version==='v2'?adventureTimeContractV2Address:approveAllContactV1Address}/#code`} target='_blank'>https://ftmscan.com/address/{version==='v2'?adventureTimeContractV2Address:approveAllContactV1Address}#code </a> </div>
            {/*<div style={{display: 'flex'}}>全部冒险ID：</div>*/}
            {/*<div style={{display: 'flex', margin: '10px 40px 0px 40px'}}><text>{nftIDS}</text></div>*/}

            <div style={{display: 'flex', marginTop: "20px", flexWrap: "wrap"}}>{t('Adventured ID')}({aedAmount})：</div>
            <div style={{display: 'flex', margin: '10px 40px 0px 40px', width: "100%"}}><text style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{advedIDS}</text></div>

            <hr style={{marginTop: "20px"}}/>
            <div style={{display: 'flex', marginTop: "20px"}}>{t('Idle ID')}({aingAmount})：</div>
            <div style={{display: 'flex', margin: '0px 40px 0px 40px'}}><text  style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{advingIDS}</text></div>
            <hr style={{margin: "20px 0px"}}/>
            <br/>
            <div style={{display: 'flex', color: 'green'}}>{t('If you have mass Summon heroes, try to break them up into dozens at a time. Note that multiple are separated by commas.')}</div>
            <div>
                <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}} onClick={changeIds} onKeyUp={changeIds}/>
            </div>
            <div style={{color: 'red'}}>{notice}</div>
            {t('Auto-adventure')}：<button type="button" style={{marginTop: '10px',height: "40px", width: "120px"}} onClick={adventure}>{adventureBtn}</button>
            <br/>
            {t('Recommend Chrome')}
            <br/>
        </div>
    )
};

export default Adv;
