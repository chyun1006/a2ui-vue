import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEMPLATE_SCHEMA_PATH = path.resolve(
  __dirname,
  '../../requirements/schemas/server_to_client_with_standard_catalog.json',
)
const MANIFEST_PATH = path.resolve(__dirname, '../a2ui-spec/a2ui-manifest.json')
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../a2ui-spec/server_to_client_with_standard_catalog.json',
)

/**
 * 生成合并后的 server_to_client_with_standard_catalog.json
 * 将 a2ui-manifest.json 中的组件定义合并到模板 schema 中
 */
function generateServerSchema() {
  console.log('📋 读取模板 schema...')
  const templateSchema = JSON.parse(fs.readFileSync(TEMPLATE_SCHEMA_PATH, 'utf-8'))

  console.log('📦 读取 a2ui-manifest.json...')
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))

  // 获取组件定义的路径：surfaceUpdate → properties → components → items → properties → component → properties
  const componentPropertiesPath =
    templateSchema.properties.surfaceUpdate.properties.components.items.properties.component
      .properties

  console.log(
    `🔄 替换组件定义 (原有 ${Object.keys(componentPropertiesPath).length} 个组件) -> (新 ${Object.keys(manifest.components).length} 个组件)`,
  )

  // 清空原有组件定义
  for (const key of Object.keys(componentPropertiesPath)) {
    delete componentPropertiesPath[key]
  }

  // 添加来自 manifest 的组件定义
  for (const [componentName, componentDef] of Object.entries(manifest.components)) {
    componentPropertiesPath[componentName] = componentDef
  }

  // 更新 component 描述
  templateSchema.properties.surfaceUpdate.properties.components.items.properties.component.description =
    'A wrapper object that MUST contain exactly one key, which is the name of the component type. The following component types are supported: ' +
    Object.keys(manifest.components).sort().join(', ') +
    '.'

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 写入输出文件
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(templateSchema, null, 2), 'utf-8')

  console.log('\n✅ server_to_client_with_standard_catalog.json 生成成功!')
  console.log(`📁 输出路径: ${OUTPUT_PATH}`)
  console.log(`📊 组件列表: ${Object.keys(manifest.components).sort().join(', ')}`)
}

// 执行生成
generateServerSchema()
