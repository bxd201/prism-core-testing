// @flow
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { add } from 'src/store/actions/live-palette'
import Prism, { ColorPin, ImageColorPicker } from 'prism-lib'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'

type InspiredSceneProps = {
  data: { img: string, initPins: { x: number, y: number }[] }
}

const InspiredScene = ({ data: { img, initPins } }: InspiredSceneProps) => {
  const colors = useSelector((store) => store.colors.unorderedColors)
  const dispatch = useDispatch()
  const livePaletteColors = useSelector((store) => store.lp.colors)

  const isColorAdded = ({ colorNumber }): boolean => livePaletteColors.some((c) => c.colorNumber === colorNumber)

  return (
    <Prism style={{ padding: '0 0.125rem' }}>
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
                  icon={isColorAdded(color) ? faCheckCircle : faPlusCircle}
                  style={{ color: getContrastYIQ(color.hex) }}
                />
              )}
              onColorAdded={(color) => dispatch(add(color))}
            />
          )}
          removeButtonContent={
            <FontAwesomeIcon aria-label='remove' icon={faTrash} style={{ display: 'inline-block' }} />
          }
        />
      )}
    </Prism>
  )
}

export default InspiredScene
