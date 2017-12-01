'use strict'

const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config')

mongoose.Promise = global.Promise
mongoose.connect(config.db, (error, response) => {
  if (error) {
    return console.log(`Error al establecer conexión a la BD: ${error}`)
  } else {
    console.log('Establecida conexión a la BD')
  }
  app.listen(config.port, () => {
    console.log(`Encendido: ${config.port}`)
  })
})
