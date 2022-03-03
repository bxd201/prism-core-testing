// https://fontawesome.com/icons/search

// fontawesome imports
import { library, config } from '@fortawesome/fontawesome-svg-core'

// solids
import { faAngleDown } from '@fortawesome/pro-solid-svg-icons/faAngleDown'
import { faAngleLeft } from '@fortawesome/pro-solid-svg-icons/faAngleLeft'
import { faAngleUp } from '@fortawesome/pro-solid-svg-icons/faAngleUp'
import { faBrush } from '@fortawesome/pro-solid-svg-icons/faBrush'
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons/faCaretDown'
import { faCaretUp } from '@fortawesome/pro-solid-svg-icons/faCaretUp'
import { faCaretRight } from '@fortawesome/pro-solid-svg-icons/faCaretRight'
import { faCaretLeft } from '@fortawesome/pro-solid-svg-icons/faCaretLeft'
import { faCheck } from '@fortawesome/pro-solid-svg-icons/faCheck'
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons/faCheckCircle'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons/faChevronLeft'
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons/faChevronRight'
import { faChevronUp } from '@fortawesome/pro-solid-svg-icons/faChevronUp'
import { faCircle } from '@fortawesome/pro-solid-svg-icons/faCircle'
import { faDotCircle } from '@fortawesome/pro-solid-svg-icons/faDotCircle'
import { faEraser } from '@fortawesome/pro-solid-svg-icons/faEraser'
import { faEye } from '@fortawesome/pro-solid-svg-icons/faEye'
import { faFillDrip } from '@fortawesome/pro-solid-svg-icons/faFillDrip'
import { faHome } from '@fortawesome/pro-solid-svg-icons/faHome'
import { faImage } from '@fortawesome/pro-solid-svg-icons/faImage'
import { faInfo } from '@fortawesome/pro-solid-svg-icons/faInfo'
import { faInfoCircle } from '@fortawesome/pro-solid-svg-icons/faInfoCircle'
import { faMoon } from '@fortawesome/pro-solid-svg-icons/faMoon'
import { faMoonStars } from '@fortawesome/pro-solid-svg-icons/faMoonStars'
import { faMousePointer } from '@fortawesome/pro-solid-svg-icons/faMousePointer'
import { faPalette } from '@fortawesome/pro-solid-svg-icons/faPalette'
import { faPlus } from '@fortawesome/pro-solid-svg-icons/faPlus'
import { faPlusCircle } from '@fortawesome/pro-solid-svg-icons/faPlusCircle'
import { faRedoAlt } from '@fortawesome/pro-solid-svg-icons/faRedoAlt'
import { faSearch } from '@fortawesome/pro-solid-svg-icons/faSearch'
import { faSearchMinus } from '@fortawesome/pro-solid-svg-icons/faSearchMinus'
import { faSun } from '@fortawesome/pro-solid-svg-icons/faSun'
import { faTimes } from '@fortawesome/pro-solid-svg-icons/faTimes'
import { faTrash } from '@fortawesome/pro-solid-svg-icons/faTrash'
import { faUndoAlt } from '@fortawesome/pro-solid-svg-icons/faUndoAlt'
import { faWindowClose } from '@fortawesome/pro-solid-svg-icons/faWindowClose'
import { faUpload } from '@fortawesome/pro-solid-svg-icons/faUpload'

