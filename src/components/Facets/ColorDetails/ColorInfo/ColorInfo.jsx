// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'

const ColorInfo = ({ color }: Object) => {
  return (
    <div className='color-info__details-tab-wrapper'>
      <h5 className='visually-hidden'><FormattedMessage id='DETAILS' /></h5>
      {/* <a className='color-info__family-link' href='/color'>View All Orange Paint Colors </a> */}
      <ul className='color-info__visual-specifications'>
        <li className='color-info__visual-specification'>
          <dl>
            <dt className='color-info__description-term'>R: </dt>
            <dd className='color-info__description-definition'>{color.red}</dd>
            <dt className='color-info__description-term'>G: </dt>
            <dd className='color-info__description-definition'>{color.green}</dd>
            <dt className='color-info__description-term'>B: </dt>
            <dd className='color-info__description-definition'>{color.blue}</dd>
          </dl>
        </li>
        <li className='color-info__visual-specification'>
          <dl>
            <dt className='color-info__description-term'>Hex Value: </dt>
            <dd className='color-info__description-definition'>{color.hex}</dd>
          </dl>
        </li>
        <li className='color-info__visual-specification'>
          <dl>
            <dt className='color-info__description-term'>LRV: </dt>
            <dd className='color-info__description-definition'>{Math.round(color.lrv)}</dd>
          </dl>
        </li>
      </ul>
      {color.brandedCollectionNames && (
        <dl>
          <dt className='color-info__description-term'>Color Collections: </dt>
          <dd className='color-info__description-definition'>{color.brandedCollectionNames.join(', ')}</dd>
        </dl>
      )}
    </div>
  )
}

export default ColorInfo
