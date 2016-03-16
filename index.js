require('dotenv').config();
var fs = require('fs');
var throat = require('throat');
var concat = require('concat-stream');
var eToM = require('./etsy-to-moltin');
var csv = require('csv-parser');
var map = require('map-stream');

var logStream = map((d,n) => { console.log(d); n(null, d); });

module.exports = function(util, file) {

  return function uploadProduct(categories, productOpts, done) {
    return fs.createReadStream(file)
      .pipe(csv())
      .pipe(eToM(categories, productOpts))
      .pipe(concat(function gotData(rows) {
        // Promise.all(rows[0].images.map(img => util.fetchImage(img)))
        //   .then(imgs => {
        //     return Promise.all(imgs.map(img => util.resize(600, img)))
        //   })
        //   .then(imgs => {
        //     return util.createProduct(rows[0].product, imgs);
        //   })
        //   .then(product => {
        //     done(null, product);
        //   })
        //   .catch(err => done(err));
        // ;

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

        // async.series(rows.map(r => uploadProduct.bind(null, m, r)),
        //   function allDone(err, res) {
        //     console.log('all done', arguments);
        //   }
        // );
      }))
    ;
  };

};


// function uploadProducts(m, cats) {
//   fs.createReadStream('./4-rows.csv')
//     .pipe(csv())
//     .pipe(eToM(cats, { tax_band: '1202285736968061337' }))
//     .pipe(concat(function gotData(rows) {
//       async.series(rows.map(r => uploadProduct.bind(null, m, r)),
//         function allDone(err, res) {
//           console.log('all done', arguments);
//         }
//       );
//     }))
//     .on('error', console.log.bind(console, 'errrr'))
//   ;
// }
//
// function uploadProduct(moltin, data, next) {
//   moltin.Product.Create(data.product, function(resp) {
//     createImages(resp, data.images, next)
//   }, function(err) {
//     console.log('error', arguments);
//     next(err);
//   });
// }
//
// function createImages(product, images, done) {
//   return Promise.all(images.map((url, i) => {
//     return util.fetchImage(url)
//       .then(util.resize.bind(util, 600))
//       .then(util.createImage.bind(util, {
//         name: product.slug+i,
//         assign_to: product.id
//       }))
//   }))
//     .then(done.bind(null, null))
//     .catch(done.bind(null))
//   ;
// }

