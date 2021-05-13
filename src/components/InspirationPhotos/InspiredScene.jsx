// @flow
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { add } from 'src/store/actions/live-palette'
import Prism, { ImageColorPicker, ColorPin } from 'prism-lib'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'

type InspiredProps = { data: Object, isActivedPage: boolean }

export default ({ isActivedPage, data }: InspiredProps) => {
  const dispatch = useDispatch()

  const livePaletteColors = useSelector(store => store.lp.colors)
  const colors = useSelector(store => store.colors.unorderedColors)

  const isColorAdded = ({ colorNumber }): boolean => livePaletteColors.some(c => c.colorNumber === colorNumber)

  return (
    <Prism style={{ padding: '0.125rem', marginBottom: '0.75rem' }}>
      <ImageColorPicker
        colors={colors}
        initialPinLocations={data.initPins.map(pin => ({ x: pin.x * 100, y: pin.y * 100 }))}
        removeButtonContent={<FontAwesomeIcon icon={faTrash} style={{ display: 'inline-block' }} />}
        pinTemplate={
          <ColorPin
            onColorAdded={color => dispatch(add(color))}
            buttonContent={color => (
              <FontAwesomeIcon icon={isColorAdded(color) ? faCheckCircle : faPlusCircle} style={{ color: 'white' }} />
            )}
          />
        }
      >
        <img src={data.img} alt='' />
      </ImageColorPicker>
    </Prism>
  )
}
