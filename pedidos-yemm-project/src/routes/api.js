const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');

// Get all pedidos
router.get('/pedidos', pedidosController.getAllPedidos);

// Get a specific pedido by ID
router.get('/pedidos/:id', pedidosController.getPedidoById);

// Create a new pedido
router.post('/pedidos', pedidosController.createPedido);

// Update an existing pedido
router.put('/pedidos/:id', pedidosController.updatePedido);

// Delete a pedido
router.delete('/pedidos/:id', pedidosController.deletePedido);

module.exports = router;