// @flow
// @todo this comp needs to be rewritten when we start masking multiple surfaces. -RS
/* global FormData */
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import axios from 'axios'
import at from 'lodash/at'
import cloneDeep from 'lodash/cloneDeep'
import uniqueId from 'lodash/uniqueId'
import { SCENE_TYPES, SCENE_VARIANTS } from '../../constants/globals'
import type { Color } from '../../shared/types/Colors'
import type { MiniColor, ReferenceDimensions } from '../../shared/types/Scene'
import primeImage from '../../shared/utils/image/primeImage'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import type { FastMaskOpenCache } from '../../store/actions/fastMask'
import { SYSTEM_ERROR } from '../../store/actions/loadScenes'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'
import { CircleLoader } from '../ToolkitComponents'
import './FastMaskView.scss'

export type FastMaskWorkspace = {
  palette: Color[],
  width: number,
  height: number,
  image: string,
  surfaces: string[],
  surfaceColors: MiniColor[],
  variantName: string,
  sceneType: string
}

type FastMaskProps = {
  handleSceneBlobLoaderError: Function,
  refDims: ReferenceDimensions,
  imageUrl: string,
  activeColor: Color,
  handleUpdates: Function,
  cleanupCallback: Function,
  savedData?: FastMaskOpenCache,
  initHandler?: Function,
  isForCVW?: boolean,
  showSpinner?: boolean,
  // this maps to multiple divs
  loadingMessage?: string[],
  spinner?: any,
  handleError: Function,
  shouldPrimeImage?: boolean
}

const baseClassName = 'fast-mask-view'
const cvwBaseClassName = `${baseClassName}--cvw`
const tintWrapperClassName = `${baseClassName}__tint-wrapper`
const backgroundWrapperClassName = `${baseClassName}__background-wrapper`
const cvwBackgroundWrapperClassName = `${backgroundWrapperClassName}--cvw`
const loaderWrapperClassName = `${baseClassName}__loader-wrapper`
const backgroundImageClassName = `${backgroundWrapperClassName}__image`
const loadingMessageWrapperClassName = `${loaderWrapperClassName}__msg`
const loadingMessageItemsClassName = `${loadingMessageWrapperClassName}__item`
const altSpinnerClassName = `${loaderWrapperClassName}__spinner`

