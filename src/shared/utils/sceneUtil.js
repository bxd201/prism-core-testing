// @flow
export const getFirebaseListItemPaths = (data: Object) => {
  let paths = []

  if (data && data.items) {
    paths = data.items.map(item => {
      if (item.location && item.location.path_) {
        return item.location.path_
      } else {
        console.warn('The storage API may be out of date.')
      }
    })
  }

  return paths
}
