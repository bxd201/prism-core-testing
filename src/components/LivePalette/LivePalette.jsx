/* eslint-disable react/self-closing-comp */

// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

// import { varValues, varNames } from '../../shared/variables'

import LivePaletteSlot from './LivePaletteSlot'

import './LivePalette.scss'

type Props = {
  colors: Array
}

class LivePalette extends PureComponent<Props> {
  render () {
    const lpSlots = this.props.colors.map(color => {
      return <LivePaletteSlot key={color.id} color={color} />
    })
    if (lpSlots.length < 7) {
      const additionalSlots = 7 - lpSlots.length

      for (let i = 0; i < additionalSlots; i++) {
        lpSlots.push((<LivePaletteSlot key={i} />))
      }
    }

    return (
      <div className='prism-live-palette'>
        <div className='prism-live-palette__list'>
          <button className='prism-live-palette__slot prism-live-palette__slot--add'>
            <FontAwesomeIcon icon='plus-circle' size='2x' color='#2c97de' />
            <span className='prism-live-palette__slot__copy'>
              <FormattedMessage id='ADD_A_COLOR' />
            </span>
          </button>
          {lpSlots}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { lp } = state

  return {
    colors: lp
  }
}

export default connect(mapStateToProps, null)(LivePalette)
