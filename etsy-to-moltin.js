var pick = require('lodash.pick');
var mapKeys = require('lodash.mapkeys');
var slugify = require('slug');
var map = require('map-stream');
var xtend = require('xtend');

module.exports = etsyToMoltin;

// categories = [ {} ]
// opts = anything to send to moltin in the create product request
// => readable stream that emits `{ product: {}, images: ['http://...'] }`
function etsyToMoltin(categories, opts) {

  // map from category slug to category
  categories = categories.reduce( (acc, c) => {
    acc[c.slug] = c;
    return acc;
  }, {});

  return map(function(etsyProd, next) {

    etsyProd = mapKeys(etsyProd, (v, k) => k.toLowerCase());

    var moltinProduct = pick(etsyProd, [
      'title',
      'price',
      'description'
    ]);

    moltinProduct = xtend(moltinProduct, {
      slug: slugify(etsyProd.title).toLowerCase(),
      sku: slugify(etsyProd.title).toLowerCase(),
      status: 1,
      category: getCategory(etsyProd, categories),
      stock_level: etsyProd.quantity,
      stock_status: 1,
      requires_shipping: 1,
      catalog_only: 0,
      tax_band: ''
    }, opts);

    var images = (function(etsyProd) {
      var imgs = [];
      for (var i = 1; i <= 5; i++) {
        if (!etsyProd['image'+i]) break;
        imgs.push(etsyProd['image'+i]);
      }
      return imgs;
    })(etsyProd);

    next(null, { product: moltinProduct, images: images });
  });

}

// => id for category that matches an etsy tag
function getCategory(etsyProd, cats) {
  var catSlugs = Object.keys(cats);
  var cat = catSlugs.find(c => {
    return etsyProd.tags.split(',').map(t => t.toLowerCase()).find(t => {
      return c.indexOf(t) > -1;
    });
  });
  return cat ? cats[cat].id : cats.uncategorized.id;
}
