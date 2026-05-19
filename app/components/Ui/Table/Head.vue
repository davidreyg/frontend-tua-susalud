<script lang="ts" setup>
import { normalizeClass } from 'vue'
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const styles = tv({
  base: 'text-muted-foreground h-10 px-3 text-left align-middle text-xs font-medium tracking-wide uppercase [&:has([role=checkbox])]:pr-0',
})
</script>

<template>
  <th data-slot="table-head" :class="styles({ class: normalizeClass(props.class) || undefined })">
    <slot />
  </th>
</template>
