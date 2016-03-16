#!/usr/bin/env node
require('dotenv').config();
var csv = require('csv-parser');
var xtend = require('xtend');
var fs = require('fs');
var args = require('meow')(`
  Use
    $ etsy-to-moltin <input.csv> [options]

  Options
    Pass anything to the Moltin API.

  Example
    $ etsy-to-moltin etsyProducts.csv --tax_band=123

`, {
  string: ['tax_band', 'category']  // don't use numbers b/c they're too big
});

var util = require('moltin-util')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

var values = args.flags;

var moltinUploader = require('../');

util.request(util.endpoints.CATEGORIES)
  .then(resp => resp.result)
  .then(cats => doIt(cats))
  .catch(err => console.log(err, err.response.body))
;

function doIt(categories) {
  var stream = moltinUploader(util, mapper.bind(null, values, categories), done);
  fs.createReadStream(args.input[0])
    .pipe(csv())
    .pipe(stream)
    .on('error', done)
  ;
}

function mapper(values, categories, etsyProduct) {
  return {
    category: moltinUploader.findCategory(etsyProduct, categories),
    tax_band: values.tax_band
  };
}

function done(err, res) {
  if (err) return console.log('error', err, err.response.body);
  console.log('All done. Created ' + res.length + ' products.');
}
