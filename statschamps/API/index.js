'user strict'

const express = require('express')
const api = express.Router()
const adminCtrl = require('./controllers/admin')
const champCtrl = require('./controllers/champs')
const summonerCtrl = require('./controllers/summoner')
const mainCtrl = require('./controllers/main')
const mapCtrl = require('./controllers/map')

// GET
api.get('/summoner/:summonerID', mainCtrl.getStats)
api.get('/summoner/:summonerID/champion/:championID', champCtrl.getStats)
api.get('/summoner/:summonerID/map/:mapID', mapCtrl.getStats)

// POST
api.post('/champs', adminCtrl.saveChamps)
api.post('/maps', adminCtrl.saveMaps)
api.post('/games', mainCtrl.saveGames)
api.post('/summoner', summonerCtrl.saveSummoner)

// OTHERS

module.exports = api
