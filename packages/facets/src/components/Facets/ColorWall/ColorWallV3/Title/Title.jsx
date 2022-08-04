// @flow
import React from 'react'
import { BASE_SWATCH_SIZE, TITLE_SIZE_RATIOS, TITLE_SIZE_MAX, TITLE_SIZE_MIN } from '../constants'
import './Title.scss'

const titleClass = 'cwv3__title'

export function getHeight (level: number = 1, scale: number = 1): number {
  const sizeMultiplier = TITLE_SIZE_RATIOS[level]
  const targetSize = BASE_SWATCH_SIZE * scale * sizeMultiplier
  const minSize = Math.max(TITLE_SIZE_MIN, targetSize)
  const maxSize = Math.min(TITLE_SIZE_MAX, minSize)
  return maxSize
}

export function getOuterHeight (level: number = 1, scale: number = 1): number {
  return getHeight(level, scale) * 2.5
}

export function getOuterHeightAll (levels: number[] = [], scale: number = 1): number {
  return levels.reduce((prev, next) => prev + getOuterHeight(next, scale), 0)
}

type TitleProps = {
  data: any,
  referenceScale: number
}

function Title ({ data = {}, referenceScale }: TitleProps) {
  const { value, level } = data
  const size = getHeight(level, referenceScale)
  const containerSize = getOuterHeight(level, referenceScale)

  return (
    value
      ? (
      <div className={`${titleClass} ${titleClass}--lvl${level}`} style={{ fontSize: `${size}px`, height: `${containerSize}px` }}>
        {value}
      </div>
        )
      : null
  )
}

const titlesClass = 'cwv3__titles'

type TitlesProps = {
  data: any,
  referenceScale: number
}

function Titles ({ data = [], referenceScale }: TitlesProps) {
  return <>
    <div className={titlesClass}>
      {data.map((title, i) => <Title key={i} data={title} referenceScale={referenceScale} />)}
    </div>
  </>
}

export default Titles
