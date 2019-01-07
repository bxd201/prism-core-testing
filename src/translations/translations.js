import { addLocaleData } from 'react-intl'

// import all supported locales
import localeEN from 'react-intl/locale-data/en'
import localeFR from 'react-intl/locale-data/fr'

// import all supported languages
import enUS from './en-US.json'
import enCA from './en-CA.json'
import frCA from './fr-CA.json'

// add locale data when using react-intl to format numbers/times/ect..
addLocaleData([
  ...localeEN,
  ...localeFR
])

// list all supported languages & associate with their JSON
const languages = {
  'en-US': enUS,
  'en-CA': enCA,
  'fr-CA': frCA
}

export default languages
