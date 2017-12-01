'use strict'

const Game = require('../models/games')
const Champ = require('../models/champs')
const Maps = require('../models/maps')
const async = require('async')
const round = require('mongo-round')

// VAR CONTROLLER
let data = {}
let stackFunctions = {}
let summonerID = null
let mapID = null

function getParams (params) {
  summonerID = parseInt(params.summonerID)
  mapID = parseInt(params.mapID)
}

stackFunctions.getInfo = function getInfo (callback) {
  Maps.find({ _id: mapID }, (error, map) => {
    if (error) return callback(error)
    data.info = {
      map
    }
    callback()
  })
}
stackFunctions.getTotals = function getTotals (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idMap',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        losses: '$losses',
        wins: '$wins',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    data.statsMap = {
      stats
    }
    callback()
  })
}
stackFunctions.topWinRate = function getTopWinRate (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        winrate:
        {
          $cond:
          [
            { $gt: ['$total', 5] },
            round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
            0
          ]
        },
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        losses: '$losses',
        wins: '$wins',
        totalGames: '$total'
      }
    },
    {
      $sort: {winrate: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    Champ.populate(stats, {path: '_id'}, (error, stats) => {
      if (error) return callback(error)
      data.winrate = {
        stats
      }
      callback()
    })
  })
}
stackFunctions.topKills = function getTopKills (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'}
      }
    },
    {
      $sort: {kills: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    Champ.populate(stats, {path: '_id'}, (error, stats) => {
      if (error) return callback(error)
      data.topKills = {
        stats
      }
      callback()
    })
  })
}
stackFunctions.topDeaths = function getTopDeaths (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        deaths: {$sum: '$deaths'}
      }
    },
    {
      $sort: {deaths: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    Champ.populate(stats, {path: '_id'}, (error, stats) => {
      if (error) return callback(error)
      data.topDeaths = {
        stats
      }
      callback()
    })
  })
}
stackFunctions.topAssists = function getTopAssists (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        assists: {$sum: '$assists'}
      }
    },
    {
      $sort: {assists: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    Champ.populate(stats, {path: '_id'}, (error, stats) => {
      if (error) return callback(error)
      data.topAssists = {
        stats
      }
      callback()
    })
  })
}
stackFunctions.topWins = function getTopWins (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        wins: { $sum: { $cond: ['$win', 1, 0] } }
      }
    },
    {
      $sort: {wins: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    Champ.populate(stats, {path: '_id'}, (error, stats) => {
      if (error) return callback(error)
      data.topWins = {
        stats
      }
      callback()
    })
  })
}
stackFunctions.topLosses = function getTopLosses (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        losses: { $sum: { $cond: ['$win', 0, 1] } }
      }
    },
    {
      $sort: {losses: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    Champ.populate(stats, {path: '_id'}, (error, stats) => {
      if (error) return callback(error)
      data.topLosses = {
        stats
      }
      callback()
    })
  })
}
stackFunctions.lastGames = function getLastGames (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idMap: mapID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $project:
      {
        '_id': '$idChamp',
        idGame: '$idGame',
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        minions: '$creeps',
        win: '$win',
        map: '$idMap',
        type: '$type',
        date: '$dategame',
        time: '$timegame'
      }
    },
    {
      $sort: {date: -1}
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.lastGames = {
        games
      }
      callback()
    })
  })
}

function getStats (request, response, next) {
  getParams(request.params)
  async.parallel(stackFunctions, function (err) {
    if (err) return next(err)
    response.status(200).send({ data })
  })
}

module.exports = {
  getStats
}
