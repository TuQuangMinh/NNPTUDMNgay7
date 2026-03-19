var express = require('express');
var router = express.Router();

let inventoryModel = require('../schemas/inventory');

// GET all inventories (with product join)
router.get('/', async function (req, res, next) {
  try {
    let data = await inventoryModel.find().populate({
      path: 'product'
    });
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET inventory by id (with product join)
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await inventoryModel.findById(id).populate({
      path: 'product'
    });
    if (!result) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Increase stock
router.post('/add_stock', async function (req, res) {
  try {
    let { product, quantity } = req.body;
    if (!product || quantity == null) {
      return res.status(400).send({ message: 'product and quantity are required' });
    }
    quantity = Number(quantity);
    if (quantity <= 0) {
      return res.status(400).send({ message: 'quantity must be a positive number' });
    }

    let inventory = await inventoryModel.findOne({ product });
    if (!inventory) {
      return res.status(404).send({ message: 'Inventory for product not found' });
    }

    inventory.stock += quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Decrease stock
router.post('/remove_stock', async function (req, res) {
  try {
    let { product, quantity } = req.body;
    if (!product || quantity == null) {
      return res.status(400).send({ message: 'product and quantity are required' });
    }
    quantity = Number(quantity);
    if (quantity <= 0) {
      return res.status(400).send({ message: 'quantity must be a positive number' });
    }

    let inventory = await inventoryModel.findOne({ product });
    if (!inventory) {
      return res.status(404).send({ message: 'Inventory for product not found' });
    }

    if (inventory.stock < quantity) {
      return res.status(400).send({ message: 'Not enough stock to remove' });
    }

    inventory.stock -= quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Reservation: reduce stock and increase reserved
router.post('/reservation', async function (req, res) {
  try {
    let { product, quantity } = req.body;
    if (!product || quantity == null) {
      return res.status(400).send({ message: 'product and quantity are required' });
    }
    quantity = Number(quantity);
    if (quantity <= 0) {
      return res.status(400).send({ message: 'quantity must be a positive number' });
    }

    let inventory = await inventoryModel.findOne({ product });
    if (!inventory) {
      return res.status(404).send({ message: 'Inventory for product not found' });
    }

    if (inventory.stock < quantity) {
      return res.status(400).send({ message: 'Not enough stock to reserve' });
    }

    inventory.stock -= quantity;
    inventory.reserved += quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Sold: reduce reserved and increase soldCount
router.post('/sold', async function (req, res) {
  try {
    let { product, quantity } = req.body;
    if (!product || quantity == null) {
      return res.status(400).send({ message: 'product and quantity are required' });
    }
    quantity = Number(quantity);
    if (quantity <= 0) {
      return res.status(400).send({ message: 'quantity must be a positive number' });
    }

    let inventory = await inventoryModel.findOne({ product });
    if (!inventory) {
      return res.status(404).send({ message: 'Inventory for product not found' });
    }

    if (inventory.reserved < quantity) {
      return res.status(400).send({ message: 'Not enough reserved items to mark as sold' });
    }

    inventory.reserved -= quantity;
    inventory.soldCount += quantity;
    await inventory.save();
    res.send(inventory);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
