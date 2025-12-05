const express = require('express');
const productcatgRoute = express.Router(); 
var ProductCatg = require('./productcatg.model');
//save product category
productcatgRoute.route
('/addproductcatg/:pcatgid/:pcatgname').  
post(function (req, res) {   
   var productcatg=new ProductCatg({pcatgid:req.params.pcatgid,pcatgname:req.params.pcatgname});      
  productcatg.save().then(productcatg => { 
      res.send('product category added successfully');
      res.end();
    }).catch(err => {
    res.send(err);
    res.end();
    }); 
});
//show all product category
productcatgRoute.route
('/showproductcatg').
get(function (req, res) {        
  ProductCatg.find()
    .then(productcatg => {      
      res.send(productcatg);
      res.end();
    })
    .catch(err => {
    res.send("Data not found something went wrong");
    res.end();
    });
});
//update product catg
productcatgRoute.route
('/updateproductcatg/:pcatgid/:pcatgname').  
put(function (req, res) {   
    ProductCatg.updateOne({"pcatgid":req.params.pcatgid},{"pcatgname":req.params.pcatgname}).then(productcatg => { 
      res.send('product category added successfully');
      res.end();
    }).catch(err => {
    res.send(err);
    res.end();
    }); 
});
module.exports = productcatgRoute;












