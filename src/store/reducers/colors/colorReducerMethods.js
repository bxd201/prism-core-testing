// @flow
import at from 'lodash/at'
import chunk from 'lodash/chunk'
import find from 'lodash/find'
import sum from 'lodash/sum'
import flattenDeep from 'lodash/flattenDeep'
import intersection from 'lodash/intersection'
import kebabCase from 'lodash/kebabCase'
import pick from 'lodash/pick'
import sortBy from 'lodash/sortBy'

import { convertUnorderedColorsToColorMap, convertUnorderedColorsToClasses } from '../../../shared/helpers/ColorDataUtils'
import { compareKebabs } from '../../../shared/helpers/StringUtils'

import { type ColorsState, type ReduxAction, type Section } from '../../../shared/types/Actions.js.flow'
import type { Color } from '../../../shared/types/Colors.js.flow'

export const initialState: ColorsState = {
  status: {
    loading: false,
    error: false,
    activeRequest: false,
    requestComplete: false
  },
  items: {},
  layouts: void (0),
  layout: void (0),
  structure: [],
  sections: [],
  section: void (0),
  families: [],
  family: void (0),

  search: {
    results: void (0),
    loading: false,
    error: false,
    count: void (0),
    suggestions: void (0),
    query: '',
    active: false
  },

  colorWallActive: void (0),

  initializeWith: {
    section: void (0),
    family: void (0),
    colorWallActive: void (0)
  }
}

export function getErrorState (state: ColorsState, error?: any) {
  // TODO: this is too generic; we need a way to specify other kinds of errors
  return {
    ...state,
    status: {
      loading: false,
      error: error || true,
      activeRequest: false,
      requestComplete: true
    }
  }
}

