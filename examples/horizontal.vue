<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'backlog', label: 'Backlog' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
])
</script>

<template>
  <Sortable
    v-model="items"
    item-key="id"
    orientation="horizontal"
    v-slot="{ entries, listAttrs, getItemAttrs, getPlaceholderAttrs, overlay }"
  >
    <div
      v-bind="listAttrs"
      class="sortable-row"
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
          class="sortable-chip"
        >
          {{ entry.element.label }}
        </div>
      </template>
    </div>

    <div
      v-if="overlay"
      v-bind="overlay.attrs"
      :style="overlay.style"
      class="sortable-chip"
    >
      {{ overlay.element.label }}
    </div>
  </Sortable>
</template>

<style scoped>
.sortable-row {
  display: flex;
  gap: 8px;
}

.sortable-chip {
  align-items: center;
  display: inline-flex;
  flex: 0 0 120px;
  justify-content: center;
  min-height: 48px;
}
</style>
