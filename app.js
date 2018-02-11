// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospital_db', ( error, response ) => {

	if ( error )
	{
		throw error;
	}

	console.log("Base de datos: \x1b[32m%s\x1b[0m", "online");

});

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar express
app.listen( 3000, () => {

	console.log("Express server corriendo puerto 3000: \x1b[32m%s\x1b[0m", "online");

});


/*
Se lanza:

> node app

// si tenemos instalado el nodemon, habremos creado un script nuevo en el package.json (ver)
// y podremos lanzarlo con:

> npm start

*/
