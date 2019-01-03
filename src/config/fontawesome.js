// fontawesome imports
import { library } from '@fortawesome/fontawesome-svg-core'

// solids
import {
  faPlus,
  faTrash,
  faInfoCircle,
  faInfo,
  faSearchMinus,
  faHome
} from '@fortawesome/pro-solid-svg-icons'

// lights
import {
  faArrowLeft,
  faArrowRight,
  faHome as falHome,
  faPlusCircle
} from '@fortawesome/pro-light-svg-icons'

// regulars
import {
  faBatteryThreeQuarters
} from '@fortawesome/pro-regular-svg-icons'

// populate with all the FontAwesome svg icons we want to use
const faIcons = [
  faArrowLeft,
  faArrowRight,
  faHome,
  falHome,
  faPlus,
  faPlusCircle,
  faTrash,
  faInfoCircle,
  faInfo,
  faSearchMinus,
  faBatteryThreeQuarters
]
library.add(...faIcons)
