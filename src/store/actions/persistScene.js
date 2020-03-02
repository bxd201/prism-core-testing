// @flow
// Methods named "persists... save to the server
// Methods named save... save locally in memory or disk
import axios from 'axios'
import { separateColors } from '../../components/PaintScene/PaintSceneUtils'
import { RECEIVE_COLORS, mapColorDataToPayload, getColorsRequests, mapResponsesToColorData } from './loadColors'
import {
  getDataFromFirebaseXML,
  getDataFromXML,
  imageDataToSurfacesXML,
  stringifyXML
} from '../../shared/utils/legacyProfileFormatUtil'
import { anonLogin } from './user'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'

export const SAVING_MASKS = 'SAVING_MASKS'
export const SAVED_SCENE_LOCAL = 'SAVED_SCENE_LOCAL'
export const DELETE_ANON_SAVED_SCENE = 'DELETE_ANON_SAVED_SCENE'
export const DELETE_SAVED_SCENE = 'DELETE_SAVED_SCENE'
export const LOADED_SAVED_SCENES_METADATA = 'LOADED_SAVED_SCENES_METADATA'
export const LOADING_SAVED_MASKS = 'LOADING_SAVED_MASKS'
export const ERROR_LOADING_SAVED_SCENES = 'ERROR_LOADING_SAVED_SCENES'
export const SELECTED_SAVED_SCENE = 'SELECTED_SAVED_SCENE'
export const SAVED_REGIONS_UNPICKLED = 'SAVED_REGIONS_UNPICKLED'
export const CACHED_SCENE_DATA = 'CACHED_SCENE_DATA'
export const ERROR_DOWNLOADING_SAVED_DATA = 'ERROR_DOWNLOADING_SAVED_DATA'
export const WAITING_TO_FETCH_SAVED_SCENE = 'WAITING_TO_FETCH_SAVED_SCENE'
export const ERROR_DELETING_ANON_SCENE = 'ERROR_DELETING_ANON_SCENE'
export const SHOW_SAVE_SCENE_MODAL = 'SHOW_SAVE_SCENE_MODAL'
export const RESET_SAVE_STATE = 'RESET_SAVE_STATE'
export const UPDATE_ANON_SAVED_SCENE_NAME = 'UPDATE_ANON_SAVED_SCENE_NAME'
export const ERROR_UPDATING_ANON_SAVED_SCENE_NAME = 'ERROR_UPDATING_ANON_SAVED_SCENE_NAME'
export const UPDATE_SAVED_SCENE_NAME = 'UPDATE_SAVED_SCENE_NAME'
export const ERROR_UPDATING_SAVED_SCENE_NAME = 'ERROR_UPDATING_SAVED_SCENE_NAME'
// File name consts
const SCENE_JSON = 'scene.json'

const SCENE_TYPE = {
  custom: 'custom',
  stock: 'stock',
  anonCustom: 'anon-custom',
  anonStock: 'anon-stock'
}

export const startSavingMasks = (sceneName: string) => {
  return {
    type: SAVING_MASKS,
    payload: true,
    sceneName
  }
}

export const createSceneXML = (imageData: Object[] | null, metaData: Object) => {
  return imageDataToSurfacesXML(imageData, metaData)
}

export const saveMasks = (colorList: Array<number[]>, imageData: Object, backgroundImageUrl: string, metadata: Object) => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVING_MASKS,
      payload: true
    })

    // The separated colors as an array of imageData items
    const imageDataList = imageData ? separateColors(colorList, imageData, 1.5) : null
    const sceneXML = createSceneXML(imageDataList, metadata)
    // @todo needed for my sherwin persist, this is a usage reminder -RS
    // const imageUploadPayload = createImageUploadPayload(backgroundImageUrl, metadata.uniqueId)
    if (FIREBASE_AUTH_ENABLED) {
      persistSceneToFirebase(backgroundImageUrl, sceneXML, metadata.colors, metadata.uniqueId, metadata.description, dispatch)
      return
    }
    // @todo REVIEW not sure color info is persisted in current code -RS
    persistSceneToMySherwin(dispatch, backgroundImageUrl, sceneXML)
  }
}

export const doneSavingMask = (data: Object) => {
  return {
    type: SAVING_MASKS,
    payload: false,
    data
  }
}

