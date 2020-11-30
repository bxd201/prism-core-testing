// @flow
type OrientationDimension = {
  portraitWidth: number,
  portraitHeight: number,
  landscapeWidth: number,
  landscapeHeight: number,
  originalImageWidth: number,
  originalImageHeight: number
}

export const calcOrientationDimensions = (width: number, height: number, orientationIsPortrait: boolean, wrapperWidth: number, maxSceneHeight: number): OrientationDimension => {
  const dimensions = {}
  let fixedHeight = 0

  if (orientationIsPortrait) {
    // Height should not change on rotate, so use the portrait height as the fixed height
    fixedHeight = Math.round(wrapperWidth / 2 * height / width)

    if (fixedHeight > maxSceneHeight) {
      fixedHeight = maxSceneHeight
    }

    dimensions.portraitWidth = Math.floor(fixedHeight * width / height)
    dimensions.portraitHeight = fixedHeight

    dimensions.landscapeWidth = Math.round(height / width * fixedHeight)
    dimensions.landscapeHeight = fixedHeight

    // some proportions will need to be recalculated
    if (dimensions.landscapeWidth > wrapperWidth) {
      dimensions.landscapeWidth = wrapperWidth
      fixedHeight = Math.round(width / height * wrapperWidth)
      dimensions.landscapeHeight = fixedHeight

      dimensions.portraitHeight = fixedHeight
      dimensions.portraitWidth = Math.round(width / height * fixedHeight)
    }
  } else {
    fixedHeight = Math.round(height / width * wrapperWidth)

    if (fixedHeight > maxSceneHeight) {
      fixedHeight = maxSceneHeight
    }

    dimensions.landscapeWidth = Math.floor(fixedHeight * width / height)
    dimensions.landscapeHeight = fixedHeight

    dimensions.portraitHeight = fixedHeight
    dimensions.portraitWidth = Math.round(fixedHeight * height / width)
  }

  dimensions.originalImageWidth = width
  dimensions.originalImageHeight = height
  dimensions.originalIsPortrait = orientationIsPortrait

  return dimensions
}
