import React, { CSSProperties, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearchMinus } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle, faMinusCircle } from '@fortawesome/pro-light-svg-icons'
import ColorWall from '../color-wall/color-wall'
import ColorSwatch from '../color-swatch/color-swatch'
import { Color } from '../../types'

interface Range {
  end: number
  start: number
}
export interface ColorFilterProps {
  colors: Color[]
  setupDownloadLabel?: string
  hue?: Range
  lightness?: Range
  saturation?: Range
  filterInByColorNumber?: number[]
}

const initialRange = { end: 0, start: 0 }

/**
 * Displays SW color wall with controls to filter hue, saturation, and lightness.<br>
 * It also provides manual filter in / out or reset colors to default through swatch buttons,
 * and filter in colors by color number using filterInByColorNumber control.
 *
 * HSL bars reference:
 *
 * <img src='https://develop-prism-lib.ebus.swaws/static/media/hue.de71855e.png' style='width: 40%; margin: 0 5%;' />
 * <img src='https://develop-prism-lib.ebus.swaws/static/media/hsl.d785579f.png' style='width: 40%; margin: 0 5%;' />
 */
const ColorFilter = ({
  colors,
  setupDownloadLabel = 'Controls',
  hue = initialRange,
  lightness = initialRange,
  saturation = initialRange,
  filterInByColorNumber
}: ColorFilterProps): JSX.Element => {
  const [unfiltered, setUnfiltered] = useState<Color[]>([])
  const [filtered, setFiltered] = useState<Color[]>([])
  const [originalUnfiltered, setOriginalUnfiltered] = useState<Color[]>([])
  const [originalFiltered, setOriginalFiltered] = useState<Color[]>([])
  const [manuallyFilteredOutColors, setManuallyFilteredOutColors] = useState<Color[]>([])
  const [manuallyFilteredInColors, setManuallyFilteredInColors] = useState<Color[]>([])
  const [warning, setWarning] = useState('')
  const colorsAccepted = colors.filter((color) => !color.ignore)

  useEffect(() => {
    setFiltered([])
    setUnfiltered([])
    setOriginalFiltered([])
    setOriginalUnfiltered([])
    for (const color of colorsAccepted) {
      if (
        color.hue >= hue.start / 100 &&
        color.hue <= hue.end / 100 &&
        color.lightness >= lightness.start / 100 &&
        color.lightness <= lightness.end / 100 &&
        +color.saturation.toFixed(2) >= saturation.start / 100 &&
        +color.saturation.toFixed(2) <= saturation.end / 100
      ) {
        setFiltered((oldArr) => [...oldArr, color])
        setOriginalFiltered((oldArr) => [...oldArr, color])
      } else {
        setUnfiltered((oldArr) => [...oldArr, color])
        setOriginalUnfiltered((oldArr) => [...oldArr, color])
      }
    }
    setFiltered((oldArr) => oldArr.filter((color) => !manuallyFilteredOutColors.includes(color)))
    setUnfiltered((oldArr) => oldArr.filter((color) => !manuallyFilteredInColors.includes(color)))
  }, [hue, lightness, saturation])

  useEffect(() => {
    setManuallyFilteredInColors([])
    for (const color of colorsAccepted) {
      if (filterInByColorNumber?.includes(+color.colorNumber)) {
        setManuallyFilteredInColors((oldArr) => [...oldArr, color])
        setUnfiltered((oldArr) => oldArr.filter((colorObj) => colorObj !== color))
      }
    }
  }, [filterInByColorNumber])

  const filterInByColorNumberValidation = (colorNumber: number): boolean => {
    if (filterInByColorNumber?.includes(colorNumber)) {
      setWarning(`Color number ${colorNumber} is on filterInByColorNumber. It can only be managed from its control.`)
      setTimeout(() => {
        setWarning('')
      }, 5000)
      return true
    }
    return false
  }

  const moveColor = (color, filteredOutColumn): void => {
    const warning = filterInByColorNumberValidation(+color.colorNumber)
    if (warning) return
    const removeColor = (oldArr): [] => oldArr.filter((colorObj) => colorObj !== color)
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (filteredOutColumn) {
      setUnfiltered(removeColor)
      setManuallyFilteredInColors((oldArr) => [...oldArr, color])
      setManuallyFilteredOutColors(removeColor)
    } else {
      setFiltered(removeColor)
      // @ts-ignore
      setManuallyFilteredOutColors((oldArr) => [...oldArr, color])
      setManuallyFilteredInColors(removeColor)
    }
  }

  const resetColor = (color): void => {
    const warning = filterInByColorNumberValidation(+color.colorNumber)
    if (warning) return
    setFiltered(originalFiltered)
    setUnfiltered(originalUnfiltered)
    setManuallyFilteredOutColors((oldArr) => oldArr.filter((colorObj) => colorObj !== color))
    setManuallyFilteredInColors((oldArr) => oldArr.filter((colorObj) => colorObj !== color))
  }

  interface SwatchRendererProps {
    active: boolean,
    color: Color
    filteredOutColumn?: boolean
    onClick: () => void
    style: CSSProperties
  }

  const SwatchRenderer = ({ active, color, style, onClick, filteredOutColumn }: SwatchRendererProps): JSX.Element => {
    const manuallyFilteredColors = manuallyFilteredOutColors.concat(manuallyFilteredInColors)

    return (
      <ColorSwatch
        active={active}
        aria-label={`${color.brandKey} ${color.colorNumber} ${color.name}`}
        className='border-white border-1 ring-primary focus:outline-none focus:ring-2'
        color={color}
        onClick={onClick}
        renderer={() => (
          <div className='absolute p-2' style={{ top: '-85%', left: '-85%', width: '270%', height: '270%', transform: 'scale(0.37)' }}>
            <div className='relative'>
              <p className='text-sm'>{`${color.brandKey} ${color.colorNumber}`}</p>
              <p className='font-bold'>{color.name}</p>
            </div>
            <div className='flex justify-between items-end absolute left-0 bottom-0 w-full p-2.5 focus:outline-none'>
              <button
                aria-label={filteredOutColumn !== undefined ? 'filterin' : 'filterout'}
                onClick={() => moveColor(color, filteredOutColumn)}
              >
                <FontAwesomeIcon icon={filteredOutColumn !== undefined ? faPlusCircle : faMinusCircle} />
              </button>
              {manuallyFilteredColors.filter((colorObj) => colorObj.colorNumber === color.colorNumber).length > 0 && (
                <button aria-label='reset' className='text-xs opacity-90 mr-1' onClick={() => resetColor(color)}>
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
        style={style}
      />
    )
  }

  const zoomOutBtn = (onClick): JSX.Element => (
    <button
      className='flex items-center justify-center absolute top-1 right-1 z-10 bg-white w-10 h-10 rounded-full text-primary hover:bg-light focus:outline-none'
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faSearchMinus} size='lg' />
    </button>
  )

  const exportHSLJson = (downloadType): void => {
    const a = document.createElement('a')
    let file
    let label = setupDownloadLabel + ' '
    if (downloadType === 'controls') {
      file = new Blob([JSON.stringify({ setupDownloadLabel, hue, saturation, lightness })], { type: 'text/plain' })
    } else {
      file = new Blob([JSON.stringify(filtered)], { type: 'text/plain' })
      setupDownloadLabel === 'Controls' && (label = '')
    }
    a.href = URL.createObjectURL(file)
    a.download = `${label}HSL Color Filter ${downloadType === 'controls' ? 'setup' : 'data'}.json`
    a.click()
  }

  return (
    <div>
      <div
        className={`${
          warning.length > 0 ? 'h-10' : 'h-0'
        } flex items-center justify-center text-sm text-gray-600 bg-yellow-100 transition-all duration-1000`}
      >
        <span className={`${warning.length > 0 ? 'opacity-100' : 'opacity-0'} transition-opacity delay-500`}>{warning}</span>
      </div>
      <div className='flex flex-col md:flex-row pb-8'>
        <div aria-label='filteredout' className='w-full max-w-lg'>
          <ColorWall
            chunkWidth={26}
            colors={[unfiltered, manuallyFilteredOutColors]}
            gridWidth={1}
            swatchRenderer={(defaultProps) => <SwatchRenderer {...defaultProps} filteredOutColumn />}
            zoomOutButtonRenderer={zoomOutBtn}
            wrappingEnabled={false}
          />
          <p className='text-center margin-6 pt-3'>Filtered Out</p>
        </div>
        <div aria-label='filteredin' className='w-full max-w-lg'>
          <ColorWall
            chunkWidth={26}
            colors={[filtered, manuallyFilteredInColors]}
            gridWidth={1}
            swatchRenderer={(defaultProps) => <SwatchRenderer {...defaultProps} />}
            zoomOutButtonRenderer={zoomOutBtn}
            wrappingEnabled={false}
          />
          <p className='text-center margin-6 pt-3'>Filtered In</p>
        </div>
      </div>
      <div className='flex items-center py-4'>
        <button
          className='px-3 py-2 border border-solid border-black text-xs hover:border-secondary ring-secondary focus:outline-none focus-visible:ring-2'
          onClick={() => exportHSLJson('controls')}
        >
          DOWNLOAD
        </button>
        <span className='ml-3 text-1.5xs leading-4'>{setupDownloadLabel} HSL filter setup JSON</span>
      </div>
      <div className='flex items-center py-4'>
        <button
          className='px-3 py-2 border border-solid border-black text-xs hover:border-secondary ring-secondary focus:outline-none focus-visible:ring-2'
          onClick={() => exportHSLJson('colors')}
        >
          DOWNLOAD
        </button>
        <span className='ml-3 text-1.5xs leading-4'>All filtered colors JSON</span>
      </div>
    </div>
  )
}

export default ColorFilter
