<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

const items = ref([
  { id: 'drafts', label: 'Drafts' },
  { id: 'issues', label: 'Issues' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'archive', label: 'Archive' },
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
      class="demo-list"
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
          class="demo-item"
        >
          <button
            v-bind="getHandleAttrs(entry)"
            class="handle"
            type="button"
            :aria-label="`Drag ${entry.element.label}`"
          >
            ::
          </button>
          <span>{{ entry.element.label }}</span>
        </div>
      </template>
    </div>

    <div
      v-if="overlay"
      v-bind="overlay.attrs"
      :style="overlay.style"
      class="demo-item"
    >
      {{ overlay.element.label }}
    </div>
  </Sortable>
</template>

<style scoped>
.demo-list {
  display: grid;
  gap: 10px;
}

.demo-item {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  color: #182033;
  display: flex;
  gap: 12px;
  min-height: 48px;
  padding: 10px 12px;
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
