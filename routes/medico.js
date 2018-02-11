// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion')

// Inicializar variables
var app = express();
var Medico = require('../models/medico');

// obtener los médicos
app.get( '/', ( request, response, next ) => {

	var desde = request.query.desde || 0;
	desde = Number(desde);

	Medico.find({  })
	.skip(desde)
	.limit(5)
	.populate('usuario', 'nombre email')
	.populate('hospital')
	.exec(
		( error, medicos ) => {

			if ( error )
			{
				return response.status( 500 ).json({
					ok 		: false,
					mensaje : 'Error cargando médicos',
					errors  : error
				});
			}

			Medico.count({}, ( error, conteo ) => {
				response.status( 200 ).json({
					ok 		: true,
					medicos,
					total   : conteo
				});
			})



		});
});



// Crear un médico
app.post( '/',  mdAutenticacion.verificaToken , ( request, response, next) => {

	var medico = new Medico({
		nombre 		: body.nombre,
		hospital 	: body.hospital,
		usuario 	: request.usuario._id
	});
	medico.save( ( error, medico_guardado ) => {

		if ( error )
		{
			return response.status( 400 ).json({
				ok 		: false,
				mensaje : 'Error guardando médico',
				errors  : error
			});
		}

		response.status( 201 ).json({
			ok 		: true,
			body	: medico_guardado,
			usuario_token : request.usuario
		});
	});
});



// Modifica un médico
app.put( '/:id', mdAutenticacion.verificaToken,  ( request, response ) => {

	var id = request.params.id;
	var body = request.body;

	// Verificamos que existe un hospital con ese id
	Medico.findById( id, ( error, medico ) => {

		if ( error )
		{
			return response.status( 400 ).json({
				ok 		: false,
				mensaje : 'Error al buscar medico',
				errors  : error
			});
		}

		if ( ! medico )
		{
			return response.status( 404 ).json({
				ok 		: false,
				mensaje : 'El médico con el ' + id + ' no existe',
				errors  : { message : 'No existe un médico con ese ID'}
			});
		}

		medico.nombre 		= body.nombre;
		medico.hospital		= body.hospital;
		medico.usuario 		= request.usuario._id;

		medico.save( (error, medico_guardado) => {

			if ( error )
			{
				return response.status( 400 ).json({
					ok 		: false,
					mensaje : 'Error al actualizar médico',
					errors  : error
				});
			}

			response.status( 200 ).json({
				ok 		: true,
				body	: medico_guardado
			});

		})

	});
});


// Borrar un médico
app.delete( '/:id', mdAutenticacion.verificaToken, ( request, response ) => {

	var id = request.params.id;
	var body = request.body;

	Medico.findByIdAndRemove( id, ( error, medico ) => {

		if ( error )
		{
			return response.status( 500 ).json({
				ok 		: false,
				mensaje : 'Error al eliminar médico',
				errors  : error
			});
		}

		if ( ! medico )
		{
			return response.status(400).json({
				ok		: false,
				mensaje : 'No existe un médico con ese id',
				errors 	: { message : 'No existe un médico con ese id'}
			})
		}

		response.status( 200 ).json({
			ok : true,
			medico : medico
		});


	});
});



module.exports = app;
