/* eslint-disable */
import React, { PureComponent, Fragment } from 'react';
import { PropTypes } from 'prop-types';
import {colorDBIndices, colorsComplete} from '../common/processed-colors.js';
import RoomScene from '../Tinter/scene.jsx';
import ColorChipList from '../Chip-List/color-chip-list.jsx';
import ColorPicker from '../common/color-picker.js';

class ColorPath extends PureComponent {
	// state = {
	// 	colorSelectClass: 'state-select-families',
	// 	chosenHueValue: 0,
	// 	chosenSaturationValue: 50,
	// 	chosenLuminosityValue: 100,
	// 	chosenHueIndex: 0,
	// 	chosenCoordColorOneIndex: 0,
	// 	chosenCoordColorTwoIndex: 0,
	// 	CoordColorOneName: '',
	// 	CoordColorOneNumber: '',
	// 	CoordColorTwoName: '',
	// 	CoordColorTwoNumber: '',
	// 	CoordColorOneGradient: '',
	// 	CoordColorTwoGradient: '',
	// 	valueListColors: [],
	// 	suggestionListColors: [],
	// 	favoritesListColors: [],
	// 	isFamilyChosen: false,
	// 	isValueChosen: false,
	// 	isDetailDisplayed: false,
	// 	isAnimating: false,
	// 	isFirstTintApplied: false,
	// 	isPrimedForGeneration: false,
	// 	primaryTintColor: '',
	// 	secondaryTintColor: '',
	// 	fixtureHueRotation: 0,
	// }

	constructor( props ) {
		super( props );

		this.state = {
			colorSelectClass: 'state-select-families',
			chosenHueValue: 0,
			chosenSaturationValue: 50,
			chosenLuminosityValue: 100,
			chosenHueIndex: 0,
			chosenCoordColorOneIndex: 0,
			chosenCoordColorTwoIndex: 0,
			CoordColorOneName: '',
			CoordColorOneNumber: '',
			CoordColorTwoName: '',
			CoordColorTwoNumber: '',
			CoordColorOneGradient: '',
			CoordColorTwoGradient: '',
			valueListColors: [],
			suggestionListColors: [],
			favoritesListColors: [],
			isFamilyChosen: false,
			isValueChosen: false,
			isDetailDisplayed: false,
			isAnimating: false,
			isFirstTintApplied: false,
			isPrimedForGeneration: false,
			primaryTintColor: '',
			secondaryTintColor: '',
			fixtureHueRotation: 0,
		};

		
		this.toggleDetailState  = this.toggleDetailState.bind(this);
		this.handleFamilyChoice  = this.handleFamilyChoice.bind(this);
		this.handleValueChoice  = this.handleValueChoice.bind(this);
		this.handleApplyColorToScene  = this.handleApplyColorToScene.bind(this);
		this.handleSelectFavoriteChoice  = this.handleSelectFavoriteChoice.bind(this);
		this.displayFamilyList = this.displayFamilyList.bind(this);
		this.displayValueList = this.displayValueList.bind(this);
	
		this.familyListColors = ["hsl(0, 100%, 50%)","hsl(39, 100%, 50%)","hsl(60, 100%, 50%)" ,"hsl(121, 50%, 40%)","hsl(241, 98%, 46%)","hsl(300, 100%, 25%)","hsl(39, 25%, 50%)","hsl(300, 25%, 90%)"];
		this.familyListHueValues = [{hueIndex:0, colorsByhueIndex: 1}, {hueIndex:39, colorsByhueIndex:1303}, {hueIndex:60, colorsByhueIndex:1739}, {hueIndex:121, colorsByhueIndex:2013}, {hueIndex:241, colorsByhueIndex:2719}, {hueIndex:300, colorsByhueIndex:2809}, {hueIndex:39, colorsByhueIndex:501}, {hueIndex:301, colorsByhueIndex:2500}];
		this.valueListLuminosityValues = ['18','34','50','66','82'];
		this.suggestionsRaw = [];
		this.ColorPicker = new ColorPicker();
	}

	handleFamilyChoice( chosenHueValue ) {
		this.setState({ isFamilyChosen: true, colorSelectClass: 'state-select-value', chosenHueIndex: chosenHueValue.colorsByhueIndex, chosenHueValue: chosenHueValue.hueIndex, valueListColors: ["hsl( " + chosenHueValue.hueIndex + ", 100%, 18% )","hsl( " + chosenHueValue.hueIndex + ", 100%, 34% )","hsl( " + chosenHueValue.hueIndex + ", 100%, 50% )","hsl( " + chosenHueValue.hueIndex + ", 100%, 66% )","hsl( " + chosenHueValue.hueIndex + ", 100%, 82% )"], });
	}

