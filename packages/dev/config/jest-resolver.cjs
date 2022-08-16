// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const resolutions = [
  {
    extensions: ['.tsx', '.ts', '.js'],
    matcher: /\.jsx?$/i
  }
];

module.exports = function (path, options) {
  const resolution = resolutions.find(({ matcher }) => matcher.test(path));

  if (resolution) {
    for (const extension of resolution.extensions) {
      try {
        return options.defaultResolver(path.replace(resolution.matcher, extension), options);
      } catch {
        continue;
      }
    }
  }

  return options.defaultResolver(path, options);
};
