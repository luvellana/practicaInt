export class DocentePost {
  constructor(
    public nombre: string,
    public segundo_nombre: string,
    public apellido_paterno: string,
    public apellido_materno: string,
    public materias_asignadas: number,
    public horas_planta: number,
    public horas_cubiertas: number,
    public horas_faltantes: number,
    public evaluacion_pares: boolean
  ){

  }
}