	displayFamilyList() {
		this.setState({ colorSelectClass: 'state-select-families' });
	}

	displayValueList() {
		this.setState({ colorSelectClass: 'state-select-value' });
	}

	handleValueChoice( chosenLuminosity ) {
		let generateButtonTextColor = '#fff';

		if (chosenLuminosity > 49) {
			generateButtonTextColor = '#000';
		}
		console.log('generateButtonBackgroundColor in handleValueChoice'+ `hsl(${this.state.chosenHueValue},90%,${chosenLuminosity}%)`);
		this.setState(
			{
				isValueChosen: true,
				generateButtonBackgroundColor: `hsl(${this.state.chosenHueValue},90%,${chosenLuminosity}%)`,
				generateButtonTextColor: generateButtonTextColor,
				colorSelectClass: 'state-select-favorites',
				chosenLuminosityValue: chosenLuminosity
			}, () => {
				(() => { this.generateSuggestionList(); })();
			}
		);
	}

	handleSelectFavoriteChoice( newFavorite ) {
		this.state.suggestionListColors[newFavorite.suggestionListIndex].isFavorited = true;
	}

	handleApplyColorToScene( newFavorite ) {
		let tintingInfo = this.tintScene(newFavorite.HSL, newFavorite.H),
			primaryTintGradient = tintingInfo.primaryGradient,
			fixtureHueRotation = tintingInfo.fixtureHue,
			displayLuminosity = newFavorite.L,
			coordColorData = this.getCoordColors(newFavorite.coordOneIndex, newFavorite.coordTwoIndex, newFavorite.L);

		if (displayLuminosity >= 50){
			displayLuminosity = 30 - (100 - displayLuminosity) < 5 ? 5 : 30 - (100 - displayLuminosity);
		} else {
			displayLuminosity = 70 + displayLuminosity > 95 ? 95 : 70 + displayLuminosity;
		}

		this.setState({
				primaryTintColor: newFavorite.HSL, //"hsl( 11.02301, 53.0004346724%, 53.002438% )",
				primaryGradient: primaryTintGradient,
				fixtureHueRotation: fixtureHueRotation,
				isFirstTintApplied: true,
				isPrimedForGeneration: true,
				colorNumber: newFavorite.colorNumber,
				colorName: newFavorite.colorName,
				displayColor: `hsl(${newFavorite.H}, ${newFavorite.S}%, ${displayLuminosity}%)`,
				chosenHueIndex: newFavorite.hueArrayIndex,
				chosenHueValue: newFavorite.H,
				chosenSaturationValue: newFavorite.S,
				chosenLuminosityValue: newFavorite.L,
				secondaryTintColor:			coordColorData.CoordColorOneColor,
				CoordColorOneGradient:		coordColorData.CoordColorOneGradient,
				CoordColorTwoGradient:		coordColorData.CoordColorTwoGradient,
				CoordColorOneDisplayColor: 	coordColorData.CoordColorOneDisplayColor,
				CoordColorOneName:			coordColorData.CoordColorOneName,
				CoordColorOneNumber:		coordColorData.CoordColorOneNumber,
				CoordColorTwoName:			coordColorData.CoordColorTwoName, 
				CoordColorTwoNumber:		coordColorData.CoordColorTwoNumber,
				CoordColorTwoDisplayColor:	coordColorData.CoordColorTwoDisplayColor,
				generateButtonTextColor: '',
				generateButtonBackgroundColor: '',
		});
	}

	generateSuggestionList() {
		let {chosenHueIndex, chosenHueValue, chosenSaturationValue, chosenLuminosityValue} = this.state;
		let suggestionsRaw = [],
			suggestionsList = [];

		suggestionsRaw = this.ColorPicker.findMatches(chosenHueIndex, chosenHueValue, chosenSaturationValue, chosenLuminosityValue);
		suggestionsList = suggestionsRaw.map(function(color, index) {
			return {suggestionListIndex: index, isFavorited: false, hueArrayIndex: color.hueArrayIndex, colorName: color.colorName, colorNumber: color.colorNumber, hueArrayIndex: color.hueArrayIndex, HSL: `hsl( ${color.hue}, ${color.saturation}%, ${color.luminance}% )`, H:color.hue, S:color.saturation, L:color.luminance, coordOneIndex: color.coordOneIndex, coordTwoIndex: color.coordTwoIndex};
		});

		this.setState({ suggestionListColors: suggestionsList, chosenHueValue: chosenHueValue, isPrimedForGeneration: false });
	}

