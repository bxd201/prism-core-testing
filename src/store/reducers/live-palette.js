// @flow
import reject from 'lodash/reject'
import filter from 'lodash/filter'
import difference from 'lodash/difference'
import type { Color } from '../../shared/types/Colors.js.flow'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import {
  ADD_LP_COLOR,
  REMOVE_LP_COLOR,
  ACTIVATE_LP_COLOR,
  ACTIVATE_LP_PREVIEW_COLOR,
  REORDER_LP_COLORS,
  TOGGLE_LP_COMPARE_COLOR,
  EDIT_LP_COMPARE_COLOR,
  CANCEL_ADD_COLOR,
  EMPTY_LP_COLOR, REPLACE_LP_COLORS, MERGE_LP_COLORS,
  DEACTIVATE_TEMPORARY_COLOR
} from '../actions/live-palette'
import { checkCanMergeColors } from '../../components/LivePalette/livePaletteUtility'
import storageAvailable from '../../shared/utils/browserStorageCheck.util'

type State = {
  colors: Color[],
  activeColor: ?Color,
  toggleCompareColor: boolean,
  temporaryActiveColor: Color | null
}

const lpFromLocalStorage = storageAvailable('localStorage') && JSON.parse(window.localStorage.getItem('lp'))
const initialLpState = { colors: [], activeColor: null }
const { colors, activeColor } = lpFromLocalStorage || initialLpState
export const initialState: State = {
  colors,
  activeColor,
  toggleCompareColor: false,
  temporaryActiveColor: null
}

export const lp = (state: any = initialState, action: any) => {
  switch (action.type) {
    case CANCEL_ADD_COLOR:
      const removeElement = (arr, i) => [...arr.slice(0, i), ...arr.slice(i + 1)]
      return Object.assign({}, state, {
        colors: removeElement(state.colors, state.colors.length - 1)
      })
    case EMPTY_LP_COLOR:
      const newPallette = []
      return Object.assign({}, state, {
        colors: [...newPallette, state.temporaryActiveColor],
        activeColor: state.temporaryActiveColor,
        temporaryActiveColor: null
      })

    case TOGGLE_LP_COMPARE_COLOR:
      if (action.payload) {
        return Object.assign({}, state, {
          toggleCompareColor: false
        })
      }
      return Object.assign({}, state, {
        toggleCompareColor: !state.toggleCompareColor,
        compareColorsId: []
      })
    case ADD_LP_COLOR:
      // check if there are already 7 colors added and if the color exists already before adding
      if (state.colors.length === LP_MAX_COLORS_ALLOWED) {
        const isColorExistInLp = state.colors.findIndex(color => color.colorNumber === action.payload.color.colorNumber)
        if (isColorExistInLp === -1) {
          return Object.assign({}, state, {
            temporaryActiveColor: action.payload.color
          })
        }
      }
      if (state.colors && state.colors.length < LP_MAX_COLORS_ALLOWED && !filter(state.colors, color => color.id === action.payload.color.id).length) {
        state.colors.push(action.payload.color)
      }

      return Object.assign({}, state, {
        colors: [
          ...state.colors
        ],
        activeColor: action.payload.color, // default newly added colors as the active color
        previousActiveColor: state.activeColor
      })

    case REMOVE_LP_COLOR:
      let activeColorIndex = 0 // set a default color index to return

      // remove payload color from the colors stored in state
      const colors = reject(state.colors, (color, index: number) => {
        if ((color.id === action.payload.colorId)) {
          if (index > 0) {
            activeColorIndex = index - 1
          }
        }

        return (color.id === action.payload.colorId)
      })

      let diff = difference(state.colors, colors)

      return Object.assign({}, state, {
        colors: [
          ...colors
        ],
        activeColor: colors[activeColorIndex] || null,
        previousActiveColor: state.activeColor,
        removedColor: diff.length ? diff[0] : void (0)
      })

    case ACTIVATE_LP_COLOR:
      return Object.assign({}, state, {
        activeColor: action.payload.color,
        previousActiveColor: state.activeColor,
        temporaryActiveColor: null
      })

    case ACTIVATE_LP_PREVIEW_COLOR:
      return Object.assign({}, state, {
        activePreviewColor: action.payload.color
      })

    case REORDER_LP_COLORS:
      // no colors are in the LP, why are you calling reorder?
      if (state.colors.length === 0) {
        return state
      }

      const { colorsByIndex } = action.payload

      // reconstruct the colors array given an array of their IDs
      const reconstructedColors = []
      for (let id = 0; id < colorsByIndex.length; id++) {
        const color = filter(state.colors, color => (color.id === colorsByIndex[id]))[0]
        reconstructedColors.push(color)
      }

      return Object.assign({}, state, {
        colors: [
          ...reconstructedColors
        ]
      })

    case EDIT_LP_COMPARE_COLOR:
      const originCompareId = state.colors.map((colors) => colors.id)
      let compareColorsId = state.compareColorsId ? state.compareColorsId : originCompareId
      const editId = action.payload.colorId
      let removedCompareColors = [...compareColorsId]
      const idx = removedCompareColors.indexOf(editId)
      if (idx !== -1) {
        removedCompareColors.splice(idx, 1)
      } else {
        const insertIdx = originCompareId.indexOf(editId)
        removedCompareColors.splice(insertIdx, 0, editId)
      }
      return Object.assign({}, state, {
        compareColorsId: removedCompareColors
      })

    case REPLACE_LP_COLORS:
      const activeColor = action.payload.length ? { ...action.payload[0] } : null
      return {
        ...state,
        colors: action.payload,
        activeColor,
        previousActiveColor: null
      }

    case MERGE_LP_COLORS:
      const newColors = action.payload

      if (checkCanMergeColors(state.colors, newColors, LP_MAX_COLORS_ALLOWED)) {
        let activeColor = action.payload.length ? { ...action.payload[0] } : null

        const mergedColors = [...newColors, ...state.colors]
        let uniqueColorIds = new Set()
        mergedColors && mergedColors.map(color => {
          uniqueColorIds.add(color.id)
        })
        const uniqueMergedColors = []
        for (let colorId of uniqueColorIds) {
          uniqueMergedColors.push(mergedColors.find(color => color.id === colorId))
        }
        let _activeColor = uniqueMergedColors.filter(color => !!color.isActive)

        if (_activeColor.length) {
          activeColor = { ..._activeColor[0] }
        } else {
          activeColor = { ...uniqueMergedColors[0] }
        }

        return {
          ...state,
          colors: uniqueMergedColors,
          activeColor
        }
      }

      return state

    case DEACTIVATE_TEMPORARY_COLOR:
      return Object.assign({}, state, {
        temporaryActiveColor: null
      })

    default:
      return state
  }
}
