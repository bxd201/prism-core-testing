// @flow
import React, { useState, Dispatch, SetStateAction } from 'react'
import type { Color } from '../shared/types/Colors.js.flow'

type CompareColorCarousel = {
  pointer: number,
  isHidePrevButton: boolean,
  isHideNextButton: boolean
}

type UseCompareColorObj = {
  carousel: CompareColorCarousel,
  setCarousel: Dispatch<SetStateAction<CompareColorCarousel>>,
  setPointer: () => void,
  updateSlideButtons: () => void,
  handlePrev: () => void,
  handleNext: () => void
}

type UseCompareColorProps = {
  colorIds: string[],
  colors: Color[]
}

const useCompareColor = ({ colorIds, colors }: UseCompareColorProps): UseCompareColorObj => {
  const defaultViewItem = 3
  const offset = 1

  const [carousel, setCarousel] = useState<CompareColorCarousel>({
    pointer: 0,
    isHidePrevButton: true,
    isHideNextButton: true
  })

  const itemsCount = colors.length

  const updateSlideButtons = () => {
    let isHidePrevButton = true
    let isHideNextButton = true

    if (carousel.pointer === 0) {
      isHidePrevButton = true
    } else {
      isHidePrevButton = false
    }

    if (itemsCount > defaultViewItem && carousel.pointer < itemsCount - defaultViewItem) {
      isHideNextButton = false
    }

    if (carousel.pointer === itemsCount - defaultViewItem - offset / 2) {
      isHideNextButton = true
    }

    setCarousel((state) => ({ ...state, isHidePrevButton, isHideNextButton }))
  }

  const setPointer = () => {
    let currPointer = carousel.pointer

    if (colors.length <= defaultViewItem || currPointer === 0) {
      currPointer = 0
    } else {
      currPointer = currPointer - offset
    }

    if (colors.length - 1 <= defaultViewItem) {
      currPointer = 0
    }

    setCarousel((state) => ({ ...state, pointer: currPointer }))
  }

  const handlePrev = () => {
    if (itemsCount > defaultViewItem) {
      if (carousel.pointer === offset / 2) {
        setCarousel((state) => ({ ...state, pointer: state.pointer - offset / 2 }))
      } else {
        setCarousel((state) => ({ ...state, pointer: state.pointer - offset }))
      }
    }
  }

  const handleNext = () => {
    if (itemsCount > defaultViewItem) {
      if (carousel.pointer === itemsCount - defaultViewItem - 1) {
        setCarousel((state) => ({ ...state, pointer: state.pointer + offset / 2 }))
      } else {
        setCarousel((state) => ({ ...state, pointer: state.pointer + offset }))
      }
    }
  }

  return {
    carousel,
    setCarousel,
    setPointer,
    updateSlideButtons,
    handlePrev,
    handleNext
  }
}

export default useCompareColor
