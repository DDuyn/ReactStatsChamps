'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

const SummonerSchema = Schema({
  id: { type: Number, unique: true },
  account: { type: Number, unique: true },
  name: String,
  password: { type: String, select: false },
  email: { type: String, unique: true, lowercase: true },
  active: Boolean,
  codeActive: Number
})

const Summoner = mongoose.model('Summoners', SummonerSchema)

SummonerSchema.pre('save', function (next) {
  var user = this
  if (!user.isModified('password')) return next()
  Summoner.find({email: this.email}, 'email', (error, response) => {
    if (error) {
      next(error)
    } else if (response.length > 0) {
      user.invalidate('email', 'Email must be unique')
      next(new Error('Email must be unique'))
    } else {
      bcrypt.genSalt(10, (error, salt) => {
        if (error) return next(error)
        bcrypt.hash(user.password, salt, null, (error, encrypted) => {
          if (error) return next(error)

          user.password = encrypted
          next()
        })
      })
    }
  })
})

module.exports = Summoner
