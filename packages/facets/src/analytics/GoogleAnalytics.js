// @flow

import ReactGA from 'react-ga'
import noop from 'lodash/noop'
import once from 'lodash/once'
import memoizee from 'memoizee'
import {
  GA_TRACKER_NAME_SW,
  GA_TRACKER_NAME_CBG_HGSW,
  GA_TRACKER_NAME_CBG_VALSPAR,
  GOOGLE_ANALYTICS_UID_SW,
  GOOGLE_ANALYTICS_UID_CBG_HGSW,
  GOOGLE_ANALYTICS_UID_CBG_VALSPAR
} from 'src/constants/globals'

// ------------------- INITIALIZATION --------------

const init = once(() => {
  ReactGA.initialize([
    {
      trackingId: GOOGLE_ANALYTICS_UID_SW,
      gaOptions: { name: GA_TRACKER_NAME_SW }
    },
    {
      trackingId: GOOGLE_ANALYTICS_UID_CBG_HGSW,
      gaOptions: { name: GA_TRACKER_NAME_CBG_HGSW }
    },
    {
      trackingId: GOOGLE_ANALYTICS_UID_CBG_VALSPAR,
      gaOptions: { name: GA_TRACKER_NAME_CBG_VALSPAR }
    }
  ], { alwaysSendToDefaultTracker: false })
})

// ------------------- UTILITIES -----------------

const canTrack = memoizee((func: Function): Function => {
  if (ENV !== 'production') {
    return noop
  }

  return function (data: any, tracker: string) {
    init()
    func(data, tracker)
  }
}, { length: 1 })

// ------------------- TYPES -----------------

type GAEvent = {
  action: string,
  category: string,
  label: string
}

type GASet = {
  [key: string]: string
}

type GAPageView = string

// ------------------- EXPORTS -----------------

export const event = canTrack((data: GAEvent, tracker: string) => {
  ReactGA.event(data, [tracker])
})

export const set = canTrack((data: GASet, tracker: string) => {
  ReactGA.set(data, [tracker])
})

export const pageView = canTrack((data: GAPageView, tracker: string) => {
  ReactGA.pageview(data, [tracker])
})
