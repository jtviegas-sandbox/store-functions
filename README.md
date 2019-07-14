# store-functions
functions for a data store api

## Installation

  `npm install @jtviegas/store-functions`
  
## Usage

- depends on winston, thus it needs a logger configuration being handed over:
```
const logger = winston.createLogger(config['WINSTON_CONFIG']);
```
- depends on '@jtviegas/dyndbstore' thus it needs the dynamoDb config being handed over too:
```
const store = require('@jtviegas/dyndbstore');
...
store.init({ apiVersion: config.DB_API_VERSION , region: config.DB_API_REGION , endpoint: config.DB_ENDPOINT
        , accessKeyId: config.DB_API_ACCESS_KEY_ID , secretAccessKey: config.DB_API_ACCESS_KEY } );
```
- check `test_index.js` for usage:
```
const index = require("..")(config);
```

## Tests

  `npm test`

## Contributing

https://github.com/jtviegas/store-functions