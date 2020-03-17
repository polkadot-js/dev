// Copyright 2017-2020 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

function Component ({ children, className }): React.ReactElement<Props> {
  return (
    <div className={clasName}>
      {children}
    </div>
  );
}

export default React.memo(Component);
