// @flow
import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { useIntl, FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { CircleLoader } from '../ToolkitComponents'
import './SaveOptions.scss'
import { ACTIVE_SCENE_LABELS_ENUM } from '../../store/actions/navigation'
import SceneDownload from '../SceneDownload/SceneDownload'
import { shouldAllowFeature } from '../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../constants/configurations'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'
import { createSaveSceneModal, createModalForEmptyLivePalette } from '../CVWModalManager/createModal'
import { MODAL_TYPE_ENUM, SAVE_OPTION } from '../CVWModalManager/constants.js'
import { ROUTES_ENUM } from '../Facets/ColorVisualizerWrapper/routeValueCollections'
import { triggerPaintSceneLayerPublish } from '../../store/actions/paintScene'

type SaveOptionsProps = {
  config: any,
}

const saveOptionsBaseClassName = 'save-options'
const saveOptionsItemsClassName = `${saveOptionsBaseClassName}__items`

const SaveOptions = (props: SaveOptionsProps) => {
  const [
    selectedSceneUid,
    variantsCollection,
    selectedVariantName,
    surfaceColors
  ] = useSelector(store => ([
    store.selectedSceneUid,
    store.variantsCollection,
    store.selectedVariantName,
    store.modalThumbnailColor
  ]))
  const { config: { featureExclusions } } = props
  const { formatMessage } = useIntl()
  const intl = useIntl()
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const toggleCompareColor: boolean = useSelector(store => store.lp.toggleCompareColor)
  const dispatch = useDispatch()
  const { location: { pathname } } = useHistory()
  const { cvw } = props.config
  const [cvwFromConfig, setCvwFromConfig] = useState(null)
  const lpColors = useSelector(state => state.lp.colors)

  useEffect(() => {
    if (cvw) {
      setCvwFromConfig(cvw)
    }
  }, [cvw])

  const handleSave = useCallback((e: SyntheticEvent) => {
    e.preventDefault()
    // Don't muddle th ealready complex save logic and giv efast mask its own block
    if (pathname === ROUTES_ENUM.ACTIVE_FAST_MASK) {
      dispatch(createSaveSceneModal(intl, MODAL_TYPE_ENUM.FAST_MASK, SAVE_OPTION.SAVE_FAST_MASK))

      return
    }

    if (((pathname === '/active') || (pathname === ROUTES_ENUM.ACTIVE_PAINT_SCENE)) && !toggleCompareColor) {
      if (lpColors.length !== 0) {
        const saveType = ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE === activeSceneLabel ? SAVE_OPTION.SAVE_STOCK_SCENE : SAVE_OPTION.SAVE_PAINT_SCENE
        if (activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE) {
          // We handle paint scene reactively, we tell it via redux, hey its time to globally set your data for save.
          dispatch(triggerPaintSceneLayerPublish(true))
        }
        // @todo refactor this, we shouldn't need to pass dispatch here and maybe specialize to stock scene save since paint scene download is handled reactively by the facet -RS
        const modalType = activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE ? MODAL_TYPE_ENUM.STOCK_SCENE : MODAL_TYPE_ENUM.PAINT_SCENE
        dispatch(createSaveSceneModal(intl, modalType, saveType))
      } else {
        dispatch(createModalForEmptyLivePalette(intl, SAVE_OPTION.EMPTY_SCENE, true))
      }
    } else {
      if (lpColors.length !== 0) {
        dispatch(createSaveSceneModal(intl, MODAL_TYPE_ENUM.LIVE_PALETTE, SAVE_OPTION.SAVE_LIVE_PALETTE))
      } else {
        dispatch(createModalForEmptyLivePalette(intl, MODAL_TYPE_ENUM.EMPTY_SCENE, false))
      }
    }
  }, [pathname, activeSceneLabel])

  const loadAndDrawImage = (url, ctx, w = 0, h = 0, x = 0, y = 0) => {
    var image = new Image()
    const promise = new Promise((resolve) => {
      image.onload = () => {
        ctx.drawImage(image, w, h, x, y)
        resolve(ctx)
      }
    })
    image.src = url
    return promise
  }

  const getFlatImage = (ctx1, ctx2) => {
    const { width, height } = ctx1.canvas
    const bgData = ctx1.canvas.toDataURL(0, 0, width, height)
    const paintData = ctx2.canvas.toDataURL(0, 0, width, height)
    const promise = new Promise(async (resolve) => {
      const workCanvas = document.createElement('canvas')
      workCanvas.setAttribute('width', width)
      workCanvas.setAttribute('height', height)
      const workCtx = workCanvas.getContext('2d')
      await loadAndDrawImage(bgData, workCtx, 0, 0, width, height)
      await loadAndDrawImage(paintData, workCtx, 0, 0, width, height)
      const miniImgWidth = Math.floor(width / 3)
      const miniImgHeight = Math.floor(height / 3)
      loadAndDrawImage(bgData, workCtx, width - miniImgWidth, height - miniImgHeight, miniImgWidth, miniImgHeight).then((ctx) => {
        const promise = new Promise((resolve) => {
          ctx.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob)
            resolve(url)
          }, 'image/png')
        })
        resolve(promise)
      })
    })
    return promise
  }

  const getDownloadStaticResourcesPath = (data) => {
    return {
      // to do: headerImage, downloadDisclaimer1, downloadDisclaimer2 also should be configurable
      headerLogo: data.downloadSceneHeaderImage,
      bottomLogo: data.downloadSceneFooterImage,
      downloadDisclaimer1: data.downloadSceneDisclaimer1,
      downloadDisclaimer2: data.downloadSceneDisclaimer2
    }
  }

  return (
    <div className={saveOptionsBaseClassName}>
      {shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.download)
        ? (activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE
            ? <div>
            {cvwFromConfig
              ? <SceneDownload
              buttonCaption={'DOWNLOAD_MASK'}
              getFlatImage={getFlatImage}
              activeComponent={activeSceneLabel}
              config={getDownloadStaticResourcesPath(cvwFromConfig)} />
              : <CircleLoader />}
          </div>
            : <div>
            {cvwFromConfig
              ? <SceneDownload
              selectedSceneUid={selectedSceneUid}
              variantsCollection={variantsCollection}
              selectedVariantName={selectedVariantName}
              surfaceColors={surfaceColors}
              buttonCaption={'DOWNLOAD_MASK'}
              activeComponent={activeSceneLabel}
              config={getDownloadStaticResourcesPath(cvwFromConfig)} />
              : <CircleLoader />}
          </div>)
        : null}
      { shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.documentSaving)
        ? <button onClick={handleSave}>
          <div className={saveOptionsItemsClassName}>
            <div>
              <FontAwesomeIcon
                title={formatMessage({ id: 'SAVE_MASKS' })}
                icon={['fal', 'folder']}
                size='2x' />
            </div>
            <div className={`${saveOptionsItemsClassName}--title`}><FormattedMessage id='SAVE_MASKS' /></div>
          </div>
        </button>
        : null}
    </div>
  )
}

export default WithConfigurationContext(SaveOptions)
