import React, { useEffect, useState } from 'react'
import axios from 'axios'
import LivePaletteWrapper from './LivePalette'
import SingleImageColorPicker from './SingleImageColorPicker'
import Context from '../context'
import { Color } from '../types'

const Visualizer = () => {
  const [colors, setColors] = useState<Color[]>()
  const [lpColors, setLpColors] = useState<Color[]>()

  useEffect(() => {
    axios
      .get('https://api.sherwin-williams.com/prism/v1/colors/sherwin')
      .then((r) => r.data)
      .then((colors) => setColors(colors))
  }, [])

  const addLpColor = color => { setLpColors([...lpColors, color]) }
  const resetLpColors = colors => { setLpColors(colors) }

  return (
    <Context.Provider value={{ addLpColor, colors, lpColors, resetLpColors }}>
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
            <SingleImageColorPicker />
          </div>
        </div>
        <div className='flex-1 w-full lg:w-3/4 mx-auto mt-10 pl-0.5 pr-2.5 md:border'>
          <LivePaletteWrapper />
        </div>
      </div>
    </Context.Provider>
  )
}

export default Visualizer
