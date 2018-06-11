// @flow

declare type color$Color = {
  alpha: (alpha: number) => color$Color,
  ansi256: () => color$Color,
  array: () => Array<number>,
  cmyk: () => color$Color,
  hsl: () => color$Color,
  lighten: (alpha: number) => color$Color,
  rotate: (degrees: number) => color$Color,
  string: () => string
};

declare module 'color' {
  declare module.exports: {
    (value: string | Array<number> | { b: number, g: number, r: number }): color$Color;
  }
}
