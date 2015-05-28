var q = require('q');
var BankService = require('../../src/index.js');
var BankProvider = require('le-bank-provider-stripe');
var StorageService = require('le-storage-service');
var StorageProvider = require('le-storage-provider-firebase');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

var storage = new StorageService(new StorageProvider(process.env.FIREBASE_URL));
var provider = new BankProvider(process.env.STRIPE_SECRET_KEY, storage);
var bank = new BankService(provider);

describe('BankService', function () {
  this.timeout(10000);
  var accountId;
  var validBankAccountCreditToken;
  var validBankAccountDebitToken;
  var anotherValidBankAccountCreditToken;
  var anotherValidBankAccountDebitToken;
  var invalidBankAccountCreditToken;
  var invalidBankAccountDebitToken;
  var bankAccountID;
  var bankAccount;
  var unverifiedBankAccount;
  var creditCardToken;
  var creditCardID;
  var creditCard;
  var customerID;
  var creditCardPayment;
  var creditCardTransfer;
  var bankAccountPayment;
  var bankAccountTransfer;
  var validBankAccountInfo = {
    bank_account: {
      country: 'US',
      currency: 'USD',
      routing_number: '110000000',
      account_number: '000123456789'
    } // test bank account numbers
  };
  var invalidBankAccountInfo = {
    bank_account: {
      country: 'CA',
      currency: 'USD',
      routing_number: '110000000',
      account_number: '000123456789'
    } // test bank account numbers
  };
  var validCreditCardInfo = {
    card: {
      "number": '4242424242424242',
      "exp_month": 12,
      "exp_year": 2016,
      "cvc": '123'
    } // test credit card numbers
  }
  function tokenizePaymentInfo (info) {
    var deferred = q.defer();
    stripe.tokens.create(info, function (err, token) {
      if (err) { deferred.reject(err); }
      deferred.resolve(token.id);
    })
    return deferred.promise;
  }
  before(function (done) {
    var promises = [];
    promises.push(tokenizePaymentInfo(validCreditCardInfo));
    promises.push(tokenizePaymentInfo(validBankAccountInfo));
    promises.push(tokenizePaymentInfo(validBankAccountInfo));
    promises.push(tokenizePaymentInfo(validBankAccountInfo));
    promises.push(tokenizePaymentInfo(validBankAccountInfo));
    promises.push(tokenizePaymentInfo(invalidBankAccountInfo));
    promises.push(tokenizePaymentInfo(invalidBankAccountInfo));
    return q.all(promises)
    .then(function (tokens) {
      creditCardToken = tokens[0];
      validBankAccountDebitToken = tokens[1];
      validBankAccountCreditToken = tokens[2];
      anotherValidBankAccountDebitToken = tokens[3];
      anotherValidBankAccountCreditToken = tokens[4];
      invalidBankAccountDebitToken = tokens[5];
      invalidBankAccountCreditToken = tokens[6];
      done();
    });
  });
  it('should respect logic', function () {
    expect(true).to.be.true;
    expect(true).not.to.be.false;
  });
  it('should require provider', function () {
    expect(function () { new BankService(); }).to.throw();
    expect(function () { new BankService(provider); }).not.to.throw();
  });
  it('should create bank accounts', function () {
    var promise = bank.createBankAccount('US', validBankAccountCreditToken, validBankAccountDebitToken);
    promise
    .then(function (record) {
      bankAccountID = record.getID();
    })
    .then(function () {
      return bank.createBankAccount('US', anotherValidBankAccountCreditToken, anotherValidBankAccountDebitToken);
    })
    .then(function (record) {
      unverifiedBankAccount = record;
    });
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should not create bank accounts without two tokens', function () {
    var promise = bank.createBankAccount('US', 'fakeToken');
    return expect(promise).to.eventually.be.rejected;
  });
  it('should not create bank accounts with invalid credentials', function () {
    var promise = bank.createBankAccount('US', invalidBankAccountCreditToken, invalidBankAccountDebitToken);
    return expect(promise).to.eventually.be.rejected;
  });
  it('should create credit cards', function () {
    var promise = bank.createCreditCard(creditCardToken);
    promise.then(function (creditCard) {
      creditCardID = creditCard.getID();
      return creditCard.load();
    })
    .then(function (data) {
      customerID = data.customer;
    });
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should not create invalid credit cards', function () {
    var promise = bank.createCreditCard('US', 'fakeToken');
    return expect(promise).to.eventually.be.rejected;
  });
  it('should load bank accounts', function () {
    bankAccount = bank.getBankAccount(bankAccountID);
    var promise = bankAccount.load()
    .then(function (data) {
      expect(data).not.to.be.an('undefined');
    });
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should load credit cards', function () {
    creditCard = bank.getCreditCard(creditCardID);
    var promise = creditCard.load()
    .then(function (data) {
      expect(data).not.to.be.an('undefined');
    });
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should not charge unverified bank accounts', function () {
    var promise = bank.chargeBankAccount(bankAccount, 500); // cents
    return expect(promise).to.eventually.be.rejectedWith('Bank accounts must be verified before they can be charged');
  });
  it('should require valid micro-deposit amounts to verify bank accounts', function () {
    var amounts = [1, 1];
    var promise = bank.verifyBankAccount(bankAccount, amounts)
    return expect(promise).to.eventually.be.rejectedWith('The amounts provided do not match the amounts that were sent to the bank account.');
  });
  it('should verify bank accounts', function () {
    var amounts = [32, 45];
    var promise = bank.verifyBankAccount(bankAccount, amounts);
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should charge bank accounts', function () {
    var promise = bank.chargeBankAccount(bankAccount, 500) // cents
    .then(function (payment) { bankAccountPayment = payment; },
          function (err) { console.log(err); throw err; });
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should load payments from bank account charges', function () {
    var promise = bankAccountPayment.load();
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should charge credit cards', function () {
    var promise = bank.chargeCreditCard(creditCard, 50) // cents
    .then(function (payment) { creditCardPayment = payment; })
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should load payments from credit card charges', function () {
    var promise = creditCardPayment.load();
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should transfer funds from a credit card to a bank account', function () {
    var promise = bank.transfer(creditCard, bankAccount, 123) // cents
    .then(function (payment) { creditCardTransfer = payment; })
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should transfer funds from one bank account to another', function () {
    var promise = bank.transfer(bankAccount, unverifiedBankAccount, 987) // cents
    .then(function (payment) { bankAccountTransfer = payment; })
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should load payments from credit card transfers', function () {
    var promise = creditCardPayment.load();
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should load payments from bank account transfers', function () {
    var promise = bankAccountTransfer.load();
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should not charge credit cards less than 50 cents', function () {
    var promise = bank.chargeCreditCard(creditCard, 25);
    return expect(promise).to.eventually.be.rejected;
  });
});
