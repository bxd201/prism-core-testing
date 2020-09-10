// @flow
export const getRoomTypeFromRoomData = (roomData: any): string => {
  const { relevantLabels: labels } = roomData
  const bathroomItems = ['bathtub', 'bathing', 'tub', 'bath', 'tub', 'toilet', 'can', 'commode', 'crapper', 'pot', 'potty', 'stool', 'throne']
  const kitchenItems = ['refrigerator', 'icebox', 'stove', 'kitchen', 'stove', 'range', 'kitchen', 'range', 'cooking', 'stove']
  let roomType = 'room'

  if (labels.length) {
    if (labels.indexOf('bed') > -1) {
      return 'bedroom'
    }

    const foundKitchenItems = labels.filter(item => {
      return kitchenItems.indexOf(item) > -1
    })

    if (foundKitchenItems.length) {
      return 'kitchen'
    }

    const foundBathroomItems = labels.filter(item => {
      return bathroomItems.indexOf(item) > -1
    })

    if (foundBathroomItems.length) {
      return 'bathroom'
    }
  }

  return roomType
}
