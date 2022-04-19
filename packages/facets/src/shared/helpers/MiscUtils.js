// @flow
import { type $Arguments } from '../types/Common'

export function addListener (tgt: any, evt: string, cb: Function): Function {
  tgt.addEventListener(evt, cb)
  return () => tgt.removeEventListener(evt, cb)
}

export function getFirstDefined<T> (...args: $Arguments<T>): T | typeof undefined {
  return Array.from(arguments).filter(v => typeof v !== 'undefined')[0]
}

export function mouseDownPreventDefault (e: SyntheticEvent): typeof undefined {
  e.preventDefault()
}
