// @flow
/* global FormData */
import React, { useEffect, useState } from 'react'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import SingleTintableSceneView from '../SingleTintableSceneView/SingleTintableSceneView'
import { useIntl } from 'react-intl'
import { createUniqueSceneId } from '../../shared/utils/legacyProfileFormatUtil'
import axios from 'axios'
import at from 'lodash/at'
import { deNoneify } from '../../store/actions/user-uploads'
import { SYSTEM_ERROR } from '../../store/actions/loadScenes'
import { SCENE_TYPES, SCENE_VARIANTS } from '../../constants/globals'
import uniqueId from 'lodash/uniqueId'
import type { MiniColor, ReferenceDimensions } from '../../shared/types/Scene'
import type { Color } from '../../shared/types/Colors'
import { createMiniColorFromColor } from '../SingleTintableSceneView/util'
import cloneDeep from 'lodash/cloneDeep'

import './FastMaskView.scss'
import type { FastMaskOpenCache } from '../../store/actions/fastMask'

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
  savedData?: FastMaskOpenCache
}

const baseClassName = 'fast-mask-view'
const tintWrapperClassName = `${baseClassName}__tint-wrapper`
const backgroundWrapperClassName = `${baseClassName}__background-wrapper`
const loaderWrapperClassName = `${baseClassName}__loader-wrapper`

const FastMaskView = (props: FastMaskProps) => {
  const { handleSceneBlobLoaderError, refDims, imageUrl, activeColor, savedData } = props
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

  /**
   * @param assets: string[][] - a matrix of variants where the inner vector being an order collection where
   * the first item is a the variant image (background) and the following urls are surfaces.
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

    const variants = assets.map(asset => {
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
      surfaceColors: surfaceColors.map(color => {
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
      const newSurfaceColors = variant.surfaces.map(surface => newColor)
      setSurfaceColors(newSurfaceColors)
      props.handleUpdates(prepareData([variant.image, ...variant.surfaces], sceneWidth, sceneHeight, newSurfaceColors, variant.variantName))
    }
    setTintingColor(newColor)
  }, [activeColor, variantsCollection, scenesCollection])

  useEffect(() => {
    if (refDims) {
      setWidth(refDims.isPortrait ? refDims.portraitWidth : refDims.landscapeWidth)
      setHeight(refDims.isPortrait ? refDims.portraitHeight : refDims.landscapeHeight)
    }

    if (savedData) {
      const { width: sceneWidth, height: sceneHeight } = savedData.scene
      setWidth(sceneWidth)
      setHeight(sceneHeight)
      setSceneUid(savedData.scene.uid)
      setScenesCollection([cloneDeep(savedData.scene)])
      setSurfaceColors(savedData.surfaceColors)
      setVariantsCollection([cloneDeep(savedData.variant)])
    } else {
      // convert base 64 from possible rotation into a blob for upload to nanonets
      axios.get(imageUrl, { responseType: 'blob' }).then(res => {
        setBlobData(res.data)
      })
        .catch(err => console.warn(`Error loading user image ${err}`))
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
        .post(`${ML_API_URL}/pipeline/`, uploadForm, {})
        .then(res => at(res, 'data.per_img_resp[0][0].payload')[0] || (() => { throw new Error('No relevant data in response') })())
        .then(data => {
          // eslint-disable-next-line camelcase
          const { mask_path0, original_img_path } = data
          const mask = deNoneify(mask_path0)
          const originalImage = deNoneify(original_img_path)

          return Promise.all([originalImage, mask].map((url) => {
            // Load mask and background
            return axios.get(url, {
              responseType: 'blob'
            })
          }))
        })
        .then((resp) => {
          // save mask and background as blobs in the browser
          if (isLive) {
            try {
              const blobUrls = resp.map(r => URL.createObjectURL(r.data))
              const { sceneUid, scenes, variants } = createScenesAndVariants([blobUrls], width, height)
              // There is only one variant for fast mask, the main one.
              const colors = variants[0].surfaces.map(surface => tintingColor)
              setBlobUrls(blobUrls)
              setSceneUid(sceneUid)
              setScenesCollection(scenes)
              setSurfaceColors(colors)
              setVariantsCollection(variants)
            } catch {
              handleSceneBlobLoaderError({
                type: SYSTEM_ERROR,
                err: `Blob urls not created for fast mask error`
              })
            }
          } else {
            console.warn('User interrupted the promise resolution.')
          }
        })
        .catch(err => {
          console.error('issue with segmentation: ', err)
        })
    }
    return () => {
      isLive = false
    }
  }, [blobData, variantsCollection, refDims])

  useEffect(() => {
    return () => {
      if (blobUrls.length) {
        blobUrls.forEach(url => {
          URL.revokeObjectURL(url)
        })
      }
    }
  }, [blobUrls])

  return (
    <div className={baseClassName}>
      {variantsCollection.length
        ? <div className={tintWrapperClassName} style={{ width, height }}>
          <SingleTintableSceneView
            key={sceneUid}
            surfaceColorsFromParents={surfaceColors}
            selectedSceneUid={sceneUid}
            scenesCollection={scenesCollection}
            variantsCollection={variantsCollection} />
        </div>
        : <>
          <div className={backgroundWrapperClassName}>
            {imageUrl && <img src={imageUrl} alt={intl.formatMessage({ id: 'USER_UPLOAD' })} />}
          </div>
          <div className={loaderWrapperClassName}><CircleLoader /></div>
        </>}
    </div>
  )
}

export default FastMaskView
