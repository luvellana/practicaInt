const MateriaController = require('../models/materia.model');
const Docente = require('../models/docente.model');
const utils = require('../utils');
const default_response = utils.default_response;
const response = utils.response;

function actualizarHoras(req, res, docenteId, materia, sumar, callback){
    if(!docenteId) return callback();
    Docente.findById(docenteId, response(req, res, (req, res, docente) => {
        let coef = sumar? 1 : -1;
        let nuevas_horas = docente.horas_cubiertas + (coef * materia.horas_planta);
        if(nuevas_horas > docente.horas_planta){
            return res.status(500).send({message: 'Las horas cubiertas no pueden sobrepasar las horas totales de planta'})
        }
        Docente.findByIdAndUpdate(docenteId,{
            materias_asignadas: docente.materias_asignadas + coef,
            horas_cubiertas: docente.horas_cubiertas + (coef * materia.horas_planta)
        },  {new: true}, response(req, res, (req, res, d) => {
            callback();
        }));
    }));
}

async function aniadirDocente(docentes){

    return Docente.create(docentes)
    
    
}

function aniadirMaterias(materiasExcel, errors, req, res){
    //console.log("Llamando a buscar todas las materias")
    MateriaController.find({codigo: { $in: Object.keys(materiasExcel) }},{_id:0}).exec(response(req, res, (req, res, materias) => {
        //console.log("Busque materias y tengo respuesta")
        let materiasBD = {};
        materias.forEach(materia => {
            if(materia.nombre != 'No valido'){
                materiasBD[materia.codigo] = materia
            }
        }
        )
        let materiasToInsert = []
        Object.values(materiasExcel).forEach(materia => {
            //let dataToAssing = (materia.codigo in materiasBD)? JSON.stringify(materiasBD[materia.codigo]) : {};
            let datos = ['silabo_subido', 'aula_revisada', 'examen_revisado', 'contrato_impreso', 'contrato_firmado',
                'planilla_lista', 'planilla_firmada', 'cheque_solicitado', 'cheque_recibido', 'cheque_entregado', 'horas_planta'];
            if (materia.codigo in materiasBD) {
                datos.forEach(dato => {
                    materia[dato] = materiasBD[materia.codigo][dato]
                });
            }
            materiasToInsert.push(materia);
        })
        let semestre = utils.getSemestre();
        //console.log("Llamando a borrar materias")
        MateriaController.deleteMany({
            $and: [
                { inicio: { $gte: semestre.start} },
                { fin: {$lte: semestre.end}},
                { excel: true}
            ]
        }, response(req, res, (req, res, eliminadas) => {
            //console.log("Llamando a añadir materias")
            MateriaController.create(materiasToInsert, response(req, res, (req, res, materiasCreadas) => {
                return res.status(200).send({Docentes_aniadidos: errors})
            }))
        }));


            }));
}

