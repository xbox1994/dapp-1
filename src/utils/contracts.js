import {useContract, hex2int} from '../App';
import rarityABI from "../abi/rarityABI";
import adventureTimeABI from '../abi/adventureTimeABI.json';
import approveAllABI from "../abi/approveAllABI";
import PointABI from "../abi/PointABI";
import RarityCellarABI from "../abi/RarityCellarABI";
import GoldABI from "../abi/GoldABI";
import CloakABI from "../abi/cloak";
import adventureTimeABIV2 from "../abi/adventureTimeABIV2";

export const rarityContractAddress = '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb';
export const rarityAttributesContractAddress = '0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1';//加点
export const rarityCellarContractAddress = '0x2A0F1cB17680161cF255348dDFDeE94ea8Ca196A';//副本地牢
export const rarityGoldContractAddress = '0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2';//金币
export const rarityCloakContractAddress = '0xC4B435a21C2Cc809b72020deF95bb72B3A98F83e';//斗篷

export const useRarityContract = () => { return useContract(rarityContractAddress, rarityABI, true)};
export const useRarityAttributesContract = () => { return useContract(  rarityAttributesContractAddress, PointABI, true)};
export const useRarityCellarContract = () => {  return useContract(rarityCellarContractAddress, RarityCellarABI, true)};
export const useRarityGoldContract = () => {  return useContract(rarityGoldContractAddress, GoldABI, true)};
export const useRarityCloakContract = () => {  return useContract(rarityCloakContractAddress, CloakABI, true)};

// =====================V1=========================================
export const adventureTimeContractV1Address = '0x2E876e743D75D2eDEF80e8F25e99B70fE44abCd4';
export const approveAllContactV1Address = '0x87FC4b9353D8D5771964c327cBC4dddA9d8f20C8';

export const useAdventureTimeContractV1 = () => {  return useContract(adventureTimeContractV1Address, adventureTimeABI, true)};
export  const useApproveAllContactV1 = () => {  return useContract(approveAllContactV1Address, approveAllABI, true)};


// =====================V2=========================================
export const adventureTimeContractV2Address = '0xb5Fb4325558daCc8E8d09C9157149761E5164bf8'; // 冒险，升级，加点，领金币，打地牢，批量审批，批量转金币&材料

export const useAdventureTimeContractV2 = () => {  return useContract(adventureTimeContractV2Address, adventureTimeABIV2, true)};
