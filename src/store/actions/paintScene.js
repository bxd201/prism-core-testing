// @flow
import axios from 'axios'
import { STATUS_ENDPOINT } from '../../constants/endpoints'
import { separateColors } from '../../components/PaintScene/PaintSceneUtils'

export const SAVE_MASKS = 'SAVE_MASKS'
export const SAVING_MASKS = 'SAVING_MASKS'
export const DONE_SAVING_MASKS = 'DONE_SAVING_MASKS'

export const startSavingMasks = () => {
  return {
    type: SAVING_MASKS,
    payload: true
  }
}

export const saveMasks = (colorList: Array<number[]>, imageData: Object, metaData: Object) => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVING_MASKS,
      payload: true
    })

    // The separated colors as an array of imageData items
    const imageDataList = separateColors(colorList, imageData, 1.5)
    // eslint-disable-next-line no-unused-vars
    const xml = createSceneXML(imageDataList, metaData)

    // @todo - THIS IS AN ECHO TEST, this needs to be properly implemented. -RS
    axios.get(STATUS_ENDPOINT).then(response => {
      console.log(response)
      dispatch({
        type: DONE_SAVING_MASKS,
        payload: false
      })
    }).catch(err => {
      console.log(`Error saving masks: ${err}`)
      dispatch({
        type: DONE_SAVING_MASKS,
        payload: false
      })
    })
  }
}

export const createSceneXML = (imageData: Object[], metaData: Object) => {
  // @todo - implement -RS
}
