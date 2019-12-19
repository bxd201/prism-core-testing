// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'
import memoize from 'lodash/memoize'

import './ErrorBoundary.scss'

const tryToGetMessage = memoize((trans: boolean) => (id: string) => {
  if (trans) {
    return <FormattedMessage id={id} />
  }

  return id
})

type Props = {
  translated: boolean,
  children?: any
}

type State = {
  hasError: boolean,
  showDetails: boolean,
  details: string
}

class ErrorBoundary extends React.PureComponent<Props, State> {
  static defaultProps: Props = {
    translated: true
  }

  detailsRef: RefObject

  constructor (props: Props) {
    super(props)
    this.state = {
      hasError: false,
      showDetails: false,
      details: ''
    }

    this.detailsRef = React.createRef()
    this.toggleDetails = this.toggleDetails.bind(this)
  }

  static getDerivedStateFromError (error: any) {
    return { hasError: true, error }
  }

  toggleDetails = () => {
    this.setState({
      showDetails: true
    })
  }

  getMessage = tryToGetMessage(this.props.translated)

  componentDidUpdate (prevProps: Props, prevState: State) {
    if (prevState.showDetails !== this.state.showDetails) {
      this.detailsRef.current.focus()
    }
  }

  componentDidCatch (error: any, errorInfo: any) {
    // you can also log the error to an error reporting service
    console.error('PRISM logged an error: ', error, errorInfo)

    switch (typeof error) {
      case 'string': {
        this.setState({
          details: `${error}

          ${errorInfo.componentStack}`
        })
        break
      }
      case 'object': {
        this.setState({
          details: `${error.stack}

          ${errorInfo.componentStack}`
        })
        break
      }
      default: {
        this.setState({
          details: `Unspecified Error

          ${errorInfo.componentStack}`
        })
      }
    }
  }

  render () {
    const { hasError, details, showDetails } = this.state

    if (hasError) {
      return (
        <section className='ErrorBoundary'>
          <h1 className='ErrorBoundary__title'>{this.getMessage('ERROR_BOUNDARY.TITLE')}</h1>
          <div className='ErrorBoundary__message'>
            <p>{this.getMessage('ERROR_BOUNDARY.MESSAGE')}</p>
          </div>
          {showDetails ? (
            <textarea ref={this.detailsRef} readOnly className='ErrorBoundary__details' value={details} />
          ) : (
            <button className='ErrorBoundary__btn' onClick={this.toggleDetails}>{this.getMessage('ERROR_BOUNDARY.SHOW_DETAILS')}</button>
          )}
        </section>
      )
    }

    // $FlowIgnore
    return this.props.children
  }
}

export default ErrorBoundary
