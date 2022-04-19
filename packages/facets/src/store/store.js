import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import storeHydrator from './storeHydrator'

import rootReducer from './reducers/rootReducer'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const enhancers = composeEnhancers(
  applyMiddleware(
    thunkMiddleware
  )
)

const store = createStore(
  rootReducer,
  storeHydrator(),
  enhancers
)

export {
  rootReducer,
  enhancers
}

export default store
