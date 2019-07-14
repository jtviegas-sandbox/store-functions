'use strict';
const winston = require('winston');
const store = require('@jtviegas/dyndbstore');

const service_module = (config) => {

    const logger = winston.createLogger(config['WINSTON_CONFIG']);
    logger.info("...initializing service module...");
    const common = require("./common")(config);

    store.init({ apiVersion: config.DB_API_VERSION , region: config.DB_API_REGION , endpoint: config.DB_ENDPOINT
        , accessKeyId: config.DB_API_ACCESS_KEY_ID , secretAccessKey: config.DB_API_ACCESS_KEY } );
    logger.info("...initialized the store successfully !");

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


    var entityRetrieval = (entity, id, callback) => {
        logger.debug("[entityRetrieval|in] (%s,%s)", entity, id);

        let table = common.tableFromEntity(entity);

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

    var entitiesRetrieval = (entity, callback) => {
        logger.debug("[entitiesRetrieval|in] (%s)", entity);
        let table = common.tableFromEntity(entity);

        confirmTable(table, (e) => {
            if(e)
                callback(e);
            else{
                store.getObjs(table, (e,d)=>{
                    if(e)
                        callback(e);
                    else
                        callback(null, d);
                });
            }
        });
        logger.debug("[entitiesRetrieval|out]");
    }

    logger.info("...service module is now initialized !");

    return {
        entityRetrieval: entityRetrieval
        , entitiesRetrieval: entitiesRetrieval
        , confirmTable: confirmTable
    };
    
};


module.exports = service_module;
