// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

function Child ({ children, className, label }: Props): React.ReactElement<Props> {
  return (
    <div className={className}>
      {label || ''}{children}
    </div>
  );
}

function Component ({ children, className, label }: Props): React.ReactElement<Props> {
  const bon = '123';

  if (label === bon) {
    console.error('true');
  }

  try {
    console.log('bon');
  } catch (error) {
    // ignore;
  }

  console.log('1');

  return (
    <div className={className}>
      <Child
        className='child'
        label={label}
      >
        {children}
      </Child>
      <Child className='child'>bob</Child>
    </div>
  );
}

export default React.memo(Component);
