import React from 'react'
import Carousel, { CarouselProps } from './carousel'

const COLORS = ['#ccc', '#999', '#666']

const BaseComponent = ({ itemNumber }): JSX.Element => {
  const color = COLORS[itemNumber % 3]
  return (
    <div key={itemNumber} style={{ background: color, width: '100%', height: '400px' }}>
      Slide #{(itemNumber as number) + 1}
    </div>
  )
}

const Template = ({ showPageIndicators, isInfinity, ...rest }: CarouselProps): JSX.Element => {
  return (
    <Carousel
      showPageIndicators={showPageIndicators}
      BaseComponent={BaseComponent}
      data={new Array(5).fill({})}
      defaultItemsPerView={1}
      isInfinity={isInfinity}
      {...rest}
    />
  )
}

export const Default = Template.bind({})
Default.args = {}

export default {
  title: 'Components/Carousel',
  component: Carousel,
  argTypes: {
    showPageIndicators: { control: 'boolean' },
    isInfinity: { control: 'boolean' }
  }
}
