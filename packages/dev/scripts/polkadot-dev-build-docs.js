#!/usr/bin/env node
// Copyright 2017-2018 @polkadot/dev authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

const dox = require('dox');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');

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
    const dirPath = path.join(dir, file);

    return fs.lstatSync(dirPath).isDirectory() && !fs.existsSync(path.join(dirPath, '.nodoc'));
  });
}

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
  if (!fs.existsSync(file)) {
    return [];
  }

  const source = fs.readFileSync(file).toString('utf-8');

  return dox.parseComments(source, {
    skipSingleStar: true
  });
}

function writeFile (filePath, md) {
  console.log(filePath);

  fs.writeFileSync(filePath, md);
}

function generatePackagePath (root, dir) {
  return root
    ? path.join('packages', root, dir)
    : dir;
}

function buildPackage (root) {
  const DOC = generatePackagePath(root, 'docs');
  const SRC = generatePackagePath(root, 'src');

  rimraf.sync(DOC);
  mkdirp.sync(DOC);

  function readSources (dir) {
    return lsFiles(path.join(SRC, dir))
      .map((file) => {
        return parseFile(path.join(SRC, dir, file))[0];
      })
      .filter((definition) => {
        return definition.tags.find(({ type }) => type === 'name');
      });
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
      const aliasName = aliasPath + aliasMethod.substr(0, 1).toUpperCase() + aliasMethod.substr(1);

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

  const folders = lsFolders(SRC);
  const files = lsFiles(SRC);
  const definition = parseFile(path.join(SRC, 'index.js'))[0];
  const summary = findTag(definition, 'summary');
  const description = findTag(definition, 'description');

  folders.forEach((dir) => {
    writeFile(path.join(DOC, `${dir}.md`), mdFromDirectory(dir, ''));
  });

  const md = folders.reduce((md, dir) => {
    const definition = parseFile(path.join(SRC, dir, 'index.js'))[0];

    return `${md}\n- ${makeMdLink(dir, dir)} ${findTag(definition, 'summary')}`;
  }, `# Available interfaces\n\n${summary} ${description}\n`);

  writeFile(path.join(DOC, 'README.md'), files.reduce((md, file) => {
    const definition = parseFile(path.join(SRC, file))[0];

    return findTag(definition, 'name')
      ? mdFromDefinition(definition, md)
      : md;
  }, `${md}\n\n${files.length ? '# Available methods' : ''}`));
}

if (fs.existsSync('packages')) {
  lsFolders('packages').forEach(buildPackage);
}

if (fs.existsSync('src')) {
  buildPackage();
}
