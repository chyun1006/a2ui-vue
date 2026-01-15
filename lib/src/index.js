/**
 * @a2ui/renderer
 * A2UI 渲染器 - 独立的、无依赖的 A2UI 渲染包
 */

// 导入样式
import './styles/index.css'
import './styles/theme.css'

// ============================================
// 主要 API - 渲染器和消息处理
// ============================================
export { createSignalA2uiMessageProcessor } from './processor.js'
export { default as a2uiRender } from './components/A2UIRender.vue'

// ============================================
// 高级 API - 管理器和单例（可选）
// ============================================
export { A2UIManager } from './core/A2UIManager.js'
export { getGlobalManager, resetGlobalManager, hasGlobalManager } from './core/singleton.js'

// ============================================
// 常量和类型
// ============================================
export { A2UI_EVENTS, MESSAGE_TYPES, COMPONENT_TYPES } from './types/a2ui.js'

// ============================================
// 工具函数
// ============================================
export {
  parseDataContents,
  deepClone,
  mergeObjects,
  cn,
  getValueByPath,
  setValueByPath,
  deleteValueByPath,
  normalizePath,
} from './core/utils.js'

// ============================================
// UI 组件 - shadcn-vue 组件库
// ============================================
export { Button } from './components/ui/button'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/ui/card'
export { Textarea } from './components/ui/textarea'
export { Input } from './components/ui/input'
export { Label } from './components/ui/label'
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select'
export { Checkbox } from './components/ui/checkbox'
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group'
export { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover'
