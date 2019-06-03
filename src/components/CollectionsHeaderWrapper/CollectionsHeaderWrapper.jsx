// @flow
import React from 'react'
import './CollectionsHeaderWrapper.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
}

type State = {
  isShowBack: boolean,
  header: string
}

const baseClass = 'collections-header'

const CollectionsHeaderWrapper = (WrappedComponent: any) => {
  class CollectionsHeader extends React.Component<Props, State> {
    constructor (props) {
      super(props)
      this.state = {
        isShowBack: false,
        header: ''
      }
      this.showBack = this.showBack.bind(this)
      this.backHandler = this.backHandler.bind(this)
      this.setHeader = this.setHeader.bind(this)
    }

    showBack () {
      this.setState({
        isShowBack: true
      })
    }

    backHandler () {
      this.setState({
        isShowBack: false
      })
    }

    setHeader (header) {
      this.setState({
        header
      })
    }

    render () {
      const { isShowBack, header } = this.state

      return (
        <div className={`${baseClass}__wrapper`}>
          <div className={`${baseClass}__header`}>
            <div className={`${baseClass}__heading`}>{header}</div>
            {(isShowBack) ? <button className={`${baseClass}__button ${baseClass}__button--left`} onClick={this.backHandler}>
              <div><FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />&nbsp;<span className={`${baseClass}__button-left-text`}>BACK</span></div>
            </button> : ''}
            <button className={`${baseClass}__button ${baseClass}__button--right`}>
              <div className={`${baseClass}__close`}><span>CLOSE</span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></div>
              <div className={`${baseClass}__cancel`}><FontAwesomeIcon className={``} icon={['fa', 'times']} /></div>
            </button>
          </div>
          <div className={`${baseClass}__content`}>
            <WrappedComponent {...this.props} showBack={this.showBack} isShowBack={isShowBack} setHeader={this.setHeader} />
          </div>
        </div>
      )
    }
  }

  return CollectionsHeader
}

export default CollectionsHeaderWrapper
