<script setup>
import { onMounted } from 'vue'
import { createSignalA2uiMessageProcessor } from '../processor.js'
import a2uiRender from '../components/A2UIRender.vue'
import demoMessages from '../mock/comprehensive-demo.json'

const processor = createSignalA2uiMessageProcessor()

onMounted(() => {
  console.log('Loading comprehensive demo messages...')
  processor(demoMessages)
})

const handleAction = (event) => {
  console.log('Action triggered:', event)
}
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-6xl mx-auto">
      <a2uiRender @action="handleAction" />
    </div>
  </div>
</template>
