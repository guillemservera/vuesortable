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
    <template #item="{ element, attrs }">
      <div v-bind="attrs">
        {{ element.label }}
      </div>
    </template>
  </Sortable>
</template>
