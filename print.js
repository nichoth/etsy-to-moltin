var csv = require('csv-parser');
var fs = require('fs');

fs.createReadStream('etsy.csv')
  .pipe(csv())
  .on('data', console.log.bind(console))
