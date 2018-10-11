import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const EmptySlot = () => {
  return (
    <button className='prism-live-palette__slot prism-live-palette__slot--empty'>
      <FontAwesomeIcon icon='plus-circle' size='lg' />
    </button>
  )
}

export default EmptySlot
