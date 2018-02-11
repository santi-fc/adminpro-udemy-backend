var express = require('express');
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');


app.post('/', ( request, response) => {

	var body = request.body;

	Usuario.findOne({ email : body.email }, ( error, usuario_db ) => {

		if ( error )
		{
			return response.status( 500 ).json({
				ok 		: false,
				mensaje : 'Error al hacer login',
				errors  : error
			});
		}

		if ( ! usuario_db )
		{
			return response.status( 404 ).json({
				ok 		: false,
				mensaje : 'Credenciales incorrectas - email', // esto de email no se puede
				errors  : error
			});
		}

		// Hasta aquí tenemos un usuario con ese email
		// Comprobamos la contraseña
		if ( ! bcrypt.compareSync( body.password, usuario_db.password ) )
		{
			return response.status( 404 ).json({
				ok 		: false,
				mensaje : 'Credenciales incorrectas - password', // esto de password no se pone
				errors  : error
			});
		}

		// Creamos token !!
		var token = jwt.sign({ usuario : usuario_db }, SEED, { expiresIn : 14400 } );  // 4 horas

		usuario_db.password = ':)';
		response.status(200).json({
			ok 		: true,
			usuario : usuario_db,
			id 		: usuario_db._id,
			token	: token
		});

	});


});

module.exports = app;
