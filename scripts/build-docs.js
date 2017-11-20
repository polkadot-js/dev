#!/usr/bin/env node
// ISC, Copyright 2017 Jaco Greeff

const dox = require('dox');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');

const docPath = 'docs';
const srcPath = 'src';

rimraf.sync(docPath);
mkdirp.sync(docPath);

function cleanup (text) {
  return text
    .split('\n')
    .map((part) => part.trim())
    .join('\n');
}

function findTag (definition, _type) {
  const tag = definition.tags.find(({ type }) => type === _type);

  return cleanup((tag && tag.string) || '');
}

function generateDirectory (subPath) {
  const definitions = fs
    .readdirSync(path.join(srcPath, subPath))
    .filter((file) => {
      return !['.', '..', 'index.js', 'types.js'].includes(file) &&
        !/\.spec\.js$/.test(file);
    })
    .sort()
    .map((file) => {
      return dox.parseComments(
        fs.readFileSync(path.join(srcPath, subPath, file)).toString('utf-8'),
        { skipSingleStar: true }
      )[0];
    })
    .filter((definition) => {
      return definition.tags.find(({ type }) => type === 'name');
    });
  const names = definitions.map((definition) => {
    return findTag(definition, 'name');
  });
  const rootDefinition = dox.parseComments(
    fs.readFileSync(path.join(srcPath, subPath, 'index.js')).toString('utf-8'),
    { skipSingleStar: true }
  )[0];

  const md = names.reduce((md, name, index) => {
    return `${md}\n- (${name})[#${name}] ${findTag(definitions[index], 'summary')}`;
  }, `# ${subPath}\n\n${findTag(rootDefinition, 'summary')} ${findTag(rootDefinition, 'description')}\n`);

  const filePath = path.join(docPath, `${subPath}.md`);

  console.log(filePath);

  fs.writeFileSync(
    filePath,
    names.reduce((md, name, index) => {
      const definition = definitions[index];
      const description = findTag(definition, 'description');
      const summary = findTag(definition, 'summary');
      const _signature = findTag(definition, 'signature');
      const signature = _signature
        ? `\`\`\`js\n${_signature}\n\`\`\``
        : '';
      const _example = findTag(definition, 'example');
      const example = _example
        ? `\`\`\`js\n${_example}\n\`\`\``
        : '';

      return `${md}\n\n## ${name}\n\n${summary}\n\n${signature}\n\n${description}\n\n${example}`;
    }, md)
  );
}

const entries = fs
  .readdirSync(srcPath)
  .filter((file) => {
    return !['.', '..'].includes(file) &&
      fs.lstatSync(path.join(srcPath, file)).isDirectory();
  });

const rootDefinition = dox.parseComments(
  fs.readFileSync(path.join(srcPath, 'index.js')).toString('utf-8'),
  { skipSingleStar: true }
)[0];

const filePath = path.join(docPath, 'README.md');

console.log(filePath);

fs.writeFileSync(
  filePath,
  entries.reduce((md, entry) => {
    const definition = dox.parseComments(
      fs.readFileSync(path.join(srcPath, entry, 'index.js')).toString('utf-8'),
      { skipSingleStar: true }
    )[0];

    return `${md}\n- [${entry}](${entry}.md) ${findTag(definition, 'summary')}`;
  }, `# Available interfaces\n\n${findTag(rootDefinition, 'summary')} ${findTag(rootDefinition, 'description')}\n`)
);

entries.map(generateDirectory);
