// @flow
import React from 'react'

type PhIconProps = {
  classNames?: string
}

function PhUploadIcon(props: PhIconProps) {
  const { classNames } = props

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={classNames}
      width='192'
      height='192'
      fill='#000000'
      viewBox='0 0 256 256'
    >
      <rect width='256' height='256' fill='none'></rect>
      <polyline
        points='86 82 128 40 170 82'
        fill='none'
        stroke='#000000'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='12'
      ></polyline>
      <line
        x1='128'
        y1='152'
        x2='128'
        y2='40'
        fill='none'
        stroke='#000000'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='12'
      ></line>
      <path
        d='M216,152v56a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V152'
        fill='none'
        stroke='#000000'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='12'
      ></path>
    </svg>
  )
}

export default PhUploadIcon
