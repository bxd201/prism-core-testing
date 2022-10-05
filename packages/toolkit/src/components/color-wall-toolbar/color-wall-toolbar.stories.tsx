import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ColorWallToolBar from './color-wall-toolbar'

const Template = (args): JSX.Element => {
  const [activeGroup, setActiveGroup] = useState('Top 50 Colors')
  const [activeSubGroup, setActiveSubGroup] = useState(null)
  const [groupData, setGroupData] = useState(null)
  const [familyData, setFamilyData] = useState(null)
  const [currentSubGroups, setCurrentSubGroups] = useState([])

  useEffect(() => {
    void axios
      .get('https://develop-prism-api.ebus.swaws/v1/families/cscc?lng=en-US&_corev=3.3.0')
      .then((r) => r.data)
      .then((familyData) => setFamilyData(familyData))

    void axios
      .get('https://develop-prism-api.ebus.swaws//v1/groups/sherwin?lng=en-US&_corev=4.0.0')
      .then((r) => r.data)
      .then((groupData) => setGroupData(groupData))
  }, [])

  useEffect(() => {
    familyData?.forEach((family) => {
      if (activeGroup === family.name) {
        setCurrentSubGroups(family.families)
        if (family.families.length < 2) {
          setActiveSubGroup(null)
        }
      }
    })
  }, [activeGroup])

  const onGroupBtnClick = (label): void => {
    setActiveGroup(label)
  }
  const onSubGroupBtnClick = (label): void => {
    setActiveSubGroup(label)
  }
  const onShowAllBtnClick = (): void => {
    setActiveGroup('Sherwin-Williams Colors')
  }

  const toolBarProps = {
    uiStyle: 'minimal',
    onSearchBtnClick: () => console.log('onSearchBtnClick'),
    onSubGroupBtnClick: onSubGroupBtnClick,
    onGroupBtnClick: onGroupBtnClick,
    onShowAllBtnClick: onShowAllBtnClick,
    onPrimeBtnClick: () => console.log('onPrimeBtnClick'),
    onCloseBtnClick: () => console.log('onCloseBtnClick'),
    messages: {
      CLOSE: 'Close',
      SEARCH_COLOR: 'Search Color',
      VIEW_ENTIRE_COLOR_WALL: 'View entire color wall',
      CANCEL: 'cancel',
      COLOR_FAMILIES: 'families',
      SELECT_COLLECTION: 'Select Color Selections',
      ALL_COLORS: 'ALL_COLORS',
      EXPLORE_COLOR_FAMILIES: 'Explore color families',
      EXPLORE_COLLECTIONS: 'Explore collections'
    },
    toolBarData: {
      groups: groupData?.map((group) => group.name),
      activeGroup: activeGroup,
      subgroups: currentSubGroups,
      activeSubgroup: activeSubGroup,
      primeColorWall: 'Sherwin-Williams Colors'
    },
    toolBarConfig: { alwaysShowSubGroups: false, closeBtn: {}, shouldShowCloseButton: false }
  }
  if (groupData) {
    return <ColorWallToolBar {...toolBarProps} />
  }
  return <></>
}

export const SimpleToolBar = Template.bind({})
SimpleToolBar.args = {}

export default {
  title: 'ColorWallToolBar',
  component: ColorWallToolBar,
  argTypes: {}
}
