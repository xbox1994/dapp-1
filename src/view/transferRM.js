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

function TransferRM() {
    const {t} = useLanguage()
    const {account} = useWeb3React();
    const contract = useRarityContract();

    const [tokenIDS, setTokenIDS] = useState('');

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
                        setTokenIDS(n);
                        for (const i in result){
                            let summoner = result[i].id;
                            if (summoner) {
                                let tokenID = hex2int(summoner);
                                n = n === '' ? tokenID  : n + ',' + tokenID ;
                                setTokenIDS(n);
                            }
                        }
                    })
        }
    },[account]);

    const [changeAdventureBtn, setChangeAdventureBtn] = useState(t('Confirm'));
    const [claimingIds, setClaimingIds] = useState('');
    const [toID, setToID] = useState('');
    const changeToIDS = (e)=>{
        setToID(e.target.value);
    };

    const changeClaimIds = (e)=>{
        setClaimingIds(e.target.value)
    };


    const claimClick = ()=>{
        if (changeAdventureBtn !== t('Confirm'))
            return;
        if (!toID || toID === ''){
            alert(t('Please input receive address'));
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
        for (let id in ids) {
            if (ids[id]) {
                const idDecimals = new BigNumber(ids[id]);
                datas.push(`0x${idDecimals.toString(16)}`);
            }
        }
        setChangeAdventureBtn(`${t('loading')}...`)
        try {
            for (let i in datas){
                const tokenId = datas[i];
                contract.transferFrom(account, toID, tokenId);
            }
        } catch (e) {
            let code = e.code;
            if (code === 4001){
                alert(t('Transaction refused'));
            } else if (code === -32603){
                alert(e.data.message);
            } else {
                console.error(e);
                alert(t('The fantom network error, please try again'))
            }
        }

        setChangeAdventureBtn(t('Confirm'))
    };

    return (
        <div>
            <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
                <h3 style={{display: 'flex'}}>{t('Collect Summoners')}</h3>
                <div style={{display: 'flex', marginTop: "20px"}}>{t('Avaliable Summoners IDs')}：</div>
                <div style={{display: 'flex', margin: '10px 40px 0px 40px', width: "100%"}}><text style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{tokenIDS}</text></div>
                <hr/>
                <div style={{display: 'flex', color: 'green', marginTop: '10px'}}>{t('If you have mass Summon heroes, try to break them up into dozens at a time')}</div>
                <div>
                    <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}} onChange={changeClaimIds}/>
                </div>
                <hr/>
                <div style={{display: 'flex', marginTop: "20px"}}>{t('Please input receive address-v1')}：</div>
                <input onChange={changeToIDS} style={{width: '500px', height: '20px'}}/>
                <br/>
                <button style={{ marginTop: '10px', height: "40px", width: "90px"}} onClick={claimClick}>{changeAdventureBtn}</button>
            </div>
        </div>
    );
}

export default TransferRM;
