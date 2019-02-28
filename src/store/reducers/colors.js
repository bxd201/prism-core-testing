// @flow
import find from 'lodash/find'
import kebabCase from 'lodash/kebabCase'
import includes from 'lodash/includes'

import { REQUEST_COLORS, RECEIVE_COLORS, FILTER_BY_FAMILY, MAKE_ACTIVE_COLOR, RESET_ACTIVE_COLOR, FILTER_BY_SECTION, REMOVE_COLOR_FILTERS, MAKE_ACTIVE_COLOR_BY_ID, LOAD_ERROR } from '../actions/loadColors'
import { REQUEST_SEARCH_RESULTS, RECEIVE_SEARCH_RESULTS } from '../actions/loadSearchResults'
import { convertToColorMap } from '../../shared/helpers/ColorDataUtils'
import { compareKebabs } from '../../shared/helpers/StringUtils'
import type { ReduxAction, ColorsState, Section } from '../../shared/types/Actions'

export const initialState: ColorsState = {
  status: {
    loading: true,
    error: false,
    activeRequest: false
  },
  items: {},
  family: {},
  searchResults: [],
  colorWallActive: void (0),
  seekingColorWallActive: void (0)
}

export const colors = (state: ColorsState = initialState, action: ReduxAction) => {
  switch (action.type) {
    case LOAD_ERROR:
      return Object.assign({}, state, {
        status: {
          loading: false,
          error: true,
          activeRequest: false
        }
      })

    case RESET_ACTIVE_COLOR:
      return Object.assign({}, state, {
        colorWallActive: initialState.colorWallActive,
        seekingColorWallActive: initialState.seekingColorWallActive
      })

    case MAKE_ACTIVE_COLOR:
      const { color } = action.payload

      // if we're still loading but somehow we have a color object with an ID...
      if (state.status.loading && color && color.id) {
        // ... set it as a seeking color value
        return Object.assign({}, state, {
          seekingColorWallActive: color.id
        })
      }

      if (color && color.id) {
        // if we have a selected family AND this color exists in that family, OR we have NO selected family...
        if ((state.family.family && includes(color.colorFamilyNames, state.family.family)) || !state.family.family) {
          // ... then activate this color
          return Object.assign({}, state, {
            colorWallActive: action.payload.color,
            seekingColorWallActive: initialState.seekingColorWallActive
          })
        }
      }

      break

    case MAKE_ACTIVE_COLOR_BY_ID:
      if (state.status.loading) {
        return Object.assign({}, state, {
          seekingColorWallActive: action.payload.id
        })
      } else if (state.items.colorMap) {
        const foundColor = state.items.colorMap[action.payload.id]

        if (foundColor) {
          // if we have a selected family AND this color exists in that family, OR we have NO selected family...
          if ((state.family.family && includes(foundColor.colorFamilyNames, state.family.family)) || !state.family.family) {
            // ... then activate this color
            return Object.assign({}, state, {
              colorWallActive: foundColor,
              seekingColorWallActive: initialState.seekingColorWallActive
            })
          }
        }
      }

      break

    case REQUEST_COLORS:
      return Object.assign({}, state, {
        status: action.payload
      })

    case RECEIVE_COLORS:
      let newState: ColorsState = Object.assign({}, state, {
        items: {
          colors: action.payload.colors,
          brights: action.payload.brights,
          colorMap: Object.assign({}, convertToColorMap(action.payload.colors), convertToColorMap(action.payload.brights))
        },
        status: Object.assign(state.status, {
          loading: action.payload.loading,
          activeRequest: action.payload.activeRequest
        })
      })

      if (action.payload.sections && action.payload.sections.length) {
        newState.family = Object.assign({}, state.family, {
          sections: action.payload.sections.map((section: Section) => {
            return section.name
          }),
          structure: action.payload.sections
        })

        const defaultSection = find(newState.family.structure, { default: true })

        if (newState.family.seekingSection || defaultSection) {
          const foundSection = find(newState.family.structure, (section: Section) => {
            return compareKebabs(section.name, newState.family.seekingSection)
          }) || defaultSection

          // if we actually have a section match...
          if (foundSection) {
            Object.assign(newState.family, {
              families: foundSection.families,
              section: foundSection.name
            })

            if (newState.family.seekingFamily) {
              const foundFamily = find(newState.family.families, (family: string) => {
                return compareKebabs(family, newState.family.seekingFamily)
              })

              if (foundFamily) {
                Object.assign(newState.family, {
                  family: foundFamily
                })

                if (newState.seekingColorWallActive && newState.items.colorMap) {
                  const foundColor = newState.items.colorMap[newState.seekingColorWallActive]

                  // if we found a color match AT ALL and its associated color family names include our foundFamily...
                  if (foundColor && foundColor.colorFamilyNames && includes(foundColor.colorFamilyNames, foundFamily)) {
                    // ... then this color is a match
                    Object.assign(newState, {
                      colorWallActive: foundColor,
                      seekingColorWallActive: initialState.seekingColorWallActive
                    })
                  } else {
                    delete newState.seekingColorWallActive
                    delete newState.colorWallActive
                  }
                }
              } else {
                delete newState.colorWallActive
                delete newState.seekingColorWallActive
                delete newState.family.seekingFamily
                delete newState.family.family
              }
            } else if (newState.seekingColorWallActive && newState.items.colorMap) {
              const foundColor = newState.items.colorMap[newState.seekingColorWallActive]

              // if we found a color match AT ALL and its associated color family names include our foundFamily...
              if (foundColor) {
                // ... then this color is a match
                Object.assign(newState, {
                  colorWallActive: foundColor,
                  seekingColorWallActive: initialState.seekingColorWallActive
                })
              } else {
                delete newState.seekingColorWallActive
                delete newState.colorWallActive
              }
            }
          } else {
            // otherwise let's clear out seekingSection and section I guess?
            delete newState.colorWallActive
            delete newState.seekingColorWallActive
            delete newState.family.seekingFamily
            delete newState.family.families
            delete newState.family.seekingSection
            delete newState.family.section
          }
        }
      }

      return newState

    case REMOVE_COLOR_FILTERS:
      return Object.assign({}, state, {
        family: Object.assign({}, state.family, {
          family: void (0),
          families: void (0),
          section: void (0)
        }),
        colorWallActive: initialState.colorWallActive
      })

    case FILTER_BY_FAMILY:
      const payloadFamily = action.payload.family

      if (state.status.loading) {
        return Object.assign({}, state, {
          family: Object.assign({}, state.family, {
            seekingFamily: kebabCase(payloadFamily)
          })
        })
      }

      if (!compareKebabs(state.family.family, payloadFamily)) {
        // TODO: Going to need to store filtered family and section temporarily in the event that we have not yet loaded colors...
        return Object.assign({}, state, {
          family: Object.assign({}, state.family, {
            family: find(state.family.families, (familyName: string) => {
              return compareKebabs(payloadFamily, familyName)
            }),
            seekingFamily: initialState.family.seekingFamily
          }),
          colorWallActive: initialState.colorWallActive
        })
      }

      break

    case FILTER_BY_SECTION:
      const payloadSection = action.payload.section

      if (state.status.loading) {
        return Object.assign({}, state, {
          family: Object.assign({}, state.family, {
            seekingSection: kebabCase(payloadSection)
          })
        })
      }

      if (!compareKebabs(state.family.section, payloadSection)) {
        // TODO: Going to need to store filtered family and section temporarily in the event that we have not yet loaded colors...
        const targetedSection = find(state.family.structure, (section: Section) => {
          return compareKebabs(payloadSection, section.name)
        })

        if (targetedSection && targetedSection.families) {
          return Object.assign({}, state, {
            family: Object.assign({}, state.family, {
              family: void (0), // reset family when section changes
              families: targetedSection.families,
              section: targetedSection.name,
              seekingSection: initialState.family.seekingSection
            }),
            colorWallActive: initialState.colorWallActive
          })
        }
      }

      break

    case REQUEST_SEARCH_RESULTS:
      return Object.assign({}, state, {
        status: action.payload.status
      })

    case RECEIVE_SEARCH_RESULTS:
      return ({
        ...state,
        searchResults: action.payload.results,
        status: {
          ...state.status,
          loading: action.payload.loading
        }
      })
  }

  return state
}
