// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { injectIntl, type intlShape, FormattedMessage } from 'react-intl'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { loadColors } from '../../../store/actions/loadColors'
import { add } from '../../../store/actions/live-palette'
import { toggleSearchMode } from '../../../store/actions/loadSearchResults'
import { generateColorWallPageUrl } from '../../../shared/helpers/ColorUtils'
import { urlWorker } from '../../../shared/helpers/URLUtils'
import { withRouter, type RouterHistory } from 'react-router-dom'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

import { varValues } from 'variables'

import type { CategorizedColorGrid, ColorMap, Color } from '../../../shared/types/Colors'
import type { Configuration } from '../../../shared/types/Configuration'

import { MODE_CLASS_NAMES } from './shared'
import WithConfigurationContext from '../../../contexts/ConfigurationContext/WithConfigurationContext'
import StandardColorWall from './StandardColorWall'
import SherwinColorWall from './SherwinColorWall'
import GenericMessage from '../../Messages/GenericMessage'
import CircleLoader from '../../Loaders/CircleLoader/CircleLoader'
import Search from '../../Search/Search'
import ButtonBar from '../../GeneralButtons/ButtonBar/ButtonBar'
import './ColorWall.scss'

type StateProps = {
  colors?: CategorizedColorGrid,
  colorMap: ColorMap,
  brights?: CategorizedColorGrid,
  unorderedColors?: string[],
  colorWallActive: Color,
  family: string,
  families?: string[],
  loading?: boolean,
  error: boolean,
  section: string,
  sections?: string[],
  searchActive: boolean,
  searchLoading: boolean,
  searchQuery: string
}

type RouterProps = {
  history: RouterHistory
}

type DispatchProps = {
  loadColors: Function,
  addToLivePalette: Function,
  toggleSearch: Function
}

type ComponentProps = {
  intl: intlShape,
  config: Configuration
}

