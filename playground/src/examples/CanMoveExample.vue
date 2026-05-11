<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'
import type { SortableCanMovePayload } from 'vuesortable'

type Item = {
  id: string
  label: string
  locked?: boolean
}

const items = ref<Item[]>([
  { id: 'triage', label: 'Triage' },
  { id: 'legal', label: 'Legal review', locked: true },
  { id: 'ship', label: 'Ship' },
])
const message = ref('Try moving the locked item.')

function canMove(payload: SortableCanMovePayload<Item>) {
  const allowed = !payload.item.locked
  message.value = allowed ? 'Move accepted.' : `${payload.item.label} is locked.`
  return allowed
}
</script>

<template>
  <div class="example">
    <Sortable
      v-model="items"
      item-key="id"
      :can-move="canMove"
      v-slot="{ entries, listAttrs, getItemAttrs, getHandleAttrs, getPlaceholderAttrs, overlay }"
    >
      <div
        v-bind="listAttrs"
        class="stack"
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
            class="row"
            :data-locked="entry.element.locked ? 'true' : 'false'"
          >
            <button
              v-bind="getHandleAttrs(entry)"
              class="handle"
              type="button"
            >
              Drag
            </button>
            <span>{{ entry.element.label }}</span>
            <small v-if="entry.element.locked">Locked</small>
          </div>
        </template>
      </div>

      <div
        v-if="overlay"
        v-bind="overlay.attrs"
        :style="overlay.style"
        class="row"
        :data-locked="overlay.element.locked ? 'true' : 'false'"
      >
        {{ overlay.element.label }}
      </div>
    </Sortable>

    <p class="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.example,
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
  gap: 10px;
  min-height: 52px;
  padding: 10px 12px;
}

.row[data-locked="true"] {
  border-style: dashed;
}

.handle {
  background: #182033;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  font: inherit;
  padding: 6px 10px;
}

.message {
  color: #526077;
  margin: 0;
}
</style>
