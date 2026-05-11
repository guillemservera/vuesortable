<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from 'vuesortable'

type Item = {
  id: string
  label: string
  description: string
}

const items = ref<Item[]>([
  {
    id: 'drafts',
    label: 'Drafts',
    description: 'Ideas that are not ready yet.',
  },
  {
    id: 'issues',
    label: 'Issues',
    description: 'Work that needs attention.',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    description: 'Incoming items to triage.',
  },
  {
    id: 'archive',
    label: 'Archive',
    description: 'Completed or inactive work.',
  },
])
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">
        Nuxt 4 SSR fixture
      </p>

      <h1>VueSortable Nuxt SSR fixture</h1>

      <p>
        This page renders VueSortable during SSR and enables pointer-driven sorting after hydration.
      </p>
    </section>

    <Sortable
      v-model="items"
      item-key="id"
      class="sortable"
      v-slot="{ entries, listAttrs, getItemAttrs, getHandleAttrs, getPlaceholderAttrs, overlay }"
    >
      <div
        v-bind="listAttrs"
        class="sortable-list"
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

          <article
            v-else
            v-bind="getItemAttrs(entry).attrs"
            class="sortable-item"
          >
            <button
              v-bind="getHandleAttrs(entry)"
              class="drag-handle"
              type="button"
              :aria-label="`Reorder ${entry.element.label}`"
            >
              ::
            </button>

            <div class="item-content">
              <h2>{{ entry.element.label }}</h2>
              <p>{{ entry.element.description }}</p>
            </div>
          </article>
        </template>
      </div>

      <article
        v-if="overlay"
        v-bind="overlay.attrs"
        :style="overlay.style"
        class="sortable-item"
      >
        <div class="item-content">
          <h2>{{ overlay.element.label }}</h2>
          <p>{{ overlay.element.description }}</p>
        </div>
      </article>
    </Sortable>
  </main>
</template>

<style scoped>
.page {
  display: grid;
  gap: 24px;
  margin: 0 auto;
  max-width: 760px;
  padding: 48px 20px;
}

.hero {
  display: grid;
  gap: 8px;
}

.eyebrow {
  color: #526077;
  font-size: 14px;
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
}

.hero h1 {
  color: #182033;
  font-size: 32px;
  line-height: 1.15;
  margin: 0;
}

.hero p {
  color: #526077;
  margin: 0;
}

.sortable {
  position: relative;
}

.sortable-list {
  display: grid;
  gap: 12px;
}

.sortable-item {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dde8;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  display: flex;
  gap: 14px;
  min-height: 72px;
  padding: 14px;
}

.drag-handle {
  background: #f4f6fa;
  border: 1px solid #d7dde8;
  border-radius: 8px;
  color: #526077;
  cursor: grab;
  font: inherit;
  height: 36px;
  width: 40px;
}

.item-content {
  display: grid;
  gap: 4px;
}

.item-content h2 {
  color: #182033;
  font-size: 16px;
  line-height: 1.2;
  margin: 0;
}

.item-content p {
  color: #526077;
  margin: 0;
}

@media (max-width: 640px) {
  .page {
    padding: 32px 16px;
  }
}
</style>
