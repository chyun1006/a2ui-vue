# A2UIMultipleChoice 组件下拉选择改造设计

## 1. 需求分析

### 1.1 当前实现

- **单选模式**：使用 RadioGroup + RadioGroupItem（单选按钮）
- **多选模式**：使用 Checkbox（复选框）
- **限制**：通过 `maxAllowedSelections` 控制最大选择数

### 1.2 需求目标

- 将组件改为**下拉选择**形式
- 支持**单选**和**多选**两种模式
- 不影响其他组件的使用

### 1.3 技术选型

使用项目现有的 shadcn/ui Select 组件：

- **单选**：使用标准 Select 组件
- **多选**：需要自定义实现或使用支持多选的下拉组件

## 2. 设计方案

### 2.1 组件行为

#### 单选模式 (`maxAllowedSelections === 1`)

```
┌─────────────────────────┐
│ 请选择选项        ▼    │  ← 触发器
└─────────────────────────┘
         ↓ 点击展开
┌─────────────────────────┐
│ ○ 选项 1               │
│ ● 选项 2 (已选)        │  ← 下拉内容
│ ○ 选项 3               │
└─────────────────────────┘
```

**特性**：

- 点击选项后自动关闭下拉
- 显示当前选中的选项
- 只能选择一个选项

#### 多选模式 (`maxAllowedSelections > 1` 或 `null`)

```
┌─────────────────────────┐
│ 已选 2 项          ▼   │  ← 触发器（显示已选数量）
└─────────────────────────┘
         ↓ 点击展开
┌─────────────────────────┐
│ ☑ 选项 1 (已选)        │
│ ☑ 选项 2 (已选)        │  ← 下拉内容（复选框）
│ ☐ 选项 3               │
│ ☐ 选项 4 (已达上限)    │
└─────────────────────────┘
```

**特性**：

- 点击选项不关闭下拉，可连续选择
- 显示已选数量或已选项标签
- 支持最大选择数限制
- 点击外部或按 ESC 关闭下拉

### 2.2 数据流

```
用户操作 → 更新 selectedValues → updateDataModel() → 更新 manager 数据 → emit change 事件
```

### 2.3 UI 组件映射

| 模式 | 原组件                      | 新组件                                              |
| ---- | --------------------------- | --------------------------------------------------- |
| 单选 | RadioGroup + RadioGroupItem | Select + SelectTrigger + SelectContent + SelectItem |
| 多选 | Checkbox                    | 自定义多选下拉（基于 Popover + Checkbox）           |

### 2.4 API 保持不变

```javascript
props: {
  selections: Object,        // 数据绑定对象
  options: Array,            // 选项列表
  maxAllowedSelections: Number  // 最大选择数（1=单选，>1或null=多选）
}

emit: {
  change: Array  // 选择变化事件
}
```

## 3. 实现方案

### 3.1 单选实现（使用 Select 组件）

```vue
<Select v-model="radioValue">
  <SelectTrigger>
    <SelectValue placeholder="请选择" />
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
```

### 3.2 多选实现（自定义方案）

由于 shadcn/ui 的 Select 组件不原生支持多选，我们需要使用 Popover + Checkbox 实现：