type Props = StateProps & DispatchProps & ComponentProps & RouterProps

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
    this.stopViewFamilies = this.stopViewFamilies.bind(this)
    this.toggleViewSearch = this.toggleViewSearch.bind(this)
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
    const { colors, family, sections, families, section, brights, colorMap, colorWallActive, loading, error, addToLivePalette, unorderedColors, searchActive } = this.props

    const hasSections = !!(sections && sections.length)
    const hasFamilies = !!(families && families.length > 1)
    const _showColorFamilies = hasFamilies && (family || showColorFamilies)
    const transKey = colorWallActive ? 'active' : ''
    // if we have values in colors AND we DO NOT have values in unorderedColors, consider this a categorized color wall
    const isCategorizedColorWall = (colors && Object.keys(colors).length) && (unorderedColors && unorderedColors.length)
    const isUnorderedColorWall = (!colors || !Object.keys(colors).length) && (unorderedColors && unorderedColors.length)

    let sectionButtons = void (0)
    let familyButtons = void (0)

    if (loading) {
      return <CircleLoader />
    }

    if (searchActive) {
      return <Search onCancel={this.toggleViewSearch} />
    }

    if (!_showColorFamilies && hasSections) {
      sectionButtons = (
        <div className={MODE_CLASS_NAMES.COL}>
          <div className={MODE_CLASS_NAMES.CELL}>
            <ButtonBar.Bar>
              { // $FlowIgnore -- flow doesn't realize that sections must be defined at this point
                sections.map((sectionName: string, i: number) => (
                  <ButtonBar.Button key={sectionName} to={generateColorWallPageUrl(sectionName)}>
                    <span className={MODE_CLASS_NAMES.DESC}>{sectionName}</span>
                  </ButtonBar.Button>
                ))
              }
            </ButtonBar.Bar>
          </div>
          <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
            <ButtonBar.Bar>
              <ButtonBar.Button disabled={!families || families.length <= 1} onClick={this.toggleViewFamilies}>
                <FontAwesomeIcon className='color-families-svg' icon={['fa', 'palette']} pull='left' />
                <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='COLOR_FAMILIES' /></span>
              </ButtonBar.Button>
              <ButtonBar.Button onClick={this.toggleViewSearch}>
                <FontAwesomeIcon className='color-families-svg' icon={['fa', 'search']} pull='left' />
                <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='SEARCH.SEARCH' /></span>
              </ButtonBar.Button>
            </ButtonBar.Bar>
          </div>
        </div>
      )
    }

    if (_showColorFamilies && hasFamilies) {
      familyButtons = (
        <div className={MODE_CLASS_NAMES.COL}>
          <div className={MODE_CLASS_NAMES.CELL}>
            <ButtonBar.Bar>
              { // $FlowIgnore -- Flow doesn't realize families must be defined and be iterable to get here
                families.map((thisFamily: string) => {
                  return (
                    <ButtonBar.Button key={thisFamily} to={generateColorWallPageUrl(section, thisFamily)}>
                      <span className={MODE_CLASS_NAMES.DESC}>{thisFamily}</span>
                    </ButtonBar.Button>
                  )
                })
              }
            </ButtonBar.Bar>
          </div>

          {hasSections ? (
            <div className={`${MODE_CLASS_NAMES.CELL} ${MODE_CLASS_NAMES.RIGHT}`}>
              <ButtonBar.Bar>
                <ButtonBar.Button to={generateColorWallPageUrl(section)} onClick={this.stopViewFamilies}>
                  <FontAwesomeIcon className='close-icon-svg' icon={['fa', 'times']} pull='left' />
                  <span className={MODE_CLASS_NAMES.DESC}><FormattedMessage id='CANCEL' /></span>
                </ButtonBar.Button>
              </ButtonBar.Bar>
            </div>
          ) : null}
        </div>
      )
    }

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
            {() => {
              if (isCategorizedColorWall) {
                return <SherwinColorWall
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
              } else if (isUnorderedColorWall) {
                return <StandardColorWall
                  family={family}
                  families={families}
                  section={section}
                  // $FlowIgnore -- flow doesn't realize unorderedColors IS defined at this point due to our check conditions
                  colors={unorderedColors}
                  colorMap={colorMap}
                  activeColor={colorWallActive}
                  addToLivePalette={addToLivePalette}
                  loading={loading}
                  error={error} />
              }

              return <GenericMessage type={GenericMessage.TYPES.ERROR}>
                <FormattedMessage id='NO_COLORS_AVAILABLE' />
              </GenericMessage>
            }}
          </CSSTransition>
        </TransitionGroup>
      </div>
    )
  }

  toggleViewFamilies = function toggleViewFamilies (setTo?: boolean) {
    const { showColorFamilies } = this.state
    const newValue: boolean = (typeof setTo === 'boolean' ? setTo : !showColorFamilies)

    this.setState({
      showColorFamilies: newValue
    })
  }

  stopViewFamilies = function stopViewFamilies () {
    this.toggleViewFamilies(false)
  }

  toggleViewSearch = function toggleViewSearch (setTo?: boolean) {
    const { searchActive, toggleSearch, history } = this.props
    const newSearchState = typeof setTo === 'boolean' ? setTo : !searchActive

    toggleSearch(newSearchState)

    if (!newSearchState) {
      history.push(urlWorker.remove(ROUTE_PARAMS.SEARCH, 1).from(history.location.pathname))
    }
  }

  componentDidUpdate (prevProps: Props) {
    // TODO: check configuration first to see if we're in "use URL mode" or not
    const { searchLoading: prevSearchLoading } = prevProps
    const { searchLoading, searchQuery, history } = this.props

    if (searchLoading && searchLoading !== prevSearchLoading) {
      // get current search term from URL
      const curValue = urlWorker.get(ROUTE_PARAMS.SEARCH).from(history.location.pathname)[ROUTE_PARAM_NAMES.SEARCH]
      // determine new URL with updated search term
      const newUrl = urlWorker.set(ROUTE_PARAMS.SEARCH, searchQuery).in(history.location.pathname)

      // if there's already a search term...
      if (curValue) {
        // ... replace the current URL
        history.replace(newUrl)
      } else {
        // ... otherwise push a new one
        history.push(newUrl)
      }
    }
  }
}

const mapStateToProps = (state, props) => {
  return {
    colorMap: state.colors.items.colorMap,
    colors: state.colors.items.colors,
    brights: state.colors.items.brights,
    unorderedColors: state.colors.items.unorderedColors,
    colorWallActive: state.colors.colorWallActive,
    families: state.colors.families,
    family: state.colors.family,
    sections: state.colors.sections,
    section: state.colors.section,
    loading: state.colors.status.loading,
    error: state.colors.status.error,
    // SEARCH STUFF
    searchActive: state.colors.search.active,
    searchLoading: state.colors.search.loading,
    searchQuery: state.colors.search.query
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadColors: (brandId: string, options: any) => {
      dispatch(loadColors(brandId, options))
    },
    addToLivePalette: (color: Color) => {
      dispatch(add(color))
    },
    toggleSearch: (on: boolean) => {
      dispatch(toggleSearchMode(on))
    }
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(
    WithConfigurationContext(ColorWall)
  )))
