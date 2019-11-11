// @flow
/* global CustomEvent */
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import at from 'lodash/at'

export const getStoreValues = (store: Object): Object => {
  return {
    chosenColor: at(store, 'colors.chosenColor')[0],
    colorWallActive: at(store, 'colors.colorWallActive')[0],
    emitColor: at(store, 'colors.emitColor')[0],
    family: at(store, 'colors.family')[0],
    query: at(store, 'colors.search.query')[0],
    section: at(store, 'colors.section')[0]
  }
}

// TODO: hydrate EVENT_NAME_PREFIX w/ config value for customizable event catching
export const EVENT_NAME_PREFIX = 'swPrism.broadcastChange'

export type Props = {
  id?: string,
  className?: string,
  store: {
    chosenColor?: any,
    emitColor?: any,
    colorWallActive?: any,
    family?: any,
    section?: any,
    query?: any
  }
}

const defaultProps: Props = {
  store: {}
}

export class EnvAdapter extends PureComponent<Props> {
  ref: ?RefObject = void (0)

  static defaultProps: Props = defaultProps

  constructor (props: Props) {
    super()

    this.ref = React.createRef()
    this.emit(props)
  }

  render () {
    const { id, className } = this.props

    return (
      <script id={id} className={className} ref={this.ref} />
    )
  }

  componentDidUpdate (prevProps: Props) {
    this.emit(this.props, prevProps)
  }

  emit = (is: Props, was: Props = defaultProps) => {
    const { store: prevStore } = was
    const { store } = is

    if (store && prevStore) {
      const keys = Object.keys(store)

      keys.forEach(key => {
        if (store[key] !== prevStore[key]) {
          const event = new CustomEvent(`${EVENT_NAME_PREFIX}.${key}`, {
            bubbles: true,
            detail: store[key]
          })

          if (this.ref && this.ref.current) {
            this.ref.current.dispatchEvent(event)
          }
        }
      })
    }
  }
}

const mapStateToProps = (state, props) => {
  return {
    // the "store" prop relates to data in redux
    store: getStoreValues(state)
  }
}

export default connect(mapStateToProps)(EnvAdapter)
