var throat = require('throat');
var concat = require('concat-stream');
var etsyToMoltin = require('./lib/etsy-to-moltin');
var Emitter = require('events').EventEmitter;
var bus = new Emitter();

module.exports = moltinUploader;

function moltinUploader(util, opts, done) {

  if (typeof opts === 'function') {
    done = opts;
    opts = {
      log: false
    };
  }

  var stream = concat(gotProducts);

  function gotProducts(rows) {

    // limit concurrency
    Promise.all(rows.map(throat(5, r => {
      return Promise.all(r.images.map(img => util.fetchImage(img)))
        .then(imgs => Promise.all(imgs.map(img => util.resize(600, img))))
        .then(imgs => util.createProduct(r.product, imgs))
        .then(prod => {
          if (opts.log) console.log('product uploaded');
          return prod;
        })
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
