import { useCallback, useEffect,useState,useMemo,useRef } from 'react'
import axios from "axios";
import useLanguage from '../context/localization/useLanguage'
import {BigNumber} from "bignumber.js";
import {UnsupportedChainIdError, useWeb3React} from "@web3-react/core";
import {
    InjectedConnector,
} from "@web3-react/injected-connector";
import {hex2int} from '../App'
import {useRarityContract, adventureTimeContractV1Address, adventureTimeContractV2Address
    , approveAllContactV1Address, useAdventureTimeContractV1, useAdventureTimeContractV2, useRarityGoldContract, useRarityAttributesContract, useRarityCellarContract, rarityCellarContractAddress} from '../utils/contracts'


const injected = new InjectedConnector({ supportedChainIds: [250] })
export const AddressZero = "0x0000000000000000000000000000000000000000";

function Gold() {
    const {t} = useLanguage()
    const [version, setVersion] = useState('v1');
    const changeVersion = ()=>{
        setVersion(version === 'v1' ? 'v2' : 'v1');
    };

    const {account} = useWeb3React();
    const contract = useRarityContract();

    const adventureContractTemp1 = useAdventureTimeContractV1();
    const adventureContractTemp2 = useAdventureTimeContractV2();
    const adventureContract = version==='v2'? adventureContractTemp2 : adventureContractTemp1;
    const goldContract = useRarityGoldContract();

    const [claimIDS, setClaimIDS] = useState('');
    const [claimingIds, setClaimingIds] = useState('');
    const changeClaimIds = (e)=>{
        setClaimingIds(e.target.value)
    };

    const [changeAdventureBtn, setChangeAdventureBtn] = useState(t('Claim'));
    useEffect( ()=>{
        // console.log("account: " + account)
        if (!account){
            console.log(account)
            return
        } else {
            // const url = 'https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress=0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb&address=' + account + '&tag=latest&apikey=RTR3W4VHBSVYIJ11PJ3J3UIQ6G8XGUJGGI'
            // axios.get(url)
            //     .then(
            //         async (response) => {
            //             const result = response.data.result;
            const url = 'https://api.rarity.game/subgraphs/name/rarity';
            const data = {"operationName":"getSummoners","variables":{"owner": account},"query":"query getSummoners($owner: String!) {\n  summoners(first: 1000, where: {owner: $owner}) {\n    id\n    owner\n    _class\n    _level\n    __typename\n  }\n}\n"}

            axios.post(url, data)
                .then(
                    async (response) => {
                        const result = response.data.data.summoners;
                        let n = '';
                        for (const i in result){
                            let summoner = result[i].id;
                            if (summoner) {
                                let tokenID = hex2int(summoner);
                                goldContract.claimable(summoner).then(x=>{
                                    if (x>0){//可领金额大于0
                                        n = n === '' ? tokenID + '' : n + ',' + tokenID;
                                        setClaimIDS(n);
                                    }
                                })
                            }
                        }
                    }
                ).catch(
                (error1) => {
                    console.log(error1)
                }
            )
        }
    }, [account, goldContract, version]);

    const claimClick = async ()=>{
        if (changeAdventureBtn !== t('Claim'))
            return;

        setClaimIDS(claimIDS.replace('，', ','));
        setClaimingIds(claimingIds.replace('，', ','));
        const ids = claimingIds&&claimingIds!==''?claimingIds.split(','):claimIDS.split(',');
        // console.log(ids);
        if (ids.length<=0 || (ids.length===1 && ids[0]==='')){
            alert(t('None claimable ID'));
            return;
        }

        setChangeAdventureBtn(`${t('loading')}...`);

        const datas = [];
        for (let id in ids) {
            if (ids[id]) {
                const idDecimals = new BigNumber(ids[id]);
                datas.push(`0x${idDecimals.toString(16)}`);
            }
        }

        console.log(datas)
        try {
            // const txReceipt = await contract.isApprovedForAll(account, '0x2e876e743d75d2edef80e8f25e99b70fe44abcd4');
            // console.log(txReceipt)
            const adventureContractAddress = version === 'v2' ? adventureTimeContractV2Address : adventureTimeContractV1Address;
            let txReceipt = true;
            for (let i in datas){
                let approveAddress = await contract.getApproved(datas[i]);
                if (approveAddress !== adventureContractAddress){
                    // console.log(approveAddress)
                    txReceipt = false;
                    alert(t('Approve needed'));
                    const contractApprove = await contract.approve(adventureContractAddress, datas[i]);
                    const w = await contractApprove.wait();
                    if (w.status){
                        txReceipt = true;
                    }
                }
            }
            if (txReceipt) {
                const claimGold = await adventureContract.claimGold(datas);
                const w = await claimGold.wait();
                if (w.status) {
                    window.location.href = '/';
                }
            } else {
                alert(t('Please approve first'));
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

        setChangeAdventureBtn(t('Claim'))
    };

    return (
        <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
            {/*<div style={{color: 'red', marginTop: '10px'}}><span>你正在使用{version}</span> <button onClick={changeVersion}>切换到{version==='v2'?'v1':'v2'}</button> </div>*/}
            <h3 style={{display: 'flex'}}>{t('Claim All Gold')}</h3>
            <div style={{display: 'flex', marginTop: "20px", fontSize: '15px', color: 'red'}}>{t('Because of the restrictions of the Rarity logic, each ID needs approved. All approved ids can be worked in Dungeon, Gold Claim, Ability Score, etc. If you need please go to Approval-For-All first.')}</div>
            <div style={{display: 'flex', marginTop: "20px"}}>{t('Claimable')}：</div>
            <div style={{display: 'flex', margin: '10px 40px 0px 40px', width: "100%"}}><text style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{claimIDS}</text></div>
            <div style={{display: 'flex', color: 'green', marginTop: '10px'}}>{t('If you have mass Summon heroes, try to break them up into dozens at a time. Note that multiple are separated by commas. No ids input will trigger all available ids.')}</div>
            <div>
                <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}} onClick={changeClaimIds} onKeyUp={changeClaimIds}/>
            </div>
            <button style={{ marginTop: '10px', height: "40px", width: "60px"}} onClick={claimClick}>{changeAdventureBtn}</button>
        </div>
    );
}

export default Gold;
