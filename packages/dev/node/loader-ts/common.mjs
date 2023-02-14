// Copyright 2017-2023 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

/** The path we are being executed from */
export const CWD_PATH = process.cwd();

/** The cwd path we are being executed from in URL form */
export const CWD_URL = pathToFileURL(CWD_PATH).href;

/** The root path to node_modules */
export const MOD_PATH = path.join(CWD_PATH, 'node_modules');

/** List of allowed extensions for mappings */
export const EXT_ARRAY = ['.ts', '.tsx'];

/** RegEx for files that we support via this loader */
export const EXT_REGEX = /\.tsx?$/;
