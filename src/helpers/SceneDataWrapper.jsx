// @flow
import React from 'react'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'

import { loadScenes } from '../actions/scenes'
// import type { ColorPayload } from '../shared/types/Colors'

type Props = {
  scenes: any,
  loadScenes: Function,
  numScenes: number,
  loadingScenes: boolean
}

/**
 * HOC for ensuring color data is loaded before rendering the component
 * @param {component} WrappedComponent
 */
const SceneDataWrapper = (WrappedComponent: any) => {
  class SceneData extends React.PureComponent<Props> {
    componentDidMount () {
      if (isEmpty(this.props.scenes)) {
        this.props.loadScenes()
      }
    }

    render () {
      return <WrappedComponent {...this.props} />
    }
  }

  const mapStateToProps = (state, props) => {
    return {
      scenes: state.scenes.scenes,
      numScenes: state.scenes.numScenes,
      loadingScenes: state.scenes.loadingScenes
    }
  }

  const mapDispatchToProps = (dispatch: Function) => {
    return {
      loadScenes: () => {
        dispatch(loadScenes())
      }
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(SceneData)
}

export default SceneDataWrapper
