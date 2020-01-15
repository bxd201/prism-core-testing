// @flow
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import noop from 'lodash/noop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'

type Props = {
  children?: any,
  external?: boolean,
  icon?: any, // this should probably be a ReactElement type (or similar)
  to?: string | {
    pathname?: string,
    state?: Object
  },
  onClick?: Function
}

const OmniButton = (props: Props) => {
  const {
    children,
    external,
    icon,
    to,
    onClick,
    ...other
  } = props

  const passThruProps = {
    onClick: typeof onClick === 'function' ? onClick : noop,
    ...other
  }

  const content = useMemo(() => {
    return <>
      {icon || null}
      {children}
    </>
  }, [icon, children])

  if (!content) {
    return null
  }

  if (external && typeof to === 'string') {
    return <a href={to} {...passThruProps}>
      {content}
    </a>
  } else if (to) {
    return <Link to={to} {...passThruProps}>
      {content}
    </Link>
  } else {
    return <button {...passThruProps}>
      {content}
    </button>
  }
}

OmniButton.ICONS = {
  'INFO': <FontAwesomeIcon icon='info' size='1x' />,
  'ADD': <FontAwesomeIcon icon={['fa', 'plus']} size='1x' />
}

export default OmniButton
