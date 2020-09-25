// @flow
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { toolNames } from './data'
import { getCanvasWrapperOffset } from './utils'
type ComponentProps = {
    activeTool: string,
    paintBrushActiveClass: string,
    paintBrushCircleActiveClass: string,
    eraseBrushActiveClass: string,
    eraseBrushCircleActiveClass: string,
    paintBrushWidth: string,
    canvasRef: object,
    eraseBrushWidth: string,
    lpActiveColorRGB: string,
    dragStartHandler: Function,
    mouseDownHandler: Function,
    position: object
}

const baseClass = 'paint__scene__wrapper'
const paintBrushClass = `${baseClass}__paint-brush`

export const BrushPaintCursor = forwardRef((props: ComponentProps, ref) => {
  const [position, setPosition] = useState(props.position)
  const { activeTool, lpActiveColorRGB, dragStartHandler, mouseDownHandler, paintBrushActiveClass,
    paintBrushCircleActiveClass, eraseBrushActiveClass, eraseBrushCircleActiveClass,
    paintBrushWidth, eraseBrushWidth, canvasRef } = props
  const backgroundColorBrush = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 0.7)` : lpActiveColorRGB

  useImperativeHandle(ref, () => ({
    handleMouseMove (clientX, clientY) {
      const canvasWrapperOffset = getCanvasWrapperOffset(canvasRef)
      const paintBrushHalfWidth = (activeTool === toolNames.PAINTBRUSH) ? paintBrushWidth / 2 : eraseBrushWidth / 2
      const leftOffset = clientX - canvasWrapperOffset.x - paintBrushHalfWidth
      const topOffset = clientY - canvasWrapperOffset.y - paintBrushHalfWidth
      setPosition({ left: leftOffset, top: topOffset })
    }
  }))

  return (
    <div
      className={`${paintBrushClass} ${activeTool === toolNames.PAINTBRUSH ? `${paintBrushActiveClass} ${paintBrushCircleActiveClass}` : activeTool === toolNames.ERASE ? `${eraseBrushActiveClass} ${eraseBrushCircleActiveClass}` : ``}`}
      role='presentation'
      draggable
      onDragStart={dragStartHandler}
      onMouseDown={mouseDownHandler}
      style={{ backgroundColor: backgroundColorBrush, top: position.top, left: position.left }}
    />
  )
})
