/**
 * Surface 状态管理
 * 管理所有 Surface 实例、组件树和样式
 */

import { defineStore } from 'pinia'
import {
  validateComponentDefinition,
  validateStyles,
  validateSurfaceId,
} from '../utils/validator.js'

export const useSurfaceStore = defineStore('surface', {
  state: () => ({
    surfaces: new Map(),
  }),

  getters: {
    /**
     * 获取所有 Surface
     */
    allSurfaces: (state) => Array.from(state.surfaces.values()),

    /**
     * 获取 Surface 数量
     */
    surfaceCount: (state) => state.surfaces.size,

    /**
     * 检查 Surface 是否存在
     */
    hasSurface: (state) => (surfaceId) => {
      return state.surfaces.has(surfaceId)
    },

    /**
     * 获取指定 Surface
     */
    getSurface: (state) => (surfaceId) => {
      return state.surfaces.get(surfaceId)
    },

    /**
     * 获取 Surface 的根组件 ID
     */
    getRootComponentId: (state) => (surfaceId) => {
      const surface = state.surfaces.get(surfaceId)
      return surface?.rootComponentId
    },

    /**
     * 获取 Surface 的样式
     */
    getStyles: (state) => (surfaceId) => {
      const surface = state.surfaces.get(surfaceId)
      return surface?.styles || {}
    },

    /**
     * 获取指定组件
     */
    getComponent: (state) => (surfaceId, componentId) => {
      const surface = state.surfaces.get(surfaceId)
      if (!surface) return null
      return surface.components.get(componentId)
    },

    /**
     * 获取所有组件
     */
    getAllComponents: (state) => (surfaceId) => {
      const surface = state.surfaces.get(surfaceId)
      if (!surface) return []
      return Array.from(surface.components.values())
    },
  },

  actions: {
    /**
     * 创建新的 Surface
     */
    createSurface({ id, rootComponentId, styles = null }) {
      if (!validateSurfaceId(id)) {
        console.error('Invalid surface ID:', id)
        return false
      }

      if (styles && !validateStyles(styles)) {
        console.error('Invalid styles:', styles)
        return false
      }

      const surface = {
        id,
        rootComponentId,
        components: new Map(),
        styles: styles || {},
      }

      this.surfaces.set(id, surface)
      console.log(`Surface created: ${id}`)
      return true
    },

    /**
     * 更新 Surface 的组件
     */
    updateComponents(surfaceId, components) {
      if (!validateSurfaceId(surfaceId)) {
        console.error('Invalid surface ID:', surfaceId)
        return false
      }

      const surface = this.surfaces.get(surfaceId)
      if (!surface) {
        console.error(`Surface not found: ${surfaceId}`)
        return false
      }

      if (!Array.isArray(components)) {
        console.error('Components must be an array')
        return false
      }

      for (const componentDef of components) {
        if (!validateComponentDefinition(componentDef)) {
          console.error('Invalid component definition:', componentDef)
          continue
        }

        surface.components.set(componentDef.id, componentDef)
      }

      console.log(`Surface updated: ${surfaceId}, ${components.length} components`)
      return true
    },

    /**
     * 添加单个组件
     */
    addComponent(surfaceId, componentDef) {
      if (!validateComponentDefinition(componentDef)) {
        console.error('Invalid component definition:', componentDef)
        return false
      }

      const surface = this.surfaces.get(surfaceId)
      if (!surface) {
        console.error(`Surface not found: ${surfaceId}`)
        return false
      }

      surface.components.set(componentDef.id, componentDef)
      return true
    },

    /**
     * 删除组件
     */
    removeComponent(surfaceId, componentId) {
      const surface = this.surfaces.get(surfaceId)
      if (!surface) {
        console.error(`Surface not found: ${surfaceId}`)
        return false
      }

      return surface.components.delete(componentId)
    },

    /**
     * 更新 Surface 样式
     */
    updateStyles(surfaceId, styles) {
      if (!validateStyles(styles)) {
        console.error('Invalid styles:', styles)
        return false
      }

      const surface = this.surfaces.get(surfaceId)
      if (!surface) {
        console.error(`Surface not found: ${surfaceId}`)
        return false
      }

      surface.styles = { ...surface.styles, ...styles }
      return true
    },

    /**
     * 删除 Surface
     */
    deleteSurface(surfaceId) {
      if (!this.surfaces.has(surfaceId)) {
        console.warn(`Surface not found: ${surfaceId}`)
        return false
      }

      this.surfaces.delete(surfaceId)
      console.log(`Surface deleted: ${surfaceId}`)
      return true
    },

    /**
     * 清空所有 Surface
     */
    clearAll() {
      this.surfaces.clear()
      console.log('All surfaces cleared')
    },
  },
})
