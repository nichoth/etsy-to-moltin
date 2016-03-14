require('dotenv').config();
var csv = require('csv-parser');
var jsonStream = require('JSONStream');
var pick = require('lodash.pick');
var slugify = require('slug');
var fs = require('fs');
var map = require('map-stream');
var wrap = require('node-cb');
var xtend = require('xtend');
var mapKeys = require('lodash.mapkeys');
var Moltin = require('moltin');

function moltinUploader(moltin) {

  var moltinUploadStream = map(function(prod, next) {
    var create = wrap(moltin.Product.Create.bind(moltin.Product));
    create(prod, next);
  });

  return moltinUploadStream;
}

var etsyToMoltin = function(cats) {
  return map(function(p, next) {
    var keep = [
      'title',
      'price',
      'description',
      'price'
    ];

    var mProd = xtend(pick(p, keep), {
      slug: slugify(p.title).toLowerCase(),
      sku: slugify(p.title).toLowerCase(),
      status: 1,
      category: getCategory(p, cats),
      stock_level: p.quantity,
      stock_status: 1,
      requires_shipping: 1,
      catalog_only: 0,
      images: '...'
    });

    next(null, mProd);
  });

  function getCategory(prod, cats) {
    var catSlugs = ['rings', 'earrings', 'necklaces'];
    var cat = catSlugs.find(c => {
      return prod.tags.split(',').map(t => t.toLowerCase()).find(t => {
        return c.indexOf(t) > -1;
      });
    });
    return cat ? cats[cat].id : cats['uncategorized'].id
  }
}

var m = new Moltin({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

m.Authenticate(function(auth) {

  var listCats = wrap(m.Category.List.bind(m.Category));

  listCats(null, function(err, cats) {

    if (err) return console.log(err);
    var cs = cats.reduce( (acc, c) => {
      acc[c.slug] = c;
      return acc;
    }, {})

    uploadProducts(cs);
  });

  function uploadProducts(cats) {
    fs.createReadStream('./etsy.csv')
      .pipe(csv())
      // lowercase keys
      .pipe(map( (d, n) => n(null, mapKeys(d, (v,k) => k.toLowerCase()) )))
      .pipe(etsyToMoltin(cats))
      //.pipe(moltinUploader(moltin))
      .pipe(jsonStream.stringify())
      .pipe(process.stdout)
    ;
  }

});