	tintScene(newColor, newColorH) {
		let colorToHSLA = newColor.slice(5, -1),
			primaryGradient = `linear-gradient(-12deg, hsla( ${colorToHSLA}, 0.4 ) 0%, hsla( ${colorToHSLA}, 1 ) 48%, hsla( ${colorToHSLA}, 1) 100%)`,
			fixtureHue = 180 - (Math.abs(parseInt(newColorH, 10) - 200));

			if (fixtureHue < 0) {
				fixtureHue += 360;
			}

		return {primaryGradient: primaryGradient, fixtureHue: fixtureHue};
	}

	getCoordColors(chosenCoordColorOneIndex, chosenCoordColorTwoIndex) {
		let coord1Index = colorDBIndices.indexOf(parseInt(chosenCoordColorOneIndex, 10)),
			coord2Index = colorDBIndices.indexOf(parseInt(chosenCoordColorTwoIndex, 10)),
			coord1Name = colorsComplete[ coord1Index * 7 ],
			coord1Number = colorsComplete[ coord1Index * 7 + 1 ],
			coord1Hue = colorsComplete[ coord1Index * 7 + 2 ],
			coord1Saturation = colorsComplete[ coord1Index * 7 + 3 ],
			coord1Luminosity = parseInt(colorsComplete[ coord1Index * 7 + 4 ], 10),
			coord2Name = colorsComplete[ coord2Index * 7 ],
			coord2Number = colorsComplete[ coord2Index * 7 + 1 ],
			coord2Hue = colorsComplete[ coord2Index * 7 + 2 ],
			coord2Saturation = colorsComplete[ coord2Index * 7 + 3 ],
			coord2Luminosity = parseInt(colorsComplete[ coord2Index * 7 + 4 ], 10),
			coord1HSL = `${colorsComplete[ coord1Index * 7 + 2 ]}, ${colorsComplete[ coord1Index * 7 + 3 ]}, ${colorsComplete[ coord1Index * 7 + 4 ]}`,
			coord2HSL = `${colorsComplete[ coord2Index * 7 + 2 ]}, ${colorsComplete[ coord2Index * 7 + 3 ]}, ${colorsComplete[ coord2Index * 7 + 4 ]}`,
			coordOneGradient = `linear-gradient(-12deg, hsla( ${coord1HSL}, 0.4 ) 0%, hsla( ${coord1HSL}, 1 ) 48%, hsla( ${coord1HSL}, 1) 100%)`,
			coordTwoGradient = `linear-gradient(-12deg, hsla( ${coord2HSL}, 0.4 ) 0%, hsla( ${coord2HSL}, 1 ) 48%, hsla( ${coord2HSL}, 1) 100%)`;

		if (coord1Luminosity >= 50){
			coord1Luminosity = 30 - (100 - coord1Luminosity) < 5 ? 5 : 30 - (100 - coord1Luminosity);
		} else {
			coord1Luminosity = 70 + coord1Luminosity > 95 ? 95 : 70 + coord1Luminosity;
		}

		if (coord2Luminosity >= 50){
			coord2Luminosity = 30 - (100 - coord2Luminosity) < 5 ? 5 : 30 - (100 - coord2Luminosity);
		} else {
			coord2Luminosity = 70 + coord2Luminosity > 95 ? 95 : 70 + coord2Luminosity;
		}

		return {
			CoordColorOneGradient:		coordOneGradient,
			CoordColorTwoGradient:		coordTwoGradient,
			CoordColorOneColor:			`hsl(${coord1HSL})`,
			CoordColorOneName:			coord1Name,
			CoordColorOneNumber:		coord1Number,
			CoordColorOneDisplayColor:	`hsl(${coord1Hue}, ${coord1Saturation}, ${coord1Luminosity}%)`,
			CoordColorTwoName:			coord2Name,
			CoordColorTwoNumber:		coord2Number,
			CoordColorTwoDisplayColor:	`hsl(${coord2Hue}, ${coord2Saturation}, ${coord2Luminosity}%)`
		}
	}

