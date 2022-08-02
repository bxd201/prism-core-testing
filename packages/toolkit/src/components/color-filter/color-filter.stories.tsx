// import React from 'react'
// import ColorFilter from './color-filter'
// import colors from '../../test-utils/mocked-endpoints/colors.json'
// // @ts-ignore
// import hue from '../../test-utils/images/hue.png'
// // @ts-ignore
// import hsl from '../../test-utils/images/hsl.png'
//
// const Template = (args: {
//   hueEnd?: number,
//   hueStart?: number,
//   lightnessEnd?: number,
//   lightnessStart?: number,
//   saturationEnd?: number,
//   saturationStart?: number
// }): JSX.Element => (
//   <>
//     { /* @ts-ignore */ }
//     <ColorFilter
//       {...args}
//       hue={{ start: args.hueStart, end: args.hueEnd }}
//       lightness={{ start: args.lightnessStart, end: args.lightnessEnd }}
//       saturation={{ start: args.saturationStart, end: args.saturationEnd }}
//     />
//     <img className='hidden' src={hue} />
//     <img className='hidden' src={hsl} />
//   </>
// )
//
// export const HSL = Template.bind({})
// HSL.args = {
//   colors: colors.map((color) => color),
//   hueStart: 0,
//   hueEnd: 100,
//   saturationStart: 0,
//   saturationEnd: 100,
//   lightnessStart: 0,
//   lightnessEnd: 100,
//   filterInByColorNumber: [0, 0, 0, 0, 0]
// }
//
// export const Calm = Template.bind({})
// Calm.args = {
//   colors: colors.map((color) => color),
//   hueStart: 29,
//   hueEnd: 80,
//   saturationStart: 32,
//   saturationEnd: 100,
//   lightnessStart: 47,
//   lightnessEnd: 100,
//   filterInByColorNumber: [6598, 6591, 9693, 6597, 9627]
// }
//
// export const Sepia = Template.bind({})
// Sepia.args = {
//   colors: colors.map((color) => color),
//   hueStart: 0,
//   hueEnd: 10,
//   saturationStart: 13,
//   saturationEnd: 44,
//   lightnessStart: 23,
//   lightnessEnd: 100,
//   filterInByColorNumber: [6370, 6363, 6383, 0, 0]
// }
//
// export const Pastel = Template.bind({})
// Pastel.args = {
//   colors: colors.map((color) => color),
//   hueStart: 0,
//   hueEnd: 100,
//   saturationStart: 32,
//   saturationEnd: 100,
//   lightnessStart: 67,
//   lightnessEnd: 100,
//   filterInByColorNumber: [0, 0, 0, 0, 0]
// }
//
// export const BlueGreen = Template.bind({})
// BlueGreen.args = {
//   colors: colors.map((color) => color),
//   hueStart: 26,
//   hueEnd: 76,
//   saturationStart: 24,
//   saturationEnd: 100,
//   lightnessStart: 18,
//   lightnessEnd: 78,
//   filterInByColorNumber: [0, 0, 0, 0, 0]
// }
//
// export const Rich = Template.bind({})
// Rich.args = {
//   colors: colors.map((color) => color),
//   hueStart: 0,
//   hueEnd: 100,
//   saturationStart: 24,
//   saturationEnd: 100,
//   lightnessStart: 15,
//   lightnessEnd: 32,
//   filterInByColorNumber: [0, 0, 0, 0, 0]
// }
//
// export default {
//   title: 'ColorFilter',
//   component: ColorFilter,
//   argTypes: {
//     setupDownloadLabel: { description: 'HSL filter setup text label' },
//     hueStart: {
//       control: { type: 'range', min: 0, max: 100 },
//       description: 'start hue percentage number to filter color<br /> `storybook args only`'
//     },
//     hueEnd: {
//       control: { type: 'range', min: 0, max: 100 },
//       description: 'end hue percentage number to filter color<br /> `storybook args only`'
//     },
//     saturationStart: {
//       control: { type: 'range', min: 0, max: 100 },
//       description: 'start saturation percentage number to filter color<br /> `storybook args only`'
//     },
//     saturationEnd: {
//       control: { type: 'range', min: 0, max: 100 },
//       description: 'end saturation percentage number to filter color<br /> `storybook args only`'
//     },
//     lightnessStart: {
//       control: { type: 'range', min: 0, max: 100 },
//       description: 'start lightness percentage number to filter color<br /> `storybook args only`'
//     },
//     lightnessEnd: {
//       control: { type: 'range', min: 0, max: 100 },
//       description: 'end lightness percentage number to filter color<br /> `storybook args only`'
//     },
//     filterInByColorNumber: {
//       control: { type: 'array' },
//       description: 'write color numbers to be filtered in (e.g. 2940)'
//     },
//     colors: { control: false },
//     hue: {
//       control: false,
//       description: 'hue range object'
//     },
//     lightness: {
//       control: false,
//       description: 'lightness range object'
//     },
//     saturation: {
//       control: false,
//       description: 'saturation range object'
//     }
//   }
// }
