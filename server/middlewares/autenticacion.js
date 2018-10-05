const jwt = require('jsonwebtoken');

// ======================================================
//   Verificar Token
// ======================================================

let verificaToken = (req, res, next) => {

    let token = req.get('token'); //Authorization

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

};

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'No tienes los suficientes privilegios para realizar esta acción'
            }
        });
    }
};

// ======================================================
//   Verificar Token for Images
// ======================================================

let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
};

module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
};