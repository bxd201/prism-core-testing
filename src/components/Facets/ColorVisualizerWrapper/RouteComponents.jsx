/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { useEffect } from 'react'
import {
  renderingData,
  scenesContentTitle,
  subTitleDigitalColorWall,
  subTitleMatchAPhoto,
  subTitlePaintedPhotos,
  subTitleUseOurPhotos,
  subTitleUploadYourPhoto
} from './data.js'
import './DropDown.scss'
import { Link, type RouterHistory } from 'react-router-dom'
import { withRouter } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  isMobileOnly,
  isTablet,
  isIOS,
  isAndroid
} from 'react-device-detect'
import { FormattedMessage, useIntl } from 'react-intl'
import at from 'lodash/at'

type Props = {
  dataKey: string,
  close: Function,
  history: RouterHistory,
  exploreColorsLinkRef: RefObject,
  isTabbedOutFromHelp: boolean
}

const KEY_CODE_TAB = 9
const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32

const DropDownMenu = (props: Props) => {
  const { dataKey, history: { location: { state: isKeyDownRoute } }, exploreColorsLinkRef, isTabbedOutFromHelp } = props
  const { content } = renderingData[dataKey]
  const labelRefs = content.subContent.reduce((acc, value) => {
    acc[value.id] = React.createRef()
    return acc
  }, {})
  const inputRef = React.useRef()
  const { messages = {} } = useIntl()

  useEffect(() => {
    if (isKeyDownRoute || isTabbedOutFromHelp) {
      labelRefs[0].current.focus()
    }
  }, [isKeyDownRoute])

  const labelKeyDownHandler = (e, data, props) => {
    if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      if (data.subTitleIdentifier !== subTitleMatchAPhoto && data.subTitleIdentifier !== subTitleUploadYourPhoto) {
        redirectTo(data.url, props, data.subTitleIdentifier)
      } else {
        if (inputRef.current) {
          e.preventDefault()
          inputRef.current.click()
        }
      }
    } else if (e.shiftKey && e.keyCode === KEY_CODE_TAB && (data.subTitleIdentifier === subTitleDigitalColorWall || data.subTitleIdentifier === subTitlePaintedPhotos || data.subTitleIdentifier === subTitleUseOurPhotos)) {
      e.preventDefault()
      if (exploreColorsLinkRef.current) {
        exploreColorsLinkRef.current.focus()
      }
    }
  }

  const closeDropDown = (e) => {
    props.close(e)
  }

  const closeButtonKeyDownHandler = (e) => {
    if (!e.shiftKey && e.keyCode === KEY_CODE_TAB) {
      e.preventDefault()
      if (exploreColorsLinkRef.current) {
        exploreColorsLinkRef.current.focus()
      }
    } else if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      e.preventDefault()
      props.close(e)
    }
  }

  return (
    <div className='dashboard-submenu'>
      <div className='dashboard-submenu__header'>{at(messages, content.title)[0]}</div>
      <div className='dashboard-submenu__content'>
        <ul>
          {
            content.subContent.map((data, key) => (
              <li className={(content.titleIdentifier === scenesContentTitle) ? `dashboard-submenu__content__paint-photo-li` : ``} key={key} ref={labelRefs[key]} tabIndex={0} role='tab' onMouseDown={(e) => e.preventDefault()} onClick={() => redirectTo(data.url, props, data.subTitleIdentifier)} onKeyDown={(e) => labelKeyDownHandler(e, data, props)}>
                <label tabIndex='-1' htmlFor={(data.subTitleIdentifier === subTitleMatchAPhoto || data.subTitleIdentifier === subTitleUploadYourPhoto) ? 'file-input' : ''} className='dashboard-submenu__content__description'>
                  <div
                    className={`dashboard-submenu__content__description-img-wrapper ${(data.subTitleIdentifier === subTitleDigitalColorWall) ? `dashboard-submenu__content__description--explore-color` : (data.subTitleIdentifier === subTitlePaintedPhotos) ? `dashboard-submenu__content__description--painted-scene` : ``}`}
                    style={{
                      backgroundImage: `url(${(data.subTitleIdentifier !== subTitleUploadYourPhoto) ? data.image : (isMobileOnly && isIOS) ? data.imageiPhone : (isMobileOnly && isAndroid) ? data.imageAndroid : (isTablet && isIOS) ? data.imageiPad : data.image})`
                    }}
                  />
                  <div className='dashboard-submenu__content__description-title'>
                    {(data.subTitleIdentifier !== subTitleUploadYourPhoto) ? at(messages, data.subTitle)[0] : (((isMobileOnly || isTablet) && isIOS) || isAndroid) ? at(messages, data.subTitleMobile)[0] : at(messages, data.subTitle)[0]}
                  </div>
                  <div className='dashboard-submenu__content__description-content'>
                    {(data.subTitleIdentifier !== subTitleUploadYourPhoto) ? at(messages, data.subContent)[0] : (isMobileOnly && isIOS) ? at(messages, data.subContentiPhone)[0] : (isMobileOnly && isAndroid) ? at(messages, data.subContentAndroid)[0] : (isTablet && isIOS) ? at(messages, data.subContentiPad)[0] : at(messages, data.subContent)[0]}
                  </div>
                  { data.description && !isMobileOnly && !isTablet && <div className='dashboard-submenu__content__description-tip'>
                    <em><strong>{at(messages, data.description)[0]}</strong></em>
                  </div>}
                  {(data.subTitleIdentifier === subTitleUploadYourPhoto) && (isMobileOnly || isTablet) && isIOS && <div className={`dashboard-submenu__content__description-ios-app-icon`} /> }
                  {(data.subTitleIdentifier === subTitleUploadYourPhoto) && (isMobileOnly || isTablet) && isAndroid && <div className={`dashboard-submenu__content__description-android-app-icon`} /> }
                  {(data.subTitleIdentifier === subTitleMatchAPhoto || data.subTitleIdentifier === subTitleUploadYourPhoto) &&
                  <input
                    tabIndex='0'
                    data-noshow
                    type='file'
                    accept={null}
                    onChange={(e) => handleChange(e, props, data.subTitleIdentifier)}
                    style={{ 'display': 'none' }}
                    id='file-input'
                    ref={inputRef}
                  />}
                </label>
              </li>
            ))
          }
        </ul>
      </div>
      <Link tabIndex='-1' to={`/active`} onClick={closeDropDown} onKeyDown={closeButtonKeyDownHandler}>
        <button className={`dashboard-submenu__cls-btn dashboard-submenu__button`} tabIndex='0' onClick={closeDropDown} onKeyDown={closeButtonKeyDownHandler}>
          <div className={`dashboard-submenu__close`}>
            <span><FormattedMessage id='CLOSE' /></span>&nbsp;<FontAwesomeIcon onClick={closeDropDown} className={``} icon={['fa', 'chevron-up']} />
          </div>
          <div className={`dashboard-submenu__cancel`}>
            <FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} />
          </div>
        </button>
      </Link>
    </div>
  )
}

const redirectTo = (url, props, type) => {
  if (type !== subTitleMatchAPhoto && type !== subTitleUploadYourPhoto) {
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
