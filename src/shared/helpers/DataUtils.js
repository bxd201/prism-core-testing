// @flow

export function getByLowerCasePropName (obj: Object, propName: string): any {
  const realKey: string[] = Object.keys(obj).map(prop => prop.toLowerCase()).filter(prop => prop === propName)
  if (realKey.length && obj.hasOwnProperty(realKey[0])) {
    return obj[realKey[0]]
  }
  return
}
