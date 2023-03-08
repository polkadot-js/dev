// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Effectrively duplicated in testRootCjs (just first import different)

// NOTE We don't use ts-expect-error here since the build folder may or may
// not exist (so the error may or may not be there)
//
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore This should only run against the compiled ouput, where this should exist
import * as testRootBuild from '../build/root.js';
import * as testRoot from './root.js';
import { runTests } from './rootTests.js';

runTests(testRootBuild as unknown as typeof testRoot);
