import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const moduleName = process.argv[2]

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function toPascalCase(value: string): string {
  return toKebabCase(value)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function writeNewFile(filePath: string, contents: string): void {
  if (existsSync(filePath)) {
    fail(`Refusing to overwrite existing file: ${filePath}`)
  }

  writeFileSync(filePath, contents)
}

if (!moduleName) {
  fail('Usage: npm run generate:module -- <module-name>')
}

const kebabName = toKebabCase(moduleName)
const pascalName = toPascalCase(moduleName)
const camelName = toCamelCase(moduleName)

if (!kebabName) {
  fail('Module name must contain at least one letter or number.')
}

const moduleDir = join(projectRoot, 'src', 'modules', kebabName)

if (existsSync(moduleDir)) {
  fail(`Module already exists: src/modules/${kebabName}`)
}

mkdirSync(moduleDir, { recursive: true })

writeNewFile(
  join(moduleDir, 'service.ts'),
  `export async function get${pascalName}Status() {\n  return { status: 'ok' as const }\n}\n`,
)

writeNewFile(
  join(moduleDir, 'routes.ts'),
  `import { Type } from '@sinclair/typebox'\nimport type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'\nimport { get${pascalName}Status } from './service.js'\n\nconst ${camelName}Routes: FastifyPluginAsyncTypebox = async (fastify) => {\n  fastify.get(\n    '/${kebabName}/status',\n    {\n      schema: {\n        tags: ['${kebabName}'],\n        response: {\n          200: Type.Object({\n            status: Type.Literal('ok'),\n          }),\n        },\n      },\n    },\n    async () => get${pascalName}Status(),\n  )\n}\n\nexport default ${camelName}Routes\n`,
)

const routesPath = join(projectRoot, 'src', 'routes.ts')
const routesFile = readFileSync(routesPath, 'utf8')
const importLine = `import ${camelName}Routes from './modules/${kebabName}/routes.js'`
const registerLine = `  await app.register(${camelName}Routes)`

if (routesFile.includes(importLine) || routesFile.includes(registerLine)) {
  fail(`Route registration already exists for module: ${kebabName}`)
}

const updatedRoutesFile = routesFile
  .replace(/(import .+root\/routes\.js'\n)/, `$1${importLine}\n`)
  .replace(/( {2}await app\.register\(jobsRoutes\)\n)/, `$1${registerLine}\n`)

if (updatedRoutesFile === routesFile) {
  fail('Could not update src/routes.ts. Register the module manually.')
}

writeFileSync(routesPath, updatedRoutesFile)

console.log(`Generated module: src/modules/${kebabName}`)
console.log(`Registered route: GET /${kebabName}/status`)
