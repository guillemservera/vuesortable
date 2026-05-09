<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'north', label: 'North desk' },
  { id: 'south', label: 'South desk' },
  { id: 'west', label: 'West desk' },
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
        <button
          v-bind="handleAttrs"
          class="handle"
          type="button"
        >
          ::
        </button>
        {{ element.label }}
      </div>
    </template>

    <template #overlay="{ element }">
      <div class="overlay-card">
        Moving {{ element.label }}
      </div>
    </template>
  </Sortable>
</template>

<style scoped>
.stack {
  display: grid;
  gap: 10px;
}

.row,
.overlay-card {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  color: #182033;
  display: flex;
  gap: 10px;
  min-height: 52px;
  padding: 10px 12px;
}

.overlay-card {
  border-color: #3d63dd;
  box-shadow: 0 10px 24px rgba(24, 32, 51, 0.16);
}

.handle {
  background: #f4f6fa;
  border: 1px solid #d7dde8;
  border-radius: 6px;
  color: #526077;
  font: inherit;
  height: 28px;
  width: 32px;
}
</style>
