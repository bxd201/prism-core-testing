// https://fontawesome.com/icons/search

// fontawesome imports
import { library, config } from '@fortawesome/fontawesome-svg-core'

// solids
import {
  faPlus,
  faTrash,
  faInfoCircle,
  faInfo,
  faPalette,
  faSearchMinus,
  faTimes,
  faHome,
  faSun,
  faMoon
} from '@fortawesome/pro-solid-svg-icons'

// lights
import {
  faHome as falHome,
  faPlusCircle,
  faSun as falSun,
  faThLarge,
  faMoon as falMoon,
  faExpandAlt,
  faCompressAlt
} from '@fortawesome/pro-light-svg-icons'

// regulars
// import {
//   faExpandAlt
// } from '@fortawesome/pro-regular-svg-icons'

// populate with all the FontAwesome svg icons we want to use
const faIcons = [
  faExpandAlt,
  faCompressAlt,
  faHome,
  falHome,
  faMoon,
  falMoon,
  faPalette,
  faPlus,
  faPlusCircle,
  faTimes,
  faTrash,
  faThLarge,
  faInfoCircle,
  faInfo,
  faSearchMinus,
  faSun,
  falSun
]
library.add(...faIcons)

// don't automatically inject the CSS into the DOM because we're importing ALL of it into our own bundle
// this is done so we can prefix all selectors with .cleanslate.prism
config.autoAddCss = false
