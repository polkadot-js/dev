// Copyright 2017-2018 @polkadot/dev authors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

// Restore old babylon behavior for istanbul.
// https://github.com/babel/babel/pull/6836
// https://github.com/istanbuljs/istanbuljs/issues/119
module.exports = function () {
  return {
    visitor: {
      Program (programPath) {
        programPath.traverse({
          ArrowFunctionExpression (path) {
            const node = path.node;
            node.expression = node.body.type !== 'BlockStatement';
          }
        });
      }
    }
  };
};
