// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// For Node environments, we need to pass and extra flag: -r browser-env/register
// (or alternatively require('browser-env')() at file top)

import { fireEvent, render, screen } from '@testing-library/react';
import { strict as assert } from 'node:assert';
import React from 'react';

import Hidden from './Hidden';

describe('react testing', () => {
  it('shows the children when the checkbox is checked', () => {
    const testMessage = 'Test Message';

    render(<Hidden>{testMessage}</Hidden>);

    assert.equal(screen.queryByText(testMessage), null);

    fireEvent.click(screen.getByLabelText(/show/i));

    assert.notEqual(screen.getByText(testMessage), null);
  });
});
