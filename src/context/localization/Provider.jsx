import React, { useState, createContext, useCallback, useMemo } from 'react'
import { getLanguages } from '../../config/localization'

export const LanguageContext = createContext(undefined)

export const LanguageProvider = ({ children }) => {
    const [languageState, setLanguageState] = useState({})

    const setLanguage = useCallback((language) => {
        const languages = getLanguages(language)
        setLanguageState(languages)
    }, [setLanguageState])

    const language = useCallback((content) => {
        return languageState[content]
    }, [languageState])

    return <LanguageContext.Provider value={{ setLanguage, t: language }} >{children}</LanguageContext.Provider>
}