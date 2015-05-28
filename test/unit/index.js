var q = require('q');
var BankService = require('../../src/index.js');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('BankService', function () {
  var service;
  var bankAccount;
  var creditCard;
  var mockStorage = {
    createRecord: function () {
      return {
        update: function () { return q.resolve(); },
        getID: function () { return 1; },
        load: function () { return q.resolve({data:true}); }
      }
    }
  };
  var mockProvider = {
    createBankAccount: function () { return q.resolve(mockStorage.createRecord()); },
    createCreditCard: function () { return q.resolve(mockStorage.createRecord()); },
    chargeBankAccount: function () { return q.resolve(); },
    chargeCreditCard: function () { return q.resolve(); },
    transfer: function () { return q.resolve(); },
    getBankAccount: function () { return mockStorage.createRecord(); },
    getCreditCard: function () { return mockStorage.createRecord(); },
    verifyBankAccount: function () { return q.resolve(); }
  };
  var bankAccountCreditToken = 'btok_ABC123';
  var bankAccountDebitToken = 'btok_DEF123';
  var creditCardToken =  'ctok_XYZ789';
  it('should respect logic', function () {
    expect(true).to.be.true;
    expect(true).not.to.be.false;
  });
  it('should require a provider', function () {
    expect(function () { new BankService(); }).to.throw();
  });
  it('should create bank accounts', function () {
    service = new BankService(mockProvider, mockStorage);
    var promise = service.createBankAccount('US', bankAccountCreditToken, bankAccountDebitToken)
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should create credit cards', function () {
    var promise = service.createCreditCard(creditCardToken)
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should load bank accounts', function () {
    bankAccount = service.getBankAccount(1);
    return expect(bankAccount.load()).to.eventually.be.fulfilled;
  });
  it('should load credit cards', function () {
    creditCard = service.getCreditCard(1);
    return expect(creditCard.load()).to.eventually.be.fulfilled;
  });
  it('should verify bank accounts', function () {
    var amounts = [1, 1];
    var promise = service.verifyBankAccount(bankAccount, amounts);
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should charge credit cards', function () {
    var promise = service.chargeCreditCard(creditCard, 50);
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should charge bank accounts', function () {
    var promise = service.chargeBankAccount(bankAccount, 500);
    return expect(promise).to.eventually.be.fulfilled;
  });
  it('should transfer from credit cards', function () {
    var promise = service.transfer(creditCard, bankAccount, 123);
    return expect(promise).to.eventually.be.fulfilled;
  });
});
