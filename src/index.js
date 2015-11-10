var q = require('q');
/**
 * A simple interface for transfering money between credit cards and bank accounts
 * @class BankService
 * @param {BankProvider} provider the bank provider which this service delegates to
 * @returns {service}
 */
var BankService = function(provider) {
  if (!provider) {
    throw new Error('Provider required');
  }
  var _provider = provider;
  /**
   * Creates a bank account
   *
   * Requires two tokens, one for crediting the bank account
   * and one for debiting the bank account. Simply generate
   * two tokens with the same bank account credentials.
   * @function createBankAccount
   * @memberof BankService
   * @instance
   * @param {string} countryCode the two letter country code of the bank's origin
   * @param {string} creditToken the tokenized bank account info
   * @param {string} debitToken the tokenized bank account info
   * @param {string} email the email to assocaite with the stripe customer
   * @returns {promise} resolves with the newly created bankAccount record
   */
  this.createBankAccount = function(countryCode, creditToken, debitToken, email) {
    if (!countryCode) {
      return q.reject(new Error('Country code required'));
    }
    if (!creditToken) {
      return q.reject(new Error('Credit token required'));
    }
    if (!debitToken) {
      return q.reject(new Error('Debit token required'));
    }
    return _provider.createBankAccount(countryCode, creditToken, debitToken, email);
  };
  /**
   * Creates a credit card
   * @function createCreditCard
   * @memberof BankService
   * @instance
   * @param {string} token the tokenized credit card info
   * @param {string} email the email to assocaite with the stripe customer
   * @returns {promise} resolves with the newly created creditCard record
   */
  this.createCreditCard = function(token, email) {
    return _provider.createCreditCard(token, email);
  };
  /**
   * Verifies that the user has access to the bank account using micro-deposits
   *
   * Required before a bank account can be charged.
   * @function verifyBankAccount
   * @memberof BankService
   * @instance
   * @param {record} bankAccount the record of the bank account to be verified
   * @param {Array} amounts the micro-deposit verification amounts
   * @returns {promise}
   */
  this.verifyBankAccount = function(bankAccount, amounts) {
    return _provider.verifyBankAccount(bankAccount, amounts);
  };
  /**
   * Verifies that the user is who they say they are
   *
   * Required before a bank account can accept payments.
   * @function verifyIdentity
   * @memberof BankService
   * @instance
   * @param {record} bankAccount the record of the bank account to be verified
   * @param {Object} identity the map of identity fields
   * @param {string} filepath (optional) path to uploaded image of government ID
   * @returns {promise}
   */
  this.verifyIdentity = function(bankAccount, identity, filepath) {
    return _provider.verifyIdentity(bankAccount, identity, filepath);
  };
  /**
   * Checks that the verification process was successful
   * @function isIdentityVerified
   * @memberof BankService
   * @instance
   * @param {record} bankAccount the record of the bank account to be verified
   * @returns {promise}
   */
  this.isIdentityVerified = function(bankAccount) {
    return _provider.isIdentityVerified(bankAccount);
  };
  /**
   * Charges a bank account
   * @function chargeBankAccount
   * @memberof BankService
   * @instance
   * @param {record} bankAccount the record of the bank account to be charged
   * @param {number} cents the numbers of cents to charge
   * @returns {promise} resolves with the newly created payment record
   */
  this.chargeBankAccount = function(bankAccount, cents) {
    if (!bankAccount) {
      return q.reject(new Error('Credit card required'));
    }
    if (!cents) {
      return q.reject(new Error('Cents required'));
    }
    return _provider.chargeBankAccount(bankAccount, cents);
  };
  /**
   * Charges a credit card
   * @function chargeCreditCard
   * @memberof BankService
   * @instance
   * @param {record} card the record of the credit card to be charged
   * @param {number} cents the numbers of cents to charge
   * @returns {promise} resolves with the newly created payment record
   */
  this.chargeCreditCard = function(card, cents) {
    if (!card) {
      return q.reject(new Error('Credit card required'));
    }
    if (!cents) {
      return q.reject(new Error('Cents required'));
    }
    return _provider.chargeCreditCard(card, cents);
  };
  /**
   * Transfers money from a funding source to a bank account
   * @function transfer
   * @memberof BankService
   * @instance
   * @param {record} source the record of the credit card or bank account to be charged
   * @param {record} destination the record of the bank account to be credited
   * @param {number} cents the number of cents to transfer
   * @returns {promise} resolves with the newly created payment record
   */
  this.transfer = function(source, destination, cents) {
    if (!source) {
      return q.reject(new Error('Source required'));
    }
    if (!cents) {
      return q.reject(new Error('Destination required'));
    }
    return _provider.transfer(source, destination, cents);
  };
  /**
   * Returns a bank account record, given the id
   * @function getBankAccount
   * @memberof BankService
   * @instance
   * @param {string} id the id of the bank account record
   * @returns {record}
   */
  this.getBankAccount = function(id) {
    return _provider.getBankAccount(id);
  };
  /**
   * Returns a credit card record, given the id
   * @function getCreditCard
   * @memberof BankService
   * @instance
   * @param {string} id the id of the credit card record
   * @returns {record}
   */
  this.getCreditCard = function(id) {
    return _provider.getCreditCard(id);
  };
};

module.exports = BankService;