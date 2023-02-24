// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

export interface Props {
  children?: React.ReactNode;
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

export default React.memo(Child);
