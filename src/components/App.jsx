import React, { Component } from 'react';

import Button from './Button/Button.jsx';

class App extends Component {
  render() {
    return (
      <div>
        <h1>Welcome to Prism</h1>
        <Button>This is a normal button</Button>
        <Button primary>This is a primary button</Button>
      </div>
    );
  }
}

export default App;