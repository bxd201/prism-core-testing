// @flow
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import noop from 'lodash/noop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'

import './OmniButton.scss'

const ROOT_CLASS = 'OmniButton'

type Props = {
  children?: any,
  className?: string,
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
    className = '',
    external,
    icon,
    onClick,
    to,
    ...other
  } = props

  const passThruProps = {
    onClick: typeof onClick === 'function' ? onClick : noop,
    ...other
  }

  const content = useMemo(() => {
    return <>
      {icon ? <span className={`${ROOT_CLASS}__icon`}>{icon}</span> : null}
      {children ? <span className={`${ROOT_CLASS}__content`}>{children}</span> : null}
    </>
  }, [icon, children])

  if (!content) {
    return null
  }

  if (external && typeof to === 'string') {
    return <a href={to} className={`${ROOT_CLASS} ${className}`} {...passThruProps}>
      {content}
    </a>
  } else if (to) {
    return <Link to={to} className={`${ROOT_CLASS} ${className}`} {...passThruProps}>
      {content}
    </Link>
  } else {
    return <button className={`${ROOT_CLASS} ${className}`} {...passThruProps}>
      {content}
    </button>
  }
}

OmniButton.ICONS = {
  'INFO': <FontAwesomeIcon icon='info' size='1x' />,
  'ADD': <FontAwesomeIcon icon={['fal', 'plus-circle']} size='2x' />
}

export default OmniButton
