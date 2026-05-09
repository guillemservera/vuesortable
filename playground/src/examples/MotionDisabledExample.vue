<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'one', label: 'No motion one' },
  { id: 'two', label: 'No motion two' },
  { id: 'three', label: 'No motion three' },
])
</script>

<template>
  <Sortable
    v-model="items"
    item-key="id"
    :motion="false"
    list-class="stack"
  >
    <template #item="{ element, attrs }">
      <div
        v-bind="attrs"
        class="row"
      >
        {{ element.label }}
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
  min-height: 52px;
  padding: 10px 12px;
}
</style>
