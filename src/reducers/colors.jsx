export const initialState = {
  status: {
    loading: true
  },
  items: {},
  searchResults: [],
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
        items: { colors: action.payload.colors, brights: action.payload.brights },
        status: {
          loading: action.payload.loading
        }
      })

    case 'FILTER_BY_FAMILY':
      return Object.assign({}, state, {
        family: action.payload.family
      })

    case 'REQUEST_SEARCH_RESULTS':
      return Object.assign({}, state, {
        status: action.payload.status
      })

    case 'RECEIVE_SEARCH_RESULTS':
      return ({
        ...state,
        searchResults: action.payload.results,
        status: {
          ...state.status,
          loading: action.payload.loading
        }
      })

    default:
      return state
  }
}
