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
    list-class="lane"
  >
    <template #item="{ element, attrs }">
      <div
        v-bind="attrs"
        class="pill"
      >
        {{ element.label }}
      </div>
    </template>
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
