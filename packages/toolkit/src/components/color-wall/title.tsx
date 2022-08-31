import React from 'react'
import { getTitleFontSize, getTitleContainerSize } from './wall-utils'
import { TitleShape } from './types'

interface TitleProps {
  data: TitleShape
  referenceScale: number,
  semanticLevel: number
}

function QuickHeading(lvl = 1, props = {}, content): JSX.Element {
  switch (lvl) {
    case 1:
      return <h1 {...props}>{content}</h1>
    case 2:
      return <h2 {...props}>{content}</h2>
    case 3:
      return <h3 {...props}>{content}</h3>
    case 4:
      return <h4 {...props}>{content}</h4>
    case 5:
      return <h5 {...props}>{content}</h5>
    case 6:
    default:
      return <h6 {...props}>{content}</h6>
  }
}

function Title({ data, referenceScale, semanticLevel }: TitleProps): JSX.Element {
  const { value, level } = data
  const size = getTitleFontSize(level, referenceScale, true)
  const containerSize = getTitleContainerSize(level, referenceScale)
  const titleClass = `w-full text-black opacity-80 overflow-hidden break-words leading-none tracking-tighter ${
    level > 1 ? 'font-bold' : ''
  }`

  return value ? (
    QuickHeading(
      semanticLevel, {
        'className': `${titleClass} flex flex-col cursor-default`,
        'data-testid': 'wall-title',
        'title': value,
        'style': {
          fontSize: `${size}px`,
          height: `${containerSize}px`
        },
      },
      <div className='mt-auto mb-em-1'>{value}</div>
    )
  ) : null
}

interface TitlesProps {
  data: any
  referenceScale: number
}

function Titles({ data = [], referenceScale }: TitlesProps): JSX.Element {
  return (
    <hgroup>
      {data.map((title, i) => (
        <Title key={i} data={title} referenceScale={referenceScale} semanticLevel={Math.min(+i + 1, 6)} />
      ))}
    </hgroup>
  )
}

export default Titles
