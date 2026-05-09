<script setup lang="ts">
import { computed, ref } from 'vue'
import BasicExample from './examples/BasicExample.vue'
import CanMoveExample from './examples/CanMoveExample.vue'
import CustomOverlayExample from './examples/CustomOverlayExample.vue'
import HandlesExample from './examples/HandlesExample.vue'
import HorizontalExample from './examples/HorizontalExample.vue'
import MotionDisabledExample from './examples/MotionDisabledExample.vue'

const examples = [
  { id: 'basic', label: 'Basic', component: BasicExample },
  { id: 'horizontal', label: 'Horizontal', component: HorizontalExample },
  { id: 'handles', label: 'Handles', component: HandlesExample },
  { id: 'overlay', label: 'Custom overlay', component: CustomOverlayExample },
  { id: 'motion-disabled', label: 'Motion disabled', component: MotionDisabledExample },
  { id: 'can-move', label: 'Can move', component: CanMoveExample },
] as const

const activeId = ref<(typeof examples)[number]['id']>('basic')
const activeExample = computed(() => examples.find(example => example.id === activeId.value) ?? examples[0])
</script>

<template>
  <main class="page">
    <header class="header">
      <h1>VueSortable Playground</h1>
      <p>Unstyled sortable primitives for Vue 3.</p>
    </header>

    <nav
      class="tabs"
      aria-label="Examples"
    >
      <button
        v-for="example in examples"
        :key="example.id"
        type="button"
        :data-active="example.id === activeId ? 'true' : 'false'"
        @click="activeId = example.id"
      >
        {{ example.label }}
      </button>
    </nav>

    <section class="panel">
      <component :is="activeExample.component" />
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  background: #eef2f7;
  color: #182033;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  margin: 0;
}

:global(*) {
  box-sizing: border-box;
}

.page {
  display: grid;
  gap: 24px;
  margin: 0 auto;
  max-width: 860px;
  padding: 40px 20px;
}

.header {
  display: grid;
  gap: 8px;
}

.header h1 {
  font-size: 32px;
  line-height: 1.15;
  margin: 0;
}

.header p {
  color: #526077;
  margin: 0;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tabs button {
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  color: #526077;
  font: inherit;
  padding: 8px 12px;
}

.tabs button[data-active="true"] {
  background: #182033;
  border-color: #182033;
  color: #ffffff;
}

.panel {
  background: #f8fafc;
  border: 1px solid #d7dde8;
  border-radius: 12px;
  min-height: 280px;
  padding: 20px;
}

@media (max-width: 640px) {
  .page {
    padding: 24px 14px;
  }

  .tabs button {
    flex: 1 1 auto;
  }
}
</style>
