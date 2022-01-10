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
// import {UserRejectedRequestError as UserRejectedRequestErrorWalletConnect} from "@web3-react/walletconnect-connector";
// import {useAdventureContract, useWINETokenContract} from "../App";
// import PointABI from "../abi/PointABI";
// import {useContract, hex2int} from '../App'

import {hex2int} from '../App'
import {useRarityContract, adventureTimeContractV1Address, adventureTimeContractV2Address
    , approveAllContactV1Address, useAdventureTimeContractV1, useAdventureTimeContractV2, useRarityGoldContract, useRarityAttributesContract, useRarityCellarContract, rarityCellarContractAddress} from '../utils/contracts'


const injected = new InjectedConnector({ supportedChainIds: [250] })
export const AddressZero = "0x0000000000000000000000000000000000000000";

function Point() {
    const {t} = useLanguage()
    const [version, setVersion] = useState('v1');
    const changeVersion = ()=>{
        setVersion(version === 'v1' ? 'v2' : 'v1');
    };

    const {activate, account, chainId} = useWeb3React();
    // const contract = useWINETokenContract('0xce761d788df608bd21bdd59d6f4b54b2e27f25bb', true);
    // const adventureContract = useAdventureContract('0x2e876e743d75d2edef80e8f25e99b70fe44abcd4', true);
    // const pointContract = useContract('0xb5f5af1087a8da62a23b08c00c6ec9af21f397a1', PointABI, true);

    const contract = useRarityContract();
    const adventureContractTemp1 = useAdventureTimeContractV1();
    const adventureContractTemp2 = useAdventureTimeContractV2();
    const adventureContract = version==='v2'? adventureContractTemp2 : adventureContractTemp1;
    const pointContract = useRarityAttributesContract();

    const [changeAdventureBtn, setChangeAdventureBtn] = useState(t('Assigning attributes'));
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
        console.log("account: " + account);
        if (!account){
            console.log(account);
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
                        for (const i in result){
                            let summoner = result[i].id;
                            if (summoner) {
                                let tokenID = hex2int(summoner);
                                pointContract.character_created(summoner).then(x=>{
                                    if (!x){
                                        contract.summoner(summoner).then(y => {
                                            // let _xp = y[0];
                                            // let _log = y[1];
                                            let _class = y[2];
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
                                        });
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
    }, [account, contract, pointContract, version]);

    const [pointingIDS, setPointingIDS] = useState('');
    const [selectRole, setSelectRole] = useState('');
    const changeSummon = (e) =>{
        setPointingIDS('');
        const v = e.target.value;
        if (v == 1){
            setPointingIDS(Barbarian);
            setSelectRole('Barbarian');
        } else if (v == 2){
            setPointingIDS(Bard);
            setSelectRole('Bard');
        }  else if (v == 3){
            setPointingIDS(Cleric);
            setSelectRole('Cleric');
        } else if (v == 4){
            setPointingIDS(Druid);
            setSelectRole('Druid');
        } else if (v == 5){
            setPointingIDS(Fighter);
            setSelectRole('Fighter');
        } else if (v == 6){
            setPointingIDS(Monk);
            setSelectRole('Monk');
        } else if (v == 7){
            setPointingIDS(Paladin);
            setSelectRole('Paladin');
        } else if (v == 8){
            setPointingIDS(Ranger);
            setSelectRole('Ranger');
        } else if (v == 9){
            setPointingIDS(Rogue);
            setSelectRole('Rogue');
        } else if (v == 10){
            setPointingIDS(Sorcerer);
            setSelectRole('Sorcerer');
        } else if (v == 11){
            setPointingIDS(Wizard);
            setSelectRole('Wizard');
        }
        console.log(pointingIDS)
    };

    const [TotalPoint, setTotalPoint] = useState(32);
    const [Strength, setStrength] = useState(8);
    const [Dexterity, setDexterity] = useState(8);
    const [Constitution, setConstitution] = useState(8);
    const [Intelligence, setIntelligence] = useState(8);
    const [Wisdom, setWisdom] = useState(8);
    const [Charisma, setCharisma] = useState(8);

    const [pointIdsText, setPointIdsText] = useState('');
    const changePointIdsText = (e) => {setPointIdsText(e.target.value)}

    const changeStrength = (e) => {setStrength(e.target.value)}
    const changeStrengthSub = (e) => {
        let str = parseInt(Strength);
        if (str<=8){
            return;
        }
        let ca = TotalPoint+parseInt(calcSub(str-1));
        if (ca <0 || ca>32){
            return;
        }
        setStrength(str-1);
        setTotalPoint(ca)
    };
    const changeStrengthPlus = (e) => {
        let str = parseInt(Strength);
        if (str>22){
            return;
        }
        let ca = TotalPoint-parseInt(calc(str+1));
        if (ca <0 || ca>32){
            return;
        }
        setStrength(str+1);
        setTotalPoint(ca)
    }

    const changeDexterity = (e) => {setDexterity(e.target.value)}
    const changeDexteritySub = (e) => {
        let str = parseInt(Dexterity);
        if (str<=8){
            return;
        }
        let ca = TotalPoint+parseInt(calcSub(str-1));
        if (ca <0 || ca>32){
            return;
        }
        setDexterity(str-1);
        setTotalPoint(ca)
    };
    const changeDexterityPlus = (e) => {
        let str = parseInt(Dexterity);
        if (str>22){
            return;
        }
        let ca = TotalPoint-parseInt(calc(str+1));
        if (ca <0 || ca>32){
            return;
        }
        setDexterity(str+1);
        setTotalPoint(ca)
    }
    const changeConstitution = (e) => {setConstitution(e.target.value)}
    const changeConstitutionSub = (e) => {
        let str = parseInt(Constitution);
        if (str<=8){
            return;
        }
        let ca = TotalPoint+parseInt(calcSub(str-1));
        if (ca <0 || ca>32){
            return;
        }
        setConstitution(str-1);
        setTotalPoint(ca)
    };
    const changeConstitutionPlus = (e) => {
        let str = parseInt(Constitution);
        if (str>22){
            return;
        }
        let ca = TotalPoint-parseInt(calc(str+1));
        if (ca <0 || ca>32){
            return;
        }
        setConstitution(str+1);
        setTotalPoint(ca)
    }
    const changeIntelligence = (e) => {setIntelligence(e.target.value)}
    const changeIntelligenceSub = (e) => {
        let str = parseInt(Intelligence);
        if (str<=8){
            return;
        }
        let ca = TotalPoint+parseInt(calcSub(str-1));
        if (ca <0 || ca>32){
            return;
        }
        setIntelligence(str-1);
        setTotalPoint(ca)
    };
    const changeIntelligencePlus = (e) => {
        let str = parseInt(Intelligence);
        if (str>22){
            return;
        }
        let ca = TotalPoint-parseInt(calc(str+1));
        if (ca <0 || ca>32){
            return;
        }
        setIntelligence(str+1);
        setTotalPoint(ca)
    }
    const changeWisdom = (e) => {setWisdom(e.target.value)}
    const changeWisdomSub = (e) => {
        let str = parseInt(Wisdom);
        if (str<=8){
            return;
        }
        let ca = TotalPoint+parseInt(calcSub(str-1));
        if (ca <0 || ca>32){
            return;
        }
        setWisdom(str-1);
        setTotalPoint(ca)
    };
    const changeWisdomPlus = (e) => {
        let str = parseInt(Wisdom);
        if (str>22){
            return;
        }
        let ca = TotalPoint-parseInt(calc(str+1));
        if (ca <0 || ca>32){
            return;
        }
        setWisdom(str+1);
        setTotalPoint(ca)
    }
    const changeCharisma = (e) => {setCharisma(e.target.value)}
    const changeCharismaSub = (e) => {
        let str = parseInt(Charisma);
        if (str<=8){
            return;
        }
        let ca = TotalPoint+parseInt(calcSub(str-1));
        if (ca <0 || ca>32){
            return;
        }
        setCharisma(str-1);
        setTotalPoint(ca)
    };
    const changeCharismaPlus = (e) => {
        let str = parseInt(Charisma);
        if (str>22){
            return;
        }
        let ca = TotalPoint-parseInt(calc(str+1));
        if (ca <0 || ca>32){
            return;
        }
        setCharisma(str+1);
        setTotalPoint(ca)
    }

    const calc = (score) =>{
        // let x = 0;
        // if (score <= 14){
        //     x = score-8;
        // } else {
        //     x = ((score-8)**2)/6;
        // }
        // return x;
        if (score<=14){
            return 1;
        } else if (score <= 16){
            return 2;
        } else if (score <= 18){
            return 3;
        } else {
            return 4;
        }
    };

    const calcSub = (score) =>{
        // let x = 0;
        // if (score <= 14){
        //     x = score-8;
        // } else {
        //     x = ((score-8)**2)/6;
        // }
        // return x;
        if (score>=18){
            return 4;
        } else if (score >= 16){
            return 3;
        } else if (score >= 14){
            return 2;
        } else {
            return 1;
        }
    };

    const calcPoint = (str, dex, con, int, wis, cha)=>{
        return calc(str) + calc(dex) + calc(con) + calc(int) + calc(wis) + calc(cha);
    }

    const point = async ()=>{
        if (changeAdventureBtn !== t('Assigning attributes'))
            return;

        if (pointingIDS === ''){
            alert(t('Select an available Summoner to assign attributes'));
            return;
        }
        if (Strength<8 || Dexterity<8 || Constitution<8 || Intelligence<8 || Wisdom<8 || Charisma<8){
            alert(t('Ability score can not be less than 8'));
            return;
        }
        // console.log(parseInt(Strength) + parseInt(Dexterity) + parseInt(Constitution) + parseInt(Intelligence) + parseInt(Wisdom) + parseInt(Charisma));
        // if (parseInt(Strength) + parseInt(Dexterity) + parseInt(Constitution) + parseInt(Intelligence) + parseInt(Wisdom) + parseInt(Charisma)!==80){
        //     alert('点数之和须为80');
        //     return;
        // }
        setChangeAdventureBtn(`${t('loading')}...`)

        let str = parseInt(Strength) ;
        let dex = parseInt(Dexterity);
        let con = parseInt(Constitution) ;
        let int = parseInt(Intelligence) ;
        let wis = parseInt(Wisdom) ;
        let cha = parseInt(Charisma) ;

        const ids = pointIdsText && pointIdsText!==''?pointIdsText.split(','):pointingIDS.split(',');
        const datas = [];
        for (let id in ids) {
            if (ids[id]) {
                const idDecimals = new BigNumber(ids[id]);
                datas.push(`0x${idDecimals.toString(16)}`);
            }
        }

        try {
            let txReceipt = true;
            const adventureContractAddress = version === 'v2' ? adventureTimeContractV2Address : adventureTimeContractV1Address;
            for (let i in datas){
                let approveAddress = await contract.getApproved(datas[i]);
                if (approveAddress !== adventureContractAddress){
                    console.log(approveAddress);
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
                const pointBuy = await adventureContract.pointBuy(datas, str, dex, con, int, wis, cha);
                const w = await pointBuy.wait();
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
        setChangeAdventureBtn(t('Assigning attributes'))
    };

    return (
        <div>
            <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
                {/*<div style={{color: 'red', marginTop: '10px'}}><span>你正在使用{version}</span> <button onClick={changeVersion}>切换到{version==='v2'?'v1':'v2'}</button> </div>*/}
                <h3 style={{display: 'flex'}}>{t('Ability Score')}</h3>
                <div style={{display: 'flex', marginTop: "20px", fontSize: '15px', color: 'red'}}>{t('Because of the restrictions of the Rarity logic, each ID needs approved. All approved ids can be worked in Dungeon, Gold Claim, Ability Score, etc. If you need please go to Approval-For-All first.')}</div>
                <div style={{ marginTop: "20px"}}>
                    <h4 style={{display: 'flex'}}>{t('Summoner Selection')}</h4>
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
                    <div style={{display: 'flex', marginTop: '20px'}}>
                        {t('Selected Summoner')}：{selectRole}, {pointingIDS}
                    </div>
                    <h4 style={{display: 'flex', marginTop: '20px'}}>
                        {t('Setting')}
                    </h4>
                    <div style={{display: 'flex', marginTop: '5px'}}>{t('Avaliable points')}： {TotalPoint}</div>
                    <div style={{display: 'flex', marginTop: '5px'}}>
                        {/*Strength: <input style={{width: "250px"}} onKeyUp={changeStrength} onClick={changeStrength}/>*/}
                        Strength: <button style={{marginLeft: '5px'}} onKeyUp={changeStrengthSub} onClick={changeStrengthSub}>-</button> <button style={{marginLeft: '5px'}}  onKeyUp={changeStrengthPlus} onClick={changeStrengthPlus}>+</button> {Strength}
                    </div>
                    <div style={{display: 'flex', marginTop: '5px'}}>
                        {/*Dexterity: <input style={{width: "250px"}} onKeyUp={changeDexterity} onClick={changeDexterity}/>*/}
                        Dexterity: <button style={{marginLeft: '5px'}} onKeyUp={changeDexteritySub} onClick={changeDexteritySub}>-</button> <button style={{marginLeft: '5px'}}  onKeyUp={changeDexterityPlus} onClick={changeDexterityPlus}>+</button> {Dexterity}
                    </div>
                    <div style={{display: 'flex', marginTop: '5px'}}>
                        {/*Constitution: <input style={{width: "250px"}} onKeyUp={changeConstitution} onClick={changeConstitution}/>*/}
                        Constitution: <button style={{marginLeft: '5px'}} onKeyUp={changeConstitutionSub} onClick={changeConstitutionSub}>-</button> <button style={{marginLeft: '5px'}}  onKeyUp={changeConstitutionPlus} onClick={changeConstitutionPlus}>+</button> {Constitution}
                    </div>
                    <div style={{display: 'flex', marginTop: '5px'}}>
                        {/*Intelligence: <input style={{width: "250px"}} onKeyUp={changeIntelligence} onClick={changeIntelligence}/>*/}
                        Intelligence:<button style={{marginLeft: '5px'}} onKeyUp={changeIntelligenceSub} onClick={changeIntelligenceSub}>-</button> <button style={{marginLeft: '5px'}}  onKeyUp={changeIntelligencePlus} onClick={changeIntelligencePlus}>+</button> {Intelligence}
                    </div>
                    <div style={{display: 'flex', marginTop: '5px'}}>
                        {/*Wisdom: <input style={{width: "250px"}} onKeyUp={changeWisdom} onClick={changeWisdom}/>*/}
                        Wisdom: <button style={{marginLeft: '5px'}} onKeyUp={changeWisdomSub} onClick={changeWisdomSub}>-</button> <button style={{marginLeft: '5px'}}  onKeyUp={changeWisdomPlus} onClick={changeWisdomPlus}>+</button> {Wisdom}
                    </div>
                    <div style={{display: 'flex', marginTop: '5px'}}>
                        {/*Charisma: <input style={{width: "250px"}} onKeyUp={changeCharisma} onClick={changeCharisma}/>*/}
                        Charisma: <button style={{marginLeft: '5px'}} onKeyUp={changeCharismaSub} onClick={changeCharismaSub}>-</button> <button style={{marginLeft: '5px'}}  onKeyUp={changeCharismaPlus} onClick={changeCharismaPlus}>+</button> {Charisma}
                    </div>
                </div>
                <div style={{display: 'flex', color: 'green', marginTop: '20px'}}>{t('If you have mass Summon heroes, try to break them up into dozens at a time. Note that multiple are separated by commas. No ids input will trigger all available ids.')}</div>
                <div>
                <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}  onClick={changePointIdsText} onKeyUp={changePointIdsText} />
                </div>
                <button style={{ marginTop: '10px', height: "40px", width: "120px"}} onClick={point}>{changeAdventureBtn}</button>
            </div>
            <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
                {/*<div style={{ display:'flex'}}>未加点Barbarian ID: {Barbarian} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Bard      ID: {Bard} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Cleric    ID: {Cleric} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Druid     ID: {Druid} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Fighter   ID: {Fighter} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Monk      ID: {Monk} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Paladin   ID: {Paladin} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Ranger    ID: {Ranger} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Rogue     ID: {Rogue} </div>*/}
                {/*<div style={{ display:'flex'}}>未加点Sorcerer  ID: {Sorcerer} </div>*/}
                {/*<div style={{ display:'flex'}}> 未加点Wizard   ID: {Wizard} </div>*/}
                <table>
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
                </table>
            </div>
        </div>
    );

}

export default Point;
