/**
 * 组件相关的常量定义
 */

/**
 * 组件名称到 Vue 组件的映射
 */
export const COMPONENT_MAP = {
  Text: 'A2UIText',
  Image: 'A2UIImage',
  Icon: 'A2UIIcon',
  Video: 'A2UIVideo',
  AudioPlayer: 'A2UIAudioPlayer',
  Row: 'A2UIRow',
  Column: 'A2UIColumn',
  List: 'A2UIList',
  Card: 'A2UICard',
  Tabs: 'A2UITabs',
  Modal: 'A2UIModal',
  Divider: 'A2UIDivider',
  Button: 'A2UIButton',
  TextField: 'A2UITextField',
  CheckBox: 'A2UICheckBox',
  DateTimeInput: 'A2UIDateTimeInput',
  MultipleChoice: 'A2UIMultipleChoice',
  Slider: 'A2UISlider',
  // 图表组件
  PieChart: 'A2UIPieChart',
  BarChart: 'A2UIBarChart',
  LineChart: 'A2UILineChart',
  StackedChart: 'A2UIStackedChart',
  ScatterChart: 'A2UIScatterChart',
}

/**
 * 基础组件 Props 定义
 */
export const BASE_COMPONENT_PROPS = {
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
}

/**
 * Children 类型
 */
export const CHILDREN_TYPES = {
  EXPLICIT_LIST: 'explicitList',
  TEMPLATE: 'template',
}

/**
 * CSS Flexbox 映射
 */
export const FLEX_JUSTIFY_CONTENT_MAP = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  spaceBetween: 'space-between',
  spaceAround: 'space-around',
  spaceEvenly: 'space-evenly',
}

export const FLEX_ALIGN_ITEMS_MAP = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
}

/**
 * HTML 标签映射
 */
export const TEXT_TAG_MAP = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  caption: 'span',
  body: 'p',
}
