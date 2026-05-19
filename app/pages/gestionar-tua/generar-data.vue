<script lang="ts" setup>
import type { MotionProps } from 'motion-v'
import { AnimatePresence, LayoutGroup } from 'motion-v'
import type { TuaInputDataResponse } from '~/utils/api-types'
import { tuaService } from '~/services/tua.service'

const maxSize = 10 * 1024 * 1024

const { files, errors, openFileDialog, removeFile, clearFiles, inputRef, dropzoneRef } =
  useFileUpload({
    maxSize,
    accept: '.xlsx',
    multiple: false,
  })

const currentFile = computed(() => files.value[0])

const sheet = ref('')
const loading = ref(false)
const records = ref<TuaInputDataResponse[]>([])
const errorMsg = ref<string>()

async function generarData() {
  if (!currentFile.value || !(currentFile.value.file instanceof File) || !sheet.value.trim()) return

  loading.value = true
  errorMsg.value = undefined
  records.value = []

  try {
    records.value = (
      await tuaService.generateData(currentFile.value.file, sheet.value.trim())
    ).datos
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al procesar el archivo'
  } finally {
    loading.value = false
  }
}

function resetAll() {
  sheet.value = ''
  records.value = []
  errorMsg.value = undefined
  clearFiles()
}

const sequenceContainer: MotionProps['variants'] = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.4, when: 'beforeChildren' },
  },
}

const dropAreaContainer: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { staggerChildren: 0.1, when: 'beforeChildren' },
  },
}

const dropAreaItem: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 },
  },
}

const listItem: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
}
</script>

