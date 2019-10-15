export const getScaledPortraitHeight = (imageWidth, imageHeight) => {
  return (width) => width * (imageHeight / imageWidth)
}

export const getScaledLandscapeHeight = (imageWidth, imageHeight) => {
  return (width) => width * (imageWidth / imageHeight)
}
