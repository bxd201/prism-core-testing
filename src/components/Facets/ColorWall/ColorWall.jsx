// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { injectIntl, type intlShape, FormattedMessage } from 'react-intl'
import { Link, NavLink } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { loadColors } from '../../../store/actions/loadColors'
import { add } from '../../../store/actions/live-palette'
import { generateColorWallPageUrl } from '../../../shared/helpers/ColorUtils'

import { varValues } from 'variables'

import type { ColorSetPayload, ColorMap, Color } from '../../../shared/types/Colors'
import type { Configuration } from '../../../shared/types/Configuration'

import { MODE_CLASS_NAMES } from './shared'

import WithConfigurationContext from '../../../contexts/ConfigurationContext/WithConfigurationContext'
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
  error: boolean,
  section: string,
  sections?: string[]
}

type DispatchProps = {
  loadColors: Function,
  addToLivePalette: Function
}

type ComponentProps = {
  intl: intlShape,
  config: Configuration
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
    this.props.loadColors(this.props.config.brandId, options)
  }

  render () {
    const { showColorFamilies } = this.state
    const { colors, family, sections, families, section, brights, colorMap, colorWallActive, loading, error, addToLivePalette } = this.props

    const hasSections = !!(sections && sections.length)
    const hasFamilies = !!(families && families.length > 1)
    const _showColorFamilies = hasFamilies && (family || showColorFamilies)
    const transKey = colorWallActive ? 'active' : ''
    let sectionButtons = void (0)
    let familyButtons = void (0)

    if (!_showColorFamilies && hasSections) {
      sectionButtons = (
        <div className={MODE_CLASS_NAMES.COL}>
          <div className={MODE_CLASS_NAMES.CELL}>
            <div className={MODE_CLASS_NAMES.OPTION_CONTAINER}>
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
          </div>
          <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
            <button className={MODE_CLASS_NAMES.BUTTON} disabled={!families || families.length <= 1} onClick={this.toggleViewFamilies}>
              <FontAwesomeIcon className='color-families-svg' icon={['fa', 'palette']} pull='left' />
              <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='COLOR_FAMILIES' /></span>
            </button>
          </div>
        </div>
      )
    }

    if (_showColorFamilies && hasFamilies) {
      familyButtons = (
        <div className={MODE_CLASS_NAMES.COL}>
          <div className={MODE_CLASS_NAMES.CELL}>
            <div className={MODE_CLASS_NAMES.OPTION_CONTAINER}>
              <ul className={MODE_CLASS_NAMES.OPTIONS}>
                { // $FlowIgnore -- Flow doesn't realize families must be defined and be iterable to get here
                  families.map((thisFamily: string) => {
                    return (
                      <li className={MODE_CLASS_NAMES.OPTION} key={thisFamily}>
                        <NavLink className={MODE_CLASS_NAMES.OPTION_BUTTON} activeClassName={MODE_CLASS_NAMES.OPTION_BUTTON_ACTIVE} to={generateColorWallPageUrl(section, thisFamily)}>
                          <span className={MODE_CLASS_NAMES.DESC}>{thisFamily}</span>
                        </NavLink>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          </div>

          {hasSections ? (
            <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
              <Link className={MODE_CLASS_NAMES.BUTTON} to={generateColorWallPageUrl(section)} onClick={() => this.toggleViewFamilies(false)}>
                <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'times']} pull='left' />
                <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='CANCEL' /></span>
              </Link>
            </div>
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
        <TransitionGroup className='sw-colorwall color-wall-zoom-transitioner'>
          <CSSTransition
            key={transKey}
            timeout={varValues.colorWall.transitionTime}
            unmountOnExit
            mountOnEnter
            classNames={transKey ? 'color-wall-zoom-transitioner__zoom-in color-wall-zoom-transitioner__zoom-in-' : 'color-wall-zoom-transitioner__zoom-out color-wall-zoom-transitioner__zoom-out-'}>
            <SherwinColorWall
              family={family}
              families={families}
              section={section}
              colors={colors}
              brights={brights}
              colorMap={colorMap}
              activeColor={colorWallActive}
              addToLivePalette={addToLivePalette}
              loading={loading}
              error={error} />
          </CSSTransition>
        </TransitionGroup>
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
    families: state.colors.families,
    family: state.colors.family,
    sections: state.colors.sections,
    section: state.colors.section,
    loading: state.colors.status.loading,
    error: state.colors.status.error
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadColors: (brandId: string, options: any) => {
      dispatch(loadColors(brandId, options))
    },
    addToLivePalette: (color: Color) => {
      dispatch(add(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(WithConfigurationContext(ColorWall)))
