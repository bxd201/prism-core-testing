// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'
import withUniqueId from '../../../shared/HOCs/withUniqueId'
import './ColorDetailsCTAs.scss'

export type ColorDetailsCTAData = {
  text: string,
  link: string,
  attributes: {
    [key: string]: string
  }
}

const ColorDetailsCTABtn = function ColorDetailsCTABtn ({ text, link, attributes = {} }: ColorDetailsCTAData) {
  return <a className='ColorDetailsCTAs__cta' href={link} {...attributes}>{text}</a>
}

type ColorDetailsCTAsProps = {
  data: ColorDetailsCTAData[],
  className?: string
}

export const ColorDetailsCTAs = withUniqueId(function ColorDetailsCTAs ({ data, uid, className = '' }: ColorDetailsCTAsProps) {
  return (
    <section tabIndex={0} className={`ColorDetailsCTAs ${className}`} aria-labelledby={uid}>
      <h2 className='ColorDetailsCTAs__title' id={uid}><FormattedMessage id='COLOR_DETAILS_CALL_TO_ACTION_HEADING' /></h2>
      <ul className='ColorDetailsCTAs__list'>
        {data.map((btnData, i) => <li key={i}><ColorDetailsCTABtn {...btnData} /></li>)}
      </ul>
    </section>
  )
})
