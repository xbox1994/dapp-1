import { useCallback, useEffect,useState,useMemo,useRef } from 'react'
import useLanguage from '../context/localization/useLanguage'
import {useWeb3React} from "@web3-react/core";
import {
    adventureTimeContractV2Address,
    useAdventureTimeContractV2, useRarityCellarContract,
    useRarityContract,
    useRarityGoldContract
} from "../utils/contracts";
import axios from "axios";
import {hex2int} from "../App";
import {BigNumber} from "bignumber.js";

function IsNum(s)
{
    if(s!=null){
        var r,re;
        re = /\d*/i; //\d表示数字,*表示匹配多个数字
        r = s.match(re);
        return (r==s)?true:false;
    }
    return false;
}

function TransferGold() {
    const {t} = useLanguage()
    const {account} = useWeb3React();
    const contract = useRarityContract();
    const adventureTimeContract = useAdventureTimeContractV2();
    const goldContract = useRarityGoldContract();
    const rarityAdventureContract = useRarityCellarContract();

    const [executor, setExecutor] = useState(-1);
    const [balanceIDS, setBalanceIDS] = useState('');
    const [showBalanceIDS, setShowBalanceIDS] = useState('');
    const [type, setType] = useState(t('Gold'));
    const changeType = ()=>{
        setType(type === t('Gold') ? t('Craft(Ⅰ)') : t('Gold'));
    };

    useEffect( ()=> {
        if (!account) {
            console.log(account)
        } else {
            const url = 'https://api.rarity.game/subgraphs/name/rarity';
            const data = {
                "operationName": "getSummoners",
                "variables": {"owner": account},
                "query": "query getSummoners($owner: String!) {\n  summoners(first: 1000, where: {owner: $owner}) {\n    id\n    owner\n    _class\n    _level\n    __typename\n  }\n}\n"
            };

            axios.post(url, data)
                .then(
                    async (response) => {
                        const result = response.data.data.summoners;
                        let n = '';
                        let nShow = '';
                        setBalanceIDS(n);
                        setShowBalanceIDS(nShow);
                        for (const i in result){
                            let summoner = result[i].id;
                            if (summoner) {
                                if (executor === -1){
                                    setExecutor(summoner);
                                }
                                let tokenID = hex2int(summoner);
                                if (type === t('Gold')) {
                                    goldContract.balanceOf(summoner).then(x => {
                                        if (x > 0) {//可领金额大于0
                                            n = n === '' ? tokenID + '['+(x/10**18)+']' : n + ',' + tokenID + '['+(x/10**18)+']';
                                            setBalanceIDS(n);

                                            nShow = nShow === '' ? tokenID : nShow + ',' + tokenID;
                                            setShowBalanceIDS(nShow);
                                        }
                                    })
                                } else {
                                    rarityAdventureContract.balanceOf(summoner).then(x => {
                                        if (x > 0) {//可领金额大于0
                                            // n = n === '' ? tokenID + '' : n + ',' + tokenID;
                                            n = n === '' ? tokenID + '['+x+']' : n + ',' + tokenID + '['+x+']';
                                            setBalanceIDS(n);

                                            nShow = nShow === '' ? tokenID : nShow + ',' + tokenID;
                                            setShowBalanceIDS(nShow);
                                        }
                                    })
                                }
                            }
                        }
                    })
        }
    },[account, type, goldContract, rarityAdventureContract]);

    const [changeAdventureBtn, setChangeAdventureBtn] = useState(t('Confirm'));
    const [claimingIds, setClaimingIds] = useState('');
    const [toID, setToID] = useState(-1);
    const [toIDNotice, setToIDNotice] = useState('');
    const changeToIDS = (e)=>{
        setToIDNotice('')
        if (e.target.value<=0){
            return
        }
        setToID(e.target.value);
        let toIDCurrent = e.target.value;
        if (toIDCurrent){
            contract.ownerOf(toIDCurrent).then( x=>{
                setToIDNotice(x===account?t('You own the target ID'):t('The target ID is not of you, please confirm it'))
            })
        }
    };

    const changeClaimIds = (e)=>{
        setClaimingIds(e.target.value)
    };


    const claimClick = ()=>{
        if (changeAdventureBtn !== t('Confirm'))
            return;
        if (toID === -1){
            alert(t('Please input target ID'));
            return;
        }

        setClaimingIds(claimingIds.replace('，', ','));
        const ids = claimingIds.split(',');
        if (ids.length<=0 || (ids.length===1 && ids[0]==='')){
            alert(t('Please input tokenID'));
            return;
        }

        for (let i in ids) {
            const tokenId = ids[i];
            if(!IsNum(tokenId)){
                alert(t('Please fill in the correct tokenID, separated by multiple commas'));
                return;
            }
        }

        setChangeAdventureBtn(`${t('loading')}...`);
        const datas = [];
        const balanceMap = new Map();
        const balanceIDSArray = balanceIDS.split(',');
        for (let i in balanceIDSArray){
            const tokenId = balanceIDSArray[i].split('[')[0];
            const balance = balanceIDSArray[i].split('[')[1].replace(']','');
            balanceMap.set(tokenId, balance);
        }
        for (let id in ids) {
            if (ids[id]) {
                const idDecimals = new BigNumber(ids[id]);
                datas.push(`0x${idDecimals.toString(16)}`);
            }
        }
        setChangeAdventureBtn(`${t('loading')}...`)
        try {
            const executeContract = type === t('Gold') ? goldContract : rarityAdventureContract;
            for (let i in ids){
                const tokenId = ids[i];
                const balance = type === t('Gold') ? balanceMap.get(tokenId+'')*10**18 : balanceMap.get(tokenId+'')*1;
                console.log(tokenId + ',' + balance);
                executeContract.transfer('0x'+new BigNumber(tokenId).toString(16), '0x'+new BigNumber(toID).toString(16), '0x'+new BigNumber(balance).toString(16));
            }
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

        setChangeAdventureBtn(t('Confirm'))
    };

    return (
        <div>
            <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
                <div style={{color: 'red', marginTop: '10px'}}><span>{t('Collect')}&nbsp;{type}</span> <button onClick={changeType}>{type === t('Gold') ? t('Switch to Craft') : t('Switch to Gold')}</button> </div>
                <h3 style={{display: 'flex'}}>{type===t('Gold')?t('Transfer a dozens of Gold'):t('Transfer a dozens of Craft Materials')}</h3>
                <div style={{display: 'flex', marginTop: "20px"}}>{type===t('Gold')?'Available IDs':t('Avaliable IDs')}：</div>
                <div style={{display: 'flex', margin: '10px 40px 0px 40px', width: "100%"}}><text style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{showBalanceIDS}</text></div>
                <hr/>
                <div style={{display: 'flex', margin: '10px 40px 0px 40px', width: "100%"}}><text style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{balanceIDS}</text></div>
                <hr/>
                <div style={{display: 'flex', color: 'green', marginTop: '10px'}}>{t('If you have mass Summon heroes, try to break them up into dozens at a time. Note that multiple are separated by commas. And the times of confirmations corresponds to the ids.')}</div>
                <div>
                    <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}} onChange={changeClaimIds}/>
                </div>
                <hr/>
                <div style={{display: 'flex', marginTop: "20px"}}>{t('Target ID')}：</div>
                <input onChange={changeToIDS}/>{toIDNotice}<br/>
                <button style={{ marginTop: '10px', height: "40px", width: "90px"}} onClick={claimClick}>{changeAdventureBtn}</button>
            </div>
        </div>
    );
}

export default TransferGold;