export const deleteSavedScene = (sceneId: number | string) => {
  return (dispatch, getState) => {
    if (FIREBASE_AUTH_ENABLED) {
      const user = firebase.auth().currentUser
      if (user) {
        const storageRef = firebase.storage().ref()
        const sceneRef = storageRef.child(`/scenes/${user.uid}/${sceneId}-${SCENE_JSON}`)
        sceneRef.delete().then(() => {
          dispatch({
            type: DELETE_ANON_SAVED_SCENE,
            payload: sceneId
          })
        }).catch(error => {
          // @todo - handle error -RS
          console.log('Error deleting anonymous scene:', error)
          dispatch({
            type: ERROR_DELETING_ANON_SCENE
          })
        })
      }
    } else {
      // @todo - this should make an ajax call and resolve only if the server fulfills the request -RS
      dispatch({
        type: DELETE_SAVED_SCENE,
        payload: sceneId
      })
    }
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

    if (FIREBASE_AUTH_ENABLED) {
      loadSavedSceneFromFirebase(brandId, dispatch, getState)
    } else {
      loadSavedScenesFromMySherwin(brandId, dispatch, getState)
    }
  }
}

export const loadSavedSceneFromFirebase = (brandId: string, dispatch: Function, getState: Function) => {
  const user = firebase.auth().currentUser
  const colorsHaveLoaded = checkColorsHaveLoaded(getState())

  if (colorsHaveLoaded) {
    getSavedScenesFromFirebase(!!user, dispatch, getState)
  } else {
    const colorsRequests = getColorsRequests(brandId)

    Promise.all(colorsRequests).then(responses => {
      const colorData = mapResponsesToColorData(responses)

      dispatch({
        type: RECEIVE_COLORS,
        payload: mapColorDataToPayload(colorData)
      })

      getSavedScenesFromFirebase(!!user, dispatch, getState)
    }).catch(err => {
      // @todo - handle error -RS
      console.log('Error fetching colors:', err)
    })
  }
}

const getSavedScenesFromFirebase = (isLoggedIn: boolean, dispatch, getState) => {
  if (isLoggedIn) {
    const { user, sceneMetadata } = getState()
    const firebaseFileIds = sceneMetadata.filter(item => item.type === SCENE_TYPE.anonCustom)
    if (firebaseFileIds.length) {
      const metadata = getMatchingScenesForFirebase(user.uid, firebaseFileIds)
      fetchSavedScenesFromFirebase(metadata, dispatch, getState)
    } else {
    // There are no items saved
      dispatch({
        type: LOADING_SAVED_MASKS,
        payload: false
      })
    }
  } else {
    dispatch(setWaitingToFetchSavedScene(true))
    anonLogin()
  }
}

