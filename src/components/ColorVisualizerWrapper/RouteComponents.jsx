/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { Fragment } from 'react'
import { renderingData } from './data.js'
import './DropDown.scss'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'

type Props = {
  dataKey: string,
  close: Function
}

const DropDownMenu = (props: Props) => {
  const { dataKey } = props
  const { content } = renderingData[dataKey]
  return (
    <div className='dashboard-submenu'>
      <div className='dashboard-submenu__header'>{content.title}</div>
      <div className='dashboard-submenu__content'>
        {
          content.subContent.map((data, key) => (
            <Fragment key={key}>
              <label role='button' htmlFor='file-input' className='dashboard-submenu__content__description' onClick={() => redirectTo(data.url, props, data.subTitle)}>
                <div className='dashboard-submenu__content__description-img-wrapper'>
                  <img className='dashboard-submenu__content__description-img' alt='' src={data.image} />
                </div>
                <div className='dashboard-submenu__content__description-title'>
                  {data.subTitle}
                </div>
                <div className='dashboard-submenu__content__description-content'>
                  {data.subContent}
                </div>
                { data.description && <div className='dashboard-submenu__content__description-tip'>
                  <em><strong>{data.description}</strong></em>
                </div>}
                {(data.subTitle === 'MATCH A PHOTO' || data.subTitle === 'UPLOAD YOUR PHOTO') &&
                <input
                  tabIndex='0'
                  data-noshow
                  type='file'
                  accept={null}
                  onChange={(e) => handleChange(e, props, data.subTitle)}
                  style={{ 'display': 'none' }}
                  id='file-input'
                />}
              </label>
            </Fragment>
          ))
        }
      </div>
      <button className='dashboard-submenu__cls-btn' onClick={props.close}>
        <Link to='/active'>CLOSE</Link>
      </button>
    </div>
  )
}

const redirectTo = (url, props, type) => {
  if (type !== 'MATCH A PHOTO' && type !== 'UPLOAD YOUR PHOTO') {
    props.history.push(url)
    props.redirectTo()
    props.getImageUrl('null', 'other')
  }
}

const handleChange = (e, props, type) => {
  const imgUrl = URL.createObjectURL(e.target.files[0])
  props.getImageUrl(imgUrl, type)
}

export default withRouter(DropDownMenu)
