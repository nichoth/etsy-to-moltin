require('dotenv').config();
var after = require('after');
var Moltin = require('moltin');
var m = new Moltin({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

m.Authenticate(() => {

  function deleteSomeProducts() {
    m.Product.List(null, function(prods) {
      if (prods.length === 0) return;
      var next = after(prods.length, deleteSomeProducts);
      prods.forEach(p => {
        m.Product.Delete(p.id, function(resp) {
          next(null, resp);
        }, console.log.bind(console, 'error'));
      });
    }, function(err) {
      console.log('err', arguments);
    });
  }

  deleteSomeProducts();

});
