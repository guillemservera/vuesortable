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
        >
          <button
            v-bind="getHandleAttrs(entry)"
            class="handle"
            type="button"
          >
            ::
          </button>
          {{ entry.element.label }}
        </div>
      </template>
    </div>

    <div
      v-if="overlay"
      v-bind="overlay.attrs"
      :style="overlay.style"
      class="overlay-card"
    >
      Moving {{ overlay.element.label }}
    </div>
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
