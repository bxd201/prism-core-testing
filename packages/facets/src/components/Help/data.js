// @flow
import { shouldAllowFeature } from '../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../constants/configurations'

export const helpTabs = [{
  'id': 0,
  'name': 'ICONS_&_BUTTONS',
  'header': 'HELPFUL_HINTS.HEADER.ICONS_&_BUTTONS',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.ICONS_&_BUTTONS',
  'content': [{
    'fontAwesomeIcon': { 'variant': 'fal', 'icon': 'plus-circle', 'rotate': 0 },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.ADD_COLOR',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_CONTENT.ADD_COLOR']
  }, {
    'fontAwesomeIcon': { 'variant': 'fal', 'icon': 'folder', 'rotate': 0 },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.SAVE',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_CONTENT.SAVE']
  }, {
    'fontAwesomeIcon': { 'variant': 'fa', 'icon': 'trash', 'rotate': 0 },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.TRASH_A_COLOR',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_CONTENT.TRASH_A_COLOR']
  }, {
    'fontAwesomeIcon': { 'variant': 'fal', 'icon': 'clone', 'rotate': 0, 'flip': 'horizontal' },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.MORE_SCENES',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_CONTENT.MORE_SCENES']
  }, {
    'fontAwesomeIcon': { 'variant': 'fal', 'icon': 'align-justify', 'rotate': 0, 'flip': 'horizontal' },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.COLOR_DETAILS',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_CONTENT.COLOR_DETAILS']
  }, {
    'fontAwesomeIcon': { 'variant': 'fal', 'icon': 'signal-3', 'rotate': 235, 'size': 'lg' },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.GRAB_&_REORDER',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_CONTENT.GRAB_&_REORDER']
  }, {
    'fontAwesomeIcon': {},
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.PAINT_SCENE',
    'iconInfoContent': []
  }],
  'imageList': '',
  'isHiddenMobile': false
}, {
  'id': 1,
  'name': 'MY_COLOR_PALETTE',
  'header': 'HELPFUL_HINTS.HEADER.MY_COLOR_PALETTE',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.MY_COLOR_PALETTE',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathKey': 'myColorPaletteBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_COLOR_DETAILS_ICON_TO',
    'role': 'text',
    'imagePathKey': 'myColorPalette1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_TRASH_ICON_TO',
    'role': 'text',
    'imagePathKey': 'myColorPalette2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.AN_ACTIVE_COLOR_STATE',
    'role': 'text',
    'imagePathKey': 'myColorPalette3'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.TAP_AND_HOLD_THE_BOTTOM_EDGE_OF_A_COLOR_SWATCH_TO',
    'role': 'text',
    'imagePathKey': 'myColorPalette4'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathKey': 'myColorPalette5'
  }],
  'subContent': [{
    'header': 'HELPFUL_HINTS.SUB_CONTENT_HEADER.MY_COLOR_PALETTE',
    'content': 'HELPFUL_HINTS.SUB_CONTENT_DESCRIPTION.MY_COLOR_PALETTE'
  }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_COLOR_DETAILS_ICON_TRASH_ICON_TO',
    'role': 'text',
    'imagePathKey': 'myColorPaletteMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.AN_ACTIVE_COLOR_STATE',
    'role': 'text',
    'imagePathKey': 'myColorPaletteMobile2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathKey': 'myColorPaletteMobile3'
  }],
  'isHiddenMobile': false
}, {
  'id': 2,
  'name': 'ADDING_COLORS',
  'header': 'HELPFUL_HINTS.HEADER.ADDING_COLORS',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.ADDING_COLORS',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathKey': 'addColorBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_ADD_A_COLOR_ICON_IN_A_COLOR_TILE_TO',
    'role': 'text',
    'imagePathKey': 'addColor1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathKey': 'addColor2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.START_A_NEW_PALETTE_TO_ADD_MORE_THAN_EIGHT_COLORS',
    'role': 'text',
    'imagePathKey': 'addColor3'
  }],
  'subContent': [{
    'header': 'HELPFUL_HINTS.SUB_CONTENT_HEADER.ADDING_COLORS',
    'content': 'HELPFUL_HINTS.SUB_CONTENT_DESCRIPTION.ADDING_COLORS'
  }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_ADD_A_COLOR_ICON_IN_A_COLOR_TILE_TO',
    'role': 'text',
    'imagePathKey': 'addColorMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathKey': 'addColorMobile2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.START_A_NEW_PALETTE_TO_ADD_MORE_THAN_EIGHT_COLORS',
    'role': 'text',
    'imagePathKey': 'addColorMobile3'
  }],
  'isHiddenMobile': false
}, {
  'id': 3,
  'name': 'COLOR_DETAILS',
  'header': 'HELPFUL_HINTS.HEADER.COLOR_DETAILS',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.COLOR_DETAILS',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathKey': 'colorDetailBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.CLICK_THE_COLOR_DETAILS_ICON_TO',
    'role': 'text',
    'imagePathKey': 'colorDetail1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.PREVIEW_A_COLOR_IN_COLOR_DETAILS',
    'role': 'text',
    'imagePathKey': 'colorDetail2'
  }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.CLICK_THE_COLOR_DETAILS_ICON_TO',
    'role': 'text',
    'imagePathKey': 'colorDetailMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.PREVIEW_A_COLOR_IN_COLOR_DETAILS',
    'role': 'text',
    'imagePathKey': 'colorDetailMobile2'
  }],
  'isHiddenMobile': false
}, {
  'id': 4,
  'name': 'PAINTING_MY_OWN_PHOTO',
  'header': 'HELPFUL_HINTS.HEADER.PAINTING_MY_OWN_PHOTO',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.PAINTING_MY_OWN_PHOTO',
  'content': [{
    'fontAwesomeIcon': { 'variant': 'fa', 'icon': 'fill-drip', 'rotate': 0, 'flip': 'horizontal' },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.PAINT_AREA',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.PAINT_AREA']
  }, {
    'fontAwesomeIcon': { 'variant': 'fa', 'icon': 'brush', 'rotate': 45 },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.PAINTBRUSH',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.PAINTBRUSH']
  }, {
    'fontAwesomeIcon': { 'variant': 'fa', 'icon': 'mouse-pointer', 'rotate': -20, 'flip': 'horizontal' },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.SELECT',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.SELECT']
  }, {
    'fontAwesomeIcon': { 'variant': 'fa', 'icon': 'eraser', 'rotate': 0 },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.ERASE',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.ERASE']
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fal', 'icon': 'draw-polygon', 'rotate': 10 }, {
      'variant': 'fal',
      'icon': 'plus',
      'rotate': 0,
      'size': 'xs'
    }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.DEFINE_AREA',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.DEFINE_AREA']
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fal', 'icon': 'draw-polygon', 'rotate': 10 }, {
      'variant': 'fal',
      'icon': 'minus',
      'rotate': 0,
      'size': 'xs'
    }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.REMOVE_AREA',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.REMOVE_AREA']
  }, {
    'fontAwesomeIcon': { 'variant': 'fal', 'icon': 'search-plus', 'rotate': 0 },
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.ZOOM',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.ZOOM']
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fa', 'icon': 'undo-alt', 'rotate': 0 }, {
      'variant': 'fa',
      'icon': 'redo-alt',
      'rotate': 0
    }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.UNDO_&_REDO',
    'iconInfoContent': ['HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_CONTENT.UNDO_&_REDO'],
    'isUndoRedo': true
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fa', 'icon': 'redo-alt' }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.REDO',
    'iconInfoContent': []
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fa', 'icon': 'eye', 'flip': 'horizontal' }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.HIDE_PAINT',
    'iconInfoContent': []
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fal', 'icon': 'info-circle' }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.INFO',
    'iconInfoContent': []
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fal', 'icon': 'trash-alt' }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.DELETE_GROUP',
    'iconInfoContent': []
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fal', 'icon': 'object-group' }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.GROUP',
    'iconInfoContent': []
  }, {
    'fontAwesomeIcon': [{ 'variant': 'fal', 'icon': 'object-ungroup' }],
    'iconInfoName': 'HELPFUL_HINTS.CONTENT.PAINTING_MY_OWN_PHOTO.ICON_INFO_NAME.UNGROUP',
    'iconInfoContent': []
  }],
  'imageList': '',
  'isHiddenMobile': false
}, {
  'id': 5,
  'name': 'SAVING_MY_WORK',
  'header': 'HELPFUL_HINTS.HEADER.SAVING_MY_WORK',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.SAVING_MY_WORK',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathKey': 'savingBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.NAME_YOUR_CURRENT_PHOTO',
    'role': 'text',
    'imagePathKey': 'saving1'
  }, { 'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.CLICK_SAVE_ICON_TO', 'role': 'text', 'imagePathKey': 'saving3' }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.CLICK_SAVE_ICON_TO',
    'role': 'text',
    'imagePathKey': 'savingMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.NAME_YOUR_CURRENT_PHOTO',
    'role': 'text',
    'imagePathKey': 'savingMobile2'
  }],
  'isHiddenMobile': false
}]

export const helpHeader = 'HELPFUL_HINTS.TITLE'

export const filterHelpItems = (contents: string[], contentsHiddenMobile: string[], featureExclusions: string[]): typeof helpTabs => {
  // Filtering Help Section details:
  // Icons & Buttons - Save hint
  !shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.documentSaving) && helpTabs[0].content.forEach((icon, index) => {
    icon.iconInfoName === 'HELPFUL_HINTS.CONTENT.ICONS_&_BUTTONS.ICON_INFO_NAME.SAVE' && helpTabs[0].content.splice(index, 1)
  })

  const helpTabNames = helpTabs.map(item => item.name)
  contentsHiddenMobile.forEach(content => { helpTabs[helpTabNames.indexOf(content)].isHiddenMobile = true })

  return helpTabs.filter(item => contents.indexOf(item.name) !== -1)
}