<template>
  <div>
    <AppPageHeader
      section="Gestionar TUA"
      title="Generar Data"
      description="Genera datos TUA desde un archivo Excel de input. Selecciona la hoja y procesa los registros."
    />

    <div class="bg-card rounded-xl border">
      <div class="p-6 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <Icon name="lucide:file-spreadsheet" class="text-primary size-4" />
          </div>
          <div>
            <h2 class="text-sm font-semibold">Archivo Excel</h2>
            <p class="text-muted-foreground text-xs">Formato .xlsx</p>
          </div>
        </div>
      </div>
      <UiDivider class="px-6" />
      <div class="p-6 pt-5">
        <LayoutGroup>
          <Motion
            :variants="sequenceContainer"
            initial="hidden"
            animate="visible"
            exit="exit"
            layout="position"
            class="mx-auto flex max-w-md flex-col gap-2"
          >
            <!-- Drop area -->
            <Motion as-child :variants="dropAreaContainer">
              <div
                ref="dropzoneRef"
                role="button"
                class="border-input hover:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
                @click="openFileDialog"
              >
                <input ref="inputRef" hidden aria-label="Upload file" />

                <div class="flex flex-col items-center justify-center text-center">
                  <Motion
                    :variants="dropAreaItem"
                    class="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <Icon
                      v-if="loading"
                      name="lucide:loader-circle"
                      class="size-4 animate-spin opacity-60"
                    />
                    <Icon v-else name="lucide:upload" class="size-4 opacity-60" />
                  </Motion>
                  <Motion as="p" :variants="dropAreaItem" class="mb-1 text-sm font-medium">
                    {{ loading ? 'Procesando…' : 'Subir archivo' }}
                  </Motion>
                  <Motion as="p" :variants="dropAreaItem" class="text-muted-foreground text-xs">
                    Arrastra o haz clic (máx. {{ formatBytes(maxSize) }})
                  </Motion>
                  <AnimatePresence>
                    <Motion
                      v-if="currentFile && !loading"
                      key="message"
                      layout="position"
                      :variants="dropAreaItem"
                      as="p"
                      class="mt-1 text-center text-xs text-sky-500"
                    >
                      Elimina el archivo actual para subir otro.
                    </Motion>
                  </AnimatePresence>
                </div>
              </div>
            </Motion>

            <!-- Validation errors -->
            <Motion
              v-if="errors.length > 0"
              key="errors"
              layout="position"
              :variants="listItem"
              initial="hidden"
              animate="visible"
              class="text-destructive flex items-center gap-1 text-xs"
              role="alert"
            >
              <Icon name="lucide:circle-alert" class="size-3 shrink-0" />
              <span>{{ errors[0] }}</span>
            </Motion>

            <!-- Upload error message -->
            <Motion
              v-if="errorMsg"
              key="upload-error"
              layout="position"
              :variants="listItem"
              initial="hidden"
              animate="visible"
              class="text-destructive flex items-center gap-1 text-xs"
              role="alert"
            >
              <Icon name="lucide:circle-alert" class="size-3 shrink-0" />
              <span>{{ errorMsg }}</span>
            </Motion>

            <!-- File list -->
            <Motion
              v-if="currentFile"
              key="file-list"
              layout="position"
              :variants="listItem"
              initial="hidden"
              animate="visible"
              class="space-y-2"
            >
              <div class="flex items-center justify-between gap-2 rounded-lg border px-4 py-2">
                <div class="flex items-center gap-3 overflow-hidden">
                  <Icon
                    name="lucide:file-spreadsheet"
                    class="size-4 shrink-0 opacity-60"
                    aria-hidden="true"
                  />
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-medium">
                      {{ currentFile.file.name }}
                    </p>
                  </div>
                </div>

                <UiButton
                  size="icon"
                  variant="ghost"
                  class="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                  aria-label="Remove file"
                  @click="removeFile(currentFile.id)"
                >
                  <Icon name="lucide:x" class="size-4" aria-hidden="true" />
                </UiButton>
              </div>
            </Motion>
          </Motion>
        </LayoutGroup>
      </div>
    </div>

    <!-- Sheet input + submit -->
    <AnimatePresence>
      <Motion
        v-if="currentFile"
        key="sheet-section"
        :variants="listItem"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div class="mt-6">
          <div class="bg-card rounded-xl border">
            <div class="p-6 pb-4">
              <div class="flex items-center gap-2.5">
                <div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                  <Icon name="lucide:sheet" class="text-primary size-4" />
                </div>
                <div>
                  <h2 class="text-sm font-semibold">Hoja de cálculo</h2>
                  <p class="text-muted-foreground text-xs">Nombre o índice 1-based de la hoja</p>
                </div>
              </div>
            </div>
            <UiDivider class="px-6" />
            <div class="p-6 pt-5">
              <div class="flex items-end gap-3">
                <div class="flex-1">
                  <label class="text-foreground/70 mb-1.5 block text-xs font-medium"
                    >Nombre / Índice</label
                  >
                  <input
                    v-model="sheet"
                    placeholder="Ej: Hoja1, 1, 2..."
                    class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-lg border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <UiButton :loading="loading" :disabled="!sheet.trim()" @click="generarData">
                  <Icon name="lucide:play" class="size-4" />
                  Generar
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <!-- Results -->
    <AnimatePresence>
      <Motion
        v-if="records.length"
        key="results-section"
        :variants="listItem"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div class="flex items-center justify-between">
          <UiDivider label="Resultados" class="my-8 flex-1" />
          <UiButton variant="outline" size="sm" class="mb-8 ml-4 shrink-0" @click="resetAll">
            <Icon name="lucide:refresh-cw" class="size-4" />
            Nuevo archivo
          </UiButton>
        </div>

        <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="bg-card rounded-xl border p-4">
            <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Total registros
            </p>
            <p class="mt-1 text-2xl font-bold">{{ records.length }}</p>
          </div>
          <div class="bg-card rounded-xl border p-4">
            <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Con turnos
            </p>
            <p class="text-primary mt-1 text-2xl font-bold">
              {{ records.filter((r) => r.turnos.length > 0).length }}
            </p>
          </div>
          <div class="bg-card rounded-xl border p-4">
            <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Sin turnos
            </p>
            <p
              class="mt-1 text-2xl font-bold"
              :class="
                records.filter((r) => r.turnos.length === 0).length > 0 ? 'text-destructive' : ''
              "
            >
              {{ records.filter((r) => r.turnos.length === 0).length }}
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

        <div class="space-y-4">
          <div
            v-for="(rec, i) in records"
            :key="rec.codigo_unico"
            class="bg-card rounded-xl border"
          >
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
                    <tr
                      class="text-muted-foreground border-border/25 border-b tracking-wide uppercase"
                    >
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
      </Motion>
    </AnimatePresence>

    <!-- Error -->
    <AnimatePresence>
      <Motion
        v-if="errorMsg && !records.length"
        key="error-section"
        :variants="listItem"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          class="border-destructive/20 bg-destructive/5 mt-6 flex items-center gap-3 rounded-xl border px-6 py-4 text-sm"
          role="alert"
        >
          <div
            class="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-lg"
          >
            <Icon name="lucide:alert-circle" class="text-destructive size-5" />
          </div>
          <p class="text-destructive flex-1">{{ errorMsg }}</p>
          <UiButton variant="ghost" size="icon-sm" @click="errorMsg = undefined">
            <Icon name="lucide:x" class="size-4" />
          </UiButton>
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>
