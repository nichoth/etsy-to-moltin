require('dotenv').config();
var fs = require('fs');
var csv = require('csv-parser');
var client = require('moltin-util')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

var opts = require('./product-opts.json');
var uploader = require('../');

client.request(client.endpoints.CATEGORIES)
  .then(resp => resp.result)
  .then(categories => {

    fs.createReadStream(__dirname+'/one-product.csv')
      .pipe(csv())
      .pipe(uploader(client, mapFn.bind(null, categories), done))

  })
  .catch(err => console.log('err', err));
;

function mapFn(categories, etsyProduct) {
  return {
    tax_band: opts.tax_band,
    category: uploader.findCategory(etsyProduct, categories)
  };
}

function done(err, res) {
  if (err) return console.log('error', err, err.response.body);
  console.log('created ' + res.length + ' products');
}
