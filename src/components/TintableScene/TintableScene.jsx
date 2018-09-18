import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const RoomWrapper = styled.div`
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
  max-width: 900px;
  max-height: 600px;
`
const SceneWrapper = styled.div`
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
  background-color: ${props => props.color ? props.color.cssrgb : ''};
`
const BaseScene = styled.img`
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
`
const TintedScene = styled(BaseScene)`
  object-fit: cover;
  filter: grayscale(100);
  mix-blend-mode: multiply; 
`
const NaturalTintedScene = styled(BaseScene)`
  object-fit: cover;
  -webkit-mask-image: url( '/src/images/room-mask.png' );
  -webkit-mask-size: cover;
  -webkit-mask-position: 50% 50%;
  mask-size: cover;
  transition: opacity 0.9s;
  opacity: 1;
`

class TintableScene extends PureComponent {
  render () {
    return (
      <RoomWrapper>
        <SceneWrapper color={this.props.color}>
          <TintedScene src='/src/images/room.jpg' alt='' />
        </SceneWrapper>
        <NaturalTintedScene src='/src/images/room.jpg' alt='' />
      </RoomWrapper>
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
