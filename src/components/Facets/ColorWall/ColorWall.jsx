// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { injectIntl, type intlShape } from 'react-intl'
import { Link, NavLink } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { loadColors } from '../../../actions/loadColors'
import { add } from '../../../actions/live-palette'
import { generateColorWallPageUrl } from '../../../shared/helpers/ColorUtils'
import type { ColorSetPayload, ColorMap, Color } from '../../../shared/types/Colors'

import { MODE_CLASS_NAMES } from './shared'
// import StandardColorWall from './StandardColorWall'
import SherwinColorWall from './SherwinColorWall'

import './ColorWall.scss'

type StateProps = {
  colors: ColorSetPayload,
  colorMap: ColorMap,
  brights: ColorSetPayload,
  colorWallActive: Color,
  family: string,
  families?: string[],
  loading: boolean,
  section: string,
  sections?: string[]
}

type DispatchProps = {
  loadColors: Function,
  addToLivePalette: Function
}

type ComponentProps = {
  intl: intlShape
}

type Props = StateProps & DispatchProps & ComponentProps

type State = {
  showColorFamilies: boolean
}

class ColorWall extends PureComponent<Props, State> {
  state: State = {
    showColorFamilies: false
  }

  constructor (props: Props) {
    super(props)

    this.toggleViewFamilies = this.toggleViewFamilies.bind(this)
  }

  componentDidMount () {
    // pass in the selected language to the loadColors method so we can set the
    // lng parameter in the colors request
    const options = {
      language: this.props.intl.locale
    }

    // try to load colors with options; this will do nothing if colors are currently or already have been loaded
    this.props.loadColors(options)
  }

  render () {
    const { showColorFamilies } = this.state
    const { colors, family, sections, families, section, brights, colorMap, colorWallActive, loading, addToLivePalette } = this.props

    const hasSections = !!(sections && sections.length)
    const _showColorFamilies = family || showColorFamilies
    let sectionButtons = void (0)
    let familyButtons = void (0)

    if (loading) {
      return <p>Loading...</p>
    }

    if (!_showColorFamilies && hasSections) {
      sectionButtons = (
        <div className={MODE_CLASS_NAMES.GROUP}>
          <button className={MODE_CLASS_NAMES.BUTTON} disabled={!families || families.length <= 1} onClick={this.toggleViewFamilies}>
            <FontAwesomeIcon className={MODE_CLASS_NAMES.LG} icon={['fa', 'palette']} pull='left' />
            <span className={MODE_CLASS_NAMES.DESC}>Color Families</span>
          </button>
          <ul className={MODE_CLASS_NAMES.OPTIONS}>
            { // $FlowIgnore -- flow doesn't realize that sections must be defined at this point
              sections.map((sectionName: string, i: number) => (
                <li className={MODE_CLASS_NAMES.OPTION} key={sectionName}>
                  <NavLink className={MODE_CLASS_NAMES.OPTION_BUTTON} activeClassName={MODE_CLASS_NAMES.OPTION_BUTTON_ACTIVE} to={generateColorWallPageUrl(sectionName)}>
                    <span className={MODE_CLASS_NAMES.DESC}>{sectionName}</span>
                  </NavLink>
                </li>
              ))
            }
          </ul>
        </div>
      )
    }

    if (_showColorFamilies && families && families.length > 1) {
      familyButtons = (
        <div className={MODE_CLASS_NAMES.GROUP}>
          <FontAwesomeIcon className={MODE_CLASS_NAMES.LG} icon={['fa', 'palette']} pull='left' size='lg' />

          <ul className={MODE_CLASS_NAMES.OPTIONS}>
            {families.map((thisFamily: string) => {
              return (
                <li className={MODE_CLASS_NAMES.OPTION} key={thisFamily}>
                  <NavLink className={MODE_CLASS_NAMES.OPTION_BUTTON} activeClassName={MODE_CLASS_NAMES.OPTION_BUTTON_ACTIVE} to={generateColorWallPageUrl(section, thisFamily)}>
                    <span className={MODE_CLASS_NAMES.DESC}>{thisFamily}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>

          {hasSections ? (
            <Link className={MODE_CLASS_NAMES.BUTTON} to={generateColorWallPageUrl(section)} onClick={() => this.toggleViewFamilies(false)}>
              <span className={MODE_CLASS_NAMES.DESC}>Cancel</span>
            </Link>
          ) : null}
        </div>
      )
    }

    // not sure if this is a great way to test if this is a sherwin colorset, but non-sw colors should come in as a flat array
    // but, sherwin colors will come in broken out by color families. If so, we'll just return the sherwin color family component
    // for now until we determine a better solution for handling that.
    // const isSherwinColorWall = isPlainObject(colors)
    return (
      <div>
        <div className={MODE_CLASS_NAMES.BASE}>
          {sectionButtons}
          {familyButtons}
        </div>
        <div className='sw-colorwall'>
          <SherwinColorWall
            family={family}
            families={families}
            // sections={sections}
            section={section}
            colors={colors}
            brights={brights}
            colorMap={colorMap}
            activeColor={colorWallActive}
            addToLivePalette={addToLivePalette}
          />
        </div>
      </div>
    )

    // TODO: Add standard (non-chunked) color functionality back into ColorWall
    // return (
    //   <div className='standard-colorwall'>
    //     <StandardColorWall family={'all'} colors={colors} />
    //   </div>
    // )
  }

  toggleViewFamilies = function toggleViewFamilies (setTo?: boolean) {
    const { showColorFamilies } = this.state
    const newValue: boolean = (typeof setTo === 'boolean' ? setTo : !showColorFamilies)

    this.setState({
      showColorFamilies: newValue
    })
  }
}

const mapStateToProps = (state, props) => {
  return {
    colorMap: state.colors.items.colorMap,
    colors: state.colors.items.colors,
    brights: state.colors.items.brights,
    colorWallActive: state.colors.colorWallActive,
    families: state.colors.family.families,
    family: state.colors.family.family,
    sections: state.colors.family.sections,
    section: state.colors.family.section,
    // defaultFamily: state.colors.defaultFamily,
    loading: state.colors.status.loading
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadColors: (options: any) => {
      dispatch(loadColors(options))
    },
    addToLivePalette: (color: Color) => {
      dispatch(add(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ColorWall))