const FastMaskView = (props: FastMaskProps) => {
  const {
    handleSceneBlobLoaderError,
    refDims,
    imageUrl,
    activeColor,
    savedData,
    initHandler,
    isForCVW,
    showSpinner,
    loadingMessage,
    spinner,
    shouldPrimeImage
  } = props
  const intl = useIntl()
  const [blobData, setBlobData] = useState(null)
  const [surfaceColors, setSurfaceColors] = useState([])
  const [scenesCollection, setScenesCollection] = useState([])
  const [variantsCollection, setVariantsCollection] = useState([])
  const [blobUrls, setBlobUrls] = useState([])
  const [sceneUid, setSceneUid] = useState(null)
  const [tintingColor, setTintingColor] = useState(createMiniColorFromColor(activeColor))
  // @todo for resize, we should probably use refs for width and height to avoid rerenders -RS
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  // bypass priming logic if there is no shouldPrimeImage flag
  const [imageProcessed, setImageProcessed] = useState(!shouldPrimeImage)

  /**
   * @param assets: string[][] - a matrix of variants where the inner vector being an order collection where
   * the first item is the variant image (background) and the following urls are surfaces.
   * @param width
   * @param height
   */
  const createScenesAndVariants = (assets: string[][], width: number, height: number) => {
    const sceneType = SCENE_TYPES.FAST_MASK
    const sceneUid = createUniqueSceneId()
    const sceneId = parseInt(uniqueId())
    const scene = {
      id: sceneId,
      width,
      height,
      sceneType,
      variantNames: [SCENE_VARIANTS.MAIN],
      uid: sceneUid,
      description: ''
    }

    const variants = assets.map((asset) => {
      const variant = {
        sceneType,
        sceneId,
        sceneUid,
        variantName: SCENE_VARIANTS.MAIN,
        image: asset[0],
        thumb: asset[0],
        surfaces: asset.slice(1).map((surface, i) => {
          return {
            id: i + 1,
            surfaceBlobUrl: surface
          }
        })
      }

      return variant
    })

    return {
      sceneUid,
      scenes: [scene],
      variants
    }
  }

  const prepareData = (assets: string[], width: number, height: number, surfaceColors, variantName) => {
    return {
      image: assets[0],
      surfaces: assets.slice(1),
      width,
      height,
      surfaceColors: surfaceColors.map((color) => {
        return { ...color }
      }),
      variantName,
      sceneType: SCENE_TYPES.FAST_MASK
    }
  }

  useEffect(() => {
    const newColor = createMiniColorFromColor(activeColor)
    if (variantsCollection.length) {
      // theres only 1 variant for fast mask
      const { width: sceneWidth, height: sceneHeight } = scenesCollection[0]
      const variant = variantsCollection[0]
      const newSurfaceColors = variant.surfaces.map((surface) => newColor)
      setSurfaceColors(newSurfaceColors)
      props.handleUpdates(
        prepareData(
          [variant.image, ...variant.surfaces],
          sceneWidth,
          sceneHeight,
          newSurfaceColors,
          variant.variantName
        )
      )
    }
    setTintingColor(newColor)
  }, [activeColor, variantsCollection, scenesCollection])

  useEffect(() => {
    if (initHandler) {
      initHandler()
    }

    if (refDims) {
      setWidth(refDims.isPortrait ? refDims.portraitWidth : refDims.landscapeWidth)
      setHeight(refDims.isPortrait ? refDims.portraitHeight : refDims.landscapeHeight)
    }

    if (savedData) {
      // This view handles
      const { width: sceneWidth, height: sceneHeight } = savedData.scene
      setWidth(sceneWidth)
      setHeight(sceneHeight)
      setSceneUid(savedData.scene.uid)
      setScenesCollection([cloneDeep(savedData.scene)])
      setSurfaceColors(savedData.surfaceColors)
      setVariantsCollection([cloneDeep(savedData.variant)])
    } else {
      // convert base 64 from possible rotation into a blob for upload to nanonets
      axios
        .get(imageUrl, { responseType: 'blob' })
        .then((res) => {
          setBlobData(res.data)
        })
        .catch((err) => console.warn(`Error loading user image ${err}`))
    }
    return () => props.cleanupCallback()
  }, [])

  useEffect(() => {
    // use this to prevent ajax call from holding on to refs when this unmounts
    let isLive = true
    if (blobData && !variantsCollection.length) {
      const uploadForm = new FormData()
      uploadForm.append('image', blobData)

      axios
        .post(`${ML_API_URL}/prism-ml/`, uploadForm, {})
        .then(
          (res) =>
            at(res, 'data.per_img_resp[0][0].payload')[0] ||
            (() => {
              throw new Error('No relevant data in response')
            })()
        )
        .then((data) => {
          // eslint-disable-next-line camelcase
          const { mask_path0, original_img_path } = data
          // eslint-disable-next-line camelcase
          const mask = mask_path0
          // eslint-disable-next-line camelcase
          const originalImage = original_img_path

          // Load mask and background
          return Promise.all(
            [originalImage, mask].map((url, index) => {
              // THIS IS A WORKAROUND FOR THE MISSING original_img_path, since we have it in memory still lets just use it.
              if (index === 0 && !url) {
                const bgImagePromise = new Promise((resolve, reject) => {
                  // Wrap the blob in an object that mimics the axios response.
                  // The createScenesAndVariants function expects this form.
                  resolve({ data: blobData })
                })

                return bgImagePromise
              }
              return axios.get(url, {
                responseType: 'blob'
              })
            })
          )
        })
        .then((resp) => {
          // save mask and background as blobs in the browser
          if (isLive) {
            try {
              const blobUrls = resp.map((r) => URL.createObjectURL(r.data))
              const { sceneUid, scenes, variants } = createScenesAndVariants([blobUrls], width, height)
              // There is only one variant for fast mask, the main one.
              const colors = variants[0].surfaces.map((surface) => tintingColor)
              setBlobUrls(blobUrls)
              setSceneUid(sceneUid)
              setScenesCollection(scenes)
              setSurfaceColors(colors)
              setVariantsCollection(variants)
            } catch {
              handleSceneBlobLoaderError({
                type: SYSTEM_ERROR,
                err: 'Blob urls not created for fast mask error'
              })
            }
          } else {
            console.warn('User interrupted the promise resolution.')
          }
        })
        .catch((err) => {
          console.error('issue with segmentation: ', err)
          if (props.handleError) {
            props.handleError(err)
          }
        })
    }
    return () => {
      isLive = false
    }
  }, [blobData, variantsCollection, refDims])

  useEffect(() => {
    return () => {
      if (blobUrls.length) {
        blobUrls.forEach((url) => {
          URL.revokeObjectURL(url)
        })
      }
    }
  }, [blobUrls])

  useEffect(() => {
    let isLive = true
    if (variantsCollection.length && !imageProcessed) {
      const handleImagePrimed = (img, w, h) => {
        if (!isLive) {
          return
        }
        setImageProcessed(true)
        const updatedVariantCollection = cloneDeep(variantsCollection)
        variantsCollection[0].image = img
        // @todo I don't think we need to update the thumb -RS
        setVariantsCollection(updatedVariantCollection)
      }

      const { image, surfaces } = variantsCollection[0]
      primeImage(image, surfaces[0].surfaceBlobUrl, handleImagePrimed)
    }

    return () => {
      isLive = false
    }
  }, [variantsCollection, imageProcessed])

  return (
    <>
      {imageProcessed && variantsCollection.length && !showSpinner ? (
        <div className={isForCVW ? cvwBaseClassName : baseClassName}>
          <div className={tintWrapperClassName}>
            <SingleTintableSceneView
              spinner={spinner}
              key={sceneUid}
              surfaceColorsFromParents={surfaceColors}
              selectedSceneUid={sceneUid}
              scenesCollection={scenesCollection}
              variantsCollection={variantsCollection}
            />
          </div>
        </div>
      ) : (
        <div className={baseClassName}>
          <div className={isForCVW ? cvwBackgroundWrapperClassName : backgroundWrapperClassName}>
            {imageUrl && (
              <img
                src={imageUrl}
                className={backgroundImageClassName}
                alt={intl.formatMessage({ id: 'USER_UPLOAD' })}
              />
            )}
            <div className={loaderWrapperClassName}>
              {spinner ? <div className={altSpinnerClassName}>{spinner}</div> : <CircleLoader />}
              {loadingMessage?.length ? (
                <div className={loadingMessageWrapperClassName}>
                  {loadingMessage.map((msg) => {
                    return (
                      <div className={loadingMessageItemsClassName} key={msg}>
                        {msg}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FastMaskView
