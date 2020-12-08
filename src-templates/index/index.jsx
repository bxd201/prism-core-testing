// @flow
import React, { useMemo, Fragment } from 'react'
import { render } from 'react-dom'
import at from 'lodash/at'
import flatten from 'lodash/flatten'
import isArray from 'lodash/isArray'
import set from 'lodash/set'
import sortBy from 'lodash/sortBy'

import { getContrastYIQ } from 'src/shared/helpers/ColorUtils'
import './index.scss'

const appVersionHex = (() => {
  const hexKey = [
    8, 0, 9, 1, 'A', 2, 'B', 3, 'C', 4, 'D', 5, 'E', 6, 'F', 7
  ]
  const order = [
    '$1$2$3',
    '$2$3$1',
    '$3$1$2'
  ]
  const plainVersion = (APP_VERSION || '0.0.0').replace(/[^0-9.]/g, '')
  const parts = plainVersion.split('.').map(v => parseInt(v, 10))

  const getRgbPosition = (parts) => {
    const i = parts.reduce((prev, next) => prev + next, 0) % 3
    return order[i]
  }

  const hexMap = parts.map(v => v % 16).map(v => hexKey[v].toString())
  const hex = getRgbPosition(parts).replace('$1', hexMap[0]).replace('$2', hexMap[1]).replace('$3', hexMap[2])

  return `#${hex}`
})()

const PAGES = '__pages'
const appVersionContrastHex = getContrastYIQ(appVersionHex)

type Directory = {
  __pages: string[],
  [key: string]: Directory
}
type ListProps = { title?: string, directory: Directory }

const List = ({ title, directory }: ListProps) => <>
  {title ? <h2 className='template-index__dir-title'>{title}</h2> : null}
  <ul className='template-index__dir-list'>
    {Object.keys(directory).map((keyName, i) => {
      const _this: Directory | string[] = directory[keyName]

      if (keyName === PAGES && isArray(_this)) {
        // this is an array // loop over and output <li><a>name</a></li>
        return <Fragment key={i}>
          {flatten(_this.map((path, i) => <li key={i}>
            <a href={`/${path}`}>{stripExtension(path.split('/').slice(-1)[0])}</a>
          </li>))}
        </Fragment>
      } else {
        const title = keyName
        return <li key={i} className={title ? 'no-list-style' : ''}>
          {/* $FlowIgnore -- flow thinks this isn't a Directory, but it is */}
          <List title={title} directory={_this} />
        </li>
      }
    })}
  </ul>
</>

const Index = () => {
  const result = useMemo(() => {
    const result = {}

    sortBy(STATIC_TEMPLATES).forEach(fullPath => {
      // removing leading slash for consistency -- we're going to assume EVERYTHING is from root
      const splits = stripLeadingSlash(fullPath).split('/')
      const path = splits.slice(0, -1)
      const filePath = path.join('/')
      const fileName = splits.slice(-1)[0]
      const plucked = at(result, path.join('.'))[0]

      if (plucked) {
        plucked[PAGES].push(`${filePath}/${fileName}`)
      } else {
        set(result, path, {
          [PAGES]: [
            `${filePath}/${fileName}`
          ]
        })
      }
    })

    return result
  }, [])

  return <div className='template-index'>
    <h1 className='template-index__title'>Prism <span className='template-index__pill' style={{ color: appVersionContrastHex, backgroundColor: appVersionHex }}>{APP_VERSION}</span></h1>
    <List directory={result} />
  </div>
}

function stripExtension (file: string): string {
  return file.split('.')[0]
}

function stripLeadingSlash (path: string): string {
  return path.replace(/(\/*)?(.*)/, '$2')
}

// $FlowIgnore -- flow doesn't know document exists
render(<Index />, document.querySelector('#template-index'))
