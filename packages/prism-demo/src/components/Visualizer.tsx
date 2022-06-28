import React, { useState } from 'react'
import LivePaletteWrapper from './LivePalette'
import SingleImageColorPicker from './SingleImageColorPicker'

const Visualizer = () => {
  const [lpColors, setLpColors] = useState()

  return (
    <>
      <div className='container flex flex-col justify-center mx-auto mt-10 sm:px-6 lg:px-8'>
        <div className='flex justify-center align-middle shadow-black drop-shadow-xl w-full'>
          <div>
            <div className='py-1'>
              <div className='flex flex-row justify-around h-12 w-full p-2'>
                <button className='w-full text-teal-900 border border-r-0 border-slate-500 text-sm hover:text-gray-300 hover:bg-teal-700'>
                  CULINARY
                </button>
                <button className='w-full text-teal-900 border border-r-0 border-slate-500 text-sm hover:text-gray-300 hover:bg-teal-700'>
                  TIME CAPSULE
                </button>
                <button className='w-full text-teal-900 border border-r-0 border-slate-500 text-sm hover:text-gray-300 hover:bg-teal-700'>
                  GLOBETROTTING
                </button>
                <button className='w-full text-teal-900 border border-slate-500 text-sm hover:text-gray-300 hover:bg-teal-700'>
                  CUISINE
                </button>
              </div>
            </div>
            <SingleImageColorPicker lpColors={lpColors} setLpColors={setLpColors} />
          </div>
        </div>
      </div>
      <div className='w-auto mt-10 sm:mx-2 md:p-1 md:border lg:w-3/4 lg:mx-auto'>
        <LivePaletteWrapper lpColors={lpColors} setLpColors={setLpColors} />
      </div>
    </>
  )
}

export default Visualizer
