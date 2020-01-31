// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

type Props = {
  isShowSlider: boolean,
  associatedColorCollection: Object
}

const colorCollectionsPath = '/color-collections'

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
          <div className={`${baseClass}__header__title`}><FormattedMessage id='SELECTED_FROM' /> {associatedColorCollection.name}</div>
          <Link className={`${baseClass}__header__link`} to={{ pathname: colorCollectionsPath, state: { collectionSummary: associatedColorCollection } }}>
            <FormattedMessage id='VIEW_FULL_COLLECTION' />
          </Link>
        </div>
      }
      <button tabIndex='0' className={`${baseClass}__collapse__button ${!close ? `${baseClass}__collapse__button--open` : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={() => handleCollapse(!close)}>
        {!close && <span><FormattedMessage id='CLOSE' /></span>}
        {close && <span><FormattedMessage id='DETAILS' /></span>}
        {!close && <FontAwesomeIcon className={`${baseClass}__toggle-carets`} icon={['fa', 'caret-up']} />}
        {close && <FontAwesomeIcon className={`${baseClass}__toggle-carets`} icon={['fa', 'caret-down']} />}
      </button>
    </div>
  )
}
