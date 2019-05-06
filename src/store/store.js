import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import rootReducer from './reducers/rootReducer'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancers = composeEnhancers(
  applyMiddleware(
    thunkMiddleware
  )
)

// TODO: Hydrate the initialState from localStorage if it exists
const initialState = {
  lp: {
    colors: []
  }
}

const initializeStore = () => {
  return createStore(
    rootReducer,
    initialState,
    enhancers
  )
}

export default initializeStore
