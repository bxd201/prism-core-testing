import React from 'react'
import SingleImageColorPicker from './SingleImageColorPicker'

function Visualizer() {
  return (
    <div className='container flex justify-center mx-auto mt-10 sm:px-6 lg:px-8'>
      <div className='flex justify-center align-middle shadow-black drop-shadow-xl w-full '>
        <div>
          <div className='py-1'>
            <div className='flex flex-row justify-around h-12  w-full p-2'>
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
          <SingleImageColorPicker />
        </div>
      </div>
    </div>
  )
}

export default Visualizer
