const fs = require('fs');

fs.writeFileSync('./public/libs.js', fs.readFileSync('./public/libs.js').toString().replace('Error.captureStackTrace(error, ctor);', ''));
