// @flow
// eslint-disable-next-line no-unused-vars
import React, { useRef, useState, useEffect, ReactChildren } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import { isMobileOnly, isTablet, isIOS } from 'react-device-detect'
import { showWarningModal } from 'src/store/actions/scenes'
import { queueImageUpload, setIngestedImage } from 'src/store/actions/user-uploads'
import './ColorVisualizerNav.scss'
import { FEATURE_EXCLUSIONS } from '../../../constants/configurations'
import { shouldAllowFeature } from '../../../shared/utils/featureSwitch.util'
import WithConfigurationContext from '../../../contexts/ConfigurationContext/WithConfigurationContext'
import { createMatchPhotoNavigationWarningModal, createNavigationWarningModal } from '../../CVWModalManager/createModal'
import {
  // cleanupNavigationIntent,
  setNavigationIntent,
  setDirtyNavigationIntent, ACTIVE_SCENE_LABELS_ENUM
} from '../../../store/actions/navigation'
import { ROUTES_ENUM } from './routeValueCollections'
import { MODAL_TYPE_ENUM } from '../../CVWModalManager/constants'
import { triggerPaintSceneLayerPublish } from '../../../store/actions/paintScene'

type DropDownMenuProps = {
  title: string,
  items: {
    img: string,
    imgiPhone?: string,
    imgiPad?: string,
    imgAndroid?: string,
    title: string,
    titleMobile?: string,
    content: string,
    contentAndroid?: string,
    contentiPhone?: string,
    description?: string,
    onClick: () => void
  }[]
}

type ColorVisualizerNavProps = {
  config: any
}

type WrapperProps = {
  children: ReactChildren
}

const HASH_LOCATION_SIZE_MAP = {
  '#/active/scenes': '800px',
  '#/active/inspiration': '600px',
  '#/active/colors': '600px',
  '#/upload/match-photo': '600px'
}

const CONTAINER_SELECTORS = [
  '.dashboard-submenu__content',
  '.cvw__root-container'
]

const resizeRootContainer = () => {
  const hashLocationRequiresResize = Object.keys(HASH_LOCATION_SIZE_MAP).includes(window.location.hash)
  CONTAINER_SELECTORS
    .map(selector => document.querySelector(selector))
    .filter(identity => !!identity)
    .forEach(element => {
      element.style.height = hashLocationRequiresResize ? HASH_LOCATION_SIZE_MAP[window.location.hash] : ''
    })
  if (!hashLocationRequiresResize) {
    window.removeEventListener('hashchange', resizeRootContainer)
  }
}

