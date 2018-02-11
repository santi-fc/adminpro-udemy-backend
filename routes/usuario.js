// Requires
var express = require('express');
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')

var mdAutenticacion = require('../middlewares/autentificacion');

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');

// obtener los usuarios
app.get( '/', ( request, response, next ) => {

	var desde = request.query.desde || 0;
	desde = Number(desde);

	// Dame todo => Usuario.find({  }, ( error, usuarios ) =>
	Usuario.find({  }, 'nombre email img role')
	.skip(desde)
	.limit(5)
	.exec(
		( error, usuarios ) => {

			if ( error )
			{
				return response.status( 500 ).json({
					ok 		: false,
					mensaje : 'Error cargando usuario',
					errors  : error
				});
			}

			Usuario.count({}, ( error, conteo ) => {
				response.status( 200 ).json({
					ok 		: true,
					//usuarios  : usuarios   // => se puede hacer así:
					usuarios,
					total : conteo
				});
			});



		});
});


// Actualizar un usuario
app.put( '/:id', mdAutenticacion.verificaToken,  ( request, response) => {

	var id = request.params.id;
	var body = request.body;

	// Verificamos que existe un usuario con ese id
	Usuario.findById( id, ( error, usuario) => {

		if ( error )
		{
			return response.status( 400 ).json({
				ok 		: false,
				mensaje : 'Error al buscar usuario',
				errors  : error
			});
		}

		if ( !usuario )
		{
			return response.status( 404 ).json({
				ok 		: false,
				mensaje : 'El usuario con el ' + id + ' no existe',
				errors  : { message : 'No existe un usuario con ese ID'}
			});
		}

		usuario.nombre 	= body.nombre;
		usuario.email 	= body.email;
		usuario.role 	= body.role;

		usuario.save( (error, usuario_guardado) => {

			if ( error )
			{
				return response.status( 400 ).json({
					ok 		: false,
					mensaje : 'Error al actualizar usuario',
					errors  : error
				});
			}

			usuario_guardado.password = ':)';

			response.status( 200 ).json({
				ok 		: true,
				body	: usuario_guardado
			});

		})

	});


});


// Crear un usuario
app.post( '/',  mdAutenticacion.verificaToken , ( request, response, next) => {

	var body = request.body; // esto solo funciona con el bodyparser (ver app.js)

	var usuario = new Usuario({
		nombre 		: body.nombre,
		email		: body.email,
		password	: bcrypt.hashSync( body.password, 10 ),
		img 		: body.img,
		role 		: body.role
	});
	usuario.save( ( error, usuario_guardado ) => {

		if ( error )
		{
			return response.status( 400 ).json({
				ok 		: false,
				mensaje : 'Error guardando usuario',
				errors  : error
			});
		}

		response.status( 201 ).json({
			ok 		: true,
			body	: usuario_guardado,
			usuario_token : request.usuario
		});
	});
})

// Borrar un usuarios
app.delete( '/:id', mdAutenticacion.verificaToken, ( request, response ) => {

	var id = request.params.id;
	var body = request.body;

	Usuario.findByIdAndRemove( id, ( error, usuario) => {

		if ( error )
		{
			return response.status( 500 ).json({
				ok 		: false,
				mensaje : 'Error al eliminar usuario',
				errors  : error
			});
		}

		if ( !usuario )
		{
			return response.status(400).json({
				ok		: false,
				mensaje : 'No existe un usuario con ese id',
				errors 	: { message : 'No existe un usuario con ese id'}
			})
		}

		response.status( 200 ).json({
			ok : true,
			usuario : usuario
		});


	});
});


module.exports = app;
