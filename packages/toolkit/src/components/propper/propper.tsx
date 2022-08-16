import React, { ReactNode } from 'react'

export interface PropperProps {
  children: ReactNode
  propSize?: string
  vPosition?: ProperPosition
}

const TEST_ID = 'Propper'
const TEST_ID_INNER = `${TEST_ID}__prop`
const TEST_ID_CONTENT = `${TEST_ID}__content`

function Propper({ children, propSize = '100%', vPosition }: PropperProps): JSX.Element {
  return (
    <div data-testid={TEST_ID} className='w-100 flex flex-row items-stretch justify-center'>
      <div data-testid={TEST_ID_INNER} className='' style={{ paddingTop: propSize }} />
      <div data-testid={TEST_ID_CONTENT} className={`'relative w-100' ${vPosition ?? ''}`}>
        {children}
      </div>
    </div>
  )
}

export enum ProperPosition {
  'BOTTOM' = 'justify-end',
  'CENTER' = 'self-center',
  'TOP' = 'self-start'
}

export default Propper
