// Requires
var express 	= require('express');
var fileUpload	= require('express-fileupload');
var fs 			= require('fs');

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

// rutas
app.put( '/:tipo/:id', ( request, response, next ) => {

	var tipo = request.params.tipo;
	var id   = request.params.id;

	var tipos_validos = ['hospitales', 'usuarios','medicos'];
	if ( tipos_validos.indexOf( tipo ) < 0 )
	{
		return response.status(400).json({
			ok 		: false,
			mensaje : 'Tipo de colección no válida',
			errors  : { message : 'Debe seleccionar una colección válida '}
		});
	}

	if ( ! request.files )
	{
		return response.status(400).json({
			ok 		: false,
			mensaje : 'No hay archivo que cargar',
			errors  : { message : 'Debe seleccionar una imagen '}
		});
	}

	// obtener nombre archivo
	var archivo = request.files.imagen;
	var nombre_cargado = archivo.name.split('.');
	var extension_archivo = nombre_cargado[ nombre_cargado.length - 1];

	// solo extensiones
	var extensiones_validas = [ 'png', 'jpg', 'gif', 'jpeg' ];

	if ( extensiones_validas.indexOf( extension_archivo ) < 0 )
	{
		return response.status(400).json({
			ok 		: false,
			mensaje : 'Extensión no válida',
			errors  : { message : 'Las extensiones válidas son ' + extensiones_validas.join(', ') }
		});
	}

	// Nombre de archivo personalizado
	// Será el id delusuario + numero random + extensión
	var nombre_archivo = `${ id }-${ new Date().getMilliseconds() }.${ extension_archivo }`;

	// Movemos archivo
	var path = `./uploads/${ tipo }/${ nombre_archivo }`;
	archivo.mv( path, function(err) {
	    if (err)
		{
			return response.status(500).json({
				ok 		: false,
				mensaje : 'Error al mover archivo',
				errors  : err
			});
		}

		subir_por_tipo( tipo, id, nombre_archivo, response );



	  });


});

function subir_por_tipo( tipo, id, nombre_archivo, response )
{
	if ( tipo === 'usuarios')
	{
		Usuario.findById( id, ( error, usuario) => {

			if (!usuario)
			{
				response.status(400).json({
					ok 		: false,
					mensaje : 'Usuario no existe',
					errors  : { message: 'Usuario no existe'}
				});
			}

			var path_imagen_anterior = './uploads/usuarios/' + usuario.img;

			// Si existe la imagen anterior, la eliminamos
			if ( fs.existsSync(path_imagen_anterior) )
			{
				fs.unlink( path_imagen_anterior );
			}

			usuario.img =nombre_archivo;
			usuario.save( ( error, usuario_actualizado ) => {

				usuario_actualizado.password = ':)';
				response.status(200).json({
					ok 		: true,
					mensaje : 'Imagen de usuario actualizada',
					usuario : usuario_actualizado
				});
			});
		});
	}

	if ( tipo === 'medicos')
	{
		Medico.findById( id, ( error, medico ) => {

			if (!medico)
			{
				response.status(400).json({
					ok 		: false,
					mensaje : 'Médico no existe',
					errors  : { message: 'Medico no existe'}
				});
			}

			var path_imagen_anterior = './uploads/medicos/' + medico.img;

			// Si existe la imagen anterior, la eliminamos
			if ( fs.existsSync(path_imagen_anterior) )
			{
				fs.unlink( path_imagen_anterior );
			}

			medico.img = nombre_archivo;
			medico.save( ( error, medico_actualizado ) => {

				response.status(200).json({
					ok 		: true,
					mensaje : 'Imagen de medico actualizada',
					medico : medico_actualizado
				});
			});
		});
	}

	if ( tipo === 'hospitales')
	{
		Hospital.findById( id, ( error, hospital ) => {

			if (!hospital)
			{
				response.status(400).json({
					ok 		: false,
					mensaje : 'Hospital no existe',
					errors  : { message: 'Hospital no existe'}
				});
			}

			var path_imagen_anterior = './uploads/hospitales/' + hospital.img;

			// Si existe la imagen anterior, la eliminamos
			if ( fs.existsSync(path_imagen_anterior) )
			{
				fs.unlink( path_imagen_anterior );
			}

			hospital.img = nombre_archivo;
			hospital.save( ( error, hospital_actualizado ) => {

				response.status(200).json({
					ok 		: true,
					mensaje : 'Imagen de hospital actualizada',
					hospital : hospital_actualizado
				});
			});
		});
	}
}

module.exports = app;
