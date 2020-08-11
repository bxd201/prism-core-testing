// @flow
import React from 'react'

import facetBinder from 'src/facetSupport/facetBinder'

function JumpStartFacet () {
  return (
    <>
      <div className='prism__root-container'>
        <h1>JumpStart</h1>
      </div>
    </>
  )
}

export default facetBinder(JumpStartFacet, 'JumpStartFacet')
