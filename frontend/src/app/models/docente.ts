export class Docente {

  constructor(
    public _id: string,
    public nombre: string,
    public segundo_nombre: string,
    public apellido_paterno: string,
    public apellido_materno: string,
    public email: string,
    public materias_asignadas: number,
    public horas_planta: number,
    public horas_cubiertas: number,
    public horas_faltantes: number,
    public evaluacion_pares: boolean,
    public id_jefe_carrera: string,
    public __v: number){

  }
}
