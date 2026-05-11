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
    v-slot="{ entries, listAttrs, getItemAttrs, getHandleAttrs, getPlaceholderAttrs, overlay }"
  >
    <div
      v-bind="listAttrs"
      class="stack"
    >
      <template
        v-for="entry in entries"
        :key="entry.key"
      >
        <div
          v-if="entry.type === 'placeholder'"
          v-bind="getPlaceholderAttrs(entry).attrs"
          :style="getPlaceholderAttrs(entry).style"
        />

        <div
          v-else
          v-bind="getItemAttrs(entry).attrs"
          class="row"
        >
          <span>{{ entry.element.label }}</span>
          <button
            v-bind="getHandleAttrs(entry)"
            class="handle"
            type="button"
          >
            Drag
          </button>
        </div>
      </template>
    </div>

    <div
      v-if="overlay"
      v-bind="overlay.attrs"
      :style="overlay.style"
      class="row"
    >
      {{ overlay.element.label }}
    </div>
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
