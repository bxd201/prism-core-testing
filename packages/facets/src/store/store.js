import { applyMiddleware, compose,createStore } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers/rootReducer'
import storeHydrator from './storeHydrator'

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
  enhancers,
  rootReducer}

export default store
