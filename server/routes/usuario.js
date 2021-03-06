const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcryptjs');
const _ = require('underscore');
const {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion');

// ======================================================
//   Mostrar todos los usuarios
// ======================================================

app.get('/usuario', verificaToken, (req, res) => {

    /*return res.json({
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    });*/

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({estado: true}, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({estado: true}, (err, conteo) => {
                res.json({
                    ok: true,
                    cuantos: conteo,
                    usuarios
                });
            });
        });
});

// ======================================================
//   Crear un usuario
// ======================================================

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {


    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, user) => {
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        } else {

            //user.password = null;

            res.json({
                ok: true,
                usuario: user
            });
        }
    });

});

// ======================================================
//   Actualizar un usuario
// ======================================================

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //delete body.password;
    //delete body.google;

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true, context: 'query'}, (err, user) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: user
        });
    });
});

// ======================================================
//   Eliminar un usuario
// ======================================================

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    /*Usuario.findByIdAndRemove(id, (err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: user
        });
    });*/

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, user) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: user
        });
    });
});

module.exports = app;