// @flow
import chunk from 'lodash/chunk'
import flattenDeep from 'lodash/flattenDeep'
import flatten from 'lodash/flatten'
import kebabCase from 'lodash/kebabCase'
import sortBy from 'lodash/sortBy'
import { convertUnorderedColorsToColorMap, convertUnorderedColorsToClasses } from '../../../shared/helpers/ColorDataUtils'
import { compareKebabs } from '../../../shared/helpers/StringUtils'
import { type ColorsState, type ReduxAction } from '../../../shared/types/Actions.js.flow'
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
  unChunkedChunks: [],
  chunkGridParams: { gridWidth: 7 },
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
  initializeWith: {
    section: void (0),
    family: void (0)
  },
  colorDetailsModal: {
    showing: false,
    color: undefined
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

export function doReceiveColors (state: ColorsState, { payload: { unorderedColors, colors, brights, sections = [], colorLabels } }: ReduxAction): ColorsState {
  // adding toString methods to all Color objects
  const colorMap = convertUnorderedColorsToColorMap(convertUnorderedColorsToClasses(unorderedColors))
  const transpose = (matrix: any[][]): any[][] => matrix[0].map((_, col) => matrix.map(row => row[col]))

  // convert the 4 timeless color chunks recieved by the API to be 8 chunks
  colors['Timeless Color'] = chunk(sortBy(flattenDeep(colors['Timeless Color']), id => colorMap[id].storeStripLocator), 21)

  const primeColorWall = sections.find(section => section.prime)

  return sections.length
    ? {
      ...state,
      items: { colors, brights, unorderedColors: unorderedColors.map((c: Color) => c.id), sectionLabels: colorLabels, colorMap },
      layouts: sections.map(({ name, families, chunkGridParams }) => ({
        name,
        unChunkedChunks: [
          // bright chunks go first
          ...families.flatMap((family: string): string[] => brights[family]),
          // normal chunks go next but transposed so that each family will be in it's own column
          ...flatten(transpose(families.map((family: string): string[] => colors[family])))
        ],
        chunkGridParams,
        families: families.map(family => ({
          name: family,
          unChunkedChunks: [...brights[family], ...colors[family]],
          chunkGridParams: { gridWidth: 3, chunkWidth: 7, firstRowLength: 1, wrappingEnabled: true }
        }))
      })),
      status: { ...state.status, activeRequest: false, error: false, loading: false, requestComplete: true },
      structure: sections,
      sections: sections.map(section => section.name),
      primeColorWall: primeColorWall && primeColorWall.name
    }
    : getErrorState(state)
}

export function doFilterBySection (state: ColorsState, action: ReduxAction) {
  const payloadSection = action.payload.section

  // if we're currently still loading data...
  if (state.status.loading) {
    // ... then stash our filtered section as an initializeWith param
    return {
      ...state,
      initializeWith: { ...state.initializeWith, section: kebabCase(payloadSection) }
    }
  }

  // if we have no payload section...
  if (!payloadSection) {
    // ... just get out and maintain state as-is
    return state
  }

  if (!compareKebabs(state.section, payloadSection)) {
    const { layouts = [], structure: sections = [] } = state
    const targetedSection = sections.find(section => compareKebabs(section.name, payloadSection))

    if (targetedSection && targetedSection.families) {
      const { unChunkedChunks, chunkGridParams } = layouts.filter(l => l.name === targetedSection.name)[0]

      return {
        ...state,
        family: initialState.family, // reset family when section changes
        families: targetedSection.families,
        section: targetedSection.name,
        unChunkedChunks,
        chunkGridParams,
        // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
        initializeWith: { ...state.initializeWith, section: initialState.initializeWith.section }
      }
    } else {
      return getErrorState(state)
    }
  }
}

export function doFilterByFamily (state: ColorsState, action: { payload: { family: ?string }}) {
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
    const { families = [], section, layouts = [] } = state
    const targetedFam = families.find(fam => compareKebabs(fam, payloadFamily))

    if (targetedFam || !payloadFamily) {
      const layoutSection = layouts.filter(l => l.name === section)[0]
      const { unChunkedChunks, chunkGridParams } = layoutSection.families.find(({ name }) => name === targetedFam) || layoutSection

      return {
        ...state,
        family: targetedFam || void (0),
        unChunkedChunks,
        chunkGridParams,
        // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
        initializeWith: { ...state.initializeWith, family: initialState.initializeWith.family }
      }
    } else {
      return getErrorState(state)
    }
  }
}
