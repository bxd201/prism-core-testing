// @flow
// eslint-disable-next-line no-unused-vars
import React, { type Element, useContext, useRef, useState, useEffect, useMemo, ReactChildren } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import { isMobileOnly, isTablet, isIOS } from 'react-device-detect'
import Prism, { CircleLoader, ImageUploader } from '@prism/toolkit'
import { queueImageUpload, setIngestedImage } from 'src/store/actions/user-uploads'
import './ColorVisualizerNav.scss'
import { FEATURE_EXCLUSIONS } from 'src/constants/configurations'
import { shouldAllowFeature } from 'src/shared/utils/featureSwitch.util'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import isEmpty from 'lodash/isEmpty'
import startCase from 'lodash/startCase'
import { createMatchPhotoNavigationWarningModal, createNavigationWarningModal } from 'src/components/CVWModalManager/createModal'
import {
  // cleanupNavigationIntent,
  setNavigationIntent,
  setDirtyNavigationIntent,
  ACTIVE_SCENE_LABELS_ENUM, setIsColorWallModallyPresented, clearNavigationIntent
} from 'src/store/actions/navigation'
import { ROUTES_ENUM } from '../routeValueCollections'
import { DANGER, MODAL_TYPE_ENUM, PRIMARY } from '../../../CVWModalManager/constants'
import { triggerPaintSceneLayerPublish } from 'src/store/actions/paintScene'
import { DEFAULT_NAV_STRUCTURE } from './navStructure'
import { CVWNavBtn } from '../CVWNavBtn/CVWNavBtn'
import { varValues } from 'src/shared/withBuild/variableDefs'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'

const selectDevice = (web, iPhone = web, android = web, iPad = web) => (isMobileOnly ? (isIOS ? iPhone : android) : (isTablet ? iPad : web)) || web

