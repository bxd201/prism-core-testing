import React from 'react'
import uniqueId from 'lodash/uniqueId'
import isArray from 'lodash/isArray'
import { VariableSizeGrid } from 'react-window'
import { TYPES } from './constants'

const once = (f) => f

class Base {
  constructor (children = [], label = null) {
    this.label = label
    this.children = children
    this._multiplier = 1
    this._width = 1
    this._height = 1
    this._padAmt = 0
    this._className = 'cw2'
  }

  set multiplier (val = 1) {
    if (isNaN(val)) {
      debugger // eslint-disable-line
    }

    this._multiplier = val

    this.children.forEach(c => {
      if (isArray(c)) {
        c.forEach(cc => { cc.multiplier = val })
      } else {
        c.multiplier = val
      }
    })

    this.remeasure()
  }

  get multiplier () {
    return this._multiplier
  }

  get height () {
    return this._height
  }

  get width () {
    return this._width
  }

  deepRemeasure = () => {
    this.children.forEach(c => c.deepRemeasure())
    this.remeasure()
  }

  render = ({ style = {}, ...props } = {}) => {
    return <div>Base</div>
  }
}

// cols and rows basically work like CSS grid systems -- they define boundaries, groupings, and spacing around elements
// col children can be rows or chunks
class Col extends Base {
  constructor (children = [], label = null, pad, swatchPropsRef) {
    super(children, label)
    this.type = TYPES.COL
    this.id = uniqueId('col')
    this._swatchPropsRef = swatchPropsRef
    this._className = 'cw2__col'
    this._needGrid = children.length > 1
    this._needsPad = !!pad
    this._padAmt = 0
    this.remeasure()

    this.children.forEach(child => {
      child.multiplier = Math.max(1, this._innerWidth / child.width)
    })

    this.remeasure()
  }

  remeasure = () => {
    // TODO: _width and _height are going to have to take ACTUAL width and height into account
    // this means swatches are going to have to report their width/height based on BASE_SWATCH_SIZE
    // (or whatever eventual sizing context we use)
    this._innerWidth = this.children.map(child => child.width).reduce((accum, next) => Math.max(accum, next), 0)
    this._innerHeight = this.children.map(child => child.height).reduce((accum, next) => accum + next, 0)
    this._padAmt = (this._needsPad ? this._swatchPropsRef.current.spacing : 0)
    this._width = this._innerWidth + this._padAmt
    this._height = this._innerHeight
  }

  set multiplier (val = 1) {
    // COL
    super.multiplier = val
  }

  render = once(({ style = {}, ...props } = {}) => {
    if (this._needGrid) {
      // cell dimensions
      const gridProps = {
        columnWidth: i => this._innerWidth,
        rowHeight: i => this.children[i].height,
        columnCount: 1,
        rowCount: this.children.length
      }

      return <div
        className={this._className}
        data-type={this.type}
        data-id={this.id}
        data-container-id='|COL| render container GRID'
        style={{ ...style, width: `${this._width}px`, height: `${this._height}px`, padding: `0 ${this._padAmt / 2}px`, overflow: 'hidden' }}
        {...props}
      >
        <VariableSizeGrid {...gridProps} height={this._innerHeight} width={this._innerWidth} style={{ overflow: 'hidden', fontFamily: '|COL| variable grid' }}>
          {({ columnIndex, rowIndex, style }) => {
            return (
              <div style={{ ...style, overflow: 'hidden' }} data-descriptor='nested |COL| div'>
                {this.children[rowIndex].render()}
              </div>
            )
          }}
        </VariableSizeGrid>
      </div>
    } else {
      return <div
        className={this._className}
        data-type={this.type}
        data-id={this.id}
        data-container-id='|COL| render container _NO_ GRID'
        style={{ ...style, width: '100%', height: '100%', overflow: 'hidden', padding: `0 ${this._padAmt / 2}px` }}
        {...props}
      >
        {this.children[0].render()}
      </div>
    }
  })
}

// row children can be cols or chunks
class Row extends Base {
  constructor (children = [], label = null, pad, swatchPropsRef) {
    super(children, label)
    this.type = TYPES.ROW
    this.id = uniqueId('row')
    this._swatchPropsRef = swatchPropsRef
    this._className = 'cw2__row'
    this._needGrid = children.length > 1
    this._needsPad = !!pad
    this.remeasure()

    this.children.forEach(child => {
      child.multiplier = Math.max(1, this._innerHeight / child.height)
    })

    this.remeasure()
  }

  set multiplier (val = 1) {
    // ROW
    super.multiplier = val
  }

  remeasure = () => {
    this._innerWidth = this.children.map(child => child.width).reduce((accum, next) => accum + next)
    this._innerHeight = this.children.map(child => child.height).reduce((accum, next) => Math.max(accum, next), 0)
    this._padAmt = this._needsPad ? this._swatchPropsRef.current.spacing : 0
    this._width = this._innerWidth
    this._height = this._innerHeight + this._padAmt
  }

