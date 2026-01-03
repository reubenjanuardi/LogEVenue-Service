const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const transactionController = require('../controllers/transactionController');

// Items
router.post('/items', itemController.createItem);
router.get('/items', itemController.getItems);
router.get('/items/:id', itemController.getItemById);
router.put('/items/:id', itemController.updateItem);
router.delete('/items/:id', itemController.deleteItem);

// Transactions
router.post('/borrow', transactionController.borrowItem);
router.post('/return', transactionController.returnItem);
router.get('/transactions', transactionController.getTransactions);

module.exports = router;
