/* eslint-disable no-undef */
// @flow

import type { BlankColor } from '../shared/types/Colors.js.flow'

export const DRAG_TYPES = Object.freeze({
  SWATCH: 'SWATCH'
})

export const SCENE_TYPES = Object.freeze({
  OBJECT: 'objects',
  ROOM: 'rooms',
  AUTOMOTIVE: 'automotive',
  FAST_MASK: 'fastmask'
})

// There are scene types that don't originate from the api.
export const FRONT_END_SCENE_TYPES = [SCENE_TYPES.FAST_MASK]

export const SCENE_VARIANTS = Object.freeze({
  DAY: 'day',
  NIGHT: 'night',
  MAIN: 'main'
})

export const SCENE_ROLES = Object.freeze({
  MAIN: 'main',
  TRIM: 'trim',
  ACCENT: 'accent'
})

export const BLANK_SWATCH: BlankColor = void (0)

// this defines the space around the grid when zoomed in
export const ZOOMED_VIEW_GRID_PADDING: number = 1

export const SW_CHUNK_SIZE: number = 7

export const ROUTE_PARAMS = Object.freeze({
  ACTIVE: 'active',
  COLOR_DETAIL: 'color-detail',
  COLOR_WALL: 'color-wall',
  SECTION: 'section',
  FAMILY: 'family',
  COLOR: 'color',
  SEARCH: 'search'
})

export const ROUTE_PARAM_NAMES = Object.freeze({
  SECTION: 'section',
  FAMILY: 'family',
  COLOR_ID: 'colorId',
  COLOR_SEO: 'colorSEO',
  SEARCH: 'search'
})

export const KEY_CODES = Object.freeze({
  KEY_CODE_ARROW_DOWN: 40,
  KEY_CODE_ARROW_LEFT: 37,
  KEY_CODE_ARROW_RIGHT: 39,
  KEY_CODE_ARROW_UP: 38,
  KEY_CODE_ENTER: 13,
  KEY_CODE_SPACE: 32,
  KEY_CODE_TAB: 9
})

export const GOOGLE_ANALYTICS_UID_SW = 'UA-130955316-1'
export const GOOGLE_ANALYTICS_UID_CBG_HGSW = 'UA-202069194-8'
export const GOOGLE_ANALYTICS_UID_CBG_VALSPAR = 'UA-202069194-1'

export const GA_TRACKER_NAME_SW = 'GAtrackerPRISM'
export const GA_TRACKER_NAME_CBG_HGSW = 'GAtrackerPRISMCBGHGSW'
export const GA_TRACKER_NAME_CBG_VALSPAR = 'GAtrackerPRISMCBGValspar'
export const GA_TRACKER_NAME_BRAND = Object.freeze({
  condor: GA_TRACKER_NAME_SW,
  cscc: GA_TRACKER_NAME_SW,
  easy: GA_TRACKER_NAME_SW,
  hgsw: GA_TRACKER_NAME_CBG_HGSW,
  lowes: GA_TRACKER_NAME_SW,
  sherwin: GA_TRACKER_NAME_SW,
  'SW-CA': GA_TRACKER_NAME_SW,
  valspar: GA_TRACKER_NAME_CBG_VALSPAR
})

export const IS_IE = (() => {
  if (typeof window !== 'undefined') {
    return !!window.document.documentMode
  }
  return false
})()

// 30 days in
export const ANON_STOCK_SCENE_LIFETIME = 1000 * 60 * 24 * 30
export const TAU = 2 * Math.PI

export const SHOW_LOADER_ONLY_BRANDS = ['condor', 'easy', 'lowes']

export const GROUP_NAMES = {
  SCENES: 'scenes', // this groupname means it will share scene data in redux
  COLORS: 'colors' // this groupname means it will share livepalette data via redux
}

export const BUTTON_POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom'
}
