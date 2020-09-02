// @flow
import React from 'react'

import FastMask from 'src/components/FastMask/FastMask'
import LivePalette from 'src/components/LivePalette/LivePalette'

import './ResultsPage.scss'
import '../../JSFCommon.scss'

const baseClass = 'JSFResultsPage'

type ResultsPageProps = {
  referenceImgUrl?: string
}

function ResultsPage (props: ResultsPageProps) {
  const { referenceImgUrl } = props

  return (
    <div className={baseClass}>
      <div className='JSFCommon__band JSFCommon__band--pad'>
        <div className='JSFCommon__content'>
          <div className={`${baseClass}__summary ${baseClass}__cols`}>
            <div className={`${baseClass}__cols__col ${baseClass}__cols__col--content`}>
              <div className={`${baseClass}__summary__text JSFCommon__text`}>
                <h1 className='JSFCommon__title'>Your Results</h1>
                <p>We've also compiled some colors for your project. Whether you want to match your couch, your painting, or your rug, we've got you covered!</p>
              </div>
            </div>
            {referenceImgUrl ? <div className={`${baseClass}__cols__col ${baseClass}__cols__col--media`}>
              <figure className={`${baseClass}__summary__media`}>
                <img className={`${baseClass}__summary__media__image`} src={referenceImgUrl} alt='Original' />
                <figcaption className={`${baseClass}__summary__media__caption`}>Original image</figcaption>
              </figure>
            </div> : null}
          </div>
        </div>
      </div>
      <div className='JSFCommon__band JSFCommon__band--dark'>
        <div className='JSFCommon__content'>
          <FastMask hideUploadBtn />
        </div>
      </div>
      <div className='JSFCommon__band'>
        <div className='JSFCommon__content'>
          <LivePalette />
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
