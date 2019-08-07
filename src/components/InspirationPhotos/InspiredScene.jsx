// @flow
import React from 'react'
import ListWithCarousel from '../Carousel/Carousel'
import ColorsFromImage from './ColorsFromImage'

type InspiredProps = {
    data: Object,
    isActivedPage: boolean,
    isRenderingPage: boolean
}

export const InspiredScene = (props: InspiredProps) => {
  const { isActivedPage, isRenderingPage, data } = props
  return (
    <div className='scene__image__wrapper'>
      {isRenderingPage && <ColorsFromImage isActivedPage={isActivedPage} data={data} />}
    </div>
  )
}

export default ListWithCarousel(InspiredScene)
