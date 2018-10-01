import React from 'react'
import PropTypes from 'prop-types'

class CSSVariableApplicator extends React.Component {
  render () {
    return <div>{this.props.children}</div>
  }

  componentDidMount () {
    this.updateCSSVariables(this.props.variables)
  }

  componentDidUpdate (prevProps) {
    if (this.props.variables !== prevProps.variables) {
      this.updateCSSVariables(this.props.variables)
    }
  }

  updateCSSVariables (variables) {
    for (let prop in variables) {
      document.documentElement.style.setProperty(prop, variables[prop])
    }
  }
}

CSSVariableApplicator.propTypes = {
  variables: PropTypes.object,
  children: PropTypes.any
}

export default CSSVariableApplicator
