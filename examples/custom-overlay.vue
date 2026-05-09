<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'drafts', label: 'Drafts' },
  { id: 'issues', label: 'Issues' },
  { id: 'inbox', label: 'Inbox' },
])
</script>

<template>
  <Sortable
    v-model="items"
    item-key="id"
  >
    <template #item="{ element, attrs, handleAttrs }">
      <div v-bind="attrs">
        <button
          v-bind="handleAttrs"
          type="button"
        >
          Grab
        </button>
        {{ element.label }}
      </div>
    </template>

    <template #overlay="{ element, dragging }">
      <div :data-dragging="dragging ? 'true' : 'false'">
        {{ element.label }}
      </div>
    </template>
  </Sortable>
</template>