export function doReceiveColors (state: ColorsState, action: ReduxAction) {
  // adding toString methods to all Color objects
  const initSection = state.initializeWith.section
  const initFam = state.initializeWith.family
  const initColor = state.initializeWith.colorWallActive
  const colorMap = convertUnorderedColorsToColorMap(convertUnorderedColorsToClasses(action.payload.unorderedColors))
  const unorderedColorList = action.payload.unorderedColors.map((c: Color) => c.id)
  const structure = action.payload.sections
  const hasSections = structure && structure.length
  const sectionNames = hasSections && structure.map((section: Section) => {
    return section.name
  })
  const defaultSection = hasSections && find(structure, { default: true })
  const { colors, brights } = action.payload

  // -----------------------------------------------------------------
  // PRISM-450 - mocked color layouts
  // Breaking apart and reforming color groups for ingestion by ColorSwatchList.
  // TODO: Move this logic into API in the future.

  const emeraldStructure = ((colors, structure) => {
    const emerald = structure.filter(s => s.name.indexOf('Emerald') > -1)[0]

    if (!emerald) {
      return undefined
    }

    const _colors = colors[emerald.name].map(aChunk => chunk(aChunk, 5))
    return maximizeAllShortRows([
      _colors[0].map((_, i) => _colors.map((aChunk, j) => aChunk[i]))
    ])
  })(colors, structure)

  // wide and thin
  const historicStructure = ((colors) => {
    const historic = colors['Couleur Historique'] || colors['Historic Colour'] || colors['Historic Color']

    if (!historic) {
      return undefined
    }

    const _colors = flattenDeep(historic).map(id => colorMap[id])
    const sorted = sortBy(_colors, c => c.id)
    // NOTE: these aren't actually divided by interior and exterior colors per our color data; they're just sorted by ID and then split 80/60
    const int = chunk(sorted.slice(0, 80).map(c => `${c.id}`), 8)
    const ext = chunk(sorted.slice(80, 140).map(c => `${c.id}`), 6)

    return maximizeAllShortRows([int.map((row, i) => ([ row, ext[i] ]))])
  })(colors)

  // many short blocks
  const timelessStructure = ((colors) => {
    const timeless = colors['Couleur Intemporelle'] || colors['Timeless Colour'] || colors['Timeless Color']

    if (!timeless) {
      return undefined
    }

    const _colors = flattenDeep(timeless).map(id => colorMap[id])
    const sorted = chunk(sortBy(_colors, c => c.storeStripLocator).map(c => c.id), 7)
    const rows = sorted.length
    const left = sorted.slice(0, rows / 2)
    const right = sorted.slice(rows / 2, rows)

    return maximizeAllShortRows(chunk(left.map((row, i) => ([
      row,
      right[i]
    ])), 3))
  })(colors)

  const swFamilies = structure.filter(section => section.name.indexOf('Sherwin-Williams') >= 0)[0].families

  const swStructureBrights = Object.keys(pick(brights, swFamilies)).map(key => brights[key]).map(v => {
    const famColors = flattenDeep(v).map(id => colorMap[id])
    return sortBy(famColors.filter(c => c.storeStripLocator), c => c.storeStripLocator.split('-')[0]).map(c => c.id)
  })

  const swStructure = Object.keys(pick(colors, swFamilies)).map(key => colors[key]).map((structuredFamilyColors, i) => {
    const famColors = flattenDeep(structuredFamilyColors).map(id => colorMap[id])
    const unsortedChunkArray = chunk(sortBy(famColors.filter(c => c.storeStripLocator), c => c.storeStripLocator.split('-')[0]), 49)
    return unsortedChunkArray.map(thisChunk => chunk(sortBy(thisChunk, c => c.storeStripLocator.split('-').reverse()[0]).map(c => c.id), 7))
  })

  // and then modify getAFamily() here to use these two arrays to generate the family grid
  const swStructureAll = (() => {
    const brightsRow = [swFamilies.map((_, iFam) => swStructureBrights[iFam])]
    const regularsRows = swStructure[0].map((_, iChunkRow) => swStructure[0][iChunkRow].map((_, iRow) => swFamilies.map((_, iFam) => swStructure[iFam][iChunkRow][iRow])))

    regularsRows.unshift(brightsRow)

    return maximizeAllShortRows(regularsRows)
  })()

  const getAFamily = (iFam) => {
    const brights = swStructureBrights[iFam]
    const rest = swStructure[iFam]

    return maximizeAllShortRows([
      [
        [brights]
      ],
      [...Array(rest[0].length)].map((_, iRow) => rest.map((_, iChunkCol) => rest[iChunkCol][iRow]))
    ])
  }

  const layouts = structure.map(section => {
    const { name, families } = section
    const isEmerald = name.indexOf('Emerald') > -1
    const isHistoric = name.indexOf('Couleur Hist') === 0 || name.indexOf('Historic') === 0
    const isTimeless = name.indexOf('Couleur Intemporelle') === 0 || name.indexOf('Timeless') === 0
    let layout = [[[[]]]]

    if (isHistoric) {
      layout = historicStructure
    } else if (isTimeless) {
      layout = timelessStructure
    } else if (isEmerald) {
      layout = emeraldStructure
    } else {
      layout = swStructureAll
    }

    return {
      name,
      layout,
      families: families.map((fam, i) => ({
        name: fam,
        layout: isHistoric ? historicStructure : isTimeless ? timelessStructure : isEmerald ? emeraldStructure : getAFamily(i)
      }))
    }
  })

  // END PRISM-450 - mocked color layouts
  // -----------------------------------------------------------------

  let useDefault = true // this will be toggled to false if initSection/family/color can be found

  // newState will be modified in the below conditions depending what section/family/color matches we find
  let newState = {
    ...state,
    items: {
      colors: colors,
      brights: action.payload.brights,
      unorderedColors: unorderedColorList,
      sectionLabels: action.payload.colorLabels,
      colorMap
    },
    layouts,
    status: {
      ...state.status,
      activeRequest: false,
      error: false,
      loading: false,
      requestComplete: true
    }
  }

  // if we have a structure...
  if (hasSections) {
    // ... and if we have a section to initialize with...
    if (initSection) {
      // ... then see if we can match our init section within structure
      const foundSection = getSectionByName(structure, initSection)

      // if we have a match for our init section...
      if (foundSection) {
        // get this section's families
        const sectionFamilies = foundSection.families

        // we now know that we do not need to use default section since we have an init match
        useDefault = false

        // if we have an init color...
        if (initColor) {
          // ... locate it in colorMap
          const foundColor = colorMap[initColor]

          // if it doesn't exist...
          if (!foundColor) {
            console.warn('Desired color not found in section.')
            return getErrorState(state)
          }

          // get all color families for matched init color
          const colorFamilies = foundColor.colorFamilyNames
          // get all families that match this section as well as this color
          const possibleFamilies = intersection(colorFamilies, sectionFamilies)

          // if we DO NOT have families that match both the selected section and color...
          if (possibleFamilies.length === 0) {
            console.warn('Desired color\'s family not found in section.')
            return getErrorState(state)
          }

          // if we have an initial family specified but it isn't within the families we matched above...
          if (initFam && !getFamilyByName(possibleFamilies, initFam)) {
            console.warn('Desired familiy and desired color not associated with each other.')
            return getErrorState(state)
          }
        } else if (initFam && !getFamilyByName(sectionFamilies, initFam)) {
          // if we only have an init family and it does not occur in the selected section's families...
          console.warn('Desired family not found in section.')
          return getErrorState(state)
        }

        const layoutSection = layouts.filter(l => l.name === foundSection.name)[0]
        const newLayout = initFam && layoutSection.families ? at(layoutSection.families.filter(l => l.name === initFam)[0], 'layout')[0] : at(layoutSection, 'layout')[0]

        // populate our new state with section, family, and active color wall color (if we found them)
        newState = {
          ...newState,
          layout: newLayout,
          structure: structure,
          sections: sectionNames,
          section: foundSection.name,
          families: sectionFamilies,
          family: initFam || void (0),
          colorWallActive: initColor ? colorMap[initColor] : void (0)
        }
      }
    }

    // if useDefault has not been set to false above, and we have a default section...
    if (useDefault && defaultSection) {
      const layoutSection = layouts.filter(l => l.name === defaultSection.name)[0]
      const newLayout = at(layoutSection, 'layout')[0]

      // ... then populate newState with our default section's name and families
      newState = {
        ...newState,
        layout: newLayout,
        structure: structure,
        sections: sectionNames,
        section: defaultSection.name,
        families: defaultSection.families
      }
    }
  } else {
    // if we have no structure then we cannot proceed -- all colors must exist in a section
    console.warn('No color sections available.')
    return getErrorState(state)
  }

  return newState
}

