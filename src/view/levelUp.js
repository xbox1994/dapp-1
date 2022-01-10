import { useCallback, useEffect,useState,useMemo,useRef } from 'react'
import useLanguage from '../context/localization/useLanguage'
import axios from "axios";
import {BigNumber} from "bignumber.js";
import {UnsupportedChainIdError, useWeb3React} from "@web3-react/core";
import {hex2int} from '../App'
import {useRarityContract, adventureTimeContractV1Address, adventureTimeContractV2Address
    , approveAllContactV1Address, useAdventureTimeContractV1, useAdventureTimeContractV2, useRarityGoldContract, useRarityAttributesContract, useRarityCellarContract, rarityCellarContractAddress} from '../utils/contracts'

export const AddressZero = "0x0000000000000000000000000000000000000000";

function LevelUp() {
    const {t} = useLanguage()
    const [version, setVersion] = useState('v1');
    const changeVersion = ()=>{
        setVersion(version === 'v1' ? 'v2' : 'v1');
    };

    const {activate, account, chainId} = useWeb3React();
    const [levelUpIds, setLevelUpIds] = useState('');

    const contract = useRarityContract();

    const adventureContractTemp1 = useAdventureTimeContractV1();
    const adventureContractTemp2 = useAdventureTimeContractV2();
    const adventureContract = version==='v2'? adventureContractTemp2 : adventureContractTemp1;

    useEffect( ()=>{
        // console.log("account: " + account)
        if (!account){
            console.log(account)
            return
        } else {
            // const url = 'https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress=0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb&address=' + account + '&tag=latest&apikey=RTR3W4VHBSVYIJ11PJ3J3UIQ6G8XGUJGGI'
            // console.log(url)
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
                                contract.summoner(summoner).then(x => {
                                    let _xp = x[0];
                                    let _log = x[1];
                                    let _class = x[2];
                                    let _level = x[3];
                                    contract.xp_required(_level).then(y => {
                                        if (_xp.gte(y)){
                                            n = n === '' ? tokenID + '' : n + ',' + tokenID;
                                            setLevelUpIds(n);
                                        }
                                    });
                                });
                            }
                        }
                    }
                )
        }
    }, [account, contract, version]);


    const [levelUpingIds, setLevelUpingIds] = useState('');
    const [levelUpBtn, setlevelUpBtn] = useState(t('Level up'));
    const changeLeveLUpIds = (e)=>{
        setLevelUpingIds(e.target.value);
    };

    const levelUp = async ()=>{
        if (levelUpBtn !== t('Level up'))
            return;
        setLevelUpIds(levelUpIds.replace('，', ','));
        setLevelUpingIds(levelUpingIds.replace('，', ','));
        const ids = levelUpingIds&&levelUpingIds!==''?levelUpingIds.split(','):levelUpIds.split(',');
        if (ids.length<=0 || (ids.length===1 && ids[0]==='')){
            alert(t('None available ID to level up'));
            return;
        }

        setlevelUpBtn(`${t('loading')}...`);

        const datas = [];
        for (let id in ids) {
            if (ids[id]) {
                const idDecimals = new BigNumber(ids[id]);
                datas.push(`0x${idDecimals.toString(16)}`);
            }
        }
        try {
            const adventureContractAddress = version === 'v2' ? adventureTimeContractV2Address : adventureTimeContractV1Address;
            const txReceipt = await contract.isApprovedForAll(account, adventureContractAddress);
            if (txReceipt) {
                const levelUp = await adventureContract.levelUp(datas);
                const w = await levelUp.wait();
                if (w.status) {
                    window.location.href = '/';
                }
            } else {
                alert(t('Please approve first'));
                const approveAll = await contract.setApprovalForAll(adventureContractAddress, `0x1`);
                const w = await approveAll.wait();
                if (w.status) {
                    console.log('approve success')
                }
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
        setlevelUpBtn(t('Level up'))
    };

    return(
        <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
            {/*<div style={{color: 'red', marginTop: '10px'}}><span>你正在使用{version}</span> <button onClick={changeVersion}>切换到{version==='v2'?'v1':'v2'}</button> </div>*/}
            <h3 style={{display: 'flex'}}>{t('Smart Level Up')}</h3>
            <div style={{display: 'flex', marginTop: "20px", flexWrap: "wrap"}}>{t('Available Level Up IDs')}：</div>
            <div style={{display: 'flex', margin: '10px 40px 0px 40px', width: "100%"}}><text style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{levelUpIds}</text></div>
            <div style={{display: 'flex', color: 'green', marginTop: '10px'}}>{t('If you have mass Summon heroes, try to break them up into dozens at a time. Note that multiple are separated by commas. No ids input will trigger all available ids.')}</div>
            <div>
                <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}} onClick={changeLeveLUpIds} onKeyUp={changeLeveLUpIds}/>
            </div>
            <button style={{ marginTop: '10px', height: "40px", width: "100px"}} onClick={levelUp}>{levelUpBtn}</button>
        </div>
    );
}

export default LevelUp;
