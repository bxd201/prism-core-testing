import React, {useEffect, useMemo,useRef} from 'react'
import {Color} from "../../types";
import { ActiveSwatchContentRenderer, SwatchBgRenderer, SwatchRenderer } from "./types";

interface BloomStyles {
  active: string,
  inactive: string
  perimeter: Record<string, string>,
}

const bloomScalingFactor = [3, 2.36, 2.08, 1.74, 1.41]

const bloomStyles: Record<string, BloomStyles> = {
  fg: {
    active: 'left-1/2 top-1/2 -translate-x-2/4 -translate-y-2/4 absolute w-full h-full',
    perimeter: {
      1: `left-1/2 top-1/2 -translate-x-2/4 -translate-y-2/4 absolute w-full h-full`,
      2: `left-1/2 top-1/2 -translate-x-2/4 -translate-y-2/4 absolute w-full h-full`,
      3: `left-1/2 top-1/2 -translate-x-2/4 -translate-y-2/4 absolute w-full h-full`,
      4: `left-1/2 top-1/2 -translate-x-2/4 -translate-y-2/4 absolute w-full h-full`
    },
    inactive: 'absolute w-full h-full'
  },
  bg: {
    active: `scale-[3] duration-100 ease-linear inset-0 absolute`,
    perimeter: {
      1: `scale-[2.36] duration-100 ease-linear inset-0 absolute transition-transform`,
      2: `scale-[2.08] duration-100 ease-linear inset-0 absolute transition-transform`,
      3: `scale-[1.74] duration-100 ease-linear inset-0 absolute transition-transform`,
      4: `scale-[1.41] duration-100 ease-linear inset-0 absolute transition-transform`
    },
    inactive: 'absolute inset-0'
  },
  whole: {
    active: 'z-[1001]',
    perimeter: {
      1: 'z-[958]',
      2: 'z-[957]',
      3: 'z-[956]',
      4: 'z-[955]'
    },
    inactive: 'z-[0] focus-within:z-[10]'
  }
}

export interface SwatchTypes {
  active?: boolean
  animateActivation?: boolean
  backgroundRenderer: SwatchBgRenderer
  color: Color
  foregroundRenderer: SwatchRenderer
  activeSwatchContentRenderer?: ActiveSwatchContentRenderer
  height: number
  id: number | string
  handleMakeActive: () => void
  perimeterLevel?: number
  setRefs: (swatches: Element[]) => void // accepts array of refs, with each ref.current pointing to a DOM element (button, ideally)
  width: number
}

const Swatch = (props: SwatchTypes): JSX.Element => {
  const { id, active, animateActivation, activeSwatchContentRenderer, foregroundRenderer, backgroundRenderer, width, height, color, setRefs, handleMakeActive, perimeterLevel } = props
  const swatchOuterRef = useRef()

  useEffect(() => {
    setRefs(getKeyboardFocusableElements(swatchOuterRef.current))
  }, [active])

  const scaling = active ? bloomScalingFactor[0] : perimeterLevel > 0 ? bloomScalingFactor[perimeterLevel] : 1

  const {bg: internalPropsBg, fg: internalPropsFg} = useMemo(() => {
    const fgStyles: string = active
      ? bloomStyles.fg.active
      : perimeterLevel > 0
        ? bloomStyles.fg.perimeter[perimeterLevel]
        : bloomStyles.fg.inactive

    const bgStyles: string = active
      ? bloomStyles.bg.active
      : perimeterLevel > 0
        ? bloomStyles.bg.perimeter[perimeterLevel]
        : bloomStyles.bg.inactive

    const internalPropsShared = {
      active,
      activeHeight: scaling ? height * scaling : height,
      activeWidth: scaling ? width * scaling : width,
      color,
      height: height,
      lifted: (active || perimeterLevel > 0),
      id,
      width: width
    }

    return {
      bg: {
        ...internalPropsShared,
        className: `${bgStyles} ${animateActivation ? '' : '!transition-none'}`,
        style: {},
      },
      fg: {
        ...internalPropsShared,
        activeSwatchContentRenderer,
        className: fgStyles,
        handleMakeActive, // only foreground renderer should receive click handler
        style: {
          width: internalPropsShared.activeWidth,
          height: internalPropsShared.activeHeight
        },
      }
    }


  }, [active, animateActivation, id, color, width, height, perimeterLevel])

  const wholeStyles: string = active
    ? bloomStyles.whole.active
    : perimeterLevel > 0
      ? bloomStyles.whole.perimeter[perimeterLevel]
      : bloomStyles.whole.inactive

  return <div
    ref={swatchOuterRef}
    data-test-id='color-wall-swatch'
    className={`relative ${wholeStyles}`}
    style={{ width: width, height: height }}>
    {backgroundRenderer(internalPropsBg)}
    {foregroundRenderer(internalPropsFg)}
  </div>
}

function getKeyboardFocusableElements (element: Document | Element = document): Element[] {
  return Array.from(element.querySelectorAll(
    'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex=\'-1\'])'
  )).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))
}

export default Swatch
