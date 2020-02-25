// @flow
import React, { useEffect } from 'react'
import FastMask from '../../FastMask/FastMask'
import LivePalette from '../../LivePalette/LivePalette'
import { add } from 'src/store/actions/live-palette'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import { connect, useDispatch, useSelector } from 'react-redux'
import './FastMaskSimple.scss'

function FastMaskSimpleFacet (props) {
/* TO DO: Add logic to guard against colors being in the Live Palette  */

  const dispatch = useDispatch()
  const colorMap = useSelector(state => state.colors.items.colorMap)

  useEffect(() => {
    if (colorMap) {
      dispatch(add(colorMap[2378]))
      dispatch(add(colorMap[2182]))
      dispatch(add(colorMap[11193]))
      dispatch(add(colorMap[2234]))
      dispatch(add(colorMap[2921]))
      dispatch(add(colorMap[2906]))
      dispatch(add(colorMap[2511]))
      dispatch(add(colorMap[2607]))
    }
  }, [colorMap])

  return (
    <>
      <div className='prism__root-container'>
        <FastMask />
        <LivePalette />
      </div>
    </>
  )
}

const mapStateToProps = (state, props) => {
  return {
    toggleCompareColor: state.lp.toggleCompareColor
  }
}

export default facetBinder(connect(mapStateToProps, null)(ColorDataWrapper(FastMaskSimpleFacet)), 'FastMaskSimple')
