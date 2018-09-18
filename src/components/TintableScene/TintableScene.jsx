import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

class TintableScene extends PureComponent {
  constructor (props) {
    super(props)

    this.tintColor = 'hsl( 53.571428571428584, 38.35616438356164%, 28.627450980392155% )'
    this.secondaryTintColor = 'hsl(41.24999999999996, 34.782608695652165%, 90.98039215686275%)'
    this.fixtureHueRotation = 33
  }

  render () {
    let tintColor = this.tintColor
    if (this.props.color) {
      const { color } = this.props
      tintColor = color.cssrgb
    }

    return (
      <div className={'scene__room-wrapper scene__room-wrapper--bottom'} style={{ maxWidth: '900px', maxHeight: '600px' }}>
        <div className='scene__room__tinted-wrapper' style={{ backgroundColor: tintColor }}>
          <img className='scene__room scene__room--tinted' src='/src/images/room.jpg' alt='' />
        </div>
        <img className='scene__room scene__room--natural' src='/src/images/room.jpg' alt='' />
        <div className='scene__room__tinted-wrapper scene__room__tinted-wrapper--rear-wall' style={{ backgroundColor: this.secondaryTintColor }}>
          <img className='scene__room scene__room--tinted scene__room--rear-wall' src='/src/images/room.jpg' alt='' />
        </div>
        <div className='scene__room__tinted-wrapper scene__room__tinted-wrapper--fixtures' style={{ backgroundColor: this.secondaryTintColor }}>
          <img className='scene__room scene__room--hue-rotated' src='/src/images/room.jpg' alt='' style={{ filter: `hue-rotate(${this.fixtureHueRotation}deg)` }} />
        </div>
      </div>
    )
  }
}

TintableScene.propTypes = {
  color: PropTypes.object
}

const mapStateToProps = (state, props) => {
  const { selectedColor } = state.scenes

  return {
    color: selectedColor || null
  }
}

export default connect(mapStateToProps, null)(TintableScene)
