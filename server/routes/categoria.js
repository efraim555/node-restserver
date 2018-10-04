const express = require('express');
const app = express();
let {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion');
let Categoria = require('../models/categoria');

// ======================================================
//   Mostrar todas las categorias
// ======================================================

app.get('/categoria', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let hasta = req.query.hasta || 5;
    hasta = Number(hasta);

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(hasta)
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.count({}, (err, conteo) => {

                res.json({
                    ok: true,
                    NoCategorias: conteo,
                    categorias
                });
            });
        });
});

// ======================================================
//   Mostrar una categoria por ID
// ======================================================

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categ) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categ
        });
    });

});

// ======================================================
//   Crear nueva categoria
// ======================================================

app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categ) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categ
        });
    })

});

// ======================================================
//   Actualizar una categoria
// ======================================================

app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, {new: true, runValidators: true, context: 'query'}, (err, categ) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categ
        });

    });
});

// ======================================================
//   Eliminar una categoria
// ======================================================

app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    //Solo un admin puede borrar categoria

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categ) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categ) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categ
        });
    });
});

module.exports = app;