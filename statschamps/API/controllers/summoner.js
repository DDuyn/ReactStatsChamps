'use strict'

const fetch = require('node-fetch')
const Summoner = require('../models/summoner')
const riot = require('../riot')
const utf8 = require('utf8')

function saveSummoner (request, response) {
  fetch(riot.getSummonerId('euw1', utf8.encode(request.body.name), request.get('API')))
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      let summoner = new Summoner()
      summoner.name = data.name
      summoner.id = data.id
      summoner.account = data.accountId
      summoner.email = request.body.email
      summoner.password = request.body.password
      summoner.active = true
      summoner.save((error, summonerStore) => {
        if (error) return response.status(500).send({ message: `${error}` })
        return response.status(200).send({ summonerStore })
      })
    })
}

module.exports = {
  saveSummoner
}
