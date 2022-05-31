// @flow
import React, { useState, useRef, useMemo, useEffect, useCallback, useContext } from 'react'
import { useSelector } from 'react-redux'
import ColorWallPropsContext, { BASE_SWATCH_SIZE, colorWallPropsDefault, MAX_SCROLLER_HEIGHT, MAX_SWATCH_SIZE, MIN_SCROLLER_HEIGHT, OUTER_SPACING, MIN_BASE_SIZE, MAX_BASE_SIZE } from '../ColorWallPropsContext'
import ColorSwatchContent from 'src/components/ColorSwatchContent/ColorSwatchContent'
import Column from '../Column/Column'
import noop from 'lodash/noop'
import { AutoSizer } from 'react-virtualized'
import { computeWall } from '../sharedReducersAndComputers'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { findPositionInChunks, getInitialSwatchInChunk, getInTabOrder, getPerimiterLevelTest, getProximalChunksBySwatchId, getProximalSwatchesBySwatchId } from './wallUtils'
import getElementRelativeOffset from 'get-element-relative-offset'
import isSomething from 'src/shared/utils/isSomething.util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useIntl } from 'react-intl'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import ColorWallContext, { type ColorWallContextProps } from '../../ColorWallContext'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import './Wall.scss'
import 'src/scss/convenience/visually-hidden.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'

// MASTER TODO LIST
// [x] ingest and display real color data. color data should be delivered as props ({ [colorId]: { colorDataObj } })
// [x] ingest and display real color structure data. color structure should be delivered as props.
//     this component should NOT care what family, section, etc., is selected -- only structure
// [x] ingest and display current active color
// [x] handle zooming
// [x] display zoom button
// [x] initially render wall within viewable area (if swatch min size permits)
// [x] initially render wall within viewable area (if swatch min size permits)
// [x] outer margin around wall
// [x] accept prop to set height of wall scroller, otherwise use default zoomed-out height

// LOW PRIORITY TODOS, NOT NECESSARY RIGHT AWAY
// [ ] immediate-scroll to focused swatch when zooming in and out instead of smooth scroll to prevent jank
// [x] when tabbing into a chunk with an active swatch, auto-focus it instead of the first swatch in the chunk
// [ ] make swatchRenderer a prop, which will allow us to externalize rendering, link-building, and even color data

type WallProps = {
  structure: any,
  activeColorId: number | string | typeof undefined,
  onActivateColor: () => void,
  height?: number
}

