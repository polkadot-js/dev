// @flow

declare type color$Color = {
  alpha: (alpha: number) => color$Color,
  rotate: (degrees: number) => color$Color,
  string: () => string
};

declare module 'color' {
  declare module.exports: {
    (hex: string): color$Color;
  }
}
