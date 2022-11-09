import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Family, Group } from '../color-wall/types'
import ColorWallToolBar, { IColorWallToolbarProps } from './color-wall-toolbar'

interface Props {
  uiStyle: 'minimal' | null
}

const Template = ({ uiStyle }: Props): JSX.Element => {
  const [activeGroup, setActiveGroup] = useState('TOP 50 COLORS')
  const [activeSubGroup, setActiveSubGroup] = useState(null)
  // @todo Make more specific types instead of Records
  const [groupData, setGroupData] = useState<Group[]>(null)
  const [familyData, setFamilyData] = useState<Family[]>(null)
  const [currentSubGroups, setCurrentSubGroups] = useState<string[]>([])

  const endPoints = [
    'https://api.sherwin-williams.com/prism/v1/groups/cscc',
    'https://api.sherwin-williams.com/prism/v1/families/cscc'
  ]
  useEffect(() => {
    // eslint-disable-next-line
    void axios.all(endPoints.map((endpoint) => axios.get(endpoint))).then((data) => {
      setGroupData(data[0].data)
      setFamilyData(data[1].data)
    })
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

  const onGroupBtnClick = (label: string): void => {
    setActiveGroup(label)
  }
  const onSubGroupBtnClick = (label: string): void => {
    setActiveSubGroup(label)
  }
  const onShowAllBtnClick = (): void => {
    setActiveGroup('Sherwin-Williams Colors')
  }
  const onPrimeButtonClick = (): void => {
    setActiveGroup('Sherwin-Williams Colors')
  }

  const toolBarProps: IColorWallToolbarProps = {
    uiStyle,
    onSearchBtnClick: () => null,
    onSubGroupBtnClick: onSubGroupBtnClick,
    onGroupBtnClick: onGroupBtnClick,
    onShowAllBtnClick: onShowAllBtnClick,
    onPrimeBtnClick: onPrimeButtonClick,
    onCloseBtnClick: () => null,
    messages: {
      CLOSE: 'Close',
      SEARCH_COLOR: 'Search Color',
      VIEW_ENTIRE_COLOR_WALL: 'View entire color wall',
      CANCEL: 'cancel',
      COLOR_FAMILIES: 'COLOR FAMILIES',
      SELECT_COLLECTION: 'SELECT COLOR SELECTIONS',
      ALL_COLORS: 'ALL COLORS',
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
SimpleToolBar.args = { uiStyle: 'minimal' }

export const AdvancedToolBar = Template.bind({})
AdvancedToolBar.args = { uiStyle: null }

export default {
  title: 'Components/ColorWallToolBar',
  component: ColorWallToolBar,
  argTypes: {}
}
