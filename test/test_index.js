'use strict';


const winston = require('winston');
const config = require("./config");
const logger = winston.createLogger(config['WINSTON_CONFIG']);
const store = require('@jtviegas/dyndbstore');
const chai = require('chai');
const expect = chai.expect;
const index = require("..")(config);
const ENTITY = 'item';
const service = require("../service")(config);
const common = require("../common")(config);

describe('index tests', function() {
    this.timeout(50000);
    let table = common.tableFromEntity(ENTITY);

    before(function(done) {
        logger.info("[before|in]");
        store.init({ apiVersion: config.DB_API_VERSION , region: config.DB_API_REGION
            , endpoint: config.DB_ENDPOINT, accessKeyId: process.env.DB_API_ACCESS_KEY_ID , secretAccessKey: process.env.DB_API_ACCESS_KEY } );

        let items = [];
        let i = 0;
        while (i < (config.TEST_ITERATIONS)){
            items.push( {'id': i, 'description': 'xpto' + i, 'category': 'a' + i} );
            i++;
        }

        let loader = function(table, items, callback){
            let f = function() {
                store.putObjs(table, items, (e) => {
                    if(e)
                        callback(e);
                    else
                        callback(null);
                });
            };
            return {f: f};
        }(table, items, done);

        service.confirmTable(table, (e) => {
            if(e)
                done(e);
            else
                loader.f();
        });
        logger.info("[before|out]");
    });

    after(function(done) {
        logger.info("[after] going to drop table %s", table);
        store.dropTable(table, (e,d) => {
            if(e)
                done(e);
            else{
                logger.info('[after|cb] dropped the table');
                done(null);
            }
        });

    });
    
    describe('...pagination', function(done) {
        it('should get all objects', function(done) {

            let event = {
                httpMethod: 'GET'
                , pathParameters: {
                    entity: ENTITY
                }
            };
            index.handler(event, context, (e,d)=>{
                if(e)
                    done(e);
                else {
                    let r=JSON.parse(d.body);
                    expect(r.length).to.equal(config.TEST_ITERATIONS);
                    done(null);
                }
            });

        });    

    });
    
     describe('...obj getter', function(done) {
        it('should get a specific item', function(done) {
            let event = {
                httpMethod: 'GET'
                , pathParameters: {
                    entity: ENTITY
                    , id: 2
                }
            };
            index.handler(event, context, (e,d)=>{
                if(e)
                    done(e);
                else {
                    let r=JSON.parse(d.body);
                    expect(r).to.eql({'id': 2, 'description': 'xpto' + 2, 'category': 'a' + 2});
                    done();
                }
            });
        });
    });

});
