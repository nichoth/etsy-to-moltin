var throat = require('throat');
var concat = require('concat-stream');
var etsyToMoltin = require('./lib/etsy-to-moltin');

module.exports = moltinUploader;

function moltinUploader(util, done) {

  var stream = concat(gotProducts);

  function gotProducts(rows) {

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
  }

  return stream;
//   return etmStream;
}

moltinUploader.findCategory = etsyToMoltin.findCategory;
moltinUploader.mapStream = etsyToMoltin;
