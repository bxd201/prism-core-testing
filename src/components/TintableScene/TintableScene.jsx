import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const RoomWrapper = styled.div`
  position: relative;
  width: 100%;
  width: 100%;
  height: 600px;
  margin-top: 1em;
  margin-bottom: 1em;
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
  transition: 0.2s;
  -webkit-transition: 0.2s;
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
  -webkit-mask-image: url( '${props => props.maskSrc}' );
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
          <TintedScene src={`./images/scenes/${this.props.scene}.jpg`} alt='' />
        </SceneWrapper>
        <NaturalTintedScene src={`./images/scenes/${this.props.scene}.jpg`} maskSrc={`./images/scenes/${this.props.scene}-mask.png`} alt='' />
      </RoomWrapper>
    )
  }
}

TintableScene.propTypes = {
  color: PropTypes.object,
  scene: PropTypes.string
}

const mapStateToProps = (state, props) => {
  const { selectedColor, scene } = state.scenes

  // return {
  //   color: selectedColor || null
  // }
  return {
    color: selectedColor || null,
    scene: scene || 'room'
  }
}

export default connect(mapStateToProps, null)(TintableScene)
