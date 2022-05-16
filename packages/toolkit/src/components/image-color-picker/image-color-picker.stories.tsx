import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import ImageColorPicker from './image-color-picker'
import ColorPin from '../color-pin/color-pin'
import colors from '../../test-utils/mocked-endpoints/colors.json'
// @ts-ignore
import landscape from '../../test-utils/images/landscape.png'
// @ts-ignore
import portrait from '../../test-utils/images/portrait.jpeg'
import { Color } from '../../types'

const Template = (args): JSX.Element => {
  const [addedColors, setAddedColors] = useState<Color[]>([])
  const isColorAdded = ({ colorNumber }): boolean => addedColors.some((c) => c.colorNumber === colorNumber)
  return (
    <ImageColorPicker
      {...args}
      initialPinLocations={[
        { x: 25, y: 25 },
        { x: 25, y: 75 },
        { x: 75, y: 25 },
        { x: 75, y: 75 }
      ]}
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
          isColorAdded={isColorAdded}
          labelContent={(color: Color) => (
            <div className='whitespace-nowrap'>
              <p>{`${color.brandKey}${color.colorNumber}`}</p>
              <p className='leading-4 font-bold'>{color.name}</p>
            </div>
          )}
          onColorAdded={(color) => setAddedColors([...addedColors, color])}
        />
      )}
      removeButtonContent={<FontAwesomeIcon aria-label='remove' icon={faTrash} style={{ display: 'inline-block' }} />}
    />
  )
}

export const LandscapeImage = Template.bind({})
LandscapeImage.args = {
  imgSrc: landscape,
  colors,
  'aria-label': 'pick colors from image of a flower'
}

export const PortraitImage = Template.bind({})
PortraitImage.args = {
  imgSrc: portrait,
  colors,
  'aria-label': 'pick colors from image of a desert landscape'
}

export const NoDefinedColors = Template.bind({})
NoDefinedColors.args = {
  imgSrc: landscape,
  'aria-label': 'pick colors from image of a flower'
}

export default {
  title: 'ImageColorPicker',
  component: ImageColorPicker,
  argTypes: {
    colors: { table: { disable: true } },
    initialPinLocations: { table: { disable: true } },
    pinRenderer: { table: { disable: true } },
    removeButtonContent: { table: { disable: true } }
  }
}
