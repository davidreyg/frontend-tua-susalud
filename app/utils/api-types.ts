export interface TurnoItem {
  dia: number
  hora_entrada: string | null
  hora_salida: string | null
}

export interface GenerarDataResponse {
  datos: TuaInputDataResponse[]
  total_registros: number
  empleados_encontrados: number
  empleados_no_encontrados: number
  nombres_no_encontrados: string[]
}

export interface TuaInputDataResponse {
  codigo_unico: string
  nombre_establecimiento: string
  red: string
  tipo_documento: string
  numero_documento: string
  profesion: string
  numero_colegiatura: string
  apellidos: string
  nombres: string
  especialidad: string
  servicio: string
  turnos: TurnoItem[]
}

export interface ApiErrorResponse {
  data: unknown
  status: string
  message: string
  error_code: string
  description: string
}

export interface UploadResult {
  filename: string
  size: number
  url?: string
}
