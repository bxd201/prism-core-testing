import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const EmptySlot = () => {
  return (
    <div className='prism-live-palette__slot prism-live-palette__slot--empty'>
      <FontAwesomeIcon className='prism-live-palette__icon' icon={['fal', 'plus-circle']} size='5x' />
    </div>
  )
}

export default EmptySlot
