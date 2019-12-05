// @flow
import { type ComponentType } from 'react'
import { unmountComponentAtNode } from 'react-dom'
import memoizee from 'memoizee'
import noop from 'lodash/noop'

import { publishAnEvent, subscribeToAnEvent, unsubscribeFromAnEvent, unsubscribeFromAllEvents } from './facetPubSub'

export type Instance = {
  component: ComponentType<any>,
  el: HTMLElement
}

export type InstancePromise = {
  el: HTMLElement,
  promise: Promise<Instance>,
  reject: Function,
  resolve: Function
}

// -------------- Instance management -----------------

const instances: Instance[] = []
const instancePromises: InstancePromise[] = []
const getInstancePromise = (el: HTMLElement): InstancePromise | null => {
  const matches = instancePromises.filter((ip) => {
    const are = ip.el === el
    return are
  })

  if (matches.length) {
    return matches[0]
  }

  return null
}
const makeInstancePromise = (el: HTMLElement): InstancePromise => {
  const ip = getInstancePromise(el)
  if (ip) {
    return ip
  }

  let res, rej

  const newP = new Promise<Instance>((resolve, reject) => {
    res = resolve
    rej = reject
  })

  const newIp = {
    el,
    promise: newP,
    reject: rej,
    resolve: res
  }

  instancePromises.push(newIp)

  return newIp
}

export const addInstance = ({ component, el }: Instance): void => {
  instances.push({ component, el })

  const pResolutionData = {
    publish: publishAnEvent(el),
    subscribe: subscribeToAnEvent(el),
    unmount: unmount(el),
    unsubscribe: unsubscribeFromAnEvent(el),
    unsubscribeAll: unsubscribeFromAllEvents(el)
  }

  makeInstancePromise(el).resolve(pResolutionData)
}

export const getInstance = memoizee((seekingEl: HTMLElement): Promise<Instance> => {
  // no element?
  if (!seekingEl) {
    // return a rejected promise
    return new Promise((resolve, reject) => {
      reject(new Error('Invalid or undefined instance element provided, unable to get instance.'))
    })
  }

  // otherwise ensure that we have an instance promise for seekingEl and return its promise
  return makeInstancePromise(seekingEl).promise
})

export const unmount = memoizee((el: HTMLElement) => {
  return !el ? noop : () => {
    unsubscribeFromAllEvents(el)()
    return unmountComponentAtNode(el)
  }
})
