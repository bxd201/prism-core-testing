// @flow
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { Carousel as ToolkitCarousel } from '@prism/toolkit'
import ConfigurationContext, {
  type ConfigurationContextType
} from '../../contexts/ConfigurationContext/ConfigurationContext'
import Iconography from '../Iconography/Iconography'
import { withPrism } from '../ToolkitComponents'

const Carousel = (props) => {
  const { formatMessage } = useIntl()
  const { cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { carouselBtn = {} } = cvw

  const leftButton = {
    icon: carouselBtn.iconLeft && <Iconography name={carouselBtn?.iconLeft} style={{ height: '.95rem' }} />,
    label: formatMessage({ id: 'PREVIOUS' })
  }
  const rightButton = {
    icon: carouselBtn.iconRight && <Iconography name={carouselBtn?.iconRight} style={{ height: '.95rem' }} />,
    label: formatMessage({ id: 'NEXT' })
  }

  return <ToolkitCarousel leftButton={leftButton} rightButton={rightButton} {...props} />
}

export default withPrism(Carousel)