	toggleDetailState() {
		this.setState(
			{
				isAnimating: !this.state.isAnimating,
				isDetailDisplayed: !this.state.isDetailDisplayed,
			}
		);

		window.setTimeout( ( ) => {
			this.setState({ isAnimating: !this.state.isAnimating });
		}, 800 );
	}

	render() {
			const {isPrimedForGeneration, colorNumber, colorName, displayColor, CoordColorOneName, CoordColorOneNumber, CoordColorOneGradient, CoordColorOneDisplayColor, CoordColorTwoName, CoordColorTwoNumber, CoordColorTwoGradient, CoordColorTwoDisplayColor, primaryTintColor, secondaryTintColor, primaryGradient, fixtureHueRotation, isFamilyChosen, isValueChosen, isDetailDisplayed, isAnimating, colorSelectClass, valueListColors, suggestionListColors, favoritesListColors, isFirstTintApplied, generateButtonTextColor, generateButtonBackgroundColor} = this.state,
				familyListColorsTitle = isFamilyChosen ?  "1: You chose Blues" : "1: Choose a Color Family",
				valueListColorsTitle = isValueChosen ?  "2: You chose dark" : "2: Choose the Brightness",
				detailClass = isDetailDisplayed ? " state-detail" : "",
				colorInfoCTAcopy = isDetailDisplayed ? " Hide details" : "Show Details",
				animatingClass = isAnimating ? " state-detail-animating" : "",
				showInfoLinkClass = isFirstTintApplied ? " state-is-tinted" : "",
				showMoreSuggestionsClass = isPrimedForGeneration ? " state-primedForGeneration" : "",
				favoriteCTAcopy = "Add to Favorites",
				appClass = colorSelectClass + detailClass + animatingClass + showInfoLinkClass + showMoreSuggestionsClass;

			return (
				// <Provider store={store}>
					<Fragment>
							<div className={appClass + " color-set-wrapper " + this.state.testReduxProp}>
									<div className="color-list__wrapper color-list__wrapper--families">
											<ColorChipList headerClickMethod={this.	displayFamilyList} onClickMethod={this.handleFamilyChoice} onClickParameters={this.familyListHueValues} colors={this.familyListColors} copy="Choose a color family, neutrals, or whites" title={familyListColorsTitle} />
									</div>

									<div className="color-list__wrapper color-list__wrapper--value">
											<ColorChipList headerClickMethod={this.	displayValueList} onClickMethod={this.handleValueChoice} onClickParameters={this.valueListLuminosityValues} colors={valueListColors} copy="Choose how dark or light" title={valueListColorsTitle} />
									</div>

									<div className="color-list__wrapper color-list__wrapper--suggestions">
											<ColorChipList generateButtonBackgroundColor={generateButtonBackgroundColor} generateButtonTextColor={generateButtonTextColor} colorListType="suggestion" generateButtonMethod={()=>{this.generateSuggestionList()}} suggestionButtonMethod={this.handleApplyColorToScene} colors={suggestionListColors} copy="Click a color to tint the scene" title="3: Choose a Favorite" />
									</div>

									
							</div>

							<div className={appClass + " scene"}>
								<RoomScene onFavoriteMethod={this.handleSelectFavoriteChoice} onClickMethod={this.toggleDetailState} favoriteCTAcopy={favoriteCTAcopy} colorInfoCTAcopy={colorInfoCTAcopy} colorNumber={colorNumber} colorName={colorName} displayColor={displayColor} CoordColorOneName={CoordColorOneName} CoordColorOneNumber={CoordColorOneNumber} CoordColorOneGradient={CoordColorOneGradient} CoordColorOneDisplayColor={CoordColorOneDisplayColor} CoordColorTwoName={CoordColorTwoName} CoordColorTwoNumber={CoordColorTwoNumber} CoordColorTwoGradient={CoordColorTwoGradient} CoordColorTwoDisplayColor={CoordColorTwoDisplayColor} tintColor={primaryTintColor} secondaryTintColor={secondaryTintColor} primaryGradient={primaryGradient} fixtureHueRotation={fixtureHueRotation} isLower={false} keyIndex="scene1"/>
							</div>
					</Fragment>
				// </Provider>
			)
	}
}

ColorPath.propTypes = {
	familyListColors: PropTypes.array,
	valueListColors: PropTypes.array,
	suggestionListColors: PropTypes.array,
	favoritesListColors: PropTypes.array,
	onClickMethod: PropTypes.func,
};

export default ColorPath;