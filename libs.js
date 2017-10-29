const crypto = require('crypto-browserify');
const algorithm = 'aes-256-ctr';

window.encrypt = function(text, password){
    const cipher = crypto.createCipher(algorithm,password);
    let crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};

window.decrypt = function(text, password){
    const decipher = crypto.createDecipher(algorithm,password);
    let dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
};
