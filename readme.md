# etsy to moltin

Take product data from etsy and put it into moltin. Automatically creates images from URLs if they are included in the Etsy csv file.


## example

```js
var csv = require('csv-parser');
var client = require('moltin-util')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

var uploader = require('etsy-to-moltin');

client.request(client.endpoints.CATEGORIES)
  .then(resp => resp.result)
  .then(categories => {

    fs.createReadStream('file.csv')
      .pipe(csv())
      .pipe(uploader(client, mapFn.bind(null, categories), done)
    ;

  })
;

// take an etsy product and return data for the moltin product.
// Everything except `category` and `tax_band` has a default.
function mapFn(categories, etsyProduct) {
  return {
    tax_band: '123',
    // convenience function that returns the first category that
    // matches one of the etsy product's tags
    category: uploader.findCategory(categories, etsyProduct)
  };
}

function done(err, res) {
  console.log('created ' + res.length + ' products');
}
```
