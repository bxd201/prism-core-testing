// @flow
import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { FEATURE_EXCLUSIONS } from '../../../constants/configurations'
import ConfigurationContext, { type ConfigurationContextType } from '../../../contexts/ConfigurationContext/ConfigurationContext'
import { fullColorNumber } from '../../../shared/helpers/ColorUtils'
import type { Color } from '../../../shared/types/Colors.js.flow'
import { shouldAllowFeature } from '../../../shared/utils/featureSwitch.util'

const baseClass = 'color-info'

type Props = { color: Color }

function ColorViewer ({ color }: Props) {
  const { colorWall: { colorSwatch = {} }, featureExclusions } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
  const baseTitleClass = houseShaped ? `${baseClass}-house-shaped` : baseClass

  return (
    <div className={`${baseClass}__expanded-title`}>
      <h1 className={`${baseTitleClass}${colorNumOnBottom ? '__name-number' : '__number-name'}`}>
        <span className={`${baseTitleClass}__number`}>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
        <span className={`${baseTitleClass}__name`}>{color.name}</span>
      </h1>
      {shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.colorDetailsSubtitles) && (
        <>
          <h2 className={`${baseClass}__type`}>
            {(color.isInterior) ? <FormattedMessage id='INTERIOR' /> : ''}
            {(color.isInterior && color.isExterior) ? ' / ' : ''}
            {(color.isExterior) ? <FormattedMessage id='EXTERIOR' /> : ''}
          </h2>
          {color.storeStripLocator && (
            <h3 className={`${baseClass}__rack-location`}>
              <FormattedMessage id='LOCATION_NUMBER' />: {color.storeStripLocator}
            </h3>
          )}
        </>
      )}
    </div>
  )
}

export default ColorViewer
