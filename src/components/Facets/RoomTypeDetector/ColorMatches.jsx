// @flow
import React, { type Node, type ChildrenArray, Children } from 'react'

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
        : <p>No suitable colors found.</p>
      }
    </section>
  )
}

export default ColorMatches
