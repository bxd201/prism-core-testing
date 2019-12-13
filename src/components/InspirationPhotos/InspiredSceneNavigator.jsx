// @flow
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import ColorCollectionsTab from '../Shared/ColorCollectionsTab'
import ImageScenesWithCarousel from './InspiredScene'
import React from 'react'

import { connect } from 'react-redux'
import { loadInspirationalPhotos as loadData } from '../../store/actions/inspirationalPhotos'

import '../ColorCollections/ColorCollections.scss'

const baseClass = 'color-collections'
type ComponentProps = {
  collectionTabs: Array,
  flatData: Array,
  loadData: Function,
  setHeader: Function,
  tabMap: Object
}

type ComponentState = {
  tabId: string
}

export class InspiredSceneNavigator extends React.Component<ComponentProps, ComponentState> {
  constructor (props) {
    super(props)

    this.state = {
      tabId: 'tab0',
      key: 'tab0' + Date.now().toString()
    }
  }

  componentDidMount () {
    this.props.loadData()
    const headerContent = 'Inspirational Photos'
    this.props.setHeader(headerContent)
  }

  showTab = (id: string) => {
    this.setState({
      tabId: id,
      rotatedFlatData: this.rotateArray(
        this.props.flatData,
        Object.values(this.props.tabMap).indexOf(id)
      )
    })
  }

  rotateArray = (arr, index) => {
    return arr.slice(index).concat(arr.slice(0, index))
  }

  render () {
    return (
      <div className={`${baseClass}__wrapper`}>
        <ColorCollectionsTab
          collectionTabs={this.props.collectionTabs}
          showTab={this.showTab}
          tabIdShow={this.state.tabId}
        />
        <div className={`${baseClass}__collections-list`}>
          <ImageScenesWithCarousel
            data={this.state.rotatedFlatData || this.props.flatData}
            defaultItemsPerView={1}
            isInfinity
            showTab={this.showTab}
            tabMap={this.props.tabMap}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const // eslint-disable-line one-var
    { inspirationalPhotos = { data: [] } } = state,
    tabMap = [],
    collectionTabs = [],
    flatData = inspirationalPhotos.data.flatMap(
      (scene, i) => (
        // update collectionTabs
        collectionTabs.push({ id: `tab${i}`, tabName: scene.name }), // eslint-disable-line no-sequences
        // update tabMaps
        tabMap.push(Array(scene.sceneDefinition.length).fill(`tab${i}`)),
        // create flatData
        scene.sceneDefinition.map((def, x) => ({
          img: def.photoUrl,
          id: `tab${i}-${x}`,
          initPins: def.initPins
        }))
      )
    )

  return {
    collectionTabs,
    flatData,
    tabMap: tabMap
      .flat()
      .reduce((acc, cur, i) => (acc[i] = cur, acc), {}) // eslint-disable-line no-return-assign, no-sequences
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadData () { dispatch(loadData()) }
  }
}

export default CollectionsHeaderWrapper(connect(
  mapStateToProps,
  mapDispatchToProps
)(InspiredSceneNavigator))