```vue
<Popover v-model:open="isOpen">
  <PopoverTrigger as-child>
    <Button variant="outline" class="w-full justify-between">
      <span>{{ selectedText }}</span>
      <ChevronDown class="ml-2 h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent class="w-full p-0">
    <Command>
      <CommandList>
        <CommandGroup>
          <CommandItem
            v-for="option in optionsList"
            :key="option.value"
            @select="() => toggleCheckbox(option.value, !isSelected(option.value))"
          >
            <Checkbox
              :checked="isSelected(option.value)"
              :disabled="!canSelect && !isSelected(option.value)"
              class="mr-2"
            />
            <span>{{ option.label }}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

### 3.3 显示文本逻辑

**单选模式**：

```javascript
const selectedText = computed(() => {
  const selected = optionsList.value.find(
    (o) => o.value === selectedValues.value[0]
  );
  return selected?.label || "请选择";
});
```

**多选模式**：

```javascript
const selectedText = computed(() => {
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

## 4. 兼容性考虑

### 4.1 向后兼容

- 保持 props 和 events API 不变
- 数据模型更新逻辑不变
- 只改变 UI 呈现方式

### 4.2 A2UI 规范兼容

- 继续支持数据绑定（`selections` 和 `options.label`）
- 继续支持 `maxAllowedSelections` 限制
- 继续触发 `change` 事件

### 4.3 不影响其他组件

- 只修改 `A2UIMultipleChoice.vue` 文件
- 不修改任何共享的 composables 或 utils
- 不影响其他 A2UI 组件

## 5. 需要的 UI 组件

### 5.1 已有组件

- ✅ Select 系列组件（单选用）
- ✅ Checkbox（多选用）
- ✅ Label

### 5.2 需要添加的组件

- ✅ Popover（多选下拉容器）- 已存在
- ✅ Button（多选触发器）- 已存在
- ❌ Command（可选，用于搜索功能）- 不存在，但不是必需的
- ChevronDown 图标 - 使用 lucide-vue-next

**结论**：所有必需的组件都已存在，可以直接开始实现。

## 6. 实现步骤

1. **检查依赖组件**
   - 确认 Popover、Button、Command 组件是否存在
   - 确认所有必需组件都已存在，可以直接开始实现

2. **重构单选模式**
   - 替换 RadioGroup 为 Select
   - 更新样式和交互

3. **重构多选模式**
   - 实现 Popover + Checkbox 方案
   - 添加已选数量显示
   - 保持点击不关闭的行为

4. **测试验证**
   - 单选功能测试
   - 多选功能测试
   - 最大选择数限制测试
   - 数据绑定测试
   - 中文输入法测试

5. **更新文档**
   - 更新组件注释
   - 更新使用示例

## 7. 测试用例

### 7.1 单选模式测试

```javascript
// 测试数据
{
  maxAllowedSelections: 1,
  options: [
    { label: { literalString: "选项1" }, value: "opt1" },
    { label: { literalString: "选项2" }, value: "opt2" },
    { label: { literalString: "选项3" }, value: "opt3" }
  ],
  selections: { path: "/test/selection" }
}

// 预期行为
- 显示下拉选择器
- 点击展开显示所有选项
- 选择一个选项后自动关闭
- 数据模型更新为 ["opt1"]
```

### 7.2 多选模式测试

```javascript
// 测试数据
{
  maxAllowedSelections: 3,
  options: [
    { label: { literalString: "选项1" }, value: "opt1" },
    { label: { literalString: "选项2" }, value: "opt2" },
    { label: { literalString: "选项3" }, value: "opt3" },
    { label: { literalString: "选项4" }, value: "opt4" }
  ],
  selections: { path: "/test/selections" }
}

// 预期行为
- 显示下拉选择器，初始显示"请选择"
- 点击展开显示所有选项（带复选框）
- 可以连续选择多个选项
- 选择3个后，第4个选项禁用
- 显示"已选 3 项"
- 数据模型更新为 ["opt1", "opt2", "opt3"]
```

## 8. 风险评估

### 8.1 低风险

- ✅ API 不变，向后兼容
- ✅ 只修改单个组件文件
- ✅ 使用项目现有的 UI 组件库

### 8.2 中风险

- ⚠️ 多选下拉需要自定义实现（如果 Popover 不存在）
- ⚠️ 需要确保 IME（中文输入法）兼容性

### 8.3 缓解措施

- 充分测试单选和多选场景
- 参考现有组件的实现模式
- 保持代码简洁，避免过度设计

## 9. 时间估算

- 检查依赖组件：10分钟
- 实现单选模式：30分钟
- 实现多选模式：1小时
- 测试和调试：30分钟
- 文档更新：15分钟

**总计**：约 2.5 小时

## 10. 下一步行动

1. 检查 Popover、Button、Command 组件是否存在
2. 如不存在，确定是添加组件还是使用替代方案
3. 开始实现单选模式
4. 实现多选模式
5. 测试验证
6. 更新文档
