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
    list-class="demo-list"
  >
    <template #item="{ element, attrs, handleAttrs }">
      <div
        v-bind="attrs"
        class="demo-item"
      >
        <button
          v-bind="handleAttrs"
          class="handle"
          type="button"
          aria-label="Drag item"
        >
          ::
        </button>
        <span>{{ element.label }}</span>
      </div>
    </template>
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
