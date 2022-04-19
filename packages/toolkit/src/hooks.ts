import { useState, useEffect, RefObject } from 'react'

/**
 * @returns width and height of the window
 */
export const useWindowSize = (): { width: number; height: number } => {
  const [size, setSize] = useState({ width: undefined, height: undefined })

  useEffect(() => {
    const updateSize = (): void => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}

/**
 * @param {{ current: ?HTMLElement }} containerRef a reference to the element that's size is being tracked
 * @returns the width and height of a specific container
 */
export const useContainerSize = (containerRef: RefObject<HTMLElement>): { width: number; height: number } => {
  const [size, setSize] = useState({
    width: containerRef.current?.offsetWidth,
    height: containerRef.current?.offsetHeight
  })
  const { width, height } = useWindowSize()

  useEffect(
    () => setSize({ width: containerRef.current?.offsetWidth, height: containerRef.current?.offsetHeight }),
    [containerRef.current?.offsetWidth, containerRef.current?.offsetHeight, width, height]
  )

  return size
}
