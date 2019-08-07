// @flow
import React from 'react'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import ColorCollectionsTab from '../ColorCollections/ColorCollectionsTab'
import { getImagesCollectionsData, collectionTabs } from './data'
import '../ColorCollections/ColorCollections.scss'
import ImageScenesWithCarousel from './InspiredScene'
import cloneDeep from 'lodash/cloneDeep'

const baseClass = 'color-collections'
type ComponentProps = {
  setHeader: Function
}

type ComponentState = {
  tabId: string,
  isClickTab: boolean
}

class InspiredSceneNavigator extends React.Component<ComponentProps, ComponentState> {
  key: string
  currTab: Array<Object>
  tabMap: Object
  collectionData: Object

  constructor (props) {
    super(props)
    const { collectionData, tabMap } = getImagesCollectionsData(collectionTabs, 'tab1')
    this.collectionData = cloneDeep(collectionData)
    this.tabMap = cloneDeep(tabMap)

    this.state = {
      tabId: 'tab1',
      isClickTab: false
    }
  }
  componentDidMount () {
    const headerContent = 'Inspirational Photos'
    this.props.setHeader(headerContent)
  }

    showTab = (id: string, isClickTab: boolean) => {
      this.setState({ tabId: id, isClickTab: isClickTab })
      const orderedTabList = cloneDeep(collectionTabs)
      orderedTabList.forEach((tab, index) => {
        if (id === tab.id) {
          this.currTab = orderedTabList.slice(index).concat(orderedTabList.splice(0, index))
        }
      })
    }

    render () {
      const { tabId, isClickTab } = this.state
      if (isClickTab) {
        const { collectionData, tabMap } = getImagesCollectionsData(this.currTab, tabId)
        this.collectionData = cloneDeep(collectionData)
        this.tabMap = cloneDeep(tabMap)
        /* this key will be equal to timestamp which create new instance for child component
           so when user switch between each tab it will create fresh instance that avoid
           currPointer conflicts
        */
        this.key = tabId + Date.now().toString()
      }
      return (
        <div className={`${baseClass}__wrapper`}>
          <ColorCollectionsTab collectionTabs={collectionTabs} showTab={this.showTab} tabIdShow={tabId} />
          <div className={`${baseClass}__collections-list`}>
            <ImageScenesWithCarousel key={this.key} data={this.collectionData} tabMap={this.tabMap} showTab={this.showTab} isInfinity defaultItemsPerView={1} />
          </div>
        </div>
      )
    }
}

export default CollectionsHeaderWrapper(InspiredSceneNavigator)
