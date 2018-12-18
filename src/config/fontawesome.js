// fontawesome imports
import { library } from '@fortawesome/fontawesome-svg-core'

// solids
import {
  faPlus,
  faTrash,
  faInfoCircle,
  faInfo,
  faSearchMinus
} from '@fortawesome/pro-solid-svg-icons'

// lights
import {
  faPlusCircle
} from '@fortawesome/pro-light-svg-icons'

// regulars
import {
  faBatteryThreeQuarters
} from '@fortawesome/pro-regular-svg-icons'

// populate with all the FontAwesome svg icons we want to use
const faIcons = [
  faPlus,
  faPlusCircle,
  faTrash,
  faInfoCircle,
  faInfo,
  faSearchMinus,
  faBatteryThreeQuarters
]
library.add(...faIcons)
