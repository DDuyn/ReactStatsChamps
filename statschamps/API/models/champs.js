'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChampSchema = Schema({
  name: String,
  photo: String,
  _id: {type: Number, unique: true}
})

module.exports = mongoose.model('Champs', ChampSchema)
