le-bank-service
=========

**A simple interface for transfering money between credit cards and bank accounts**

## Installation

  `npm install le-bank-service`

## Usage

```
  var provider = /* initialize bank provider */
  var BankService = require('le-bank-service');
  var bank = new BankService(provider);

  bank.createCreditCard('tok_ABC123') // tokenized credit card info
  .then(function (record) {
    ...
  });
```

## Tests

* `npm test` to run unit tests once
* `gulp tdd` to run unit and e2e tests when tests change
* `gulp coverage` to run unit tests and create a code coverage report

## Contributing

Please follow the project's [conventions](https://github.com/castle-dev/le-bank-service/blob/develop/CONTRIBUTING.md) or your changes will not be accepted

## Release History

* 0.1.0 Initial release
