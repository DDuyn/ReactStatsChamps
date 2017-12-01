'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GameSchema = Schema({
  idGame: Number,
  idSummoner: { type: Number, ref: 'Summoners' },
  idChamp: { type: Number, ref: 'Champs' },
  idMap: { type: Number, ref: 'Maps' },
  type: String,
  win: Boolean,
  kills: Number,
  deaths: Number,
  assists: Number,
  creeps: Number,
  multikill: Number,
  totalDamageDealt: Number,
  totalDamageTaken: Number,
  totalHeal: Number,
  dategame: Date,
  timegame: Number
})

module.exports = mongoose.model('Games', GameSchema)
