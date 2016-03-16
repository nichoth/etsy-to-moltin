require('dotenv').config();
var fs = require('fs');
var throat = require('throat');
var concat = require('concat-stream');
var eToM = require('./etsy-to-moltin');
var csv = require('csv-parser');
var map = require('map-stream');

module.exports = function(util, file) {

  return function uploadProduct(categories, productOpts, done) {
    return fs.createReadStream(file)
      .pipe(csv())
      .pipe(eToM(categories, productOpts))
      .pipe(concat(function gotData(rows) {

        // limit concurrency
        Promise.all(rows.map(throat(5, r => {
          return Promise.all(r.images.map(img => util.fetchImage(img)))
            .then(imgs => Promise.all(imgs.map(img => util.resize(600, img))))
            .then(imgs => util.createProduct(r.product, imgs))
          ;
        })))
          .then(products => done(null, products))
          .catch(err => done(err));
        ;

      }))
    ;
  };

};

