var jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED;

// Verificar Token
exports.verificaToken = function( request, response, next ) {

	var token = request.query.token;

	jwt.verify( token, SEED, ( error, decoded ) => {

		if ( error )
		{
			return response.status( 401 ).json({
				ok 		: false,
				mensaje : 'Token no válido',
				errors  : error
			});
		}

		// Al usuario del token lo podemos poner en el request para tenerlo ;)
		request.usuario = decoded.usuario;

		next();


	});

}
