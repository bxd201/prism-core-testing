export const colors = (state = {}, action) => {
  switch (action.type) {
    case 'REQUEST_COLORS':
      return Object.assign({}, state, {
        status: action.payload
      })

    case 'RECEIVE_COLORS':
      return Object.assign({}, state, {
        items: action.payload.colors
      })

    default:
      return state
  }
}
