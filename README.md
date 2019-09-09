[![Build Status](https://travis-ci.org/jtviegas/store-functions.svg?branch=master)](https://travis-ci.org/jtviegas/store-functions)
[![Coverage Status](https://coveralls.io/repos/github/jtviegas/store-functions/badge.svg?branch=master)](https://coveralls.io/github/jtviegas/store-functions?branch=master)

# store-functions
functions for a data store api

## Installation

  `npm install @jtviegas/store-functions`
  
## Usage

### required environment variables or configuration properties
  - STOREFUNCTIONS_AWS_REGION
  - STOREFUNCTIONS_AWS_DB_ENDPOINT - optional, used for local testing;
  - STOREFUNCTIONS_AWS_ACCESS_KEY_ID
  - STOREFUNCTIONS_AWS_ACCESS_KEY
  - STOREFUNCTIONS_ENTITY_LIST
  - STOREFUNCTIONS_TENANT
  - STOREFUNCTIONS_ENV_LIST

### code snippet example

    let config = {
        STOREFUNCTIONS_AWS_REGION: 'eu-west-1'
        , STOREFUNCTIONS_AWS_ACCESS_KEY_ID: process.env.ACCESS_KEY_ID
        , STOREFUNCTIONS_AWS_ACCESS_KEY: process.env.ACCESS_KEY
        , STOREFUNCTIONS_ENTITY_LIST: 'item, part'
        , STOREFUNCTIONS_TENANT: 'xpto'
        , STOREFUNCTIONS_ENV_LIST: 'production,development'
    };

    const functions = require('@jtviegas/store-functions')(config);
    let event = {
                    httpMethod: 'GET'
                    , pathParameters: {
                        entity: 'item'
                    }
                    , queryStringParameters: {
                        env: 'development'
                    }
                };
    functions.handler(event, context, (e,d)=>{
        if(e)
            done(e);
        else {
            let r=JSON.parse(d.body);
            expect(r.length).to.equal(A_NUMBER);
            done(null);
        }
    });

Check the test folder in source tree.

## Tests

  `npm test`

## Contributing

just help yourself and submit a pull request