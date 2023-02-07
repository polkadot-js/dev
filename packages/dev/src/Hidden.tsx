// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from https://github.com/testing-library/react-testing-library#basic-example

import React, { useCallback, useState } from 'react';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

function Hidden ({ children, className }: Props): React.ReactElement<Props> {
  const [isMessageVisible, setMessageVisibility] = useState(false);

  const onShow = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setMessageVisibility(e.target.checked),
    []
  );

  return (
    <div className={className}>
      <label htmlFor='toggle'>Show Message</label>
      <input
        checked={isMessageVisible}
        id='toggle'
        onChange={onShow}
        type='checkbox'
      />
      {isMessageVisible && children}
    </div>
  );
}

export default React.memo(Hidden);
