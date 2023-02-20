// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from https://github.com/testing-library/react-testing-library#basic-example

import React, { useCallback, useState } from 'react';
import { styled } from 'styled-components';

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
    <StyledDiv className={className}>
      <label htmlFor='toggle'>Show Message</label>
      <input
        checked={isMessageVisible}
        id='toggle'
        onChange={onShow}
        type='checkbox'
      />
      {isMessageVisible && children}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  background: red;
`;

export default React.memo(Hidden);
