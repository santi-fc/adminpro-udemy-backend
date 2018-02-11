// Requires
var express = require('express');

// Inicializar variables
var app = express();

// rutas
app.get( '/', ( request, response, next ) => {

	response.status(200).json({
		ok 		: true,
		mensaje : 'Petición realizada correctamente'
	});	
});


module.exports = app;
