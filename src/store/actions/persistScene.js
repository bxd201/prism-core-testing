// @flow
// Methods named "persists... save to the server
// Methods named save... save locally in memory or disk
import axios from 'axios'
import { separateColors } from '../../components/PaintScene/PaintSceneUtils'
import { RECEIVE_COLORS, mapColorDataToPayload, getColorsRequests, mapResponsesToColorData } from './loadColors'
import { getDataFromXML, imageDataToSurfacesXML, stringifyXML } from '../../shared/utils/legacyProfileFormatUtil'

export const SAVING_MASKS = 'SAVING_MASKS'
export const DELETE_SAVED_SCENE = 'DELETE_SAVED_SCENE'
export const LOADED_SAVED_SCENES_METADATA = 'LOADED_SAVED_SCENES_METADATA'
export const LOADING_SAVED_MASKS = 'LOADING_SAVED_MASKS'
export const ERROR_LOADING_SAVED_SCENES = 'ERROR_LOADING_SAVED_SCENES'
export const SELECTED_SAVED_SCENE = 'SELECTED_SAVED_SCENE'
export const SAVED_REGIONS_UNPICKLED = 'SAVED_REGIONS_UNPICKLED'

export const startSavingMasks = () => {
  return {
    type: SAVING_MASKS,
    payload: true
  }
}

export const createSceneXML = (imageData: Object[] | null, metaData: Object) => {
  return imageDataToSurfacesXML(imageData, metaData)
}

export const saveMasks = (colorList: Array<number[]>, imageData: Object, backgroundImageUrl: string, metaData: Object) => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVING_MASKS,
      payload: true
    })

    // @todo - Post this data -RS
    // eslint-disable-next-line no-unused-vars
    const imageUploadPayload = createImageUploadPayload(backgroundImageUrl)

    // The separated colors as an array of imageData items
    const imageDataList = imageData ? separateColors(colorList, imageData, 1.5) : null
    const sceneXML = createSceneXML(imageDataList, metaData)
    // save background image and use image name
    axios.get('/public/saved-background-image.txt').then(response => {
      // @todo implement...in a real way -RS
      // Add actual name of image to xml, this is built using the renderingBaseUrl returned from the image upload
      const realImageBaseName = response.data
      sceneXML.setAttribute('image', realImageBaseName)
      // @todo - IMPLEMENT, consume the XML!!! -RS
      // eslint-disable-next-line no-unused-vars
      const regionsXMLString = stringifyXML(sceneXML)
      // @todo this is here to give feedback until feature is completely implemented. -RS
      console.log(sceneXML)
      dispatch(doneSavingMask())
    }).catch(err => {
      console.log(`Error saving masks: ${err}`)
      dispatch(doneSavingMask())
    })
  }
}

export const doneSavingMask = () => {
  return {
    type: SAVING_MASKS,
    payload: false
  }
}

// @todo - is this a number or a string ? -RS
export const deleteSavedScene = (sceneId: number) => {
  // @todo - this should make an ajax call and resolve only if the server fulfills the request -RS
  return {
    type: DELETE_SAVED_SCENE,
    payload: sceneId
  }
}

const mapSceneResponseToCustomSceneRequests = (data: object[]) => {
  const requests = data
    .map(datum => {
      const rederingBaseUrl = datum.sceneDefinition.renderingBaseUrl
      // @todo - implement this when real endpoints are available -RS
      const url = rederingBaseUrl.split('/')

      return axios.get(`/public/${url[url.length - 1]}.json`)
    })

  return requests
}

export const loadSavedScenes = (brandId: string) => {
  return (dispatch, getState) => {
    dispatch({
      type: LOADING_SAVED_MASKS,
      payload: true
    })
    // @todo - implement this when real endpoints are available -RS
    const colorsHaveLoaded = checkColorsHaveLoaded(getState())
    axios.all(getInitialRequests(colorsHaveLoaded, brandId))
      .then(responses => {
        dispatch({
          type: LOADED_SAVED_SCENES_METADATA,
          payload: responses[0].data
        })

        const colorDataResponses = responses.slice(1, responses.length)
        let colorData = null

        if (colorsHaveLoaded) {
          const alreadyLoadedColorData = getState().colors
          colorData = alreadyLoadedColorData
        } else {
          colorData = mapResponsesToColorData(colorDataResponses)
        }

        dispatch({
          type: RECEIVE_COLORS,
          payload: mapColorDataToPayload(colorData)

        })

        return axios.all(mapSceneResponseToCustomSceneRequests(responses[0].data))
      }).then(responses => {
      // @todo - implement this when real endpoints are available -RS
        const { legacySavedScenesMetadata, colors } = getState()
        const sceneData = responses.map((response, i) => {
          return mungeRegionAndSceneData(response.data, legacySavedScenesMetadata[i], colors)
        })

        dispatch({
          type: SAVED_REGIONS_UNPICKLED,
          payload: sceneData
        })
      }).catch(err => {
        // @todo handle error -RS
        console.log(`Error getting saved scenes: ${err}`)
        dispatch({
          type: ERROR_LOADING_SAVED_SCENES,
          payload: null
        })
      })
  }
}

// @todo - is this a string or number? -RS
export const selectSavedScene = (sceneId: number | null) => {
  return {
    type: SELECTED_SAVED_SCENE,
    payload: sceneId
  }
}

const mungeRegionAndSceneData = (regionData: Object, sceneData: Object, colors: Object) => {
  const { name, id, sceneDefinition: { id: sceneDefinitionId, categoryId, renderingBaseUrl }, sceneColorPalette: { colorIds } } = sceneData
  const palette = colorIds.map((colorId) => {
    const colorPalette = getColorById(colorId, colors)

    return colorPalette
  })

  const { regionsXml: xml } = regionData
  const surfaceMasks = getDataFromXML(xml, sceneData, palette)

  return {
    surfaceMasks,
    palette,
    name,
    id,
    sceneDefinitionId,
    categoryId,
    renderingBaseUrl
  }
}

const getInitialRequests = (colorsHaveLoaded: boolean, brandId: string, options?: any) => {
  const requests = []
  const loginRequest = axios.get('/public/scene-painted.json')

  requests.push(loginRequest)

  if (!colorsHaveLoaded) {
    const colorsRequests = getColorsRequests(brandId, options)

    colorsRequests.forEach(req => requests.push(req))
  }

  return requests
}

const checkColorsHaveLoaded = (state: Object) => {
  let hasLoaded = false

  const colors = state.colors || {}
  const items = colors.items || {}

  hasLoaded = !!items.colorMap

  return hasLoaded
}

const getColorById = (colorId: number, colors: Object) => {
  const { items: { colorMap } = {} } = colors

  return colorMap[`${colorId}`]
}

const createImageUploadPayload = (imageDataUrl: string) => {
  return JSON.stringify({ 'image': imageDataUrl.split(',')[1] })
}
