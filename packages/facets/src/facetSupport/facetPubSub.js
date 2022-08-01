// @flow
import React, { useState, type ComponentType } from 'react'
import noop from 'lodash/noop'
import memoizee from 'memoizee'

// -------------- Types -----------------

export type Subscriber = {
  el: HTMLElement,
  event: string,
  handler: Function
}

export type FacetPubSubMethods = {
  publish: Function,
  subscribe: Function,
  unsubscribe: Function,
  unsubscribeAll: Function
}

export const facetPubSubDefaultProps: FacetPubSubMethods = {
  publish: noop,
  subscribe: noop,
  unsubscribe: noop,
  unsubscribeAll: noop
}

// ---------- Subscriber management ---------------------

const subscribers: Subscriber[] = []

export const publishAnEvent = memoizee((el: HTMLElement) => {
  return !el
    ? noop
    : (e: string, data: any) => {
        subscribers.filter(sub => sub.event === e && sub.el === el).forEach(sub => {
          sub.handler(data)
        })
      }
})

export const subscribeToAnEvent = memoizee((el: HTMLElement) => {
  return !el
    ? noop
    : (e: string, handler: Function) => {
        const _subscribers = subscribers.filter(sub => sub.el === el && sub.event === e && sub.handler === handler)
        if (_subscribers.length === 0) {
          subscribers.push({
            el: el,
            event: e,
            handler: (...args) => {
              try {
                handler(...args)
              } catch (err) {
                console.error(`Error in event handler for "${e}" published by following Prism embed root:`, el, 'ORIGINAL ERROR:', err)
              }
            }
          })
        }
      }
})

export const unsubscribeFromAnEvent = memoizee((el: HTMLElement) => {
  return !el
    ? noop
    : (e: string, handler: Function) => {
        subscribers.map((sub, i) => sub.el === el && sub.event === e && sub.handler === handler ? i : -1).filter(v => v > -1).forEach(v => {
          subscribers.splice(v, 1)
        })
      }
})

export const unsubscribeFromAllEvents = memoizee((el: HTMLElement) => {
  const unsubscribeFromOne = unsubscribeFromAnEvent(el)
  return !el
    ? noop
    : () => {
        subscribers.filter((sub, i) => sub.el === el).forEach(sub => {
          unsubscribeFromOne(sub.event, sub.handler)
        })
      }
})

// -------------------- HOC -------------------

type InProps = { el: HTMLElement }

type OutProps = any & FacetPubSubMethods

export const PubSubCtx = React.createContext<FacetPubSubMethods>(facetPubSubDefaultProps)
PubSubCtx.displayName = 'PubSubContext'

const facetPubSub = function facetPubSub (WrappedComponent: ComponentType<InProps>): ComponentType<OutProps> {
  return function FacetPubSubRenderer ({ el, ...other }: OutProps) {
    const [pubSubMethods] = useState({
      publish: publishAnEvent(el),
      subscribe: subscribeToAnEvent(el),
      unsubscribe: unsubscribeFromAnEvent(el),
      unsubscribeAll: unsubscribeFromAllEvents(el)
    })

    return <PubSubCtx.Provider value={pubSubMethods}>
      <WrappedComponent
        el={el}
        {...pubSubMethods}
        {...other} />
    </PubSubCtx.Provider>
  }
}

export default facetPubSub
