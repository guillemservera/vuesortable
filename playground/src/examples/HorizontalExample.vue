<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'todo', label: 'Todo' },
  { id: 'doing', label: 'Doing' },
  { id: 'review', label: 'Review' },
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
      class="lane"
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
          class="pill"
        >
          {{ entry.element.label }}
        </div>
      </template>
    </div>

    <div
      v-if="overlay"
      v-bind="overlay.attrs"
      :style="overlay.style"
      class="pill"
    >
      {{ overlay.element.label }}
    </div>
  </Sortable>
</template>

<style scoped>
.lane {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.pill {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  color: #182033;
  display: inline-flex;
  flex: 0 0 120px;
  height: 72px;
  justify-content: center;
}
</style>