  render = once(({ style = {}, ...props } = {}) => {
    if (this._needGrid) {
      const gridProps = {
        columnWidth: i => this.children[i].width,
        rowHeight: i => this._height,
        columnCount: this.children.length,
        rowCount: 1
      }

      return <div
        className={this._className}
        data-type={this.type}
        data-id={this.id}
        data-container-id='=ROW= render container'
        style={{ ...style, width: `${this._width}px`, height: `${this._height}px`, padding: `${this._padAmt / 2}px 0`, overflow: 'hidden' }}
        {...props}
      >
        <VariableSizeGrid {...gridProps} height={this._innerHeight} width={this._innerWidth} style={{ overflow: 'hidden', fontFamily: '=ROW= variable grid' }}>
          {({ columnIndex, rowIndex, style }) => {
            return (
              // this one gets the width measurement correct
              <div style={{ ...style, overflow: 'hidden' }} data-descriptor='nested =ROW= div'>
                {this.children[columnIndex].render()}
              </div>
            )
          }}
        </VariableSizeGrid>
      </div>
    } else {
      return <div
        className={this._className}
        data-type={this.type}
        data-id={this.id}
        data-container-id='=ROW= render container'
        style={{ ...style, width: '100%', height: '100%', overflow: 'hidden', padding: `${this._padAmt / 2}px 0` }}
        {...props}
      >
        {this.children[0].render()}
      </div>
    }
  })
}

// for all intents and purposes, a Wall is a Column with a unique type
// it ONLY accepts rows; chunks are not valid wall children
class Wall extends Col {
  constructor (rows = [], swatchPropsRef) {
    super(rows, null, true, swatchPropsRef)
    this._swatchPropsRef = swatchPropsRef
    this.type = TYPES.WALL
    this.id = uniqueId('w')
    this._className = 'cw2__wall'
  }

  render = once(({ style = {}, width, height, maxWidth = Infinity, maxHeight = Infinity, ...props } = {}) => {
    if (maxWidth < Infinity || maxHeight < Infinity) {
      const newMult = Math.min(maxWidth / this._width, maxHeight / this._height)

      if (newMult !== 1) {
        this._swatchPropsRef.current = {
          size: this._swatchPropsRef.current.size * newMult,
          spacing: this._swatchPropsRef.current.spacing * newMult
        }

        this.deepRemeasure()
      }
    }

    const gridProps = {
      columnWidth: i => this.children[i].width,
      rowHeight: i => this.children[i].height,
      columnCount: 1,
      rowCount: this.children.length
    }

    return <VariableSizeGrid {...gridProps}
      height={height ?? this.height}
      width={width ?? this.width}
      className={this._className}
      data-type={this.type}
      style={{ ...style }}
      {...props}>
      {({ columnIndex, rowIndex, style }) => {
        return (
          <div style={style}>
            {this.children[rowIndex].render()}
          </div>
        )
      }}
    </VariableSizeGrid>
  })
}

// inherently chunks have NO outer spacing
// chunk always has 2D array as children
// a chunk is a column of rows, each row is a Swatch[]
// a chunk is basically a single-column array of Swatch rows
class Chunk extends Base {
  constructor (children = [[]], label = null, onClick) {
    super(children, label)

    if (!isArray(children) || children.length === 0 || !isArray(children[0]) || children[0].length === 0) {
      throw new Error('Chunk children not multidimensional array.')
    }

    this.type = TYPES.CHUNK
    this.id = uniqueId('cnk')
    this._onClick = onClick
    this._className = `cw2__chunk ${this._onClick ? 'cw2__chunk--clickable' : ''}`
    this._rows = children.length
    this._cols = children.map(c => c.length).reduce((accum, next) => Math.max(accum, next), 0)
    this.remeasure()
  }

  remeasure = () => {
    this._width = this.children.map(c => {
      return c.reduce((accum, next) => accum + next.width, 0)
    }).reduce((accum, next) => Math.max(accum, next), 0)

    this._height = this.children.map(c => {
      return c.reduce((accum, next) => Math.max(accum, next.height), 0)
    }).reduce((accum, next) => accum + next, 0)
  }

  deepRemeasure = () => {
    this.remeasure()
  }

  render = once(({ style = {}, ...props } = {}) => {
    return <div
      role={this._onClick ? 'button' : null}
      onClick={this._onClick}
      className={this._className}
      data-type={this.type}
      data-id={this.id}
      data-container-id='chunk render container'
      style={{ ...style, width: '100%', height: '100%' }}
      {...props}
    >
      {this.children.map((c, i) => {
        return <div key={i} className={'cw2__chunk__row'}>
          {c.map((cc, ii) => {
            return cc.render({ key: ii })
          })}
        </div>
      })}

    </div>
  })
}

class Swatch {
  constructor (referenceSwatch, color, swatchPropsRef) {
    this.type = TYPES.SWATCH
    this.id = uniqueId('s')
    this._swatchPropsRef = swatchPropsRef
    this._multiplier = 1
    this._className = 'cw2__swatch'
    this._reference = referenceSwatch
    this._color = color
  }

  set multiplier (val = 1) {
    if (val === 1) return

    if (this._reference) return // Swatches with references

    this._multiplier = this._multiplier * val
  }

  get multiplier () {
    return this._reference ? this._reference.multiplier : this._multiplier
  }

  get width () {
    return this._reference ? this._reference.width : this._swatchPropsRef.current.size * this.multiplier
  }

  get height () {
    return this._reference ? this._reference.height : this._swatchPropsRef.current.size * this.multiplier
  }

  render = ({ children = null, style = {}, ...props } = {}) => {
    return <div className={this._className} data-id={this.id} style={{ ...style, width: this.width, height: this.height }} {...props}>
      {this._color
        ? <>
        <div
          className={`${this._className}__inner`}
          style={{ background: this._color.hex }}
        />
      </>
        : null}
    </div>
  }
}

export {
  Base,
  Chunk,
  Col,
  Row,
  Swatch,
  Wall
}
