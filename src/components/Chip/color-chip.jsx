/* eslint-disable */
import React, { PureComponent, Fragment } from 'react';

class ColorChip extends PureComponent {
  constructor( props ) {
    super( props );
    this.onClickMethod = this.props.onClickMethod.bind(this);
    this.colorListType = this.props.colorListType && this.props.colorListType==="suggestion" ? "suggestion" : "color";
  }

  render() {
    return (
      <Fragment>
        {(() => {
          if (this.colorListType==="suggestion") {
            return  <button onClick={this.props.onClickMethod} className={this.props.colorListType + '-list__button'} style={{backgroundColor: this.props.bgColor}}>
                      <svg className="icon icon-heart-full" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 19.788 19.788">
                        <path d="M 8.634 17.069 C 8.78 17.194 17.049 10.276 18.109 6.185 C 18.535 4.541 18.141 3.159 17.389 2.171 C 16.629 1.174 15.424 0.601 13.702 0.416 C 13.565 0.402 13.419 0.394 13.271 0.394 C 11.782 0.394 10.093 1.115 9.109 2.48 C 8.124 1.115 6.437 0.394 4.949 0.394 C 4.8 0.394 4.655 0.402 4.517 0.416 C 2.795 0.602 1.591 1.175 0.831 2.17 C 0.078 3.158 -0.165 4.509 0.108 6.185 C 0.775 10.258 8.313 16.792 8.634 17.069 Z M 17.035 6.816 C 17.035 6.816 16.743 2.445 12.858 1.862 C 12.858 1.862 17.521 1.182 17.035 6.816 Z"/>
                      </svg>
                    </button>
          } else {
            return <button onClick={this.props.onClickMethod} className={this.props.colorListType + '-list__button'} style={{backgroundColor: this.props.bgColor}}></button>
          }
        })()}
      </Fragment>
    )
  }
}

export default ColorChip;