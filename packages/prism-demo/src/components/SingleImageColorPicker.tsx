import React, { useState, useEffect, useContext } from 'react'
import Prism, { ImageColorPicker, ColorPin } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/pro-solid-svg-icons'
import axios from 'axios'

export function SingleImageColorPIcker() {
  const [sherwinColors, setSherwinColors] = useState([])
  const img = 'https://sherwin.scene7.com/is/image/sw/prism-cvw-lowes-nav-color-collections?fmt=jpg&qlt=95'

  useEffect(() => {
    axios
      .get('https://api.sherwin-williams.com/prism/v1/colors/sherwin')
      .then((r) => r.data)
      .then((colors) => setSherwinColors(colors))
  }, [])

  return (
    <Prism>
      <ImageColorPicker
        imgSrc={img}
        // @ts-ignore
        colors={sherwinColors}
        pinRenderer={(props) => (
          // @ts-ignore
          <ColorPin
            {...props}
            labelContent={(color) => (
              <>
                <p style={{ lineHeight: '1.1rem', whiteSpace: 'nowrap' }}>{`${color.brandKey} ${color.colorNumber}`}</p>
                <p style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{color.name}</p>
              </>
            )}
          />
        )}
        removeButtonContent={<FontAwesomeIcon aria-label='remove' icon={faTrash} style={{ display: 'inline-block' }} />}
      />
    </Prism>
  )
}

export default SingleImageColorPIcker
