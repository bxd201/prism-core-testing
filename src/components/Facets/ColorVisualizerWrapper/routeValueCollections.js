export const ROUTES_ENUM = {
  COLOR_DETAILS: '/active/color/:colorId/:colorSEO',
  COLOR_WALL: '/active/color-wall',
  ACTIVE_PAINT_SCENE: '/active/paint-scene',
  ACTIVE_COLORS: '/active/colors',
  COLOR_COLLECTION: '/active/color-collections',
  INSPIRATION: '/active/inspiration',
  ACTIVE_MYIDEAS: '/active/my-ideas',
  HELP: '/active/help',
  // This is the dropdown from paint a photo
  SCENES: '/active/scenes',
  ACTIVE: '/active',
  UPLOAD_MATCH_PHOTO: '/upload/match-photo',
  UPLOAD_PAINT_SCENE: '/upload/paint-scene',
  ACTIVE_MATCH_PHOTO: '/active/match-photo',
  USE_OUR_IMAGE: '/active/use-our-image',
  EXPERT_COLORS: '/active/expert-colors',
  COLOR_FROM_IMAGE: '/active/color-from-image',
  PAINT_PHOTO: '/active/paint-photo',
  MY_IDEAS_PREVIEW: '/my-ideas-preview',
  MASKING: '/active/masking'
}

// @todo help should likely come out of here, and should only be presented modally.
// use this to check if app should block main nav until an action is complete
export const TOP_LEVEL_ROUTES = [ROUTES_ENUM.SCENES, ROUTES_ENUM.ACTIVE_COLORS, ROUTES_ENUM.INSPIRATION, ROUTES_ENUM.ACTIVE_MYIDEAS, ROUTES_ENUM.HELP]

// Routes in here will trigger image rotate container to just render the proper item
export const IMAGE_ROTATE_BYPASS_ROUTES = [ROUTES_ENUM.ACTIVE_PAINT_SCENE]
// This collection confirms which screens can modally present the color wall
export const COLORWALL_MODAL_PRESENTERS = [ROUTES_ENUM.ACTIVE_PAINT_SCENE, ROUTES_ENUM.ACTIVE]
