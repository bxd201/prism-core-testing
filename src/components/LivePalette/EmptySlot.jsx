import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function EmptySlot () {
  return (
    <div className='prism-live-palette__slot prism-live-palette__slot--empty'>
      <FontAwesomeIcon className='prism-live-palette__icon' icon={['fal', 'plus-circle']} size='2x' />
    </div>
  )
}

export default EmptySlot
