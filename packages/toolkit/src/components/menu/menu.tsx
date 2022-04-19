import React, { useEffect, useState } from 'react'

export interface Tab {
  alignment?: 'center' | 'right'
  content: string | JSX.Element
  items?: TabItem[]
  onClick?: (tab: any, index: number) => void
  title?: string
}

export interface TabItem {
  description: string | JSX.Element
  src?: string
  title?: string
  footnote?: string
}

export interface MenuProps {
  closeButtonRenderer?: (actions: {
    onClick: () => void
    onKeyDown: (keys: { keyCode: number; shiftKey: boolean }) => void
    className: string
  }) => JSX.Element
  initialActiveTabIndex?: number
  itemRenderer: (T: any) => JSX.Element
  tabs: () => Tab[]
}

const Menu = ({ closeButtonRenderer, initialActiveTabIndex, itemRenderer, tabs }: MenuProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<number>()

  useEffect(() => {
    setActiveTab(initialActiveTabIndex)
  }, [initialActiveTabIndex])

  const getTabContent = (tab: Tab, index: number): JSX.Element => (
    <>
      <button
        className={`tab h-12 mr-0.5 px-1 xs:px-3 leading-4 bg-bottom-0 hover:bg-bottom-20 ${
          activeTab === index ? 'bg-secondary text-white' : 'bg-white hover:text-secondary'
        } transition-background-position duration-200 hover:ring-secondary focus:outline-none focus-visible:underline`}
        onClick={() => {
          setActiveTab(index)
          tab.onClick?.(tab, index)
        }}
        style={
          activeTab === index
            ? {}
            : {
                backgroundImage:
                  'linear-gradient(to top, var(--prism-theme-color-white, #FFF) 50%, var(--prism-theme-color-secondary, #2CABE2) 50%)',
                backgroundSize: '100% 200%'
              }
        }
      >
        {tab.content}
      </button>
      {activeTab === index && (
        <div
          className='absolute top-12 left-0 py-4 flex justify-center flex-wrap w-full bg-lightest text-center'
          style={{ boxShadow: 'inset 0 7px 5px -7px rgba(0, 0, 0, .3)' }}
        >
          <h1 className='w-full mt-8 sm:mt-3 px-2 py-2.5 sm:py-7 text-base sm:text-2.5xl leading-5 font-bold'>
            {tab.title}
          </h1>
          <ul className='flex flex-col xs:flex-row justify-center w-full'>
            {tab.items?.map((item, i) => (
              <li key={i} className='xs:w-1/2 max-w-none xs:max-w-xs' style={{ margin: '0 2.5%' }}>
                {itemRenderer(item)}
              </li>
            ))}
          </ul>
          {closeButtonRenderer?.({
            className: 'absolute top-4 right-3.5',
            onClick: () => {
              setActiveTab(undefined)
            },
            onKeyDown: (e) => {
              !e.shiftKey && e.keyCode === 9 && close()
            }
          })}
        </div>
      )}
    </>
  )

  return (
    <nav className='relative flex text-1.5xs border-b border-solid border-light-grey'>
      <ul className='xs:flex-1 flex justify-center'>
        {tabs().map(
          (tab, index) =>
            (tab.alignment === undefined || tab.alignment === 'center') && <li key={index}>{getTabContent(tab, index)}</li>
        )}
      </ul>
      <ul className='flex justify-end'>
        {tabs().map((tab, index) => tab.alignment === 'right' && <li key={index}>{getTabContent(tab, index)}</li>)}
      </ul>
    </nav>
  )
}

export default Menu
