<script setup>
import { ref } from 'vue'
import A2UIRenderer from '../../A2UIRenderer.vue'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  manager: {
    type: Object,
    required: true,
  },
  entryPointChild: {
    type: String,
    required: true,
  },
  contentChild: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['action'])

const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const handleAction = (actionData) => {
  emit('action', actionData)
}

const handleEntryPointAction = (actionData) => {
  openModal()
  emit('action', actionData)
}
</script>

<template>
  <div class="a2ui-modal-container">
    <div @click="openModal">
      <A2UIRenderer
        :surface-id="surfaceId"
        :component-id="entryPointChild"
        :manager="manager"
        @action="handleEntryPointAction"
      />
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isOpen" class="a2ui-modal-overlay" @click="closeModal">
          <div class="a2ui-modal-content" @click.stop>
            <button class="a2ui-modal-close" @click="closeModal">
              <span class="material-icons">close</span>
            </button>
            <A2UIRenderer
              :surface-id="surfaceId"
              :component-id="contentChild"
              :manager="manager"
              @action="handleAction"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.a2ui-modal-container {
  display: inline-block;
}

.a2ui-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.a2ui-modal-content {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.a2ui-modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.a2ui-modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.a2ui-modal-close .material-icons {
  font-size: 24px;
  color: #666;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .a2ui-modal-content,
.modal-leave-active .a2ui-modal-content {
  transition: transform 0.3s;
}

.modal-enter-from .a2ui-modal-content,
.modal-leave-to .a2ui-modal-content {
  transform: scale(0.9);
}
</style>
