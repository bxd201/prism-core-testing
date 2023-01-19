import React, { HTMLAttributes, useContext } from 'react'
import { ColorWallPropsContext, ColorWallStructuralPropsContext } from './color-wall-props-context'
import { TitleShape } from './types'
import { getTitleContainerSize, getTitleFontSize } from './wall-utils'

interface TitleProps {
  data: TitleShape
  semanticLevel: number
}

function Title({ data, semanticLevel }: TitleProps): JSX.Element {
  const { value, level, hideWhenWrapped } = data
  const { colorWallConfig } = useContext(ColorWallPropsContext)
  const { scale, isWrapped } = useContext(ColorWallStructuralPropsContext)
  const size = getTitleFontSize(level, scale, true)
  const containerSize = getTitleContainerSize(level, scale)
  const titleClass = `w-full text-black opacity-80 overflow-hidden break-words leading-none tracking-tighter ${
    level > 1 ? 'font-bold' : ''
  }`

  return (!isWrapped || (!hideWhenWrapped && isWrapped)) && value
    ? QuickHeading(
        semanticLevel,
        {
          className: `${titleClass} flex flex-col cursor-default`,
          'data-testid': 'wall-title',
          title: value,
          style: {
            fontSize: `${size}px`,
            height: `${containerSize}px`
          }
        },
        <div className={`mt-auto ${colorWallConfig?.titleImage ? 'mb-px' : 'mb-em-1'}`}>{value}</div>
      )
    : null
}

interface TitlesProps {
  data: TitleShape[]
}

function Titles({ data = [] }: TitlesProps): JSX.Element {
  return (
    <hgroup>
      {data.map((title, i) => (
        <Title key={i} data={title} semanticLevel={Math.min(+i + 1, 6)} />
      ))}
    </hgroup>
  )
}

export default Titles

type QuickHeadingProps = {
  'data-testid'?: string
} & HTMLAttributes<HTMLElement>

function QuickHeading(lvl: number = 1, props: QuickHeadingProps, content: JSX.Element): JSX.Element {
  const { className, ...otherProps } = props

  const newProps = {
    className: `p-0 ${className ?? ''}`,
    ...otherProps
  }

  switch (lvl) {
    case 1:
      return <h1 {...newProps}>{content}</h1>
    case 2:
      return <h2 {...newProps}>{content}</h2>
    case 3:
      return <h3 {...newProps}>{content}</h3>
    case 4:
      return <h4 {...newProps}>{content}</h4>
    case 5:
      return <h5 {...newProps}>{content}</h5>
    case 6:
    default:
      return <h6 {...newProps}>{content}</h6>
  }
}
