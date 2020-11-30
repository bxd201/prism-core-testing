// @flow
import React from 'react'
import ColorsFromImage from './ColorsFromImage'

type InspiredProps = { data: Object, isActivedPage: boolean }

export default ({ isActivedPage, data }: InspiredProps) => {
  return (
    <div className='scene__image__wrapper'>
      <ColorsFromImage isActivedPage={isActivedPage} data={data} />
    </div>
  )
}
