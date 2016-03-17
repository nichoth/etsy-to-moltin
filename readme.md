# etsy to moltin

Take product data from etsy and put it into moltin. Automatically creates images from URLs if they are included in the Etsy csv file.


## example

Create products from a csv file.

```js
require('dotenv').config();
var fs = require('fs');
var csv = require('csv-parser');
var client = require('moltin-util')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

var uploader = require('etsy-to-moltin');

client.request(client.endpoints.CATEGORIES)
  .then(resp => resp.result)
  .then(categories => {

    fs.createReadStream(__dirname+'/etsy-products.csv')
      .pipe(csv())
      // take etsy product and return { product: {}, images: [] }
      .pipe(uploader.mapStream(mapFn.bind(null, categories)))
      .pipe(uploader(client, done))
    ;

  })
  .catch(err => console.log('err', err));
;

// take an etsy product and return data for the moltin product.
// Everything except `category` and `tax_band` has a default.
function mapFn(categories, etsyProduct) {
  return {
    tax_band: opts.tax_band,

    // convenience function that returns the first category that
    // matches one of the etsy product's tags
    category: uploader.findCategory(etsyProduct, categories)
  };
}

function done(err, res) {
  if (err) return console.log('error', err, err.response.body);
  console.log('created ' + res.length + ' products');
}
```
