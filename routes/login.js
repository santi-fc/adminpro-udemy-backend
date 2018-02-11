var express = require('express');
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')

const SEED = require('../config/config').SEED;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

var app = express();
var Usuario = require('../models/usuario');

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;


// autentificación de google
app.post('/google', ( request, response) => {

	var token = request.body.token || 'XXX';

	var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');
	client.verifyIdToken(
	    token,
	    GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
	    // Or, if multiple clients access the backend:
	    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
	    function(e, login) {

			if ( e )
			{
				return response.status(500).json({
					ok : false,
					mensaje : 'Token no válido',
					errors : e
				});
			}

	      var payload = login.getPayload();
	      var userid = payload['sub'];
	      // If request specified a G Suite domain:
	      //var domain = payload['hd'];

		  Usuario.findOne({ email : payload.email}, ( error, usuario ) => {
			 if ( error )
			 {
				 return response.status(500).json({
  					ok : false,
  					mensaje : 'Error al buscar usuario -login',
  					errors : error
  				});
			}

			if ( usuario )
			{
				if ( usuario.google === false )
				{
					return response.status(400).json({
     					ok : false,
     					mensaje : 'Debe usar su autentificación normal',
     				});
				}

				usuario.password = ':)';

				// Creamos token !!
				var token = jwt.sign({ usuario : usuario }, SEED, { expiresIn : 14400 } );  // 4 horas

				response.status(200).json({
					ok 		: true,
					usuario : usuario,
					id 		: usuario._id,
					token	: token
				});

			} else {
				// si el usuario no existe creamos nuevo usuario

				var usuario = new Usuario();
				usuario.nombre = payload.name;
				usuario.email  = payload.email;
				usuario.password = ':)';
				usuario.img = payload.picture;
				usuario.google = true;
				usuario.save(( error, usuario_nuevo ) => {

					if ( error )
					{
						return response.status(500).json({
							ok : false,
							mensaje : 'No se ha podido guardar usuario en bbdd ',
							errors : error
						});
					}

					// Creamos token !!
					var token = jwt.sign({ usuario : usuario_nuevo }, SEED, { expiresIn : 14400 } );  // 4 horas

					response.status(200).json({
						ok 		: true,
						usuario : usuario_nuevo,
						id 		: usuario_nuevo._id,
						token	: token
					});


				});
			}
		 })

    });



});

// Autentificacion nomral
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
		usuario_db.password = ':)';

		// Creamos token !!
		var token = jwt.sign({ usuario : usuario_db }, SEED, { expiresIn : 14400 } );  // 4 horas

		response.status(200).json({
			ok 		: true,
			usuario : usuario_db,
			id 		: usuario_db._id,
			token	: token
		});

	});


});

module.exports = app;
