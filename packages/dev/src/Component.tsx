// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

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
