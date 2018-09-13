export const scenes = (state = {}, action) => {
  switch (action.type) {
    case 'COLOR_SELECTED':
      return Object.assign({}, state, {
        selectedColor: action.payload.color
      })

    default:
      return state
  }
}
