const mongoose = require('mongoose');
const app = require('./app');
const fs = require('fs');
const https = require('https');
const port = 7910;

mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/docfollow', {
mongoose.connect('mongodb://cillanes18:c3s4r1ll4n3s@127.0.0.1:27017/cillanes18',{
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(() => {
        console.log("Conexion a la base de datos establecida con exito");
	    https.createServer({
            cert: fs.readFileSync('/home/cillanes18/Practica_Interna/Actual/backend/src/backend.crt'),
            key: fs.readFileSync('/home/cillanes18/Practica_Interna/Actual/backend/src/backend.key')
        }, app).listen(port, () =>{
            console.log(`Servidor corriendo correctamente en la url: localhost:${port}`);
        })
    })
    .catch(err => {
        console.log(err);
    });
