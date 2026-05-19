<script lang="ts" setup>
import type { MotionProps } from 'motion-v'
import { AnimatePresence } from 'motion-v'
import type { GenerarDataResponse } from '~/utils/api-types'
import { tuaService } from '~/services/tua.service'

const maxSize = 10 * 1024 * 1024

const { files, errors, openFileDialog, removeFile, clearFiles, inputRef, dropzoneRef } =
  useFileUpload({
    maxSize,
    accept: '.xlsx',
    multiple: false,
  })

const currentFile = computed(() => files.value[0])

const loading = ref(false)
const response = ref<GenerarDataResponse | null>(null)
const errorMsg = ref<string>()
const sheet = ref('')

const isNamesOpen = ref(true)

const sheets = ref<string[]>([])
const sheetsLoading = ref(false)
const sheetsError = ref(false)

const downloadUrl = ref<string>()
const downloadName = ref<string>()
const downloading = ref(false)

onUnmounted(() => {
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
})

watch(currentFile, async (file) => {
  sheets.value = []
  sheetsError.value = false
  sheet.value = ''
  if (!file || !(file.file instanceof File)) return
  sheetsLoading.value = true
  try {
    const res = await tuaService.listarHojas(file.file)
    sheets.value = res.hojas
  } catch {
    sheetsError.value = true
  } finally {
    sheetsLoading.value = false
  }
})

watch(
  () => response.value?.nombres_no_encontrados,
  (names) => {
    if (names) {
      isNamesOpen.value = names.length <= 5
    }
  },
  { immediate: true }
)

async function handleGenerate() {
  if (!currentFile.value || !(currentFile.value.file instanceof File)) {
    errorMsg.value = 'Debes seleccionar un archivo Excel'
    return
  }
  if (!sheet.value.trim()) {
    errorMsg.value = 'El nombre o índice de la hoja es obligatorio'
    return
  }

  loading.value = true
  errorMsg.value = undefined

  try {
    response.value = await tuaService.generateData(currentFile.value.file, sheet.value)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al procesar el archivo'
  } finally {
    loading.value = false
  }
}

function resetAll() {
  response.value = null
  errorMsg.value = undefined
  sheet.value = ''
  sheets.value = []
  sheetsError.value = false
  clearFiles()
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value)
    downloadUrl.value = undefined
  }
}

