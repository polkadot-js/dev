// Copyright 2017-2019 @polkadot/dev-react authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as React from 'react';

export type Props = {
  className: string,
  value: string
};

export type State = {
  value: string
};

/**
 * This is just a test file to test the doc generation
 */
export default class App extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    const { value } = this.props;

    this.state = {
      value
    };
  }

  render (): React.ReactNode {
    const { className } = this.props;
    const { value } = this.state;

    // echo(value);

    return (
      <div className={className}>
        {value}
      </div>
    );
  }
}
