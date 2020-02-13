/* eslint-disable no-undef */
// @flow

import type { BlankColor } from '../shared/types/Colors'

export const DRAG_TYPES = Object.freeze({
  SWATCH: 'SWATCH'
})

export const SCENE_TYPES = Object.freeze({
  OBJECT: 'objects',
  ROOM: 'rooms',
  AUTOMOTIVE: 'automotive'
})

export const SCENE_VARIANTS = Object.freeze({
  DAY: 'day',
  NIGHT: 'night',
  MAIN: 'main'
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

export const GOOGLE_ANALYTICS_UID = 'UA-130955316-1'

export const IS_IE = !!window.document.documentMode
