// @flow
import React, { PureComponent } from 'react'
import { withRouter, Route } from 'react-router-dom'

import { BLANK_SWATCH, SW_CHUNK_SIZE } from 'constants/globals'

import { convertFamiliesToGrid } from '../../../shared/helpers/ColorDataUtils'
import { compareKebabs } from '../../../shared/helpers/StringUtils'

import type { ColorFamilyPayload, ColorMap, Color, ColorGrid } from '../../../shared/types/Colors'

import ColorDetails from '../ColorDetails/ColorDetails'
import ColorWallSwatchList from './ColorWallSwatchList'
import ColorWallButton from './ColorWallButton'
import { memoize } from 'lodash'

type Props = {
  colors: ColorFamilyPayload,
  brights: ColorFamilyPayload,
  colorMap: ColorMap,
  onActivateColor: Function,
  onSelectFamily: Function,
  addToLivePalette?: Function,
  family: string,
  families: string[],
  activeColor: Color
}

class SherwinColorWall extends PureComponent<Props> {
  previewColor = void (0)
  cwRef = void (0)
  allColors = void (0)

  constructor (props: Props) {
    super(props)

    this.colorFamily = this.colorFamily.bind(this)
    this.handleActivateColor = this.handleActivateColor.bind(this)
    this.getColorGrid = this.getColorGrid.bind(this)
  }

  render () {
    const { onSelectFamily, family, families } = this.props
    console.log('sherwin color wall rendered ')
    const ColorWallButtons = families ? families.map(thisFamily => {
      return <ColorWallButton key={thisFamily} selectFamily={onSelectFamily} family={thisFamily} checked={compareKebabs(thisFamily, family)} />
    }) : null

    return (
      <React.Fragment>
        <div className='color-wall-buttons'>
          {ColorWallButtons}
        </div>
        <div className='color-wall-wall'>
          { this.colorFamily() }
        </div>
        <hr />
        <Route path='/active/color-wall/color/:colorId' exact render={this.renderColorDetails} />
      </React.Fragment>
    )
  }

  handleActivateColor = function handleActivateColor (color: Color) {
    this.props.onActivateColor(color)
  }

  getColorGrid = memoize(function getColorGrid (targetFamily: string): ColorGrid | void {
    const { colors, brights, families } = this.props

    let filteredFamilies = families.filter((fam: string) => {
      const iFam = fam.toLowerCase()
      const tgtFam = targetFamily && targetFamily.toLowerCase()

      if (tgtFam === 'all') {
        return iFam !== 'all'
      }

      return compareKebabs(iFam, tgtFam)
    })

    if (filteredFamilies.length) {
      return convertFamiliesToGrid(filteredFamilies, colors, brights, BLANK_SWATCH, SW_CHUNK_SIZE)
    }

    return void (0)
  })

  colorFamily = function colorFamily () {
    const { family, activeColor, colorMap, addToLivePalette } = this.props

    const colorsGrid = this.getColorGrid(family)

    if (!colorsGrid) {
      return null
    }

    return (
      <React.Fragment>
        {activeColor ? (
          <ColorWallSwatchList
            bloomRadius={2}
            onAddColor={addToLivePalette}
            colorMap={colorMap}
            cellSize={50}
            key={family}
            colors={colorsGrid}
            initialActiveColor={activeColor}
            activeColor={activeColor} />
        ) : (
          <ColorWallSwatchList
            showAll
            immediateSelectionOnActivation
            colorMap={colorMap}
            cellSize={50}
            key={`${family}-showAll`}
            colors={colorsGrid}
            onActivateColor={this.handleActivateColor} />
        )}
      </React.Fragment>
    )
  }

  renderColorDetails (props) {
    return <ColorDetails {...props} />
  }
}

export default withRouter(SherwinColorWall)
