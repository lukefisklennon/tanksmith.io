var wordDictionary = [];
var words = ["YWhvbGU=","YW51cw==","YXNoMGxl","YXNoMGxlcw==","YXNob2xlcw==","YXNz","QXNzIE1vbmtleQ==","QXNzZmFjZQ==","YXNzaDBsZQ==","YXNzaDBsZXo=","YXNzaG9sZQ==","YXNzaG9sZXM=","YXNzaG9seg==","YXNzd2lwZQ==","YXp6aG9sZQ==","YmFzc3RlcmRz","YmFzdGFyZA==","YmFzdGFyZHM=","YmFzdGFyZHo=","YmFzdGVyZHM=","YmFzdGVyZHo=","QmlhdGNo","Yml0Y2g=","Yml0Y2hlcw==","QmxvdyBKb2I=","Ym9mZmluZw==","YnV0dGhvbGU=","YnV0dHdpcGU=","YzBjaw==","YzBja3M=","YzBr","Q2FycGV0IE11bmNoZXI=","Y2F3aw==","Y2F3a3M=","Q2xpdA==","Y250cw==","Y250eg==","Y29jaw==","Y29ja2hlYWQ=","Y29jay1oZWFk","Y29ja3M=","Q29ja1N1Y2tlcg==","Y29jay1zdWNrZXI=","Y3JhcA==","Y3Vt","Y3VudA==","Y3VudHM=","Y3VudHo=","ZGljaw==","ZGlsZDA=","ZGlsZDBz","ZGlsZG8=","ZGlsZG9z","ZGlsbGQw","ZGlsbGQwcw==","ZG9taW5hdHJpY2tz","ZG9taW5hdHJpY3M=","ZG9taW5hdHJpeA==","ZHlrZQ==","ZW5lbWE=","ZiB1IGMgaw==","ZiB1IGMgayBlIHI=","ZmFn","ZmFnMXQ=","ZmFnZXQ=","ZmFnZzF0","ZmFnZ2l0","ZmFnZ290","ZmFnaXQ=","ZmFncw==","ZmFneg==","ZmFpZw==","ZmFpZ3M=","ZmFydA==","ZmxpcHBpbmcgdGhlIGJpcmQ=","ZnVjaw==","ZnVja2Vy","ZnVja2lu","ZnVja2luZw==","ZnVja3M=","RnVkZ2UgUGFja2Vy","ZnVr","RnVrYWg=","RnVrZW4=","ZnVrZXI=","RnVraW4=","RnVraw==","RnVra2Fo","RnVra2Vu","RnVra2Vy","RnVra2lu","ZzAwaw==","Z2F5","Z2F5Ym95","Z2F5Z2lybA==","Z2F5cw==","Z2F5eg==","R29kLWRhbW5lZA==","aDAwcg==","aDBhcg==","aDByZQ==","aGVsbHM=","aG9hcg==","aG9vcg==","aG9vcmU=","amFja29mZg==","amFw","amFwcw==","amVyay1vZmY=","amlzaW0=","amlzcw==","aml6bQ==","aml6eg==","a25vYg==","a25vYnM=","a25vYno=","a3VudA==","a3VudHM=","a3VudHo=","TGVzYmlhbg==","TGV6emlhbg==","TGlwc2hpdHM=","TGlwc2hpdHo=","bWFzb2NoaXN0","bWFzb2tpc3Q=","bWFzc3RlcmJhaXQ=","bWFzc3RyYmFpdA==","bWFzc3RyYmF0ZQ==","bWFzdGVyYmFpdGVy","bWFzdGVyYmF0ZQ==","bWFzdGVyYmF0ZXM=","TW90aGEgRnVja2Vy","TW90aGEgRnVrZXI=","TW90aGEgRnVra2Fo","TW90aGEgRnVra2Vy","TW90aGVyIEZ1Y2tlcg==","TW90aGVyIEZ1a2Fo","TW90aGVyIEZ1a2Vy","TW90aGVyIEZ1a2thaA==","TW90aGVyIEZ1a2tlcg==","bW90aGVyLWZ1Y2tlcg==","TXV0aGEgRnVja2Vy","TXV0aGEgRnVrYWg=","TXV0aGEgRnVrZXI=","TXV0aGEgRnVra2Fo","TXV0aGEgRnVra2Vy","bjFncg==","bmFzdHQ=","bmlnZ2VyOw==","bmlndXI7","bmlpZ2VyOw==","bmlpZ3I7","b3JhZmlz","b3JnYXNpbTs=","b3JnYXNt","b3JnYXN1bQ==","b3JpZmFjZQ==","b3JpZmljZQ==","b3JpZmlzcw==","cGFja2k=","cGFja2ll","cGFja3k=","cGFraQ==","cGFraWU=","cGFreQ==","cGVja2Vy","cGVlZW51cw==","cGVlZW51c3Nz","cGVlbnVz","cGVpbnVz","cGVuMXM=","cGVuYXM=","cGVuaXM=","cGVuaXMtYnJlYXRo","cGVudXM=","cGVudXVz","UGh1Yw==","UGh1Y2s=","UGh1aw==","UGh1a2Vy","UGh1a2tlcg==","cG9sYWM=","cG9sYWNr","cG9sYWs=","UG9vbmFuaQ==","cHIxYw==","cHIxY2s=","cHIxaw==","cHVzc2U=","cHVzc2Vl","cHVzc3k=","cHV1a2U=","cHV1a2Vy","cXVlZXI=","cXVlZXJz","cXVlZXJ6","cXdlZXJz","cXdlZXJ6","cXdlaXI=","cmVja3R1bQ==","cmVjdHVt","cmV0YXJk","c2FkaXN0","c2Nhbms=","c2NobG9uZw==","c2NyZXdpbmc=","c2VtZW4=","c2V4","c2V4eQ==","U2ghdA==","c2gxdA==","c2gxdGVy","c2gxdHM=","c2gxdHRlcg==","c2gxdHo=","c2hpdA==","c2hpdHM=","c2hpdHRlcg==","U2hpdHR5","U2hpdHk=","c2hpdHo=","U2h5dA==","U2h5dGU=","U2h5dHR5","U2h5dHk=","c2thbmNr","c2thbms=","c2thbmtlZQ==","c2thbmtleQ==","c2thbmtz","U2thbmt5","c2xhZw==","c2x1dA==","c2x1dHM=","U2x1dHR5","c2x1dHo=","c29uLW9mLWEtYml0Y2g=","dGl0","dHVyZA==","dmExamluYQ==","dmFnMW5h","dmFnaWluYQ==","dmFnaW5h","dmFqMW5h","dmFqaW5h","dnVsbHZh","dnVsdmE=","dzBw","d2gwMHI=","d2gwcmU=","d2hvcmU=","eHJhdGVk","eHh4","YiErY2g=","Yml0Y2g=","Ymxvd2pvYg==","Y2xpdA==","YXJzY2hsb2No","ZnVjaw==","c2hpdA==","YXNz","YXNzaG9sZQ==","YiF0Y2g=","YjE3Y2g=","YjF0Y2g=","YmFzdGFyZA==","YmkrY2g=","Ym9pb2xhcw==","YnVjZXRh","YzBjaw==","Y2F3aw==","Y2hpbms=","Y2lwYQ==","Y2xpdHM=","Y29jaw==","Y3Vt","Y3VudA==","ZGlsZG8=","ZGlyc2E=","ZWpha3VsYXRl","ZmF0YXNz","ZmN1aw==","ZnVr","ZnV4MHI=","aG9lcg==","aG9yZQ==","amlzbQ==","a2F3aw==","bDNpdGNo","bDNpK2No","bGVzYmlhbg==","bWFzdHVyYmF0ZQ==","bWFzdGVyYmF0Kg==","bWFzdGVyYmF0Mw==","bW90aGVyZnVja2Vy","cy5vLmIu","bW9mbw==","bmF6aQ==","bmlnZ2E=","bmlnZ2Vy","bnV0c2Fjaw==","cGh1Y2s=","cGltcGlz","cHVzc2U=","cHVzc3k=","c2Nyb3R1bQ==","c2ghdA==","c2hlbWFsZQ==","c2hpKw==","c2ghKw==","c2x1dA==","c211dA==","dGVldHM=","dGl0cw==","Ym9vYnM=","YjAwYnM=","dGVleg==","dGVzdGljYWw=","dGVzdGljbGU=","dGl0dA==","dzAwc2U=","amFja29mZg==","d2Fuaw==","d2hvYXI=","d2hvcmU=","KmRhbW4=","KmR5a2U=","KmZ1Y2sq","KnNoaXQq","QCQk","YW1jaWs=","YW5kc2tvdGE=","YXJzZSo=","YXNzcmFtbWVy","YXlpcg==","Ymk3Y2g=","Yml0Y2gq","Ym9sbG9jayo=","YnJlYXN0cw==","YnV0dC1waXJhdGU=","Y2Ficm9u","Y2F6em8=","Y2hyYWE=","Y2h1ag==","Q29jayo=","Y3VudCo=","ZDRtbg==","ZGF5Z28=","ZGVnbw==","ZGljayo=","ZGlrZSo=","ZHVwYQ==","ZHppd2th","ZWphY2t1bGF0ZQ==","RWtyZW0q","RWt0bw==","ZW5jdWxlcg==","ZmFlbg==","ZmFnKg==","ZmFuY3Vsbw==","ZmFubnk=","ZmVjZXM=","ZmVn","RmVsY2hlcg==","Zmlja2Vu","Zml0dCo=","Rmxpa2tlcg==","Zm9yZXNraW4=","Rm90emU=","RnUoKg==","ZnVrKg==","ZnV0a3JldHpu","Z2F5","Z29vaw==","Z3VpZW5h","aDBy","aDR4MHI=","aGVsbA==","aGVsdmV0ZQ==","aG9lcio=","aG9ua2V5","SHVldm9u","aHVp","aW5qdW4=","aml6eg==","a2Fua2VyKg==","a2lrZQ==","a2xvb3R6YWs=","a3JhdXQ=","a251bGxl","a3Vr","a3Vrc3VnZXI=","S3VyYWM=","a3Vyd2E=","a3VzaSo=","a3lycGEq","bGVzYm8=","bWFtaG9vbg==","bWFzdHVyYmF0Kg==","bWVyZCo=","bWlidW4=","bW9ua2xlaWdo","bW91bGlld29w","bXVpZQ==","bXVsa2t1","bXVzY2hp","bmF6aXM=","bmVwZXNhdXJpbw==","bmlnZ2VyKg==","b3Jvc3B1","cGFza2Eq","cGVyc2U=","cGlja2E=","cGllcmRvbCo=","cGlsbHUq","cGltbWVs","cGlzcyo=","cGl6ZGE=","cG9vbnRzZWU=","cG9vcA==","cG9ybg==","cDBybg==","cHIwbg==","cHJldGVlbg==","cHVsYQ==","cHVsZQ==","cHV0YQ==","cHV0bw==","cWFoYmVo","cXVlZWYq","cmF1dGVuYmVyZw==","c2NoYWZmZXI=","c2NoZWlzcyo=","c2NobGFtcGU=","c2NobXVjaw==","c2NyZXc=","c2ghdCo=","c2hhcm11dGE=","c2hhcm11dGU=","c2hpcGFs","c2hpeg==","c2tyaWJ6","c2t1cnd5c3lu","c3BoZW5jdGVy","c3BpYw==","c3BpZXJkYWxhag==","c3Bsb29nZQ==","c3VrYQ==","YjAwYio=","dGVzdGljbGUq","dGl0dCo=","dHdhdA==","dml0dHU=","d2Fuayo=","d2V0YmFjayo=","d2ljaHNlcg==","d29wKg==","eWVk","emFib3VyYWg="];

