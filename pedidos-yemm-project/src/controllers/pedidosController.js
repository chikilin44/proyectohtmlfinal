// pedidosController.js

const Pedido = require('../models/pedidoModel');

// Obtener todos los pedidos
exports.getAllPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find();
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los pedidos', error });
    }
};

// Crear un nuevo pedido
exports.createPedido = async (req, res) => {
    const nuevoPedido = new Pedido(req.body);
    try {
        const savedPedido = await nuevoPedido.save();
        res.status(201).json(savedPedido);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el pedido', error });
    }
};

// Obtener un pedido por ID
exports.getPedidoById = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.status(200).json(pedido);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el pedido', error });
    }
};

// Actualizar un pedido por ID
exports.updatePedido = async (req, res) => {
    try {
        const updatedPedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.status(200).json(updatedPedido);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el pedido', error });
    }
};

// Eliminar un pedido por ID
exports.deletePedido = async (req, res) => {
    try {
        const deletedPedido = await Pedido.findByIdAndDelete(req.params.id);
        if (!deletedPedido) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el pedido', error });
    }
};