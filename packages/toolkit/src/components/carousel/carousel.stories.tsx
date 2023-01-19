import React from 'react'
import Carousel, { CarouselProps } from './carousel'

const COLORS = ['#ccc', '#999', '#666']

const BaseComponent = ({ itemNumber }: { itemNumber: number }): JSX.Element => {
  const color = COLORS[itemNumber % 3]
  return (
    <div key={itemNumber} style={{ background: color, width: '100%', height: '400px' }}>
      Slide #{itemNumber + 1}
    </div>
  )
}

const Template = (args: CarouselProps): JSX.Element => {
  return <Carousel {...args} BaseComponent={BaseComponent} data={new Array(5).fill({})} defaultItemsPerView={1} />
}

export const Default = Template.bind({})
Default.args = { isInfinity: false, pagerPosition: 'center', showPageIndicators: false }

export default {
  title: 'Components/Carousel',
  component: Carousel,
  argTypes: {
    isInfinity: { control: 'boolean' },
    pagerPosition: { control: 'inline-radio', options: ['bottom', 'center', 'top'] },
    showPageIndicators: { control: 'boolean' }
  }
}
