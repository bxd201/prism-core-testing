/* eslint-disable */
// @flow
import React, { useContext, useEffect, useRef, useState, useMemo } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { CSSTransition } from 'react-transition-group'
import { Grid, AutoSizer } from 'react-virtualized'
import { filterBySection, filterByFamily } from 'src/store/actions/loadColors'
import { type ColorsState, type GridRefState } from 'src/shared/types/Actions.js.flow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ColorWallContext, { type ColorWallContextProps } from './ColorWallContext'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import {
  getLevelMap,
  getScrollStep,
  getCoords,
  getLongestArrayIn2dArray,
  getWidthOfWidestChunkRowInChunkGrid,
  makeChunkGrid,
  computeFinalScrollPosition,
  getHeightOfChunkRow,
  rowHasLabels,
  calculateLabelHeight,
  calculateLabelMarginBottom,
  getTotalGridWidth,
  getTotalGridHeight
} from './ColorWallUtils'
import ColorSwatch from './ColorSwatch/ColorSwatch'
import ColorChipLocator from './ColorChipLocator/ColorChipLocator'
import { compareKebabs } from 'src/shared/helpers/StringUtils'
import clamp from 'lodash/clamp'
import flatten from 'lodash/flatten'
import isEmpty from 'lodash/isEmpty'
import kebabCase from 'lodash/kebabCase'
import noop from 'lodash/noop'
import range from 'lodash/range'
import rangeRight from 'lodash/rangeRight'
import take from 'lodash/take'
import { generateColorWallPageUrl, fullColorName } from 'src/shared/helpers/ColorUtils'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import 'src/scss/convenience/overflow-ellipsis.scss'
import './ColorWall.scss'
// polyfill to make focus-within css class work in IE
import 'focus-within-polyfill'
import minimapDict from './minimap-dict'
import hgsw from './ColorWallV3/dataHgsw'
import ColorWallV3 from './ColorWallV3/index'
const WALL_HEIGHT = 475
type ColorWallProps = {
  section?: string,
  family?: string,
  colorId?: string
}

const ColorWall = ({ section: sectionOverride, family: familyOverride, colorId: colorIdOverride }: ColorWallProps) => {
  return (
    <div>
      <ColorWallV3 />
    </div>
  )
}

// const ColorWall = ({ section: sectionOverride, family: familyOverride, colorId: colorIdOverride }: ColorWallProps) => {
//   return (
//     <CSSTransition in={isZoomedIn} timeout={200}>
//       <article style={{ width: '100%' }}>
//         <AutoSizer style={{ width: '100%' }} onResize={dims => setW(dims.width)}>{noop}</AutoSizer>
//         {w > 0 ? <VariableSizeGrid {...gridProps}
//           height={height ?? this.height}
//           width={width ?? this.width}
//           className={this._className}
//           data-type={this.type}
//           style={{ ...style }}
//           {...props}>
//           {({ columnIndex, rowIndex, style }) => {
//             return (
//               <div style={style}>
//                 {this.children[rowIndex].render()}
//               </div>
//             )
//           }}
//         </VariableSizeGrid> : null}
//       </article>
//     </CSSTransition>
//   )
// }

export default ColorWall
