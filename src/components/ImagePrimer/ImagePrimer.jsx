// @flow
import React, { useEffect } from 'react'
import primeImage from '../../shared/utils/image/primeImage'

type ImagePrimerProps = {
  baseImageUrl: string,
  surface: string,
  handleImagesPrimed: Function
}

export default function ImagePrimer (props: ImagePrimerProps) {
  const { baseImageUrl, surface, handleImagesPrimed } = props
  useEffect(() => {
    // @todo this should be refactored to prime all surfaces _RS
    primeImage(baseImageUrl, surface, handleImagesPrimed)
  }, [])

  return <></>
}
