import React from 'react'
import { getHeight, getOuterHeight } from './wall-utils'
import { TitleShape } from './types'

interface TitleProps {
  data: TitleShape
  referenceScale: number
}

function Title({ data, referenceScale }: TitleProps): JSX.Element {
  const { value, level } = data
  const size = getHeight(level, referenceScale)
  const containerSize = getOuterHeight(level, referenceScale)
  const titleClass = `w-full text-black opacity-80 overflow-hidden break-words leading-4 tracking-tighter ${
    level > 1 ? 'font-bold' : ''
  }`

  return value ? (
    <div
      className={titleClass}
      data-testid='wall-title'
      style={{
        fontSize: `${size}px`,
        height: `${containerSize}px`
      }}
    >
      {value}
    </div>
  ) : null
}

interface TitlesProps {
  data: any
  referenceScale: number
}

function Titles({ data = [], referenceScale }: TitlesProps): JSX.Element {
  return (
    <>
      <div>
        {data.map((title, i) => (
          <Title key={i} data={title} referenceScale={referenceScale} />
        ))}
      </div>
    </>
  )
}

export default Titles
