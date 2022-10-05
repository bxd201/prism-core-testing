// @flow
import React, { type ChildrenArray, type Node, Children } from 'react'
import { FormattedMessage } from 'react-intl'
import './ColorMatches.scss'

type ColorMatchWrapperProps = {
  children?: ChildrenArray<Node>,
  title: string
}

const ColorMatches = ({ children, title }: ColorMatchWrapperProps) => {
  return (
    <section className='ColorMatches'>
      <h1 className='ColorMatches__title'>{title}</h1>
      {Children.count(children)
        ? children
        : <p><FormattedMessage id='NO_COLORS_FOUND' /></p>
      }
    </section>
  )
}

export default ColorMatches
