// @flow
import camelCase from 'lodash/camelCase'

export const getDataElement = (data: string): string =>
  camelCase(data.split('.').pop())
