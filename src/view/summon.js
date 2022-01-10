import { useCallback, useEffect,useState,useMemo,useRef } from 'react'
import useLanguage from '../context/localization/useLanguage'
import {BigNumber} from "bignumber.js";
import {useWINETokenContract} from "../App";

export const AddressZero = "0x0000000000000000000000000000000000000000";

function Summon() {
    const {t} = useLanguage()
    const contract = useWINETokenContract('0xce761d788df608bd21bdd59d6f4b54b2e27f25bb', true);
    const [summonID, setSummon] = useState(-1);
    const [summonAmount, setSummonAmount] = useState(1);
    const changeSummon = (e)=>{
        setSummon(e.target.value);
    };
    const changeSummonAmount = (e)=>{
        if (e.target.value >= 1)
            setSummonAmount(e.target.value);
        else{
            alert(t('Create at least 1'))
        }
    };
    const summon = async ()=>{
        console.log(summonID + ', ' + summonAmount)
        if (summonID<1){
            alert(t('Please select a Summoner'))
        } else if (summonAmount < 1) {
            alert(t('Please input amount'))
        }else {
            const summonIDDecimals = new BigNumber(summonID);
            for(let i=0;i<summonAmount;i++){
                try {
                    const txReceipt = await contract.summon(`0x${summonIDDecimals.toString(16)}`);
                    console.log(txReceipt)
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
            }
        }
    };


    return (
        <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
            <h3 style={{display: 'flex'}}>{t('Mass Recruit')}</h3>
            <div style={{display: 'flex', marginLeft: "40px", fontSize: '10px', color: "red"}}>{t('You need to confirm in Metamask as many Summon heroes as you want to recruit')}</div>
            <span style={{display: 'flex', marginTop: "20px"}}>{t('Summoner Selection')}</span>
            <div style={{display: 'flex', marginTop: '10px'}}>
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='1' onClick={changeSummon}/>Barbarian
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='2' onClick={changeSummon}/>Bard&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='3' onClick={changeSummon}/>Cleric&nbsp;&nbsp;&nbsp;
            </div>
            <div style={{display: 'flex', marginTop: '10px'}}>
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='4' onClick={changeSummon}/>Druid&nbsp;&nbsp;&nbsp;&nbsp;
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='5' onClick={changeSummon}/>Fighter&nbsp;&nbsp;
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='6' onClick={changeSummon}/>Monk&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            <div style={{display: 'flex', marginTop: '10px'}}>
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='7' onClick={changeSummon}/>Paladin&nbsp;&nbsp;
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='8' onClick={changeSummon}/>Ranger&nbsp;&nbsp;&nbsp;
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='9' onClick={changeSummon}/>Rogue&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            <div style={{display: 'flex', marginTop: '10px'}}>
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='10' onClick={changeSummon}/>Sorcerer&nbsp;
                <input type='radio' name='hero' style={{marginLeft: '40px'}} value='11' onClick={changeSummon}/>Wizard&nbsp;&nbsp;&nbsp;
            </div>

            <div style={{display: 'flex', marginTop: '10px'}}>
                {t('Recruit Amount')}：<input defaultValue='1' onChange={changeSummonAmount}/>
            </div>

            <button style={{ marginTop: '10px', height: "40px", width: "60px"}} onClick={summon}>{t('Recriut')}</button>
        </div>
    );
}

export default Summon;
