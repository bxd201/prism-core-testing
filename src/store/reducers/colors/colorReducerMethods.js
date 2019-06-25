// @flow
import find from 'lodash/find'
import kebabCase from 'lodash/kebabCase'
import intersection from 'lodash/intersection'

import { convertUnorderedColorsToColorMap, convertUnorderedColorsToClasses } from '../../../shared/helpers/ColorDataUtils'
import { compareKebabs } from '../../../shared/helpers/StringUtils'

import { type ColorsState, type ReduxAction, type Section } from '../../../shared/types/Actions'
import type { Color } from '../../../shared/types/Colors'

export const initialState: ColorsState = {
  status: {
    loading: true,
    error: false,
    activeRequest: false
  },
  items: {},

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

export function getErrorState (state: ColorsState) {
  // TODO: this is too generic; we need a way to specify other kinds of errors
  return {
    ...state,
    status: {
      loading: false,
      error: true,
      activeRequest: false
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

  let useDefault = true // this will be toggled to false if initSection/family/color can be found

  // newState will be modified in the below conditions depending what section/family/color matches we find
  let newState = {
    ...state,
    items: {
      colors: action.payload.colors,
      brights: action.payload.brights,
      unorderedColors: unorderedColorList,
      colorMap
    },
    status: {
      ...state.status,
      loading: action.payload.loading,
      activeRequest: action.payload.activeRequest
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

        // populate our new state with section, family, and active color wall color (if we found them)
        newState = {
          ...newState,
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
      // ... then populate newState with our default section's name and families
      newState = {
        ...newState,
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

  if (!compareKebabs(state.section, payloadSection)) {
    const targetedSection = getSectionByName(state.structure, payloadSection)

    if (targetedSection && targetedSection.families) {
      return {
        ...state,
        family: initialState.family, // reset family when section changes
        families: targetedSection.families,
        section: targetedSection.name,
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
    const targetedFam = getFamilyByName(state.families, payloadFamily)

    // if we have a match for provided family in possible families, OR if we have NO provided family...
    if (targetedFam || !payloadFamily) {
      // update family and reset colorWallActive
      return {
        ...state,
        family: targetedFam || void (0),
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
