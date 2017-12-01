'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MapSchema = Schema({
  _id: { type: Number, unique: true },
  name: String
})

module.exports = mongoose.model('Maps', MapSchema)
