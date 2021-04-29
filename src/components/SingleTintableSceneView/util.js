export const isScenePolluted = (paintedSurfaces) => {
  return !!paintedSurfaces.reduce((acc, curr) => (curr ? 1 : 0) + acc, 0)
}
