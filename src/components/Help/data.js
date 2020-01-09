export const helpTabs = [
  {
    id: 0,
    header: 'Icons & Buttons',
    subHeader: 'Use these icons and buttons to help narrow down your final choices.',
    content: [
      {
        fontAwesomeIcon: { variant: 'fal', icon: 'plus-circle', rotate: 0 },
        iconInfoName: 'Add Color',
        iconInfoContent: [
          'In a color swatch, tapping this icon will add that color to My Color Palette. In My Color Palette, tapping this icon will open the Digital Color Wall.'
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fal', icon: 'folder', rotate: 0 },
        iconInfoName: 'Save',
        iconInfoContent: [
          `Tap this icon to save your inspiration and ideas. Access them in My Ideas any time you’re logged in to mySW.`
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fa', icon: 'trash', rotate: 0 },
        iconInfoName: 'Trash a Color',
        iconInfoContent: [
          'Tap this icon to delete a color from My Color Palette. Dragging an inspirational color dot over this icon will delete it from your inspirational color options.'
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fal', icon: 'clone', rotate: 0, flip: 'horizontal' },
        iconInfoName: 'More Scenes',
        iconInfoContent: [
          'This icon opens interior and exterior room scene options. Explore different scenes to find your favorite and begin painting.'
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fal', icon: 'align-justify', rotate: 0, flip: 'horizontal' },
        iconInfoName: 'Color Details',
        iconInfoContent: [
          'Tapping this icon will expand info about that color, including coordinating colors, similar colors and color details.'
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fal', icon: 'signal-3', rotate: 235, size: 'lg' },
        iconInfoName: 'Grab & Reorder',
        iconInfoContent: [
          'Tap and drag this icon to reorder colors within My Color Palette.'
        ]
      }
    ],
    imageList: ''
  },
  {
    id: 1,
    header: 'My Color Palette',
    subHeader: 'My Color Palette is used to collect and compare colors to paint with.',
    content: '',
    imageList: [
      {
        imagePath: '/prism/images/help/my-color-palette-bg@2x.jpg',
        alt: '',
        role: ''
      },
      {
        imagePath: '/prism/images/help/my-color-palette-1@2x.png',
        alt: `Click the color details icon the see a color's details`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/my-color-palette-2@2x.png',
        alt: 'Click the trash icon to delete a color swatch',
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/my-color-palette-3@2x.png',
        alt: 'An active color state shows the paint color to be applied to the scene',
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/my-color-palette-4@2x.png',
        alt: 'Tap and hold the bottom edge of a color swatch to rearrange your palette',
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/my-color-palette-5@2x.png',
        alt: 'Click the add a color icon from the color palette to launch the digital color wall and explore color at any time during your experience',
        role: 'text'
      }
    ],
    subContent: [
      {
        header: 'Custom Keyboard Navigation for Accessibility',
        content: `On your keyboard, use "up" and "down" arrow keys (\u2191 \u2193) to switch focus between live palette and paintable scene regions.`
      }
    ],
    imageListMobile: [
      {
        imagePath: '/prism/images/help/mobile/my-color-palette-mobile-1@2x.jpg',
        alt: `Click the color details icon the see a color's details, Click the trash icon to delete a color swatch`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/mobile/my-color-palette-mobile-2@2x.jpg',
        alt: `An active color state shows the paint color to be applied to the scene`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/mobile/my-color-palette-mobile-3@2x.jpg',
        alt: `Click the add a color icon from the color palette to launch the digital color wall and explore color at any time during your experience`,
        role: 'text'
      }
    ]
  },
  {
    id: 2,
    header: 'Adding Colors',
    subHeader: 'Add colors to your palette wherever you see an plus icon.',
    content: '',
    imageList: [
      {
        imagePath: '/prism/images/help/add-color-bg@2x.jpg',
        alt: '',
        role: ''
      },
      {
        imagePath: '/prism/images/help/add-color-1@2x.png',
        alt: 'Clicking the add a color icon inside a color tile will add a color to the Color Palette',
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/add-color-2@2x.png',
        alt: 'Click the add a color icon from the color palette to launch the digital color wall and explore color at any time during your experience',
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/add-color-3@2x.png',
        alt: 'My Color Palette can hold up to 8 colors at a time. To add more, just save your current palette and start a new one.',
        role: 'text'
      }
    ],
    subContent: [
      {
        header: 'Custom Keyboard Navigation for Accessibility',
        content: `On your keyboard, use "up", "down", "left", and "right" arrow keys (\u2190 \u2193 \u2191 \u2192) to navigate within color grids.`
      }
    ],
    imageListMobile: [
      {
        imagePath: '/prism/images/help/mobile/add-color-mobile-1@2x.jpg',
        alt: `Clicking the add a color icon inside a color tile will add a color to the Color Palette`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/mobile/add-color-mobile-2@2x.jpg',
        alt: `Click the add a color icon from the color palette to launch the digital color wall and explore color at any time during your experience`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/mobile/add-color-mobile-3@2x.jpg',
        alt: `My Color Palette can hold up to 8 colors at a time. To add more, just save your current palette and start a new one.`,
        role: 'text'
      }
    ]
  },
  {
    id: 3,
    header: 'Color Details',
    subHeader: 'Provides a color scene preview, coordinating colors, similar colors and additional information.',
    content: '',
    imageList: [
      {
        imagePath: '/prism/images/help/color-detail-bg@2x.jpg',
        alt: '',
        role: ''
      },
      {
        imagePath: '/prism/images/help/color-detail-1@2x.png',
        alt: `Click the color details icon the see a color's details`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/color-detail-2@2x.png',
        alt: 'Preview a color in 5 different photos to decide if you want to add it to your palette',
        role: 'text'
      }
    ],
    imageListMobile: [
      {
        imagePath: '/prism/images/help/mobile/color-detail-mobile-1@2x.jpg',
        alt: `Click the color details icon the see a color's details`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/mobile/color-detail-mobile-2@2x.jpg',
        alt: `Preview a color in 5 different photos to decide if you want to add it to your palette`,
        role: 'text'
      }
    ]
  },
  {
    id: 4,
    header: 'Painting My Own Photo',
    subHeader: 'Use these tools to help you see how color will look in your space.',
    content: [
      {
        fontAwesomeIcon: { variant: 'fa', icon: 'fill-drip', rotate: 0, flip: 'horizontal' },
        iconInfoName: 'Paint Area',
        iconInfoContent: [
          'Use the Paint Area feature to automatically detect and paint surface areas. Just click or tap on a surface to highlight it, then click or tap again to paint.'
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fa', icon: 'brush', rotate: 45 },
        iconInfoName: 'Paintbrush',
        iconInfoContent: [
          `Select this icon to paint your photo freehand. Just point, click or tap, and drag to add color to any area.`
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fa', icon: 'mouse-pointer', rotate: -20, flip: 'horizontal' },
        iconInfoName: 'Select',
        iconInfoContent: [
          'Select an area, then use the tool bar to paint, edit paint color or remove paint from your photo.'
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fa', icon: 'eraser', rotate: 0 },
        iconInfoName: 'Erase',
        iconInfoContent: [
          'Quickly remove paint from your photo.'
        ]
      },
      {
        fontAwesomeIcon: [
          { variant: 'fal', icon: 'draw-polygon', rotate: 10 },
          { variant: 'fal', icon: 'plus', rotate: 0, size: 'xs' }
        ],
        iconInfoName: 'Define Area',
        iconInfoContent: [
          'Outline an area to paint it. Be sure to enclose the area by starting and ending at the same point.'
        ]
      },
      {
        fontAwesomeIcon: [
          { variant: 'fal', icon: 'draw-polygon', rotate: 10 },
          { variant: 'fal', icon: 'minus', rotate: 0, size: 'xs' }
        ],
        iconInfoName: 'Remove Area',
        iconInfoContent: [
          'Use this tool to select and remove paint from a defined area.'
        ]
      },
      {
        fontAwesomeIcon: { variant: 'fal', icon: 'search-plus', rotate: 0 },
        iconInfoName: 'Zoom',
        iconInfoContent: [
          'Zoom in and pan around within your photo to paint small areas with better accuracy.'
        ]
      },
      {
        fontAwesomeIcon: [
          { variant: 'fa', icon: 'undo-alt', rotate: 0 },
          { variant: 'fa', icon: 'redo-alt', rotate: 0 }
        ],
        iconInfoName: 'Undo & Redo',
        iconInfoContent: [
          'Easily delete or repeat your last action.'
        ],
        isUndoRedo: true
      }
    ],
    imageList: '',
    isHiddenMobile: true
  },
  {
    id: 5,
    header: 'Saving My Work',
    subHeader: 'When you register an account with mySW, you can access saved color palettes from any device.',
    content: '',
    imageList: [
      {
        imagePath: '/prism/images/help/saving-bg@2x.jpg',
        alt: '',
        role: ''
      },
      {
        imagePath: '/prism/images/help/saving-1@2x.png',
        alt: 'Name your current photo or palette for future use',
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/saving-3@2x.png',
        alt: 'Tap the save icon at the bottom of the page',
        role: 'text'
      }
    ],
    imageListMobile: [
      {
        imagePath: '/prism/images/help/mobile/saving-mobile-1@2x.jpg',
        alt: `Tap the save icon at the bottom of the page`,
        role: 'text'
      },
      {
        imagePath: '/prism/images/help/mobile/saving-mobile-2@2x.jpg',
        alt: `Name your current photo or palette for future use`,
        role: 'text'
      }
    ]
  }
]

export const helpHeader = 'Helpful Hints'
export const KEY_CODE_ENTER = 13
export const KEY_CODE_SPACE = 32
