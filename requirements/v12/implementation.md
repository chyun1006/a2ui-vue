# A2UIMultipleChoice 组件实现方案

## 实现代码

### 完整组件代码

```vue
<script setup>
import { ref, computed, watch, inject } from "vue";
import { useDataBinding } from "../../../composables/useDataBinding.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-vue-next";

/**
 * @component A2UIMultipleChoice
 * @description 下拉选择组件，支持单选和多选模式
 * @param {Object} selections - 数据绑定对象，包含已选值的数组
 * @param {Array} options - 选项对象数组，每个对象包含 label（数据绑定）和 value
 * @param {number} [maxAllowedSelections=null] - 允许的最大选择数；设置为 1 时启用单选模式
 * @emits {Array} change - 选择变化时发出，带有已选值的数组
 */
const props = defineProps({
  selections: {
    type: Object,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  maxAllowedSelections: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["change"]);

const surfaceId = inject("a2ui-surface-id");
const manager = inject("a2ui-manager");
const { resolveValue, getPath } = useDataBinding(surfaceId.value);

const initialSelections = computed(() => resolveValue(props.selections) || []);

const selectedValues = ref([...initialSelections.value]);
const isOpen = ref(false);

watch(initialSelections, (newVal) => {
  selectedValues.value = [...newVal];
});

const optionsList = computed(() => {
  return props.options.map((option) => ({
    label: resolveValue(option.label),
    value: option.value,
  }));
});

const isSingleChoice = computed(() => props.maxAllowedSelections === 1);

const isSelected = (value) => {
  return selectedValues.value.includes(value);
};

const canSelect = computed(() => {
  if (!props.maxAllowedSelections) return true;
  return selectedValues.value.length < props.maxAllowedSelections;
});

// 单选模式：显示选中项的标签
const singleSelectedLabel = computed(() => {
  if (selectedValues.value.length === 0) return "";
  const selected = optionsList.value.find(
    (o) => o.value === selectedValues.value[0]
  );
  return selected?.label || "";
});

// 多选模式：显示文本
const multiSelectedText = computed(() => {
  const count = selectedValues.value.length;
  if (count === 0) return "请选择";
  if (count === 1) {
    const selected = optionsList.value.find(
      (o) => o.value === selectedValues.value[0]
    );
    return selected?.label || "请选择";
  }
  return `已选 ${count} 项`;
});

// 单选处理
const handleSingleSelect = (value) => {
  selectedValues.value = [value];
  updateDataModel();
};

// 多选处理
const toggleCheckbox = (value, checked) => {
  if (checked) {
    if (canSelect.value) {
      selectedValues.value.push(value);
    }
  } else {
    const index = selectedValues.value.indexOf(value);
    if (index > -1) {
      selectedValues.value.splice(index, 1);
    }
  }
  updateDataModel();
};

const updateDataModel = () => {
  const path = getPath(props.selections);
  if (path) {
    manager?.updateData(surfaceId.value, path, selectedValues.value);
  }
  emit("change", selectedValues.value);
};
</script>

<template>
  <div class="w-full">
    <!-- 单选模式 -->
    <Select
      v-if="isSingleChoice"
      :model-value="selectedValues[0]"
      @update:model-value="handleSingleSelect"
    >
      <SelectTrigger class="w-full">
        <SelectValue :placeholder="singleSelectedLabel || '请选择'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in optionsList"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- 多选模式 -->
    <Popover v-else v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="isOpen"
          class="w-full justify-between"
        >
          <span class="truncate">{{ multiSelectedText }}</span>
          <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-full p-2" align="start">
        <div class="space-y-2">
          <div
            v-for="option in optionsList"
            :key="option.value"
            class="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
            @click="toggleCheckbox(option.value, !isSelected(option.value))"
          >
            <Checkbox
              :id="option.value"
              :checked="isSelected(option.value)"
              :disabled="!canSelect && !isSelected(option.value)"
              @click.stop
              @update:checked="
                (checked) => toggleCheckbox(option.value, checked)
              "
            />
            <Label
              :for="option.value"
              :class="{
                'opacity-50': !canSelect && !isSelected(option.value),
                'cursor-pointer': true,
              }"
              class="flex-1"
            >
              {{ option.label }}
            </Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
```

## 关键改动说明

### 1. 导入变化

**移除**：

```javascript
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
```

**新增**：

```javascript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-vue-next";
```

