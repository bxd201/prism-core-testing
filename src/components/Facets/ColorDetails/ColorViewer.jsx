// @flow
import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import type { Color } from '../../../shared/types/Colors.js.flow'
import { fullColorNumber } from '../../../shared/helpers/ColorUtils'
import ConfigurationContext, { type ConfigurationContextType } from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { shouldAllowFeature } from '../../../shared/utils/featureSwitch.util'
import { FEATURE_EXCLUSIONS } from '../../../constants/configurations'

type Props = {
  color: Color
}

function ColorViewer ({ color }: Props) {
  const { featureExclusions } = useContext<ConfigurationContextType>(ConfigurationContext)
  const BASE_CLASS = 'color-info'

  return (
    <div className={`${BASE_CLASS}__expanded-title`}>
      <h1 className={`${BASE_CLASS}__name-number`}>
        <span className={`${BASE_CLASS}__number`}>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
        <span className={`${BASE_CLASS}__name`}>{color.name}</span>
      </h1>
      {shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.colorDetailsSubtitles) && (
        <>
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
        </>
      )}
    </div>
  )
}

export default ColorViewer
