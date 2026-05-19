<script lang="ts" setup>
import { Motion } from 'motion-v'
import type { GenerarDataResponse } from '~/utils/api-types'

const props = defineProps<{
  data: GenerarDataResponse | null
}>()

const emit = defineEmits<{
  reset: []
}>()

const records = computed(() => props.data?.datos ?? [])
</script>

<template>
  <div>
    <!-- Stats grid -->
    <div v-if="data" class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-card rounded-xl border p-4">
        <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Total registros
        </p>
        <p class="mt-1 text-2xl font-bold">{{ data.total_registros }}</p>
      </div>
      <div class="bg-card rounded-xl border p-4">
        <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Con turnos</p>
        <p class="text-primary mt-1 text-2xl font-bold">
          {{ data.empleados_encontrados }}
        </p>
      </div>
      <div class="bg-card rounded-xl border p-4">
        <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Sin turnos</p>
        <p
          class="mt-1 text-2xl font-bold"
          :class="data.empleados_no_encontrados > 0 ? 'text-destructive' : ''"
        >
          {{ data.empleados_no_encontrados }}
        </p>
      </div>
      <div class="bg-card rounded-xl border p-4">
        <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Total turnos
        </p>
        <p class="mt-1 text-2xl font-bold">
          {{ records.reduce((acc, r) => acc + r.turnos.length, 0) }}
        </p>
      </div>
    </div>

    <!-- No encontrados warning -->
    <Motion
      v-if="data && data.nombres_no_encontrados?.length"
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      class="border-destructive/20 bg-destructive/5 mb-6 flex items-center gap-3 rounded-xl border px-6 py-4 text-sm"
      role="alert"
    >
      <div class="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon name="lucide:alert-triangle" class="text-destructive size-5" />
      </div>
      <div class="flex-1">
        <p class="text-destructive font-semibold">
          {{ data.nombres_no_encontrados.length }} empleado(s) no encontrados
        </p>
        <p class="text-destructive/80 mt-0.5">
          {{ data.nombres_no_encontrados.join(', ') }}
        </p>
      </div>
    </Motion>

    <!-- Records -->
    <div class="space-y-4">
      <div v-for="(rec, i) in records" :key="rec.codigo_unico" class="bg-card rounded-xl border">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <span
              class="text-muted-foreground bg-muted flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-medium"
            >
              {{ i + 1 }}
            </span>
            <div>
              <p class="text-sm font-semibold">{{ rec.apellidos }}, {{ rec.nombres }}</p>
              <p class="text-muted-foreground text-xs">
                {{ rec.codigo_unico }} · {{ rec.profesion }}
              </p>
            </div>
          </div>
          <span class="bg-primary/10 text-primary rounded-md px-2.5 py-0.5 text-xs font-medium">
            {{ rec.turnos.length }} turnos
          </span>
        </div>
        <UiDivider class="px-6" />
        <div class="grid gap-x-8 gap-y-2 px-6 py-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <span class="text-muted-foreground text-xs">Documento</span>
            <p class="font-medium">{{ rec.tipo_documento }} {{ rec.numero_documento }}</p>
          </div>
          <div>
            <span class="text-muted-foreground text-xs">Establecimiento</span>
            <p class="font-medium">{{ rec.nombre_establecimiento }}</p>
          </div>
          <div>
            <span class="text-muted-foreground text-xs">Red</span>
            <p class="font-medium">{{ rec.red }}</p>
          </div>
          <div>
            <span class="text-muted-foreground text-xs">Profesión</span>
            <p class="font-medium">{{ rec.profesion }}</p>
          </div>
          <div>
            <span class="text-muted-foreground text-xs">Colegiatura</span>
            <p class="font-medium">{{ rec.numero_colegiatura }}</p>
          </div>
          <div>
            <span class="text-muted-foreground text-xs">Especialidad</span>
            <p class="font-medium">{{ rec.especialidad }}</p>
          </div>
          <div>
            <span class="text-muted-foreground text-xs">Servicio</span>
            <p class="font-medium">{{ rec.servicio }}</p>
          </div>
        </div>

        <div v-if="rec.turnos.length" class="border-border/50 border-t px-6 py-4">
          <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Turnos
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-muted-foreground border-border/25 border-b tracking-wide uppercase">
                  <th class="px-3 py-2 font-medium">Día</th>
                  <th class="px-3 py-2 font-medium">Entrada</th>
                  <th class="px-3 py-2 font-medium">Salida</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="t in rec.turnos"
                  :key="t.dia"
                  class="border-border/10 border-b last:border-0"
                >
                  <td class="px-3 py-1.5 font-medium">{{ t.dia }}</td>
                  <td class="px-3 py-1.5">{{ t.hora_entrada || '—' }}</td>
                  <td class="px-3 py-1.5">{{ t.hora_salida || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="border-border/50 border-t px-6 py-4">
          <p class="text-muted-foreground text-xs italic">Sin turnos asignados</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-8 flex justify-center">
      <UiButton variant="outline" @click="emit('reset')">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Nuevo archivo
      </UiButton>
    </div>
  </div>
</template>
