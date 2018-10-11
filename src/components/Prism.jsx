import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'

import Main from './Facets/Main/Main'
import ColorWall from './Facets/ColorWall/ColorWall'

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
const RootRedirect = () => {
  return <Redirect to='/active' />
}

class Prism extends Component {
  render () {
    return (
      <React.Fragment>
        <Route path='/' exact component={RootRedirect} />
        <Route path='/active' exact component={Main} />
        <Route path='/active/color-wall/:family' exact component={ColorWall} />
        <Route path='/active/color-wall/:family/:colorNumber' exact component={ColorWall} />
      </React.Fragment>
    )
  }
}

export default Prism
