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

function makeMdLink (text, link, ref) {
  return `[${text}](${link || ''}${link ? '.md' : ''}${ref ? '#' : ''}${ref ? ref.toLowerCase() : ''})`;
}

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

function lsFiles (dir) {
  return lsEntries(dir).filter((file) => {
    return !fs.lstatSync(path.join(dir, file)).isDirectory() &&
      /\.js$/.test(file);
  });
}

function lsFolders (dir) {
  return lsEntries(dir).filter((file) => {
    return fs.lstatSync(path.join(dir, file)).isDirectory();
  });
}

function readSources (dir) {
  return lsFiles(path.join(SRC, dir))
    .map((file) => {
      return parseFile(path.join(SRC, dir, file))[0];
    })
    .filter((definition) => {
      return definition.tags.find(({ type }) => type === 'name');
    });
}

function writeFile (filePath, md) {
  console.log(filePath);

  fs.writeFileSync(filePath, md);
}

function mdFromDefinition (definition, md) {
  const name = findTag(definition, 'name');
  const alias = findTag(definition, 'alias');
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

  let aliasLink = '';

  if (alias) {
    const [aliasPath, aliasMethod] = alias.split('/');
    const aliasName = aliasPath + aliasMethod.substr(0, 1).toUpperCase() + aliasMethod.sustr(1);

    aliasLink = makeMdLink(`(alias of ${aliasName})`, aliasPath, aliasName);
  }

  return `${md}\n\n## ${name}\n\n${summary} ${aliasLink}\n\n${signature}\n\n${description}\n\n${example}`;
}

function mdFromDefinitions (definitions, md) {
  return findTags(definitions, 'name').reduce((md, name, index) => {
    return mdFromDefinition(definitions[index], md);
  }, md);
}

function mdFromDirectory (dir, md) {
  const definitions = readSources(dir);
  const names = findTags(definitions, 'name');
  const definition = parseFile(path.join(SRC, dir, 'index.js'))[0];
  const summary = findTag(definition, 'summary');
  const description = findTag(definition, 'description');

  return mdFromDefinitions(definitions, names.reduce((md, name, index) => {
    const summary = findTag(definitions[index], 'summary');

    return `${md}\n- ${makeMdLink(name, '', name)} ${summary}`;
  }, `${md}# ${dir}\n\n${summary} ${description}\n`));
}

function generate (src) {
  const folders = lsFolders(src);
  const files = lsFiles(src);
  const definition = parseFile(path.join(src, 'index.js'))[0];
  const summary = findTag(definition, 'summary');
  const description = findTag(definition, 'description');

  folders.forEach((dir) => {
    writeFile(path.join(DOC, `${dir}.md`), mdFromDirectory(dir, ''));
  });

  const md = folders.reduce((md, dir) => {
    const definition = parseFile(path.join(src, dir, 'index.js'))[0];

    return `${md}\n- ${makeMdLink(dir, dir)} ${findTag(definition, 'summary')}`;
  }, `# Available interfaces\n\n${summary} ${description}\n`);

  writeFile(path.join(DOC, 'README.md'), files.reduce((md, file) => {
    const definition = parseFile(path.join(src, file))[0];

    return findTag(definition, 'name')
      ? mdFromDefinition(definition, md)
      : md;
  }, `${md}\n\n${files.length ? '# Available methods' : ''}`));
}

generate(SRC);
