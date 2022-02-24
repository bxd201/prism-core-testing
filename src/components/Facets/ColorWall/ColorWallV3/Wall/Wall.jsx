import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import ColorWallPropsContext, { colorWallPropsDefault } from '../ColorWallPropsContext'
import Column from '../Column/Column'
import './Wall.scss'
import noop from 'lodash/noop'
import { AutoSizer } from 'react-virtualized'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import { computeWall } from '../sharedReducersAndComputers'
import useEffectAfterMount from 'src/shared/hooks/useEffectAfterMount'
import { getProximalChunksBySwatchId, getProximalSwatchesBySwatchId } from './wallUtils'
import getElementRelativeOffset from 'get-element-relative-offset'

function Wall (props) {
  const { data } = props // eslint-disable-line
  const [hasFocus, setHasFocus] = useState(false)
  const wallContentsRef = useRef()
  const focusOutStartHelper = useRef()
  const focusOutEndHelper = useRef()
  const chunks = useRef(new Set())
  const wallRef = useRef()
  const [topFocusData, setTopFocusData] = useState()
  const [topActiveSwatchId, setTopActiveSwatchId] = useState()

  const setFocusAndScrollTo = useCallback((props) => {
    setTopFocusData(props)

    if (!props) return

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
    })()

    if (result) {
      const { top = 0, left = 0 } = getElementRelativeOffset(result, v => v === wallContentsRef.current)
      const newTop = top + (wallContentsRef.current.clientHeight / -2)
      const newLeft = left + (wallContentsRef.current.clientWidth / -2)

      if (typeof wallContentsRef.current.scrollTo === 'function') {
        wallContentsRef.current.scrollTo({
          top: newTop,
          left: newLeft,
          behavior: 'smooth'
        })
      } else {
        // just for IE and old browser support
        wallContentsRef.current.scrollTop = newTop
        wallContentsRef.current.scrollLeft = newLeft
      }
    }
  }, [])

  const wallProps = useMemo(() => {
    return {
      ...colorWallPropsDefault,
      addChunk: chunk => chunks?.current?.add(chunk),
      hostHasFocus: hasFocus,
      activeSwatchId: topActiveSwatchId,
      swatchRenderer: ({ id, ref, active }) => ( // eslint-disable-line
        // this should contain a real Swatch component that will render active swatch contents
        // things like calls to action, background color, all that
        // NOTE: needs the absolute position wrapper, doesn't need a background color
        <>
          <button
            ref={!active ? ref : null}
            tabIndex={!active ? 0 : -1}
            disabled={active}
            onClick={() => {
              setTopActiveSwatchId(id)
              setFocusAndScrollTo({
                swatchId: id,
                chunkId: getProximalChunksBySwatchId(chunks, id)?.current?.id
              })
            }}
            className={`cwv3__swatch-renderer ${active ? 'cwv3__swatch-renderer--active' : ''}`}
            style={{
              // TODO: background should be the color of the swatch
              background: 'transparent'
            }}
            title={`TODO: populate with name/number of color swatch`}
          />
          {active
            ? <div
              className={`cwv3__swatch-renderer__inner ${active ? 'cwv3__swatch-renderer__inner--active' : ''}`}
            >
              {/* Actual swatch contents (buttons, calls to action, links, name and number) go here */}
              {id}
              <button ref={active ? ref : null}>Click this</button>
              <button>Do this</button>
            </div>
            : null}
        </>
      )
    }
  }, [topActiveSwatchId, hasFocus])
  const { scale } = wallProps
  const [shouldRender, setShouldRender] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [defaultDimensions, setDefaultDimensions] = useState()

  const handleTabInBeginning = (e) => {
    const { first } = getProximalChunksBySwatchId(chunks)
    if (first) {
      const newId = first.data?.children?.[0]?.[0] ?? null
      if (typeof newId !== 'undefined' && newId !== null) {
        setFocusAndScrollTo({
          swatchId: newId,
          chunkId: first.id
        })

        first.swatchesRef?.current?.[0]?.el?.focus?.() // eslint-disable-line

        e.preventDefault()
      }
    }
    setHasFocus(true)
  }

  const handleTabInEnd = (e) => {
    const { last } = getProximalChunksBySwatchId(chunks)
    if (last) {
      const newId = last.data?.children?.[0]?.[0] ?? null

      if (typeof newId !== 'undefined' && newId !== null) {
        setFocusAndScrollTo({
          swatchId: newId,
          chunkId: last.id
        })

        last.swatchesRef?.current?.[0]?.el?.focus?.() // eslint-disable-line

        e.preventDefault()
      }
    }
    setHasFocus(true)
  }

  useEffectAfterMount(() => {
    if (!shouldRender && containerWidth > 0 && data) {
      const { width, height, widths, heights } = computeWall(data) ?? {}

      if (!isNaN(width) && !isNaN(height)) {
        setDefaultDimensions({ width, height, widths, heights })
        setShouldRender(true)
      } else {
        throw Error('Wall width/height must be numeric.')
      }
    }
  }, [data, shouldRender, containerWidth])

  useEffect(() => {
    if (!hasFocus) return () => {}

    const handleKeyDown = e => {
      if (!hasFocus) { return }
      // prevent default behavior for arrow keys
      if (e.keyCode >= 37 && e.keyCode <= 40) { e.preventDefault() }

      switch (e.keyCode) {
        case 9: {
          const { next, current, previous } = getProximalChunksBySwatchId(chunks, topFocusData?.swatchId)
          const intendedChunk = e.shiftKey ? previous : next

          if (intendedChunk && current) {
            const newId = intendedChunk.data?.children?.[0]?.[0] ?? null

            if (newId !== null) {
              setFocusAndScrollTo({
                swatchId: newId,
                chunkId: intendedChunk?.id
              })

              intendedChunk.swatchesRef?.current?.[0]?.el?.focus?.() // eslint-disable-line

              e.preventDefault?.() // eslint-disable-line
            }
          } else if (current) {
            // the user is trying to tab out of the wall either at the beginning or end
            // must do this BEFORE setting focus state
            (e.shiftKey ? focusOutStartHelper : focusOutEndHelper)?.current?.focus?.() // eslint-disable-line
            setFocusAndScrollTo()
            setHasFocus(false)
          }
          break
        }
        case 37:
        case 38:
        case 39:
        case 40: {
          const ids = getProximalSwatchesBySwatchId(chunks, topFocusData?.chunkId, topFocusData?.swatchId)
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

          intendedSwatch?.ref?.focus?.() // eslint-disable-line

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
      wallRef?.current?.removeEventListener('click', handleWallClick) // eslint-disable-line
      window.addEventListener('click', handleOffWallClick)
    } else {
      window.removeEventListener('click', handleOffWallClick)
      wallRef?.current?.addEventListener('click', handleWallClick) // eslint-disable-line
    }

    return () => {
      window.removeEventListener('click', handleOffWallClick)
      wallRef?.current?.removeEventListener('click', handleWallClick) // eslint-disable-line
    }
  }, [hasFocus])

  return <ColorWallPropsContext.Provider value={wallProps}>
    <div ref={wallRef} className='cwv3__wall'>
      {!hasFocus
        ? <button onFocus={handleTabInBeginning} />
        : <button ref={focusOutStartHelper} onFocus={e => e.target.blur()} />}
      <AutoSizer disableHeight style={{ width: '100%' }} onResize={({ width: thisWidth }) => setContainerWidth(thisWidth)}>{noop}</AutoSizer>
      {shouldRender ? (
        <div className='cwv3__wall-scroller' ref={wallContentsRef} style={{ height: defaultDimensions?.height * scale }}>
          <div
            className='cwv3__wall-col'
            style={{ width: defaultDimensions?.width * scale }}
          >
            {data?.children?.map((child, i) => {
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
      ) : <h1>Processing</h1>}
      {!hasFocus
        ? <button onFocus={handleTabInEnd} />
        : <button ref={focusOutEndHelper} onFocus={e => e.target.blur()} />}
    </div>
  </ColorWallPropsContext.Provider>
}

export default Wall