function Wall (props: WallProps) {
  const { activeColorId: dirtyActiveColorId, height, onActivateColor = noop, structure } = props
  // this ensures numeric IDs are numeric (so '42' becomes 42), and string IDs remain strings
  const activeColorId = typeof dirtyActiveColorId === 'string' && !isNaN(+dirtyActiveColorId) ? +dirtyActiveColorId : dirtyActiveColorId
  const { colorWallBgColor }: ColorWallContextProps = useContext(ColorWallContext)
  const { colorWall: { bloomEnabled, colorSwatch = {} } }: ConfigurationContextType = useContext(ConfigurationContext)
  const { houseShaped = false } = colorSwatch
  const { items: { colorMap } }: ColorsState = useSelector(state => state.colors)
  const livePaletteColors = useSelector(store => store.lp.colors)
  const [hasFocus, setHasFocus] = useState(false)
  const wallContentsRef = useRef()
  const focusOutStartHelper = useRef()
  const focusOutEndHelper = useRef()
  const chunks = useRef(new Set())
  const wallRef = useRef()
  const [topFocusData, setTopFocusData] = useState()
  const { messages = {} } = useIntl()
  const [shouldRender, setShouldRender] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [defaultDimensions, setDefaultDimensions] = useState()
  const [defaultScale, setDefaultScale] = useState(1)

  const setFocusAndScrollTo = useCallback((props = {}) => {
    setTopFocusData(props)

    if (!props) return

    // if this is empty/0, then we haven't rendered yet
    const swatchRefs = Array.from(chunks.current).map(chunk => chunk.swatchesRef?.current ?? []).filter(arr => arr.length)
    const result = (() => {
      try {
        for (let i = swatchRefs.length - 1; i >= 0; i--) {
          for (let ii = swatchRefs[i].length - 1; ii >= 0; ii--) {
            if (swatchRefs[i][ii].id === props.swatchId) { return swatchRefs[i][ii].el } // eslint-disable-line
          }
        }
      } catch (err) {
        return // eslint-disable-line
      }
    })()?.current?.[0]

    // putting scrolling behavior into a timeout to move it out of the current computational area
    // this helps preserve scrolling smoothness
    setTimeout(() => {
      if (result) {
        if (!wallContentsRef.current) return
        const { top = 0, left = 0 } = getElementRelativeOffset(result, v => v === wallContentsRef.current)
        const newTop = top + (wallContentsRef.current.clientHeight / -2)
        const newLeft = left + (wallContentsRef.current.clientWidth / -2)

        if (typeof wallContentsRef.current.scrollTo === 'function') {
          // $FlowIgnore
          wallContentsRef.current?.scrollTo?.({ // eslint-disable-line
            top: newTop,
            left: newLeft,
            behavior: 'smooth'
          })
        } else {
          // just for IE and old browser support
          wallContentsRef.current.scrollTop = newTop // eslint-disable-line
          wallContentsRef.current.scrollLeft = newLeft // eslint-disable-line
        }
      }
    }, 0)
  }, [])

  // this is fired from within swatchRenderer to activate a swatch
  const handleMakeActiveSwatchId = (id) => {
    onActivateColor(id)

    setTimeout(() => {
      // FUTURE TODO: we would really benefit from an id-based map of swatches in here.
      const { current } = getProximalChunksBySwatchId(chunks.current, id) // eslint-disable-line

      // $FlowIgnore
      const ctas = current?.swatchesRef?.current?.reduce?.((accum, next) => { // eslint-disable-line
        if (accum) {
          return accum
        } else if (next?.id === id) {
          return next.el.current
        }
      }, undefined)

      const ctasInOrder = getInTabOrder(ctas) // eslint-disable-line

      if (ctasInOrder && ctasInOrder.length > 0) {
        ctasInOrder[0].focus()
      }
    }, 100)
  }

  const [forceRerender, setForceRerender] = useState(false)

  const wallProps = useMemo(() => {
    const isZoomed = isSomething(activeColorId)
    const { current } = findPositionInChunks(chunks.current, activeColorId) // eslint-disable-line
    const getPerimeterLevel = getPerimiterLevelTest(current?.data?.children, activeColorId, bloomEnabled ? 2 : 0) // eslint-disable-line

    // kind of a hack
    // should render being true for the first time AND no chunks means the wall is about to visibly render for the first time
    // we need it to render once in order to have chunks.current.data.children defined, and we need THAT in order to perform blooming
    // this will ONLY run if blooming is enabled
    if (chunks.current.size === 0 && shouldRender && bloomEnabled) {
      setTimeout(() => setForceRerender(true), 0)
    }

    return {
      ...colorWallPropsDefault,
      addChunk: chunk => chunks.current?.add(chunk),
      activeSwatchId: activeColorId,
      getPerimeterLevel,
      hostHasFocus: hasFocus,
      isZoomed,
      scale: isZoomed ? MAX_SWATCH_SIZE / BASE_SWATCH_SIZE : defaultScale,
      setActiveSwatchId: id => handleMakeActiveSwatchId(id),
      swatchRenderer: ({ id }) => ( // eslint-disable-line
        <ColorSwatchContent
          className={`${houseShaped ? 'swatch-content--house-shaped' : 'swatch-content-size'}`}
          color={colorMap[id]}
        />
      )
    }
  }, [activeColorId, hasFocus, defaultScale, livePaletteColors, shouldRender, forceRerender])

  useEffect(() => {
    // if shouldRender is not true, there will be nothing rendered to scroll to
    if (isSomething(activeColorId) && shouldRender) {
      setFocusAndScrollTo({
        swatchId: activeColorId,
        chunkId: getProximalChunksBySwatchId(chunks.current, activeColorId)?.current?.id
      })
    }
  }, [activeColorId, shouldRender])

  const handleTabInBeginning = (e) => {
    const { first } = getProximalChunksBySwatchId(chunks.current)

    const swatch = getInitialSwatchInChunk(first, activeColorId)

    if (swatch) {
      const { el, id } = swatch

      setFocusAndScrollTo({
        swatchId: id,
        chunkId: first.id
      })

      // $FlowIgnore
      el.focus?.() // eslint-disable-line

      e.preventDefault()
    }

    setHasFocus(true)
  }

  const handleTabInEnd = (e) => {
    const { last } = getProximalChunksBySwatchId(chunks.current)

    const swatch = getInitialSwatchInChunk(last, activeColorId)

    if (swatch) {
      const { el, id } = swatch

      setFocusAndScrollTo({
        swatchId: id,
        chunkId: last.id
      })

      // $FlowIgnore
      el.focus?.() // eslint-disable-line

      e.preventDefault()
    }

    setHasFocus(true)
  }

  useEffectAfterMount(() => {
    if (containerWidth > 0 && structure) {
      const { width, height, widths, heights } = computeWall(structure) ?? {}

      if (!isNaN(width) && !isNaN(height)) {
        const initScale = containerWidth / (width + OUTER_SPACING * 2)
        const initSwatchSize = initScale * BASE_SWATCH_SIZE
        const initSwatchSizeConstrained = Math.min(Math.max(initSwatchSize, MIN_BASE_SIZE), MAX_BASE_SIZE)
        const initScaleConstrained = initSwatchSizeConstrained / initSwatchSize * initScale

        setDefaultScale(initScaleConstrained)
        setDefaultDimensions({ width, height, widths, heights })
        setShouldRender(true)
      } else {
        throw Error('Wall width/height must be numeric.')
      }
    }
  }, [structure, shouldRender, containerWidth])

  useEffect(() => {
    if (!hasFocus) return () => {}

    const handleKeyDown = e => {
      if (!hasFocus) { return }

      // if the currently-focused element is not within the wall and is not the wall...
      if (wallRef.current && wallRef.current.contains && !wallRef.current.contains(document.activeElement) && document.activeElement !== wallRef.current) {
        // ... don't process any keydown handling
        return
      }

      // prevent default behavior for arrow keys
      if (e.keyCode >= 37 && e.keyCode <= 40) { e.preventDefault() }

      switch (e.keyCode) {
        case 9: {
          const { next, current, previous, first } = getProximalChunksBySwatchId(chunks.current, topFocusData?.swatchId)
          const intendedChunk = !current ? first : e.shiftKey ? previous : next

          if (topFocusData?.swatchId === activeColorId) {
            // this means we are on the currently-active swatch

            // $FlowIgnore
            const availableCTAs = current?.swatchesRef?.current?.reduce?.((accum, next) => { // eslint-disable-line
              if (accum) {
                return accum
              } else if (next?.id === activeColorId) {
                return next.el.current
              }
            }, undefined)

            if (availableCTAs.length) {
              // $FlowIgnore
              e.preventDefault?.() // eslint-disable-line

              const sortedCTAs = getInTabOrder(availableCTAs)
              // if we actually have CTAs in here, proceed...
              const focusIndexCTA = sortedCTAs.reduce((accum, next, i) => document.activeElement === next ? i : accum, -1)
              const newFocusIndex = focusIndexCTA + (e.shiftKey ? -1 : 1)
              if (newFocusIndex >= 0 && newFocusIndex < sortedCTAs.length) {
                // $FlowIgnore
                sortedCTAs[newFocusIndex].focus?.()// eslint-disable-line
                return
              }
            }
          }

          if (intendedChunk) {
            const intendedSwatch = getInitialSwatchInChunk(intendedChunk, activeColorId)

            if (intendedSwatch) {
              const { id, el } = intendedSwatch

              setFocusAndScrollTo({
                swatchId: id,
                chunkId: intendedChunk.id
              })

              // $FlowIgnore
              el.focus?.() // eslint-disable-line

              // $FlowIgnore
              e.preventDefault?.() // eslint-disable-line
            }
          } else if (current) {
            // the user is trying to tab out of the wall either at the beginning or end
            // must do this BEFORE setting focus state
            // $FlowIgnore
            (e.shiftKey ? focusOutStartHelper : focusOutEndHelper)?.current?.focus?.() // eslint-disable-line
            setFocusAndScrollTo()
            setHasFocus(false)
          }
          break
        }
        case 27: {
          onActivateColor()
          setFocusAndScrollTo(topFocusData)
          break
        }
        case 37:
        case 38:
        case 39:
        case 40: {
          const ids = getProximalSwatchesBySwatchId(chunks.current, topFocusData?.chunkId, topFocusData?.swatchId)
          const intendedSwatch = {
            '37': ids?.left,
            '38': ids?.up,
            '39': ids?.right,
            '40': ids?.down
          }[e.keyCode]

          setFocusAndScrollTo({
            ...topFocusData,
            swatchId: intendedSwatch?.id
          })

          // $FlowIgnore
          getInTabOrder(intendedSwatch?.ref?.current)[0]?.focus?.() // eslint-disable-line

          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [hasFocus, topFocusData])

  useEffect(() => {
    function handleWallClick (e) {
      setHasFocus(true)
      // $FlowIgnore
      wallRef?.current?.removeEventListener('click', handleWallClick) // eslint-disable-line
    }
    function handleOffWallClick (e) {
      if (e.path.indexOf(wallRef?.current) >= 0) {
        return
      }
      setHasFocus(false)
      window.removeEventListener('click', handleOffWallClick)
    }

    if (hasFocus) {
      // $FlowIgnore
      wallRef?.current?.removeEventListener('click', handleWallClick) // eslint-disable-line
      window.addEventListener('click', handleOffWallClick)
    } else {
      window.removeEventListener('click', handleOffWallClick)
      // $FlowIgnore
      wallRef?.current?.addEventListener('click', handleWallClick) // eslint-disable-line
    }

    return () => {
      window.removeEventListener('click', handleOffWallClick)
      // $FlowIgnore
      wallRef?.current?.removeEventListener('click', handleWallClick) // eslint-disable-line
    }
  }, [hasFocus])

  // NOTE: this must remain after wallProps is defined
  const { scale, isZoomed } = wallProps

  return <ColorWallPropsContext.Provider value={wallProps}>
    <div ref={wallRef} className='cwv3__wall'>
      {!hasFocus
        ? <button aria-hidden className='visually-hidden' onFocus={handleTabInBeginning} />
        : <button aria-hidden className='visually-hidden' ref={focusOutStartHelper} onFocus={e => e.target.blur()} />}
      <AutoSizer disableHeight style={{ width: '100%' }} onResize={({ width: thisWidth }) => setContainerWidth(thisWidth)}>{noop}</AutoSizer>
      {shouldRender ? (
        <>
          {isZoomed ? <button onClick={() => onActivateColor()} className='zoom-out-btn' title={messages.ZOOM_OUT}>
            <FontAwesomeIcon icon='search-minus' size='lg' />
          </button> : null}
          <div className='cwv3__wall-scroller' ref={wallContentsRef} style={{
            backgroundColor: colorWallBgColor,
            height: isNaN(height) ? (defaultDimensions?.height + OUTER_SPACING * 2) * scale : height,
            maxHeight: isZoomed && MAX_SCROLLER_HEIGHT,
            minHeight: !isZoomed && MIN_SCROLLER_HEIGHT
          }}>
            <div style={{
              padding: OUTER_SPACING * scale,
              position: 'relative',
              margin: 'auto',
              width: (defaultDimensions?.width + OUTER_SPACING * 2) * scale,
              height: (defaultDimensions?.height + OUTER_SPACING * 2) * scale
            }}>
              <div
                className='cwv3__wall-col'
                style={{
                  width: (defaultDimensions?.width ?? 0) * scale,
                  height: (defaultDimensions?.height ?? 0) * scale,
                  top: OUTER_SPACING * scale,
                  left: OUTER_SPACING * scale
                }}
              >
                {/* $FlowIgnore */}
                {structure?.children?.map((child, i) => {
                  return (
                    <Column
                      key={i}
                      id={i}
                      data={child}
                      updateWidth={noop}
                      updateHeight={noop} />
                  )
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}
      {!hasFocus
        ? <button aria-hidden className='visually-hidden' onFocus={handleTabInEnd} />
        : <button aria-hidden className='visually-hidden' ref={focusOutEndHelper} onFocus={e => e.target.blur()} />}
    </div>
  </ColorWallPropsContext.Provider>
}

export default Wall
