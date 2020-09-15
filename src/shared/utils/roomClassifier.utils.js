// @flow
import { type RoomType } from 'src/components/Facets/JumpStartFacet/JumpStartFacet'

export const getRoomTypeFromRoomData = (relevantLabels: string[]): RoomType | 'bathroom' => {
  const livingRoomItems = ['rug', 'table', 'sofa', 'armchair']
  const bathroomItems = ['bathtub', 'bathing', 'tub', 'bath', 'toilet', 'can', 'commode', 'crapper', 'pot', 'potty', 'stool', 'throne']
  const kitchenItems = ['refrigerator', 'stove', 'oven', 'cabinet', 'dishwasher', 'sink', 'countertop']

  if (relevantLabels.filter(label => bathroomItems.indexOf(label) !== -1).length > 1) { // at least 2 bathroom items makes it a bathroom
    return 'bathroom'
  } else if (relevantLabels.filter(label => livingRoomItems.indexOf(label) !== -1).length > 2) { // at least 3 living room items makes it a living room
    return 'living_room'
  } else if (relevantLabels.indexOf('bed') !== -1) { // a bed makes it a bedroom if it wasn't a living room
    return 'bedroom'
  } else if (relevantLabels.filter(label => kitchenItems.indexOf(label) !== -1).length > 2) { // at least 3 kitchen items makes it a kitchen
    return 'kitchen'
  } else { // default to living room because that is probably most common
    return 'living_room'
  }
}
