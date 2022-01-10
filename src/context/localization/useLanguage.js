import { useContext } from 'react'
import { LanguageContext } from './Provider'

const useLanguage = () => {
  const languageContext = useContext(LanguageContext)

  if (languageContext === undefined) {
    throw new Error('Language context is undefined')
  }
//   console.log('languageContext',languageContext)
  return languageContext
}

export default useLanguage