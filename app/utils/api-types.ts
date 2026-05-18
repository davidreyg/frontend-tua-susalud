export interface TurnoItem {
  dia: number;
  hora_entrada: string | null;
  hora_salida: string | null;
}

export interface TuaInputDataResponse {
  codigo_unico: string;
  nombre_establecimiento: string;
  red: string;
  tipo_documento: string;
  numero_documento: string;
  profesion: string;
  numero_colegiatura: string;
  apellidos: string;
  nombres: string;
  especialidad: string;
  servicio: string;
  turnos: TurnoItem[];
}
