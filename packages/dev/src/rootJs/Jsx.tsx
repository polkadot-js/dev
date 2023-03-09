// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted from https://github.com/testing-library/react-testing-library#basic-example

import type { Props } from './JsxChild.js';

import React, { useCallback, useState } from 'react';
import styledComponents, { StyledInterface } from 'styled-components';

import Child from './JsxChild.js';

// The styled-components typings are problematic, especially in nodenext - here
// we actually cater for both styled-componentsn 5.0 and 6.0 (where a named export exists)
export const styled = (
  (styledComponents as unknown as { styled: StyledInterface }).styled ||
  (styledComponents as unknown as { default: StyledInterface }).default ||
  styledComponents as unknown as StyledInterface
);

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
      {isMessageVisible && (
        <>
          {children}
          <Child label='hello' />
        </>
      )}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  background: red;
`;

export default React.memo(Hidden);
