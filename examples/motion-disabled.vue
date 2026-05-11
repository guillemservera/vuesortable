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
    :motion="false"
    v-slot="{ entries, listAttrs, getItemAttrs, getHandleAttrs, getPlaceholderAttrs, overlay }"
  >
    <div v-bind="listAttrs">
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
        >
          <button
            v-bind="getHandleAttrs(entry)"
            type="button"
          >
            Grab
          </button>
          {{ entry.element.label }}
        </div>
      </template>
    </div>

    <div
      v-if="overlay"
      v-bind="overlay.attrs"
      :style="overlay.style"
    >
      {{ overlay.element.label }}
    </div>
  </Sortable>
</template>
