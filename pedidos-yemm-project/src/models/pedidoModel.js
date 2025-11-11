// This file defines the data model for pedidos. It includes the schema and methods for interacting with the database.

const db = require('../db/index');

class Pedido {
    constructor(id, productos, total, fecha, direccion, estado, cliente) {
        this.id = id;
        this.productos = productos;
        this.total = total;
        this.fecha = fecha;
        this.direccion = direccion;
        this.estado = estado;
        this.cliente = cliente;
    }

    static async crearPedido(pedidoData) {
        const { productos, total, fecha, direccion, estado, cliente } = pedidoData;
        const newPedido = new Pedido(null, productos, total, fecha, direccion, estado, cliente);
        const result = await db.query('INSERT INTO pedidos (productos, total, fecha, direccion, estado, cliente) VALUES (?, ?, ?, ?, ?, ?)', 
            [JSON.stringify(newPedido.productos), newPedido.total, newPedido.fecha, newPedido.direccion, newPedido.estado, newPedido.cliente]);
        newPedido.id = result.insertId;
        return newPedido;
    }

    static async obtenerPedidoPorId(id) {
        const result = await db.query('SELECT * FROM pedidos WHERE id = ?', [id]);
        return result[0] ? new Pedido(result[0].id, JSON.parse(result[0].productos), result[0].total, result[0].fecha, result[0].direccion, result[0].estado, result[0].cliente) : null;
    }

    static async obtenerTodosLosPedidos() {
        const result = await db.query('SELECT * FROM pedidos');
        return result.map(p => new Pedido(p.id, JSON.parse(p.productos), p.total, p.fecha, p.direccion, p.estado, p.cliente));
    }

    static async actualizarPedido(id, updatedData) {
        const { productos, total, fecha, direccion, estado, cliente } = updatedData;
        await db.query('UPDATE pedidos SET productos = ?, total = ?, fecha = ?, direccion = ?, estado = ?, cliente = ? WHERE id = ?', 
            [JSON.stringify(productos), total, fecha, direccion, estado, cliente, id]);
    }

    static async eliminarPedido(id) {
        await db.query('DELETE FROM pedidos WHERE id = ?', [id]);
    }
}

module.exports = Pedido;