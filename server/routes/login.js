const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({email: body.email}, (err, user) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o constraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (Contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: user
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
            ok: true,
            usuario: user,
            token
        });
    });

});

//Configuraciones de Google

async function verify(token) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    Usuario.findOne({email: googleUser.email}, (err, usuario) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuario) {

            if (usuario.google === false) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticacion normal'
                    }
                });
            } else {

                let token = jwt.sign({
                    usuario: usuario
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({
                    ok: true,
                    usuario,
                    token: token
                });
            }
        } else {

            //If user does not exists in the DB
            let user = new Usuario();
            user.nombre = googleUser.nombre;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, usuariodb) => {

                if (err) {

                    res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuariodb
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({
                    ok: true,
                    usuario: usuariodb,
                    token: token
                });
            });
        }
    });
});


module.exports = app;