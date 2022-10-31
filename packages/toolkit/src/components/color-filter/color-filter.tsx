import React, { useEffect, useState } from 'react'
import { faMinusCircle, faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import { Color } from '../../types'
import ColorSwatch from '../color-swatch/color-swatch'
import ColorWall from '../color-wall/color-wall'
import { Block, Items, SwatchInternalProps, WallShape } from '../color-wall/types'

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

const CHUNK_WIDTH = 26
const colorArrToGenericShape = (colors: Color[]): WallShape => ({
  type: Block.Wall,
  children: [
    {
      type: Block.Column,
      children: [
        {
          type: Block.Chunk,
          children: colors
            .map((c) => c.colorNumber)
            .reduce((resultArray: Items[], item: string, index: number) => {
              const chunkIndex = Math.floor(index / CHUNK_WIDTH)

              if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [] // start a new chunk
              }

              // @ts-ignore
              resultArray[chunkIndex].push(item)

              return resultArray
            }, [])
        }
      ]
    }
  ],
  props: {
    wrap: false
  }
})

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
  const colorMap = colors.reduce((map, c) => {
    map[c.colorNumber] = c
    return map
  }, {})

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

  interface SwatchRendererProps extends SwatchInternalProps {
    filteredOutColumn?: boolean
  }

  const SwatchRenderer = (internalProps: SwatchRendererProps): JSX.Element => {
    const { filteredOutColumn, ...restProps } = internalProps
    const { id, onRefSwatch, active, perimeterLevel } = restProps

    const color = colorMap[id]
    const activeBloom = 'z-[1001] scale-[2.66] sm:scale-[3] duration-200 shadow-swatch p-0'
    const perimeterBloom = {
      1: 'z-[958] scale-[2] sm:scale-[2.36] shadow-swatch duration-200',
      2: 'z-[957] scale-[2] sm:scale-[2.08] shadow-swatch duration-200',
      3: 'z-[956] scale-[1.41] sm:scale-[1.74] shadow-swatch duration-200',
      4: 'z-[955] scale-[1.30] sm:scale-[1.41] shadow-swatch duration-200'
    }
    const baseClass = 'shadow-[inset_0_0_0_1px_white] focus:outline focus:outline-[1.5px] focus:outline-primary'
    const activeClass = active ? activeBloom : ''
    const perimeterClasses: string = perimeterLevel > 0 ? perimeterBloom[perimeterLevel] : ''

    return (
      <ColorSwatch
        {...restProps}
        id={Number(id)}
        key={id}
        aria-label={color?.name}
        color={color}
        className={`${baseClass} ${activeClass} ${perimeterClasses}`}
        ref={onRefSwatch}
        renderer={() => (
          <div
            className='absolute p-2'
            style={{ top: '-85%', left: '-85%', width: '270%', height: '270%', transform: 'scale(0.37)' }}
          >
            <div className='relative'>
              <p className='text-sm'>{`${color.brandKey as string} ${color.colorNumber as string}`}</p>
              <p className='font-bold'>{color.name}</p>
            </div>
            <div className='flex justify-between items-end absolute left-0 bottom-0 w-full p-2.5 focus:outline-none'>
              <button
                aria-label={filteredOutColumn !== undefined ? 'filterin' : 'filterout'}
                onClick={() => moveColor(color, filteredOutColumn)}
              >
                <FontAwesomeIcon icon={filteredOutColumn !== undefined ? faPlusCircle : faMinusCircle} />
              </button>
              {manuallyFilteredInColors.filter((colorObj) => colorObj.colorNumber === color.colorNumber).length > 0 && (
                <button aria-label='reset' className='text-xs opacity-90 mr-1' onClick={() => resetColor(color)}>
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
      />
    )
  }

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
        <span className={`${warning.length > 0 ? 'opacity-100' : 'opacity-0'} transition-opacity delay-500`}>
          {warning}
        </span>
      </div>
      <div className='flex flex-col md:flex-row pb-8'>
        <div aria-label='filteredout' className='w-full max-w-lg'>
          <ColorWall
            colorWallConfig={{ bloomEnabled: true }}
            shape={colorArrToGenericShape([...unfiltered, ...manuallyFilteredOutColors])}
            swatchRenderer={(defaultProps) => <SwatchRenderer {...defaultProps} filteredOutColumn />}
          />
          <p className='text-center margin-6 pt-3'>Filtered Out</p>
        </div>
        <div aria-label='filteredin' className='w-full max-w-lg'>
          <ColorWall
            colorWallConfig={{ bloomEnabled: true }}
            shape={colorArrToGenericShape([...filtered, ...manuallyFilteredInColors])}
            swatchRenderer={(defaultProps) => <SwatchRenderer {...defaultProps} />}
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
