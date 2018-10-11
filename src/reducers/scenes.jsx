const initialState = {
  selectedColor: {}
}

export const scenes = (state = initialState, action) => {
  switch (action.type) {
    case 'COLOR_SELECTED':
      return Object.assign({}, state, {
        selectedColor: action.payload.color
      })

    case 'SELECT_SCENE':
      return Object.assign({}, state, {
        scene: action.payload.scene
      })

    default:
      return state
  }
}
