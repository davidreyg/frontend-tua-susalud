<script lang="ts" setup>
import { normalizeClass } from 'vue'
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const styles = tv({
  base: 'border-border/50 data-[state=selected]:bg-muted/50 border-b transition-colors',
})
</script>

<template>
  <tr data-slot="table-row" :class="styles({ class: normalizeClass(props.class) || undefined })">
    <slot />
  </tr>
</template>
