

import type { TypescriptProjectConfig } from '@kinotic/structures-api'

const config: TypescriptProjectConfig = {
  mdl: "ts",
  application: "turbo-pnpm-test",
  entitiesPaths: [
    "src/structures/model"
  ],
  generatedPath: "src/structures/dao",
  fileExtensionForImports: ".js",
  validate: false
}

export default config
