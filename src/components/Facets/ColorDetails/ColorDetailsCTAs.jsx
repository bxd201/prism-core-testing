/* eslint-disable */
// @flow
import React from 'react'
import './ColorDetailsCTAs.scss'

export type ColorDetailsCTAData = {
  text: string,
  link: string,
  attributes: {
    [key: string]: string
  }
}

const ColorDetailsCTABtn = function ColorDetailsCTABtn ({ text, link, attributes = {} }: ColorDetailsCTAData) {
  return <a href={link} {...attributes}>{text}</a>
}

type ColorDetailsCTAsProps = {
  data: ColorDetailsCTAData[],
  className?: string
}

export const ColorDetailsCTAs = function ColorDetailsCTAs ({ data, className = '' }: ColorDetailsCTAsProps) {
  return null

  // return (
  //   <div className={`ColorDetailsCTAs ${className}`}>
  //     Like this color? Buy a product below
  //     <ul>
  //       {data.map((btnData, i) => <li key={i}><ColorDetailsCTABtn {...btnData} /></li>)}
  //     </ul>
  //   </div>
  // )
}
