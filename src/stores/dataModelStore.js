/**
 * Data Model 状态管理
 * 管理每个 Surface 的数据模型
 */

import { defineStore } from 'pinia'
import {
  getValueByPath,
  setValueByPath,
  deleteValueByPath,
  normalizePath,
} from '../utils/pathResolver.js'
import { validateDataContents, validateSurfaceId } from '../utils/validator.js'
import { DATA_VALUE_FIELDS } from '../types/a2ui.js'

export const useDataModelStore = defineStore('dataModel', {
  state: () => ({
    dataModels: new Map(),
  }),

  getters: {
    /**
     * 获取指定 Surface 的数据模型
     */
    getDataModel: (state) => (surfaceId) => {
      return state.dataModels.get(surfaceId) || {}
    },

    /**
     * 检查数据模型是否存在
     */
    hasDataModel: (state) => (surfaceId) => {
      return state.dataModels.has(surfaceId)
    },

    /**
     * 获取数据模型数量
     */
    dataModelCount: (state) => state.dataModels.size,
  },

  actions: {
    /**
     * 初始化 Surface 的数据模型
     */
    initDataModel(surfaceId) {
      if (!validateSurfaceId(surfaceId)) {
        console.error('Invalid surface ID:', surfaceId)
        return false
      }

      if (!this.dataModels.has(surfaceId)) {
        this.dataModels.set(surfaceId, {})
        console.log(`Data model initialized for surface: ${surfaceId}`)
      }
      return true
    },

    /**
     * 根据路径获取值
     */
    getValueByPath(surfaceId, path) {
      const dataModel = this.dataModels.get(surfaceId)
      if (!dataModel) {
        console.warn(`Data model not found for surface: ${surfaceId}`)
        return undefined
      }

      return getValueByPath(dataModel, path)
    },

    /**
     * 更新数据模型
     */
    updateData(surfaceId, path = null, contents) {
      if (!validateSurfaceId(surfaceId)) {
        console.error('Invalid surface ID:', surfaceId)
        return false
      }

      if (!validateDataContents(contents)) {
        console.error('Invalid data contents:', contents)
        return false
      }

      this.initDataModel(surfaceId)

      const normalizedPath = normalizePath(path || '/')
      const dataToUpdate = this.parseDataContents(contents)

      if (!normalizedPath || normalizedPath === '/') {
        this.dataModels.set(surfaceId, dataToUpdate)
      } else {
        const currentData = this.dataModels.get(surfaceId)
        const updatedData = setValueByPath(currentData, normalizedPath, dataToUpdate)
        this.dataModels.set(surfaceId, updatedData)
      }

      console.log(`Data model updated for surface: ${surfaceId}, path: ${path || '/'}`)
      return true
    },

    /**
     * 解析数据内容数组为对象
     */
    parseDataContents(contents) {
      const result = {}

      for (const item of contents) {
        const { key } = item

        if (DATA_VALUE_FIELDS.VALUE_STRING in item) {
          result[key] = item.valueString
        } else if (DATA_VALUE_FIELDS.VALUE_NUMBER in item) {
          result[key] = item.valueNumber
        } else if (DATA_VALUE_FIELDS.VALUE_BOOLEAN in item) {
          result[key] = item.valueBoolean
        } else if (DATA_VALUE_FIELDS.VALUE_MAP in item) {
          result[key] = this.parseDataContents(item.valueMap)
        }
      }

      return result
    },

    /**
     * 设置单个值
     */
    setValue(surfaceId, path, value) {
      if (!validateSurfaceId(surfaceId)) {
        console.error('Invalid surface ID:', surfaceId)
        return false
      }

      this.initDataModel(surfaceId)

      const currentData = this.dataModels.get(surfaceId)
      const updatedData = setValueByPath(currentData, path, value)
      this.dataModels.set(surfaceId, updatedData)

      return true
    },

    /**
     * 删除指定路径的值
     */
    deleteValue(surfaceId, path) {
      if (!validateSurfaceId(surfaceId)) {
        console.error('Invalid surface ID:', surfaceId)
        return false
      }

      const currentData = this.dataModels.get(surfaceId)
      if (!currentData) {
        return false
      }

      const updatedData = deleteValueByPath(currentData, path)
      this.dataModels.set(surfaceId, updatedData)

      return true
    },

    /**
     * 删除 Surface 的数据模型
     */
    deleteDataModel(surfaceId) {
      if (!this.dataModels.has(surfaceId)) {
        console.warn(`Data model not found for surface: ${surfaceId}`)
        return false
      }

      this.dataModels.delete(surfaceId)
      console.log(`Data model deleted for surface: ${surfaceId}`)
      return true
    },

    /**
     * 清空所有数据模型
     */
    clearAll() {
      this.dataModels.clear()
      console.log('All data models cleared')
    },

    /**
     * 合并数据到指定路径
     */
    mergeData(surfaceId, path, data) {
      if (!validateSurfaceId(surfaceId)) {
        console.error('Invalid surface ID:', surfaceId)
        return false
      }

      this.initDataModel(surfaceId)

      const currentValue = this.getValueByPath(surfaceId, path)

      if (
        typeof currentValue === 'object' &&
        currentValue !== null &&
        typeof data === 'object' &&
        data !== null
      ) {
        const mergedValue = { ...currentValue, ...data }
        return this.setValue(surfaceId, path, mergedValue)
      } else {
        return this.setValue(surfaceId, path, data)
      }
    },
  },
})
