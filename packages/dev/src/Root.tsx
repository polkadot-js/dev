// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import Component from './Component';

interface Props {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

function Root ({ children, className, label }: Props): React.ReactElement<Props> {
  return (
    <Component
      className={className}
      label={label}
    >
      {children}
    </Component>
  );
}

export default React.memo(Root);
