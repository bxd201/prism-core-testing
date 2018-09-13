import React, { Component } from 'react'
import { Provider } from 'react-redux'

import store from '../store'
import ColorPath from './Color-Path/color-path.jsx'
import Button from './Button/Button.jsx'

class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <React.Fragment>
          <div>
            <h1>Welcome to Prism</h1>
            <Button>This is a normal button</Button>
            <Button primary>This is a primary button</Button>
          </div>
          <div className='app-wrapper'>
            <ColorPath />
          </div>
        </React.Fragment>
      </Provider>
    )
  }
}

export default App
