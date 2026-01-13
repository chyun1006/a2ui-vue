/**
 * A2UI 常量定义
 * 包含 A2UI 规范中的所有常量和枚举值
 */

/**
 * A2UI 事件类型
 */
export const A2UI_EVENTS = {
  SURFACE_CREATED: 'surface:created',
  SURFACE_UPDATED: 'surface:updated',
  SURFACE_DELETED: 'surface:deleted',
  COMPONENT_UPDATED: 'component:updated',
  DATA_UPDATED: 'data:updated',
  ERROR: 'error',
}

/**
 * A2UI 消息类型
 */
export const MESSAGE_TYPES = {
  BEGIN_RENDERING: 'beginRendering',
  SURFACE_UPDATE: 'surfaceUpdate',
  DATA_MODEL_UPDATE: 'dataModelUpdate',
  DELETE_SURFACE: 'deleteSurface',
}

/**
 * 组件类型映射
 */
export const COMPONENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  ICON: 'icon',
  VIDEO: 'video',
  AUDIO_PLAYER: 'audioPlayer',
  ROW: 'row',
  COLUMN: 'column',
  LIST: 'list',
  CARD: 'card',
  TABS: 'tabs',
  MODAL: 'modal',
  DIVIDER: 'divider',
  BUTTON: 'button',
  TEXT_FIELD: 'textField',
  CHECK_BOX: 'checkBox',
  DATE_TIME_INPUT: 'dateTimeInput',
  MULTIPLE_CHOICE: 'multipleChoice',
  SLIDER: 'slider',
}

/**
 * 文本使用提示
 */
export const TEXT_USAGE_HINTS = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  CAPTION: 'caption',
  BODY: 'body',
}

/**
 * 图片适配方式
 */
export const IMAGE_FIT = {
  CONTAIN: 'contain',
  COVER: 'cover',
  FILL: 'fill',
  NONE: 'none',
  SCALE_DOWN: 'scale-down',
}

/**
 * 图片使用提示
 */
export const IMAGE_USAGE_HINTS = {
  ICON: 'icon',
  AVATAR: 'avatar',
  SMALL_FEATURE: 'smallFeature',
  MEDIUM_FEATURE: 'mediumFeature',
  LARGE_FEATURE: 'largeFeature',
  HEADER: 'header',
}

/**
 * 图标名称（Material Icons）
 */
export const ICON_NAMES = [
  'accountCircle',
  'add',
  'arrowBack',
  'arrowForward',
  'attachFile',
  'calendarToday',
  'call',
  'camera',
  'check',
  'close',
  'delete',
  'download',
  'edit',
  'event',
  'error',
  'favorite',
  'favoriteOff',
  'folder',
  'help',
  'home',
  'info',
  'locationOn',
  'lock',
  'lockOpen',
  'mail',
  'menu',
  'moreVert',
  'moreHoriz',
  'notificationsOff',
  'notifications',
  'payment',
  'person',
  'phone',
  'photo',
  'print',
  'refresh',
  'search',
  'send',
  'settings',
  'share',
  'shoppingCart',
  'star',
  'starHalf',
  'starOff',
  'upload',
  'visibility',
  'visibilityOff',
  'warning',
]

/**
 * 布局分布方式（justify-content）
 */
export const DISTRIBUTION = {
  START: 'start',
  CENTER: 'center',
  END: 'end',
  SPACE_BETWEEN: 'spaceBetween',
  SPACE_AROUND: 'spaceAround',
  SPACE_EVENLY: 'spaceEvenly',
}

/**
 * 布局对齐方式（align-items）
 */
export const ALIGNMENT = {
  START: 'start',
  CENTER: 'center',
  END: 'end',
  STRETCH: 'stretch',
}

/**
 * 列表方向
 */
export const LIST_DIRECTION = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
}

/**
 * 分隔线方向
 */
export const DIVIDER_AXIS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
}

/**
 * 文本框类型
 */
export const TEXT_FIELD_TYPES = {
  DATE: 'date',
  LONG_TEXT: 'longText',
  NUMBER: 'number',
  SHORT_TEXT: 'shortText',
  OBSCURED: 'obscured',
}

/**
 * 值类型字段名
 */
export const VALUE_FIELDS = {
  LITERAL_STRING: 'literalString',
  LITERAL_NUMBER: 'literalNumber',
  LITERAL_BOOLEAN: 'literalBoolean',
  LITERAL_ARRAY: 'literalArray',
  PATH: 'path',
}

/**
 * 数据模型值类型字段名
 */
export const DATA_VALUE_FIELDS = {
  VALUE_STRING: 'valueString',
  VALUE_NUMBER: 'valueNumber',
  VALUE_BOOLEAN: 'valueBoolean',
  VALUE_MAP: 'valueMap',
}