const controller = {

    createMateria: function (req, res) {
        let materia = new MateriaController(Object.assign(req.body));
        actualizarHoras(req, res, materia.id_docente, materia, true, () => {
            materia.save(default_response(req, res));
        });
    },

    createMateriasExcel: async function (req, res) {
        let cols = ['Materia', 'Docente', 'Aula', 'Fecha Inicio', 'Fecha Fin', 'Créditos', 'Creador', 'Código Materia', 'Email Docente'];
        let excelCols = req.body.excel[3];
        if(!cols.every(val => excelCols.indexOf(val) >= 0)){
            return res.status(500).send({message: 'El archivo excel no tiene el formato correcto'})
        }
        let nombreIndex = excelCols.indexOf('Materia');
        let docenteIndex = excelCols.indexOf('Docente');
        let inicioIndex = excelCols.indexOf('Fecha Inicio');
        let finIndex = excelCols.indexOf('Fecha Fin');
        let aulaIndex = excelCols.indexOf('Aula');
        let creditosIndex = excelCols.indexOf('Créditos');
        let creadorIndex = excelCols.indexOf('Creador');
        let codigoIndex = excelCols.indexOf('Código Materia');
        let emailIndex = excelCols.indexOf('Email Docente');

        let materias = req.body.excel.slice(5).map(materia => {
            if(materia.length < 1){
                return {
                    nombre: 'No valido'
                }
            }
            return  {
                nombre: (materia[nombreIndex]).trim(),
                id_docente: (materia[docenteIndex]).trim().replace(/\s/g,''),
                nombre_docente: (materia[docenteIndex]).trim(),
                inicio: materia[inicioIndex],
                fin: materia[finIndex],
                aula: materia[aulaIndex],
                horas_totales: materia[creditosIndex]*16,
                id_jefe_carrera: materia[creadorIndex],
                codigo: materia[codigoIndex],
                email_doc: materia[emailIndex],
                excel: true
            }
        });

        //console.log("Llamando a buscar todos los docentes");
        Docente.find({}).exec(response(req, res, async (req, res, docentes) => {
            let nombres = {};
            docentes.forEach(docente => {
                let nombre = docente.apellido_paterno.replace(/\s/g,'') + docente.apellido_materno.replace(/\s/g,'')  + docente.nombre.replace(/\s/g,'');
                if(docente.segundo_nombre) nombre += docente.segundo_nombre.replace(/\s/g,'');
                nombres[nombre] = docente.id;
            });
            let materiasExcel = {};
            let errors = [];
            let docentesToAdd = [];
            let IdsDocentes = [];
            let materiasDocentes = {};
            let i = 0;
            materias.forEach(async (materia, index) => {
                if(materia.nombre != 'No valido'){
                    i++;
                    let nombreDocente = materia.id_docente;
                    if(nombreDocente in nombres){
                        materia['id_docente'] = nombres[materia.id_docente];
                        //console.log("Llamando a buscar docente por id y actulizarlo")
                        Docente.findByIdAndUpdate(
                            materia.id_docente
                        ,{
                            $inc: {materias_asignadas: 1}
                        }, function(err, num) {
                            //console.log("Busque a docente ", num, " y recibi respuesta");
                        });
                    }else{
                        if(materia.nombre_docente in IdsDocentes){
                            materiasDocentes[materia.codigo]=materia.nombre_docente.replace(/\s/g,'')
                            docentesToAdd.forEach(d => {
                                let nom = d.apellido_paterno.replace(/\s/g,'') + d.apellido_materno.replace(/\s/g,'')  + d.nombre.replace(/\s/g,'');
                                if (nom === materia.nombre_docente.replace(/\s/g,'')){
                                    d.materias_asignadas = d.materias_asignadas + 1
                                }
                            } )
                        }else{
                            let nomDoc = materia.nombre_docente.split(' ');
                            let nom = "";
                            nomDoc.slice(2).forEach( a => {
                                nom = nom + " " + a;
                            })
                            
                            docentesToAdd.push({
                                nombre: nom.trim().replace(/\s/g,''),
                                apellido_paterno: nomDoc[0],
                                apellido_materno: nomDoc[1],
                                email: materia.email_doc,
                                materias_asignadas: 1,
                                horas_planta: 0,
                                horas_cubiertas: 0,
                                evaluacion_pares: false,
                                id_jefe_carrera: materia.id_jefe_carrera
                            });
                            
                            
                            materiasDocentes[materia.codigo]=materia.nombre_docente.replace(/\s/g,'')

                            IdsDocentes[materia.nombre_docente] = 'existe'
                            errors.push(`${materia.nombre_docente}`);
                        }

                        materia['id_docente'] = '';
                         //No tengo la más mínima idea de cómo solucionar esto
                    }
                    materiasExcel[materia.codigo] = materia;
                }
            });

            //Aquí estaba lo que está dentro de la funcion aniadirMaterias(matExc, err, req, res), porsia
            if(docentesToAdd.length > 0){
                //console.log("Llamando a crear docente")
                let doc = await aniadirDocente(docentesToAdd)
                    
                for(var a in doc){
                    let nombre = doc[a].apellido_paterno.replace(/\s/g,'') + doc[a].apellido_materno.replace(/\s/g,'')  + doc[a].nombre.replace(/\s/g,'');
                    for(var b in materiasDocentes){
                        if(materiasDocentes[b]===nombre){
                            materiasExcel[b].id_docente = doc[a].id
                        }
                    }
                }
                    
                aniadirMaterias(materiasExcel, errors, req, res)
                
            } else {
                aniadirMaterias(materiasExcel, errors, req, res)
            }
            
        }));
    },

    getMateria: function(req, res){
        let materiaID = req.params.id;
        MateriaController.findById(materiaID, default_response(req, res));
    },

    getMaterias : function (req, res) {
        MateriaController.find({}).exec(default_response(req, res));
    },

    updateMateria: function(req, res){
        let materiaId = req.params.id;
        let update = req.body;

        MateriaController.findById(materiaId, response(req, res, (req, res, materia)=> {
            actualizarHoras(req, res, update.id_docente, update, true, () => {
                actualizarHoras(req, res, req.params.docente_antiguo_id, materia, false, () => {
                    MateriaController.findByIdAndUpdate(materiaId, update, {new: true}, default_response(req, res));
                });
            });
        }));

    },

    deleteMateria: function(req, res){
        let materiaId = req.params.id;
        MateriaController.findById(materiaId, response(req, res, (req, res, materia)=> {
            actualizarHoras(req, res, req.params.docente_antiguo_id, materia, false, () => {
                MateriaController.findByIdAndDelete(materiaId, default_response(req, res));
            });
        }));
    },

    getMateriasJefeCarrera: function (req, res){
        let jefeCarreraId = req.params.id_jefe_carrera;
        MateriaController.find({id_jefe_carrera: jefeCarreraId}).exec(default_response(req, res));
    },

    getMateriasSemestre: function(req, res){
        let anio = req.params.anio;
        let semestre = req.params.semestre;
        let s = new Date(anio + (semestre === '1'? '-02-01' : '-08-01'));
        let e = new Date((semestre === '1'? anio + '-07-31' : (parseInt(anio) + 1) + '-01-31'));

        MateriaController.find({
            $and: [
                { inicio: { $gte: s} },
                { fin: {$lte: e}}
            ]
        }).exec(default_response(req, res));
    },

    getMateriasSemestreJefeCarrera: function(req, res){
        let jefeCarreraId = req.params.id_jefe_carrera;
        let anio = req.params.anio;
        let semestre = req.params.semestre;
        let s = new Date(anio + (semestre === '1'? '-02-01' : '-08-01'));
        let e = new Date((semestre === '1'? anio + '-07-31' : (parseInt(anio) + 1) + '-01-31'));
        MateriaController.find({
            $and: [
                { inicio: { $gte: s} },
                { fin: {$lte: e}},
                { id_jefe_carrera: jefeCarreraId }
            ]
        }).exec(default_response(req, res));
    }
};

module.exports = controller;
