const fs = require('node:fs');
const nodeModule = require('node:module');
const path = require('node:path');

const builtins = new Set(
  nodeModule.builtinModules.flatMap((name) => {
    if (name.includes('/')) {
      return [name, name.split('/')[0]];
    }
    if (name.startsWith('node:')) {
      return [name, name.slice(5)];
    }
    return [name, `node:${name}`];
  })
);

const projectRoot = process.cwd();
const pkgPath = path.join(projectRoot, 'package.json');
let dependencyInfo = {
  dependencies: new Set(),
  devDependencies: new Set(),
};

if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    dependencyInfo = {
      dependencies: new Set(Object.keys(pkg.dependencies ?? {})),
      devDependencies: new Set(Object.keys(pkg.devDependencies ?? {})),
    };
  } catch (error) {
    console.warn('[lint] Failed to read package.json for dependency analysis', error);
  }
}

const INTERNAL_PREFIXES = [
  '@orm/',
  '@api/',
  '@utils/',
  '@types/',
  '@constants/',
  '@factories/',
  '@transform/',
  '@/',
];

const RELATIVE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.json'];
const TEST_FILE_PATTERN = /(?:^|\/)tests\/.+|\.(?:test|spec)\.[cm]?[jt]sx?$|(?:^|\/)vitest\.config\.[cm]?ts$/;

function normalizePath(filename) {
  return path.normalize(filename).split(path.sep).join('/');
}

function isInternalAlias(value) {
  return INTERNAL_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function isRelative(value) {
  return value.startsWith('.');
}

function isBuiltIn(value) {
  if (builtins.has(value)) {
    return true;
  }

  if (value.startsWith('node:')) {
    return builtins.has(value.slice(5));
  }

  return false;
}

function toPackageName(value) {
  if (value.startsWith('@')) {
    const [scope, pkg] = value.split('/');
    return pkg ? `${scope}/${pkg}` : scope;
  }

  const [name] = value.split('/');
  return name;
}

function isTestFile(filename) {
  if (!filename || filename === '<input>') {
    return false;
  }

  const normalized = normalizePath(path.relative(projectRoot, filename));
  return TEST_FILE_PATTERN.test(normalized);
}

function isTypeOnlyImport(node) {
  if (node.importKind === 'type') {
    return true;
  }

  if (node.specifiers.length === 0) {
    return false;
  }

  return node.specifiers.every((specifier) => specifier.importKind === 'type');
}

function resolveRelativeImport(filename, specifier) {
  const baseDir = path.dirname(filename);
  const target = path.resolve(baseDir, specifier);
  const candidates = [target];

  for (const extension of RELATIVE_EXTENSIONS) {
    candidates.push(`${target}${extension}`);
  }

  for (const extension of RELATIVE_EXTENSIONS) {
    candidates.push(path.join(target, `index${extension}`));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return normalizePath(candidate);
    }
  }

  return normalizePath(target);
}

function getImportGroup(value) {
  if (isInternalAlias(value)) {
    return 'internal';
  }

  if (isBuiltIn(value)) {
    return 'builtin';
  }

  if (isRelative(value)) {
    if (value === '.' || value === './' || /^\.\/index(\.[^/]+)?$/.test(value)) {
      return 'index';
    }

    if (value.startsWith('..')) {
      return 'parent';
    }

    return 'sibling';
  }

  return 'external';
}

const ORDER = ['internal', 'builtin', 'external', 'parent', 'sibling', 'index'];
const GROUP_INDEX = ORDER.reduce((map, group, index) => {
  map[group] = index;
  return map;
}, {});

