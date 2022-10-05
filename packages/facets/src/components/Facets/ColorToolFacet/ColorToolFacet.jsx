// https://github.sherwin.com/SherwinWilliams/TAG-Prism-Service/blob/2577325d1a3c55f6a14a48656435a37656cb1c68/service/src/main/java/com/sherwinwilliams/prism/datadumputilities/nodescripts/utils/transform/index.js
// @flow
// eslint-disable-next-line no-unused-vars
import React, {useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import space from 'color-space'
import colorutil from 'color-util/src/ColorUtil'
import { isDarkColor } from 'is-dark-color/dist/isDarkColor'
import facetBinder from '../../../facetSupport/facetBinder'
import ToggleSwitch from '../../VariantSwitcher/ToggleSwitch'
import './ColorToolFacet.scss'

type ColorToolProps = {

}

const baseClassName = 'color-tool-facet'
const buttonClassName = `${baseClassName}__button`
const outputClassName = `${baseClassName}__output`
const inputClassName = `${baseClassName}__input`

function score (n) {
  if (n >= 100) {
    n = 99
  }

  return Math.floor(n / 10)
}

// eslint-disable-next-line no-unused-vars
function describe (value) {
  const saturationMap = {
    0: ['Washed out'],
    1: ['Dull'],
    2: ['Diluted', 'Wan'],
    3: ['Subdued', 'Muted'],
    4: ['Fairly Colorful', 'Moderately Colorful'],
    5: ['Soft'],
    6: ['Gleaming', 'Forceful'],
    7: ['Rich', 'Vibrant'],
    8: ['Vivid', 'Sparkling'],
    9: ['Intense']
  }

  const luminosityMap = {
    0: ['Very Dark', 'Somber'],
    1: ['Dark', 'Dim'],
    2: ['Leaden'],
    3: ['Dusky', 'Fairly Dark'],
    4: ['Moderately Bright'],
    5: ['Fairly Bright'],
    6: ['Bright', 'Glowing'],
    7: ['Pale'],
    8: ['Brilliant', 'Radiant'],
    9: ['Dazzling']
  }

  return `${saturationMap[score(value.saturation)]}${luminosityMap[score(value.luminosity)]}${value.description}`
}

// eslint-disable-next-line no-unused-vars
function colorLocationGroup (value) {
  return `${(value.storeStripLocator ?? '').split('-')[0]}`
}

function rgbIntToValues (value) {
  const { rgb, hex, hsl } = colorutil.color(value)
  const [L, A, B] = space.rgb.lab([rgb.r, rgb.g, rgb.b])

  return {
    blue: rgb.b,
    // colorLocationGroup: colorLocationGroup(color),
    // description: describe(color.rgb),
    green: rgb.g,
    hex,
    hue: hsl.h,
    isDark: isDarkColor(hex),
    lab: { L, A, B },
    lightness: hsl.l,
    red: rgb.r,
    saturation: hsl.s
  }
}

function ColorToolFacet (props: ColorToolProps) {
  const [userInput, setUserInput] = useState('')
  const [outputVal, setOutputVal] = useState('')
  const [error, setError] = useState('')
  const [showJSON, setShowJSON] = useState(true)
  const [blobUrl, setBlobUrl] = useState(null)

  const calculateValues = (e) => {
    e.preventDefault()
    if (error) {
      setError('')
    }

    const valCheck = userInput.match(/^[0-9]+$/)
    if (!valCheck) {
      setError('The rgb value entered is invalid. It should only contain numbers.')
      return
    }

    const result = rgbIntToValues(parseInt(userInput))
    setOutputVal(result)
    setupExport(showJSON, result)
  }

  const setUserInputValue = (e) => {
    if (error) {
      setError('')
    }

    if (outputVal) {
      setOutputVal('')
    }

    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
    }

    setUserInput(e.target.value)
  }

  const setupExport = (isJSON, oVal) => {
    const mime = showJSON ? 'text/json;charset=utf-8' : 'text/csv;charset=utf-8'
    const payload = isJSON ? JSON.stringify(oVal, null, 2) : convertToText(oVal)
    const downloadData = new Blob([payload], { type: mime })
    const _blobUrl = URL.createObjectURL(downloadData)

    setBlobUrl(_blobUrl)
  }

  const toggleOutputType = (data) => {
    const isJSON = !showJSON

    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
    }

    setupExport(isJSON, outputVal)
    setShowJSON(isJSON)
  }

  const convertToText = (val) => {
    return ['name, value'].concat(Object.keys(val).map((key) => {
      if (key === 'lab') {
        return `${key},L:${val[key].L};A:${val[key].A};B:${val[key].B}`
      }

      return `${key},${val[key]}`
    })).join('\n')
  }

  return <div className='container mx-auto p-8 bg-white mt-12 filter drop-shadow-md'>
    <div>
      {error ? <div className={'bg-red-500 text-white text-center p-4 filter drop-shadow-md mb-4'}>{error}</div> : null}
      <div className='text-center w-full text-5xl'><FontAwesomeIcon icon={['fa', 'brush']} /></div>
      <div><h1 className='text-center'>Color Value Extractor</h1></div>
      <div className='bg-blue-100 mb-8 filter drop-shadow-md'>
        <p className='p-4'>Use this tool to distill <strong>RGB triplet</strong> ie: (255,255,255) , <strong>hexidecimal (hex)</strong> ie: #FFFFFF , <strong>HSL</strong> ie: (0, 0, 100%) and more from an RGB number ie: 10319976</p>
        <p className='p-4'>Please enter an "rgb" color number below.</p>
      </div>
      <div className='mt-4'>
        <input className={`${inputClassName} bg-white text-black p-2`} onChange={setUserInputValue} value={userInput} />
      </div>
      <div><button className={`${buttonClassName} pt-4 pb-4 w-36 mt-8 bg-blue-500 text-white`} onClick={calculateValues}>Calculate Values</button></div>
      {outputVal
        ? <div>
        <div>
          <div className='w-full mt-8 flex flex-row-reverse'>
            <div className='w-48 text-xs'><ToggleSwitch currentColor='#ffffff' textColor={'#000000'} handleToggle={toggleOutputType} variantsList={[{ icon: 'code', label: 'JSON' }, { icon: 'typewriter', label: 'CSV' }]} iconType='fa' /></div>
          </div>
        </div>
        {<div>
          <textarea className={`w-full bg-black text-indigo-400 font-mono mt-8 p-2 filter drop-shadow-md ${outputClassName}`} readOnly value={showJSON ? JSON.stringify(outputVal, null, 2) : convertToText(outputVal)} />
        </div>}
        <div className='w-full mt-8 flex flex-row-reverse text-center text-white text-sm no-underline'><a download={`color-values-${Date.now()}.${showJSON ? 'json' : 'csv'}`} href={blobUrl} className={`${buttonClassName} pt-4 pb-4 w-36 bg-blue-500 text-white`}>{showJSON ? 'Export JSON' : 'Export CSV'}</a></div>
      </div>
        : null}
    </div>
  </div>
}

export default facetBinder(ColorToolFacet, 'ColorToolFacet')
