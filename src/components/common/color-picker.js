import {colorsComplete, colorsByH, colorsByS, colorsByL} from './processed-colors';

class ColorPicker {
    // -------------------------------------------------
    // ASSUMPTIONS:
        // Choices of next colors will always be driven by the hueSorted list. We can weight any of the three attributes in order to
        // guide the fitness determination along those dimensions
        //
        // A given set will have the HSL for each of its members set by calling findMatches() in the previous set
    // -------------------------------------------------
/*  -------------------------------------------------
EXAMPLE of a color in colorsComplete:
"Exuberant Pink","6840","331.15384615384613","41.26984126984129%","50.588235294117645%","11364","11335","Dragon Fruit","6855","343.1775700934579","51.19617224880384%","59.01960784313726%","11364","11360","Cherries Jubilee", ....
The index of Exuberant Pink in colorsComplete is 0, its index in colorsByH is 2848 for its hue value

EXAMPLE of a color in colorsByH: (hue first, index in colorsComplete of that color second
const colorsByH = [ 0,884, 0,1446, 0,911, ....
------------------------------------------------- */

/*  -------------------------------------------------
------------------------------------------------- */
    constructor() {
        this.allColors = [];
        this.allColorsBest = [];
        this.allColorsBetter = [];
        this.allColorsGood = [];
        // this.isStateDetail = false;
        this.colorPrefByHue = [];
    }

    testMatchFitness( hueArrayIndex, startingHue = 180, startSaturation = 50, startLuminisity = 50 ) {
        // console.log('############## inside test fitness hueArrayIndex: ' + hueArrayIndex);
        // console.log('startingHue: ' + startingHue);
        // console.log('startSaturation: ' + startSaturation);
        // console.log('startLuminisity: ' + startLuminisity);
        // console.log("testing a match");
        /*  -------------------------------------------------
        "startingHue" and other HSL values are those of the selected chip color, other possible matches are compared to it
        -------------------------------------------------  */
        // console.log('----- indexOfNextHue', parseInt( colorsByH[ hueArrayIndex ] , 10))

        let indexOfNextHue = parseInt( colorsByH[ hueArrayIndex ] , 10), // This the color's index in colorsComplete
            thisColor = {},
            hue = parseFloat( colorsComplete[ indexOfNextHue * 7 + 2 ], 10),
            saturation = parseFloat( colorsComplete[ indexOfNextHue * 7 + 3 ], 10),
            luminance = parseFloat( colorsComplete[ indexOfNextHue * 7 + 4 ], 10),
            hueDiff = Math.abs( startingHue - hue ) * 0.4,
            satDiff = Math.abs( startSaturation - saturation ) * 0.85,
            lumDiff = Math.abs( startLuminisity - luminance ),
            currentHueBand = parseInt(startingHue/36, 10) - 1,
            colorPrefByHueIndex = 0,
            currentSatTotal,
            currentSatCount;

            // console.log('currentHueBand: ' + currentHueBand);

            // _.each(colorPrefByHueIndex, function(hueBand, index) {
            //     if (hueBand = index) {
            //         this.colorPrefByHue[currentHueBand] = this.colorPrefByHue[currentHueBand] || {};

            //         if (this.colorPrefByHue[currentHueBand].saturationValueTotal) {
            //             currentSatTotal = this.colorPrefByHue[currentHueBand].saturationValueTotal + saturation * 10;
            //             currentSatCount = this.colorPrefByHue[currentHueBand].saturationValueCount + 10;
            //         } else {
            //             currentSatTotal = saturation * 10;
            //             currentSatCount = 10;
            //         }
            //         this.colorPrefByHue[currentHueBand].saturationValueTotal = currentSatTotal;
            //         this.colorPrefByHue[currentHueBand].saturationValueCount = currentSatCount;

            //         if (this.colorPrefByHue[currentHueBand].LuminanceValueTotal) {
            //             currentLumTotal = this.colorPrefByHue[currentHueBand].LuminanceValueTotal + Luminance * 10;
            //             currentLumCount = this.colorPrefByHue[currentHueBand].LuminanceValueCount + 10;
            //         } else {
            //             currentLumTotal = Luminance * 10;
            //             currentLumCount = 10;
            //         }
            //         this.colorPrefByHue[currentHueBand].LuminanceValueTotal = currentLumTotal;
            //         this.colorPrefByHue[currentHueBand].LuminanceValueCount = currentLumCount;
            //     }

            //     console.log('hueBand: ' + hueBand);
            // });


            // console.log('###### testing this hue: ', hue);

        if ( hueDiff + satDiff + lumDiff < 30 ) {
            thisColor.hueArrayIndex = hueArrayIndex;
            thisColor.colorName = colorsComplete[ indexOfNextHue * 7 ];
            thisColor.colorNumber = colorsComplete[ indexOfNextHue * 7 + 1 ];
            thisColor.hue = hue;
            thisColor.saturation = saturation;
            thisColor.luminance = luminance;
            thisColor.coordOneIndex = colorsComplete[ indexOfNextHue * 7 + 5 ];
            thisColor.coordTwoIndex = colorsComplete[ indexOfNextHue * 7 + 6 ];
            this.allColors.push( thisColor );
            // this.allColorsBest.push( thisColor );
        } 
        // else if ( hueDiff + satDiff + lumDiff < 50 ) {
        //     thisColor.hueArrayIndex = hueArrayIndex;
        //     thisColor.colorName = colorsComplete[ indexOfNextHue * 7 ];
        //     thisColor.colorNumber = colorsComplete[ indexOfNextHue * 7 + 1 ];
        //     thisColor.hue = hue;
        //     thisColor.saturation = saturation;
        //     thisColor.luminance = luminance;
        //     thisColor.coordOneIndex = colorsComplete[ indexOfNextHue * 7 + 5 ];
        //     thisColor.coordTwoIndex = colorsComplete[ indexOfNextHue * 7 + 6 ];
        //     this.allColorsBetter.push( thisColor );
        // } else if ( hueDiff + satDiff + lumDiff < 70 ) {
        //     thisColor.hueArrayIndex = hueArrayIndex;
        //     thisColor.colorName = colorsComplete[ indexOfNextHue * 7 ];
        //     thisColor.colorNumber = colorsComplete[ indexOfNextHue * 7 + 1 ];
        //     thisColor.hue = hue;
        //     thisColor.saturation = saturation;
        //     thisColor.luminance = luminance;
        //     thisColor.coordOneIndex = colorsComplete[ indexOfNextHue * 7 + 5 ];
        //     thisColor.coordTwoIndex = colorsComplete[ indexOfNextHue * 7 + 6 ];
        //     this.allColorsGood.push( thisColor );
        // }
    };

