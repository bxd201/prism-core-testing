// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { fullColorNumber } from '../../../shared/helpers/ColorUtils'

type Props = {
  color: Object
}

function ColorViewer ({ color }: Props) {
  const BASE_CLASS = 'color-info'

  return (
    <div className={`${BASE_CLASS}__expanded-title`}>
      <h1 className={`${BASE_CLASS}__name-number`}>
        <span className={`${BASE_CLASS}__number`}>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
        <span className={`${BASE_CLASS}__name`}>{color.name}</span>
      </h1>
      <h2 className={`${BASE_CLASS}__type`}>
        {(color.isInterior) ? <FormattedMessage id='INTERIOR' /> : ''}
        {(color.isInterior && color.isExterior) ? ' / ' : ''}
        {(color.isExterior) ? <FormattedMessage id='EXTERIOR' /> : ''}
      </h2>
      {color.storeStripLocator && (
        <h3 className={`${BASE_CLASS}__rack-location`}>
          <FormattedMessage id='LOCATION_NUMBER' />: {color.storeStripLocator}
        </h3>
      )}
    </div>
  )
}

export default ColorViewer
