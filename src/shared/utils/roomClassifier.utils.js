// @flow
import { type RoomType } from 'src/components/Facets/JumpStartFacet/JumpStartFacet'

export const getRoomTypeFromRoomData = (relevantLabels: string[], roomTypeProbabilities: [RoomType, number][]): RoomType | 'bathroom' => {
  // default to living room when this function is called with bad data
  if (roomTypeProbabilities.length < 2 || roomTypeProbabilities[0].length < 2 || roomTypeProbabilities[1].length < 2) { return 'living_room' }

  const predictedRoomType: RoomType = roomTypeProbabilities[0][0]
  const runnerUp: RoomType = roomTypeProbabilities[1][0]

  // using the algorithm invented by Preston which overrides bedrooms to be living rooms when 3 out of 4 common living room furniture types are detected
  if (predictedRoomType === 'bedroom' && runnerUp === 'living_room' && relevantLabels.filter(label => ['rug', 'table', 'sofa', 'armchair'].indexOf(label) !== -1).length > 2) {
    return 'living_room'
  } else {
    return predictedRoomType
  }
}
