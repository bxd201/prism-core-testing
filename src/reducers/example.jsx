export const example = (state = {}, action) => {
  switch (action.type) {
    case 'EXAMPLE_DATA':
      return Object.assign({}, state, {
        colors: action.payload.colors
      })

    default:
      return state
  }
}
