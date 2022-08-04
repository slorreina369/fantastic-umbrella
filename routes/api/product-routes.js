const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const sequelize = require('../../config/connection');
const { Model } = require('sequelize');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // be sure to include its associated Tag data
  Product.findAll({
    attributes:[
      'id',
      'product_name',
      'price',
      'stock',
      'category_id'
    ],
    include:[
      {
        model:Category,
        attributes:['id','category_name']
      },
      {
        model:Tag,
        as: 'tags',
        attributes:['id', 'tag_name']
      }
    ]
  })
  .then(dbProductData => res.json(dbProductData))
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  })
});

router.get('/:id', (req, res) => {
  // be sure to include its associated Tag data
  Product.findOne({
    where:{
      id:req.params.id
    },
    attributes:[
      'id',
      'product_name',
      'price',
      'stock',
      'category_id'
    ],
    include:[
      {
        model:Category,
        attributes:['id', 'category_name']
      },
      {
        model:Tag,
        as: 'tags'
      }
    ]
  })
  .then(dbProductData =>{
    if(!dbProductData){
      res.status(400).json({message:'Product not found!'});
      return;
    }
    res.json(dbProductData);
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  })
});

router.post('/', (req, res) => {
  Product.create({
    product_name:req.body.product_name,
    price:req.body.price,
    stock:req.body.stock,
    category_id:req.body.category_id,
    tagIds:req.body.tagIds
  })
  .then((product) => {
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    res.status(200).json(product);
  })
  .then((productTagIds) => res.status(200).json(productTagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      console.log(req.body);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Product.destroy({
    where:{
      id:req.params.id
    }
  })
  .then(dbProductData =>{
    if(!dbProductData){
      res.status(404).json({message:'No product found with this id'});
      return;
    }
    res.json(dbProductData);
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  })
});

module.exports = router;
