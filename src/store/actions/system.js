// @flow
export const MAX_SCENE_HEIGHT = 'MAX_SCENE_HEIGHT'
export const setMaxSceneHeight = (height: number) => {
  return {
    type: MAX_SCENE_HEIGHT,
    payload: height
  }
}

export const SET_INITIALIZING_FACET_ID = 'SET_INITIALIZING_FACET_ID'
export const setInitializingFacetId = (facetId: string | null = null) => {
  return {
    type: SET_INITIALIZING_FACET_ID,
    payload: facetId
  }
}
