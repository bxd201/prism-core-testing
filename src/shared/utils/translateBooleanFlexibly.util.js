// @flow
function translateBooleanFlexibly (value: any): boolean {
  switch (typeof value) {
    case 'string': { return value.toLowerCase() === 'true' }
    case 'boolean': { return value }
  }

  return false
}

export default translateBooleanFlexibly
