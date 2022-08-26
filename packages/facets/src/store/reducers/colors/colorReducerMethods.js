// @flow
import flatten from 'lodash/flatten'
import kebabCase from 'lodash/kebabCase'
import {
  convertUnorderedColorsToColorMap,
  convertUnorderedColorsToClasses
} from '../../../shared/helpers/ColorDataUtils'
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
  colorStatuses: {},
  items: {},
  layouts: void 0,
  unChunkedChunks: [],
  chunkGridParams: void 0,
  structure: [],
  sections: [],
  section: void 0,
  families: [],
  family: void 0,
  search: {
    results: void 0,
    loading: false,
    error: false,
    count: void 0,
    suggestions: void 0,
    query: '',
    active: false
  },
  initializeWith: {
    section: void 0,
    family: void 0
  },
  colorDetailsModal: {
    showing: false,
    color: undefined
  },
  cwv3: false, // TODO: eventually default this to true
  shapes: [],
  shape: void 0,
  groups: [],
  group: void 0,
  subgroups: [],
  subgroup: void 0
}

export function getErrorState(state: ColorsState, error?: any) {
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

export function doReceiveColors(
  state: ColorsState,
  {
    payload: {
      unorderedColors,
      colors,
      brights,
      sections = [],
      colorLabels,
      chunksLayout,
      wall,
      groups = null,
      subgroups = null,
      shapes = null
    }
  }: ReduxAction
): ColorsState {
  // adding toString methods to all Color objects
  const colorMap = convertUnorderedColorsToColorMap(convertUnorderedColorsToClasses(unorderedColors))
  const transpose = (matrix: any[][]): any[][] => matrix[0].map((_, col) => matrix.map((row) => row[col]))
  const primeColorWall = sections.find((section) => section.prime)
  const { cwv3 } = state

  // TODO: here, add a check to perform this logic only if we do not have group/subgroup/shape
  if (cwv3) {
    return groups.length
      ? {
          ...state,
          groups: groups,
          items: {
            colors,
            brights,
            unorderedColors: unorderedColors.map((c: Color) => c.id),
            sectionLabels: colorLabels,
            colorMap,
            chunksLayout,
            wall
          },
          layouts: [], // or null
          status: { ...state.status, activeRequest: false, error: false, loading: false, requestComplete: true },
          structure: [], // or null
          sections: [], // or null
          sectionsShortLabel: [], // or null
          shapes: shapes,
          subgroups: subgroups,
          primeColorWall: groups.filter(({ prime }) => prime)[0]?.name,
          unorderedColors
          // TODO: what to do with structure?
        }
      : getErrorState(state)
  } else {
    return sections.length
      ? {
          ...state,
          items: {
            colors,
            brights,
            unorderedColors: unorderedColors.map((c: Color) => c.id),
            sectionLabels: colorLabels,
            colorMap,
            chunksLayout,
            wall
          },
          layouts: sections.map(({ name, families, chunkGridParams }) => {
            const unChunkedChunks =
              chunkGridParams.familiesDetermineLayout || !colors[name]
                ? [
                    // bright chunks go first
                    ...families.flatMap((family: string): string[] => brights[family]),
                    // normal chunks go next but transposed so that each family will be in it's own column
                    ...flatten(transpose(families.map((family: string): string[] => colors[family])))
                  ]
                : colors[name]

            return {
              name,
              unChunkedChunks,
              chunkGridParams,
              families: families.map((family) => ({
                name: family,
                unChunkedChunks: chunkGridParams.familiesDetermineLayout
                  ? [...(brights[family] ?? [[]]), ...(colors[family] ?? [[]])]
                  : colors[family],
                chunkGridParams: chunkGridParams.familiesDetermineLayout
                  ? { gridWidth: 3, chunkWidth: 7, firstRowLength: 1, wrappingEnabled: false }
                  : { ...chunkGridParams, wrappingEnabled: false }
              }))
            }
          }),
          status: { ...state.status, activeRequest: false, error: false, loading: false, requestComplete: true },
          structure: sections,
          sections: sections.map((section) => section.name),
          sectionsShortLabel:
            sections.filter(({ shortName }) => shortName).length > 0
              ? sections.reduce((accum, { name, shortName }) => ({ ...accum, [name]: shortName }), {})
              : undefined,
          primeColorWall: primeColorWall && primeColorWall.name,
          unorderedColors
        }
      : getErrorState(state)
  }
}

// TODO: make this work with groups when cwv3
export function doFilterBySection(state: ColorsState, action: ReduxAction) {
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
    const { layouts = [], structure: sections = [], groups = [], subgroups = [], cwv3, shapes = [] } = state
    const targetedSection = cwv3
      ? groups.find(({ name }) => compareKebabs(name, payloadSection))
      : sections.find((section) => compareKebabs(section.name, payloadSection))

    if (!cwv3 && targetedSection && targetedSection.families) {
      const { unChunkedChunks, chunkGridParams } = layouts.filter((l) => l.name === targetedSection.name)[0]

      return {
        ...state,
        family: initialState.family, // reset family when section changes
        families: targetedSection.families,
        section: targetedSection.name,
        unChunkedChunks,
        chunkGridParams,
        shape: null,
        // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
        initializeWith: { ...state.initializeWith, section: initialState.initializeWith.section }
      }
    } else if (cwv3 && targetedSection && targetedSection.subgroups) {
      return {
        ...state,
        family: initialState.family, // reset family when section changes
        families: targetedSection.subgroups
          .map((id) => subgroups.find((group) => group.id === id)?.name)
          .filter(Boolean),
        section: targetedSection.name,
        group: targetedSection,
        unChunkedChunks: null,
        chunkGridParams: null,
        shape: shapes.find(({ id }) => id === targetedSection.shapeId),
        // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
        initializeWith: { ...state.initializeWith, section: initialState.initializeWith.section }
      }
    } else {
      return getErrorState(state)
    }
  }
}

