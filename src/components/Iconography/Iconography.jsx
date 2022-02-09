// @flow
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Iconography.scss'

type IconographyProps = {
  index?: number,
  name?: string,
  style?: { [key: string]: string }
}

const Iconography = ({ name, index, style }: IconographyProps) => {
  const icons = {
    arrowLeft: (
      <div style={style}>
        <svg width='40' height='42' viewBox='8 6 40 42' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path fillRule='evenodd' clipRule='evenodd' d='M12.8972 24.2917H48.5946V28.7083H12.845L25.2325 41.0959L22.1095 44.2189L4.41666 26.5261L22.1095 8.83334L25.2325 11.9564L12.8972 24.2917Z' fill='#060F20' />
        </svg>
      </div>
    ),
    colorDetails: (
      <div className={'iconography iconography--color-details-icon'} style={style}>
        <FontAwesomeIcon icon={['fas', 'info']} />
      </div>
    ),
    grabReorder: (
      <svg>
        <line strokeWidth='1px' x1={18} y1='0' x2='0' y2={18} />
        <line strokeWidth='1px' x1={18} y1={Math.floor(18 / 3)} x2={Math.floor(18 / 3)} y2={18} />
        <line strokeWidth='1px' x1={18} y1={2 * Math.floor(18 / 3)} x2={2 * Math.floor(18 / 3)} y2={18} />
      </svg>
    ),
    moreScenes: (
      <div className='iconography' style={style}>
        <FontAwesomeIcon className='scene-selector-nav-btn__icon-1' icon={['fal', 'square-full']} size='sm' />
        <FontAwesomeIcon className='scene-selector-nav-btn__icon-2' icon={['fal', 'square-full']} size='sm' />
        <FontAwesomeIcon className='scene-selector-nav-btn__icon-3' icon={['fal', 'square-full']} size='sm' />
      </div>
    ),
    paintScene: (
      <div className='iconography iconography--paint-scene-icon' style={style}>
        <div>
          <FontAwesomeIcon icon={['fal', 'square-full']} />
          <FontAwesomeIcon icon={['fa', 'brush']} transform={{ rotate: 320 }} style={{ transform: 'translateX(-10px)' }} />
        </div>
      </div>
    ),
    undo: index === 0 && <FontAwesomeIcon className='iconography--undo' key='icon-0' icon={['fa', 'undo-alt']} size='lg' />
  }

  return name ? icons[name] : null
}

export default Iconography
