// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion')

// Inicializar variables
var app = express();
var Hospital = require('../models/hospital');

// obtener los hospitales
app.get( '/', ( request, response, next ) => {

	var desde = request.query.desde || 0;
	desde = Number(desde);

	Hospital.find({  })
	.skip(desde)
	.limit(5)
	.populate('usuario', 'nombre email')   // busca los datos de los campos relacionados
	.exec(
		( error, hospitales ) => {

			if ( error )
			{
				return response.status( 500 ).json({
					ok 		: false,
					mensaje : 'Error cargando hospitales',
					errors  : error
				});
			}

			Hospital.count({}, ( error, conteo ) => {

				response.status( 200 ).json({
					ok 		: true,
					hospitales,
					total 	: conteo
				});

			});


		});
});


// Crear un hospital
app.post( '/',  mdAutenticacion.verificaToken , ( request, response, next) => {

	var body = request.body; // esto solo funciona con el bodyparser (ver app.js)

	var hospital = new Hospital({
		nombre 		: body.nombre,
		usuario 	: request.usuario._id
	});
	hospital.save( ( error, hospital_guardado ) => {

		if ( error )
		{
			return response.status( 400 ).json({
				ok 		: false,
				mensaje : 'Error guardando hospital',
				errors  : error
			});
		}

		response.status( 201 ).json({
			ok 				: true,
			hospital 		: hospital_guardado,
			usuario_token 	: request.usuario
		});
	});
});


// Modifica un hospital
app.put( '/:id', mdAutenticacion.verificaToken,  ( request, response ) => {

	var id = request.params.id;
	var body = request.body;

	// Verificamos que existe un hospital con ese id
	Hospital.findById( id, ( error, hospital) => {

		if ( error )
		{
			return response.status( 400 ).json({
				ok 		: false,
				mensaje : 'Error al buscar hospital',
				errors  : error
			});
		}

		if ( ! hospital )
		{
			return response.status( 404 ).json({
				ok 		: false,
				mensaje : 'El hospital con el ' + id + ' no existe',
				errors  : { message : 'No existe un hospital con ese ID'}
			});
		}

		hospital.nombre 	= body.nombre;
		hospital.usuario 	= request.usuario._id;

		hospital.save( (error, hospital_guardado) => {

			if ( error )
			{
				return response.status( 400 ).json({
					ok 		: false,
					mensaje : 'Error al actualizar hospital',
					errors  : error
				});
			}

			response.status( 200 ).json({
				ok 		: true,
				body	: hospital_guardado
			});

		})

	});
});


// Borrar un hopsital
app.delete( '/:id', mdAutenticacion.verificaToken, ( request, response ) => {

	var id = request.params.id;

	Hospital.findByIdAndRemove( id, ( error, hospital ) => {

		if ( error )
		{
			return response.status( 500 ).json({
				ok 		: false,
				mensaje : 'Error al eliminar hospital',
				errors  : error
			});
		}

		if ( ! hospital )
		{
			return response.status(400).json({
				ok		: false,
				mensaje : 'No existe un hospital con ese id',
				errors 	: { message : 'No existe un hospital con ese id'}
			})
		}

		response.status( 200 ).json({
			ok : true,
			hospital : hospital
		});


	});
});


module.exports = app;
