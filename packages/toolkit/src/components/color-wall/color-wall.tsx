import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { faSearchMinus } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import getElementRelativeOffset from 'get-element-relative-offset'
import noop from 'lodash/noop'
import { Color } from '../../interfaces/colors'
import isSomething from '../../utils/isSomething'
import {
  ColorWallPropsContext,
  colorWallPropsDefault,
  ColorWallStructuralPropsContext,
  colorWallStructuralPropsDefault
} from './color-wall-props-context'
import Column from './column'
import { BASE_SWATCH_SIZE, MAX_SCROLLER_HEIGHT, MAX_SWATCH_SIZE, MIN_SCROLLER_HEIGHT, OUTER_SPACING } from './constants'
import { computeWall } from './shared-reducers-and-computers'
import DefaultSwatchBgRenderer from './swatch-bg-renderer'
import DefaultSwatchFgRenderer from './swatch-fg-renderer'
import {
  ActiveSwatchContentRenderer,
  ChunkData,
  Dimensions,
  SwatchBgRenderer,
  SwatchRenderer,
  WallShape
} from './types'
import {
  determineScaleForAvailableWidth,
  findPositionInChunks,
  getInitialSwatchInChunk,
  getInTabOrder,
  getPerimeterLevelTest,
  getProximalChunksBySwatchId,
  getProximalSwatchesBySwatchId,
  needsToWrap
} from './wall-utils'

export interface ColorWallConfig {
  animateActivation?: boolean
  bloomEnabled?: boolean
  colorWallBgColor?: string
  forceWrap?: boolean
  initialFocusId?: string | number
  minWallSize?: number
  titleImage?: string
  zoomOutTitle?: string
}

export interface WallProps {
  activeSwatchContentRenderer?: ActiveSwatchContentRenderer
  activeColorId?: number | string
  chunkClickable?: (chunkId: string) => void
  colorWallConfig?: ColorWallConfig
  height?: number
  onActivateColor?: (id?: number | string) => void
  colorResolver: (id?: number | string) => Color
  shape: WallShape
  swatchRenderer?: SwatchRenderer
  swatchBgRenderer?: SwatchBgRenderer
  width?: number
}

export interface ColorWallType {
  (props: WallProps): JSX.Element
  DefaultSwatchBackgroundRenderer: SwatchBgRenderer
  DefaultSwatchForegroundRenderer: SwatchRenderer
}

