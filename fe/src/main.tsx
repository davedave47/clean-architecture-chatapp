import React from 'react'
import ReactDOM from 'react-dom/client'
import MyRouter from './routes'
import {Provider} from 'react-redux'
import store from './redux'
import './styles/index.module.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MyRouter />
    </Provider>
  </React.StrictMode>,
)
