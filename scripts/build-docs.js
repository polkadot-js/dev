#!/usr/bin/env node
// ISC, Copyright 2017 Jaco Greeff

const dox = require('dox');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');

const DOC = 'docs';
const SRC = 'src';

rimraf.sync(DOC);
mkdirp.sync(DOC);

function cleanup (text) {
  return (text || '')
    .split('\n')
    .map((part) => part.trim())
    .join('\n');
}

function findTag (definition, _type) {
  const tag = definition.tags.find(({ type }) => type === _type);

  return cleanup((tag && tag.string) || '');
}

function findTags (definitions, type) {
  return definitions.map((definition) => findTag(definition, 'name'));
}

function parseFile (file) {
  const source = fs.readFileSync(file).toString('utf-8');

  return dox.parseComments(source, {
    skipSingleStar: true
  });
}

function lsEntries (dir) {
  return fs.readdirSync(dir).filter((file) => {
    return !['.', '..', 'index.js', 'types.js'].includes(file) &&
      !/\.spec\.js$/.test(file);
  });
}

function lsFolders (dir) {
  return lsEntries(dir).filter((file) => {
    return fs.lstatSync(path.join(dir, file)).isDirectory();
  });
}

function readSources (dir) {
  return lsEntries(path.join(SRC, dir))
    .map((file) => {
      return parseFile(path.join(SRC, dir, file))[0];
    })
    .filter((definition) => {
      return definition.tags.find(({ type }) => type === 'name');
    });
}

function generateDirectory (dir) {
  const definitions = readSources(dir);
  const names = findTags(definitions, 'name');
  const definition = parseFile(path.join(SRC, dir, 'index.js'))[0];
  const summary = findTag(definition, 'summary');
  const description = findTag(definition, 'description');
  const filePath = path.join(DOC, `${dir}.md`);
  const md = names.reduce((md, name, index) => {
    const summary = findTag(definitions[index], 'summary');

    return `${md}\n- [${name}](#${name}) ${summary}`;
  }, `# ${dir}\n\n${summary} ${description}\n`);

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

function generate (src) {
  const entries = lsFolders(src);
  const definition = parseFile(path.join(src, 'index.js'))[0];
  const summary = findTag(definition, 'summary');
  const description = findTag(definition, 'description');
  const filePath = path.join(DOC, 'README.md');

  console.log(filePath);

  fs.writeFileSync(
    filePath,
    entries.reduce((md, entry) => {
      const definition = parseFile(path.join(src, entry, 'index.js'))[0];

      return `${md}\n- [${entry}](${entry}.md) ${findTag(definition, 'summary')}`;
    }, `# Available interfaces\n\n${summary} ${description}\n`)
  );

  entries.map(generateDirectory);
}

generate(SRC);
