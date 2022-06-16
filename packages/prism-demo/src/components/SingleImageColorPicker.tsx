import React, { useContext } from 'react'
import Prism, { ImageColorPicker, ColorPin } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { withColorData } from './withColorData'
import Context from "../context"

export function SingleImageColorPicker({ colors }: any) {
  const { addLpColor, lpColors } = useContext(Context)
  const isColorAdded = ({ colorNumber }): boolean => lpColors.some((c) => c.colorNumber === colorNumber)
  const img = 'https://sherwin.scene7.com/is/image/sw/prism-cvw-lowes-nav-color-collections?fmt=jpg&qlt=95'

  return (
    <Prism>
      <ImageColorPicker
        imgSrc={img}
        colors={colors}
        pinRenderer={(props) => (
          <ColorPin
            {...props}
            buttonContent={(color) => (
              <FontAwesomeIcon
                aria-label={isColorAdded(color) ? 'added' : 'add'}
                icon={isColorAdded(color) ? faCheckCircle : faPlusCircle}
                style={{ color: color.isDark ? 'white' : 'black' }}
              />
            )}
            labelContent={(color) => (
              <>
                <p style={{ lineHeight: '1.1rem', whiteSpace: 'nowrap' }}>{`${color.brandKey} ${color.colorNumber}`}</p>
                <p style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{color.name}</p>
              </>
            )}
            onColorAdded={(color) => !isColorAdded(color) && addLpColor(color)}
          />
        )}
        removeButtonContent={<FontAwesomeIcon aria-label='remove' icon={faTrash} style={{ display: 'inline-block' }} />}
      />
    </Prism>
  )
}

export default withColorData(SingleImageColorPicker)
