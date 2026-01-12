/**
 * 路径解析工具
 * 用于解析 A2UI 数据模型中的路径访问
 */

/**
 * 根据路径获取对象中的值
 * @param {Object} obj - 数据对象
 * @param {string} path - 路径字符串，如 '/user/name' 或 'user.name'
 * @returns {*} 路径对应的值，如果路径不存在返回 undefined
 */
export function getValueByPath(obj, path) {
  if (!obj || !path) {
    return undefined
  }

  const normalizedPath = normalizePath(path)

  if (!normalizedPath) {
    return obj
  }

  const keys = normalizedPath.split('/').filter((key) => key !== '')

  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }

    if (typeof current !== 'object') {
      return undefined
    }

    current = current[key]
  }

  return current
}

/**
 * 根据路径设置对象中的值
 * @param {Object} obj - 数据对象
 * @param {string} path - 路径字符串
 * @param {*} value - 要设置的值
 * @returns {Object} 更新后的对象
 */
export function setValueByPath(obj, path, value) {
  if (!obj || !path) {
    return obj
  }

  const normalizedPath = normalizePath(path)

  if (!normalizedPath) {
    return value
  }

  const keys = normalizedPath.split('/').filter((key) => key !== '')

  if (keys.length === 0) {
    return value
  }

  const result = { ...obj }
  let current = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    } else {
      current[key] = { ...current[key] }
    }

    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  current[lastKey] = value

  return result
}

/**
 * 标准化路径格式
 * @param {string} path - 原始路径
 * @returns {string} 标准化后的路径（以 / 开头，不以 / 结尾）
 */
export function normalizePath(path) {
  if (!path || typeof path !== 'string') {
    return ''
  }

  let normalized = path.trim()

  if (normalized === '/') {
    return ''
  }

  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }

  if (normalized.endsWith('/') && normalized.length > 1) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

/**
 * 合并两个路径
 * @param {string} basePath - 基础路径
 * @param {string} relativePath - 相对路径
 * @returns {string} 合并后的路径
 */
export function joinPath(basePath, relativePath) {
  const base = normalizePath(basePath)
  const relative = normalizePath(relativePath)

  if (!base) {
    return relative
  }

  if (!relative) {
    return base
  }

  return base + relative
}

/**
 * 检查路径是否存在
 * @param {Object} obj - 数据对象
 * @param {string} path - 路径字符串
 * @returns {boolean} 路径是否存在
 */
export function hasPath(obj, path) {
  const value = getValueByPath(obj, path)
  return value !== undefined
}

/**
 * 删除路径对应的值
 * @param {Object} obj - 数据对象
 * @param {string} path - 路径字符串
 * @returns {Object} 更新后的对象
 */
export function deleteValueByPath(obj, path) {
  if (!obj || !path) {
    return obj
  }

  const normalizedPath = normalizePath(path)

  if (!normalizedPath) {
    return {}
  }

  const keys = normalizedPath.split('/').filter((key) => key !== '')

  if (keys.length === 0) {
    return {}
  }

  const result = { ...obj }
  let current = result
  const parents = []

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      return result
    }

    parents.push({ obj: current, key })
    current[key] = { ...current[key] }
    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  delete current[lastKey]

  return result
}
