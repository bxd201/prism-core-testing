// @flow
import { shouldAllowFeature } from '../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../constants/configurations'

export const helpTabs = [{
  'id': 0,
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
  }],
  'imageList': ''
}, {
  'id': 1,
  'header': 'HELPFUL_HINTS.HEADER.MY_COLOR_PALETTE',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.MY_COLOR_PALETTE',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathkey': 'myColorPaletteBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_COLOR_DETAILS_ICON_TO',
    'role': 'text',
    'imagePathkey': 'myColorPalette1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_TRASH_ICON_TO',
    'role': 'text',
    'imagePathkey': 'myColorPalette2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.AN_ACTIVE_COLOR_STATE',
    'role': 'text',
    'imagePathkey': 'myColorPalette3'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.TAP_AND_HOLD_THE_BOTTOM_EDGE_OF_A_COLOR_SWATCH_TO',
    'role': 'text',
    'imagePathkey': 'myColorPalette4'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathkey': 'myColorPalette5'
  }],
  'subContent': [{
    'header': 'HELPFUL_HINTS.SUB_CONTENT_HEADER.MY_COLOR_PALETTE',
    'content': 'HELPFUL_HINTS.SUB_CONTENT_DESCRIPTION.MY_COLOR_PALETTE'
  }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_COLOR_DETAILS_ICON_TRASH_ICON_TO',
    'role': 'text',
    'imagePathkey': 'myColorPaletteMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.AN_ACTIVE_COLOR_STATE',
    'role': 'text',
    'imagePathkey': 'myColorPaletteMobile2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.MY_COLOR_PALETTE.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathkey': 'myColorPaletteMobile3'
  }]
}, {
  'id': 2,
  'header': 'HELPFUL_HINTS.HEADER.ADDING_COLORS',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.ADDING_COLORS',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathkey': 'addColorBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_ADD_A_COLOR_ICON_IN_A_COLOR_TILE_TO',
    'role': 'text',
    'imagePathkey': 'addColor1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathkey': 'addColor2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.START_A_NEW_PALETTE_TO_ADD_MORE_THAN_EIGHT_COLORS',
    'role': 'text',
    'imagePathkey': 'addColor3'
  }],
  'subContent': [{
    'header': 'HELPFUL_HINTS.SUB_CONTENT_HEADER.ADDING_COLORS',
    'content': 'HELPFUL_HINTS.SUB_CONTENT_DESCRIPTION.ADDING_COLORS'
  }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_ADD_A_COLOR_ICON_IN_A_COLOR_TILE_TO',
    'role': 'text',
    'imagePathkey': 'addColorMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.CLICK_THE_ADD_COLOR_ICON_TO',
    'role': 'text',
    'imagePathkey': 'addColorMobile2'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.ADDING_COLORS.START_A_NEW_PALETTE_TO_ADD_MORE_THAN_EIGHT_COLORS',
    'role': 'text',
    'imagePathkey': 'addColorMobile3'
  }]
}, {
  'id': 3,
  'header': 'HELPFUL_HINTS.HEADER.COLOR_DETAILS',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.COLOR_DETAILS',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathkey': 'colorDetailBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.CLICK_THE_COLOR_DETAILS_ICON_TO',
    'role': 'text',
    'imagePathkey': 'colorDetail1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.PREVIEW_A_COLOR_IN_COLOR_DETAILS',
    'role': 'text',
    'imagePathkey': 'colorDetail2'
  }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.CLICK_THE_COLOR_DETAILS_ICON_TO',
    'role': 'text',
    'imagePathkey': 'colorDetailMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.COLOR_DETAILS.PREVIEW_A_COLOR_IN_COLOR_DETAILS',
    'role': 'text',
    'imagePathkey': 'colorDetailMobile2'
  }]
}, {
  'id': 4,
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
  }],
  'imageList': '',
  'isHiddenMobile': true
}, {
  'id': 5,
  'header': 'HELPFUL_HINTS.HEADER.SAVING_MY_WORK',
  'subHeader': 'HELPFUL_HINTS.SUB_HEADER.SAVING_MY_WORK',
  'content': '',
  'imageList': [{
    'alt': '',
    'role': '',
    'imagePathkey': 'savingBg'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.NAME_YOUR_CURRENT_PHOTO',
    'role': 'text',
    'imagePathkey': 'saving1'
  }, { 'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.CLICK_SAVE_ICON_TO', 'role': 'text', 'imagePathkey': 'saving3' }],
  'imageListMobile': [{
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.CLICK_SAVE_ICON_TO',
    'role': 'text',
    'imagePathkey': 'savingMobile1'
  }, {
    'alt': 'HELPFUL_HINTS.IMAGE_ALT.SAVING_MY_WORK.NAME_YOUR_CURRENT_PHOTO',
    'role': 'text',
    'imagePathkey': 'savingMobile2'
  }]
}]

export const helpHeader = 'HELPFUL_HINTS.TITLE'

export const filterHelpItems = (featureExclusions: string[]) => {
  return helpTabs.filter((item) => {
    if (item.header === 'HELPFUL_HINTS.HEADER.PAINTING_MY_OWN_PHOTO') {
      return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.uploadYourPhoto) &&
        shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.paintAPhoto)
    }

    if (item.header === 'HELPFUL_HINTS.HEADER.SAVING_MY_WORK') {
      return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.documentSaving)
    }

    return true
  })
}
