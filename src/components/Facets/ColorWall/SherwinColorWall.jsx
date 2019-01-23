// @flow
import React, { PureComponent } from 'react'
import memoizee from 'memoizee'
import { Link } from 'react-router-dom'

import { BLANK_SWATCH, SW_CHUNK_SIZE } from 'constants/globals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { convertColorSetsToGrid } from '../../../shared/helpers/ColorDataUtils'
import { generateColorWallPageUrl, generateColorDetailsPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import { compareKebabs } from '../../../shared/helpers/StringUtils'

import type { ColorSetPayload, ColorMap, Color, ColorGrid } from '../../../shared/types/Colors'

import ColorWallSwatchList from './ColorWallSwatchList'

type Props = {
  colors: ColorSetPayload,
  brights: ColorSetPayload,
  colorMap: ColorMap,
  addToLivePalette?: Function,
  activeColor: Color,
  family?: string,
  section?: string,
  families?: string[]
}

class SherwinColorWall extends PureComponent<Props> {
  previewColor = void (0)
  cwRef = void (0)
  allColors = void (0)

  constructor (props: Props) {
    super(props)

    this.colorFamily = this.colorFamily.bind(this)
    this.getColorGrid = this.getColorGrid.bind(this)
    this.buildSwatchLink = this.buildSwatchLink.bind(this)
    this.buildSwatchDetailsLink = this.buildSwatchDetailsLink.bind(this)
  }

  render () {
    return (
      <React.Fragment>
        <div className='color-wall-wall'>
          { this.colorFamily() }
        </div>
      </React.Fragment>
    )
  }

  getColorGrid = memoizee(function getColorGrid (targetFamily: string | void, families: string[] | void): ColorGrid | void {
    const { colors, brights } = this.props

    if (!families || families.length === 0) {
      return void (0)
    }

    let filteredColorSets = families.filter((familyName: string) => {
      if (!targetFamily) {
        return true
      }

      return compareKebabs(familyName, targetFamily)
    })

    if (filteredColorSets.length) {
      return convertColorSetsToGrid(filteredColorSets, colors, brights, BLANK_SWATCH, SW_CHUNK_SIZE)
    }

    return void (0)
  }, { primitive: true, length: 2 })

  buildSwatchDetailsLink = function buildSwatchDetailsLink (color: Color): string {
    return generateColorDetailsPageUrl(color)
  }

  buildSwatchLink = function buildSwatchLink (color: Color): string {
    return generateColorWallPageUrl(this.props.section, this.props.family, color.id, fullColorName(color.brandKey, color.colorNumber, color.name))
  }

  colorFamily = function colorFamily () {
    const { family, families, section, activeColor, colorMap, addToLivePalette } = this.props
    const colorsGrid = this.getColorGrid(family, families)
    const key = `${section || ''}_${family || ''}`

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
            swatchLinkGenerator={this.buildSwatchLink}
            swatchDetailsLinkGenerator={this.buildSwatchDetailsLink}
            minCellSize={50}
            maxCellSize={50}
            key={key}
            colors={colorsGrid}
            initialActiveColor={activeColor}
            activeColor={activeColor} />
        ) : (
          <ColorWallSwatchList
            showAll
            immediateSelectionOnActivation
            colorMap={colorMap}
            swatchLinkGenerator={this.buildSwatchLink}
            swatchDetailsLinkGenerator={this.buildSwatchDetailsLink}
            minCellSize={15}
            maxCellSize={25}
            key={`${key}-showAll`}
            colors={colorsGrid} />
        )}
        {activeColor && (
          <div className='color-wall-wall__btns'>
            <Link to={generateColorWallPageUrl(section, family)} title='Zoom Out' className='color-wall-wall__btns__btn'>
              <FontAwesomeIcon icon='search-minus' size='lg' />
            </Link>
          </div>
        )}
      </React.Fragment>
    )
  }
}

export default SherwinColorWall
