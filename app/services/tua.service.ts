import type { TuaInputDataResponse } from '~/utils/api-types'

import { api } from './http-client'

const PATH = '/tua'

export const tuaService = {
  async generateData(file: File, sheet: string): Promise<TuaInputDataResponse[]> {
    const form = new FormData()
    form.append('archivo', file)
    form.append('hoja', sheet)

    return api.post<TuaInputDataResponse[]>(`${PATH}/generar-data`, form)
  },

  async cleanRolesTurno(file: File): Promise<Blob> {
    const form = new FormData()
    form.append('archivo', file)

    return api.post<Blob>(`${PATH}/limpiar-roles-turno`, form, { responseType: 'blob' })
  },
}
