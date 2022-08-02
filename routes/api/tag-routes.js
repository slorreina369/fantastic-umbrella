const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');
const sequelize = require('../../config/connection');
const {Model} = require('sequelize');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // be sure to include its associated Product data
  Tag.findAll({
    attributes:[
      'id',
      'tag_name'
    ]
  })
  .then(dbTagData => res.json(dbTagData))
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  })
});

router.get('/:id', (req, res) => {
  // be sure to include its associated Product data
  Tag.findOne({
    where:{
      id:req.params.id
    },
    attributes:[
      'id',
      'tag_name'
    ]
  })
  .then(dbTagData =>{
    if(!dbTagData){
      res.status(400).json({message:'Product not found!'});
      return;
    }
    res.json(dbTagData);
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  })
});

router.post('/', (req, res) => {
  Tag.create({
    tag_name:req.body.tag_name
  })
  .then(dbTagData => res.json(dbTagData))
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  });
});

router.put('/:id', (req, res) => {
  Tag.update(req.body, {
    individualHooks:true,
    where:{
      id:req.params.id
    }
  })
  .then(dbTagData =>{
    if(!dbTagData){
      res.status(404).json({message:'Not Tag found with this id'});
      return;
    }
    res.json(dbTagData);
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where:{
      id:req.params.id
    }
  })
  .then(dbTagData => {
    if(!dbTagData){
      res.status(404).json({message:'No tag found with this id'});
      return;
    }
    res.json(dbTagData);
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
