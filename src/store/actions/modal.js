// @flow
export const MODAL_HEIGHT = 'MODAL_HEIGHT'
export const REFRESH_MODAL_HEIGHT = 'REFRESH_MODAL_HEIGHT'
export const modalHeight = (height: number = 0) => {
  return {
    type: MODAL_HEIGHT,
    payload: height
  }
}

export const refreshModalHeight = (shouldRefresh: boolean = false) => {
  return {
    type: REFRESH_MODAL_HEIGHT,
    payload: shouldRefresh
  }
}
