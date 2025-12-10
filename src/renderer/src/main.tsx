import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { HashRouter } from 'react-router-dom'
import { KeyboardProvider } from './contexts/KeyboardProvider/KeyboardProvider'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <KeyboardProvider>
          <App />
        </KeyboardProvider>
      </HashRouter>
    </Provider>
  </StrictMode>
);
