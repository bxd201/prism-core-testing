// @flow

export function addListener (tgt: any, evt: string, cb: Function): Function {
  tgt.addEventListener(evt, cb)
  return () => tgt.removeEventListener(evt, cb)
}
