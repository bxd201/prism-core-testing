import React from 'react'
import { AutoSizer, Grid, GridCellProps } from 'react-virtualized'
import { Color, SwatchRenderer } from '../../types'
import ColorSwatch from '../color-swatch/color-swatch'

const EDGE_SIZE = 15

export interface SearchResultsProps {
  contain?: boolean
  results?: Color[]
  colorWallBgColor?: string
  children?: React.ReactNode
  swatchRenderer?: SwatchRenderer
}

const SearchResults = ({
  contain = false,
  results,
  children,
  colorWallBgColor,
  swatchRenderer: SwatchRenderer
}: SearchResultsProps): JSX.Element => {
  const cellRenderer = ({
    columnIndex,
    isScrolling,
    isVisible,
    key,
    parent,
    rowIndex,
    style
  }: GridCellProps): React.ReactNode => {
    const colorResult = results && results[columnIndex + rowIndex * parent.props.columnCount]
    if (!colorResult) return

    if (SwatchRenderer) {
      return <SwatchRenderer color={colorResult} style={style} />
    }

    return <ColorSwatch color={colorResult} style={{ ...style, border: `1px solid white` }} active />
  }

  const resultsGrid = (
    <div className={``}>
      <AutoSizer disableHeight={!contain}>
        {({ height = 0, width }) => {
          const gridWidth = width
          const columnCount = Math.max(1, Math.round(gridWidth / 185))
          const newSize = gridWidth / columnCount
          const rowHeight = newSize
          const rowCount = Math.ceil(results?.length / columnCount)
          const gridHeight = contain ? height : Math.max(height, rowCount * newSize + EDGE_SIZE * 2)

          return (
            <Grid
              containerStyle={{
                marginBottom: `${EDGE_SIZE}px`,
                marginTop: `${EDGE_SIZE}px`
              }}
              cellRenderer={cellRenderer}
              columnWidth={newSize}
              columnCount={columnCount}
              height={gridHeight}
              rowHeight={rowHeight}
              rowCount={rowCount}
              width={width}
            />
          )
        }}
      </AutoSizer>
    </div>
  )

  const wrapperClasses = results?.length > 0 ? '' : `flex justify-center content-center`

  return (
    <div className={``}>
      <div className={wrapperClasses} style={{ backgroundColor: colorWallBgColor }}>
        {results?.length > 0 ? resultsGrid : children}
      </div>
    </div>
  )
}

export default React.memo(SearchResults)