type DropDownMenuProps = {
  title: string,
  subtitle?: string,
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

export const DropDownMenu = ({ title, subtitle, items }: DropDownMenuProps) => {
  const submenu = useRef(null)
  const history = useHistory()
  const { cvw = {}, brandId } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { closeBtn = {} } = cvw
  const { showArrow: closeBtnShowArrow = true, text: closeBtnText = <FormattedMessage id='CLOSE' /> } = closeBtn
  const rootContainer = document.querySelector('.cvw__root-container')

  const resizeRootContainer = () => {
    rootContainer && (rootContainer.style.height = (49 + submenu.current?.clientHeight - 1) + 'px') // menu height + submenu height - round up
  }

  useEffect(() => {
    if (!isMobileOnly) return

    resizeRootContainer()
    window.addEventListener('hashchange', resizeRootContainer)

    return () => {
      rootContainer && (rootContainer.style.height = 'auto')
      window.removeEventListener('hashchange', resizeRootContainer)
    }
  }, [isMobileOnly])

  const handleClose = (e: SyntheticEvent) => {
    e.preventDefault()
    history.push(ROUTES_ENUM.ACTIVE)
  }

  return (
    <>
      <button className='overlay' onClick={() => history.push(ROUTES_ENUM.ACTIVE)} />
      <div className='cvw-dashboard-submenu' ref={submenu}>
        <button className='text-xs cvw-dashboard-submenu__close' onClick={handleClose}>
          {closeBtnText ?? <FormattedMessage id='CLOSE' />}{closeBtnShowArrow && <FontAwesomeIcon className='cvw-dashboard-submenu__close__ico' icon={['fa', 'chevron-up']} />}
        </button>
        <h1 className='cvw-dashboard-submenu__header font-bold'>{title}</h1>
        {subtitle && <p className='cvw-dashboard-submenu__subtitle'>{subtitle}</p>}
        <ul className='cvw-dashboard-submenu__content'>
          {items.map(({ img, imgiPhone, imgiPad, imgAndroid, title, titleMobile, content, contentAndroid, contentiPhone, description, onClick }, i, arr) => {
            const Wrapper = ({ children }: WrapperProps) => <button className={`text-sm ${onClick ? 'cvw-dashboard-submenu__content__btn ' : ''}`} disabled={!onClick} onClick={onClick}>{children}</button>
            const isWide = (arr.length > 2 && i === 0)
            return (
              <li key={i} className={`cvw-dashboard-submenu__content__item ${isWide ? 'cvw-dashboard-submenu__content__item--wide' : ''}`}>
                <Wrapper>
                  {img ? <div className={`cvw-dashboard-submenu__content__image ${isWide ? 'cvw-dashboard-submenu__content__image--wide' : ''}`} style={{ backgroundImage: `url(${brandId === 'sherwin' ? selectDevice(img, imgiPhone, imgAndroid, imgiPad) : img})` }} alt='' /> : null}
                  <div className='cvw-dashboard-submenu__content__label'>
                    <h3 className='font-bold cvw-dashboard-submenu__content__label--title'>{brandId === 'sherwin' ? selectDevice(title, titleMobile) : title}</h3>
                    <p className='cvw-dashboard-submenu__content__label--content'>{brandId === 'sherwin' ? selectDevice(content, contentiPhone, contentAndroid) : content}</p>
                    {description && <p className='cvw-dashboard-submenu__content__label--tip'>{description}</p>}
                    {title === 'UPLOAD YOUR PHOTO' && <p className='cvw-dashboard-submenu__content__label--tip'>Please select a PNG or JPG file</p>}
                  </div>
                </Wrapper>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

const ColorVisualizerNav = ({ maxSceneHeight }: { maxSceneHeight: number }) => {
  const { featureExclusions, cvw = {}, brand, brandId } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { modal = {} } = cvw
  const { danger = true } = modal
  const { exploreColors, getInspired, help, paintAPhoto } = cvw?.menu ?? {}
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
  const fastMaskIsPolluted = useSelector(store => store.fastMaskIsPolluted)
  const [dropDownItemsForExploreColors, setDropDownItemsForExploreColors] = useState([])
  const [dropDownItemsForGetInspired, setDropDownItemsForGetInspired] = useState([])
  const [dropDownItemsForPaintAPhoto, setDropDownItemsForPaintAPhoto] = useState([])
  const doAfterSelectFile = useRef()
  const modalStyleType = danger ? DANGER : PRIMARY

  const setGAEvent = (props: { category?: string, action?: string, label: any }) => {
    const { category = 'Color Visualizer Menu', action = 'Menu Click', label } = props
    GA.event({ category, action, label: startCase(label.toLowerCase()) }, GA_TRACKER_NAME_BRAND[brandId])
  }

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
          onClick: () => {
            history.push(ROUTES_ENUM.COLOR_WALL)
            setGAEvent({ action: 'Submenu Click', label: digitalColorWall?.title ?? messages['NAV_LINKS.DIGITAL_COLOR_WALL'] })
          }
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.colorWall)
      },
      {
        name: 'COLOR_COLLECTIONS',
        data: {
          img: cvw?.navColorCollections,
          title: colorCollections?.title ?? messages['NAV_LINKS.COLOR_COLLECTIONS'],
          content: colorCollections?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.COLOR_COLLECTIONS'],
          onClick: () => {
            history.push(ROUTES_ENUM.COLOR_COLLECTION)
            setGAEvent({ action: 'Submenu Click', label: colorCollections?.title ?? messages['NAV_LINKS.COLOR_COLLECTIONS'] })
          }
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
            const navTo = ROUTES_ENUM.UPLOAD_MATCH_PHOTO
            if (hiddenImageUploadInput.current && !isActiveScenePolluted) {
              hiddenImageUploadInput.current.value = ''
              // trigger upload image system modal
              hiddenImageUploadInput.current.click()
              doAfterSelectFile.current = () => {
                dispatch(setNavigationIntent(navTo))
              }
            }
            setGAEvent({ action: 'Submenu Click', label: matchAPhoto?.title ?? messages['NAV_LINKS.MATCH_A_PHOTO'] })
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
          onClick: () => {
            history.push(ROUTES_ENUM.USE_OUR_IMAGE)
            setGAEvent({ action: 'Submenu Click', label: paintedPhotos?.title ?? messages['NAV_LINKS.PAINTED_PHOTOS'] })
          }
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.paintedPhotos)
      },
      {
        name: 'EXPERT_COLOR_PICKS',
        data: {
          img: cvw?.navExpertColorPicks,
          title: expertColorPicks?.title ?? messages['NAV_LINKS.EXPERT_COLOR_PICKS'],
          content: expertColorPicks?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.EXPERT_COLOR_PICKS'],
          onClick: () => {
            history.push(ROUTES_ENUM.EXPERT_COLORS)
            setGAEvent({ action: 'Submenu Click', label: expertColorPicks?.title ?? messages['NAV_LINKS.EXPERT_COLOR_PICKS'] })
          }
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.expertColorPicks)
      },
      {
        name: 'INSPIRATIONAL_PHOTOS',
        data: {
          img: cvw?.navSamplePhotos,
          title: inspirationalPhotos?.title ?? messages['NAV_LINKS.INSPIRATIONAL_PHOTOS'],
          content: inspirationalPhotos?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.INSPIRATIONAL_PHOTOS'],
          onClick: () => {
            history.push(ROUTES_ENUM.COLOR_FROM_IMAGE)
            setGAEvent({ action: 'Submenu Click', label: inspirationalPhotos?.title ?? messages['NAV_LINKS.INSPIRATIONAL_PHOTOS'] })
          }
        },
        allowed: () => shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.inspirationalPhotos)
      },
      {
        name: 'OUR_PHOTOS',
        data: {
          img: cvw?.navSampleScenes,
          title: useOurPhotos?.title ?? messages['NAV_LINKS.USE_OUR_PHOTOS'],
          content: useOurPhotos?.content ?? messages['NAV_DROPDOWN_LINK_SUB_CONTENT.USE_OUR_PHOTOS'],
          onClick: () => {
            history.push(ROUTES_ENUM.PAINT_PHOTO)
            setGAEvent({ action: 'Submenu Click', label: useOurPhotos?.title ?? messages['NAV_LINKS.USE_OUR_PHOTOS'] })
          }
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
          onClick: () => {
            const appNavTarget = ROUTES_ENUM.UPLOAD_PAINT_SCENE
            const navTo = brandId === 'sherwin'
              ? selectDevice(
                appNavTarget,
                'https://play.google.com/store/apps/details?id=com.colorsnap',
                'https://itunes.apple.com/us/app/colorsnap-visualizer-iphone/id316256242?mt=8',
                'https://itunes.apple.com/us/app/colorsnap-studio/id555300600?mt=8'
              )
              : appNavTarget

            if (navTo !== appNavTarget) {
              return history.push(navTo)
            } else {
              if (hiddenImageUploadInput.current) {
                hiddenImageUploadInput.current.value = ''
                // trigger upload image system modal
                hiddenImageUploadInput.current.click()

                doAfterSelectFile.current = () => {
                  dispatch(setNavigationIntent(navTo))
                  history.push(navTo)
                }
              }
            }
            setGAEvent({ action: 'Submenu Click', label: uploadYourPhoto?.title ?? messages['NAV_LINKS.UPLOAD_YOUR_PHOTO'] })
          }
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
            const appNavTarget = ROUTES_ENUM.FAST_MASK
            const navTo = brandId === 'sherwin'
              ? selectDevice(
                appNavTarget,
                'https://play.google.com/store/apps/details?id=com.colorsnap',
                'https://itunes.apple.com/us/app/colorsnap-visualizer-iphone/id316256242?mt=8',
                'https://itunes.apple.com/us/app/colorsnap-studio/id555300600?mt=8'
              )
              : appNavTarget

            if (navTo !== appNavTarget) {
              return history.push(navTo)
            } else {
              if (hiddenImageUploadInput.current) {
                hiddenImageUploadInput.current.value = ''
                // trigger upload image system modal
                hiddenImageUploadInput.current.click()

                doAfterSelectFile.current = () => {
                  dispatch(setNavigationIntent(navTo))
                  history.push(navTo)
                }
              }
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
    // Show help modally for "active scenes and fast mask"
    if ((isActiveScenePolluted && urlFrag !== ROUTES_ENUM.HELP) || fastMaskIsPolluted) {
      dispatch(setNavigationIntent(urlFrag))

      const getModalType = (sceneLabel: string, isFastMaskPolluted: boolean) => {
        if (isFastMaskPolluted) {
          return MODAL_TYPE_ENUM.FAST_MASK
        }

        return activeSceneLabel === ACTIVE_SCENE_LABELS_ENUM.STOCK_SCENE ? MODAL_TYPE_ENUM.STOCK_SCENE : MODAL_TYPE_ENUM.PAINT_SCENE
      }

      const modalType = getModalType(activeSceneLabel, fastMaskIsPolluted)
      if (activeSceneLabel === MODAL_TYPE_ENUM.PAINT_SCENE) {
        dispatch(triggerPaintSceneLayerPublish(true))
      }
      dispatch(createNavigationWarningModal(intl, modalType, false, modalStyleType))
      return
    }
    // Match photo should show help modally... BUT this is a BIG exception to the rule that only "active scenes" allow this.
    if (matchPhotoShown) {
      dispatch(setNavigationIntent(urlFrag))
      dispatch(createMatchPhotoNavigationWarningModal(intl, false, modalStyleType))
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
       <ImageUploader
        imageProcessLoader={
          <div className='cvw-navigation-wrapper__image-uploader-loader'>
            <CircleLoader className='cvw-navigation-wrapper__image-uploader-loader--edge' />
          </div>
        }
        maxHeight={window.innerWidth <= parseFloat(varValues.breakpoints.xs) ? maxSceneHeight / 1.8 : maxSceneHeight}
        processedImageMetadata={imageMetadata => {
          if (shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.fastMask)) {
            dispatch(queueImageUpload(imageMetadata))
          }
          dispatch(setIngestedImage(imageMetadata))
          if (doAfterSelectFile.current) {
            doAfterSelectFile.current()
            doAfterSelectFile.current = null
          }
        }}
        ref={hiddenImageUploadInput}
      />
      <ul className='cvw-navigation-wrapper__structure cvw-navigation-wrapper__structure--center' role='presentation'>
        { dropDownItemsForExploreColors.length && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.exploreColors)
          ? <li>
            <CVWNavBtn
              ref={navBtnRef}
              active={location.pathname === ROUTES_ENUM.ACTIVE_COLORS}
              onClick={() => {
                handleNavigation(ROUTES_ENUM.ACTIVE_COLORS)
                setGAEvent({ label: exploreColors?.tab ?? messages['NAV_LINKS.EXPLORE_COLORS'] })
              }}
              iconRenderer={({ className }) => exploreColors?.showIcon && <span className={`fa-layers fa-fw ${className}`}>
                <FontAwesomeIcon icon={['fal', 'square-full']} size='xs' transform={{ rotate: 10 }} />
                <FontAwesomeIcon icon={['fal', 'square-full']} size='sm' transform={{ rotate: 0 }} />
                <FontAwesomeIcon icon={['fal', 'square-full']} size='1x' transform={{ rotate: 350 }} />
                <FontAwesomeIcon icon={['fal', 'plus-circle']} size='xs' />
              </span>}
              textRenderer={() => exploreColors?.tab ?? <FormattedMessage id='NAV_LINKS.EXPLORE_COLORS' />} />
          </li>
          : null }
        { dropDownItemsForGetInspired.length && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.getInspired)
          ? <li>
            <CVWNavBtn
              active={location.pathname === ROUTES_ENUM.INSPIRATION}
              onClick={() => {
                handleNavigation(ROUTES_ENUM.INSPIRATION)
                setGAEvent({ label: getInspired?.tab ?? messages['NAV_LINKS.GET_INSPIRED'] })
              }}
              iconRenderer={({ className }) => getInspired?.showIcon && <span className={`${className}`}>
                <FontAwesomeIcon icon={['fal', 'lightbulb']} size='1x' />
              </span>}
              textRenderer={() => getInspired?.tab ?? <FormattedMessage id='NAV_LINKS.GET_INSPIRED' />} />
          </li>
          : null }
        { dropDownItemsForPaintAPhoto.length && shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.paintAPhoto)
          ? <li>
            <CVWNavBtn
              active={location.pathname === ROUTES_ENUM.SCENES}
              onClick={() => {
                handleNavigation(ROUTES_ENUM.SCENES)
                setGAEvent({ label: paintAPhoto?.tab ?? messages['NAV_LINKS.PAINT_A_PHOTO'] })
              }}
              iconRenderer={({ className }) => paintAPhoto?.showIcon && <span className={`fa-layers fa-fw ${className}`}>
                <FontAwesomeIcon icon={['fal', 'square-full']} />
                <FontAwesomeIcon icon={['fa', 'brush']} size='sm' transform={{ rotate: 320 }} />
              </span>}
              textRenderer={() => paintAPhoto?.tab ?? <FormattedMessage id='NAV_LINKS.PAINT_A_PHOTO' />} />
          </li>
          : null }
        <li className='cvw-navigation-wrapper__structure__child cvw-navigation-wrapper__structure__child--right'>
          <ul className='cvw-navigation-wrapper__structure cvw-navigation-wrapper__structure--right'>
            { shouldAllowFeature(featureExclusions, FEATURE_EXCLUSIONS.documentSaving)
              ? <li>
                <CVWNavBtn
                  active={location.pathname === ROUTES_ENUM.ACTIVE_MYIDEAS}
                  onClick={() => handleNavigation(ROUTES_ENUM.ACTIVE_MYIDEAS)}
                  textRenderer={() => <FormattedMessage id='NAV_LINKS.MY_IDEAS' />} />
              </li>
              : null }
            <li>
              <CVWNavBtn
                active={location.pathname === ROUTES_ENUM.HELP}
                onClick={() => handleNavigation(ROUTES_ENUM.HELP)}
                textRenderer={() => help?.tab ?? <FormattedMessage id='NAV_LINKS.HELP' />} />
            </li>
          </ul>
        </li>
      </ul>
      <Switch>
        {dropDownItemsForExploreColors.length
          ? <Route path={ROUTES_ENUM.ACTIVE_COLORS}>
            <DropDownMenu
              title={exploreColors?.title ?? messages['NAV_DROPDOWN_TITLE.EXPLORE_COLORS']}
              subtitle={exploreColors?.subtitle}
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
