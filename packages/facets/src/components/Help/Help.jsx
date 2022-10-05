// @flow
import type { Node } from 'react'
import React from 'react'
import { useIntl } from 'react-intl'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { helpHeader } from './data'
import HelpInterior from './HelpInterior'
import './Help.scss'
import '../SingleTintableSceneView/SceneSelectorNavButton.scss'

const Help = (): Node => {
  const { formatMessage } = useIntl()
  return (
    <CardMenu menuTitle={formatMessage({ id: helpHeader })}>
      {() => <HelpInterior />}
    </CardMenu>
  )
}

export default Help
