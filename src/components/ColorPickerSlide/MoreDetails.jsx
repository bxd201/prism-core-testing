// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { Link } from 'react-router-dom'

type Props = {
  isShowSlider: boolean,
  associatedColorCollection: Object
}

export default function MoreDetailsCollapse (props: Props) {
  const [close, handleCollapse] = useState(true)
  const { isShowSlider, associatedColorCollection } = props
  const baseClass = 'prism-color-more-detail'
  if (!isShowSlider) {
    return null
  }

  return (
    <div className={`${baseClass}__wrapper`}>
      {!close &&
        <div className={`${baseClass}__header`}>
          <div className={`${baseClass}__header__title`}>Selected from {associatedColorCollection.name}</div>
          <Link className={`${baseClass}__header__link`} to={{ pathname: '/color-collections', state: { collectionSummary: associatedColorCollection } }}>
            VIEW FULL COLLECTION
          </Link>
        </div>
      }
      <button tabIndex='0' className={`${baseClass}__collapse__button ${!close ? `${baseClass}__collapse__button--open` : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={() => handleCollapse(!close)}>
        {!close && <span>CLOSE</span>}
        {close && <span>DETAILS</span>}
        {!close && <FontAwesomeIcon className={`${baseClass}__toggle-carets`} icon={['fa', 'caret-up']} />}
        {close && <FontAwesomeIcon className={`${baseClass}__toggle-carets`} icon={['fa', 'caret-down']} />}
      </button>
    </div>
  )
}
