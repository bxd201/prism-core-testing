import React from 'react'
import { ColorPin, ImageColorPicker } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { withColorData } from './withColorData'
import { LivePaletteProps } from './LivePalette'

export function SingleImageColorPicker({ colors, lpColors, setLpColors }: LivePaletteProps) {
  const addLpColor = color => { setLpColors([...lpColors, color]) }
  const isColorAdded = ({ colorNumber }): boolean => lpColors.some((c) => c.colorNumber === colorNumber)
  const img = 'https://sherwin.scene7.com/is/image/sw/prism-cvw-lowes-nav-color-collections?fmt=jpg&qlt=95'

  return (
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
  )
}

export default withColorData(SingleImageColorPicker)
