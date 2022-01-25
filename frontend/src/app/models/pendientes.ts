export class Pendiente {

  constructor(
    public _id: string,
    public materia: string,
    public id_docente: string,
    public inicio: string,
    public fin: string,
    public message: string
  ){
  }
}
