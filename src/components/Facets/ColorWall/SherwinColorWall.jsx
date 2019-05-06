// @flow
import React, { PureComponent } from 'react'
import memoizee from 'memoizee'
import { Link } from 'react-router-dom'
import { injectIntl, FormattedMessage, type intlShape } from 'react-intl'

import { BLANK_SWATCH, SW_CHUNK_SIZE } from 'constants/globals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { convertColorSetsToGrid } from '../../../shared/helpers/ColorDataUtils'
import { generateColorWallPageUrl, generateColorDetailsPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import { compareKebabs } from '../../../shared/helpers/StringUtils'

import CircleLoader from '../../Loaders/CircleLoader/CircleLoader'
import ColorWallSwatchList from './ColorWallSwatchList'
import GenericMessage from '../../Messages/GenericMessage'
import WithConfigurationContext from '../../../contexts/ConfigurationContext/WithConfigurationContext'

import type { ColorSetPayload, ColorMap, Color, ColorGrid } from '../../../shared/types/Colors'
import type { Configuration } from '../../../shared/types/Configuration'

type Props = {
  colors: ColorSetPayload,
  brights: ColorSetPayload,
  colorMap: ColorMap,
  addToLivePalette?: Function,
  activeColor: Color,
  loading: boolean,
  intl: intlShape,
  error: boolean,
  family?: string,
  section?: string,
  families?: string[],
  config: Configuration
}

export class SherwinColorWall extends PureComponent<Props> {
  constructor (props: Props) {
    super(props)

    this.colorFamily = this.colorFamily.bind(this)
    this.buildSwatchLink = this.buildSwatchLink.bind(this)
    this.buildSwatchDetailsLink = this.buildSwatchDetailsLink.bind(this)
  }

  render () {
    return (
      <div className='color-wall-wall'>
        { this.colorFamily() }
      </div>
    )
  }

  // Making this a static method in order to share memoized results among separate instances (especially since new instances are created whenever the user zooms in/out with the same dataset)
  static getColorGrid = memoizee(function getColorGrid (colors: ColorSetPayload, brights: ColorSetPayload, targetFamily: string | void, families: string[] | void): ColorGrid | void {
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
  }, { length: 4 })

  buildSwatchDetailsLink = function buildSwatchDetailsLink (color: Color): string {
    return generateColorDetailsPageUrl(color)
  }

  buildSwatchLink = function buildSwatchLink (color: Color): string {
    return generateColorWallPageUrl(this.props.section, this.props.family, color.id, fullColorName(color.brandKey, color.colorNumber, color.name))
  }

  colorFamily = function colorFamily () {
    const { colors, brights, family, families, section, activeColor, colorMap, addToLivePalette, loading, error, intl, config } = this.props
    const colorsGrid = SherwinColorWall.getColorGrid(colors, brights, family, families)
    const translatedMessages = intl.messages

    if (loading) {
      return <CircleLoader className='color-wall-wall__loader' />
    }

    if (error) {
      return (
        <GenericMessage type={GenericMessage.TYPES.ERROR} className='color-wall-wall__message'>
          <FormattedMessage id='ERROR_LOADING_COLORS' />
        </GenericMessage>
      )
    }

    if (!colorsGrid) {
      return (
        <GenericMessage type={GenericMessage.TYPES.WARNING} className='color-wall-wall__message'>
          <FormattedMessage id='NO_COLORS_AVAILABLE' />
        </GenericMessage>
      )
    }

    return (
      <React.Fragment>
        <ColorWallSwatchList
          showAll={!activeColor}
          immediateSelectionOnActivation={!activeColor}
          activeColor={activeColor}
          section={section}
          family={family}
          bloomRadius={config.colorWall.bloomRadius} // TODO: demo purposes, maybe we want to change this
          onAddColor={addToLivePalette}
          colorMap={colorMap}
          swatchLinkGenerator={this.buildSwatchLink}
          swatchDetailsLinkGenerator={this.buildSwatchDetailsLink}
          minCellSize={activeColor ? 50 : 15}
          maxCellSize={activeColor ? 50 : 25}
          colors={colorsGrid}
          // colorGrid is being used as a key here so the whole component reinitializes when color set changes
          key={colorsGrid} />

        {activeColor && (
          <div className='color-wall-wall__btns'>
            <Link to={generateColorWallPageUrl(section, family)} className='color-wall-wall__btns__btn' title={translatedMessages.ZOOM_OUT}>
              <FontAwesomeIcon icon='search-minus' size='lg' />
              <span className='visually-hidden'><FormattedMessage id='ZOOM_OUT' /></span>
            </Link>
          </div>
        )}
      </React.Fragment>
    )
  }
}

export default injectIntl(WithConfigurationContext(SherwinColorWall))
