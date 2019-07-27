'use strict';

const winston = require('winston');
const ServerError = require('@jtviegas/jscommons').ServerError;

const storeFunctions = (config) => {

    if (!config)
        throw new Error('!!! must provide config to initialize module !!!');

    const DEFAULT_WINSTON_CONFIG = {
        format: winston.format.combine(winston.format.splat(), winston.format.simple()),
        transports: [new winston.transports.Console()]
    };

    if (! config['WINSTON_CONFIG'])
        config['WINSTON_CONFIG'] = DEFAULT_WINSTON_CONFIG;

    const logger = winston.createLogger(config['WINSTON_CONFIG']);
    const service = require("./service")(config);

    let handler = (event, context, callback) => {
        logger.info("[handler|in] <= %s", JSON.stringify(event));

        const done = (err, res) => callback( null, {
            statusCode: err ? err.status : 200,
            body: err ? err.message : JSON.stringify(res),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });

        try{
            if( event.httpMethod !== 'GET' )
                throw new ServerError(`Unsupported method "${event.httpMethod}"`, 400);
            else {
                if( event.pathParameters && event.pathParameters.entity ) {
                    if( event.pathParameters.id )
                        service.entityRetrieval(event.pathParameters.entity, parseInt(event.pathParameters.id), done);
                    else
                        service.entitiesRetrieval(event.pathParameters.entity, done);
                }
                else
                    throw new ServerError("Unsupported path", 404);
            }
        }
        catch(e){
            logger.error("[handler] %o", e);
            done(e);
        }
        logger.info("[handler|out]");
    }

    return { handler: handler }
}

module.exports = storeFunctions;



