'use strict';
const winston = require('winston');
const ServerError = require("./ServerError");

const common_module = function(config){

    const logger = winston.createLogger(config['WINSTON_CONFIG']);
    logger.info("...initializing common module...");

    var tableFromEntity = (entity) => {
        logger.info("[tableFromEntity|in] (%s)", entity);

        if( -1 === config.ENTITIES.indexOf(entity) )
            throw new ServerError('!!! table not enabled: ' + entity + ' !!!', 400);

        let result = `${config.TENANT}_${entity}_${config.ENV}`;
        logger.info("[tableFromEntity|out] => %s", result);
        return result;
    }

    logger.info("...common module is now initialized !");
    return {
        tableFromEntity: tableFromEntity
    };
    
};

module.exports = common_module;
