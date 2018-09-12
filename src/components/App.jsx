import React, { Component, Fragment } from 'react';
import ColorPath from './Color-Path/color-path.jsx';

import Button from './Button/Button.jsx';

class App extends Component {
  render() {
    return (
      <Fragment>
        <div>
          <h1>Welcome to Prism</h1>
          <Button>This is a normal button</Button>
          <Button primary>This is a primary button</Button>
        </div>
        <div className="app-wrapper">
          <ColorPath></ColorPath>
        </div>
      </Fragment>
    );
  }
}

export default App;
