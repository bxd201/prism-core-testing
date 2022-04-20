// @flow
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { add } from 'src/store/actions/live-palette'
import { ColorPin, ImageColorPicker } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fullColorNumber, getContrastYIQ } from 'src/shared/helpers/ColorUtils'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'

type InspiredSceneProps = {
  data: { img: string, initPins: { x: number, y: number }[] }
}

const InspiredScene = ({ data: { img, initPins } }: InspiredSceneProps) => {
  const colors = useSelector((store) => store.colors.unorderedColors)
  const dispatch = useDispatch()
  const livePaletteColors = useSelector((store) => store.lp.colors)
  const { brandKeyNumberSeparator, colorWall: { colorSwatch = {} } } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
  const baseClass = `image-color-picker${colorNumOnBottom ? `--name-number${houseShaped ? '-house-shaped' : ''}` : '--number-name'}`

  const isColorAdded = ({ colorNumber }): boolean => livePaletteColors.some((c) => c.colorNumber === colorNumber)

  return (
    <div style={{ padding: '0 0.125rem' }}>
      {colors && (
        <ImageColorPicker
          colors={colors}
          imgSrc={img}
          initialPinLocations={initPins.map((pin) => ({ x: pin.x * 100, y: pin.y * 100 }))}
          pinRenderer={(props) => (
            <ColorPin
              {...props}
              buttonContent={(color) => (
                <FontAwesomeIcon
                  aria-label={isColorAdded(color) ? 'added' : 'add'}
                  icon={isColorAdded(color) ? ['fa', 'check-circle'] : ['fal', 'plus-circle']}
                  style={{ color: getContrastYIQ(color.hex) }}
                />
              )}
              labelContent={(color) => (
                <div className={baseClass}>
                  <p className={`${baseClass}__number`}>{fullColorNumber(color.brandKey, color.colorNumber, brandKeyNumberSeparator)}</p>
                  <p className={`${baseClass}__name`}>{color.name}</p>
                </div>
              )}
              onColorAdded={(color) => dispatch(add(color))}
            />
          )}
          removeButtonContent={
            <FontAwesomeIcon aria-label='remove' icon={['fa', 'trash']} style={{ display: 'inline-block' }} />
          }
        />
      )}
    </div>
  )
}

export default InspiredScene
