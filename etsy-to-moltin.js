var pick = require('lodash.pick');
var mapKeys = require('lodash.mapkeys');
var slugify = require('slug');
var map = require('map-stream');
var xtend = require('xtend');

module.exports = etsyToMoltin;



// mapper = ({}) => {}
// take etsy product and return moltin product. The only required fields are:
// {
//   category: 'id',
//   tax_band: 'id'
// }
function etsyToMoltin(mapper) {

  var stream = map(function(etsyProd, next) {

    etsyProd = mapKeys(etsyProd, (v, k) => k.toLowerCase());

    var moltinProductDefaults = pick(etsyProd, [
      'title',
      'price',
      'description'
    ]);

    moltinProductDefaults = xtend(moltinProductDefaults, {
      slug: slugify(etsyProd.title).toLowerCase(),
      sku: slugify(etsyProd.title).toLowerCase(),
      status: 1,
      stock_level: etsyProd.quantity,
      stock_status: 1,
      requires_shipping: 1,
      catalog_only: 0
    });

    var moltinProduct = xtend(moltinProductDefaults, mapper(etsyProd));

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

  return stream;

}


function catsBySlug(cats) {
  return cats.reduce( (acc, c) => {
    acc[c.slug] = c;
    return acc;
  }, {});
}

// => id for category that matches an etsy tag
function findCategory(etsyProd, cats) {
  var cs = catsBySlug(cats);
  var catSlugs = Object.keys(cs);
  var cat = catSlugs.find(c => {
    return etsyProd.tags.split(',').map(t => t.toLowerCase()).find(t => {
      return c.indexOf(t) > -1;
    });
  });
  return cat ? cs[cat].id : cs.uncategorized.id;
}

etsyToMoltin.findCategory = findCategory;
