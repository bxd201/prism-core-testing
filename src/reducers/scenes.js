export const initialState = {
  scenes: [],
  scene: void (0),
  numScenes: 0,
  loadingScenes: true
}

export const scenes = (state = initialState, action) => {
  switch (action.type) {
    case 'SELECT_SCENE':
      return Object.assign({}, state, {
        scene: action.payload.scene
      })

    case 'RECEIVE_SCENES':
      return Object.assign({}, state, {
        scenes: action.payload.scenes,
        numScenes: action.payload.numScenes,
        loadingScenes: action.payload.loadingScenes
      })

    case 'REQUEST_SCENES':
      return Object.assign({}, state, {
        loadingScenes: action.payload.loadingScenes
      })

    default:
      return state
  }
}
