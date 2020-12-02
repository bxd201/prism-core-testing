export const ROUTES_ENUM = {
  COLOR_WALL: '/active/color-wall',
  PAINT_SCENE: '/active/paint-scene',
  COLORS: '/active/colors',
  INSPIRATION: '/active/inspiration',
  MYIDEAS: '/active/my-ideas',
  HELP: '/active/help',
  // Thi sis the dropdown from paint a photo
  SCENES: '/active/scenes',
  STOCK_SCENE: '/active'
}

// @todo help should likely come out of here, and should only be presented modally.
// use this to check if app should block main nav until an action is complete
export const TOP_LEVEL_ROUTES = [ROUTES_ENUM.SCENES, ROUTES_ENUM.COLORS, ROUTES_ENUM.INSPIRATION, ROUTES_ENUM.MYIDEAS, ROUTES_ENUM.HELP]

// Routes in here will trigger image rotate container to just render the proper item
export const IMAGE_ROTATE_BYPASS_ROUTES = [ROUTES_ENUM.PAINT_SCENE]
// This collection confirms which screens can modally present the color wall
export const COLORWALL_MODAL_PRESENTERS = [ROUTES_ENUM.PAINT_SCENE, ROUTES_ENUM.STOCK_SCENE]