module.exports = {
  rules: {
    'no-barrel-files': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow barrel files that only re-export other modules unless explicitly allowed.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              allowPaths: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          noBarrel: 'Barrel files are not allowed outside the approved allow list.',
        },
      },
      create(context) {
        const filename = context.getFilename();
        if (!filename || filename === '<input>') {
          return {};
        }

        const relativeFilename = normalizePath(path.relative(projectRoot, filename));
        const options = context.options[0] ?? {};
        const allowPaths = new Set((options.allowPaths ?? []).map((value) => normalizePath(value)));

        const isIndexFile = /(?:^|\/)index\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(relativeFilename);

        if (!isIndexFile || allowPaths.has(relativeFilename)) {
          return {};
        }

        return {
          ExportAllDeclaration(node) {
            context.report({ node, messageId: 'noBarrel' });
          },
          ExportNamedDeclaration(node) {
            if (node.source) {
              context.report({ node, messageId: 'noBarrel' });
            }
          },
        };
      },
    },
    'no-mutable-exports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent exporting mutable bindings.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              allow: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          mutable: 'Use const when exporting bindings to avoid mutable exports.',
        },
      },
      create(context) {
        return {
          ExportNamedDeclaration(node) {
            const declaration = node.declaration;
            if (!declaration || declaration.type !== 'VariableDeclaration') {
              return;
            }

            if (declaration.kind !== 'const') {
              context.report({ node: declaration, messageId: 'mutable' });
            }
          },
        };
      },
    },
    first: {
      meta: {
        type: 'layout',
        docs: {
          description: 'Ensure all imports appear before other statements.',
        },
        schema: [],
        messages: {
          outOfOrder: 'All import declarations must appear before other statements.',
        },
      },
      create(context) {
        return {
          Program(node) {
            let encounteredNonImport = false;
            for (const statement of node.body) {
              if (statement.type === 'ImportDeclaration') {
                if (encounteredNonImport) {
                  context.report({ node: statement, messageId: 'outOfOrder' });
                }
              } else if (
                statement.type !== 'EmptyStatement' &&
                statement.type !== 'ImportDeclaration'
              ) {
                encounteredNonImport = true;
              }
            }
          },
        };
      },
    },
    'no-extraneous-dependencies': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow importing dependencies that are not declared in package.json.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              includeTypes: { type: 'boolean' },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          missing: "'{{name}}' is not listed in dependencies or devDependencies.",
          prodOnly: "'{{name}}' should be listed under dependencies instead of devDependencies.",
        },
      },
      create(context) {
        const options = context.options[0] ?? {};
        const includeTypes = options.includeTypes ?? false;
        const filename = context.getFilename();
        const inTestFile = isTestFile(filename);

        return {
          ImportDeclaration(node) {
            const value = node.source.value;

            if (typeof value !== 'string') {
              return;
            }

            if (isRelative(value) || isInternalAlias(value) || isBuiltIn(value)) {
              return;
            }

            const packageName = toPackageName(value);
            const isTypeImport = isTypeOnlyImport(node);

            if (dependencyInfo.dependencies.has(packageName)) {
              return;
            }

            if (dependencyInfo.devDependencies.has(packageName)) {
              if (inTestFile || (includeTypes && isTypeImport)) {
                return;
              }

              context.report({
                node,
                messageId: 'prodOnly',
                data: { name: packageName },
              });

              return;
            }

            if (includeTypes && isTypeImport && packageName.startsWith('@types/')) {
              return;
            }

            context.report({
              node,
              messageId: 'missing',
              data: { name: packageName },
            });
          },
        };
      },
    },
    'no-self-import': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow importing from the same file.',
        },
        schema: [],
        messages: {
          selfImport: 'A module cannot import itself.',
        },
      },
      create(context) {
        const filename = context.getFilename();
        if (!filename || filename === '<input>') {
          return {};
        }

        const normalizedFilename = normalizePath(filename);

        return {
          ImportDeclaration(node) {
            const value = node.source.value;
            if (typeof value !== 'string' || !isRelative(value)) {
              return;
            }

            const resolved = resolveRelativeImport(filename, value);
            if (resolved === normalizedFilename) {
              context.report({ node, messageId: 'selfImport' });
            }
          },
        };
      },
    },
    'no-default-export': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow default exports in favour of named exports.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              allow: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          defaultExport: 'Use named exports instead of default exports.',
        },
      },
      create(context) {
        const filename = context.getFilename();
        const options = context.options[0] ?? {};
        const allowList = new Set(
          (options.allow ?? []).map((entry) => normalizePath(entry))
        );

        if (filename && filename !== '<input>') {
          const relative = normalizePath(path.relative(projectRoot, filename));
          if (allowList.has(relative)) {
            return {};
          }
        }

        return {
          ExportDefaultDeclaration(node) {
            context.report({ node, messageId: 'defaultExport' });
          },
        };
      },
    },
    'no-absolute-path': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow absolute paths in import declarations.',
        },
        schema: [],
        messages: {
          absolute: 'Use relative or aliased paths instead of absolute filesystem paths.',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const value = node.source.value;
            if (typeof value !== 'string') {
              return;
            }

            if (path.isAbsolute(value)) {
              context.report({ node, messageId: 'absolute' });
            }
          },
        };
      },
    },
    order: {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce a consistent ordering for import statements.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              groups: {
                type: 'array',
                items: { type: 'string' },
              },
              'newlines-between': {
                enum: ['never'],
              },
            },
            additionalProperties: true,
          },
        ],
        messages: {
          wrongGroup: 'Expected import from {{current}} to appear before {{previous}} imports.',
          extraNewline: 'Remove blank lines between import declarations.',
        },
      },
      create(context) {
        const imports = [];
        const options = context.options[0] ?? {};
        const allowedGroups = options.groups ?? ORDER;
        const allowedNewlines = options['newlines-between'] ?? 'never';
        const allowedGroupIndexes = allowedGroups.reduce((map, group, index) => {
          map[group] = index;
          return map;
        }, {});
        const useNeverNewlines = allowedNewlines === 'never';

        return {
          ImportDeclaration(node) {
            imports.push(node);
          },
          'Program:exit'() {
            let previousGroupIndex = -1;
            let previousNode = null;

            for (const node of imports) {
              const value = typeof node.source.value === 'string' ? node.source.value : '';
              const group = getImportGroup(value);
              const groupIndex = allowedGroupIndexes[group] ?? allowedGroupIndexes.external ?? 0;

              if (groupIndex < previousGroupIndex) {
                const currentName = group;
                const previousName = allowedGroups[previousGroupIndex] ?? 'previous groups';
                context.report({
                  node,
                  messageId: 'wrongGroup',
                  data: {
                    current: currentName,
                    previous: previousName,
                  },
                });
              }

              if (previousNode && useNeverNewlines) {
                if (node.loc.start.line - previousNode.loc.end.line > 1) {
                  context.report({ node, messageId: 'extraNewline' });
                }
              }

              if (groupIndex > previousGroupIndex) {
                previousGroupIndex = groupIndex;
              }

              previousNode = node;
            }
          },
        };
      },
    },
  },
};
