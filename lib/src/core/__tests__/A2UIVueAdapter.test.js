/**
 * A2UIVueAdapter 测试
 * 验证适配器的基本功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { A2UIVueAdapter } from '../A2UIVueAdapter.js'

describe('A2UIVueAdapter', () => {
  let adapter

  beforeEach(() => {
    adapter = new A2UIVueAdapter()
  })

  describe('初始化', () => {
    it('应该成功创建适配器实例', () => {
      expect(adapter).toBeDefined()
      expect(adapter.litProcessor).toBeDefined()
      expect(adapter.state).toBeDefined()
    })

    it('应该初始化空的状态', () => {
      expect(adapter.state.surfaces.size).toBe(0)
      expect(adapter.state.dataModels.size).toBe(0)
      expect(adapter.state.initialized).toBe(false)
    })
  })

  describe('消息处理', () => {
    it('应该处理 beginRendering 消息', () => {
      const messages = [
        {
          beginRendering: {
            surfaceId: 'test-surface',
            root: 'root',
            styles: {
              primaryColor: '#FF0000',
              font: 'Roboto',
            },
          },
        },
      ]

      adapter.processMessages(messages)

      expect(adapter.state.initialized).toBe(true)
      const surface = adapter.getSurface('test-surface')
      expect(surface).toBeDefined()
    })

    it('应该处理 surfaceUpdate 消息', () => {
      const messages = [
        {
          beginRendering: {
            surfaceId: 'test-surface',
            root: 'root',
          },
        },
        {
          surfaceUpdate: {
            surfaceId: 'test-surface',
            components: [
              {
                id: 'root',
                component: {
                  Text: {
                    text: {
                      literalString: 'Hello World',
                    },
                  },
                },
              },
            ],
          },
        },
      ]

      adapter.processMessages(messages)

      const component = adapter.getComponent('test-surface', 'root')
      expect(component).toBeDefined()
    })

    it('应该处理 dataModelUpdate 消息', () => {
      const messages = [
        {
          beginRendering: {
            surfaceId: 'test-surface',
            root: 'root',
          },
        },
        {
          dataModelUpdate: {
            surfaceId: 'test-surface',
            contents: [
              {
                key: 'name',
                valueString: 'Test User',
              },
            ],
          },
        },
      ]

      adapter.processMessages(messages)

      const data = adapter.getData('test-surface', '/name')
      expect(data).toBe('Test User')
    })
  })

  describe('Surface 管理', () => {
    beforeEach(() => {
      const messages = [
        {
          beginRendering: {
            surfaceId: 'test-surface',
            root: 'root',
          },
        },
      ]
      adapter.processMessages(messages)
    })

    it('应该获取 surface', () => {
      const surface = adapter.getSurface('test-surface')
      expect(surface).toBeDefined()
    })

    it('应该清空所有 surfaces', () => {
      adapter.clearSurfaces()
      expect(adapter.state.surfaces.size).toBe(0)
      expect(adapter.state.dataModels.size).toBe(0)
    })

    it('应该删除指定 surface', () => {
      adapter.deleteSurface('test-surface')
      expect(adapter.getSurface('test-surface')).toBeNull()
    })
  })

  describe('数据访问', () => {
    beforeEach(() => {
      const messages = [
        {
          beginRendering: {
            surfaceId: 'test-surface',
            root: 'root',
          },
        },
        {
          surfaceUpdate: {
            surfaceId: 'test-surface',
            components: [
              {
                id: 'root',
                component: {
                  Column: {
                    children: {
                      explicitList: [],
                    },
                  },
                },
              },
            ],
          },
        },
        {
          dataModelUpdate: {
            surfaceId: 'test-surface',
            contents: [
              {
                key: 'user',
                valueMap: [
                  {
                    key: 'name',
                    valueString: 'John Doe',
                  },
                  {
                    key: 'age',
                    valueNumber: 30,
                  },
                ],
              },
            ],
          },
        },
      ]
      adapter.processMessages(messages)
    })

    it('应该获取简单数据', () => {
      const name = adapter.getData('test-surface', '/user/name')
      expect(name).toBe('John Doe')
    })

    it('应该获取数字数据', () => {
      const age = adapter.getData('test-surface', '/user/age')
      expect(age).toBe(30)
    })

    it('应该更新数据', () => {
      adapter.updateData('test-surface', '/user/name', 'Jane Doe')
      const name = adapter.getData('test-surface', '/user/name')
      expect(name).toBe('Jane Doe')
    })
  })

  describe('销毁', () => {
    it('应该清理所有资源', () => {
      const messages = [
        {
          beginRendering: {
            surfaceId: 'test-surface',
            root: 'root',
          },
        },
      ]
      adapter.processMessages(messages)

      adapter.destroy()

      expect(adapter.state.surfaces.size).toBe(0)
      expect(adapter.state.dataModels.size).toBe(0)
      expect(adapter.state.initialized).toBe(false)
    })
  })
})
