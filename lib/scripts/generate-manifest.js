import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { parse as parseJSDoc } from 'comment-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COMPONENTS_DIR = path.resolve(__dirname, '../src/components/a2ui')
const OUTPUT_DIR = path.resolve(__dirname, '../a2ui-spec')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'a2ui-manifest.json')

/**
 * 类型映射：将 JSDoc 类型映射到 JSON Schema 类型
 */
const TYPE_MAPPING = {
  string: { type: 'string' },
  String: { type: 'string' },
  number: { type: 'number' },
  Number: { type: 'number' },
  boolean: { type: 'boolean' },
  Boolean: { type: 'boolean' },
  Object: {
    type: 'object',
    description: '数据绑定对象，支持 literal 值或 path 引用',
    additionalProperties: false,
    properties: {
      literalString: { type: 'string' },
      path: { type: 'string' },
    },
  },
  Array: { type: 'array' },
}

/**
 * 解析枚举值（从描述中提取）
 * @param {string} description - 参数描述
 * @returns {string[]|null} 枚举值数组
 */
function parseEnum(description) {
  const enumMatch = description.match(/[:：]\s*([^\n]+)/)
  if (!enumMatch) return null

  const values = enumMatch[1]
    .split(/[,，或]/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0)

  return values.length > 0 ? values : null
}

/**
 * 将组件名转换为标准名称（去掉 A2UI 前缀）
 * @param {string} name - 组件名
 * @returns {string} 标准名称
 */
function toStandardName(name) {
  return name.replace(/^A2UI/, '')
}

/**
 * 递归扫描目录获取所有 Vue 组件（深度优先，按文件夹顺序）
 * @param {string} dir - 目录路径
 * @returns {Array} 文件路径数组
 */
function getVueFiles(dir) {
  const files = []

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    // 先排序：目录在前，文件在后；同类型按名称排序
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('__')) {
          traverse(fullPath)
        }
      } else if (entry.isFile() && entry.name.endsWith('.vue')) {
        files.push(fullPath)
      }
    }
  }

  traverse(dir)
  return files
}

/**
 * 解析单个组件文件
 * @param {string} filePath - 组件文件路径
 * @returns {Object|null} 组件信息
 */
function parseComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  const { descriptor } = parseSFC(content)
  const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || ''

  if (!scriptContent) {
    return null
  }

  const blocks = parseJSDoc(scriptContent, { spacing: 'preserve' })
  const definePropsIndex = scriptContent.indexOf('defineProps')
  if (definePropsIndex === -1) {
    return null
  }

  const beforeDefineProps = scriptContent.slice(0, definePropsIndex)
  const definePropsLine = beforeDefineProps.split('\n').length

  let mainBlock = null
  let maxLineNumber = 0

  for (const block of blocks) {
    const hasComponentTag = block.tags.some((t) => t.tag === 'component')
    if (hasComponentTag && block.source && block.source.length > 0) {
      const lastSourceLine = block.source[block.source.length - 1]
      const blockEndLine = lastSourceLine.number

      if (blockEndLine < definePropsLine && blockEndLine > maxLineNumber) {
        maxLineNumber = blockEndLine
        mainBlock = block
      }
    }
  }

  if (!mainBlock) {
    return null
  }

  const componentTag = mainBlock.tags.find((t) => t.tag === 'component')
  const descriptionTag = mainBlock.tags.find((t) => t.tag === 'description')
  const description =
    descriptionTag?.name || descriptionTag?.description || mainBlock.description || ''

  // 解析参数
  const properties = {}
  const required = []

  mainBlock.tags
    .filter((t) => t.tag === 'param')
    .forEach((tag) => {
      const name = tag.name
      const isOptional = tag.optional || (name.startsWith('[') && name.endsWith(']'))

      let paramName = name.replace(/[\[\]]/g, '')
      let defaultValue = tag.default

      if (!defaultValue) {
        const defaultMatch = paramName.match(/^([^=]+)=(.*)$/)
        if (defaultMatch) {
          paramName = defaultMatch[1]
          defaultValue = defaultMatch[2].replace(/^['"]|['"]$/g, '')
        }
      }

      let paramDescription = tag.description || ''
      if (paramDescription.startsWith('- ')) {
        paramDescription = paramDescription.slice(2)
      }

      if (!isOptional) {
        required.push(paramName)
      }

      // 特殊处理某些属性
      let propDef = null

      if (paramName === 'children') {
        // children 属性：包含 explicitList 或 template
        propDef = {
          type: 'object',
          description:
            paramDescription ||
            '定义子组件。使用 explicitList 固定子组件列表，或 template 从数据列表生成子组件',
          additionalProperties: false,
          properties: {
            explicitList: {
              type: 'array',
              items: { type: 'string' },
            },
            template: {
              type: 'object',
              description: '从数据模型列表生成动态子组件列表的模板',
              additionalProperties: false,
              properties: {
                componentId: { type: 'string' },
                dataBinding: { type: 'string' },
              },
              required: ['componentId', 'dataBinding'],
            },
          },
        }
      } else if (paramName === 'options') {
        // options 属性（MultipleChoice 组件）
        propDef = {
          type: 'array',
          description: paramDescription || '用户可选择的选项数组',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              label: {
                type: 'object',
                description: '此选项显示的文本',
                additionalProperties: false,
                properties: {
                  literalString: { type: 'string' },
                  path: { type: 'string' },
                },
              },
              value: { type: 'string' },
            },
            required: ['label', 'value'],
          },
        }
      } else if (paramName === 'action') {
        // action 属性（Button 组件）
        propDef = {
          type: 'object',
          description: paramDescription || '按钮被点击时分发的客户端动作',
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
            context: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  key: { type: 'string' },
                  value: {
                    type: 'object',
                    description: '要包含在上下文中的值',
                    additionalProperties: false,
                    properties: {
                      path: { type: 'string' },
                      literalString: { type: 'string' },
                      literalNumber: { type: 'number' },
                      literalBoolean: { type: 'boolean' },
                    },
                  },
                },
                required: ['key', 'value'],
              },
            },
          },
          required: ['name'],
        }
      } else if (paramName === 'selections') {
        // selections 属性（MultipleChoice 组件）
        propDef = {
          type: 'object',
          description: paramDescription || '当前选择的值',
          additionalProperties: false,
          properties: {
            literalArray: { type: 'array', items: { type: 'string' } },
            path: { type: 'string' },
          },
        }
      } else if (paramName === 'value' && (tag.type === 'Object' || tag.type === 'object')) {
        // value 属性（数据绑定）
        propDef = {
          type: 'object',
          description: paramDescription,
          additionalProperties: false,
          properties: {
            literalString: { type: 'string' },
            literalNumber: { type: 'number' },
            literalBoolean: { type: 'boolean' },
            path: { type: 'string' },
          },
        }
      } else {
        // 标准类型处理
        const typeInfo = TYPE_MAPPING[tag.type] ||
          TYPE_MAPPING[tag.type.toLowerCase()] || { type: 'string' }
        propDef = {
          ...typeInfo,
          description: paramDescription,
        }
      }

      // 添加默认值到描述中（如果有）
      if (defaultValue !== undefined && defaultValue !== '') {
        if (propDef.description) {
          propDef.description += ` 默认值: ${defaultValue}`
        } else {
          propDef.description = `默认值: ${defaultValue}`
        }
      }

      // 尝试解析枚举值
      if (!propDef.enum) {
        const enumValues = parseEnum(paramDescription)
        if (enumValues) {
          propDef.enum = enumValues
        }
      }

      properties[paramName] = propDef
    })

  return {
    componentName: componentTag?.name || componentTag?.description || '',
    description,
    properties,
    required,
  }
}

/**
 * 生成组件清单
 */
function generateManifest() {
  console.log('🔍 扫描组件文件...')

  const vueFiles = getVueFiles(COMPONENTS_DIR)
  console.log(`📦 找到 ${vueFiles.length} 个 Vue 组件文件`)

  // 使用 Map 保持插入顺序
  const componentsMap = new Map()

  for (const filePath of vueFiles) {
    const relativePath = path.relative(COMPONENTS_DIR, filePath)
    const fileName = path.basename(filePath, '.vue')

    console.log(`  📄 处理: ${relativePath}`)

    const componentInfo = parseComponent(filePath)

    if (componentInfo) {
      const standardName = toStandardName(componentInfo.componentName || fileName)

      componentsMap.set(standardName, {
        type: 'object',
        additionalProperties: false,
        properties: componentInfo.properties,
        ...(componentInfo.required.length > 0 && { required: componentInfo.required }),
      })
    }
  }

  // 转换为普通对象，保持顺序
  const components = {}
  for (const [key, value] of componentsMap) {
    components[key] = value
  }

  const manifest = {
    components,
    styles: {
      font: {
        type: 'string',
        description: 'UI 的主要字体',
      },
      primaryColor: {
        type: 'string',
        description: 'UI 的主要颜色，十六进制代码（如 #00BFFF）',
        pattern: '^#[0-9a-fA-F]{6}$',
      },
    },
  }

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // 写入清单文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8')

  console.log('\n✅ 清单文件生成成功!')
  console.log(`📁 输出路径: ${OUTPUT_FILE}`)
  console.log(`📊 总计 ${Object.keys(components).length} 个组件`)
}

// 执行生成
generateManifest()
