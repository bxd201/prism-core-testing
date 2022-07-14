// @flow
// @todo we should refactor to not need this check, if we absolutely need, we can just use loose equality with a comment explaining why -RS
export default function isSomething (value: any): boolean {
  return value !== null && typeof value !== 'undefined'
}
