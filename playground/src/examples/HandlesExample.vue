<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'design', label: 'Design review' },
  { id: 'copy', label: 'Copy pass' },
  { id: 'qa', label: 'QA checklist' },
])
</script>

<template>
  <Sortable
    v-model="items"
    item-key="id"
    list-class="stack"
  >
    <template #item="{ element, attrs, handleAttrs }">
      <div
        v-bind="attrs"
        class="row"
      >
        <span>{{ element.label }}</span>
        <button
          v-bind="handleAttrs"
          class="handle"
          type="button"
        >
          Drag
        </button>
      </div>
    </template>
  </Sortable>
</template>

<style scoped>
.stack {
  display: grid;
  gap: 10px;
}

.row {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  color: #182033;
  display: flex;
  justify-content: space-between;
  min-height: 52px;
  padding: 10px 12px;
}

.handle {
  background: #182033;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  font: inherit;
  padding: 6px 10px;
}
</style>