export function doFilterBySection (state: ColorsState, action: ReduxAction) {
  const payloadSection = action.payload.section

  // if we're currently still loading data...
  if (state.status.loading) {
    // ... then stash our filtered section as an initializeWith param
    return {
      ...state,
      initializeWith: {
        ...state.initializeWith,
        section: kebabCase(payloadSection)
      }
    }
  }

  // if we have no payload section...
  if (!payloadSection) {
    // ... just get out and maintain state as-is
    return state
  }

  if (!compareKebabs(state.section, payloadSection)) {
    const { layouts = [], structure } = state
    const targetedSection = getSectionByName(structure, payloadSection)

    if (targetedSection && targetedSection.families) {
      const newLayout = layouts.filter(l => l.name === targetedSection.name)[0].layout

      return {
        ...state,
        family: initialState.family, // reset family when section changes
        families: targetedSection.families,
        section: targetedSection.name,
        layout: newLayout,
        // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
        initializeWith: {
          ...state.initializeWith,
          section: initialState.initializeWith.section
        },
        colorWallActive: initialState.colorWallActive
      }
    } else {
      return getErrorState(state)
    }
  }
}

export function doMakeActiveColor (state: ColorsState, action: ReduxAction) {
  const { color } = action.payload

  if (!color || !color.id) {
    return state
  }

  // if we're still loading but somehow we have a color object with an ID...
  if (state.status.loading) {
    // ... set it as a seeking color value
    return {
      ...state,
      initializeWith: {
        ...state.initializeWith,
        colorWallActive: color.id
      }
    }
  }

  // if we have a selected family AND this color exists in that family, OR we have NO selected family...
  if ((state.family && getFamilyByName(color.colorFamilyNames, state.family)) || !state.family) {
    // ... then activate this color
    return {
      ...state,
      colorWallActive: action.payload.color,
      initializeWith: {
        ...state.initializeWith,
        colorWallActive: initialState.initializeWith.colorWallActive
      }
    }
  } else {
    return getErrorState(state)
  }
}

