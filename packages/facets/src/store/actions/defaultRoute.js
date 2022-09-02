// @flow
export const SET_DEFAULT_ROUTE = 'SET_DEFAULT_ROUTE'
export const setDefaultRoute = (route: string): { type: string, payload: string } => {
  return {
    type: SET_DEFAULT_ROUTE,
    payload: route
  }
}