async function handleDownloadTua() {
  if (!response.value?.datos.length) return
  downloading.value = true
  errorMsg.value = undefined
  try {
    const blob = await tuaService.escribirDataTua(response.value.datos)
    if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
    const fecha = new Date().toISOString().slice(0, 10)
    downloadName.value = `TUA_SUSALUD_${fecha}.xlsx`
    downloadUrl.value = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl.value
    a.download = downloadName.value
    a.click()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al generar el archivo TUA'
  } finally {
    downloading.value = false
  }
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
      description="Genera datos TUA desde un archivo Excel. Selecciona el archivo, indica la hoja y procesa los registros."
    />

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Upload card -->
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
          <div class="mx-auto flex max-w-md flex-col gap-2">
            <!-- Drop area -->
            <div
              ref="dropzoneRef"
              role="button"
              class="border-input hover:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
              @click="openFileDialog"
            >
              <input ref="inputRef" hidden aria-label="Upload file" />

              <div class="flex flex-col items-center justify-center text-center">
                <div
                  class="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true"
                >
                  <Icon name="lucide:upload" class="size-4 opacity-60" />
                </div>
                <p class="mb-1 text-sm font-medium">Subir archivo</p>
                <p class="text-muted-foreground text-xs">
                  Arrastra o haz clic (máx. {{ formatBytes(maxSize) }})
                </p>
                <p v-if="currentFile" class="mt-1 text-center text-xs text-sky-500">
                  Elimina el archivo actual para subir otro.
                </p>
              </div>
            </div>

            <!-- Validation errors -->
            <p
              v-if="errors.length > 0"
              class="text-destructive flex items-center gap-1 text-xs"
              role="alert"
            >
              <Icon name="lucide:circle-alert" class="size-3 shrink-0" />
              <span>{{ errors[0] }}</span>
            </p>

            <!-- File list -->
            <div v-if="currentFile" class="space-y-2">
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
            </div>
          </div>
        </div>
      </div>

      <!-- Sheet input + submit -->
      <div class="bg-card rounded-xl border">
        <div class="p-6 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <Icon name="lucide:sheet" class="text-primary size-4" />
            </div>
            <div>
              <h2 class="text-sm font-semibold">Hoja de cálculo</h2>
              <p class="text-muted-foreground text-xs">Selecciona la hoja del archivo</p>
            </div>
          </div>
        </div>
        <UiDivider class="px-6" />
        <form class="p-6 pt-5" @submit.prevent="handleGenerate">
          <div class="flex flex-col gap-4">
            <div>
              <UiLabel for="sheet">Hoja</UiLabel>
              <UiSelect v-if="sheets.length > 0" v-model="sheet">
                <UiSelectTrigger
                  :placeholder="sheetsLoading ? 'Cargando hojas...' : 'Selecciona una hoja'"
                  :disabled="loading || sheetsLoading"
                />
                <UiSelectContent>
                  <UiSelectGroup>
                    <UiSelectItem v-for="h in sheets" :key="h" :value="h" :text="h" />
                  </UiSelectGroup>
                </UiSelectContent>
              </UiSelect>
              <UiInput
                v-else
                id="sheet"
                v-model="sheet"
                name="sheet"
                placeholder="Ej: Hoja1, 1, 2..."
                :disabled="loading"
              />
              <p v-if="sheetsLoading" class="text-muted-foreground mt-1 text-xs">
                Obteniendo hojas...
              </p>
              <p v-else-if="sheetsError" class="mt-1 text-xs text-amber-600">
                No se pudieron cargar las hojas. Ingresa el nombre o índice manualmente.
              </p>
            </div>
            <UiButton
              type="submit"
              :loading="loading"
              :disabled="!currentFile || loading"
              class="w-full"
            >
              <Icon name="lucide:play" class="size-4" />
              Generar
            </UiButton>
            <UiButton variant="destructive" class="gap-2" @click="resetAll">
              <Icon name="lucide:refresh-cw" class="size-4" />
              Nuevo archivo
            </UiButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="errorMsg"
      class="border-destructive/20 bg-destructive/5 mt-6 flex items-center gap-3 rounded-xl border px-6 py-4 text-sm"
      role="alert"
    >
      <div class="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon name="lucide:alert-circle" class="text-destructive size-5" />
      </div>
      <p class="text-destructive flex-1">{{ errorMsg }}</p>
    </div>

    <!-- Result section -->
    <AnimatePresence>
      <Motion
        v-if="response"
        key="result-section"
        :variants="listItem"
        initial="hidden"
        animate="visible"
        exit="exit"
        class="mt-10 space-y-8"
      >
        <!-- Summary stats -->
        <div class="grid gap-4 sm:grid-cols-3" role="region" aria-label="Resumen de procesamiento">
          <div
            class="bg-card hover:border-primary/30 flex items-center gap-4 rounded-xl border p-5 transition-colors"
          >
            <div class="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-xl">
              <Icon name="lucide:database" class="text-primary size-5" aria-hidden="true" />
            </div>
            <div>
              <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Total registros
              </p>
              <p class="mt-0.5 text-2xl font-bold tracking-tight tabular-nums">
                {{ response.total_registros }}
              </p>
            </div>
          </div>
          <div
            class="bg-card flex items-center gap-4 rounded-xl border p-5 transition-colors hover:border-emerald-300"
          >
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style="
                background-color: color-mix(in srgb, var(--color-emerald-500) 10%, transparent);
              "
            >
              <Icon
                name="lucide:user-check"
                class="size-5"
                style="color: var(--color-emerald-600)"
                aria-hidden="true"
              />
            </div>
            <div>
              <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Encontrados
              </p>
              <p
                class="mt-0.5 text-2xl font-bold tracking-tight tabular-nums"
                style="color: var(--color-emerald-600)"
              >
                {{ response.empleados_encontrados }}
              </p>
            </div>
          </div>
          <div
            class="bg-card flex items-center gap-4 rounded-xl border p-5 transition-colors hover:border-amber-300"
          >
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style="background-color: color-mix(in srgb, var(--color-amber-500) 10%, transparent)"
            >
              <Icon
                name="lucide:user-x"
                class="size-5"
                style="color: var(--color-amber-600)"
                aria-hidden="true"
              />
            </div>
            <div>
              <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                No encontrados
              </p>
              <p
                class="mt-0.5 text-2xl font-bold tracking-tight tabular-nums"
                style="color: var(--color-amber-600)"
              >
                {{ response.empleados_no_encontrados }}
              </p>
            </div>
          </div>
        </div>

        <!-- Unmatched names alert -->
        <UiCollapsible v-if="response.nombres_no_encontrados?.length" v-model="isNamesOpen">
          <div role="alert" aria-live="polite">
            <div class="border-destructive/20 bg-destructive/5 rounded-xl border p-4 sm:p-5">
              <div class="flex items-start gap-3">
                <div
                  class="bg-destructive/10 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg"
                >
                  <Icon name="lucide:alert-triangle" class="text-destructive size-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p class="text-destructive text-sm font-semibold sm:text-base">
                      {{ response.nombres_no_encontrados.length }} empleado(s) no encontrado(s) en
                      la base de datos
                    </p>
                    <span
                      class="bg-destructive/15 text-destructive inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-none font-bold"
                    >
                      {{ response.nombres_no_encontrados.length }}
                    </span>
                  </div>
                  <UiCollapsibleContent class="mt-3">
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="nombre in response.nombres_no_encontrados"
                        :key="nombre"
                        class="bg-destructive/10 text-destructive/90 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs leading-tight font-medium"
                      >
                        {{ nombre }}
                      </span>
                    </div>
                  </UiCollapsibleContent>
                  <UiCollapsibleTrigger as-child>
                    <button
                      class="text-destructive/70 hover:text-destructive mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <Icon
                        :name="isNamesOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                        class="size-3.5"
                      />
                      {{
                        isNamesOpen
                          ? 'Ocultar nombres'
                          : `Mostrar ${response.nombres_no_encontrados.length} nombres`
                      }}
                    </button>
                  </UiCollapsibleTrigger>
                </div>
              </div>
            </div>
          </div>
        </UiCollapsible>

        <!-- Download button -->
        <div class="flex justify-center gap-3 pt-2">
          <UiButton
            variant="default"
            class="gap-2"
            :loading="downloading"
            :disabled="!response?.datos.length || downloading"
            @click="handleDownloadTua"
          >
            <Icon name="lucide:file-down" class="size-4" />
            Generar TUA
          </UiButton>
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>
