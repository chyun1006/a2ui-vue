import { setValueByPath } from './src/core/utils.js'

// 模拟响应式对象
const dataModel = {
  chat: {
    input_text: '',
  },
}

console.log('Initial dataModel:', dataModel)

// 第一次更新
console.log('\n=== First update ===')
const result1 = setValueByPath(dataModel, '/chat/input_text', 'a')
console.log('setValueByPath returned:', result1)
console.log('dataModel after first update:', dataModel)

// 第二次更新
console.log('\n=== Second update ===')
const result2 = setValueByPath(dataModel, '/chat/input_text', 'ab')
console.log('setValueByPath returned:', result2)
console.log('dataModel after second update:', dataModel)
