<script lang="ts" setup>
import { Motion } from 'motion-v'
import type { GenerarDataResponse, TuaInputDataResponse } from '~/utils/api-types'

const props = defineProps<{
  data: GenerarDataResponse | null
}>()

// const emit = defineEmits<{
//   reset: []
// }>()

const totalDays = 31

function ensureDays(turnos: TuaInputDataResponse['turnos']) {
  const map = new Map(turnos.map((t) => [t.dia, t]))
  return Array.from({ length: totalDays }, (_, i) => {
    const dia = i + 1
    return map.get(dia) ?? { dia, hora_entrada: null, hora_salida: null }
  })
}

const records = ref<TuaInputDataResponse[]>([])

watch(
  () => props.data?.datos,
  (datos) => {
    records.value = datos
      ? JSON.parse(JSON.stringify(datos)).map((r: TuaInputDataResponse) => ({
          ...r,
          turnos: ensureDays(r.turnos),
        }))
      : []
  },
  { immediate: true }
)
</script>

<template>
  <div>
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

    <div class="bg-card overflow-x-auto rounded-xl border [&>div]:max-h-120">
      <UiTable class="min-w-300">
        <UiTableHeader>
          <UiTableRow>
            <UiTableHead rowspan="2" class="w-10 text-center">#</UiTableHead>
            <UiTableHead rowspan="2">Empleado</UiTableHead>
            <UiTableHead rowspan="2" class="max-md:hidden">Documento</UiTableHead>
            <template v-for="d in totalDays" :key="d">
              <UiTableHead colspan="2" class="px-1 text-center text-[11px] font-semibold">
                Día {{ d }}
              </UiTableHead>
            </template>
          </UiTableRow>
          <UiTableRow>
            <template v-for="d in totalDays" :key="d">
              <UiTableHead class="px-0.5 text-center text-[10px] leading-tight font-medium"
                >Ingreso</UiTableHead
              >
              <UiTableHead class="px-0.5 text-center text-[10px] leading-tight font-medium"
                >Salida</UiTableHead
              >
            </template>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <UiTableRow v-for="(rec, i) in records" :key="rec.codigo_unico">
            <UiTableCell class="text-muted-foreground text-center text-xs">
              {{ i + 1 }}
            </UiTableCell>

            <UiTableCell>
              <p class="text-sm font-medium">{{ rec.apellidos }}, {{ rec.nombres }}</p>
              <p class="text-muted-foreground mt-0.5 truncate text-xs">{{ rec.codigo_unico }}</p>
            </UiTableCell>

            <UiTableCell class="max-md:hidden">
              <UiEditable v-model="rec.numero_documento">
                <UiEditableArea>
                  <UiEditablePreview
                    class="hover:bg-accent/50 -mx-0.5 cursor-pointer rounded px-0.5 text-sm transition-colors"
                  >
                    {{ rec.tipo_documento }} {{ rec.numero_documento }}
                  </UiEditablePreview>
                  <div class="flex items-center gap-1">
                    <UiEditableInput as-child>
                      <input
                        class="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 min-w-0 rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                      />
                    </UiEditableInput>
                    <UiEditableSubmit as-child>
                      <UiButton size="icon" class="size-8 shrink-0">
                        <Icon name="lucide:check" class="size-3.5" />
                      </UiButton>
                    </UiEditableSubmit>
                    <UiEditableCancel as-child>
                      <UiButton size="icon" variant="outline" class="size-8 shrink-0">
                        <Icon name="lucide:x" class="size-3.5" />
                      </UiButton>
                    </UiEditableCancel>
                  </div>
                </UiEditableArea>
              </UiEditable>
            </UiTableCell>

            <template v-for="t in rec.turnos" :key="t.dia">
              <UiTableCell class="p-0.5">
                <input
                  v-model="t.hora_entrada"
                  type="text"
                  class="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-6 w-18 rounded border px-0.5 text-[11px] shadow-xs outline-none focus-visible:ring-[3px]"
                />
              </UiTableCell>
              <UiTableCell class="p-0.5">
                <input
                  v-model="t.hora_salida"
                  type="text"
                  class="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-6 w-18 rounded border px-0.5 text-[11px] shadow-xs outline-none focus-visible:ring-[3px]"
                />
              </UiTableCell>
            </template>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>

    <div class="mt-8 flex justify-center">
      <UiButton variant="outline" @click="() => console.log({ records })">
        <Icon name="lucide:refresh-cw" class="size-4" />
        Nuevo archivo
      </UiButton>
    </div>
  </div>
</template>
