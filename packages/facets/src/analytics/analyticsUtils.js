// @flow

import type { AnalyticsConfig } from '../contexts/ConfigurationContext/ConfigurationContext'
// USe as the scene name for paitn scene uploads
export const ANALYTICS_LABELS = Object.freeze({
  USER_UPLOAD: 'user_upload',
  COLOR_PALETTE: 'color_palette',
  FAST_MASK_USER_UPLOAD: 'fast_mask_user_upload'
})

const CVW_TOOL_NAME = 'cvw'

export const ANALTYICS_TYPES = Object.freeze({
  UA: 'UA',
  GA4: 'GA4',
  GTM: 'GTM'
})

export const ANALYTICS_EVENTS = Object.freeze({
  INTERACTION: 'interaction',
  FORM_SUBMIT: 'form_submit',
  NOTIFICATION: 'notification',
  FILE_DOWNLOAD: 'file_download'
})

export const ANALYTICS_INTERACTIONS_TYPE = Object.freeze({
  INTERACTION: 'interaction',
  BUTTON: 'button',
  COLOR_APPLY: 'color_apply',
  UPLOAD: 'upload',
  NOTIFICATION: 'notification',
  TAB: 'tab'
})

function isAnalyticsAllowed(perms: AnalyticsConfig[] = [], analyticsType = ANALTYICS_TYPES.GTM) {
  const found = perms.filter((item) => {
    const {
      location: { hostname }
    } = window

    return item.host === hostname && item.type === analyticsType
  })

  return found.length
}

export function createGTMData(eventLabel: string, interactionType: string, roomName: string, linkText: string) {
  return {
    event: eventLabel,
    tool_name: CVW_TOOL_NAME,
    room_name: roomName ?? null,
    link_text: linkText ?? null,
    interaction_type: interactionType
  }
}

export function pushToDataLayer(data: any, perms: AnalyticsConfig[] = []) {
  if (isAnalyticsAllowed(perms) && data) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(data)
  }
}
