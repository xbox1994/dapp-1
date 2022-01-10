import { useCallback, useEffect,useState,useMemo,useRef } from 'react'
import useLanguage from '../context/localization/useLanguage'
import {useWeb3React} from "@web3-react/core";
import {BigNumber} from "bignumber.js";
import {
    adventureTimeContractV2Address,
    useAdventureTimeContractV2, useRarityCellarContract,useRarityCloakContract,
    useRarityContract,
    useRarityGoldContract
} from "../utils/contracts";
import axios from "axios";
import {hex2int} from "../App";

function Cloak() {
    const {t} = useLanguage();
    const {activate, account, chainId} = useWeb3React();
    const [levelUpBtn, setlevelUpBtn] = useState(t('Cloak Claim'));

    useEffect(()=>{
        setlevelUpBtn(t('Cloak Claim'))
    },[levelUpBtn,setlevelUpBtn,t])

    const [cloakCount, setCloakCount] = useState(0);
    const [cloakCountLast, setCloakCountLast] = useState(0);
    const checkCloakCount = async ()=>{
        if (rarityCloakContract) {
            const tx = await rarityCloakContract.next_summoner();
            setCloakCount(parseInt(tx + ''));
            setCloakCountLast(20000 - parseInt(tx + ''));
        }
    };
    useEffect(()=>{
        setInterval(()=>{
            checkCloakCount();
        }, 8000)
    },['']);


    const [cloaks, setCloaks] = useState('');
    const [ba, setBa] = useState(0);

    const xxxx = async ()=> {
        if (account && cloakCount > 0) {
            const tx = await rarityCloakContract.balanceOf(account);
            const balance = parseInt(tx + '');
            setBa(balance);
            if (balance > 0) {
                let cc = '';
                for (let i = 0; i < cloakCount; i = i + 500) {
                    let coll = [];
                    for (let j = i; j < i + 500 && j<cloakCount; j++) {
                        coll.push(j)
                    }
                    await Promise.all(
                        coll.map(async tokenId => {
                                await rarityCloakContract.ownerOf(tokenId).then(x => {
                                    if (x === account) {
                                        rarityCloakContract.itemRarity(tokenId).then(y => {
                                            cc = cc === '' ? (tokenId + '(' + y + ')') : cc + ',' + (tokenId + '(' + y + ')');
                                            setCloaks(cc);
                                        })
                                    }
                                })
                            })
                    )
                }
            }
        }
    };

    useEffect(()=>{
            xxxx();
    },[cloakCount]);

    const rarityCloakContract = useRarityCloakContract();
    const cloakClick = async ()=>{
        if (levelUpBtn !== t('Cloak Claim'))
            return;
        setlevelUpBtn(`${t('loading')}...`);
        try {
            const tx = await rarityCloakContract.claimInvisibleCloak({
                value: '0x' + new BigNumber(10 ** 18).toString(16),
                from: account
            });
            console.log(tx);
        } catch (e) {
            let code = e.code;
            if (code === 4001){
                alert(t('Transaction refused'));
            } else if (code === -32603){
                alert(e.data.message);
            } else {
                alert(t('The fantom network error, please try again'))
            }
        }
        setlevelUpBtn(t('Cloak Claim'))
    };

    return(
        <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
            <h3 style={{display: 'flex'}}>{t('Invisibility Cloak btn')}</h3>
            <div style={{display: 'flex', marginTop: "20px", flexWrap: "wrap", color: 'red'}}>{t('Cloaks desc')}</div>
            <div style={{display: 'flex', marginTop: "20px", flexWrap: "wrap"}}>{t('Remaining cloaks')}：{cloakCountLast}</div>
            <div style={{display: 'flex', marginTop: "20px", flexWrap: "wrap", wordBreak: "break-word"}}>{t('Owned cloaks')}({ba})：{cloaks}</div>

            <button style={{ marginTop: '10px', height: "40px", width: "90px"}} onClick={cloakClick}>{levelUpBtn}</button>
        </div>
    );
}

export default Cloak;