    findMatches( hueIndex, startingHueParam = 180, startSaturation = 50, startLuminisity = 50 ) {
        /*  -------------------------------------------------
        Find the 50 next closest colors by Hue, moving forward from the current color. For each color test it's fitness as a match.
        Then repeat with 50 more colors, moving baackward from the current color.
        ------------------------------------------------- */

        this.allColors = []; // Clear out previous matches

        let hueArrayIndex = parseInt(hueIndex, 10),
            nextArrayIndex = hueArrayIndex,
            startingHue = parseFloat(startingHueParam),
            // hueArrayCounter = 0, // Because the hue is first and the hue index is second?
            y = 0;

        /*  -------------------------------------------------
        Find the colorsByH index for the current hue we are concerned with, if we didn't pass it to the method
        ------------------------------------------------- */
        // if (hueIndex < 0) {
        //     hueArrayIndex = 0;
        //     // console.log('############ checking for a hue match for: ' + startingHue + ' at: ' + hueArrayIndex + ' which returns hue: ' + parseFloat(colorsByH[hueArrayIndex]));
        //     while (hueArrayCounter < colorsByH.length) {
        //         if (startingHue - parseFloat(colorsByH[hueArrayCounter]) < 0.5) {
        //             // console.log('startingHue INSIDE MATCH: ' + startingHue);
        //             // console.log('hueArrayCounter INSIDE MATCH: ' + hueArrayCounter);
        //             // console.log('colorsByH[hueArrayCounter]: ' + parseFloat(colorsByH[hueArrayCounter]));
        //             // console.log('############################ matching hueArrayIndex ' + hueArrayIndex + ' which is hue ' + colorsByH[hueArrayCounter]);

        //             hueArrayIndex = hueArrayCounter; 
        //             nextArrayIndex = hueArrayIndex;
        //             hueArrayCounter = colorsByH.length; // Will kick us out of loop
        //         }
        //         hueArrayCounter += 2;
        //     }
        // } else {
        //     nextArrayIndex = hueIndex;
        //     hueArrayIndex = hueIndex;
        // }
        
        /*  -------------------------------------------------
        Next we test each of those 100 colors' fitness as a match.
        ------------------------------------------------- */
        while (y < 200 && this.allColors.length < 6) {
            y += 2;
            // console.log("testing for hue match, +");
            // console.log("testing for hue match at: " + nextArrayIndex);
            if ( nextArrayIndex + 2 >= colorsByH.length ) { // Starting at 2 because the master index value FOLLOWS the hue value in that array, and we want to start with the NEXT color
                nextArrayIndex = 0;
            } else {
                nextArrayIndex += 2;
            }

            this.testMatchFitness( nextArrayIndex, startingHue, startSaturation, startLuminisity);
        }

        nextArrayIndex = hueArrayIndex; // Setting this back to the inital value so that we can work our way down
        y = 0;

        while (y < 200 && this.allColors.length < 12) {
            y += 2;
            // console.log("testing for hue match, -");
            // console.log("testing for hue match at: " + nextArrayIndex);
            if ( nextArrayIndex - 2 < 1 ) { // Starting at -2 because the master index value FOLLOWS the hue value in that array, and we want to start with the NEXT color
                nextArrayIndex = colorsByH.length;
            } else {
                nextArrayIndex -= 2;
            }

            this.testMatchFitness( nextArrayIndex, startingHue, startSaturation, startLuminisity);
        };
        // console.log('allColors returned from Color Picker');
        // console.log(this.allColors);

        return this.allColors;
    }
}  // End ColorPicker Class

export default ColorPicker;