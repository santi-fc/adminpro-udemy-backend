// Requires
var express = require('express');

// Inicializar variables
var app = express();


var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


app.get('/coleccion/:coleccion/:busqueda', ( request, response) => {

	var coleccion = request.params.coleccion;
	var busqueda  = request.params.busqueda;
	var reg_exp   = new RegExp( busqueda, 'i');

	switch ( coleccion ) {
		case 'medicos':

			buscarMedicos(busqueda, reg_exp).then( respuesta => {

				response.status(200).json({
					ok 			: true,
				    resultados 	: respuesta,
				});
			});

		break;

		case 'hospitales':

			buscarHospitales(busqueda, reg_exp).then( respuesta => {

				response.status(200).json({
					ok 			: true,
				    resultados 	: respuesta,
				});
			});

		break;

		case 'usuarios':

			buscarUsuarios(busqueda, reg_exp).then( respuesta => {

				response.status(200).json({
					ok 			: true,
					resultados 	: respuesta,
				});
			});

		break;

		default :
			response.status(400).json({
				ok 			: false,
				mensaje 	: 'Los tipos de búsqueda son:  medicos | usuarios | hospitales '
			});
		break;

	}

})


// rutas
app.get( '/todo/:busqueda', ( request, response, next ) => {

	var busqueda = request.params.busqueda;
	var reg_exp = new RegExp( busqueda, 'i');

	Promise.all([
		buscarHospitales( busqueda, reg_exp ),
		buscarMedicos( busqueda, reg_exp ),
		buscarUsuarios( busqueda, reg_exp )
	])
		.then( respuestas => {

			response.status(200).json({
				ok 			: true,
			    hospitales 	: respuestas[0],
			    medicos 	: respuestas[1],
			    usuarios 	: respuestas[2]
			});
		});
});

function buscarHospitales( busqueda, expresion_regular )
{

	return new Promise( ( resolve, reject ) => {

		Hospital
		.find({ nombre : expresion_regular })
		.populate('usuario', 'nombre email')
		.exec( ( error, hospitales ) => {

			if ( error )
			{
				reject( 'Error al cargar hospitales', error );
			}
			else
			{
				resolve ( hospitales );
			}

		});
	});
}

function buscarMedicos( busqueda, expresion_regular )
{

	return new Promise( ( resolve, reject ) => {

		Medico
		.find({ nombre : expresion_regular })
		.populate('usuario', 'nombre email')
		.populate('hospital', 'nombre')
		.exec( ( error, medicos ) => {

			if ( error )
			{
				reject( 'Error al cargar hospitales', error );
			}
			else
			{
				resolve ( medicos );
			}

		});
	});
}

function buscarUsuarios( busqueda, expresion_regular )
{

	return new Promise( ( resolve, reject ) => {

		Usuario.find({}, 'nombre email role')
				.or([ { 'nombre' : expresion_regular }, { 'email' : expresion_regular} ])
				.exec( ( error, usuarios ) => {

					if (error)
					{
						reject('Error al cargar usuarios', error);

					} else {
						resolve( usuarios );
					}
				})


	});
}

module.exports = app;
