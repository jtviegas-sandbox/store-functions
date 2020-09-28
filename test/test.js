'use strict';


const winston = require('winston');
const commons = require('@jtviegas/jscommons').commons;

let config = {
    DYNDBSTORE_AWS_REGION: 'eu-west-1'
    , DYNDBSTORE_AWS_ACCESS_KEY_ID: process.env.ACCESS_KEY_ID
    , DYNDBSTORE_AWS_ACCESS_KEY: process.env.ACCESS_KEY
    , DYNDBSTORE_TEST: {
        store_endpoint: 'http://localhost:8000'
    }

    , STOREFUNCTIONS_AWS_REGION: 'eu-west-1'
    , STOREFUNCTIONS_TEST: {
        store_endpoint: 'http://localhost:8000'
    }
    , STOREFUNCTIONS_AWS_ACCESS_KEY_ID: process.env.ACCESS_KEY_ID
    , STOREFUNCTIONS_AWS_ACCESS_KEY: process.env.ACCESS_KEY

    , STOREFUNCTIONS_ENTITY_LIST: 'item, part'
    , STOREFUNCTIONS_TENANT: 'split4ever'
    , STOREFUNCTIONS_ENV_LIST: 'production,development'
};

const logger = winston.createLogger(commons.getDefaultWinstonConfig());

const store = require('@jtviegas/dyndbstore');
const chai = require('chai');
const expect = chai.expect;
const index = require("..")(config);

const service = require("../service")(config);

const ENTITY = 'item';
const ENV = 'development';
const TEST_ITERATIONS = 6;


describe('index tests', function() {
    this.timeout(50000);
    let table = service.getTableFromEntity(ENTITY, ENV);

    before(function(done) {
        logger.info("[before|in]");
        store.init(config);

        let items = [];
        let i = 0;
        while (i < (TEST_ITERATIONS)){
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
                , queryStringParameters: {
                    env: ENV
                }
            };
            index.handler(event, context, (e,d)=>{
                if(e)
                    done(e);
                else {
                    let r=JSON.parse(d.body);
                    expect(r.length).to.equal(TEST_ITERATIONS);
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
                , queryStringParameters: {
                    env: ENV
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
