/* istanbul ignore file */
import React from 'react'
import './styles-protected.css'
import PrismOriginal, { PrismProps } from './index-shared'
export * from './index-shared'

const Prism = ({ children, className, ...other }: PrismProps): JSX.Element => (
  // IMPORTANT: protection classname applied here must match the one applied
  // in styles-protected.css and tailwind.config.protected.js
  <PrismOriginal className={`p3m-p7d ${className ?? ''}`} {...other}>
    {children}
  </PrismOriginal>
)

export default Prism
