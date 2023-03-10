// @flow
import React, { useEffect } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import facetBinder from 'src/facetSupport/facetBinder'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import { add } from 'src/store/actions/live-palette'
import FastMask from '../../FastMask/FastMask'
import LivePaletteWrapper from '../../LivePalette/LivePaletteWrapper'

type Props = {
  loading: boolean
}

function FastMaskSimpleFacet (props: Props) {
  /* TO DO: Add logic to guard against colors being in the Live Palette  */
  const { loading } = props
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

  if (loading) {
    return <HeroLoader />
  }

  return (
    <>
      <div className='FastMaskSimple prism__root-container'>
        <div className='FastMaskSimple__fm-wrap'>
          <FastMask />
        </div>
        <LivePaletteWrapper />
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
