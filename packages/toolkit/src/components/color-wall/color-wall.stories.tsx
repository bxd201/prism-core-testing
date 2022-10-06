import React, { useEffect, useState } from 'react'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import ColorSwatch from '../color-swatch/color-swatch'
import ColorWallToolbar, { IColorWallToolbarProps } from '../color-wall-toolbar/color-wall-toolbar'
import ColorWall from './color-wall'

const Template = (args): JSX.Element => {
  const { withToolbar, defaultGroup } = args

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

  const swatchRenderer = (internalProps): JSX.Element => {
    const { id, onRefSwatch, active, perimeterLevel } = internalProps
    const color = colorMap[id]
    const activeBloom = 'z-[1001] scale-[2.66] sm:scale-[3] duration-200 shadow-swatch p-0'
    const perimeterBloom = {
      1: 'z-[958] scale-[2] sm:scale-[2.36] shadow-swatch duration-200',
      2: 'z-[957] scale-[2] sm:scale-[2.08] shadow-swatch duration-200',
      3: 'z-[956] scale-[1.41] sm:scale-[1.74] shadow-swatch duration-200',
      4: 'z-[955] scale-[1.30] sm:scale-[1.41] shadow-swatch duration-200'
    }
    const baseClass = 'shadow-[inset_0_0_0_1px_white] focus:outline focus:outline-[1.5px] focus:outline-primary'
    const activeClass = active ? activeBloom : ''
    const perimeterClasses: string = perimeterLevel > 0 ? perimeterBloom[perimeterLevel] : ''

    return (
      <ColorSwatch
        {...internalProps}
        key={id}
        aria-label={color?.name}
        color={color}
        className={`${baseClass} ${activeClass} ${perimeterClasses}`}
        ref={onRefSwatch}
        renderer={() => (
          <div
            className='absolute p-2'
            style={{ top: '-85%', left: '-85%', width: '270%', height: '270%', transform: 'scale(0.37)' }}
          >
            <div className='relative'>
              <p className='text-sm'>{`${color.brandKey as number} ${color.colorNumber as number}`}</p>
              <p className='font-bold'>{color.name}</p>
            </div>
            <div className='flex justify-between w-full p-2.5 absolute left-0 bottom-0'>
              <button className='flex items-center ring-primary focus:outline-none focus:ring-2'>
                <FontAwesomeIcon icon={faPlusCircle} className='mb-0.5' />
                <p className='text-xs opacity-90 ml-2'>Add to Palette</p>
              </button>
            </div>
          </div>
        )}
      />
    )
  }
  const colorWallConfig = {
    bloomEnabled: true
  }

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
            shape={activeShape}
            colorWallConfig={colorWallConfig}
            swatchRenderer={swatchRenderer}
            activeColorId={activeColorId}
            onActivateColor={(id) => setActiveColorId(id)}
            key={shapeId}
          />
        </>
      )}
    </>
  )
}

export const AllColors = Template.bind({})
AllColors.args = { withToolbar: false, defaultGroup: 'Sherwin-Williams Colors' }
export const SimpleToolbar = Template.bind({})
SimpleToolbar.args = { withToolbar: true, defaultGroup: 'Top 50 Colors' }

export default {
  title: 'Experiences/ColorWall',
  component: ColorWall,
  argTypes: { showToolBar: { control: false, description: 'show toolbar or not' } }
}
