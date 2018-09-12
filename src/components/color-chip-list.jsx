import React, { PureComponent, Fragment } from 'react';
import { PropTypes } from 'prop-types';
import ColorChip from './color-chip.jsx';

class ColorChipList extends PureComponent {
  constructor( props ) {
		super( props );
		this.colorListType = this.props.colorListType && this.props.colorListType==="suggestion" ? "suggestion" : "color";
		if (this.colorListType==="suggestion") {
			this.suggestionButtonMethod = this.props.suggestionButtonMethod.bind(this);
		} else {
			this.onClickMethod = this.props.onClickMethod.bind(this);
		}
  }

  renderChip(x,y,z) {
		return <li className={this.colorListType + '-list__color'} key={y + "-" + z}><ColorChip bgColor={x} onClickMethod={()=>{this.onClickMethod(z)}} colorListType={this.colorListType} /></li>;
  }

  renderSuggestionChip(color, index) {
		return <li className={this.colorListType + '-list__color' + (this.props.isFavorited ? ' isFavorite' : '') } key={color.H + "-" + index}><ColorChip colorName={color.colorName} colorNumber={color.colorNumber} coordColor1={color.coordOneIndex} coordColor2={color.coordTwoIndex} bgColor={color.HSL} onClickMethod={()=>{this.suggestionButtonMethod(color, index)}} colorListType={this.colorListType} /></li>;
	}

	renderMoreSuggestionsButton() {	
		return <button style={{color: this.props.generateButtonTextColor, backgroundColor: this.props.generateButtonBackgroundColor}} onClick={this.props.generateButtonMethod} className={this.colorListType + '-list__generate-button'}>
						<svg style={{fill: this.props.generateButtonTextColor}} className="icon generate-suggestions-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
							<path d="M0 0h24v24H0z" fill="none"/>
						</svg>
						More Suggestions
					</button>
	}

  render() {
		console.log("color chip list render was called");
		return (
			<Fragment>
				{(() => {
					if(this.props.headerClickMethod) {
						return <h2 className="color-list__title" onClick={this.props.headerClickMethod}>
							{this.props.title}
						</h2>
					} else {
						return <h2 className="color-list__title">
							{this.props.title}
						</h2>
					}
				})()}
				
				<div className="color-list__content">
					<p className="color-list__copy">{this.props.copy}</p>

					{(() => {
						if(this.props.colors && this.props.colors.length) {
							return (
								<Fragment>
									{(() => {
										if (this.colorListType==="suggestion") {
											return this.renderMoreSuggestionsButton();
										}
									})()}

									<ul className={this.colorListType + '-list'}>
										{this.props.colors.map((color, index) => {
											if (this.colorListType==="suggestion") {
												return this.renderSuggestionChip(color, index);
											} else {
												return this.renderChip(color, index, this.props.onClickParameters[index]);
											}
										})}
									</ul>
								</Fragment>
							);
						}
					})()}
				</div>
			</Fragment>
		)
  }
}

ColorChipList.propTypes = {
	onClickMethod: PropTypes.func,
};

export default ColorChipList;