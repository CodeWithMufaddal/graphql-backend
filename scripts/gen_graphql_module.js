#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

function splitWords(input) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function toPascal(words) {
  return words.map(capitalize).join('');
}

function toCamel(words) {
  const pascal = toPascal(words);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebab(words) {
  return words.join('-');
}

function toSnake(words) {
  return words.join('_');
}

function singularizeWord(word) {
  if (/ies$/i.test(word) && word.length > 3) {
    return `${word.slice(0, -3)}y`;
  }
  if (/(ches|shes|xes|zes|ses)$/i.test(word) && word.length > 2) {
    return word.slice(0, -2);
  }
  if (/s$/i.test(word) && !/ss$/i.test(word) && word.length > 1) {
    return word.slice(0, -1);
  }
  return word;
}

function pluralizeWord(word) {
  if (/[^aeiou]y$/i.test(word)) {
    return `${word.slice(0, -1)}ies`;
  }
  if (/(s|x|z|ch|sh)$/i.test(word)) {
    return `${word}es`;
  }
  return `${word}s`;
}

function parseArgs(argv) {
  const values = argv.slice(2);
  const moduleInput = values.find((item) => !item.startsWith('--'));

  return {
    moduleInput,
    force: values.includes('--force'),
    noRegister: values.includes('--no-register'),
    dryRun: values.includes('--dry-run'),
  };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function createValidationTemplate(tokens) {
  return `import { z } from 'zod';

export const create${tokens.singularPascal}InputSchema = z.object({
  name: z.string().trim().min(1),
});

export const update${tokens.singularPascal}InputSchema = z.object({
  name: z.string().trim().min(1).optional().nullable(),
});

export type Create${tokens.singularPascal}Input = z.infer<typeof create${tokens.singularPascal}InputSchema>;
export type Update${tokens.singularPascal}Input = z.infer<typeof update${tokens.singularPascal}InputSchema>;
`;
}

function createRepositoryTemplate(tokens, prefixToSrc) {
  return `import type { FindAndCountOptions } from 'sequelize';

import { models } from '${prefixToSrc}db/sequelize';
import { AppError } from '${prefixToSrc}utils/errors';

const MODEL_NAME = '${tokens.singularPascal}';

type GenericModel = {
  findAndCountAll: (options: FindAndCountOptions) => Promise<{ rows: unknown[]; count: number }>;
  findByPk: (id: number) => Promise<Record<string, any> | null>;
  create: (data: { name: string }) => Promise<Record<string, any>>;
};

function getModuleModel(): GenericModel {
  const model = (models as Record<string, GenericModel | undefined>)[MODEL_NAME];

  if (!model) {
    throw new AppError(
      'MODEL_NOT_FOUND',
      \`Model "\${MODEL_NAME}" is not registered. Create a Sequelize model before using this module.\`,
      500,
    );
  }

  return model;
}

export async function list${tokens.pluralPascal}Page(options: FindAndCountOptions) {
  return getModuleModel().findAndCountAll(options);
}

export async function find${tokens.singularPascal}ById(id: string | number) {
  return getModuleModel().findByPk(Number(id));
}

export async function create${tokens.singularPascal}(data: { name: string }) {
  return getModuleModel().create(data);
}
`;
}

function createServiceTemplate(tokens, prefixToSrc, prefixToModulesRoot) {
  return `import { Op } from 'sequelize';

import { NotFoundError } from '${prefixToSrc}utils/errors';
import { buildPageEnvelope, normalizePagination } from '${prefixToSrc}utils/pagination';
import { assertSortableField, normalizeSortInput } from '${prefixToSrc}utils/sort';
import type { PageQueryOptionsInput } from '${prefixToModulesRoot}shared';
import {
  create${tokens.singularPascal},
  find${tokens.singularPascal}ById as find${tokens.singularPascal}ByIdRecord,
  list${tokens.pluralPascal}Page,
} from './${tokens.fileBase}.repository';
import type { Create${tokens.singularPascal}Input, Update${tokens.singularPascal}Input } from './${tokens.fileBase}.validation';

const ${tokens.upperSnake}_SORT_FIELDS = ['id', 'name', 'createdAt', 'updatedAt'];

export async function list${tokens.pluralPascal}(options?: PageQueryOptionsInput) {
  const pageOptions = normalizePagination(options?.paginate);
  const { field, order } = normalizeSortInput(options?.sort, 'id');
  const sortField = assertSortableField(field, ${tokens.upperSnake}_SORT_FIELDS);
  const searchQuery = options?.search?.q?.trim();

  const where = searchQuery
    ? {
        [Op.or]: [{ name: { [Op.iLike]: \`%\${searchQuery}%\` } }],
      }
    : undefined;

  const result = await list${tokens.pluralPascal}Page({
    where,
    limit: pageOptions.limit,
    offset: pageOptions.offset,
    order: [[sortField, order]],
  });

  return buildPageEnvelope(result.rows, result.count, pageOptions);
}

export async function get${tokens.singularPascal}ById(id: string | number) {
  const record = await find${tokens.singularPascal}ByIdRecord(id);

  if (!record) {
    throw new NotFoundError('${tokens.singularPascal} not found.');
  }

  return record;
}

export async function create${tokens.singularPascal}Record(input: Create${tokens.singularPascal}Input) {
  return create${tokens.singularPascal}({
    name: input.name,
  });
}

export async function update${tokens.singularPascal}Record(id: string | number, input: Update${tokens.singularPascal}Input) {
  const record = await get${tokens.singularPascal}ById(id);

  if (input.name !== undefined) {
    record.name = input.name ?? record.name;
  }

  await record.save();
  return record;
}

export async function delete${tokens.singularPascal}Record(id: string | number) {
  const record = await get${tokens.singularPascal}ById(id);
  await record.destroy();

  return {
    success: true,
    message: \`${tokens.singularPascal} \${record.id} deleted successfully.\`,
  };
}
`;
}

function createGraphqlTemplate(tokens, prefixToSrc, prefixToModulesRoot) {
  return `import type { GraphQLContext } from '${prefixToSrc}graphql/context';
import { parseInput } from '${prefixToSrc}utils/validation';
import { requireCurrentUser } from '${prefixToModulesRoot}auth/auth.guard';
import type { GraphQLModuleDefinition } from '${prefixToModulesRoot}module.types';
import { ensureNonEmptyInput, pageQueryOptionsSchema, toIsoString } from '${prefixToModulesRoot}shared';

import {
  create${tokens.singularPascal}Record,
  delete${tokens.singularPascal}Record,
  get${tokens.singularPascal}ById,
  list${tokens.pluralPascal},
  update${tokens.singularPascal}Record,
} from './${tokens.fileBase}.service';
import {
  create${tokens.singularPascal}InputSchema,
  update${tokens.singularPascal}InputSchema,
} from './${tokens.fileBase}.validation';

type ${tokens.singularPascal}Record = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ${tokens.pluralCamel}GraphqlModule: GraphQLModuleDefinition = {
  name: '${tokens.pluralKebab}',
  typeDefs: /* GraphQL */ \`
    type ${tokens.singularPascal} {
      id: ID!
      name: String!
      createdAt: String!
      updatedAt: String!
    }

    type ${tokens.singularPascal}Page {
      meta: PageMeta!
      links: PageLinks!
      data: [${tokens.singularPascal}!]!
    }

    input Create${tokens.singularPascal}Input {
      name: String!
    }

    input Update${tokens.singularPascal}Input {
      name: String
    }

    extend type Query {
      ${tokens.pluralCamel}(options: PageQueryOptions): ${tokens.singularPascal}Page!
      ${tokens.singularCamel}(id: ID!): ${tokens.singularPascal}
    }

    extend type Mutation {
      create${tokens.singularPascal}(input: Create${tokens.singularPascal}Input!): ${tokens.singularPascal}!
      update${tokens.singularPascal}(id: ID!, input: Update${tokens.singularPascal}Input!): ${tokens.singularPascal}!
      delete${tokens.singularPascal}(id: ID!): MutationResult!
    }
  \`,
  resolvers: {
    Query: {
      ${tokens.pluralCamel}: async (_parent: unknown, args: { options?: unknown }) =>
        list${tokens.pluralPascal}(parseInput(pageQueryOptionsSchema, args.options)),
      ${tokens.singularCamel}: async (_parent: unknown, args: { id: string }) => get${tokens.singularPascal}ById(args.id),
    },
    Mutation: {
      create${tokens.singularPascal}: async (
        _parent: unknown,
        args: { input: unknown },
        context: GraphQLContext,
      ) => {
        requireCurrentUser(context.currentUser);
        return create${tokens.singularPascal}Record(parseInput(create${tokens.singularPascal}InputSchema, args.input));
      },
      update${tokens.singularPascal}: async (
        _parent: unknown,
        args: { id: string; input: unknown },
        context: GraphQLContext,
      ) => {
        requireCurrentUser(context.currentUser);
        const input = parseInput(update${tokens.singularPascal}InputSchema, args.input);
        ensureNonEmptyInput(input, '${tokens.singularCamel}');
        return update${tokens.singularPascal}Record(args.id, input);
      },
      delete${tokens.singularPascal}: async (
        _parent: unknown,
        args: { id: string },
        context: GraphQLContext,
      ) => {
        requireCurrentUser(context.currentUser);
        return delete${tokens.singularPascal}Record(args.id);
      },
    },
    ${tokens.singularPascal}: {
      createdAt: (record: ${tokens.singularPascal}Record) => toIsoString(record.createdAt),
      updatedAt: (record: ${tokens.singularPascal}Record) => toIsoString(record.updatedAt),
    },
  },
};
`;
}

function createIndexTemplate(tokens) {
  return `import * as ${tokens.singularCamel}Repository from './${tokens.fileBase}.repository';
import * as ${tokens.singularCamel}Validation from './${tokens.fileBase}.validation';

export { ${tokens.pluralCamel}GraphqlModule } from './${tokens.fileBase}.graphql';
export { ${tokens.singularCamel}Repository, ${tokens.singularCamel}Validation };
export {
  create${tokens.singularPascal}Record,
  delete${tokens.singularPascal}Record,
  get${tokens.singularPascal}ById,
  list${tokens.pluralPascal},
  update${tokens.singularPascal}Record,
} from './${tokens.fileBase}.service';
export {
  create${tokens.singularPascal}InputSchema,
  update${tokens.singularPascal}InputSchema,
  type Create${tokens.singularPascal}Input,
  type Update${tokens.singularPascal}Input,
} from './${tokens.fileBase}.validation';
`;
}

function buildTokens(moduleName) {
  const rawWords = splitWords(moduleName).map((word) => word.toLowerCase());
  if (rawWords.length === 0) {
    throw new Error('Module name must contain at least one valid word.');
  }

  const singularWords = [...rawWords];
  singularWords[singularWords.length - 1] = singularizeWord(
    singularWords[singularWords.length - 1],
  );

  const pluralWords = [...singularWords];
  pluralWords[pluralWords.length - 1] = pluralizeWord(
    pluralWords[pluralWords.length - 1],
  );

  return {
    singularWords,
    pluralWords,
    singularPascal: toPascal(singularWords),
    pluralPascal: toPascal(pluralWords),
    singularCamel: toCamel(singularWords),
    pluralCamel: toCamel(pluralWords),
    singularKebab: toKebab(singularWords),
    pluralKebab: toKebab(pluralWords),
    singularSnake: toSnake(singularWords),
    pluralSnake: toSnake(pluralWords),
    upperSnake: toSnake(singularWords).toUpperCase(),
    fileBase: toCamel(singularWords),
  };
}

function updateModulesIndexContent(content, moduleImportPath, moduleConstant) {
  const importLine = `import { ${moduleConstant} } from '${moduleImportPath}';`;
  const lines = content.split('\n');
  const exportIndex = lines.findIndex((line) =>
    line.includes('export const graphqlModules: GraphQLModuleDefinition[] = ['),
  );

  if (exportIndex === -1) {
    throw new Error('Could not find graphqlModules array in src/modules/index.ts');
  }

  if (!content.includes(importLine)) {
    lines.splice(exportIndex, 0, importLine);
  }

  const startIndex = lines.findIndex((line) =>
    line.includes('export const graphqlModules: GraphQLModuleDefinition[] = ['),
  );
  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && line.trim() === '];',
  );

  if (endIndex === -1) {
    throw new Error('Could not find end of graphqlModules array in src/modules/index.ts');
  }

  const alreadyRegistered = lines
    .slice(startIndex, endIndex)
    .some((line) => line.includes(moduleConstant));

  if (!alreadyRegistered) {
    lines.splice(endIndex, 0, `  ${moduleConstant},`);
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

async function writeGeneratedFiles(moduleDir, tokens, prefixes, dryRun) {
  const files = new Map([
    [`${tokens.fileBase}.validation.ts`, createValidationTemplate(tokens)],
    [
      `${tokens.fileBase}.repository.ts`,
      createRepositoryTemplate(tokens, prefixes.prefixToSrc),
    ],
    [
      `${tokens.fileBase}.service.ts`,
      createServiceTemplate(tokens, prefixes.prefixToSrc, prefixes.prefixToModulesRoot),
    ],
    [
      `${tokens.fileBase}.graphql.ts`,
      createGraphqlTemplate(tokens, prefixes.prefixToSrc, prefixes.prefixToModulesRoot),
    ],
    ['index.ts', createIndexTemplate(tokens)],
  ]);

  if (!dryRun) {
    await fs.mkdir(moduleDir, { recursive: true });
  }

  for (const [fileName, content] of files.entries()) {
    const filePath = path.join(moduleDir, fileName);
    if (!dryRun) {
      await fs.writeFile(filePath, content, 'utf8');
    }
    console.log(`[create] ${filePath}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.moduleInput) {
    console.error(
      [
        'Usage: node scripts/gen_graphql_module.js <module-name|path> [--force] [--no-register] [--dry-run]',
        'Examples:',
        '  node scripts/gen_graphql_module.js category',
        '  node scripts/gen_graphql_module.js master/product --force',
      ].join('\n'),
    );
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const modulesRoot = path.join(projectRoot, 'src', 'modules');
  const modulesIndexPath = path.join(modulesRoot, 'index.ts');

  if (!(await exists(modulesRoot))) {
    console.error(`Modules root not found: ${modulesRoot}`);
    process.exit(1);
  }

  if (!args.noRegister && !(await exists(modulesIndexPath))) {
    console.error(`Modules registry not found: ${modulesIndexPath}`);
    process.exit(1);
  }

  const normalized = args.moduleInput.replace(/\\/g, '/');
  const inputSegments = normalized.split('/').filter(Boolean);

  if (inputSegments.length === 0) {
    console.error('Invalid module name.');
    process.exit(1);
  }

  const parentSegments = inputSegments
    .slice(0, -1)
    .map((segment) => toKebab(splitWords(segment).map((word) => word.toLowerCase())));
  const tokens = buildTokens(inputSegments[inputSegments.length - 1]);
  const moduleSegments = [...parentSegments, tokens.singularKebab];
  const moduleDir = path.join(modulesRoot, ...moduleSegments);
  const moduleImportPath = `./${moduleSegments.join('/')}`;

  if ((await exists(moduleDir)) && !args.force) {
    console.error(
      `Module directory already exists: ${moduleDir}\nUse --force to overwrite existing files.`,
    );
    process.exit(1);
  }

  const depthFromModulesRoot = moduleSegments.length;
  const prefixes = {
    prefixToSrc: '../'.repeat(depthFromModulesRoot + 1),
    prefixToModulesRoot: '../'.repeat(depthFromModulesRoot),
  };

  await writeGeneratedFiles(moduleDir, tokens, prefixes, args.dryRun);

  if (!args.noRegister) {
    const moduleConstant = `${tokens.pluralCamel}GraphqlModule`;
    const currentIndexContent = await fs.readFile(modulesIndexPath, 'utf8');
    const nextIndexContent = updateModulesIndexContent(
      currentIndexContent,
      moduleImportPath,
      moduleConstant,
    );

    if (!args.dryRun) {
      await fs.writeFile(modulesIndexPath, nextIndexContent, 'utf8');
    }
    console.log(`[update] ${modulesIndexPath}`);
  }

  if (args.dryRun) {
    console.log('\nDry run complete. No files were written.');
  } else {
    console.log(`\nGraphQL module scaffolded at: ${moduleDir}`);
  }
}

main().catch((error) => {
  console.error('Failed to generate GraphQL module scaffold.');
  console.error(error);
  process.exit(1);
});
