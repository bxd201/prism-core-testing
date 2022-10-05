// @flow
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Prism, { ColorPin, ImageColorPicker } from '@prism/toolkit'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { fullColorNumber, getContrastYIQ } from 'src/shared/helpers/ColorUtils'
import { add } from 'src/store/actions/live-palette'
import useColors from '../../shared/hooks/useColors'

type InspiredSceneProps = {
  data: { img: string, initPins: { x: number, y: number }[] }
}

const InspiredScene = ({ data: { img, initPins } }: InspiredSceneProps) => {
  // We call useColor to load the colors for cases where loadColor has not already been called.
  // we don't use the colors from what is returned bc the data type for unorderedColors (sting[]) is much thinner in the hook
  // than what is in redux (Color[])
  // We consume the colors from the redux store, since it's a bit redundant to recreate what we already have access to
  // eslint-disable-next-line no-unused-vars
  const [colors] = useColors()
  const unorderedColors = useSelector(store => store.colors?.unorderedColors)
  const dispatch = useDispatch()
  const livePaletteColors = useSelector((store) => store.lp.colors)
  const { brandKeyNumberSeparator, colorWall: { colorSwatch = {} } } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
  const baseClass = `image-color-picker${colorNumOnBottom ? `--name-number${houseShaped ? '-house-shaped' : ''}` : '--number-name'}`

  const isColorAdded = ({ colorNumber }): boolean => livePaletteColors.some((c) => c.colorNumber === colorNumber)

  return (
    <Prism style={{ padding: '0 0.125rem' }}>
      {unorderedColors && (
        <ImageColorPicker
          colors={unorderedColors}
          imgSrc={img}
          initialPinLocations={initPins.map((pin) => ({ x: pin.x * 100, y: pin.y * 100 }))}
          pinRenderer={(props) => {
            return <ColorPin
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
          }}
          removeButtonContent={
            <FontAwesomeIcon aria-label='remove' icon={['fa', 'trash']} style={{ display: 'inline-block' }} />
          }
        />
      )}
    </Prism>
  )
}

export default InspiredScene
