// @flow strict
import React, { useContext, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { CircleLoader } from '@prism/toolkit'
import Jimp from 'jimp'
import { generateImage } from '../../shared/services/sceneDownload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { ACTIVE_SCENE_LABELS_ENUM } from '../../store/actions/navigation'
import type { FlatVariant, MiniColor } from '../../shared/types/Scene'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { ROUTES_ENUM } from '../Facets/ColorVisualizerWrapper/routeValueCollections'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'

type Props = {
  buttonCaption: string,
  activeComponent: string,
  getFlatImage: Function,
  config: Object,
  selectedSceneUid: string | null,
  variantsCollection: FlatVariant[],
  selectedVariantName: string,
  surfaceColors: MiniColor[]
}

const PAINT_SCENE_COMPONENT = ACTIVE_SCENE_LABELS_ENUM.PAINT_SCENE
const BACKGROUND_IMG = 'paint-scene-canvas-first'
const PAINT_LAYER = 'paint-scene-canvas-second'

const getDownloadData = (activeSceneType: string, location: Location, paintSceneData: any, stockSceneData: any, fastMaskData) => {
  if (location.pathname.indexOf(ROUTES_ENUM.ACTIVE_FAST_MASK) > -1) {
    // This data is removed from redux when the fast mask comp is unmounted. It should only be around when we are indeed on fast mask/ @todo put data transformation here
    return fastMaskData
  }

  if (activeSceneType === PAINT_SCENE_COMPONENT) {
    return paintSceneData
  }

  return stockSceneData
}

export default (props: Props) => {
  const location = useLocation()
  const { brandId, cvw = {} }: ConfigurationContextType = useContext(ConfigurationContext)
  const { palette = {} } = cvw
  const { downloadBtn = {} } = palette
  const [isCreatingDownload, setIsCreatingDownload] = useState(false)
  const { buttonCaption, activeComponent, getFlatImage, config, variantsCollection, selectedSceneUid, selectedVariantName, surfaceColors } = props
  const intl = useIntl()
  const [fastMaskData, structure] = useSelector(store => ([store.fastMaskSaveCache, store.colors?.structure]))

  const onDownloadClick = async () => {
    setIsCreatingDownload(true)
    let imageSrc = ''
    const isPaintScene = activeComponent === PAINT_SCENE_COMPONENT
    if (isPaintScene) {
      // @todo we need to rewrite this so that this is less jQueryish and more reacty. -RS
      const backgroundImg = document.getElementsByName(BACKGROUND_IMG)[0].getContext('2d')
      const paintLayer = document.getElementsByName(PAINT_LAYER)[0].getContext('2d')
      await getFlatImage(backgroundImg, paintLayer).then((url) => { imageSrc = url })
    }
    const variant = !isPaintScene ? variantsCollection.find(variant => variant.sceneUid === selectedSceneUid && variant.variantName === selectedVariantName) : null
    const data = getDownloadData(activeComponent, location, imageSrc, variant, fastMaskData)
    const colors = data.surfaceColors ? data.surfaceColors : surfaceColors
    const swatchColors = JSON.parse(window.localStorage.getItem('lp')).colors
    const sectionNameMapping = swatchColors.map(({ colorFamilyNames = [] }) => {
      const fam = colorFamilyNames[0]
      if (!fam) return null

      return structure.filter(s => s.families.indexOf(fam) > -1).map(s => s?.name ?? null).reduce((accum, next) => accum || next, null)
    })

    generateImage(data, colors, config, intl, swatchColors, sectionNameMapping)
      .then(image => image.getBufferAsync(Jimp.MIME_JPEG))
      .then(buffer => {
        const blob = new Blob([buffer], { type: 'img/jpg' })
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const urlCreator = window.URL || window.webkitURL
          const link = document.createElement('a')
          link.href = navigator.userAgent.match('CriOS') /* iOS Chrome */ ? reader.result : urlCreator.createObjectURL(blob)
          link.target = '_blank'
          link.download = 'SceneImage.jpg'
          window.document.body.appendChild(link)
          link.click()
          window.document.body.removeChild(link)
          setIsCreatingDownload(false)
        }
      })

    GA.event({ category: 'Active Scene', action: 'Download Click', label: 'Download' }, GA_TRACKER_NAME_BRAND[brandId])
  }

  return (
    <ul>
      {isCreatingDownload ? (
        <li style={{ display: 'inline-block' }}>
          <CircleLoader color='#0069af' />
        </li>
      ) : (
        <li style={{ display: 'inline-block', verticalAlign: 'top' }}>
          <ul>
            <button onClick={onDownloadClick} disabled={isCreatingDownload} style={{ flexDirection: 'column' }}>
              <div className='save-options__items'>
                <div>
                  <FontAwesomeIcon
                    title={intl.formatMessage({ id: 'DOWNLOAD_MASK' })}
                    icon={downloadBtn?.icon ? ['far', downloadBtn.icon] : ['fal', 'download']}
                    size='2x'
                  />
                </div>
                <div className='save-options__items--title'>
                  {downloadBtn?.title ?? <FormattedMessage id={buttonCaption} />}
                </div>
              </div>
            </button>
          </ul>
        </li>
      )}
    </ul>
  )
}
