<script lang="ts" setup>
import { normalizeClass } from 'vue'
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const styles = tv({
  base: 'w-full caption-bottom text-sm',
})
</script>

<template>
  <div data-slot="table-container" class="relative w-full overflow-x-auto">
    <table data-slot="table" :class="styles({ class: normalizeClass(props.class) || undefined })">
      <slot />
    </table>
  </div>
</template>
