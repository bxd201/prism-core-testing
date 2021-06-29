// @flow
export type VisualizerSectionName = 'EXPLORE_COLORS' | 'GET_INSPIRED' | 'PAINT_A_PHOTO'
export type VisualizerPageName = 'COLOR_WALL' | 'COLOR_COLLECTIONS' | 'MATCH_PHOTO' | 'PAINTED_PHOTOS' | 'EXPERT_COLOR_PICKS' | 'INSPIRATIONAL_PHOTOS' | 'OUR_PHOTOS' | 'UPLOAD_YOUR_OWN' | 'FAST_MASK'

export type VisualizerNavStructure = ({
  name: VisualizerSectionName,
  children: VisualizerPageName[]
})[]

export const DEFAULT_NAV_STRUCTURE: VisualizerNavStructure = [
  {
    name: 'EXPLORE_COLORS',
    children: [
      'COLOR_WALL',
      'COLOR_COLLECTIONS',
      'MATCH_PHOTO'
    ]
  },
  {
    name: 'GET_INSPIRED',
    children: [
      'PAINTED_PHOTOS',
      'EXPERT_COLOR_PICKS',
      'INSPIRATIONAL_PHOTOS'
    ]
  },
  {
    name: 'PAINT_A_PHOTO',
    children: [
      'OUR_PHOTOS',
      'UPLOAD_YOUR_OWN',
      'FAST_MASK'
    ]
  }
]

export type NavHierarchyItemType = {
  name: VisualizerPageName,
  allowed: Function => boolean,
  data: {
    contentAndroid?: any,
    contentiPad?: any,
    contentiPhone?: any,
    description?: any,
    img?: string,
    imgAndroid?: any,
    imgiPad?: any,
    imgiPhone?: any,
    onClick?: Function => void,
    title?: string,
    titleMobile?: any
  }
}

export type NavHierarchyType = (VisualizerNavStructure & {
  children: NavHierarchyItemType[]
})[]
