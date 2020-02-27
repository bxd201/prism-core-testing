// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'
import kebabCase from 'lodash/kebabCase'

import type { Color } from '../../../shared/types/Colors.js.flow'

import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  color: Color,
  familyLink?: string
}

function ColorInfo ({ color, familyLink }: Props) {
  return (
    <div className='color-info__details-tab-wrapper'>
      <h5 className='visually-hidden'><FormattedMessage id='DETAILS' /></h5>
      {familyLink && color.colorFamilyNames.length &&
        <div className='color-info__chunk'>
          <a className='view-family-link' href={familyLink + kebabCase(color.colorFamilyNames[0])}>
              View all {color.colorFamilyNames[0]} paint colors →
          </a>
        </div>
      }
      <div className='color-info__chunk'>
        <ul className='color-info__visual-specifications'>
          <li className='color-info__visual-specification'>
            <dl>
              <dt className='color-info__description-term'>R:</dt>
              <dd className='color-info__description-definition'>{color.red}</dd>
              <dt className='color-info__description-term'>G:</dt>
              <dd className='color-info__description-definition'>{color.green}</dd>
              <dt className='color-info__description-term'>B:</dt>
              <dd className='color-info__description-definition'>{color.blue}</dd>
            </dl>
          </li>
          <li className='color-info__visual-specification'>
            <dl>
              <dt className='color-info__description-term'>Hex Value:</dt>
              <dd className='color-info__description-definition'>{color.hex}</dd>
            </dl>
          </li>
          {color.lrv &&
            <li className='color-info__visual-specification'>
              <dl>
                <dt className='color-info__description-term'>LRV:</dt>
                <dd className='color-info__description-definition'>{Math.round(color.lrv)}</dd>
              </dl>
            </li>}
        </ul>
      </div>
      {color.brandedCollectionNames && (color.brandedCollectionNames.length > 0) && (
        <div className='color-info__chunk'>
          <dl>
            <dt className='color-info__description-term'><FormattedMessage id='COLOR_COLLECTIONS' />:</dt>
            <dd className='color-info__description-definition'>{color.brandedCollectionNames.join(', ')}</dd>
          </dl>
        </div>
      )}
    </div>
  )
}

export default ColorInfo
