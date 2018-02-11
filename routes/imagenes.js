// Requires
var express = require('express');
var fs 		= require('fs');

// Inicializar variables
var app = express();

// rutas
app.get( '/:tipo/:img', ( request, response, next ) => {

	var tipo = request.params.tipo;
	var img  = request.params.img;

	var path = `./uploads/${ tipo }/${ img }`;

	fs.exists( path, existe => {

		if ( ! existe )
		{
			path = './assets/no-img.jpg';
		}

		response.sendfile(path);

	});


});


module.exports = app;
