'use strict';
const winston = require('winston');
const commons = require('@jtviegas/jscommons').commons;
const ServerError = require('@jtviegas/jscommons').ServerError;
const store = require('@jtviegas/dyndbstore');

const service_module = (config) => {

    const logger = winston.createLogger(commons.getDefaultWinstonConfig());
    logger.info("...initializing service module...");
    store.init( config );

    var getTableFromEntity = (entity, env) => {
        logger.info("[getTableFromEntity|in] (%s,%s)", entity, env);

        if( -1 === config.STOREFUNCTIONS_ENTITY_LIST.indexOf(entity) )
            throw new ServerError('!!! table not enabled: ' + entity + ' !!!', 400);

        let result = `${config.STOREFUNCTIONS_TENANT}_${entity}`;
        if (null !== env){
            if( -1 === config.STOREFUNCTIONS_ENV_LIST.indexOf(env) )
                throw new ServerError('!!! table not enabled: ' + entity + ' !!!', 400);
            result += '_' + env;
        }

        logger.info("[getTableFromEntity|out] => %s", result);
        return result;
    }



    var confirmTable = (table, callback) => {
        logger.debug("[confirmTable|in] (%s)", table);
        store.findTable(table, (e,r) => {
            if(e)
                callback(e);
            else {
                if(true === r)
                    callback(null);
                else{
                    store.createTable(table,(e) => {
                        if(e)
                            callback(e);
                        else{
                            logger.info("...table %s was created !", table);
                            callback(null);
                        }
                    });
                }
            }
        });
        logger.debug("[confirmTable|out]");
    }


    var entityRetrieval = (entity, id, env, callback) => {
        logger.debug("[entityRetrieval|in] (%s,%s,%s)", entity, id, env);

        let table = getTableFromEntity(entity, env);

        confirmTable(table, (e) => {
            if(e)
                callback(e);
            else{
                store.getObj(table, id, (e,d)=>{
                    if(e)
                        callback(e);
                    else
                        callback(null, d);
                });
            }
        });
        logger.debug("[entityRetrieval|out]");
    }

    var entitiesRetrieval = (entity, env, callback) => {
        logger.debug("[entitiesRetrieval|in] (%s,%s)", entity, env);
        let table = getTableFromEntity(entity, env);

        confirmTable(table, (e) => {
            if(e)
                callback(e);
            else
                store.getObjs(table, callback);

        });
        logger.debug("[entitiesRetrieval|out]");
    }

    logger.info("...service module is now initialized !");

    return {
        entityRetrieval: entityRetrieval
        , entitiesRetrieval: entitiesRetrieval
        , getTableFromEntity: getTableFromEntity
        , confirmTable: confirmTable
    };
    
};


module.exports = service_module;
