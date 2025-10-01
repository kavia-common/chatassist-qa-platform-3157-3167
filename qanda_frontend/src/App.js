import React, { useEffect } from 'react';
import './App.css';
import ChatApp from './components/ChatApp';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root component: mounts the ChatApp and prepares document background color.
   */
  useEffect(() => {
    document.body.style.backgroundColor = '#f0f4ff';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return <ChatApp />;
}

export default App;
