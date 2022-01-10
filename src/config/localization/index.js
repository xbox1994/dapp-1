import { zh } from "./zh";
import { en } from "./en";

export const getLanguages = (langeuage)=>{
    switch(langeuage){
        case 'zh':
            return zh
        case 'en':
            return en
        default:
            console.error('加载语言失败')
            return null
    } 
}