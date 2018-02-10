// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospital_db', ( error, response ) => {

	if ( error )
	{
		throw error;
	}

	console.log("Base de datos: \x1b[32m%s\x1b[0m", "online");

});

// rutas
app.get( '/', ( request, response, next ) => {

	response.status(200).json({
		ok 		: true,
		mensaje : 'Petición realizada correctamente'
	});



});

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
