'use strict';

const winston = require('winston');
const ServerError = require('@jtviegas/jscommons').ServerError;
const commons = require('@jtviegas/jscommons').commons;

const storeFunctions = (config) => {

    if (!config)
        throw new Error('!!! must provide config to initialize module !!!');

    const CONFIGURATION_SPEC = {
        DYNDBSTORE_AWS_REGION: 'STOREFUNCTIONS_AWS_REGION'
        , DYNDBSTORE_AWS_ACCESS_KEY_ID: 'STOREFUNCTIONS_AWS_ACCESS_KEY_ID'
        , DYNDBSTORE_AWS_ACCESS_KEY: 'STOREFUNCTIONS_AWS_ACCESS_KEY'
        , DYNDBSTORE_AWS_DB_ENDPOINT: 'STOREFUNCTIONS_AWS_DB_ENDPOINT'
        , STOREFUNCTIONS_ENTITY_LIST: 'STOREFUNCTIONS_ENTITY_LIST'
        , STOREFUNCTIONS_TENANT: 'STOREFUNCTIONS_TENANT'
        , STOREFUNCTIONS_ENV_LIST: 'STOREFUNCTIONS_ENV_LIST'
    };

    const logger = winston.createLogger(commons.getDefaultWinstonConfig());
    let configuration = commons.getConfiguration(CONFIGURATION_SPEC, config, commons.handleListVariables);
    const service = require("./service")(configuration);

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
                    let env = null;
                    if( event.queryStringParameters && event.queryStringParameters.env )
                        env = event.queryStringParameters.env;

                    if( event.pathParameters.id )
                        service.entityRetrieval(event.pathParameters.entity, parseInt(event.pathParameters.id), env, done);
                    else
                        service.entitiesRetrieval(event.pathParameters.entity, env, done);
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



