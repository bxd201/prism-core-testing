import determineRelatedHues from 'src/shared/utils/colorRelationship/determineRelatedHues'

describe('determineRelatedHues', () => {
  it('handles colors in the same space', () => {
    // 0 apart, "diad"
    expect(determineRelatedHues(5, 9)).toEqual([[305, 69]])
    expect(determineRelatedHues(269, 268)).toEqual([[208, 329]])
  })

  it('returns no data for colors in adjacent spaces', () => {
    // 1 apart, no data
    expect(determineRelatedHues(0, 16)).toBeUndefined()
  })

  it('handles colors 2 spaces apart', () => {
    // 2 apart, "analog" (0) and "split comp" (180)
    expect(determineRelatedHues(30, 330)).toEqual([[0], [180], [150, 210]])
  })

  it('handles colors 3 spaces apart', () => {
    // 3 apart, "square" (270, 180)
    expect(determineRelatedHues(0, 90)).toEqual([[270, 180]])
  })

  it('handles colors 4 spaces apart', () => {
    // 4 apart; "triadic" (180), "rectangle" (tetradic) (120, 240)
    expect(determineRelatedHues(60, 300)).toEqual([[180], [120, 240]])
  })

  it('handles colors 5 spaces apart', () => {
    // 5 apart; 2 "split-comp" versions, each with 2 possible solutions.
    // [0, 150, 210] is the test triangle here, with 300 and 60 being accepted alternate points.
    expect(determineRelatedHues(0, 150)).toEqual([[210, 300]])
    expect(determineRelatedHues(0, 210)).toEqual([[60, 150]])
  })

  it('handles colors 6 spaces apart', () => {
    // 6; test square and tetradic (rectangle) results
    expect(determineRelatedHues(0, 180)).toEqual([[90, 270], [300, 120, 60, 240]])
  })
})
