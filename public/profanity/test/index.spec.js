var expect = require('chai').expect;
const frenchBadwords = require('french-badwords-list').array;
var filter = require('../src/index.js');

describe('list', function() {
  it('should contain boob word', function() {
    expect(filter.list()).to.include('boob');
  });
});

describe('check', function() {
  it('should return false if param is empty string', function() {
    expect(filter.check('')).to.be.false;
  });

  it('should return false if string not contain profanity word', function() {
    expect(filter.check('I have 2 eyes')).to.be.false;
  });

  it('should return true if string contain profanity word', function() {
    // normal case
    expect(filter.check('I have boob, etc.')).to.be.true;

    // first & last
    expect(filter.check('2g1c')).to.be.true;
    expect(filter.check('zoophilia')).to.be.true;
    expect(filter.check('lorem 2g1c ipsum')).to.be.true;
    expect(filter.check('lorem zoophilia ipsum')).to.be.true;
  });

  it('should detect case sensitive', function() {
    expect(filter.check('I have BoOb')).to.be.true;
  });

  it('should detect dot and comma', function() {
    expect(filter.check('I have BoOb,')).to.be.true;
    expect(filter.check('I have BoOb.')).to.be.true;
  });

  it('should detect multi occurrence', function() {
    expect(filter.check('I have boob,boob, ass, and etc.')).to.be.true;
  });

  it('should not detect unspaced-word', function() {
    expect(filter.check('Buy classic watches online')).to.be.false;
  });
});

describe('clean', function() {
  it('should return empty string if param is empty string', function() {
    expect(filter.clean('')).to.equal('');
  });

  it('should return original string if string not contain profanity word', function() {
    expect(filter.clean('I have 2 eyes')).to.equal('I have 2 eyes');
  });

  it('should replace profanity word with *', function() {
    // normal case
    expect(filter.clean('I have boob, etc.')).to.equal('I have ****, etc.');

    // first & last
    expect(filter.clean('2g1c')).to.equal('****');
    expect(filter.clean('zoophilia')).to.equal('*********');
    expect(filter.clean('lorem 2g1c ipsum')).to.equal('lorem **** ipsum');
    expect(filter.clean('lorem zoophilia ipsum')).to.equal('lorem ********* ipsum');
  });

  it('should detect case sensitive', function() {
    expect(filter.clean('I have BoOb')).to.equal('I have ****');
  });

  it('should detect dot and comma', function() {
    expect(filter.clean('I have BoOb,')).to.equal('I have ****,');
    expect(filter.clean('I have BoOb.')).to.equal('I have ****.');
  });

  it('should detect multi occurrence', function() {
    expect(filter.clean('I have boob,boob, ass, and etc.')).to.equal('I have ****,****, ***, and etc.');
  });

  it('should not detect unspaced-word', function() {
    expect(filter.clean('Buy classic watches online')).to.equal('Buy classic watches online');
  });

  it('should replace profanity word with + (custom replacement-character)', function() {
    expect(filter.clean('I have boob', '+')).to.equal('I have ++++');
  });

  it('should detect multi-length-space and multi-space', function() {
    expect(filter.clean('I  hav   ,e BoOb,  ')).to.equal('I  hav   ,e ****,  ');
    expect(filter.clean(',I h  a.   v e BoOb.')).to.equal(',I h  a.   v e ****.');
  });
});

describe('add', function() {
  it('should contain new word by given string', function() {
    filter.add('b00b');
    expect(filter.list()).to.include('b00b');
  });

  it('should contain new words by given array of string', function() {
    filter.add(['b@@b', 'b##b']);
    expect(filter.list()).to.include('b@@b');
    expect(filter.list()).to.include('b##b');
  });

  it('should not add if we already have', function() {
    // check duplication
    var numberOfCurrentWords = filter.list().length;
    filter.add(['b@@b', 'b##b']);
    expect(filter.list().length).to.equal(numberOfCurrentWords);
  });
});

describe('remove', function() {
  it('should remove word by given string', function() {
    filter.remove('boob');
    expect(filter.list()).to.not.include('boob');
  });

  it('should remove words by given array of string', function() {
    filter.remove(['boob', 'boobs']);
    expect(filter.list()).to.not.include('boob');
    expect(filter.list()).to.not.include('boobs');
  });
});

describe('reset', function() {
  it('should reset words by using default dictionary', function() {
    // reset
    filter.reset();

    // prepare data to test by adding new 2 bad words
    var numberOfCurrentWords = filter.list().length;
    filter.add(['badword1', 'badword2']);
    expect(filter.list().length).to.equal(numberOfCurrentWords + 2);

    // reset
    filter.reset();
    expect(filter.list().length).to.equal(numberOfCurrentWords);
  });
});

describe('clearList', function() {
  it('should remove words in the list', function() {
    filter.clearList();
    expect(filter.list()).to.be.empty;
  });
});

describe('getDictionary', function() {
  it('should returns "en" word list', function() {
    var result = filter.getDictionary()

    expect(result).to.include('boob');
    expect(result).to.include('boobs');
  });

  it('should returns "fr" word list', function() {
    var result = filter.getDictionary('fr')

    expect(result).to.include('1mb3c1l3');
    expect(result).to.include('1mbec1l3');
  });
});

describe('loadDictionary', function() {
  it('should load "en" dictionary', function() {
    filter.loadDictionary()

    expect(filter.list()).to.include('boob');
    expect(filter.list()).to.include('boobs');
  });

  it('should load "fr" dictionary', function() {
    filter.loadDictionary('fr')

    expect(filter.list()).to.include('1mb3c1l3');
    expect(filter.list()).to.include('1mbec1l3');
    expect(filter.check('bordel de merde')).to.be.true;
    expect(filter.clean('bordel de merde')).to.eql('****** de *****');
    expect(filter.list().length).to.equal(frenchBadwords.length)
  });
});
