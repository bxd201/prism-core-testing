import React, { useEffect, useState } from 'react'
// import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import ColorSwatch from '../color-swatch/color-swatch'
import ColorWallToolbar, { IColorWallToolbarProps } from '../color-wall-toolbar/color-wall-toolbar'
import ColorWall from './color-wall'

const Template = (args): JSX.Element => {
  const { withToolbar, defaultGroup, animateActivation, bloom, disabledColors } = args
  const [activeColorId, setActiveColorId] = useState(null)
  const [familyData, setFamilyData] = useState(null)
  const [shapeData, setShapeData] = useState(null)
  const [groupData, setGroupData] = useState(null)
  const [subGroupData, setSubGroupData] = useState(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sherwinColors, setSherwinColors] = useState(null)
  const [activeGroup, setActiveGroup] = useState(defaultGroup)
  const [activeSubGroup, setActiveSubGroup] = useState(null)
  const [activeShape, setActiveShape] = useState(null)
  const [currentSubGroups, setCurrentSubGroups] = useState([])
  const [shapeId, setShapeId] = useState(0)
  const colorMap = colors.reduce((map, c) => {
    map[c.id] = c
    return map
  }, {})

  const onGroupBtnClick = (label): void => {
    setActiveGroup(label)
  }
  const onSubGroupBtnClick = (label): void => {
    setActiveSubGroup(label)
    setActiveGroup(null)
  }
  const onShowAllBtnClick = (): void => {
    setActiveSubGroup(null)
    setActiveGroup('Sherwin-Williams Colors')
  }

  const toolBarProps: IColorWallToolbarProps = {
    uiStyle: 'minimal',
    onSearchBtnClick: () => null,
    onSubGroupBtnClick: onSubGroupBtnClick,
    onGroupBtnClick: onGroupBtnClick,
    onShowAllBtnClick: onShowAllBtnClick,
    onPrimeBtnClick: () => null,
    onCloseBtnClick: () => null,
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
  const endPoints = [
    'https://api.sherwin-williams.com/prism/v1/colors/sherwin',
    'https://api.sherwin-williams.com/prism/v1/shapes/cscc',
    'https://api.sherwin-williams.com/prism/v1/groups/cscc',
    'https://api.sherwin-williams.com/prism/v1/families/cscc',
    'https://develop-prism-api.ebus.swaws/v1/subgroups/cscc'
  ]
  useEffect(() => {
    // eslint-disable-next-line
    void axios.all(endPoints.map((endpoint) => axios.get(endpoint))).then((data) => {
      setSherwinColors(data[0].data)
      setShapeData(data[1].data)
      setGroupData(data[2].data)
      setFamilyData(data[3].data)
      setSubGroupData(data[4].data)
    })
  }, [])

  useEffect(() => {
    if (familyData) {
      familyData.forEach((family) => {
        if (activeGroup === family.name) {
          setCurrentSubGroups(family.families)
          if (family.families.length < 2) {
            setActiveSubGroup(null)
          }
        }
      })
    }
    let currentId
    groupData?.forEach((group) => {
      if (activeGroup === group.name) {
        currentId = group.shapeId
        setShapeId(currentId)
      }
    })
    shapeData?.forEach((shape) => {
      if (currentId === shape.id) {
        setActiveShape(shape.shape)
      }
    })
  }, [activeGroup, groupData, shapeData])

  useEffect(() => {
    let currentId

    // eslint-disable-next-line no-unused-expressions
    subGroupData?.forEach((subgroup) => {
      if (subgroup.name?.toUpperCase() === activeSubGroup?.toUpperCase()) {
        currentId = subgroup.id
        setShapeId(currentId)
      }
    })
    // eslint-disable-next-line no-unused-expressions
    shapeData?.forEach((shape) => {
      if (currentId === shape.id) {
        setActiveShape(shape.shape)
      }
    })
  }, [activeSubGroup, activeGroup, subGroupData])
  return (
    <>
      {activeShape && (
        <>
          {withToolbar && <ColorWallToolbar {...toolBarProps} />}
          <ColorWall
            colorResolver={(id) => colorMap[id]}
            shape={activeShape}
            swatchBgRenderer={(props) =>
              ColorWall.DefaultSwatchBackgroundRenderer({
                ...props,
                overlayRenderer: ({ color, id }) =>
                  // manually add a flag to the background to indicate... whatever you want!
                  disabledColors.includes(color?.colorNumber?.toString()) ? <ColorSwatch.Dogear /> : null
              })
            }
            colorWallConfig={{
              bloomEnabled: !!bloom,
              animateActivation: animateActivation
            }}
            activeSwatchContentRenderer={(props) => {
              const { color } = props

              return (
                <>
                  <ColorSwatch.Title number={`${color.brandKey} ${color.colorNumber}`} name={color.name} />

                  <div className={'mt-auto'}>
                    {/* host-side logic to dynamically display status message based on availabilty */}
                    {disabledColors.includes(color?.colorNumber?.toString()) ? (
                      <ColorSwatch.Message>This color is not available.</ColorSwatch.Message>
                    ) : (
                      <button>View details</button>
                    )}
                  </div>
                </>
              )
            }}
            activeColorId={activeColorId}
            onActivateColor={(id) => {
              setActiveColorId(id)
            }}
            key={shapeId}
          />
        </>
      )}
    </>
  )
}

export const AllColors = Template.bind({})
AllColors.args = {
  bloom: true,
  animateActivation: true,
  withToolbar: false,
  defaultGroup: 'Sherwin-Williams Colors',
  disabledColors: ['6866', '6868', '6871']
}
export const SimpleToolbar = Template.bind({})
SimpleToolbar.args = { withToolbar: true, defaultGroup: 'Top 50 Colors' }

export default {
  title: 'Experiences/ColorWall',
  component: ColorWall,
  argTypes: {
    showToolBar: { control: false, description: 'show toolbar or not' }
  }
}
