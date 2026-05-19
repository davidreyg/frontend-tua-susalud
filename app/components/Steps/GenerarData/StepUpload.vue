<script lang="ts" setup>
import type { MotionProps } from 'motion-v'
import { AnimatePresence, LayoutGroup } from 'motion-v'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'

const props = defineProps<{
  loading: boolean
  error?: string
  initialSheet?: string
}>()

const emit = defineEmits<{
  generate: [file: File, sheet: string]
}>()

const maxSize = 10 * 1024 * 1024

const { files, errors, openFileDialog, removeFile, inputRef, dropzoneRef } = useFileUpload({
  maxSize,
  accept: '.xlsx',
  multiple: false,
})

const currentFile = computed(() => files.value[0])

const { defineField, handleSubmit, setFieldError } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      sheet: yup
        .string()
        .required('El nombre o índice de la hoja es obligatorio')
        .min(1, 'Debe ingresar al menos un carácter'),
    })
  ),
  initialValues: { sheet: props.initialSheet ?? '' },
})

const [sheet, sheetAttrs] = defineField('sheet', {
  validateOnInput: true,
  validateOnBlur: true,
})

const onSubmit = handleSubmit((values) => {
  if (!currentFile.value || !(currentFile.value.file instanceof File)) return
  emit('generate', currentFile.value.file, values.sheet)
})

watch(
  () => props.error,
  (err) => {
    if (err) setFieldError('sheet', err)
  }
)

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
                    <Icon name="lucide:upload" class="size-4 opacity-60" />
                  </Motion>
                  <Motion as="p" :variants="dropAreaItem" class="mb-1 text-sm font-medium">
                    Subir archivo
                  </Motion>
                  <Motion as="p" :variants="dropAreaItem" class="text-muted-foreground text-xs">
                    Arrastra o haz clic (máx. {{ formatBytes(maxSize) }})
                  </Motion>
                  <AnimatePresence>
                    <Motion
                      v-if="currentFile"
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
      <form class="p-6 pt-5" @submit="onSubmit">
        <div class="flex flex-col gap-4">
          <UiVeeInput
            v-model="sheet"
            v-bind="sheetAttrs"
            name="sheet"
            label="Nombre / Índice"
            placeholder="Ej: Hoja1, 1, 2..."
            :disabled="loading"
          />
          <UiButton
            type="submit"
            :loading="loading"
            :disabled="!currentFile || loading"
            class="w-full"
          >
            <Icon name="lucide:play" class="size-4" />
            Generar
          </UiButton>
        </div>
      </form>
    </div>
  </div>
</template>
