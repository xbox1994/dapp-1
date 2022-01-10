import { useCallback, useEffect,useState,useMemo,useRef } from 'react'
import useLanguage from '../context/localization/useLanguage'
import axios from "axios";
import {BigNumber} from "bignumber.js";
import {UnsupportedChainIdError, useWeb3React} from "@web3-react/core";
import {
    InjectedConnector,
} from "@web3-react/injected-connector";
import {hex2int} from '../App'
import {useRarityContract, adventureTimeContractV1Address, adventureTimeContractV2Address
    , approveAllContactV1Address, useAdventureTimeContractV1, useAdventureTimeContractV2, useRarityAttributesContract, useRarityCellarContract, rarityCellarContractAddress} from '../utils/contracts'

const injected = new InjectedConnector({ supportedChainIds: [250] })
export const AddressZero = "0x0000000000000000000000000000000000000000";

function Craftine() {
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

    const pointContract = useRarityAttributesContract();
    const rarityAdventureContract = useRarityCellarContract();

    const [rarityAdvIDS, setRarityAdvIDS] = useState('');
    const [rarityAdventureIds, setRarityAdventureIds] = useState('');
    const [changeAdventureBtn, setChangeAdventureBtn] = useState(t('Attack'));
    const changeRarityAdventureIds = (e)=>{
        setRarityAdventureIds(e.target.value);
    };

    const [Barbarian, setBarbarian] = useState('');
    const [Bard, setBard] = useState('');
    const [Cleric, setCleric] = useState('');
    const [Druid, setDruid] = useState('');
    const [Fighter, setFighter] = useState('');
    const [Monk, setMonk] = useState('');
    const [Paladin, setPaladin] = useState('');
    const [Ranger, setRanger] = useState('');
    const [Rogue, setRogue] = useState('');
    const [Sorcerer, setSorcerer] = useState('');
    const [Wizard, setWizard] = useState('');

    useEffect( ()=>{
        if (!account){
            console.log(account)
        } else {
            const url = 'https://api.rarity.game/subgraphs/name/rarity';
            const data = {"operationName":"getSummoners","variables":{"owner": account},"query":"query getSummoners($owner: String!) {\n  summoners(first: 1000, where: {owner: $owner}) {\n    id\n    owner\n    _class\n    _level\n    __typename\n  }\n}\n"}

            axios.post(url, data)
                .then(
                    async (response) => {
                        const result = response.data.data.summoners;
                        let n = '';
                        let r1 = '';
                        let r2 = '';
                        let r3 = '';
                        let r4 = '';
                        let r5 = '';
                        let r6 = '';
                        let r7 = '';
                        let r8 = '';
                        let r9 = '';
                        let r10 = '';
                        let r11 = '';
                        const time = Date.now() / 1000;
                        for (const i in result){
                            let summoner = result[i].id;
                            if (summoner) {
                                let tokenID = hex2int(summoner);
                                pointContract.character_created(summoner).then(cx=>{
                                    if (cx) {//加过点
                                        rarityAdventureContract.adventurers_log(summoner).then(x => {
                                            // console.log(x + "," + time)
                                            if (x < time) {
                                                n = n === '' ? tokenID + '' : n + ',' + tokenID;
                                                setRarityAdvIDS(n);

                                                let _class = result[i]['_class'];
                                                // let _level = y[3];
                                                //console.log('setBarbarian: ' + tokenId + ',' + _class + ',' + (_class==11))
                                                if (_class == 1) {
                                                    r1 = r1 === ''? tokenID + '': (r1 +','+ tokenID);
                                                    setBarbarian(r1);
                                                } else if (_class == 2){
                                                    r2 = r2 === ''? tokenID + '': (r2 +','+ tokenID);
                                                    setBard(r2);
                                                } else if (_class == 3){
                                                    r3 = r3 === ''? tokenID + '': (r3 +','+tokenID);
                                                    setCleric(r3);
                                                }else if (_class == 4){
                                                    r4 = r4 === ''? tokenID + '': (r4 +','+tokenID);
                                                    setDruid(r4);
                                                }else if (_class == 5){
                                                    r5 = r5 === ''? tokenID + '': (r5 +','+tokenID);
                                                    setFighter(r5);
                                                }else if (_class == 6){
                                                    r6 = r6 === ''? tokenID + '': (r6 +','+tokenID);
                                                    setMonk(r6);
                                                }else if (_class == 7){
                                                    r7 = r7 === ''? tokenID + '': (r7 +','+tokenID);
                                                    setPaladin(r7);
                                                }else if (_class == 8){
                                                    r8 = r8 === ''? tokenID + '': (r8 +','+tokenID);
                                                    setRanger(r8);
                                                }else if (_class == 9){
                                                    r9 = r9 === ''? tokenID + '': (r9 +','+tokenID);
                                                    setRogue(r9);
                                                }else if (_class == 10){
                                                    r10 = r10 === ''? tokenID + '': (r10 +','+tokenID);
                                                    setSorcerer(r10);
                                                }else if (_class == 11){
                                                    r11 = r11 === ''? tokenID + '': (r11 +','+tokenID);
                                                    setWizard(r11);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                ).catch(
                (error1) => {
                    console.log(error1)
                }
            )
        }
    }, [account, version]);

    const rarityAdventureClick = async ()=>{
        if (changeAdventureBtn !== t('Attack'))
            return;

        setRarityAdvIDS(rarityAdvIDS.replace('，', ','));
        setRarityAdventureIds(rarityAdventureIds.replace('，', ','));
        const ids = rarityAdventureIds&&rarityAdventureIds!==''?rarityAdventureIds.split(','):rarityAdvIDS.split(',');
        // console.log(ids);
        if (ids.length<=0 || (ids.length===1 && ids[0]==='')){
            alert(t('None available ID to attack'));
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
                const adventure = await adventureContract.adventureCrafting(datas);
                // const adventure = await rarityAdventureContract.adventure(datas[0]);
                const w = await adventure.wait();
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

        setChangeAdventureBtn(t('Attack'))
    };

    return (
        <div>
            <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
                {/*<div style={{color: 'red', marginTop: '10px'}}><span>你正在使用{version}</span> <button onClick={changeVersion}>切换到{version==='v2'?'v1':'v2'}</button> </div>*/}
                <h3 style={{display: 'flex'}}>{t('Dungeon')}</h3>
                <div style={{display: 'flex', marginTop: "20px", fontSize: '15px', color: 'red'}}>{t('Because of the restrictions of the Rarity logic, each ID needs approved. All approved ids can be worked in Dungeon, Gold Claim, Ability Score, etc. If you need please go to Approval-For-All first.')}</div>
                {/*<div style={{display: 'flex', marginTop: "20px"}}>未挑战：</div>*/}
                {/*<div style={{display: 'flex', margin: '10px 40px 0px 40px', width: "100%"}}><text style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{rarityAdvIDS}</text></div>*/}
                {/*<hr/>*/}
                <div style={{display: 'flex', color: 'green', marginTop: '10px'}}>{t('If you have mass Summon heroes, try to break them up into dozens at a time. Note that multiple are separated by commas. No ids input will trigger all available ids.')}</div>
                <div>
                    <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}} onClick={changeRarityAdventureIds} onKeyUp={changeRarityAdventureIds}/>
                </div>
                <button style={{ marginTop: '10px', height: "40px", width: "60px"}} onClick={rarityAdventureClick}>{changeAdventureBtn}</button>
            </div>
            <div style={{display:'flex', marginLeft: '80px', marginTop: '20px'}}>{t('Idle ids')}：</div>
            <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
                <table>
                    <tbody>
                    <tr>
                        <td>Barbarian</td>
                        <td>ID:</td>
                        <td>{Barbarian}</td>
                    </tr>
                    <tr>
                        <td>Bard</td>
                        <td>ID:</td>
                        <td>{Bard}</td>
                    </tr>
                    <tr>
                        <td>Cleric</td>
                        <td>ID:</td>
                        <td>{Cleric}</td>
                    </tr>
                    <tr>
                        <td>Druid</td>
                        <td>ID:</td>
                        <td>{Druid}</td>
                    </tr>
                    <tr>
                        <td>Fighter</td>
                        <td>ID:</td>
                        <td>{Fighter}</td>
                    </tr>
                    <tr>
                        <td>Monk</td>
                        <td>ID:</td>
                        <td>{Monk}</td>
                    </tr>
                    <tr>
                        <td>Paladin</td>
                        <td>ID:</td>
                        <td>{Paladin}</td>
                    </tr>
                    <tr>
                        <td>Ranger</td>
                        <td>ID:</td>
                        <td>{Ranger}</td>
                    </tr>
                    <tr>
                        <td>Rogue</td>
                        <td>ID:</td>
                        <td>{Rogue}</td>
                    </tr>
                    <tr>
                        <td>Sorcerer</td>
                        <td>ID:</td>
                        <td>{Sorcerer}</td>
                    </tr>
                    <tr>
                        <td>Wizard</td>
                        <td>ID:</td>
                        <td>{Wizard}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Craftine;
