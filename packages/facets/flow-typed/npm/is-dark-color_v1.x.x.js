// flow-typed signature: 5dbe928610b1204c595ab1354eae609e
// flow-typed version: 987e087266/is-dark-color_v1.x.x/flow_>=v0.83.x

declare module 'is-dark-color' {
  declare type isDarkColorOptions = {|
    override: { [hex: string]: boolean, ... }
  |}

  declare var isDarkColor: (hexColor: string, options?: isDarkColorOptions) => boolean

  declare module.exports: typeof isDarkColor
}
