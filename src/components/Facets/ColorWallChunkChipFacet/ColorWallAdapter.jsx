// @flow
import React, { useState, useEffect, useContext, useRef } from 'react'
import ColorWallContext, { type ColorWallContextProps } from '../ColorWall/ColorWallContext'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useSelector } from 'react-redux'
import noop from 'lodash/noop'
import kebabCase from 'lodash/kebabCase'
import ColorWall from '../ColorWall/ColorWall'
import ColorWallV2 from './ColorWallV2'

type ColorWallAdapterProps = {
  wallBanner?: string
}

function ColorWallAdapter ({ wallBanner }: ColorWallAdapterProps) {
  const { params = {} }: { url: string, params: { section: ?string, colorNumber?: ?string } } = useRouteMatch()
  const { section: routeSection, colorNumber: routeColorNumber } = params
  const cwctxtprops: ColorWallContextProps = useContext(ColorWallContext)
  const { items: { colorMap = {} }, sections }: ColorsState = useSelector(state => state.colors)
  // look up color ID
  const [displayedSection, setDisplayedSection] = useState()
  const [displayedColorId, setDisplayedColorId] = useState()
  const history = useHistory()
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (colorMap && sections?.length) {
      if (routeSection && !routeColorNumber) {
        // TODO:
        // we do NOT have a color number, but we have a section
        const chosenSection = sections.reduce((accum, next) => {
          const isMatch = kebabCase(next) === kebabCase(routeSection)
          if (accum) return accum
          if (isMatch) return next
        }, undefined)

        if (chosenSection) {
          setDisplayedColorId()
          setDisplayedSection(chosenSection)
        } else {
          // there's a problem; no matched section
          // TODO: handle it
        }
      } else if (!routeSection && routeColorNumber) {
        // TODO:
        // we have a color number, but no section -- find section and set both states
        const matchedColor = Object.keys(colorMap).reduce((accum, key) => {
          const isMatch = kebabCase(`${colorMap[key].brandKey}${colorMap[key].colorNumber}`) === kebabCase(routeColorNumber)
          if (accum) return accum
          if (isMatch) return colorMap[key]
        }, undefined)

        if (matchedColor) {
          setDisplayedSection(matchedColor?.colorGroup?.[0])
          setDisplayedColorId(matchedColor?.id)
        } else {
          // there's a problem, render an error? route to default?
          // TODO: handle it
        }
      } else {
        // TODO:
        // has nothing; render main wall
        setDisplayedSection()
        setDisplayedColorId()
      }

      setKey(Date.now())
    }
  }, [colorMap, routeSection, routeColorNumber, sections])

  const activeColorRouteBuilderRef = useRef(noop)
  const inactiveColorRouteBuilderRef = useRef(noop)

  activeColorRouteBuilderRef.current = (color) => {
    history.push(`/color-locator/${kebabCase(`${color.brandKey}${color.colorNumber}`)}`)
  }
  inactiveColorRouteBuilderRef.current = (color) => {
    history.push(`/color-chunk/${kebabCase(color.colorGroup[0])}`)
  }

  return <>
    <ColorWallContext.Provider value={{
      ...cwctxtprops,
      activeColorRouteBuilderRef,
      inactiveColorRouteBuilderRef
    }}>
      {displayedSection
        ? <ColorWall section={displayedSection} colorId={displayedColorId} key={key} />
        : <div style={{ margin: '0 1em' }}>
          <h1 className='cw2__title'>Find Chip.</h1>
          <h2 className='cw2__subtitle'>Click on a section to view colors</h2>
          { wallBanner
            ? <img src={wallBanner} style={{ maxWidth: '100%', margin: '0 auto .5em' }} />
            : null }
          <ColorWallV2 onChunkClicked={color => inactiveColorRouteBuilderRef.current(color)} />
        </div>
      }
    </ColorWallContext.Provider>
  </>
}

export default ColorWallAdapter
