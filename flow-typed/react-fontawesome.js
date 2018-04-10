// @flow

declare type Fa$React$Icon = {
  icon: Array<mixed>,
  iconName: string,
  prefix: string
};

declare module '@fortawesome/react-fontawesome' {
  declare type Fa$React$Props = {
    className?: string,
    color?: string,
    icon: Fa$React$Icon,
    spin?: boolean,
    style?: { [string]: string }
  };

  declare module.exports: {
    default: React$StatelessFunctionalComponent<Fa$React$Props>
  }
}