export function doMakeActiveColorById (state: ColorsState, action: ReduxAction) {
  // if we're currently still loading data...
  if (state.status.loading) {
    // ... then stash our active color as an initializeWith param
    return {
      ...state,
      initializeWith: {
        ...state.initializeWith,
        colorWallActive: action.payload.id
      }
    }
  } else if (state.items.colorMap) {
    const foundColor = state.items.colorMap[action.payload.id]

    if (foundColor) {
      // if we have a selected family AND this color exists in that family, OR we have NO selected family...
      if ((state.family && getFamilyByName(foundColor.colorFamilyNames, state.family)) || !state.family) {
        // ... then activate this color
        return {
          ...state,
          colorWallActive: foundColor,
          initializeWith: {
            ...state.initializeWith,
            colorWallActive: initialState.initializeWith.colorWallActive
          }
        }
      }
    }
  }

  return getErrorState(state)
}

export function doFilterByFamily (state: ColorsState, action: ReduxAction) {
  const payloadFamily = action.payload.family

  // if we're currently still loading data...
  if (state.status.loading) {
    // ... then stash our filtered family as an initializeWith param
    return {
      ...state,
      initializeWith: {
        ...state.initializeWith,
        family: kebabCase(payloadFamily)
      }
    }
  }

  if (!compareKebabs(state.family, payloadFamily)) {
    const { families, section, layouts = [] } = state
    const targetedFam = getFamilyByName(families, payloadFamily)

    // if we have a match for provided family in possible families, OR if we have NO provided family...
    if (targetedFam || !payloadFamily) {
      // update family and reset colorWallActive
      const layoutSection = layouts.filter(l => l.name === section)[0]
      const newLayout = targetedFam && layoutSection.families ? at(layoutSection.families.filter(l => l.name === targetedFam)[0], 'layout')[0] : at(layoutSection, 'layout')[0]

      return {
        ...state,
        family: targetedFam || void (0),
        layout: newLayout,
        // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
        initializeWith: {
          ...state.initializeWith,
          family: initialState.initializeWith.family
        },
        colorWallActive: initialState.colorWallActive
      }
    } else {
      return getErrorState(state)
    }
  }
}

export function getFamilyByName (families: string[] = [], name: string) {
  return find(families, (family: string) => {
    return compareKebabs(family, name)
  })
}

export function getSectionByName (sections: Section[] = [], name: string) {
  return find(sections, (section: Section) => {
    return compareKebabs(section.name, name)
  })
}

// -----------------------------------------------------
// STRUCTURE (GRID) ANALYSIS AND AUGMENTATION
// -----------------------------------------------------
/**
   * @description analyzes a grid structure to determine how many chunks are needed and how wide the chunks should be to make even columns
   * @param {string[][][][]} structure a 4D structure of color IDs
   */
function findIdealStructure (structure) {
  const colReducer = (prev, next) => {
    if (prev) {
      if (prev && next) {
        if (next.length >= prev.length && sum(next) >= sum(prev)) {
          return next
        }
      }
      return prev
    }
    return next
  }

  return structure.map(chunkRow => chunkRow.map(row => row.map(chunkCol => chunkCol.length)).reduce(colReducer)).reduce(colReducer)
}

/**
   * @description ensures all rows in a structure are filled with data to produce a squared grid, even if that data is undefined
   * @param {string[][][][]} structure a 4D structure of color IDs
   */
function maximizeAllShortRows (structure) {
  const ideal = findIdealStructure(structure)

  return structure.map(chunkRow => chunkRow.map(row => ideal.map((chunkLength, i) => {
    const chunk = row[i]

    if (chunk) {
      // check length
      return [
        ...chunk,
        ...Array.from(Array(chunkLength - chunk.length))
      ]
    }

    // if there's no chunk, create a new one and fill it with undefineds
    return Array.from(Array(chunkLength))
  })))
}

// -----------------------------------------------------
// END STRUCTURE (GRID) ANALYSIS AND AUGMENTATION
// -----------------------------------------------------
