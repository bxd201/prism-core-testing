/**
 * TODO: Clean this up and make PR against 
 */

declare type HSLInput = {
  h: number | string,
  s: number | string,
  l: number | string,
  a?: number | string
}
declare type HSLOutput = {
  h: number,
  s: number,
  l: number,
  a?: number
}

declare type HSVInput = {
  h: number | string,
  s: number | string,
  v: number | string,
  a?: number | string
}
declare type HSVOutput = {
  h: number,
  s: number,
  v: number,
  a?: number
}

declare type RGBInput = {
  r: number | string,
  g: number | string,
  b: number | string,
  a?: number | string
}

declare type RGBOutput = {
  r: number,
  g: number,
  b: number,
  a?: number
}

declare type RGBStringOutput = {
  r: string,
  g: string,
  b: string,
  a?: number // alpha output is always numeric
}

declare class TinyColor {
  toHsl(): HSLOutput;
  toHslString(): string;
  toHsv(): HSVOutput;
  toHsvString(): string;
  toRgb(): RGBOutput;
  toRgbString(): string;
  toPercentageRgb(): RGBStringOutput;
  toPercentageRgbString(): string;
  toHex(): string;
  toHexString(): string;
  toHex8(): string;
  toHex8String(): string;
  toName(): string;
  toFilter(): string;
  toString(): string;

  getBrightness(): boolean;
  isLight(): boolean;
  isDark(): boolean;
  getLuminance(): number;
  getAlpha(): number;
  setAlpha(alpha: number): void;
  isValid(): boolean;
  getOriginalInput(): any;
  getFormat(): string;

  lighten(amt?: number): TinyColor;
  brighten(amt?: number): TinyColor;
  darken(amt?: number): TinyColor;
  desaturate(amt?: number): TinyColor;
  saturate(amt?: number): TinyColor;
  greyscale(): TinyColor;
  spin(amt: number): TinyColor;
  triad(): Array<TinyColor>;
  tetrad(): Array<TinyColor>;
  complement(): TinyColor;
  clone(): TinyColor;
  analogous(results?: number, slices?: number): Array<TinyColor>;
  monochromatic(results?: number): Array<TinyColor>;
  splitcomplement(): Array<TinyColor>;
}

declare class TinyColorStatic {
  (color: string): TinyColor;
  fromRatio(ratio: RGBInput | HSVInput | HSLInput ): TinyColor;
  equals(
    color1: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    color2: RGBInput | HSVInput | HSLInput | TinyColor | string): boolean;
  mix(
    color1: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    color2: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    amount: number): TinyColor;
  random(): TinyColor;
  readability(
    color1: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    color2: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    amount: number): number;
  isReadable(
    color1: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    color2: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    options?: {
      level: string,
      size: string
    }): boolean;
  mostReadable(
    color1: RGBInput | HSVInput | HSLInput | TinyColor | string, 
    colorX: Array<RGBInput | HSVInput | HSLInput | TinyColor | string>, 
    options?: {
      level: 'AA' | 'AAA',
      size: string,
      includeFallbackColors?: boolean
    }): TinyColor;
}

declare module "@ctrl/tinycolor" {
  declare module.exports: TinyColorStatic;
}