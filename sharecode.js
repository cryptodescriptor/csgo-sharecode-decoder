BigNumber.config({
  DECIMAL_PLACES: 43,
  EXPONENTIAL_AT: 50
});

function consume(bytes) {
  var ret = this.code_decoded.slice(0, bytes);
  this.code_decoded = this.code_decoded.slice(ret.length);
  return ret;
}

function ByteReader(code_decoded) {
  this.code_decoded = code_decoded;

  this.read_int64 = function() {
    var temp = consume.call(this, 8);
    var unpacked = unpack("C*", temp);
    var result = new BigNumber(0);
    Object.keys(unpacked).forEach(function(key) {
      var index = key - 1;
      var byte = unpacked[key];

      var a = new BigNumber(256).exponentiatedBy(new BigNumber(index));
      var b = new BigNumber(byte).times(a);

      result = result.plus(b)
    });
    return result.toString();
  }

  this.read_short = function() {
    var temp = consume.call(this, 2);
    var unpacked = unpack("S*", temp);
    return unpacked[''].toString();
  }
}

function SharecodeDecoder(code) {
  this.originalCode = code;

  this.sanitize_code = function() {
    return this.originalCode.replace(/CSGO|\-/g, '');
  }

  this.code = this.sanitize_code(code);
  this.DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";
  this.DICTIONARY_LENGTH = this.DICTIONARY.length

  this.decoded_code = function() {
    var result = new Array(18).fill(0);
    var reversed = this.code.split('').reverse();
    var self = this;
    reversed.forEach(function(char, index) {
      var addval = self.DICTIONARY.indexOf(char);
      var tmp = new Array(18).fill(0);
      var carry = 0;
      var v = 0;
      for(var t = 17; t >= 0; t--) {
        carry = 0;
        for(var s = t; s >= 0; s--) {
          if(t - s == 0) {
            v = tmp[s] + result[t] * 57;
          }else {
            v = 0;
          }
          v = v + carry;
          carry = v >> 8;
          tmp[s] = v & 0xFF;
        }
      }
      result = tmp;
      carry = 0;

      for(var t = 17; t >= 0; t--) {
        if(t == 17) {
          v = result[t] + addval;
        }else {
          v = result[t];
        }
        v = v + carry;
        carry = v >> 8;
        result[t] = v & 0xFF;
      }
    });

    result.unshift('C*');
    return pack.apply(this, result); 
  }

  this.decode = function() {
    var code_decoded = this.decoded_code();
    var reader    = new ByteReader(code_decoded);
    var matchId   = reader.read_int64();
    var outcomeId = reader.read_int64();
    var tokenId   = reader.read_short();

    return {
      matchId: matchId,
      outcomeId: outcomeId,
      tokenId: tokenId
    };
  }
}
