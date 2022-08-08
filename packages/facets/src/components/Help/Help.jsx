// @flow
import React from 'react'
import CardMenu from 'src/components/CardMenu/CardMenu'
import { helpHeader } from './data'
import './Help.scss'
import { useIntl } from 'react-intl'
import '../SingleTintableSceneView/SceneSelectorNavButton.scss'
import HelpInterior from './HelpInterior'
import type { Node } from 'react'

const Help = (): Node => {
  const { formatMessage } = useIntl()
  return (
    <CardMenu menuTitle={formatMessage({ id: helpHeader })}>
      {() => <HelpInterior />}
    </CardMenu>
  )
}

export default Help
