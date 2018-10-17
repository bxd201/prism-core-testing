const initialState = {
  status: {
    loading: true
  },
  items: {},
  family: 'All'
}

export const colors = (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_COLORS':
      return Object.assign({}, state, {
        status: action.payload
      })

    case 'RECEIVE_COLORS':
      return Object.assign({}, state, {
        items: action.payload.colors,
        status: {
          loading: action.payload.loading
        }
      })

    case 'FILTER_BY_FAMILY':
      return Object.assign({}, state, {
        family: action.payload.family
      })

    default:
      return state
  }
}
