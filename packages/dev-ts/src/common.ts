// Copyright 2017-2023 @polkadot/dev-ts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LoaderOptions } from './types.js';

import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

/** The path we are being executed from */
export const CWD_PATH = process.cwd();

/** The cwd path we are being executed from in URL form */
export const CWD_URL = pathToFileURL(`${CWD_PATH}/`);

/** The root path to node_modules (assuming it is in the root) */
export const MOD_PATH = path.join(CWD_PATH, 'node_modules');

/** List of allowed extensions for mappings */
export const EXT_TS_ARRAY = ['.ts', '.tsx'];

/** RegEx for files that we support via this loader */
export const EXT_TS_REGEX = /\.tsx?$/;

/** RegEx for matching JS files (imports map to TS) */
export const EXT_JS_REGEX = /\.jsx?$/;

/** RegEx for json files (as actually aliassed in polkadot-js) */
export const EXT_JSON_REGEX = /\.json$/;

/** Options for loader config */
export const loaderOptions: LoaderOptions = {};