export const DropDownMenu = ({ title, items }: DropDownMenuProps) => {
  const history = useHistory()
  const selectDevice = (web, iPhone = web, android = web, iPad = web) => (isMobileOnly ? (isIOS ? iPhone : android) : (isTablet ? iPad : web)) || web
  useEffect(() => {
    if (!(isMobileOnly || isTablet)) return
    resizeRootContainer()
    window.addEventListener('hashchange', resizeRootContainer)
  }, [isMobileOnly, isTablet])
  return (
    <>
      <button className='overlay' onClick={() => history.push(ROUTES_ENUM.ACTIVE)} />
      <div className='cvw-dashboard-submenu'>
        <button className='cvw-dashboard-submenu__close' onClick={() => history.push(ROUTES_ENUM.ACTIVE)}>
          <FormattedMessage id='CLOSE' />
          <FontAwesomeIcon className='cvw-dashboard-submenu__close__ico' icon={['fa', 'chevron-up']} />
        </button>
        <h1 className='cvw-dashboard-submenu__header'>{title}</h1>
        <ul className='cvw-dashboard-submenu__content'>
          {items.map(({ img, imgiPhone, imgiPad, imgAndroid, title, titleMobile, content, contentAndroid, contentiPhone, description, onClick }, i, arr) => {
            const Wrapper = ({ children }: WrapperProps) => <button className={`${onClick ? 'cvw-dashboard-submenu__content__btn' : ''}`} disabled={!onClick} onClick={onClick}>{children}</button>
            const isWide = (arr.length > 2 && i === 0)
            return (
              <li key={i} className={`cvw-dashboard-submenu__content__item ${isWide ? 'cvw-dashboard-submenu__content__item--wide' : ''}`}>
                <Wrapper>
                  {img ? <div className={`cvw-dashboard-submenu__content__image ${isWide ? 'cvw-dashboard-submenu__content__image--wide' : ''}`} style={{ 'backgroundImage': `url(${selectDevice(img, imgiPhone, imgAndroid, imgiPad)})` }} alt='' /> : null}
                  <h3 className='cvw-dashboard-submenu__content__title'>{selectDevice(title, titleMobile)}</h3>
                  <p className='cvw-dashboard-submenu__content__content'>{selectDevice(content, contentiPhone, contentAndroid)}</p>
                  {description && <p className='cvw-dashboard-submenu__content__tip'>{description}</p>}
                  {(i === 1) && <p className='cvw-dashboard-submenu__content__tip'>Please select a PNG or JPG file</p>}
                </Wrapper>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

const ColorVisualizerNav = (props: ColorVisualizerNavProps) => {
  const { config: { featureExclusions, cvw, brand } } = props
  const { messages, formatMessage } = useIntl()
  const intl = useIntl()
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const isActiveScenePolluted: string = useSelector(store => store.scenePolluted)
  const useSmartMask = useSelector(state => state.useSmartMask)
  const isColorwallModallyPresented = useSelector(store => store.isColorwallModallyPresented)

  const hiddenImageUploadInput: { current: ?HTMLElement } = useRef()
  const navBtnRef: {current: ?HTMLElement} = useRef()
  const navRef: {current: ?HTMLElement} = useRef()
  const matchPhotoShown = useSelector(store => store.isMatchPhotoPresented)

  const getDropDownItemsForGetInspired = () => {
    const items = [
      {
        img: cvw?.navPaintedScenes,
        title: messages['NAV_LINKS.PAINTED_PHOTOS'],
        content: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.PAINTED_PHOTOS'],
        onClick: () => history.push(ROUTES_ENUM.USE_OUR_IMAGE)
      },
      {
        img: cvw?.navExpertColorPicks,
        title: messages['NAV_LINKS.EXPERT_COLOR_PICKS'],
        content: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.EXPERT_COLOR_PICKS'],
        onClick: () => history.push(ROUTES_ENUM.EXPERT_COLORS)
      },
      {
        img: cvw?.navSamplePhotos,
        title: messages['NAV_LINKS.INSPIRATIONAL_PHOTOS'],
        content: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.INSPIRATIONAL_PHOTOS'],
        onClick: () => history.push(ROUTES_ENUM.COLOR_FROM_IMAGE)
      }
    ]

    return items.filter((item) => {
      if (item.title === messages['NAV_LINKS.INSPIRATIONAL_PHOTOS']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.inspirationalPhotos)
      }
      if (item.title === messages['NAV_LINKS.EXPERT_COLOR_PICKS']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.expertColorPicks)
      }

      if (item.title === messages['NAV_LINKS.PAINTED_PHOTOS']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.paintedPhotos)
      }

      return true
    })
  }

  const getDropDownItemsForPaintAPhoto = () => {
    const items = [
      {
        img: cvw?.navSampleScenes,
        title: messages['NAV_LINKS.USE_OUR_PHOTOS'],
        content: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.USE_OUR_PHOTOS'],
        onClick: () => history.push(ROUTES_ENUM.PAINT_PHOTO)
      },
      {
        img: cvw?.navThumbMyPhotos,
        imgiPhone: cvw?.navThumbIphone,
        imgiPad: cvw?.navThumbIpad,
        imgAndroid: cvw?.navThumbAndroid,
        title: messages['NAV_LINKS.UPLOAD_YOUR_PHOTO'],
        titleMobile: messages['NAV_LINKS.GET_THE_APP'],
        content: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO'],
        contentAndroid: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_ANDROID'],
        contentiPad: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_IPAD'],
        contentiPhone: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_IPHONE'],
        description: messages['NAV_DROPDOWN_LINK_TIP_DESCRIPTION.UPLOAD_YOUR_PHOTO'],
        onClick: !(isMobileOnly || isTablet) ? () => {
          const selectDevice = (web, iPhone = web, android = web, iPad = web) => (isMobileOnly ? (isIOS ? iPhone : android) : (isTablet ? iPad : web)) || web
          history.push(selectDevice(
            '/upload/paint-scene',
            'https://play.google.com/store/apps/details?id=com.colorsnap',
            'https://itunes.apple.com/us/app/colorsnap-visualizer-iphone/id316256242?mt=8',
            'https://itunes.apple.com/us/app/colorsnap-studio/id555300600?mt=8'
          ))

          if (hiddenImageUploadInput.current) {
            hiddenImageUploadInput.current.value = ''
            // trigger upload image system modal
            dispatch(setNavigationIntent(ROUTES_ENUM.UPLOAD_PAINT_SCENE))
            hiddenImageUploadInput.current.click()
          }
        } : undefined
      }
    ]

    return items.filter((item) => {
      if (item.title === messages['NAV_LINKS.USE_OUR_PHOTOS']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.useOurPhotos)
      }

      if (item.title === messages['NAV_LINKS.UPLOAD_YOUR_PHOTO']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.uploadYourPhoto)
      }

      return true
    })
  }

  const getDropDownItemsForExploreColors = () => {
    const items = [
      {
        img: cvw?.navExploreColor,
        title: messages['NAV_LINKS.DIGITAL_COLOR_WALL'],
        content: formatMessage({ id: 'NAV_DROPDOWN_LINK_SUB_CONTENT.DIGITAL_COLOR_WALL' }, { brand }),
        onClick: () => history.push(ROUTES_ENUM.COLOR_WALL + '/section/sherwin-williams-colors')
      },
      {
        img: cvw?.navColorCollections,
        title: messages['NAV_LINKS.COLOR_COLLECTIONS'],
        content: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.COLOR_COLLECTIONS'],
        onClick: () => history.push(ROUTES_ENUM.COLOR_COLLECTION)
      },
      {
        img: cvw?.navMatchPhoto,
        title: messages['NAV_LINKS.MATCH_A_PHOTO'],
        content: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.MATCH_A_PHOTO'],
        onClick: () => {
          if (isActiveScenePolluted) {
            // @todo trace what this dispatch does, may not be needed, should be able to just use if (hiddenImageUploadInput.current)  -RS
            dispatch(showWarningModal())
          } else {
            if (hiddenImageUploadInput.current) {
              hiddenImageUploadInput.current.value = ''
              dispatch(setNavigationIntent(ROUTES_ENUM.UPLOAD_MATCH_PHOTO))
              hiddenImageUploadInput.current.click()
            }
          }
        }
      }
    ]

    return items.filter((item) => {
      if (item.title === messages['NAV_LINKS.DIGITAL_COLOR_WALL']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.colorWall)
      }

      if (item.title === messages['NAV_LINKS.COLOR_COLLECTIONS']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.colorCollections)
      }

      if (item.title === messages['NAV_LINKS.MATCH_A_PHOTO']) {
        return shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.matchAPhoto)
      }

      return true
    })
  }

  const handleNavigation = (urlFrag: string) => {
    if (isColorwallModallyPresented) {
      dispatch(setDirtyNavigationIntent(urlFrag))
      return
    }
    if (isActiveScenePolluted) {
      dispatch(setNavigationIntent(urlFrag))
      const modalType = activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE ? MODAL_TYPE_ENUM.STOCK_SCENE : MODAL_TYPE_ENUM.PAINT_SCENE
      if (activeSceneLabel === MODAL_TYPE_ENUM.PAINT_SCENE) {
        dispatch(triggerPaintSceneLayerPublish(true))
      }
      dispatch(createNavigationWarningModal(intl, modalType, false))
      return
    }

    if (matchPhotoShown) {
      dispatch(setNavigationIntent(urlFrag))
      dispatch(createMatchPhotoNavigationWarningModal(intl, false))
      return
    }
    // default action
    history.push(urlFrag)
  }

  // @todo refactor buttons into their own component -RS
  return (
    <nav className='cvw-navigation-wrapper' ref={navRef}>
      <input ref={hiddenImageUploadInput} style={{ display: 'none' }} type='file' onChange={e => {
        // If you are looking to clear the uploaded image here, do not, you will face very strange render bugs.
        const userImg = e.target.files && e.target.files.length ? e.target.files[0] : null
        if (userImg && userImg.name.match(/.(jpg|jpeg|png)$/i)) {
          if (useSmartMask) {
            dispatch(queueImageUpload(userImg))
          }
          const imageUrl = URL.createObjectURL(userImg)
          dispatch(setIngestedImage(imageUrl))
        }
      }} />
      <ul className='cvw-navigation-wrapper__structure cvw-navigation-wrapper__structure--center' role='presentation'>
        { shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.exploreColors)
          ? <li>
            <button ref={navBtnRef} className={`cvw-nav-btn ${location.pathname === ROUTES_ENUM.ACTIVE_COLORS ? 'cvw-nav-btn--active' : ''}`} onClick={() => {
              handleNavigation(ROUTES_ENUM.ACTIVE_COLORS)
            }}>
              <span className='fa-layers fa-fw cvw-nav-btn-icon'>
                <FontAwesomeIcon icon={['fal', 'square-full']} size='xs' transform={{ rotate: 10 }} />
                <FontAwesomeIcon icon={['fal', 'square-full']} size='sm' transform={{ rotate: 0 }} />
                <FontAwesomeIcon icon={['fal', 'square-full']} size='1x' transform={{ rotate: 350 }} />
                <FontAwesomeIcon icon={['fal', 'plus-circle']} size='xs' />
              </span>
              <FormattedMessage id='NAV_LINKS.EXPLORE_COLORS' />
            </button>
          </li> : null }
        { shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.getInspired)
          ? <li>
            <button className={`cvw-nav-btn ${location.pathname === ROUTES_ENUM.INSPIRATION ? 'cvw-nav-btn--active' : ''}`} onClick={() => {
              handleNavigation(ROUTES_ENUM.INSPIRATION)
            }}>
              <FontAwesomeIcon className='cvw-nav-btn-icon' icon={['fal', 'lightbulb']} size='1x' />
              <FormattedMessage id='NAV_LINKS.GET_INSPIRED' />
            </button>
          </li> : null }
        { shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.paintAPhoto)
          ? <li>
            <button className={`cvw-nav-btn ${location.pathname === ROUTES_ENUM.SCENES ? 'cvw-nav-btn--active' : ''}`} onClick={() => {
              handleNavigation(ROUTES_ENUM.SCENES)
            }}>
              <span className='fa-layers fa-fw cvw-nav-btn-icon'>
                <FontAwesomeIcon icon={['fal', 'square-full']} />
                <FontAwesomeIcon icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
              </span>
              <FormattedMessage id='NAV_LINKS.PAINT_A_PHOTO' />
            </button>
          </li> : null }
        <li>
          <ul className='cvw-navigation-wrapper__structure cvw-navigation-wrapper__structure--right' role='presentation'>
            {
              shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.documentSaving)
                ? <li>
                  <button className={`cvw-nav-btn ${location.pathname === ROUTES_ENUM.ACTIVE_MYIDEAS ? 'cvw-nav-btn--active' : ''}`} onClick={() => {
                    handleNavigation(ROUTES_ENUM.ACTIVE_MYIDEAS)
                  }}>
                    <FormattedMessage id='NAV_LINKS.MY_IDEAS' />
                  </button>
                </li> : null
            }
            <li>
              <button className={`cvw-nav-btn ${location.pathname === ROUTES_ENUM.HELP ? 'cvw-nav-btn--active' : ''}`} onClick={() => {
                handleNavigation(ROUTES_ENUM.HELP)
              }}>
                <FormattedMessage id='NAV_LINKS.HELP' />
              </button>
            </li>
          </ul>
        </li>
      </ul>
      <Switch>
        <Route path={ROUTES_ENUM.ACTIVE_COLORS}>
          <DropDownMenu
            title={messages['NAV_DROPDOWN_TITLE.EXPLORE_COLORS']}
            items={getDropDownItemsForExploreColors()}
          />
        </Route>
        <Route path={ROUTES_ENUM.INSPIRATION}>
          <DropDownMenu
            title={messages['NAV_DROPDOWN_TITLE.GET_INSPIRED']}
            items={getDropDownItemsForGetInspired()}
          />
        </Route>
        <Route path={ROUTES_ENUM.SCENES}>
          <DropDownMenu
            title={messages['NAV_DROPDOWN_TITLE.PAINT_A_PHOTO']}
            items={getDropDownItemsForPaintAPhoto()}
          />
        </Route>
        <Route path={ROUTES_ENUM.ACTIVE_COLORS}>
          <DropDownMenu
            title={messages['NAV_DROPDOWN_TITLE.GET_INSPIRED']}
            items={getDropDownItemsForExploreColors()}
          />
        </Route>
        <Route path={ROUTES_ENUM.ACTIVE_PAINT_SCENE}>
          <DropDownMenu
            title={messages['NAV_DROPDOWN_TITLE.GET_INSPIRED']}
            items={getDropDownItemsForPaintAPhoto()}
          />
        </Route>
      </Switch>
    </nav>
  )
}

export default WithConfigurationContext(ColorVisualizerNav)
