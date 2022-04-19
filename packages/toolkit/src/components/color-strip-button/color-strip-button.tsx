import React from 'react'

export interface ColorStripButtonProps {
  children?: JSX.Element
  colors: Array<{ hex: string }>
  bottomLabel?: string
}

const ColorStripButton = ({ children, colors, bottomLabel }: ColorStripButtonProps): JSX.Element => (
  <div className='py-8 px-12 flex-grow w-full'>
    <div
      className='border-3 cursor-pointer hover:outline-none hover:ring hover:border-blue-300 focus:outline-none focus:ring focus:border-blue-300 focus:z-100 inline-block'
      role='button'
      tabIndex={0}
    >
      {children}
      <div className='inline-flex h-16 w-full' role='img'>
        {colors.map((el, key) => {
          return (
            <div
              key={key}
              // @ts-ignore
              style={{ backgroundColor: el }}
              className='border-r-2 border-t-2 border-white h-16 w-full'
              data-testid='color-square'
            />
          )
        })}
      </div>
      {bottomLabel !== undefined && <div className='text-center font-bold margin-6'>{bottomLabel}</div>}
    </div>
  </div>
)

export default ColorStripButton
