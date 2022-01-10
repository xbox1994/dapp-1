import React from 'react'
import { LanguageProvider } from './context/localization/Provider'

const Providers = ({children})=>{
    return (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    )
}

export default Providers