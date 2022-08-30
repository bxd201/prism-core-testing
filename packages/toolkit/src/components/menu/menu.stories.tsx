import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { light, solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import Menu, { Tab, TabItem } from './menu'

const Template = (args: { featureExclusions?: string[] }): JSX.Element => {
  const exploreColorsItems = [
    {
      description: 'Search Sherwin-Williams paint colors to add to your palette or get color info.',
      src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-explore-color?fmt=jpg&qlt=95',
      title: 'digital color wall'
    }
  ]

  args.featureExclusions?.indexOf('color-collections') !== 0 &&
    exploreColorsItems.push({
      description: 'Find colors that work together seamlessly throughout your home.',
      src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-color-collections?fmt=jpg&qlt=95',
      title: 'color collections'
    })

  exploreColorsItems.push({
    description: 'Capture colors from any photo and match them to real paint colors.',
    src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-match-photo?fmt=jpg&qlt=95',
    title: 'match a photo'
  })

  const tabs: Tab[] = [
    {
      content: (
        <>
          <span className='fa-layers fa-fw mr-3' style={{ backgroundColor: 'inherit' }}>
            <FontAwesomeIcon
              icon={light('square-full')}
              size='xs'
              transform={{ rotate: 10 }}
              style={{ marginRight: '-3px' }}
            />
            <FontAwesomeIcon
              icon={light('square-full')}
              size='sm'
              transform={{ rotate: 0 }}
              style={{ marginRight: '-1px', backgroundColor: 'inherit' }}
            />
            <FontAwesomeIcon
              icon={light('square-full')}
              size='1x'
              transform={{ rotate: 350 }}
              style={{ backgroundColor: 'inherit' }}
            />
            <FontAwesomeIcon icon={light('plus-circle')} size='xs' />
          </span>
          Explore Colors
        </>
      ),
      items: exploreColorsItems,
      onClick: (tab, index) => {},
      title: 'Explore all the ways to start building My Color Palette.'
    },
    {
      content: (
        <>
          <FontAwesomeIcon className='inline-block mb-0.5 mr-3' icon={light('lightbulb')} size='1x' />
          Get Inspired
        </>
      ),
      items: [
        {
          description: 'See colors in context to start building your color confidence.',
          src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-painted-scenes?fmt=jpg&qlt=95',
          title: 'painted photos'
        },
        {
          description: 'Find expertly designed color palettes to use in your space.',
          src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-color-picks?fmt=jpg&qlt=95',
          title: 'expert color picks'
        },
        {
          description: 'Use our images to discover colors from around the world.',
          src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-sample-photos?fmt=jpg&qlt=95',
          title: 'inspirational photos'
        }
      ],
      onClick: (tab, index) => {},
      title: 'Find inspiration for your next painting project.'
    },
    {
      content: (
        <>
          <span className='fa-layers fa-fw mr-3'>
            <FontAwesomeIcon icon={light('square-full')} />
            <FontAwesomeIcon icon={solid('brush')} size='sm' transform={{ rotate: 320 }} />
          </span>
          Paint a Photo
        </>
      ),
      items: [
        {
          description: 'Virtually paint a sample photo.',
          src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-sample-scenes?fmt=jpg&qlt=95',
          title: 'use our photos'
        },
        {
          description: 'Virtually paint your own photo.',
          src: 'https://sherwin.scene7.com/is/image/sw/prism-cvw-nav-thumb-my-photos?fmt=jpg&qlt=95',
          title: 'upload your photo',
          footnote: 'Photo Tips: For best results make sure your room is well lit. Natural light works best.'
        }
      ],
      onClick: (tab, index) => {},
      title: 'Start Painting.'
    }
  ]

  args.featureExclusions?.indexOf('my-ideas') !== 0 &&
    tabs.push({
      alignment: 'right',
      content: 'My Ideas',
      items: [
        {
          description: <i>- Content of My Ideas Component -</i>
        }
      ],
      onClick: (tab, index) => {},
      title: 'View and edit your saved ideas'
    })

  tabs.push({
    alignment: 'right',
    content: 'Help',
    items: [
      {
        description: <i>- Content of Help Component -</i>
      }
    ],
    onClick: (tab, index) => {},
    title: 'Helpful Hints'
  })

  return (
    <Menu
      {...args}
      closeButtonRenderer={(defaultProps) => (
        <button
          {...defaultProps}
          className={`${defaultProps.className} px-5 py-1.5 sm:py-2 bg-white border border-solid border-black text-1.5xs hover:border-secondary ring-secondary focus:outline-none focus-visible:ring-2`}
        >
          CLOSE
          <FontAwesomeIcon icon={solid('chevron-up')} className='inline-block mb-1 ml-1.5' />
        </button>
      )}
      itemRenderer={(tabItems: TabItem) => (
        <button className='flex flex-col items-center w-full hover:text-secondary ring-primary group focus:outline-none focus-visible:ring-2'>
          {tabItems.src && (
            <div
              className='w-full pb-2/4 xs:pb-3/4 mb-3.5 bg-center bg-cover border-4 sm:border-8 border-solid border-white group-hover:border-secondary transition-border duration-200 ease-out'
              style={{
                backgroundImage: `url(${tabItems.src})`,
                boxShadow: '0 3px 5px -4px black'
              }}
            />
          )}
          <h3 className='mb-3.5 text-sm font-bold uppercase'>{tabItems.title}</h3>
          <p className='mb-3.5 text-1.5xs text-black leading-4'>{tabItems.description}</p>
          {tabItems.footnote && <p className='mb-3 text-xs text-black leading-3 italic'>{tabItems.footnote}</p>}
        </button>
      )}
      tabs={() => tabs}
    />
  )
}

export const AllFeatures = Template.bind({})
AllFeatures.args = {}

export const ExploreColorsTabOpened = Template.bind({})
ExploreColorsTabOpened.args = { initialActiveTabIndex: 0 }

export const WithoutColorCollections = Template.bind({})
WithoutColorCollections.args = { featureExclusions: ['color-collections'] }

export const WithoutMyIdeas = Template.bind({})
WithoutMyIdeas.args = { featureExclusions: ['my-ideas'] }

export default {
  title: 'Menu',
  component: Menu,
  argTypes: {
    closeButtonRenderer: {
      control: false,
      description: 'content element of the submenu close button <br />fired when the submenu close button is clicked'
    },
    featureExclusions: { table: { disable: true } },
    initialActiveTabIndex: { control: { type: 'range', min: 0, max: 4 } },
    itemRenderer: {
      control: true,
      description:
        'example:<br />`(tabItems) => (`<br />&nbsp;&nbsp;&nbsp;`<div>`<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`<img src={tabItems.src} />`<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`<p>{tabItems.title}</p>`<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`{tabItems.description}`<br />&nbsp;&nbsp;&nbsp;`</div>`<br />`)`'
    },
    tabs: {
      control: false,
      description: 'callback function array of tab objects to be render',
      table: {
        defaultValue: { summary: `{ alignment: 'center' }` }
      }
    }
  }
}