// lights
import { faAlignJustify as falAlignJustify } from '@fortawesome/pro-light-svg-icons/faAlignJustify'
import { faAngleLeft as falAngleLeft } from '@fortawesome/pro-light-svg-icons/faAngleLeft'
import { faCircle as falCircle } from '@fortawesome/pro-light-svg-icons/faCircle'
import { faClone as falClone } from '@fortawesome/pro-light-svg-icons/faClone'
import { faCompressAlt as falCompressAlt } from '@fortawesome/pro-light-svg-icons/faCompressAlt'
import { faDownload as falDownload } from '@fortawesome/pro-light-svg-icons/faDownload'
import { faDrawPolygon as falDrawPolygon } from '@fortawesome/pro-light-svg-icons/faDrawPolygon'
import { faEdit as falEdit } from '@fortawesome/pro-light-svg-icons/faEdit'
import { faExpandAlt as falExpandAlt } from '@fortawesome/pro-light-svg-icons/faExpandAlt'
import { faFolder as falFolder } from '@fortawesome/pro-light-svg-icons/faFolder'
import { faHome as falHome } from '@fortawesome/pro-light-svg-icons/faHome'
import { faInfoCircle as falInfoCircle } from '@fortawesome/pro-light-svg-icons/faInfoCircle'
import { faLightbulb as falLightbulb } from '@fortawesome/pro-light-svg-icons/faLightbulb'
import { faLongArrowLeft as falLongArrowLeft } from '@fortawesome/pro-light-svg-icons/faLongArrowLeft'
import { faLongArrowRight as falLongArrowRight } from '@fortawesome/pro-light-svg-icons/faLongArrowRight'
import { faMinus as falMinus } from '@fortawesome/pro-light-svg-icons/faMinus'
import { faMoon as falMoon } from '@fortawesome/pro-light-svg-icons/faMoon'
import { faObjectGroup as falObjectGroup } from '@fortawesome/pro-light-svg-icons/faObjectGroup'
import { faObjectUngroup as falObjectUngroup } from '@fortawesome/pro-light-svg-icons/faObjectUngroup'
import { faPlus as falPlus } from '@fortawesome/pro-light-svg-icons/faPlus'
import { faPlusCircle as falPlusCircle } from '@fortawesome/pro-light-svg-icons/faPlusCircle'
import { faRedo as falRedo } from '@fortawesome/pro-light-svg-icons/faRedo'
import { faSearch as falSearch } from '@fortawesome/pro-light-svg-icons/faSearch'
import { faSearchPlus as falSearchPlus } from '@fortawesome/pro-light-svg-icons/faSearchPlus'
import { faSignal3 as falSignal3 } from '@fortawesome/pro-light-svg-icons/faSignal3'
import { faSquareFull as falSquareFull } from '@fortawesome/pro-light-svg-icons/faSquareFull'
import { faSun as falSun } from '@fortawesome/pro-light-svg-icons/faSun'
import { faThLarge as falThLarge } from '@fortawesome/pro-light-svg-icons/faThLarge'
import { faTimes as falTimes } from '@fortawesome/pro-light-svg-icons/faTimes'
import { faTrashAlt as falTrashAlt } from '@fortawesome/pro-light-svg-icons/faTrashAlt'
import { faUndo as falUndo } from '@fortawesome/pro-light-svg-icons/faUndo'
import { faUpload as falUpload } from '@fortawesome/pro-light-svg-icons/faUpload'

// regulars
// import { fa??? as far??? } from '@fortawesome/pro-regular-svg-icons/fa???'
import { faPlusCircle as farPlusCircle } from '@fortawesome/pro-regular-svg-icons/faPlusCircle'
import { faArrowToBottom as farArrowToBottom } from '@fortawesome/pro-regular-svg-icons/faArrowToBottom'

// populate with all the FontAwesome svg icons we want to use
const faIcons = [
  // -------- SOLIDS ---------
  faAngleDown,
  faAngleLeft,
  faAngleUp,
  faBrush,
  faCaretDown,
  faCaretUp,
  faCaretRight,
  faCaretLeft,
  faCheck,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircle,
  faDotCircle,
  faEraser,
  faEye,
  faFillDrip,
  faHome,
  faImage,
  faInfo,
  faInfoCircle,
  falExpandAlt,
  faMoon,
  faMoonStars,
  faMousePointer,
  faPalette,
  faPlus,
  faPlusCircle,
  faRedoAlt,
  faSearch,
  faSearchMinus,
  faSun,
  faTimes,
  faUndoAlt,
  faWindowClose,
  faUpload,
  // -------- LIGHTS ---------
  falAlignJustify,
  falAngleLeft,
  falCircle,
  falClone,
  falCompressAlt,
  falDownload,
  falDrawPolygon,
  falEdit,
  falFolder,
  falHome,
  falInfoCircle,
  falLightbulb,
  falLongArrowLeft,
  falLongArrowRight,
  falMinus,
  falMoon,
  falObjectGroup,
  falObjectUngroup,
  falPlus,
  falPlusCircle,
  falRedo,
  falSearch,
  falSearchPlus,
  falSignal3,
  falSquareFull,
  falSun,
  falThLarge,
  falTimes,
  falTrashAlt,
  falTrashAlt,
  falUndo,
  faTrash,
  falUpload,
  // -------- REGULARS ---------
  farArrowToBottom,
  farPlusCircle
]
library.add(...faIcons)

// don't automatically inject the CSS into the DOM because we're importing ALL of it into our own bundle
// this is done so we can prefix all selectors with .cleanslate.prism
config.autoAddCss = false