for (var i = 0; i < words.length; i++) {
	words[i] = atob (words[i]);
}

/**
 * LeoProfanity
 */
var profanityFilter = {

  /**
   * Remove word from the list
   * (private)
   *
   * @param {string} str
   */
  removeWord: function(str) {
    var index = words.indexOf(str);

    if (index !== -1) {
      words.splice(index, 1);
    }

    return this;
  },

  /**
   * Add word into the list
   * (private)
   *
   * @param {string} str
   */
  addWord: function(str) {
    if (words.indexOf(str) === -1) {
      words.push(str);
    }

    return this;
  },

  /**
   * Return replacement word from key
   * (private)
   *
   * @example
   * getReplacementWord('*', 3)
   * return '***'
   *
   * @example
   * getReplacementWord('-', 4)
   * return '----'
   *
   * @param {string} key
   * @param {number} n
   * @returns string
   */
  getReplacementWord: function(key, n) {
    var i = 0;
    var replacementWord = '';

    for (i = 0; i < n; i++) {
      replacementWord += key;
    }

    return replacementWord;
  },

  /**
   * Sanitize string for this project
   * 1. Convert to lower case
   * 2. Replace comma and dot with space
   * (private)
   *
   * @param {string} str
   * @returns {string}
   */
  sanitize: function(str) {
    str = str.toLowerCase();
    /* eslint-disable */
    str = str.replace(/\.|,/g, ' ');

    return str;
  },

  /**
   * Return current profanity words
   *
   * @returns {Array.string}
   */
  list: function() {
    return words;
  },

  /**
   * Check the string contain profanity words or not
   * Approach, to make it fast ASAP
   *
   * @see http://stackoverflow.com/questions/26425637/javascript-split-string-with-white-space
   * @see http://stackoverflow.com/questions/6116474/how-to-find-if-an-array-contains-a-specific-string-in-javascript-jquery
   * @see http://stackoverflow.com/questions/9141951/splitting-string-by-whitespace-without-empty-elements
   *
   * @param {string} str
   * @returns {boolean}
   */
  check: function(str) {
    if (!str) return false;

    var i = 0;
    var isFound = false;

    str = this.sanitize(str);
    // convert into array and remove white space
    strs = str.match(/[^ ]+/g);
    while (!isFound && i <= words.length - 1) {
      if (strs.includes(words[i])) isFound = true;
      i++;
    }

    return isFound;
  },

  /**
   * Replace profanity words
   *
   * @todo improve algorithm
   * @see http://stackoverflow.com/questions/26425637/javascript-split-string-with-white-space
   *
   * @param {string} str
   * @param {string} [replaceKey=*] one character only
   * @returns {string}
   */
  clean: function(str, replaceKey) {
    if (!str) return '';
    if (typeof replaceKey === 'undefined') replaceKey = '*';

    var self = this;
    var originalString = str;
    var result = str;

    var sanitizedStr = this.sanitize(originalString);
    // split by whitespace (keep delimiter)
    // (cause comma and dot already replaced by whitespace)
    var sanitizedArr = sanitizedStr.split(/(\s)/);
    // split by whitespace, comma and dot (keep delimiter)
    var resultArr = result.split(/(\s|,|\.)/);

    // loop through given string
    sanitizedArr.forEach(function(item, index) {
      if (words.includes(item)) {
        var replacementWord = self.getReplacementWord(replaceKey, item.length);
        resultArr[index] = replacementWord;
      }
    });

    // combine it
    result = resultArr.join('');

    return result;
  },

  /**
   * Add word to the list
   *
   * @param {string|Array.string} data
   */
  add: function(data) {
    var self = this;

    if (typeof data === 'string') {
      self.addWord(data);
    } else if (data.constructor === Array) {
      data.forEach(function(word) {
        self.addWord(word);
      });
    }

    return this;
  },

  /**
   * Remove word from the list
   *
   * @param {string|Array.string} data
   */
  remove: function(data) {
    var self = this;

    if (typeof data === 'string') {
      self.removeWord(data);
    } else if (data.constructor === Array) {
      data.forEach(function(word) {
        self.removeWord(word);
      });
    }

    return this;
  },

  /**
   * Reset word list by using en dictionary
   * (also remove word that manually add)
   */
  reset: function() {
    this.loadDictionary('en');
    return this;
  },

  /**
   * Clear word list
   */
  clearList: function() {
    words = [];

    return this;
  },

  /**
   * Return word list from dictionary
   *
   * @param {string} [name=en] dictionary name
   * @returns {Array.string}
   */
  getDictionary: function(name = 'en') {
    name = (name in wordDictionary) ? name : 'en';
    return wordDictionary[name]
  },

  /**
   * Load word list from dictionary to using in the filter
   *
   * @param {string} [name=en]
   */
  loadDictionary: function(name = 'en') {
    words = util.clone(this.getDictionary(name))
  },
};