export const loadSavedScenesFromMySherwin = (brandId: string, dispatch: Function, getState: Function) => {
  // @todo - implement this when real endpoints are available -RS
  const colorsHaveLoaded = checkColorsHaveLoaded(getState())
  axios.all(getInitialRequestsForMySherwin(colorsHaveLoaded, brandId))
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

export const selectSavedScene = (sceneId: number | string | null) => {
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

// This is firebase equivalent  of mungeRegionAndSceneData
const processFileFromFirebase = (file: Object, i: number, storageRef: Ref) => {
  const { regionsXml, uniqueSceneId, image, colors, name } = file

  let nameFromCustomMetaData = name
  const user = firebase.auth().currentUser
  const sceneRef = storageRef.child(`/scenes/${user.uid}/${uniqueSceneId}-${SCENE_JSON}`)
  // @todo - refactor code for updating name - Pravin
  sceneRef.getMetadata().then((metadata) => {
    if (metadata.customMetadata && metadata.customMetadata.name) nameFromCustomMetaData = metadata.customMetadata.name
  }).catch(error => console.log('error ', error))

  const surfaceMasks = getDataFromFirebaseXML(regionsXml, colors)
  const sceneDefinitionId = uniqueSceneId
  // This is here for consistency
  const categoryId = 0
  // This is here for consistency
  const id = sceneDefinitionId

  // Any changes to the returned object will likely need to be made in localSceneData
  return {
    surfaceMasks,
    palette: colors,
    name: nameFromCustomMetaData,
    id,
    sceneDefinitionId,
    categoryId,
    // The lack of this property duck types this as a payload from firebase
    renderingBaseUrl: null,
    // The existence of this prop too duck types this as a payload from firebase
    backgroundImageUrl: image,
    sceneType: SCENE_TYPE.anonCustom
  }
}

const getInitialRequestsForMySherwin = (colorsHaveLoaded: boolean, brandId: string, options?: any) => {
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

// @todo this may not be needed depending on how the API is designed, I'd like to get rid of it -RS
// eslint-disable-next-line no-unused-vars
const createImageUploadPayload = (imageDataUrl: string, uniqueSceneId: string) => {
  return JSON.stringify({ 'image': imageDataUrl.split(',')[1], uniqueSceneId })
}

// This method should only be used inside of the firebase.auth onchange method
export const tryToPersistCachedSceneData = () => {
  return (dispatch, getState) => {
    const { cachedSceneData: data } = getState()

    if (!data) {
      // This is here to prevent a theoretical edge case
      dispatch({
        type: SAVING_MASKS,
        payload: false
      })

      return
    }

    persistSceneToFirebase(data.background, data.sceneXml, data.colors, data.uniqueSceneId, data.description, dispatch)
  }
}

const persistSceneToFirebase = (backgroundImageData: string, sceneDataXml: any, colors: number[], uniqueSceneId: string, description: string, dispatch: Function) => {
  const user = firebase.auth().currentUser
  if (!user) {
    dispatch({
      type: CACHED_SCENE_DATA,
      payload: {
        background: backgroundImageData,
        sceneXml: sceneDataXml,
        colors,
        uniqueSceneId,
        name: description
      }
    })

    anonLogin()(dispatch)

    return
  }

  const { uid } = user
  const storageRef = firebase.storage().ref()
  const sceneRef = storageRef.child(`/scenes/${uid}/${uniqueSceneId}-${SCENE_JSON}`)
  sceneDataXml.setAttribute('image', 'background.jpg')
  const xmlString = stringifyXML(sceneDataXml)

  const sceneData = {
    regionsXml: xmlString,
    uniqueSceneId: uniqueSceneId,
    image: backgroundImageData,
    colors,
    name: description
  }

  const customMetaData = {
    customMetadata: {
      name: description
    }
  }

  const scenePromise = sceneRef.putString(window.JSON.stringify(sceneData), 'raw', customMetaData)

  scenePromise.then(response => {
    const sceneMetadata = { scene: response.metadata.fullPath, sceneType: SCENE_TYPE.anonCustom, type: SCENE_TYPE.anonCustom }
    dispatch(doneSavingMask(sceneMetadata))

    // This is expensive so we do it after we save the id, that way it appears faster
    // Any changes to the returned object will likely need to be made in processFileFromFirebase
    const localSceneData = {
      surfaceMasks: getDataFromFirebaseXML(xmlString, colors),
      palette: colors,
      name: description,
      id: uniqueSceneId,
      sceneDefinitionId: uniqueSceneId,
      categoryId: 0,
      // The lack of this property duck types this as a payload from firebase
      renderingBaseUrl: null,
      // The existence of this prop too duck types this as a payload from firebase
      backgroundImageUrl: backgroundImageData
    }

    dispatch({
      type: SAVED_SCENE_LOCAL,
      payload: localSceneData
    })
  }).catch(err => {
    // @todo Handle error
    console.log('Error saving scene to Firebase:', err)
    dispatch(doneSavingMask())
  })
}

const persistSceneToMySherwin = (dispatch, backgroundImageUrl: string, sceneDataXml: string) => {
  // @todo - Implement this
  // save background image and use image name
  axios.get('/public/saved-background-image.txt').then(response => {
    // @todo implement...in a real way -RS
    // Add actual name of image to xml, this is built using the renderingBaseUrl returned from the image upload
    const realImageBaseName = response.data
    sceneDataXml.setAttribute('image', realImageBaseName)
    // @todo - IMPLEMENT, consume the XML!!! -RS
    // eslint-disable-next-line no-unused-vars
    const regionsXMLString = stringifyXML(sceneDataXml)
  }).catch(err => {
    console.log(`Error saving masks: ${err}`)
    dispatch(doneSavingMask())
  })
}

const setWaitingToFetchSavedScene = (isWaiting: boolean) => {
  return {
    type: WAITING_TO_FETCH_SAVED_SCENE,
    payload: isWaiting
  }
}

export const tryToFetchSaveScenesFromFirebase = () => {
  return (dispatch: Function, getState: Function) => {
    const { user, isWaitingToFetchSavedScenes, sceneMetadata } = getState()
    if (isWaitingToFetchSavedScenes && sceneMetadata.length && user && user.uid) {
      // check to see if uid match local cloud scene metadata uid in path
      const metadata = getMatchingScenesForFirebase(user.uid, sceneMetadata)
      fetchSavedScenesFromFirebase(metadata, dispatch, getState)
    }
  }
}

const fetchSavedScenesFromFirebase = (metadata: Object[], dispatch: Function, getState: Function) => {
  if (metadata.length) {
    const downloadQueue = []
    const storageRef = firebase.storage().ref()

    metadata.forEach(item => {
      const sceneInfo = storageRef.child(item.scene).getDownloadURL()
      downloadQueue.push(sceneInfo)
    })
    // background and scene xml need to be keyed to each other to find in redux collections
    Promise.all(downloadQueue).then(downloadUrl => {
      downloadRemoteFiles(downloadUrl, dispatch, getState, storageRef)
    }).catch(err => {
      console.log('Error getting download URLs from the server:', err)
      dispatch(setWaitingToFetchSavedScene(false))
      // @todo handle error -RS
      dispatch({
        type: ERROR_DOWNLOADING_SAVED_DATA,
        payload: true
      })
    })
  } else {
    dispatch({
      action: LOADING_SAVED_MASKS,
      payload: false
    })
  }
}

const downloadRemoteFiles = (urls: string[], dispatch: Function, getState: Function, storageRef: Ref) => {
  const downloadPromises = urls.map(url => {
    return axios.get(url)
  })

  Promise.all(downloadPromises).then(responses => {
    const data = responses.map(response => response.data)
    const sceneData = processDownloadedFiles(data, dispatch, getState, storageRef)
    // @todo handle background images -RS

    dispatch({
      type: SAVED_REGIONS_UNPICKLED,
      payload: sceneData
    })
    dispatch(setWaitingToFetchSavedScene(false))
  }).catch(err => {
    console.log('Error downloading files from the server:', err)
    dispatch(setWaitingToFetchSavedScene(false))
    // @todo handle error -RS
    dispatch({
      type: ERROR_DOWNLOADING_SAVED_DATA,
      payload: true
    })
  })
}

const isSameUser = (uid: string, path: string) => {
  if (!uid || !path) {
    return false
  }

  return path.split('/').indexOf(uid) > -1
}

const getMatchingScenesForFirebase = (uid: string, files: Object[] = []) => {
  return files.filter(file => {
    return isSameUser(uid, file.scene)
  })
}

const processDownloadedFiles = (files: Object[], dispatch: Function, getState: Function, storageRef: Ref) => {
  const scenes = files.map((file, i) => {
    return processFileFromFirebase(file, i, storageRef)
  })

  return scenes
}

export const showSaveSceneModal = (shouldShow: boolean) => {
  return {
    type: SHOW_SAVE_SCENE_MODAL,
    payload: shouldShow
  }
}

export const resetSaveState = () => {
  return {
    type: RESET_SAVE_STATE
  }
}

export const updateSavedSceneName = (sceneId: number | string, updatedSceneName: string) => {
  return (dispatch, getState) => {
    if (FIREBASE_AUTH_ENABLED) {
      const user = firebase.auth().currentUser
      if (user) {
        const storageRef = firebase.storage().ref()
        const sceneRef = storageRef.child(`/scenes/${user.uid}/${sceneId}-${SCENE_JSON}`)
        const editedSceneCustomMetaData = {
          customMetadata: {
            name: updatedSceneName
          }
        }
        sceneRef.updateMetadata(editedSceneCustomMetaData).then((metadata) => {
          dispatch({
            type: UPDATE_ANON_SAVED_SCENE_NAME,
            payload: {
              id: sceneId,
              name: updatedSceneName
            }
          })
        }).catch(error => {
          // @todo - handle error
          console.log('Error updating anonymous scene name:', error)
          dispatch({
            type: ERROR_UPDATING_ANON_SAVED_SCENE_NAME
          })
        })
      }
    } else {
      // @todo - this should make an ajax call and resolve only if the server fulfills the request
      dispatch({
        type: UPDATE_SAVED_SCENE_NAME,
        payload: {
          id: sceneId,
          name: updatedSceneName
        }
      })
    }
  }
}
