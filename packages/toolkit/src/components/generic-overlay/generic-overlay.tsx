import React, { CSSProperties } from 'react'
import classnames from 'classnames'
import CircleLoader from '../circle-loader/circle-loader'

type DisplayType = 'LOADING' | 'ERROR' | 'MESSAGE' | string

export interface GenericOverlayProps {
  children?: any,
  type: DisplayType,
  message?: string,
  fillVertical?: boolean,
  fillHorizontal?: boolean,
  semitransparent?: boolean
}

const getCssColors = (semitrans: boolean, type: DisplayType): {background: string, color: string} => {
  // TODO: Ask about color variables
  if (semitrans) {
    return {
      background: 'var(--prism-theme-color-primary-contrast-trans)',
      color: 'var(--prism-theme-color-primary)',
    }
  } else {
    switch(type) {
      case 'MESSAGE':
        return {
          background: 'var(--prism-theme-color-primary)',
          color: 'var(--prism-theme-color-primary-contrast-trans)',
        }
      case 'ERROR':
        return {
          background: 'var(--prism-theme-color-danger)',
          color: 'var(--prism-theme-color-danger-contrast-trans)',
        }
      default:
        return {
          color: 'var(--prism-theme-color-primary-contrast)',
          background: 'var(--prism-theme-color-primary-trans)',
        }
    }
  }
}

const StyledContainer = ({type, semitransparent, fillVertical, fillHorizontal, children}: GenericOverlayProps): JSX.Element => {
  const style: CSSProperties = {
    zIndex: 2,
    padding: '.5em',
    ...getCssColors(semitransparent, type)
  }

  const containerClass = classnames(
    'animate-delayedFadeIn',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'absolute',
    'top-0',
    'left-0',
    {
      'w-full': fillHorizontal,
      'w-auto': !fillHorizontal,
      'h-full': fillVertical,
      'h-auto': !fillVertical,
    },
  )

  return <div className={containerClass} style={style}>{children}</div>
}

const StyledContent = ({children}: JSX.ElementChildrenAttribute): JSX.Element => {
  const className = classnames(
    'text-inherit',
    'font-bold',
    'text-center'
  )

  const style: CSSProperties = {
    fontSize: '.8em',
    margin: '2px 0', // something truly small, just so things aren't touching
  }

  return <span className={className} style={style}>{children}</span>
}

function GenericOverlay(props: GenericOverlayProps): JSX.Element {
  const { type, message, children } = props
  // children take precedence over any message prop
  const output = children || message || null

  return (
    <StyledContainer {...props}>
      {(type === GenericOverlay.TYPES.LOADING) && (
        <StyledContent>
            <CircleLoader />
          </StyledContent>
      )}
      {output && (
        <StyledContent>
            {output}
          </StyledContent>
      )}
    </StyledContainer>
  )
}

GenericOverlay.defaultProps = {
  fillHorizontal: true,
  fillVertical: true
}

GenericOverlay.TYPES = {
  LOADING: 'LOADING',
  ERROR: 'ERROR',
  MESSAGE: 'MESSAGE'
}

export default GenericOverlay
