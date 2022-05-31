// @flow
import React, { useContext, useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import ColorWallPropsContext from '../ColorWallPropsContext'
import { computeChunk } from '../sharedReducersAndComputers'
import Prism, { ColorSwatch } from '@prism/toolkit'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import isSomething from 'src/shared/utils/isSomething.util'
import { fullColorName } from 'src/shared/helpers/ColorUtils'
import './Chunk.scss'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'

const swatchClass = 'cwv3__swatch'

type ChunkProps = {
  data: { children: any },
  id: string,
  updateHeight: any => void,
  updateWidth: any => void,
}

function Chunk ({ data = {}, id = '', updateHeight, updateWidth }: ChunkProps) {
  const ctx = useContext(ColorWallPropsContext)
  const { brandId, brandKeyNumberSeparator, colorWall: { colorSwatch = {} } }: ConfigurationContextType = useContext(ConfigurationContext)
  const { houseShaped = false } = colorSwatch
  const { items: { colorMap } }: ColorsState = useSelector(state => state.colors)
  const { params } = useRouteMatch()
  const { addChunk, activeSwatchId, getPerimeterLevel, isZoomed, setActiveSwatchId, swatchContentRefs, swatchRenderer } = ctx
  const [ , setWidth ] = useState(0)
  const [ , setHeight ] = useState(0)
  const [ swatchWidth, setSwatchWidth ] = useState(0)
  const [ swatchHeight, setSwatchHeight ] = useState(0)
  const [ horzSpace, setHorzSpace ] = useState(0)
  const [ vertSpace, setVertSpace ] = useState(0)
  const thisEl = useRef()
  const swatchRefs = useRef([])
  const swatchRefsMap = useRef({})

  useEffect(() => {
    const results = computeChunk(data, ctx)

    if (results) {
      const {
        horizontalSpace,
        innerHeight,
        innerWidth,
        outerHeight,
        outerWidth,
        swatchHeight,
        swatchWidth,
        verticalSpace
      } = results

      setSwatchWidth(swatchWidth)
      setHorzSpace(horizontalSpace)
      setSwatchHeight(swatchHeight)
      setVertSpace(verticalSpace)
      setWidth(innerWidth)
      updateWidth(outerWidth)
      setHeight(innerHeight)
      updateHeight(outerHeight)
    }
  }, [data, ctx])

  useEffect(() => {
    addChunk({
      chunkRef: thisEl,
      swatchesRef: swatchRefs,
      id: id,
      data: data
    })
  }, [])

  const addToSwatchRefs = (el, id) => {
    const refIndex = swatchRefsMap.current[id]

    if (isSomething(refIndex)) {
      swatchRefs.current[refIndex] = { el, id }
    } else {
      const newIndex = swatchRefs.current.push({ el, id }) - 1
      swatchRefsMap.current[id] = newIndex
    }
  }

  return (
    <div
      ref={thisEl}
      className={`cwv3__chunk${houseShaped && isZoomed ? ' cwv3__chunk--no-focus' : ''}`}
      style={{ padding: `${vertSpace}px ${horzSpace}px` }}
    >
      {data.children.map((row, i) => (
        // TODO: remove dependence on route matching; all display variation should be handled through the API and data
        <div className={`cwv3__chunk__row${params.family ? ' cwv3__chunk__row__family' : ''}`} key={i}>
          {row.map((childId, ii) => {
            const active = activeSwatchId === childId
            const color = colorMap[childId]
            const perimeterLevel = getPerimeterLevel(childId)

            return (
              <Prism key={`${i}_${ii}`}>
                <ColorSwatch
                  active={active}
                  activeFocus={!houseShaped}
                  aria-label={fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)}
                  color={color}
                  className={`${swatchClass}${active ? ` ${swatchClass}--active${houseShaped ? ` ${swatchClass}--house-shaped` : ''}` : ''}${perimeterLevel > 0 ? ` ${swatchClass}--perimeter ${swatchClass}--perimeter--${perimeterLevel}` : ''}`}
                  id={childId}
                  onClick={() => {
                    setActiveSwatchId(childId)
                    swatchContentRefs.current = []
                    GA.event({ category: 'Color Wall', action: 'Color Swatch Click', label: fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator) }, GA_TRACKER_NAME_BRAND[brandId])
                  }}
                  ref={_el => addToSwatchRefs({ current: [_el, ...swatchContentRefs.current] }, childId)}
                  renderer={swatchRenderer}
                  style={{ height: swatchHeight, width: swatchWidth }}
                />
              </Prism>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Chunk
