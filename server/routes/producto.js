const express = require('express');
const {verificaToken} = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');

// ======================================================
//   Obtener todos los productos
// ======================================================

app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //Con populate y paginacion
    Producto.find({})
        .sort('nombre')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.count((err, total) => {

                res.json({
                    ok: true,
                    NoProductos: total,
                    productos
                });
            });
        });
});

// ======================================================
//   Mostrar un producto por ID
// ======================================================

app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, producto) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto
        });
    });
});

// ======================================================
//   Obtener todos los productos
// ======================================================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec((err, producto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto
            });
        });
});

// ======================================================
//   Crear un producto
// ======================================================

app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, prodct) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!prodct) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: prodct
        });
    });
});

// ======================================================
//   Actualizar un producto
// ======================================================

app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let pdt = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible
    };

    Producto.findByIdAndUpdate(id, pdt, {new: true, runValidators: true, context: 'query'}, (err, producto) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!producto) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto
        });
    });
});

// ======================================================
//   Eliminar un producto
// ======================================================

app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findByIdAndUpdate(id, {disponible: false}, {new: true}, (err, producto) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!producto) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto
        });
    });
});

module.exports = app;