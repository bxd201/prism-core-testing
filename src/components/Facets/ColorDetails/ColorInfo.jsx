// @flow
import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import type { Color, FamilyStructure } from '../../../shared/types/Colors.js.flow'
import flattenDeep from 'lodash/flattenDeep'
import intersection from 'lodash/intersection'
import 'src/scss/convenience/visually-hidden.scss'

type Props = { color: Color, familyLink?: string }
function ColorInfo ({ color, familyLink }: Props) {
  const structure: FamilyStructure = useSelector(state => state.colors.structure)

  return (
    <div className='color-info__details-tab-wrapper'>
      <h5 className='visually-hidden'><FormattedMessage id='DETAILS' /></h5>
      {/* see if our active color's families exist in all families; if yes, allow showing the family link */}
      {familyLink && intersection(flattenDeep(structure.map(s => s.families)), color.colorFamilyNames).length > 0 &&
        <div className='color-info__chunk'>
          <a className='view-family-link' href={familyLink}>
            <FormattedMessage id='VIEW_ALL' /> {color.colorFamilyNames[0]} <FormattedMessage id='PAINT_COLORS' /> →
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