// TODO: make this work with subgroups when cwv3
export function doFilterByFamily(state: ColorsState, action: ReduxAction) {
  const payloadFamily = action.payload.family

  // if we're currently still loading data...
  if (state.status.loading) {
    // ... then stash our filtered family as an initializeWith param
    return {
      ...state,
      initializeWith: {
        ...state.initializeWith,
        family: kebabCase(payloadFamily),
        shape: initialState.shape
      }
    }
  }

  if (!compareKebabs(state.family, payloadFamily)) {
    const { layouts = [], families = [], section, subgroups = [], group, cwv3, shapes = [] } = state
    const targetedFamName = families.find((fam) => compareKebabs(fam, payloadFamily))

    if (!cwv3) {
      if (targetedFamName || !payloadFamily) {
        // LEGACY COLOR WALL V3
        const layoutSection = layouts.filter((l) => l.name === section)[0]
        const { unChunkedChunks, chunkGridParams } =
          layoutSection.families.find(({ name }) => name === targetedFamName) || layoutSection

        return {
          ...state,
          family: targetedFamName || void 0,
          shape: initialState.shape,
          unChunkedChunks,
          chunkGridParams,
          // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
          initializeWith: { ...state.initializeWith, family: initialState.initializeWith.family }
        }
      }
    } else if (cwv3) {
      if (targetedFamName || !payloadFamily) {
        const shapeId = targetedFamName
          ? subgroups.find(({ name }) => compareKebabs(name, targetedFamName))?.shapeId
          : group?.shapeId

        return {
          ...state,
          family: targetedFamName || void 0,
          shape: shapes.find(({ id }) => id === shapeId),
          unChunkedChunks: initialState.unChunkedChunks,
          chunkGridParams: initialState.chunkGridParams,
          // only reset the relevant initializeWith prop -- we may need to keep the others if initial filters are happening out of sync
          initializeWith: { ...state.initializeWith, family: initialState.initializeWith.family }
        }
      }
    }
  }
}