### 2. 新增状态

```javascript
const isOpen = ref(false); // 控制多选下拉的打开/关闭状态
```

### 3. 新增计算属性

```javascript
// 单选模式显示文本
const singleSelectedLabel = computed(() => {
  if (selectedValues.value.length === 0) return "";
  const selected = optionsList.value.find(
    (o) => o.value === selectedValues.value[0]
  );
  return selected?.label || "";
});

// 多选模式显示文本
const multiSelectedText = computed(() => {
  const count = selectedValues.value.length;
  if (count === 0) return "请选择";
  if (count === 1) {
    const selected = optionsList.value.find(
      (o) => o.value === selectedValues.value[0]
    );
    return selected?.label || "请选择";
  }
  return `已选 ${count} 项`;
});
```

### 4. 修改事件处理

**单选**：

```javascript
// 旧：使用 v-model 绑定 radioValue
const radioValue = computed({
  get: () => selectedValues.value[0] || "",
  set: (value) => {
    selectedValues.value = [value];
    updateDataModel();
  },
});

// 新：使用 @update:model-value 事件
const handleSingleSelect = (value) => {
  selectedValues.value = [value];
  updateDataModel();
};
```

**多选**：保持不变，继续使用 `toggleCheckbox` 方法

### 5. 模板变化

**单选模式**：

- 从 `RadioGroup` 改为 `Select`
- 使用 `SelectTrigger` + `SelectValue` 显示触发器
- 使用 `SelectContent` + `SelectItem` 显示选项列表

**多选模式**：

- 从垂直排列的 `Checkbox` 改为 `Popover` 下拉
- 使用 `Button` 作为触发器，显示已选数量
- 在 `PopoverContent` 中显示 `Checkbox` 列表
- 添加 hover 效果和点击区域优化

## 样式优化

### 多选下拉项交互

```vue
<div
  class="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
  @click="toggleCheckbox(option.value, !isSelected(option.value))"
>
```

**特性**：

- `hover:bg-accent`：鼠标悬停时高亮
- `cursor-pointer`：显示手型光标
- `rounded-sm`：圆角边框
- 整行可点击，不仅限于复选框

### 触发器样式

```vue
<Button variant="outline" role="combobox" class="w-full justify-between">
  <span class="truncate">{{ multiSelectedText }}</span>
  <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
</Button>
```

**特性**：

- `w-full`：全宽显示
- `justify-between`：文本和图标两端对齐
- `truncate`：文本过长时截断
- `ChevronDown`：下拉箭头图标

## 兼容性保证

### API 完全兼容

- ✅ `selections` prop：数据绑定对象
- ✅ `options` prop：选项列表
- ✅ `maxAllowedSelections` prop：最大选择数
- ✅ `change` event：选择变化事件

### 行为兼容

- ✅ 单选模式（`maxAllowedSelections === 1`）
- ✅ 多选模式（`maxAllowedSelections > 1` 或 `null`）
- ✅ 最大选择数限制
- ✅ 数据模型更新
- ✅ 初始值加载

### 数据流兼容

- ✅ 从 `selections` 读取初始值
- ✅ 通过 `manager.updateData` 更新数据模型
- ✅ 触发 `change` 事件通知父组件

## 测试检查清单

- [ ] 单选模式：选择一个选项
- [ ] 单选模式：切换选项
- [ ] 单选模式：显示选中项标签
- [ ] 多选模式：选择多个选项
- [ ] 多选模式：取消选择
- [ ] 多选模式：显示已选数量
- [ ] 多选模式：达到最大选择数时禁用其他选项
- [ ] 数据绑定：初始值正确加载
- [ ] 数据绑定：选择后数据模型正确更新
- [ ] 事件触发：change 事件正确触发
- [ ] 中文输入：无影响（下拉选择不涉及输入）
- [ ] 样式：与其他组件风格一致
- [ ] 响应式：在不同屏幕尺寸下正常显示

## 注意事项

1. **Popover 宽度**：使用 `w-full` 确保下拉内容与触发器等宽
2. **点击事件**：在 Checkbox 上使用 `@click.stop` 防止事件冒泡
3. **禁用状态**：达到最大选择数时，未选中的选项应禁用
4. **文本截断**：使用 `truncate` 防止长文本溢出
5. **无障碍**：添加 `role="combobox"` 和 `aria-expanded` 属性
