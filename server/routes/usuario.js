const express = require('express');

const bcrypt = require("bcrypt-nodejs");

const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', function(req, res) {

    // res.json('getUsuario');
    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 5);

    Usuario.find({ estado: true }, 'nombre email role estado google, img ')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.statusCode(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.count({ estado: true }, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                return res.json({
                    ok: true,
                    cuantos: conteo,
                    usuarios
                })
            });
        })
});

app.post('/usuario', function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password), // encriptacion de passwords
        // img: body.img,
        role: body.role
            // estado: body.estado,
            // google: body.google
    })


    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        // usuarioDB.password = null;
        return res.json({
            ok: true,
            usuarioDB
        })
    })

});

app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'estado', 'role']);



    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        // usuarioDB.save()
        if (err) {

            return res.status(400).json({
                ok: false,
                err
            })
        }

        return res.json({
            ok: true,
            id,
            usuario: usuarioDB
        });
    })


});

app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;
    //let body = _.pick(req.body, ['estado']);

    let cambiaEstado = {
        estado: false
    };


    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: false }, (err, usuarioBorrado) => {
        // usuarioDB.save()
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if ((usuarioBorrado === null) || (usuarioBorrado.estado === false)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado en la BD!'
                }
            })
        }

        return res.json({
            ok: true,
            id,
            usuario: usuarioBorrado
        });
    })


});

module.exports = app;