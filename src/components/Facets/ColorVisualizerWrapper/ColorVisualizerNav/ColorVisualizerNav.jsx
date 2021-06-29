// @flow
// eslint-disable-next-line no-unused-vars
import React, { useContext, useRef, useState, useEffect, useMemo, ReactChildren } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import { isMobileOnly, isTablet, isIOS } from 'react-device-detect'
import { queueImageUpload, setIngestedImage } from 'src/store/actions/user-uploads'
import './ColorVisualizerNav.scss'
import { FEATURE_EXCLUSIONS } from 'src/constants/configurations'
import { shouldAllowFeature } from 'src/shared/utils/featureSwitch.util'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import isEmpty from 'lodash/isEmpty'
import { createMatchPhotoNavigationWarningModal, createNavigationWarningModal } from 'src/components/CVWModalManager/createModal'
import {
  // cleanupNavigationIntent,
  setNavigationIntent,
  setDirtyNavigationIntent,
  ACTIVE_SCENE_LABELS_ENUM, setIsColorWallModallyPresented, clearNavigationIntent
} from 'src/store/actions/navigation'
import { ROUTES_ENUM } from '../routeValueCollections'
import { MODAL_TYPE_ENUM } from 'src/components/CVWModalManager/constants'
import { triggerPaintSceneLayerPublish } from 'src/store/actions/paintScene'
import { DEFAULT_NAV_STRUCTURE } from './navStructure'

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
  const { cvw } = useContext<ConfigurationContextType>(ConfigurationContext)
  const selectDevice = (web, iPhone = web, android = web, iPad = web) => (isMobileOnly ? (isIOS ? iPhone : android) : (isTablet ? iPad : web)) || web

  useEffect(() => {
    if (!(isMobileOnly || isTablet)) return
    resizeRootContainer()
    window.addEventListener('hashchange', resizeRootContainer)
  }, [isMobileOnly, isTablet])

  const handleClose = (e: SyntheticEvent) => {
    e.preventDefault()
    history.push(ROUTES_ENUM.ACTIVE)
  }

  return (
    <>
      <button className='overlay' onClick={() => history.push(ROUTES_ENUM.ACTIVE)} />
      <div className='cvw-dashboard-submenu'>
        <button className='cvw-dashboard-submenu__close' onClick={handleClose}>
          {cvw?.menu?.close ?? <FormattedMessage id='CLOSE' />}
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
                  {title === 'UPLOAD YOUR PHOTO' && <p className='cvw-dashboard-submenu__content__tip'>Please select a PNG or JPG file</p>}
                </Wrapper>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

const ColorVisualizerNav = () => {
  const { featureExclusions, cvw, brand } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { exploreColors, getInspired, paintAPhoto } = cvw?.menu ?? {}
  const { navStructure = DEFAULT_NAV_STRUCTURE } = cvw ?? {}
  const [isLoadingCVWConfig, setIsLoadingCVWConfig] = useState(isEmpty(cvw))
  const { messages, formatMessage } = useIntl()
  const intl = useIntl()
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const activeSceneLabel = useSelector(store => store.activeSceneLabel)
  const isActiveScenePolluted: string = useSelector(store => store.scenePolluted)
  const isColorwallModallyPresented = useSelector(store => store.isColorwallModallyPresented)

  const hiddenImageUploadInput: { current: ?HTMLElement } = useRef()
  const navBtnRef: {current: ?HTMLElement} = useRef()
  const navRef: {current: ?HTMLElement} = useRef()
  const matchPhotoShown = useSelector(store => store.isMatchPhotoPresented)
  const [dropDownItemsForExploreColors, setDropDownItemsForExploreColors] = useState([])
  const [dropDownItemsForGetInspired, setDropDownItemsForGetInspired] = useState([])
  const [dropDownItemsForPaintAPhoto, setDropDownItemsForPaintAPhoto] = useState([])

  useEffect(() => setIsLoadingCVWConfig(isEmpty(cvw)), [cvw])

  /**
   * This builds out navigation based on configuration values.
   */
  useEffect(() => {
    // do not proceed in building out nav until CVW config has loaded
    if (isLoadingCVWConfig) return

    const { expertColorPicks, inspirationalPhotos, paintedPhotos } = getInspired ?? {}
    const { uploadYourPhoto, useOurPhotos } = paintAPhoto ?? {}
    const { colorCollections, digitalColorWall, matchAPhoto } = exploreColors ?? {}

    const allNavItems = [
      {
        name: 'COLOR_WALL',
        data: {
          img: cvw?.navExploreColor,
          title: digitalColorWall?.title ?? messages['NAV_LINKS.DIGITAL_COLOR_WALL'],
          content: digitalColorWall?.content ?? formatMessage({ id: 'NAV_DROPDOWN_LINK_SUB_CONTENT.DIGITAL_COLOR_WALL' }, { brand }),
          onClick: () => history.push(ROUTES_ENUM.COLOR_WALL + '/section/sherwin-williams-colors')
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.colorWall)
      },
      {
        name: 'COLOR_COLLECTIONS',
        data: {
          img: cvw?.navColorCollections,
          title: colorCollections?.title ?? messages['NAV_LINKS.COLOR_COLLECTIONS'],
          content: colorCollections?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.COLOR_COLLECTIONS'],
          onClick: () => history.push(ROUTES_ENUM.COLOR_COLLECTION)
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.colorCollections)
      },
      {
        name: 'MATCH_PHOTO',
        data: {
          img: cvw?.navMatchPhoto,
          title: matchAPhoto?.title ?? messages['NAV_LINKS.MATCH_A_PHOTO'],
          content: matchAPhoto?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.MATCH_A_PHOTO'],
          onClick: () => {
            if (hiddenImageUploadInput.current && !isActiveScenePolluted) {
              hiddenImageUploadInput.current.value = ''
              dispatch(setNavigationIntent(ROUTES_ENUM.UPLOAD_MATCH_PHOTO))
              hiddenImageUploadInput.current.click()
            }
          }
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.matchAPhoto)
      },
      {
        name: 'PAINTED_PHOTOS',
        data: {
          img: cvw?.navPaintedScenes,
          title: paintedPhotos?.title ?? messages['NAV_LINKS.PAINTED_PHOTOS'],
          content: paintedPhotos?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.PAINTED_PHOTOS'],
          onClick: () => history.push(ROUTES_ENUM.USE_OUR_IMAGE)
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.paintedPhotos)
      },
      {
        name: 'EXPERT_COLOR_PICKS',
        data: {
          img: cvw?.navExpertColorPicks,
          title: expertColorPicks?.title ?? messages['NAV_LINKS.EXPERT_COLOR_PICKS'],
          content: expertColorPicks?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.EXPERT_COLOR_PICKS'],
          onClick: () => history.push(ROUTES_ENUM.EXPERT_COLORS)
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.expertColorPicks)
      },
      {
        name: 'INSPIRATIONAL_PHOTOS',
        data: {
          img: cvw?.navSamplePhotos,
          title: inspirationalPhotos?.title ?? messages['NAV_LINKS.INSPIRATIONAL_PHOTOS'],
          content: inspirationalPhotos?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.INSPIRATIONAL_PHOTOS'],
          onClick: () => history.push(ROUTES_ENUM.COLOR_FROM_IMAGE)
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.inspirationalPhotos)
      },
      {
        name: 'OUR_PHOTOS',
        data: {
          img: cvw?.navSampleScenes,
          title: useOurPhotos?.title ?? messages['NAV_LINKS.USE_OUR_PHOTOS'],
          content: useOurPhotos?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.USE_OUR_PHOTOS'],
          onClick: () => history.push(ROUTES_ENUM.PAINT_PHOTO)
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.useOurPhotos)
      },
      {
        name: 'UPLOAD_YOUR_OWN',
        data: {
          img: cvw?.navThumbMyPhotos,
          imgiPhone: cvw?.navThumbIphone,
          imgiPad: cvw?.navThumbIpad,
          imgAndroid: cvw?.navThumbAndroid,
          title: uploadYourPhoto?.title ?? messages['NAV_LINKS.UPLOAD_YOUR_PHOTO'],
          titleMobile: messages['NAV_LINKS.GET_THE_APP'],
          content: uploadYourPhoto?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO'],
          contentAndroid: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_ANDROID'],
          contentiPad: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_IPAD'],
          contentiPhone: messages['NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_IPHONE'],
          description: uploadYourPhoto?.footnote ?? messages['NAV_DROPDOWN_LINK_TIP_DESCRIPTION.UPLOAD_YOUR_PHOTO'],
          onClick: !(isMobileOnly || isTablet) ? () => {
            const selectDevice = (web, iPhone = web, android = web, iPad = web) => (isMobileOnly ? (isIOS ? iPhone : android) : (isTablet ? iPad : web)) || web
            history.push(selectDevice(
              ROUTES_ENUM.UPLOAD_PAINT_SCENE,
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
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.uploadYourPhoto)
      },
      {
        name: 'FAST_MASK',
        data: { // @todo while excessive to dupe this, the future design of nav should be declarative and we need to exclude as much logic as possible from the nav declaration -RS
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
              ROUTES_ENUM.UPLOAD_FAST_MASK,
              'https://play.google.com/store/apps/details?id=com.colorsnap',
              'https://itunes.apple.com/us/app/colorsnap-visualizer-iphone/id316256242?mt=8',
              'https://itunes.apple.com/us/app/colorsnap-studio/id555300600?mt=8'
            ))

            if (hiddenImageUploadInput.current) {
              hiddenImageUploadInput.current.value = ''
              // trigger upload image system modal
              dispatch(setNavigationIntent(ROUTES_ENUM.UPLOAD_FAST_MASK))
              hiddenImageUploadInput.current.click()
            }
          } : undefined
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.fastMask)
      }
    ]

    const navHierarchy = navStructure.map(section => ({
      name: section.name,
      children: section.children.map(navItem => allNavItems.filter(({ name, allowed }) => name === navItem && allowed()).map(v => v.data)[0]).filter(Boolean)
    }))

    setDropDownItemsForExploreColors(navHierarchy.filter(({ name }) => name === 'EXPLORE_COLORS')[0]?.children ?? [])
    setDropDownItemsForGetInspired(navHierarchy.filter(({ name }) => name === 'GET_INSPIRED')[0]?.children ?? [])
    setDropDownItemsForPaintAPhoto(navHierarchy.filter(({ name }) => name === 'PAINT_A_PHOTO')[0]?.children ?? [])
  }, [navStructure, getInspired, paintAPhoto, exploreColors, isLoadingCVWConfig])

  const handleNavigation = (urlFrag: string) => {
    if (isColorwallModallyPresented && isActiveScenePolluted) {
      dispatch(setDirtyNavigationIntent(urlFrag))
      return
    }
    // Show help modally for "active scenes"
    if (isActiveScenePolluted && urlFrag !== ROUTES_ENUM.HELP) {
      dispatch(setNavigationIntent(urlFrag))
      const modalType = activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE ? MODAL_TYPE_ENUM.STOCK_SCENE : MODAL_TYPE_ENUM.PAINT_SCENE
      if (activeSceneLabel === MODAL_TYPE_ENUM.PAINT_SCENE) {
        dispatch(triggerPaintSceneLayerPublish(true))
      }
      dispatch(createNavigationWarningModal(intl, modalType, false))
      return
    }
    // Match photo should show help modally... BUT this is a BIG exception to the rule that only "active scenes" allow this.
    if (matchPhotoShown) {
      dispatch(setNavigationIntent(urlFrag))
      dispatch(createMatchPhotoNavigationWarningModal(intl, false))
      return
    }
    // default action
    history.push(urlFrag)
    dispatch(clearNavigationIntent())
    dispatch(setIsColorWallModallyPresented())
  }

  if (isLoadingCVWConfig) {
    return <nav className='cvw-navigation-wrapper' ref={navRef} />
  }

  // @todo refactor buttons into their own component -RS
  return (
    <nav className='cvw-navigation-wrapper' ref={navRef}>
      <input ref={hiddenImageUploadInput} style={{ display: 'none' }} type='file' accept={'.jpeg, .jpg, .png'} onChange={e => {
        // If you are looking to clear the uploaded image here, do not, you will face very strange render bugs.
        const userImg = e.target.files && e.target.files.length ? e.target.files[0] : null
        if (userImg) {
          if (shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.fastMask)) {
            dispatch(queueImageUpload(userImg))
          }
          const imageUrl = URL.createObjectURL(userImg)
          dispatch(setIngestedImage(imageUrl))
        }
      }} />
      <ul className='cvw-navigation-wrapper__structure cvw-navigation-wrapper__structure--center' role='presentation'>
        { dropDownItemsForExploreColors.length && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.exploreColors)
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
              {exploreColors?.tab ?? <FormattedMessage id='NAV_LINKS.EXPLORE_COLORS' />}
            </button>
          </li> : null }
        { dropDownItemsForGetInspired.length && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.getInspired)
          ? <li>
            <button className={`cvw-nav-btn ${location.pathname === ROUTES_ENUM.INSPIRATION ? 'cvw-nav-btn--active' : ''}`} onClick={() => {
              handleNavigation(ROUTES_ENUM.INSPIRATION)
            }}>
              <FontAwesomeIcon className='cvw-nav-btn-icon' icon={['fal', 'lightbulb']} size='1x' />
              {getInspired?.tab ?? <FormattedMessage id='NAV_LINKS.GET_INSPIRED' />}
            </button>
          </li> : null }
        { dropDownItemsForPaintAPhoto.length && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.paintAPhoto)
          ? <li>
            <button className={`cvw-nav-btn ${location.pathname === ROUTES_ENUM.SCENES ? 'cvw-nav-btn--active' : ''}`} onClick={() => {
              handleNavigation(ROUTES_ENUM.SCENES)
            }}>
              <span className='fa-layers fa-fw cvw-nav-btn-icon'>
                <FontAwesomeIcon icon={['fal', 'square-full']} />
                <FontAwesomeIcon icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
              </span>
              {paintAPhoto?.tab ?? <FormattedMessage id='NAV_LINKS.PAINT_A_PHOTO' />}
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
        {dropDownItemsForExploreColors.length
          ? <Route path={ROUTES_ENUM.ACTIVE_COLORS}>
            <DropDownMenu
              title={exploreColors?.title ?? messages['NAV_DROPDOWN_TITLE.EXPLORE_COLORS']}
              items={dropDownItemsForExploreColors}
            />
          </Route>
          : null
        }
        {dropDownItemsForGetInspired.length
          ? <Route path={ROUTES_ENUM.INSPIRATION}>
            <DropDownMenu
              title={getInspired?.title ?? messages['NAV_DROPDOWN_TITLE.GET_INSPIRED']}
              items={dropDownItemsForGetInspired}
            />
          </Route>
          : null
        }
        {dropDownItemsForPaintAPhoto.length
          ? <Route path={ROUTES_ENUM.SCENES}>
            <DropDownMenu
              title={paintAPhoto?.title ?? messages['NAV_DROPDOWN_TITLE.PAINT_A_PHOTO']}
              items={dropDownItemsForPaintAPhoto}
            />
          </Route>
          : null
        }
        {dropDownItemsForExploreColors.length
          ? <Route path={ROUTES_ENUM.ACTIVE_COLORS}>
            <DropDownMenu
              title={exploreColors?.title ?? messages['NAV_DROPDOWN_TITLE.GET_INSPIRED']}
              items={dropDownItemsForExploreColors}
            />
          </Route>
          : null
        }
        {dropDownItemsForPaintAPhoto.length
          ? <Route path={ROUTES_ENUM.ACTIVE_PAINT_SCENE}>
            <DropDownMenu
              title={paintAPhoto?.title ?? messages['NAV_DROPDOWN_TITLE.GET_INSPIRED']}
              items={dropDownItemsForPaintAPhoto}
            />
          </Route>
          : null
        }
      </Switch>
    </nav>
  )
}

export default ColorVisualizerNav
