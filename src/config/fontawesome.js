// fontawesome imports
import { library } from '@fortawesome/fontawesome-svg-core'

// solids
import {
  faPlus,
  faTrash,
  faInfoCircle,
  faInfo,
  faSearchMinus,
  faHome,
  faSun,
  faMoon
} from '@fortawesome/pro-solid-svg-icons'

// lights
import {
  faArrowLeft,
  faArrowRight,
  faHome as falHome,
  faPlusCircle,
  faSun as falSun,
  faMoon as falMoon
} from '@fortawesome/pro-light-svg-icons'

// regulars
import {
  faBatteryThreeQuarters
} from '@fortawesome/pro-regular-svg-icons'

// populate with all the FontAwesome svg icons we want to use
const faIcons = [
  faArrowLeft,
  faArrowRight,
  faBatteryThreeQuarters,
  faHome,
  falHome,
  faMoon,
  falMoon,
  faPlus,
  faPlusCircle,
  faTrash,
  faInfoCircle,
  faInfo,
  faSearchMinus,
  faSun,
  falSun
]
library.add(...faIcons)
