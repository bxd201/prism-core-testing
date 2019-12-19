// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'
import memoize from 'lodash/memoize'
import uniqueId from 'lodash/uniqueId'

import './ErrorBoundary.scss'
import 'src/scss/convenience/visually-hidden.scss'

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
  details: string,
  detailsId: string,
  version: string
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
      details: '',
      detailsId: uniqueId('errbounddetails'),
      version: (() => {
        try {
          return APP_VERSION
        } catch (e) {
          return 'N/A'
        }
      })()
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
    const { version } = this.state
    // you can also log the error to an error reporting service
    console.error('PRISM logged an error: ', error, errorInfo)

    let detailsOutput = `PRISM v${version}\n\n`

    switch (typeof error) {
      case 'string': {
        detailsOutput += `${error}\n\n${errorInfo.componentStack}`
        break
      }
      case 'object': {
        detailsOutput += `${error.stack}\n\n${errorInfo.componentStack}`
        break
      }
      default: {
        detailsOutput += `\nUnspecified Error\n\n${errorInfo.componentStack}`
      }
    }

    this.setState({
      details: detailsOutput
    })
  }

  render () {
    const { hasError, details, showDetails, detailsId } = this.state

    if (hasError) {
      return (
        <section className='ErrorBoundary'>
          <h1 className='ErrorBoundary__title'>{this.getMessage('ERROR_BOUNDARY.TITLE')}</h1>
          <div className='ErrorBoundary__message'>
            <p>{this.getMessage('ERROR_BOUNDARY.MESSAGE')}</p>
          </div>
          {showDetails ? (
            <label htmlFor={detailsId}>
              <span className='visually-hidden'>{this.getMessage('ERROR_BOUNDARY.ERROR_DETAILS')}</span>
              <textarea id={detailsId} ref={this.detailsRef} readOnly className='ErrorBoundary__details' value={details} />
            </label>
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
