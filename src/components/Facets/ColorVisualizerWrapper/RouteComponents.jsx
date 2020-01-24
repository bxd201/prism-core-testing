/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { Fragment, useEffect } from 'react'
import { renderingData } from './data.js'
import './DropDown.scss'
import { Link, type RouterHistory } from 'react-router-dom'
import { withRouter } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
  dataKey: string,
  close: Function,
  history: RouterHistory,
  helpLinkRef: RefObject,
  isTabbedOutFromHelp: boolean
}

const KEY_CODE_TAB = 9
const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32

const DropDownMenu = (props: Props) => {
  const { dataKey, history: { location: { state: isKeyDownRoute } }, helpLinkRef, isTabbedOutFromHelp } = props
  const { content } = renderingData[dataKey]
  const labelRefs = content.subContent.reduce((acc, value) => {
    acc[value.id] = React.createRef()
    return acc
  }, {})
  const inputRef = React.useRef()

  useEffect(() => {
    if (isKeyDownRoute || isTabbedOutFromHelp) {
      labelRefs[0].current.focus()
    }
  }, [isKeyDownRoute])

  const labelKeyDownHandler = (e, data, props) => {
    if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      if (data.subTitle !== 'MATCH A PHOTO' && data.subTitle !== 'UPLOAD YOUR PHOTO') {
        redirectTo(data.url, props, data.subTitle)
      } else {
        if (inputRef.current) {
          e.preventDefault()
          inputRef.current.click()
        }
      }
    } else if (e.shiftKey && e.keyCode === KEY_CODE_TAB && (data.subTitle === 'DIGITAL COLOR WALL' || data.subTitle === 'PAINTED PHOTOS' || data.subTitle === 'USE OUR PHOTOS')) {
      e.preventDefault()
      if (helpLinkRef.current) {
        helpLinkRef.current.focus()
      }
    }
  }

  const closeDropDown = (e) => {
    props.close(e)
  }

  const closeButtonKeyDownHandler = (e) => {
    if (!e.shiftKey && e.keyCode === KEY_CODE_TAB) {
      e.preventDefault()
      if (helpLinkRef.current) {
        helpLinkRef.current.focus()
      }
    } else if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      e.preventDefault()
      props.close(e)
    }
  }

  return (
    <div className='dashboard-submenu'>
      <div className='dashboard-submenu__header'>{content.title}</div>
      <div className='dashboard-submenu__content'>
        {
          content.subContent.map((data, key) => (
            <Fragment key={key}>
              <label ref={labelRefs[key]} tabIndex={0} role='button' htmlFor='file-input' className='dashboard-submenu__content__description' onMouseDown={(e) => e.preventDefault()} onClick={() => redirectTo(data.url, props, data.subTitle)} onKeyDown={(e) => labelKeyDownHandler(e, data, props)}>
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
                  ref={inputRef}
                />}
              </label>
            </Fragment>
          ))
        }
      </div>
      <Link tabIndex='-1' to={`/active`} onClick={closeDropDown} onKeyDown={closeButtonKeyDownHandler}>
        <button className={`dashboard-submenu__cls-btn dashboard-submenu__button`} tabIndex='0' onClick={closeDropDown} onKeyDown={closeButtonKeyDownHandler}>
          <div className={`dashboard-submenu__close`}>
            <span>CLOSE</span>&nbsp;<FontAwesomeIcon onClick={closeDropDown} className={``} icon={['fa', 'chevron-up']} />
          </div>
          <div className={`dashboard-submenu__cancel`}>
            <FontAwesomeIcon className={``} icon={['fa', 'times']} />
          </div>
        </button>
      </Link>
    </div>
  )
}

const redirectTo = (url, props, type) => {
  if (type !== 'MATCH A PHOTO' && type !== 'UPLOAD YOUR PHOTO') {
    props.history.push(url)
    props.redirectTo()
    props.getImageUrl('null', type)
  }
}

const handleChange = (e, props, type) => {
  const imgUrl = URL.createObjectURL(e.target.files[0])
  props.getImageUrl(imgUrl, type)
}

export default withRouter(DropDownMenu)
