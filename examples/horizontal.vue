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
    list-class="sortable-row"
  >
    <template #item="{ element, attrs }">
      <div
        v-bind="attrs"
        class="sortable-chip"
      >
        {{ element.label }}
      </div>
    </template>
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
