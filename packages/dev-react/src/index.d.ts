import * as React from 'react';
declare type Props = {
    className: string;
    value: string;
};
declare type State = {
    value: string;
};
/**
  @summary This is just a test file to test the doc generation
*/
export default class App extends React.PureComponent<Props, State> {
    state: State;
    constructor(props: Props);
    render(): React.ReactNode;
}
export {};
