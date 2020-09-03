// @flow
import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { setLayersForPaintScene, setInitialWorkspace, WORKSPACE_TYPES } from '../../store/actions/paintScene'
import './PaintSceneMask.scss'
import PaintScene from './PaintScene'
import { FormattedMessage } from 'react-intl'

export const PaintSceneMaskingWrapper = () => {
  const childRef = useRef()
  const dispatch = useDispatch()
  const paintSceneWorkspace = useSelector(store => store.paintSceneWorkspace)
  const sendImageData = useCallback((data) => {
    childRef.current.sendImageData(data)
  }, [childRef.current])

  useEffect(() => {
    paintSceneWorkspace && dispatch(setInitialWorkspace(paintSceneWorkspace))
  }, [])

  const selectedMaskIndex = paintSceneWorkspace ? paintSceneWorkspace.selectIndex : null
  const imageDimensions = paintSceneWorkspace ? { imageWidth: paintSceneWorkspace.width, imageHeight: paintSceneWorkspace.height } : { imageWidth: null, imageHeight: null }

  return (
    <>
      <PaintScene
        checkIsPaintSceneUpdate={false}
        workspace={paintSceneWorkspace}
        referenceDimensions={imageDimensions}
        selectedMaskIndex={selectedMaskIndex}
        sendImageData={sendImageData}
        imageUrl={''}
      />
      <PaintSceneMasking ref={childRef} />
    </>
  )
}

const PaintSceneMasking = forwardRef((props, ref) => {
  const canvasRef = useRef()
  const mergeCanvasRef = useRef()
  const imageRef = useRef()
  let mergeCtx = useRef()
  const paintSceneWorkspace = useSelector(store => store.paintSceneWorkspace)
  const dispatch = useDispatch()
  const [thumbnailListInfo, setThumbnailList] = useState([])

  useImperativeHandle(ref, () => ({
    sendImageData (data) {
      const { bgImageUrl, width, height, palette, workspaceType, selectIndex } = paintSceneWorkspace
      const currLayers = paintSceneWorkspace.layers.map((layer, idx) => {
        if (data && idx !== selectIndex) {
          return layer
        }
        return data
      })
      dispatch(setLayersForPaintScene(bgImageUrl, currLayers, palette, width, height, workspaceType, selectIndex))
    }
  }))

  useEffect(() => {
    paintSceneWorkspace && setThumbnailList(mergeLayers())
  }, [paintSceneWorkspace])

  const swichImage = (index) => {
    const { bgImageUrl, layers, width, height, palette, workspaceType } = paintSceneWorkspace
    dispatch(setLayersForPaintScene(bgImageUrl, layers, palette, width, height, workspaceType, index))
  }

  const mergeLayers = () => {
    if (paintSceneWorkspace) {
      const originWidth = paintSceneWorkspace.width
      const originHeight = paintSceneWorkspace.height
      mergeCtx.current = mergeCanvasRef.current.getContext('2d')
      const thumbnailList = paintSceneWorkspace.layers.map((mask, idx) => {
        const ctx = canvasRef.current.getContext('2d')
        for (let index = 0; index < mask.data.length; index += 4) {
          if (mask.data[index] !== 0) {
            mask.data[index + idx] = 0
          }
        }
        ctx.putImageData(mask, 0, 0)
        mergeCtx.current.drawImage(imageRef.current, 0, 0, originWidth, originHeight)
        mergeCtx.current.drawImage(canvasRef.current, 0, 0, originWidth, originHeight)
        const dataURL = mergeCtx.current.canvas.toDataURL()
        ctx.clearRect(0, 0, originWidth, originHeight)
        mergeCtx.current.clearRect(0, 0, originWidth, originHeight)
        return dataURL
      })
      return thumbnailList
    }
  }

  const handleImageLoaded = () => {
    setThumbnailList(mergeLayers())
  }
  return (
    <>
      {
        paintSceneWorkspace && paintSceneWorkspace.layers.map((miniMask, i) => {
          return (
            <React.Fragment key={`${i}-work-area`}>
              <img
                className={'merge-canvas-image-comp'}
                style={{ width: miniMask.width, height: miniMask.height }}
                src={paintSceneWorkspace.bgImageUrl}
                onLoad={(e) => handleImageLoaded(e)}
                ref={imageRef}
                alt={'IMAGE_INVISIBLE'}
              />
              <canvas
                className={'merge-canvas-image-comp'}
                ref={canvasRef}
                width={miniMask.width}
                height={miniMask.height} />
              <canvas
                className={'merge-canvas-image-comp'}
                ref={mergeCanvasRef}
                width={miniMask.width}
                height={miniMask.height} />
            </React.Fragment>
          )
        })
      }
      <ThumbnailsList swichImage={swichImage} thumbnailList={thumbnailListInfo} />
    </>
  )
})

type thumbnailsListProps = {
  thumbnailList: [],
  swichImage: Function
  }

const ThumbnailsList = ({ thumbnailList, swichImage }: thumbnailsListProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const paintSceneWorkspace = useSelector(store => store.paintSceneWorkspace)

  const imageDataToUrl = (imageDataList: ImageData[]) => {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', imageDataList[0].width)
    canvas.setAttribute('height', imageDataList[0].height)
    const ctx = canvas.getContext('2d')

    const surfaces = imageDataList.map(d => {
      ctx.save()
      ctx.putImageData(d, 0, 0)
      const surface = canvas.toDataURL()
      ctx.restore()

      return surface
    })

    return surfaces
  }

  const asyncSaveWorkspace = (dispatch, workspace) => {
    return (() => {
      return new Promise((resolve, reject) => {
        const { bgImageUrl, width, height, layers, palette, sceneName } = workspace
        const surfaces = imageDataToUrl(layers)
        dispatch(setLayersForPaintScene(bgImageUrl, layers, palette, width, height, WORKSPACE_TYPES.smartMask, 0, sceneName, surfaces))
        resolve()
      })
    })()
  }

  const done = () => {
    // redirect to next page
    asyncSaveWorkspace(dispatch, paintSceneWorkspace).then(() => {
      history.push('/active')
    })
  }
  const cancel = () => {
    asyncSaveWorkspace(dispatch, paintSceneWorkspace.originWorkspace).then(() => {
      history.push('/active')
    })
  }

  return (
    <div className='paint-scene__mask-list-wrapper'>
      {
        thumbnailList.map((image, selectedIndex) => {
          return (
            <div role='presentation' className={'paint-scene__mini-mask-image'} key={selectedIndex} onClick={() => swichImage(selectedIndex)}>
              {thumbnailList.length > 0 && <img
                style={paintSceneWorkspace.selectIndex === selectedIndex ? { border: '2px solid red' } : {}}
                src={image}
                alt={'IMAGE_INVISIBLE'}
              />}
            </div>
          )
        })
      }
      <div className='paint-scene__button-wrapper'>
        <button onClick={() => done()}><FormattedMessage id='DONE' /></button>
        <button onClick={() => cancel()}><FormattedMessage id='CANCEL' /></button>
      </div>
    </div>
  )
}

export default PaintSceneMaskingWrapper
