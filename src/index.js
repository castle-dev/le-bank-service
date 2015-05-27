var q = require('q');

var BankService = function (provider) {
  if (!provider) { throw new Error('Provider required'); }
  var _provider = provider;

  this.createBankAccount = function (countryCode, creditToken, debitToken) {
    if (!countryCode) { return q.reject(new Error('Country code required')); }
    if (!creditToken) { return q.reject(new Error('Credit token required')); }
    if (!debitToken) { return q.reject(new Error('Debit token required')); }
    return _provider.createBankAccount(countryCode, creditToken, debitToken);
  };

  this.createCreditCard = function (token) {
    return _provider.createCreditCard(token);
  };

  this.chargeCreditCard = function (card, cents) {
    if (!card) { return q.reject(new Error('Credit card required')); }
    if (!cents) { return q.reject(new Error('Cents required')); }
    return _provider.chargeCreditCard(card, cents);
  };

  this.chargeBankAccount = function (bankAccount, cents) {
    if (!bankAccount) { return q.reject(new Error('Credit card required')); }
    if (!cents) { return q.reject(new Error('Cents required')); }
    return _provider.chargeBankAccount(bankAccount, cents);
  };

  this.transfer = function (source, destination, cents) {
    if (!source) { return q.reject(new Error('Source required')); }
    if (!cents) { return q.reject(new Error('Destination required')); }
    return _provider.transfer(source, destination, cents);
  };

  this.getBankAccount = function (id) {
    return _provider.getBankAccount(id);
  };

  this.getCreditCard = function (id) {
    return _provider.getCreditCard(id);
  };

  this.verifyBankAccount = function (bankAccount, amounts) {
    return _provider.verifyBankAccount(bankAccount, amounts);
  };

};

module.exports = BankService;
