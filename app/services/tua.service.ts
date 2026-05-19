import type { GenerarDataResponse, TuaInputDataResponse } from '~/utils/api-types'

import { api } from './http-client'

const PATH = '/tua'

export const tuaService = {
  async generateData(file: File, sheet: string): Promise<GenerarDataResponse> {
    const form = new FormData()
    form.append('archivo', file)
    form.append('hoja', sheet)

    return api.post<GenerarDataResponse>(`${PATH}/generar-data`, form)
  },

  async escribirDataTua(datos: TuaInputDataResponse[]): Promise<Blob> {
    return api.post<Blob>(`${PATH}/escribir-data-tua`, datos, { responseType: 'blob' })
  },

  async listarHojas(file: File): Promise<{ hojas: string[]; total: number }> {
    const form = new FormData()
    form.append('archivo', file)
    return api.post<{ hojas: string[]; total: number }>(`${PATH}/listar-hojas`, form)
  },

  async cleanRolesTurno(file: File): Promise<Blob> {
    const form = new FormData()
    form.append('archivo', file)

    return api.post<Blob>(`${PATH}/limpiar-roles-turno`, form, { responseType: 'blob' })
  },
}
