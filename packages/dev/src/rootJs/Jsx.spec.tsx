// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

/// <reference types="@polkadot/dev-test/globals.d.ts" />

import { fireEvent, render, screen } from '@testing-library/react';
import { strict as assert } from 'node:assert';
import React from 'react';

import Jsx from './Jsx.js';

describe('react testing', () => {
  it('shows the children when the checkbox is checked', () => {
    const testMessage = 'Test Message';

    render(<Jsx>{testMessage}</Jsx>);

    assert.equal(screen.queryByText(testMessage), null);

    fireEvent.click(screen.getByLabelText(/show/i));

    assert.notEqual(screen.getByText(testMessage), null);
  });
});
