// @flow
import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { setLayersForPaintScene, createPaintSceneWorkspace, setInitialWorkspace, WORKSPACE_TYPES } from '../../store/actions/paintScene'
import './PaintSceneMask.scss'
import PaintScene from './PaintScene'
import { FormattedMessage } from 'react-intl'

export const PaintSceneMaskingWrapper = () => {
  const childRef = useRef()
  const dispatch = useDispatch()
  const paintSceneWorkspace = useSelector(store => store.paintSceneWorkspace)
  const [reMountPaintScene, setResized] = useState(0)
  const [paintSceneWorkspaceState, setPaintSceneWorkspaceState] = useState(paintSceneWorkspace)
  const sendImageData = useCallback((data) => {
    childRef.current.sendImageData(data)
  }, [childRef.current])

  const reloadPaintScene = (workspace) => {
    setPaintSceneWorkspaceState(workspace)
  }

  const resizeHandler = () => {
    paintSceneWorkspaceState && dispatch(setLayersForPaintScene(paintSceneWorkspaceState))
    setResized(Date.now())
  }

  useEffect(() => {
    window.addEventListener('resize', resizeHandler)
    paintSceneWorkspaceState && dispatch(setInitialWorkspace(paintSceneWorkspaceState))
    return function cleanup () {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  const selectedMaskIndex = paintSceneWorkspaceState ? paintSceneWorkspaceState.selectIndex : null
  const imageDimensions = paintSceneWorkspaceState ? { imageWidth: paintSceneWorkspaceState.width, imageHeight: paintSceneWorkspaceState.height } : { imageWidth: null, imageHeight: null }
  return (
    <>
      <PaintScene
        key={reMountPaintScene}
        checkIsPaintSceneUpdate={false}
        workspace={paintSceneWorkspaceState}
        referenceDimensions={imageDimensions}
        selectedMaskIndex={selectedMaskIndex}
        sendImageData={sendImageData}
        imageUrl={''}
      />
      <PaintSceneMasking ref={childRef} reloadPaintScene={(workspace) => reloadPaintScene(workspace)} />
    </>
  )
}

type paintSceneMaskingProps = {
     reloadPaintScene: Function,
  }

const PaintSceneMasking = forwardRef((props: paintSceneMaskingProps, ref) => {
  const canvasRef = useRef()
  const mergeCanvasRef = useRef()
  const imageRef = useRef()
  let mergeCtx = useRef()
  const paintSceneWorkspace = useSelector(store => store.paintSceneWorkspace)
  const [thumbnailListInfo, setThumbnailList] = useState([])
  const [paintSceneWorkspaceState, setPaintSceneWorkspaceState] = useState(paintSceneWorkspace)
  useImperativeHandle(ref, () => ({
    sendImageData (data) {
      const { bgImageUrl, width, height, palette, workspaceType, selectIndex } = paintSceneWorkspaceState
      const currLayers = paintSceneWorkspaceState.layers.map((layer, idx) => {
        if (data && idx !== selectIndex) {
          return layer
        }
        return data
      })
      const workspace = createPaintSceneWorkspace(bgImageUrl, currLayers, palette, width, height, workspaceType, selectIndex)
      props.reloadPaintScene(workspace)
      setPaintSceneWorkspaceState(workspace)
    }
  }))

  useEffect(() => {
    paintSceneWorkspaceState && setThumbnailList(mergeLayers())
  }, [paintSceneWorkspaceState])

  const swichImage = (index) => {
    const { bgImageUrl, layers, width, height, palette, workspaceType } = paintSceneWorkspaceState
    const workspace = createPaintSceneWorkspace(bgImageUrl, layers, palette, width, height, workspaceType, index)
    props.reloadPaintScene(workspace)
    setPaintSceneWorkspaceState(workspace)
  }

  const mergeLayers = () => {
    if (paintSceneWorkspaceState) {
      const originWidth = paintSceneWorkspaceState.width
      const originHeight = paintSceneWorkspaceState.height
      mergeCtx.current = mergeCanvasRef.current.getContext('2d')
      const thumbnailList = paintSceneWorkspaceState.layers.map((mask, idx) => {
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
        paintSceneWorkspaceState && paintSceneWorkspaceState.layers.map((miniMask, i) => {
          return (
            <React.Fragment key={`${i}-work-area`}>
              <img
                className={'merge-canvas-image-comp'}
                style={{ width: miniMask.width, height: miniMask.height }}
                src={paintSceneWorkspaceState.bgImageUrl}
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
      <ThumbnailsList swichImage={swichImage} thumbnailList={thumbnailListInfo} workspace={paintSceneWorkspaceState} />
    </>
  )
})

type thumbnailsListProps = {
  thumbnailList: [],
  swichImage: Function,
  workspace: Obejct
  }

const ThumbnailsList = ({ thumbnailList, swichImage, workspace }: thumbnailsListProps) => {
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

  const greyScaleBackground = (imageDataList) => {
    return imageDataList.map((imageData) => {
      for (let i = 0; i < imageData.data.length; i += 4) {
        let pixel = (imageData.data[i] !== 0 || imageData.data[i + 1] !== 0 || imageData.data[i + 2] !== 0) ? 255 : 0
        imageData.data[i] = pixel
        imageData.data[i + 1] = pixel
        imageData.data[i + 2] = pixel
      }
      return imageData
    })
  }

  const asyncSaveWorkspace = (dispatch, workspace, isCancel = false) => {
    return (() => {
      return new Promise((resolve, reject) => {
        const { bgImageUrl, width, height, layers, palette, sceneName } = workspace
        const surfaces = isCancel ? imageDataToUrl(layers) : imageDataToUrl(greyScaleBackground(layers))
        dispatch(setLayersForPaintScene(bgImageUrl, layers, palette, width, height, WORKSPACE_TYPES.smartMask, 0, sceneName, surfaces))
        resolve()
      })
    })()
  }

  const done = () => {
    // redirect to next page
    asyncSaveWorkspace(dispatch, workspace).then(() => {
      history.push('/active')
    })
  }
  const cancel = () => {
    asyncSaveWorkspace(dispatch, paintSceneWorkspace.originWorkspace, true).then(() => {
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
                style={workspace.selectIndex === selectedIndex ? { border: '2px solid red' } : {}}
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