const ColorWall: ColorWallType = function ColorWall(props) {
  const {
    activeSwatchContentRenderer,
    activeColorId: dirtyActiveColorId,
    colorResolver,
    colorWallConfig,
    chunkClickable,
    height,
    swatchRenderer = DefaultSwatchFgRenderer,
    swatchBgRenderer = DefaultSwatchBgRenderer,
    onActivateColor = noop,
    shape,
    width = 0
  } = props
  const {
    animateActivation = true,
    bloomEnabled = false,
    colorWallBgColor = '#EEEEEE',
    forceWrap,
    initialFocusId,
    minWallSize,
    titleImage,
    zoomOutTitle = 'Zoom out'
  } = colorWallConfig
  const { children: wallChildren = [], props: wallProps = {} } = shape
  const { wrap } = wallProps
  // this ensures numeric IDs are numeric (so '42' becomes 42), and string IDs remain strings

  /** @todo refactor to push implicit conversion up stack to strongly type internally, we should avoid coersion
   * the ternary still make the later code type check, we could reduce complexity by enforcing type higher up -RS
   */
  const activeColorId =
    typeof dirtyActiveColorId === 'string' && !isNaN(+dirtyActiveColorId) ? +dirtyActiveColorId : dirtyActiveColorId
  const activeColorIdRef = useRef(activeColorId)
  activeColorIdRef.current = activeColorId

  const [hasFocus, setHasFocus] = useState(false)
  const wallContentsRef = useRef<HTMLDivElement>()
  const focusOutStartHelper = useRef<HTMLButtonElement>()
  const focusOutEndHelper = useRef<HTMLButtonElement>()
  const chunks = useRef<Set<ChunkData>>(new Set())
  const wallRef = useRef<HTMLDivElement>()
  const initialFocusRef = useRef<string | number>(initialFocusId)
  const [topFocusData, setTopFocusData] = useState(undefined)
  const [shouldRender, setShouldRender] = useState(false)
  const [containerWidth, setContainerWidth] = useState(width)
  const [defaultDimensions, setDefaultDimensions] = useState<Dimensions | undefined>(undefined)
  const [scaleUnwrapped, setScaleUnwrapped] = useState(1)
  const [defaultWrappedDimensions, setDefaultWrappedDimensions] = useState<Dimensions | undefined>(undefined)
  const [scaleWrapped, setScaleWrapped] = useState(1)
  const [isInWrappedView, setIsInWrappedView] = useState(false) // this will get toggled depending on the width of the wall container vs min width of unwrapped view

  const wrapThisWall = forceWrap ?? (isInWrappedView && wrap)
  const wallW = (wrapThisWall ? defaultWrappedDimensions?.outerWidth : defaultDimensions?.outerWidth) ?? 0
  const wallH = (wrapThisWall ? defaultWrappedDimensions?.outerHeight : defaultDimensions?.outerHeight) ?? 0

  const activeIdRecord = useRef([null])

  useEffect(() => {
    if (activeColorId && activeIdRecord.current[0] !== activeColorId) {
      activeIdRecord.current.unshift(activeColorId)
    } else if (!activeColorId && activeIdRecord.current[0] !== null) {
      activeIdRecord.current.unshift(null)
    }

    activeIdRecord.current = activeIdRecord.current.slice(0, 10) // keep most current 10 records
  }, [activeColorId])

  const setFocusAndScrollTo = useCallback(
    (props: { chunkId?: string; swatchId?: string | number; instant?: boolean } = {}) => {
      setTopFocusData(props)
      if (!props) return
      // if this is empty/0, then we haven't rendered yet
      const swatchRefs = Array.from(chunks.current)
        .map((chunk) => chunk.swatchesRef?.current ?? [])
        .filter((arr) => arr.length)
      const result = (() => {
        try {
          for (let i = swatchRefs.length - 1; i >= 0; i--) {
            for (let ii = swatchRefs[i].length - 1; ii >= 0; ii--) {
              if (swatchRefs[i][ii].id === props.swatchId) {
                return swatchRefs[i][ii].elArr?.[0]
              }
            }
          }
        } catch (err) {
          return // eslint-disable-line
        }
      })()

      // putting scrolling behavior into a timeout to move it out of the current computational area
      // this helps preserve scrolling smoothness
      setTimeout(() => {
        if (result) {
          if (!wallContentsRef.current) return
          const { top = 0, left = 0 } = getElementRelativeOffset(result, (v) => v === wallContentsRef.current)
          const newTop = (top as number) + wallContentsRef.current.clientHeight / -2
          const newLeft = (left as number) + wallContentsRef.current.clientWidth / -2

          if (!!activeIdRecord.current[1] && typeof wallContentsRef.current.scrollTo === 'function') {
            wallContentsRef.current?.scrollTo?.({
              // eslint-disable-line
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
    },
    []
  )

  // this is fired from within swatchRenderer to activate a swatch
  const handleMakeActiveSwatchId = (id): void => {
    onActivateColor(id)
    setTimeout(() => {
      // FUTURE TODO: we would really benefit from an id-based map of swatches in here.
      const { current } = getProximalChunksBySwatchId(chunks.current, id) // eslint-disable-line

      // eslint-disable-next-line array-callback-return
      const ctas = current?.swatchesRef?.current?.reduce?.((accum, next) => {
        if (accum) {
          return accum
        } else if (next?.id === id) {
          return next.elArr
        }
      }, undefined)

      // @ts-ignore
      const ctasInOrder = getInTabOrder(ctas)

      // @ts-ignore
      if (ctasInOrder && ctasInOrder.length > 0) {
        ctasInOrder[0]?.focus?.()
      }
    }, 100)
  }

  const [forceRerender, setForceRerender] = useState(false)
  const wallCtx = useMemo(() => {
    const isZoomed = isSomething(activeColorId) || isSomething(initialFocusRef.current)
    const { current } = findPositionInChunks(chunks.current, activeColorId)

    const getPerimeterLevel = getPerimeterLevelTest(current?.data?.children, activeColorId, bloomEnabled ? 2 : 0)
    return {
      ...colorWallPropsDefault,
      addChunk: (chunk) => chunks.current?.add(chunk),
      activeSwatchContentRenderer: activeSwatchContentRenderer ?? colorWallPropsDefault.activeSwatchContentRenderer,
      activeSwatchId: activeColorId,
      animateActivation,
      chunkClickable,
      colorResolver,
      colorWallConfig,
      getPerimeterLevel,
      hostHasFocus: hasFocus,
      isZoomed,
      setActiveSwatchId: (id) => handleMakeActiveSwatchId(id),
      swatchRenderer,
      swatchBgRenderer
    }
  }, [activeColorId, animateActivation, hasFocus, shouldRender, forceRerender, swatchBgRenderer, swatchRenderer])

  // NOTE: this must remain after wallProps is defined
  const { isZoomed } = wallCtx

  const structuralWallCtx = useMemo(() => {
    // kind of a hack
    // should render being true for the first time AND no chunks means the wall is about to visibly render for the first time
    // we need it to render once in order to have chunks.current.data.children defined, and we need THAT in order to perform blooming
    // this will ONLY run if blooming is enabled
    if (chunks.current.size === 0 && shouldRender && bloomEnabled) {
      setTimeout(() => setForceRerender(true), 0)
    }

    return {
      ...colorWallStructuralPropsDefault,
      isWrapped: isInWrappedView,
      // TODO: toggle this based on whether or not we break under our min unwrapped width
      scale: isZoomed ? MAX_SWATCH_SIZE / BASE_SWATCH_SIZE : isInWrappedView ? scaleWrapped : scaleUnwrapped
    }
  }, [isZoomed, shouldRender, scaleUnwrapped, scaleWrapped, forceRerender, isInWrappedView])
  const { scale } = structuralWallCtx
  useEffect(() => {
    // if shouldRender is not true, there will be nothing rendered to scroll to
    if ((isSomething(activeColorId) || isSomething(initialFocusRef.current)) && shouldRender) {
      const goingTo = isSomething(initialFocusRef.current) ? initialFocusRef.current : activeColorId
      setFocusAndScrollTo({
        swatchId: goingTo,
        chunkId: getProximalChunksBySwatchId(chunks.current, goingTo)?.current?.id
      })

      if (isSomething(initialFocusRef.current)) {
        // get this chunk based on the swatch ID...
        const { current } = getProximalChunksBySwatchId(chunks.current, goingTo)
        // ... get this swatch ref based on found chunk and swatch ID...
        const { current: currentSwatch } = getProximalSwatchesBySwatchId(chunks.current, current?.id, goingTo)
        setHasFocus(true)
        initialFocusRef.current = null // clear out once we use it 1 time

        setTimeout(() => currentSwatch?.elArr?.[0].focus?.(), 100)
      }
    }
  }, [activeColorId, shouldRender])

  const handleTabInBeginning = (e): void => {
    const { first } = getProximalChunksBySwatchId(chunks.current)
    const swatch = getInitialSwatchInChunk(first, activeColorId)
    if (swatch) {
      const { el, id } = swatch
      setFocusAndScrollTo({
        swatchId: id,
        chunkId: first.id
      })

      el.focus?.()

      e.preventDefault()
    }

    setHasFocus(true)
  }

  const handleTabInEnd = (e): void => {
    const { last } = getProximalChunksBySwatchId(chunks.current)
    const swatch = getInitialSwatchInChunk(last, activeColorId)

    if (swatch) {
      const { el, id } = swatch
      setFocusAndScrollTo({
        swatchId: id,
        chunkId: last.id
      })
      el?.focus?.()

      e.preventDefault()
    }

    setHasFocus(true)
  }
  const computedWallUnwrapped = useRef<Dimensions>()
  const computedWallWrapped = useRef<Dimensions>()
  useEffect(() => {
    if (containerWidth > 0 && shape) {
      if (!computedWallUnwrapped.current) {
        computedWallUnwrapped.current =
          computedWallUnwrapped.current || computeWall(shape, { ...colorWallStructuralPropsDefault, isWrapped: false })
        setDefaultDimensions({
          outerWidth: computedWallUnwrapped.current.outerWidth,
          outerHeight: computedWallUnwrapped.current.outerHeight,
          widths: computedWallUnwrapped.current.widths,
          heights: computedWallUnwrapped.current.heights
        })
      }

      if (!computedWallWrapped.current) {
        computedWallWrapped.current =
          computedWallWrapped.current ||
          computeWall(shape, {
            ...colorWallStructuralPropsDefault,
            isWrapped: true
          })
        setDefaultWrappedDimensions({
          outerWidth: computedWallWrapped.current.outerWidth,
          outerHeight: computedWallWrapped.current.outerHeight,
          widths: computedWallWrapped.current.widths,
          heights: computedWallWrapped.current.heights
        })
      }

      if (computedWallUnwrapped.current && computedWallWrapped.current) {
        const newScaleUnwrapped = determineScaleForAvailableWidth(
          computedWallUnwrapped.current.outerWidth,
          containerWidth
        )
        const shouldWrap = needsToWrap(newScaleUnwrapped)
        setScaleUnwrapped(newScaleUnwrapped)
        setIsInWrappedView(shouldWrap)
        const newScaleWrapped = determineScaleForAvailableWidth(
          computedWallWrapped.current.outerWidth,
          containerWidth,
          minWallSize
        )
        setScaleWrapped(newScaleWrapped)

        setShouldRender(true)
      }
    }
  }, [shape, shouldRender, containerWidth])

  useEffect(() => {
    if (!hasFocus) return () => {}
    const handleKeyDown = (e): void => {
      if (!hasFocus) {
        return
      }
      // if the currently-focused element is not within the wall and is not the wall...
      if (
        wallRef.current?.contains &&
        !wallRef.current.contains(document.activeElement) &&
        document.activeElement !== wallRef.current
      ) {
        // ... don't process any keydown handling
        return
      }
      // prevent default behavior for arrow keys
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp' || e.code === 'ArrowRight' || e.code === 'ArrowDown') {
        e.preventDefault()
      }
      switch (e.code) {
        case 'Tab': {
          const { next, current, previous, first } = getProximalChunksBySwatchId(chunks.current, topFocusData?.swatchId)
          const intendedChunk = !current ? first : e.shiftKey ? previous : next
          if (topFocusData?.swatchId === activeColorId) {
            // this means we are on the currently-active swatch
            // eslint-disable-next-line array-callback-return
            const availableCTAs = current?.swatchesRef?.current?.reduce?.((accum, next) => {
              if (accum) {
                return accum
              } else if (next?.id === activeColorId) {
                return next
              }
            }, undefined)?.elArr

            if (availableCTAs?.length) {
              e.preventDefault?.()
              const sortedCTAs = getInTabOrder(availableCTAs)
              // if we actually have CTAs in here, proceed...
              const focusIndexCTA: number = sortedCTAs.reduce(
                (accum, next, i) => (document.activeElement === next ? i : accum),
                -1
              )
              const newFocusIndex = focusIndexCTA + (e.shiftKey ? -1 : 1)
              // @ts-ignore
              if (newFocusIndex >= 0 && newFocusIndex < sortedCTAs.length) {
                sortedCTAs[newFocusIndex].focus?.() // eslint-disable-line
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
              el?.focus?.()
              e.preventDefault?.()
            }
          } else if (current) {
            // the user is trying to tab out of the wall either at the beginning or end
            // must do this BEFORE setting focus state
            ;(e.shiftKey ? focusOutStartHelper : focusOutEndHelper)?.current?.focus?.()
            setFocusAndScrollTo()
            setHasFocus(false)
          }
          break
        }
        case 'Escape': {
          onActivateColor(null)
          if (activeColorId) {
            // need to get whatever our previous active chunk was, and we need the first swatch
            // getInitialSwatchInChunk(intendedChunk, activeColorId)
            setFocusAndScrollTo(topFocusData)
          }
          break
        }
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown': {
          const ids = getProximalSwatchesBySwatchId(chunks.current, topFocusData?.chunkId, topFocusData?.swatchId)
          const intendedSwatch = {
            ArrowLeft: ids?.left,
            ArrowUp: ids?.up,
            ArrowRight: ids?.right,
            ArrowDown: ids?.down
          }[e.code]
          setFocusAndScrollTo({ ...topFocusData, swatchId: intendedSwatch?.id })
          intendedSwatch?.elArr[0]?.focus?.()
          break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [hasFocus, topFocusData, activeColorId])

  useEffect(() => {
    function handleWallClick(e): void {
      setHasFocus(true)
      wallRef?.current?.removeEventListener('click', handleWallClick) // eslint-disable-line
    }

    function handleOffWallClick(e): void {
      if (e.path?.indexOf(wallRef?.current) >= 0) {
        return
      }

      setHasFocus(false)
      window.removeEventListener('click', handleOffWallClick)
    }

    if (hasFocus) {
      wallRef?.current?.removeEventListener('click', handleWallClick)

      window.addEventListener('click', handleOffWallClick)
    } else {
      window.removeEventListener('click', handleOffWallClick)
      wallRef?.current?.addEventListener('click', handleWallClick)
    }

    return () => {
      window.removeEventListener('click', handleOffWallClick)
      wallRef?.current?.removeEventListener('click', handleWallClick)
    }
  }, [hasFocus])
  const handleViewportResize = useCallback(({ width: thisWidth }) => {
    setContainerWidth(thisWidth)
  }, [])

  return (
    <ColorWallPropsContext.Provider value={wallCtx}>
      <ColorWallStructuralPropsContext.Provider value={structuralWallCtx}>
        {titleImage && (
          <div className={`flex justify-between items-end m-3 mb-0${isZoomed ? ' pt-16' : ''}`}>
            {wallChildren?.map((child) =>
              child.children.map((child) => child.children.map((child, i) => <Titles data={child.titles} key={i} />))
            )}
            <img src={titleImage} style={{ width: '162px', height: '94.5px' }} />
          </div>
        )}
        <section ref={wallRef} className='relative block'>
          {!hasFocus ? (
            <button aria-hidden className='sr-only' onFocus={handleTabInBeginning} />
          ) : (
            <button aria-hidden className='sr-only' ref={focusOutStartHelper} onFocus={(e) => e.target.blur()} />
          )}
          <AutoSizer
            disableHeight
            style={{
              width: '100%'
            }}
            onResize={handleViewportResize}
          >
            {noop}
          </AutoSizer>
          {shouldRender ? (
            <>
              {isZoomed ? (
                <button
                  onClick={() => onActivateColor()}
                  data-testid='wall-zoom-btn'
                  className='flex absolute top-0 right-0 z-[1002] my-2.5 mx-5 rounded-full w-10 h-10 items-center justify-center color-buttonColor bg-buttonBgColor shadow hover:color-buttonHoverColor hover:bg-buttonHoverBgColor focus:color-buttonHoverColor focus:bg-buttonHoverBgColor active:color-buttonActiveColor active:bg-buttonActiveBgColor'
                  title={zoomOutTitle}
                >
                  <FontAwesomeIcon icon={faSearchMinus} size='lg' />
                </button>
              ) : null}
              <div
                className={`relative overflow-auto ${forceWrap ? 'overflow-y-hidden' : ''}`}
                data-testid='wall-height-div'
                ref={wallContentsRef}
                style={{
                  backgroundColor: colorWallBgColor,
                  height: isNaN(height) ? (wallH + OUTER_SPACING * 2) * scale : height,
                  maxHeight: isZoomed && MAX_SCROLLER_HEIGHT,
                  minHeight: !isZoomed && MIN_SCROLLER_HEIGHT
                }}
              >
                <div
                  style={{
                    padding: OUTER_SPACING * scale,
                    position: 'relative',
                    margin: 'auto',
                    width: (wallW + OUTER_SPACING * 2) * scale,
                    height: (wallH + OUTER_SPACING * 2) * scale
                  }}
                >
                  <div
                    className={`flex flex-row justify-center items-stretch absolute ${
                      wrapThisWall ? 'flex-wrap' : 'flex-nowrap'
                    }`}
                    data-testid='wall-first-column-container'
                    style={{
                      width: (wallW ?? 0) * scale,
                      height: (wallH ?? 0) * scale,
                      top: OUTER_SPACING * scale,
                      left: OUTER_SPACING * scale
                    }}
                  >
                    {wallChildren?.map((child, i) => {
                      return <Column key={i} id={i} data={child} updateWidth={noop} updateHeight={noop} />
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {!hasFocus ? (
            <button aria-hidden data-testid='wall-handleTabInEnd-btn' className='sr-only' onFocus={handleTabInEnd} />
          ) : (
            <button
              aria-hidden
              data-testid='wall-focusOutEndHelper-btn'
              className='sr-only'
              ref={focusOutEndHelper}
              onFocus={(e) => e.target.blur()}
            />
          )}
        </section>
      </ColorWallStructuralPropsContext.Provider>
    </ColorWallPropsContext.Provider>
  )
}

ColorWall.DefaultSwatchBackgroundRenderer = DefaultSwatchBgRenderer
ColorWall.DefaultSwatchForegroundRenderer = DefaultSwatchFgRenderer

export default ColorWall
