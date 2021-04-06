// @flow
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { Menu, MenuItem, Wrapper, Button } from 'react-aria-menubutton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const MinimalToolbar = () => {
//   const { sections = [], families = [], section: activeSection, family: activeFamily, primeColorWall } = useSelector(state => state.colors)
  const { families = [] } = useSelector(state => state.colors)
  const [searchValue, setSearchValue] = useState()

  console.log(families)
  return (
    <div style={{ display: 'flex', width: '100%', height: '50px' }}>
      <input type='text' placeholder='Search for a color' onChange={e => setSearchValue(e.target.value)} />
      {/* family selector */}
      <Wrapper onSelection={e => console.log(e)}>
        <Button style={{ height: '100%' }}>
          {'Explore color families'}
          <FontAwesomeIcon icon={['fa', 'angle-down']} pull='right' />
        </Button>
        <Menu style={{ postion: 'absolute', top: '50px' }}>
          {families.map((name: string) => (
            <MenuItem key={name} text={name} value={name}>
              <NavLink to=''>{name}</NavLink>
            </MenuItem>
          ))}
        </Menu>
      </Wrapper>
    </div>
  )
}

export default MinimalToolbar
