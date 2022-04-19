// @flow
import React, { useState, useEffect, useContext } from 'react'
import Prism, { ImageColorPicker, ColorPin } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/pro-solid-svg-icons'
import { fullColorNumber } from 'src/shared/helpers/ColorUtils'
import facetBinder from 'src/facetSupport/facetBinder'
import { PubSubCtx } from 'src/facetSupport/facetPubSub'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { IMAGE_COLOR_PICKER_COLOR_SELECTED } from '../../../constants/pubSubEventsLabels'

import useColors from '../../../shared/hooks/useColors'

import type { Color } from 'src/shared/types/Colors.js.flow'

export function ImageColorPickerFacet () {
  const [colors] = useColors()
  const { publish, subscribe, unsubscribe } = useContext(PubSubCtx)
  const { brandKeyNumberSeparator } = useContext<ConfigurationContextType>(ConfigurationContext)
  const [sherwinColors, setSherwinColors] = useState([])
  const [img, setImg] = useState(null)

  const onColorSelected = (color: Color) => {
    publish(IMAGE_COLOR_PICKER_COLOR_SELECTED, color)
  }

  useEffect(() => {
    subscribe('IMAGE_COLOR_PICKER_IMAGE_UPLOAD', (data) => {
      const imgUrl = URL.createObjectURL(data.data)

      setImg(imgUrl)
    })

    return () => unsubscribe('IMAGE_COLOR_PICKER_IMAGE_UPLOAD')
  }, [])

  useEffect(() => {
    setSherwinColors(colors?.unorderedColors?.map(c => colors.colorMap[c]))
  }, [colors])

  if (img === null) {
    return null
  }

  return (
    <Prism>
      <ImageColorPicker
        imgSrc={img}
        colors={sherwinColors}
        onColorSelected={onColorSelected}
        pinRenderer={(props) => (
          <ColorPin
            {...props}
            labelContent={(color) => <>
              <p style={{ lineHeight: '1.1rem', whiteSpace: 'nowrap' }}>{fullColorNumber(color.brandKey, color.colorNumber, brandKeyNumberSeparator)}</p>
              <p style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{color.name}</p>
            </>}
          />
        )}
        removeButtonContent={<FontAwesomeIcon aria-label='remove' icon={faTrash} style={{ display: 'inline-block' }} />}
      />
    </Prism>
  )
}

export default facetBinder(ImageColorPickerFacet, 'ImageColorPickerFacet')
