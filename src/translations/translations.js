import { addLocaleData } from 'react-intl'

// import all supported locales
import localeEN from 'react-intl/locale-data/en'
import localeES from 'react-intl/locale-data/es'
import localeFR from 'react-intl/locale-data/fr'

// import all supported languages
import en from './en.json'
import es from './es.json'
import fr from './fr.json'

// add locale data when using react-intl to format numbers/times/ect..
addLocaleData([
  ...localeEN,
  ...localeES,
  ...localeFR
])

// list all supported languages & associate with their JSON
const languages = {
  'en': en,
  'es': es,
  'fr': fr
}

export default languages
