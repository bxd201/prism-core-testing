// @flow
import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { GenericOverlay } from '../ToolkitComponents'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from 'src/components/Search/Search'
import SearchBar from 'src/components/Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import ColorWallToolbar from './ColorWall/ColorWallToolbar/ColorWallToolbar'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import at from 'lodash/at'
import isArray from 'lodash/isArray'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { updateColorStatuses } from 'src/store/actions/loadColors'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { useIntl } from 'react-intl'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'
import { generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import { setIsColorWallModallyPresented } from '../../store/actions/navigation'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorWallV3 from './ColorWall/ColorWallV3'

type Props = FacetPubSubMethods & FacetBinderMethods & {
  addButtonText?: string,
  alwaysShowColorFamilies?: boolean,
  colorDetailPageRoot?: string,
  colorWallBgColor?: string,
  defaultSection?: string,
  displayAddButton?: boolean,
  displayInfoButton?: boolean,
  displayAddButtonText?: boolean,
  displayDetailsLink?: boolean,
  hiddenSections?: string | string[], // as string, "section name 1" or "section name 1|section name 2|etc" will be parsed into an array
  initialFocusId?: string | number
}

export const EVENTS = {
  colorsLoaded: 'PRISM/out/colorsLoaded',
  decorateColors: 'PRISM/in/decorateColors',
  emitColor: 'PRISM/out/emitColor',
  selectedGroup: 'PRISM/out/selectedGroup',
  selectGroup: 'PRISM/in/selectGroup',
  clearSection: 'PRISM/in/clearSection',
  loading: 'PRISM/in/loading'
}

const SearchBarNoLabel = () => {
  const { messages = {} } = useIntl()
  const { uiStyle }: ConfigurationContextType = useContext(ConfigurationContext)

  return (
    <div className='color-wall-wrap__chunk'>
      <SearchBar
        className={uiStyle === 'minimal' ? 'SearchBarMinimal' : undefined}
        label={messages['SEARCH.FIND_A_COLOR']}
        placeholder={messages[uiStyle === 'minimal' ? 'SEARCH.SEARCH_FOR_A_COLOR' : 'SEARCH.SEARCH_BY']}
        showCancelButton
        showLabel={false}
      />
    </div>
  )
}

const SearchContain = () => <Search contain />

export const ColorWallPage = (props: Props) => {
  const {
    addButtonText,
    alwaysShowColorFamilies,
    colorDetailPageRoot,
    colorWallBgColor,
    initialFocusId,
    defaultSection,
    displayAddButton = false,
    displayAddButtonText,
    displayInfoButton = false,
    displayDetailsLink = true,
    hiddenSections,
    publish,
    subscribe,
    unsubscribeAll
  } = props
  const dispatch = useDispatch()
  const history = useHistory()
  const { cwv3 } = useSelector<ColorsState>(state => state.colors)

  // -----------------------------------------------------
  // accept and process color decoration from host
  useEffect(() => subscribe(EVENTS.decorateColors, handleColorDecoration), [])
  const handleColorDecoration = useCallback((decoratedColors) => dispatch(updateColorStatuses(decoratedColors)), [])
  const colorMap = useSelector(state => at(state, 'colors.items.colorMap')[0])
  const { section, family } = useSelector(state => at(state, 'colors')[0])
  useEffect(() => { colorMap && publish(EVENTS.colorsLoaded, colorMap) }, [colorMap])

  // -----------------------------------------------------
  // handle emitting selected color to host
  const emitColor = useSelector(state => at(state, 'colors.emitColor')[0])
  // on color select AFTER initial mount
  useEffectAfterMount(() => {
    const color = emitColor && emitColor.color
    if (color) {
      // resetWall(true)
      publish(EVENTS.emitColor, color)
    }
  }, [(emitColor && emitColor.timestamp)])

  useEffect(() => {
    publish(EVENTS.selectedGroup, { family: family, section: section })
  }, [section, family])

  // -----------------------------------------------------
  // handle host demanding appearance of loading
  const [isLoading, updateLoading] = useState(false)
  useEffect(() => {
    subscribe(EVENTS.loading, updateLoading)
    return unsubscribeAll
  }, [])

  // -----------------------------------------------------
  // handle host changing section/family after initial load
  useEffect(() => {
    subscribe(EVENTS.selectGroup, ({ section, family }) => {
      history.push(generateColorWallPageUrl(section, family))
    })
    return unsubscribeAll
  }, [])

  // -----------------------------------------------------
  // handle reseting section/family to defaults
  useEffect(() => {
    subscribe(EVENTS.clearSection, () => {
      history.push(generateColorWallPageUrl(defaultSection))
    })
  }, [])

  // -----------------------------------------------------
  // handle hidden sections
  const processedHiddenSections = useMemo(() => {
    if (typeof hiddenSections === 'string') {
      // hiddenSections is a single pipe-delimited string; break it into an array here before it gets into context
      return hiddenSections.split('|')
    } else if (isArray(hiddenSections)) {
      return hiddenSections
    }

    return []
  }, [ hiddenSections ])

  // -----------------------------------------------------
  // build color wall context and a11y state
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, {
    addButtonText,
    colorDetailPageRoot,
    colorWallBgColor,
    initialFocusId: !isNaN(initialFocusId) ? Number(initialFocusId) : undefined,
    displayAddButton: translateBooleanFlexibly(displayAddButton),
    displayInfoButton: translateBooleanFlexibly(displayInfoButton),
    displayAddButtonText: translateBooleanFlexibly(displayAddButtonText),
    displayDetailsLink: translateBooleanFlexibly(displayDetailsLink),
    hiddenSections: processedHiddenSections
  }), [addButtonText, colorDetailPageRoot, colorWallBgColor, displayAddButton, displayAddButtonText, displayDetailsLink, initialFocusId])

  // -----------------------------------------------------
  // handle unmounting
  useEffect(() => () => {
    // unsubscribe from everything on unmount
    dispatch(setIsColorWallModallyPresented())
    unsubscribeAll()
  }, [])

  const CWToolbar = () => (
    <div className='color-wall-wrap__chunk'>
      <ColorWallToolbar alwaysShowColorFamilies={alwaysShowColorFamilies} />
    </div>
  )

  return (
    <ColorWallContext.Provider value={cwContext}>
      <ColorWallRouter defaultSection={defaultSection}>
        <div className='color-wall-wrap'>
          <nav>
            <Switch>
              <Route path='(.*)?/search/:query' component={SearchBarNoLabel} />
              <Route path='(.*)?/search' component={SearchBarNoLabel} />
              <Route path='(.*)?/section/:section/family/:family' component={CWToolbar} />
              <Route path='(.*)?/section/:section/family/' component={CWToolbar} />
              <Route path='(.*)?/family/:family/' component={CWToolbar} />
              <Route path='(.*)?/family/' component={CWToolbar} />
              <Route component={CWToolbar} />
            </Switch>
          </nav>
          <Switch>
            <Route path='(.*)?/search/:query' component={SearchContain} />
            <Route path='(.*)?/search/' component={SearchContain} />
            <Route component={cwv3 ? ColorWallV3 : ColorWall} />
          </Switch>
          {isLoading ? <GenericOverlay type={GenericOverlay.TYPES.LOADING} semitransparent /> : null}
        </div>
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

ColorWallPage.defaultProps = {
  ...facetPubSubDefaultProps,
  ...facetBinderDefaultProps,
  resetOnUnmount: true
}

export default facetBinder(ColorWallPage, 'ColorWallFacet')
