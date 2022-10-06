import React from 'react'
import { omitPrefix } from '../../utils/tool-bar-utils'
import ButtonBar from './button-bar'

interface ColorFamilyMenuBtnsProps {
  showAll?: boolean
  section: string
  families: string[]
  onClick?: (args: any) => void
  activeFamily?: string
}

const ColorFamilyMenuBtns = ({
  showAll = false,
  families = [],
  onClick,
  activeFamily
}: ColorFamilyMenuBtnsProps): JSX.Element => {
  if (families.length) {
    return (
      <>
        {showAll ? (
          <ButtonBar.Button
            isActive={null}
            style={{
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <span>All</span>
          </ButtonBar.Button>
        ) : null}
        {families.map((name) => (
          <ButtonBar.Button
            key={name}
            onClick={() => onClick(name)} // GA event
            style={{
              justifyContent: 'center',
              width: '100%'
            }}
            isActive={name === activeFamily}
          >
            <span>{omitPrefix(name)}</span>
          </ButtonBar.Button>
        ))}
      </>
    )
  }

  return null
}

export default ColorFamilyMenuBtns
