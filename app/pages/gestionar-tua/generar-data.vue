<template>
  <div>
    <AppPageHeader section="Gestionar TUA" title="Generar Data"
      description="Genera datos TUA desde un archivo Excel de input. Selecciona la hoja y procesa los registros." />

    <!-- Upload card -->
    <div class="rounded-xl border bg-card">
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
        <div ref="dropzoneRef" role="button"
          class="border-input hover:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
          @click="openFileDialog">
          <input ref="inputRef" hidden aria-label="Upload file" :disabled="Boolean(currentFile)" />

          <div class="flex flex-col items-center gap-3 text-center">
            <div class="bg-background flex size-12 items-center justify-center rounded-full border" aria-hidden="true">
              <Icon :name="currentFile ? 'lucide:file-spreadsheet' : 'lucide:upload'"
                class="text-muted-foreground size-5" />
            </div>
            <div>
              <p class="text-sm font-medium">
                {{ currentFile ? currentFile.file.name : 'Arrastra o haz clic para seleccionar' }}
              </p>
            </div>
          </div>
        </div>

        <p v-if="errors.length > 0" class="text-destructive mt-3 flex items-center gap-1.5 text-xs" role="alert">
          <Icon name="lucide:circle-alert" class="size-3.5 shrink-0" />
          {{ errors[0] }}
        </p>
      </div>
    </div>

    <!-- Sheet input + submit -->
    <div v-if="currentFile" class="mt-6">
      <div class="rounded-xl border bg-card">
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
              <label class="mb-1.5 block text-xs font-medium text-foreground/70">Nombre / Índice</label>
              <input v-model="sheet" placeholder="Ej: Hoja1, 1, 2..."
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-lg border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <UiButton :loading="loading" :disabled="!sheet.trim()" @click="generarData">
              <Icon name="lucide:play" class="size-4" />
              Generar
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <template v-if="records.length">
      <UiDivider label="Resultados" class="my-8" />

      <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border bg-card p-4">
          <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Total registros</p>
          <p class="mt-1 text-2xl font-bold">{{ records.length }}</p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Con turnos</p>
          <p class="mt-1 text-2xl font-bold text-primary">
            {{records.filter((r) => r.turnos.length > 0).length}}
          </p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Sin turnos</p>
          <p class="mt-1 text-2xl font-bold"
            :class="records.filter((r) => r.turnos.length === 0).length > 0 ? 'text-destructive' : ''">
            {{records.filter((r) => r.turnos.length === 0).length}}
          </p>
        </div>
        <div class="rounded-xl border bg-card p-4">
          <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Total turnos</p>
          <p class="mt-1 text-2xl font-bold">{{records.reduce((acc, r) => acc + r.turnos.length, 0)}}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="(rec, i) in records" :key="rec.codigo_unico" class="rounded-xl border bg-card">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
              <span
                class="text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                {{ i + 1 }}
              </span>
              <div>
                <p class="text-sm font-semibold">{{ rec.apellidos }}, {{ rec.nombres }}</p>
                <p class="text-muted-foreground text-xs">{{ rec.codigo_unico }} · {{ rec.profesion }}</p>
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

          <div v-if="rec.turnos.length" class="border-t border-border/50 px-6 py-4">
            <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Turnos</p>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="text-muted-foreground border-b border-border/25 uppercase tracking-wide">
                    <th class="px-3 py-2 font-medium">Día</th>
                    <th class="px-3 py-2 font-medium">Entrada</th>
                    <th class="px-3 py-2 font-medium">Salida</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in rec.turnos" :key="t.dia" class="border-b border-border/10 last:border-0">
                    <td class="px-3 py-1.5 font-medium">{{ t.dia }}</td>
                    <td class="px-3 py-1.5">{{ t.hora_entrada || '—' }}</td>
                    <td class="px-3 py-1.5">{{ t.hora_salida || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="border-t border-border/50 px-6 py-4">
            <p class="text-muted-foreground text-xs italic">Sin turnos asignados</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Error -->
    <div v-if="errorMsg"
      class="mt-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-sm"
      role="alert">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
        <Icon name="lucide:alert-circle" class="size-5 text-destructive" />
      </div>
      <p class="text-destructive flex-1">{{ errorMsg }}</p>
      <UiButton variant="ghost" size="icon-sm" @click="errorMsg = undefined">
        <Icon name="lucide:x" class="size-4" />
      </UiButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TuaInputDataResponse } from "~/utils/api-types";

const maxSize = 10 * 1024 * 1024;

const { files, errors, openFileDialog, inputRef, dropzoneRef } = useFileUpload({
  maxSize,
  accept: ".xlsx",
  multiple: false,
});

const currentFile = computed(() => files.value[0]);

const sheet = ref("");
const loading = ref(false);
const records = ref<TuaInputDataResponse[]>([]);
const errorMsg = ref<string>();

async function generarData() {
  if (!currentFile.value || !(currentFile.value.file instanceof File) || !sheet.value.trim()) return;

  loading.value = true;
  errorMsg.value = undefined;
  records.value = [];

  try {
    const form = new FormData();
    form.append("archivo", currentFile.value.file);
    form.append("hoja", sheet.value.trim());

    const res = await $fetch<TuaInputDataResponse[]>("/api/generar-data", {
      method: "POST",
      body: form,
    });

    records.value = res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    errorMsg.value = e?.data?.detail || e?.data?.message || e?.message || "Error al procesar el archivo";
  } finally {
    loading.value = false;
  }
}
</script>
