/* eslint-disable no-undef */

// TODO:noah.hall
// confirm with team should this be a env var
const API_VERSION = 'v1'

function endpoint (str, path = API_PATH, version = API_VERSION) {
  return `${path}/${version}/${str.join('')}`
}

export const COLLECTION_SUMMARIES_ENDPOINT = endpoint`collections`
export const COLOR_BRIGHTS_ENDPOINT = endpoint`brights`
export const COLOR_CHUNKS_ENDPOINT = endpoint`chunks`
export const COLOR_FAMILY_NAMES_ENDPOINT = endpoint`families`
export const COLORS_ENDPOINT = endpoint`colors`
export const COLORS_SEARCH_ENDPOINT = endpoint`search`
export const CONFIG_ENDPOINT = endpoint`configurations`
export const EXPERT_COLOR_PICKS_ENDPOINT = endpoint`expertcolorpicks`
export const INSPIRATIONAL_PHOTOS_ENDPOINT = endpoint`inspirationalphotos`
export const ML_PIPELINE_ENDPOINT = `${ML_API_URL}/pipeline/`
export const SCENES_ENDPOINT = endpoint`scenes`
// @todo - Legacy endpoints proxies to save masks, these do not exists ? -RS
export const MASK_ENDPOINT = endpoint`masks`
export const STATUS_ENDPOINT = endpoint`auth/user/status`
// @todo - does this need to be brandified? -RS
export const CUSTOM_SCENE_IMAGE_ENDPOINT = 'https://www.sherwin-williams.com/color-visualization/services/scene/custom'
