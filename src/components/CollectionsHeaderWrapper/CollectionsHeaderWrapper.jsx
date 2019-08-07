// @flow
import React from 'react'
import './CollectionsHeaderWrapper.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

type Props = {
}

type State = {
  isShowBack: boolean,
  header: string
}

const baseClass = 'collections-header'
const wrapper = `${baseClass}__wrapper`
const wrapperHeader = `${baseClass}__header`
export const heading = `${baseClass}__heading`
const button = `${baseClass}__button`
export const buttonLeft = `${baseClass}__button--left`
const buttonLeftText = `${baseClass}__button-left-text`
export const buttonRight = `${baseClass}__button--right`
const buttonClose = `${baseClass}__close`
const buttonCancel = `${baseClass}__cancel`
const wrapperContent = `${baseClass}__content`

const CollectionsHeaderWrapper = (WrappedComponent: any) => {
  class CollectionsHeader extends React.Component<Props, State> {
    constructor (props: Props) {
      super(props)
      this.state = {
        isShowBack: false,
        header: ''
      }
      this.showBack = this.showBack.bind(this)
      this.backHandler = this.backHandler.bind(this)
      this.setHeader = this.setHeader.bind(this)
    }
    /*:: showBack: () => void */
    showBack (): void {
      this.setState({
        isShowBack: true
      })
    }

    /*:: backHandler: () => void */
    backHandler (): void {
      this.setState({
        isShowBack: false
      })
    }

    /*:: setHeader: () => void */
    setHeader (header: string): void {
      this.setState({
        header
      })
    }

    render () {
      const { isShowBack, header } = this.state

      return (
        <div className={`${wrapper}`}>
          <div className={`${wrapperHeader}`}>
            <div className={`${heading}`}>{header}</div>
            {(isShowBack) ? <button className={`${button} ${buttonLeft}`} onClick={this.backHandler}>
              <div><FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />&nbsp;<span className={`${buttonLeftText}`}>BACK</span></div>
            </button> : ''}
            <Link to={`/active`}>
              <button className={`${button} ${buttonRight}`}>
                <div className={`${buttonClose}`}><span>CLOSE</span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></div>
                <div className={`${buttonCancel}`}><FontAwesomeIcon className={``} icon={['fa', 'times']} /></div>
              </button>
            </Link>
          </div>
          <div className={`${wrapperContent}`}>
            <WrappedComponent {...this.props} showBack={this.showBack} isShowBack={isShowBack} setHeader={this.setHeader} />
          </div>
        </div>
      )
    }
  }

  return CollectionsHeader
}

export default CollectionsHeaderWrapper
