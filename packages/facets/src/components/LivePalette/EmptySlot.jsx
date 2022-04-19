import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'

function EmptySlot () {
  return (
    <div className='prism-live-palette__slot prism-live-palette__slot--empty'>
      <div className='prism-live-palette__slot__guts'>
        <FontAwesomeIcon className='prism-live-palette__slot__icon' icon={['fal', 'plus-circle']} size='2x' />
      </div>
    </div>
  )
}

export default EmptySlot
