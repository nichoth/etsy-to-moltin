var csv = require('csv-parser');
var client = require('moltin-util')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

var uploader = require('etsy-to-moltin');

client.request(client.endpoints.CATEGORIES)
  .then(resp => resp.result)
  .then(categories => {

    fs.createReadStream('file.csv')
      .pipe(csv())
      .pipe(uploader(client, mapFn.bind(null, categories), done)

  })
;

function mapFn(categories, etsyProduct) {
  return {
    tax_band: '123',
    category: uploader.findCategory(categories, etsyProduct)
  };
}

function done(err, res) {
  console.log('created ' + res.length + ' products');
}
