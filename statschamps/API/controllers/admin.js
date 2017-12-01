'use strict'

const fetch = require('node-fetch')
const Champ = require('../models/champs')
const Maps = require('../models/maps')
const riot = require('../riot')
const urlImg = 'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/champion/'

function saveChamps (request, response) {
  fetch(riot.getChampions('euw1', request.get('API')))
    .then((response) => {
      return response.json()
    })
    .then((recurso) => {
      let champs = recurso.data
      for (var key in champs) {
        if (champs.hasOwnProperty(key)) {
          let champion = new Champ()
          champion.name = champs[key].name
          champion._id = champs[key].id
          champion.photo = urlImg + champs[key].image.full
          Champ.findByIdAndUpdate(champs[key].id, champion, { upsert: true }, (error, champStored) => {
            if (error) return response.status(500).send({ message: `Error: ${error}` })
          })
        }
      }
      return response.send({ message: `Save Succesfully` })
    })
}

function saveMaps (request, response) {
  fetch(riot.getMaps('euw1', request.get('API')))
    .then((response) => {
      return response.json()
    })
    .then((recurso) => {
      let maps = recurso.data
      for (var key in maps) {
        if (maps.hasOwnProperty(key)) {
          let map = new Maps()
          let flag = false
          switch (maps[key].mapId) {
            case 10:
              map._id = maps[key].mapId
              map.name = 'Twisted Treeline'
              flag = true
              break
            case 11:
              map._id = maps[key].mapId
              map.name = 'Summoners Rift'
              flag = true
              break
            case 12:
              map._id = maps[key].mapId
              map.name = 'Howling Abyss'
              flag = true
              break
          }
          if (flag) {
            Maps.findByIdAndUpdate(maps[key].mapId, map, {upsert: true}, (error, mapStored) => {
              if (error) return response.status(500).send({ message: `${error}` })
            })
          }
        }
      }
      return response.send({ message: `Save Succesfully` })
    })
}

module.exports = {
  saveChamps,
  saveMaps
}
