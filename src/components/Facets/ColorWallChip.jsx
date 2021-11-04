// @flow
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Route, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import ColorWall from './ColorWall/ColorWall'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import extendIfDefined from 'src/shared/helpers/extendIfDefined'
import GenericOverlay from 'src/components/Overlays/GenericOverlay/GenericOverlay'
import at from 'lodash/at'
import isArray from 'lodash/isArray'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { updateColorStatuses } from 'src/store/actions/loadColors'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import translateBooleanFlexibly from 'src/shared/utils/translateBooleanFlexibly.util'
import { generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import { setIsColorWallModallyPresented } from '../../store/actions/navigation'

type Props = FacetPubSubMethods & FacetBinderMethods & {
  addButtonText?: string,
  alwaysShowColorFamilies?: boolean,
  colorDetailPageRoot?: string,
  colorWallBgColor?: string,
  displayAddButton?: boolean,
  colorNumOnBottom?: boolean,
  displayInfoButton?: boolean,
  viewColorText?: boolean,
  displayAddButtonText?: boolean,
  displayDetailsLink?: boolean,
  hiddenSections?: string | string[], // as string, "section name 1" or "section name 1|section name 2|etc" will be parsed into an array
  defaultSection?: string
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

export const ColorWallChip = (props: Props) => {
  const {
    addButtonText,
    defaultSection,
    displayAddButton = false,
    displayAddButtonText,
    displayInfoButton = false,
    displayDetailsLink = false,
    colorWallBgColor,
    subscribe,
    publish,
    unsubscribeAll,
    colorNumOnBottom = true,
    colorDetailPageRoot,
    hiddenSections
  } = props
  const dispatch = useDispatch()
  const history = useHistory()

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
    colorNumOnBottom,
    displayAddButton: translateBooleanFlexibly(displayAddButton),
    displayInfoButton: translateBooleanFlexibly(displayInfoButton),
    displayAddButtonText: translateBooleanFlexibly(displayAddButtonText),
    displayDetailsLink: translateBooleanFlexibly(displayDetailsLink),
    hiddenSections: processedHiddenSections
  }), [addButtonText, colorDetailPageRoot, colorWallBgColor, displayAddButton, displayAddButtonText, displayDetailsLink])

  // -----------------------------------------------------
  // handle unmounting
  useEffect(() => () => {
    // unsubscribe from everything on unmount
    dispatch(setIsColorWallModallyPresented())
    unsubscribeAll()
  }, [])

  return (
    <ColorWallContext.Provider value={cwContext}>
      <ColorWallRouter defaultSection={defaultSection}>
        <div className='color-wall-wrap' style={{ paddingBottom: '50%' }}>
          <Route component={ColorWall} />
          {isLoading ? <GenericOverlay type={GenericOverlay.TYPES.LOADING} semitransparent /> : null}
        </div>
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

ColorWallChip.defaultProps = {
  ...facetPubSubDefaultProps,
  ...facetBinderDefaultProps,
  resetOnUnmount: true
}

export default facetBinder(ColorWallChip, 'ColorWallChip')
