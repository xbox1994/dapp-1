import {useEffect,useState} from 'react'
import axios from "axios";
import {BigNumber} from "bignumber.js";
import {useWeb3React} from "@web3-react/core";
import {useContract, hex2int} from '../App'
import approveAllABI from "../abi/approveAllABI";
import {useRarityContract, adventureTimeContractV1Address, adventureTimeContractV2Address, approveAllContactV1Address, useAdventureTimeContractV1, useAdventureTimeContractV2} from '../utils/contracts'
import useLanguage from '../context/localization/useLanguage'

export const AddressZero = "0x0000000000000000000000000000000000000000";

function ApproveAll() {

    const [version, setVersion] = useState('v1');
    const changeVersion = ()=>{
        setVersion(version === 'v1' ? 'v2' : 'v1');
    }  
    const {t} = useLanguage()


    const {account} = useWeb3React();
    const [approvedIDS, setApprovedIDS] = useState('');
    const [approvingIDS, setApprovingIDS] = useState('');
    const contract = useRarityContract();//useWINETokenContract('0xce761d788df608bd21bdd59d6f4b54b2e27f25bb', true);

    useEffect( ()=>{
        if (!account){
            console.log(account)
            return
        } else {
            const url = 'https://api.rarity.game/subgraphs/name/rarity';
            const data = {"operationName":"getSummoners","variables":{"owner": account},"query":"query getSummoners($owner: String!) {\n  summoners(first: 1000, where: {owner: $owner}) {\n    id\n    owner\n    _class\n    _level\n    __typename\n  }\n}\n"}

            axios.post(url, data)
                .then(
                    async (response) => {
                        const result = response.data.data.summoners;
                        let approved = '';
                        let approving = '';
                        setApprovingIDS(approving);
                        setApprovedIDS(approved);
                        for (const i in result) {
                            let summoner = result[i].id;
                            let tokenID = hex2int(summoner);
                            if (summoner) {
                                //判断该ID是否已授权
                                contract.getApproved(summoner).then(a => {
                                    // console.log(a + ', ' + approveAllContactV1Address + ', ' + (a===adventureTimeContractV1Address));
                                    if (a===(version==='v2'? adventureTimeContractV2Address : adventureTimeContractV1Address)){
                                        approved = approved === ''? tokenID+'' : approved + ',' + tokenID;
                                        setApprovedIDS(approved);
                                    } else {
                                        approving = approving === ''? tokenID+'' : approving + ',' + tokenID;
                                        setApprovingIDS(approving);
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
    }, [account, contract, version]);

    const [btn, setBtn] = useState(t('Approve'));
    const [approveIDS, setApproveIDS] = useState('');
    const changeApproveIDS = (e)=>{
        setApproveIDS(e.target.value);
    };

    const approveAllContact = useContract(version==='v2'? adventureTimeContractV2Address : approveAllContactV1Address, approveAllABI, true);

    const approveAll = async () => {
        if (btn !== t('Approve'))
            return;

        if (approveIDS === ''){
            alert(t('Input RM ID'));
            return;
        }

        const ids = approveIDS.split(',');
        const datas = [];
        for (let id in ids) {
            if (ids[id]) {
                const idDecimals = new BigNumber(ids[id]);
                datas.push(`0x${idDecimals.toString(16)}`);
            }
        }
        if (datas.length === 0){
            alert(t('Input RM ID'));
            return;
        }
        setBtn('loading...');
        try {
            const txReceipt = await contract.isApprovedForAll(account, version==='v2'? adventureTimeContractV2Address : approveAllContactV1Address);
            if (txReceipt) {
                const adventureTime = await approveAllContact.approve(datas);
                const w = await adventureTime.wait();
                if (w.status) {
                    window.location.href = '/';
                }
            } else {
                alert(t('Please approve first'));
                const approveAll = await contract.setApprovalForAll(version==='v2'? adventureTimeContractV2Address : approveAllContactV1Address, `0x1`);
                const w = await approveAll.wait();
                if (w.status) {
                    console.log('approve success');
                    const adventureTime = await approveAllContact.approve(datas);
                    const w = await adventureTime.wait();
                    if (w.status) {
                        window.location.href = '/';
                    }
                }
            }
        } catch (e) {
            let code = e.code;
            if (code === 4001){
                alert(e.message);
            } else if (code === -32603){
                alert(e.data.message);
            } else {
                alert(t('The fantom network error, please try again'))
            }
        }

        setBtn(t('Approve'))
    };

    return (
        <div style={{margin: '10px 80px 0px 80px', borderRadius: "12px", border: "1px solid", padding: '10px 10px'}}>
            {/*<div style={{color: 'red', marginTop: '10px'}}><span>你正在使用{version}</span> <button onClick={changeVersion}>切换到{version==='v2'?'v1':'v2'}</button> </div>*/}
            <h3 style={{display: 'flex'}}>{t('Approval-For-All')}</h3>
            <div style={{display: 'flex', marginTop: '10px'}}>{t('Approval-For-All should be confirmed by Metamask 2 times. After that, no constraints with you in Dungeon, Gold Claim, Ability Score.')}</div>
            {/*<div style={{display: 'flex'}}>全部冒险ID：</div>*/}
            {/*<div style={{display: 'flex', margin: '0px 40px 0px 40px'}}><text  style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{allTokenId}</text></div>*/}

            <div style={{display: 'flex', marginTop: '20px'}}>{t('Approved ID')}：</div>
            <div style={{display: 'flex', margin: '0px 40px 0px 40px'}}><text  style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{approvedIDS}</text></div>
            <hr/>
            <div style={{display: 'flex'}}>{t('Unapproved ID')}：</div>
            <div style={{display: 'flex', margin: '0px 40px 0px 40px'}}><text  style={{flexWrap: "wrap", width: "90%", wordBreak: "break-word"}}>{approvingIDS}</text></div>
            <hr/>
            <div style={{marginTop: '20px'}}>
                <textarea style={{display: 'flex', width: "500px", height: "60px", borderRadius: "12px", border: "1px solid", padding: '10px 10px'}} onClick={changeApproveIDS} onKeyUp={changeApproveIDS} onChange={changeApproveIDS}/>
            </div>
            <button style={{ marginTop: '10px', height: "40px", width: "60px"}} onClick={approveAll}>{btn}</button>
        </div>
    );
}

export default ApproveAll;
