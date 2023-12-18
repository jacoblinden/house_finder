import React from 'react';
import logo from './logo.svg';

import { Button } from './components/UI/atom/Button';

function App() {
  return (
    <div className="App">

      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <Button text="Click me" onClick={() => alert('Hello world!')} />

    </div>
  );
}

export default App;
