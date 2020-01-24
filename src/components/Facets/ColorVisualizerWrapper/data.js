export const colorContentTitle = 'explore_all_the_ways_to_start_building_my_color_palette.'
export const inspirationContentTitle = 'find_inspiration_for_your_next_painting_project.'
export const scenesContentTitle = 'start_painting.'

export const subTitleDigitalColorWall = 'DIGITAL_COLOR_WALL'
export const subTitleColorCollections = 'COLOR_COLLECTIONS'
export const subTitleMatchAPhoto = 'MATCH_A_PHOTO'
export const subTitlePaintedPhotos = 'PAINTED_PHOTOS'
export const subTitleExperColorPicks = 'EXPERT_COLOR_PICKS'
export const subTitleInspirationalPhotos = 'INSPIRATIONAL_PHOTOS'
export const subTitleUseOurPhotos = 'USE_OUR_PHOTOS'
export const subTitleUploadYourPhoto = 'UPLOAD_YOUR_PHOTO'

export const renderingData = {
  color: {
    content: {
      title: 'NAV_DROPDOWN_TITLE.EXPLORE_COLORS',
      titleIdentifier: colorContentTitle,
      subContent: [
        {
          image: '/prism/images/color-visualizer-wrapper/color-submenu__thumbnail--explore-color.png',
          subTitle: 'NAV_LINKS.DIGITAL_COLOR_WALL',
          subTitleIdentifier: subTitleDigitalColorWall,
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.DIGITAL_COLOR_WALL',
          url: '/active/color-wall/section/sherwin-williams-colors',
          id: 0
        },
        {
          image: '/prism/images/color-visualizer-wrapper/color-submenu__thumbnail--color-collections.png',
          subTitle: 'NAV_LINKS.COLOR_COLLECTIONS',
          subTitleIdentifier: subTitleColorCollections,
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.COLOR_COLLECTIONS',
          url: '/color-collections',
          id: 1
        },
        {
          image: '/prism/images/color-visualizer-wrapper/color-submenu__thumbnail--match-photo.png',
          subTitle: 'NAV_LINKS.MATCH_A_PHOTO',
          subTitleIdentifier: subTitleMatchAPhoto,
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.MATCH_A_PHOTO',
          url: '/match-photo',
          id: 2
        }
      ]
    }
  },
  inspiration: {
    content: {
      title: 'NAV_DROPDOWN_TITLE.GET_INSPIRED',
      titleIdentifier: inspirationContentTitle,
      subContent: [
        {
          image: '/prism/images/color-visualizer-wrapper/inspiration-submenu__thumbnail--painted-scenes.png',
          subTitle: 'NAV_LINKS.PAINTED_PHOTOS',
          subTitleIdentifier: subTitlePaintedPhotos,
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.PAINTED_PHOTOS',
          url: '/color-from-image',
          id: 0
        },
        {
          image: '/prism/images/color-visualizer-wrapper/inspiration-submenu__thumbnail--expert-color-picks.png',
          subTitle: 'NAV_LINKS.EXPERT_COLOR_PICKS',
          subTitleIdentifier: subTitleExperColorPicks,
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.EXPERT_COLOR_PICKS',
          url: '/expert-colors',
          id: 1
        },
        {
          image: '/prism/images/color-visualizer-wrapper/inspiration-submenu__thumbnail--sample-photos.png',
          subTitle: 'NAV_LINKS.INSPIRATIONAL_PHOTOS',
          subTitleIdentifier: subTitleInspirationalPhotos,
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.INSPIRATIONAL_PHOTOS',
          url: '/color-from-image',
          id: 2
        }
      ]
    }
  },
  scenes: {
    content: {
      title: 'NAV_DROPDOWN_TITLE.PAINT_A_PHOTO',
      titleIdentifier: scenesContentTitle,
      subContent: [
        {
          image: '/prism/images/color-visualizer-wrapper/scene-submenu__thumbnail--sample-scenes.png',
          subTitle: 'NAV_LINKS.USE_OUR_PHOTOS',
          subTitleIdentifier: subTitleUseOurPhotos,
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.USE_OUR_PHOTOS',
          url: '/active',
          id: 0
        },
        {
          image: '/prism/images/color-visualizer-wrapper/scene-submenu__thumbnail--my-photos.png',
          imageiPhone: '/prism/images/color-visualizer-wrapper/scene-submenu__thumbnail--iphone.png',
          imageiPad: '/prism/images/color-visualizer-wrapper/scene-submenu__thumbnail--ipad.png',
          imageAndroid: '/prism/images/color-visualizer-wrapper/scene-submenu__thumbnail--android.png',
          subTitle: 'NAV_LINKS.UPLOAD_YOUR_PHOTO',
          subTitleIdentifier: subTitleUploadYourPhoto,
          subTitleMobile: 'NAV_LINKS.GET_THE_APP',
          subContent: 'NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO',
          subContentAndroid: 'NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_ANDROID',
          subContentiPad: 'NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_IPAD',
          subContentiPhone: 'NAV_DROPDOWN_LINK_SUB_CONTENT.UPLOAD_YOUR_PHOTO_IPHONE',
          description: 'NAV_DROPDOWN_LINK_TIP_DESCRIPTION.UPLOAD_YOUR_PHOTO',
          url: '/paint-scene',
          id: 1
        }
      ]
    }
  }
}
