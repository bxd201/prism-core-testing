import React from 'react'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError (error) {
    // update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch (error, errorInfo) {
    // you can also log the error to an error reporting service
    console.log('PRISM logged an error: ', error, errorInfo)
  }

  render () {
    if (this.state.hasError) {
      return (
        <React.Fragment>
          <h1>There was an error rendering PRISM.</h1>
        </React.Fragment>
      )
    }

    // eslint-disable-next-line react/prop-types
    return this.props.children
  }
}

export default ErrorBoundary
