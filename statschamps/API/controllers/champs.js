'use strict'

const Champ = require('../models/champs')
const Game = require('../models/games')
const async = require('async')
const round = require('mongo-round')

// VAR CONTROLLER
let data = {}
let stackFunctions = {}
let summonerID = null
let championID = null

function getParams (params) {
  summonerID = parseInt(params.summonerID)
  championID = parseInt(params.championID)
}

// GENERAL
stackFunctions.getTotals = function getTotals (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
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
    data.statsChamp = {
      stats
    }
    callback()
  })
}
stackFunctions.getLastGames = function getLastGames (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID }
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
      $limit: 10
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    data.lastGames = {
      games
    }
    callback()
  })
}
stackFunctions.getInfo = function getInfo (callback) {
  Champ.find({_id: championID}, (error, champion) => {
    if (error) return callback(error)
    data.info = {
      champion
    }
    callback()
  })
}
// ARAM
stackFunctions.getStatsAram = function getStatsAram (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'ARAM' }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        minions: {$sum: '$creeps'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        minions: '$minions',
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    data.statsAram = {
      stats
    }
    callback()
  })
}
stackFunctions.getBestAram = function getBestAram (callback) {
  let obj
  let queryKill = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'ARAM' }
    },
    {
      $project:
      {
        kills: '$kills',
        idGame: '$idGame'
      }
    },
    {
      $sort: {kills: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryDeaths = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'ARAM' }
    },
    {
      $project:
      {
        deaths: '$deaths',
        idGame: '$idGame'
      }
    },
    {
      $sort: {deaths: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryAssists = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'ARAM' }
    },
    {
      $project:
      {
        assists: '$assists',
        idGame: '$idGame'
      }
    },
    {
      $sort: {assists: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(queryKill, (error, topKills) => {
    if (error) return callback(error)
    Game.aggregate(queryDeaths, (error, topDeaths) => {
      if (error) return callback(error)
      obj = topKills.concat(topDeaths)
      Game.aggregate(queryAssists, (error, topAssists) => {
        if (error) return callback(error)
        obj = obj.concat(topAssists)
        data.bestStatsAram = {
          'bestScores': obj
        }
        callback()
      })
    })
  })
}
stackFunctions.getLastAram = function getLastAram (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'ARAM' }
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
    data.lastAramGames = {
      games
    }
    callback()
  })
}
// RANK 5
stackFunctions.getStatsRank5 = function getStatsRank5 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_5' }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        minions: {$sum: '$creeps'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        minions: '$minions',
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    data.statsRank5 = {
      stats
    }
    callback()
  })
}
stackFunctions.getBestRank5 = function getBestRank5 (callback) {
  let obj
  let queryKill = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_5' }
    },
    {
      $project:
      {
        kills: '$kills',
        idGame: '$idGame'
      }
    },
    {
      $sort: {kills: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryDeaths = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_5' }
    },
    {
      $project:
      {
        deaths: '$deaths',
        idGame: '$idGame'
      }
    },
    {
      $sort: {deaths: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryAssists = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_5' }
    },
    {
      $project:
      {
        assists: '$assists',
        idGame: '$idGame'
      }
    },
    {
      $sort: {assists: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(queryKill, (error, topKills) => {
    if (error) return callback(error)
    Game.aggregate(queryDeaths, (error, topDeaths) => {
      if (error) return callback(error)
      obj = topKills.concat(topDeaths)
      Game.aggregate(queryAssists, (error, topAssists) => {
        if (error) return callback(error)
        obj = obj.concat(topAssists)
        data.bestStatsRank5 = {
          'bestScores': obj
        }
        callback()
      })
    })
  })
}
stackFunctions.getLastRank5 = function getLastRank5 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_5' }
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
    data.lastRank5Games = {
      games
    }
    callback()
  })
}
// FLEXQ
stackFunctions.getStatsFlexQ = function getStatsFlexQ (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'FLEX_5' }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        minions: {$sum: '$creeps'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        minions: '$minions',
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    data.statsFlexQ = {
      stats
    }
    callback()
  })
}
stackFunctions.getBestFlexQ = function getBestFlexQ (callback) {
  let obj
  let queryKill = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'FLEX_5' }
    },
    {
      $project:
      {
        kills: '$kills',
        idGame: '$idGame'
      }
    },
    {
      $sort: {kills: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryDeaths = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'FLEX_5' }
    },
    {
      $project:
      {
        deaths: '$deaths',
        idGame: '$idGame'
      }
    },
    {
      $sort: {deaths: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryAssists = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'FLEX_5' }
    },
    {
      $project:
      {
        assists: '$assists',
        idGame: '$idGame'
      }
    },
    {
      $sort: {assists: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(queryKill, (error, topKills) => {
    if (error) return callback(error)
    Game.aggregate(queryDeaths, (error, topDeaths) => {
      if (error) return callback(error)
      obj = topKills.concat(topDeaths)
      Game.aggregate(queryAssists, (error, topAssists) => {
        if (error) return callback(error)
        obj = obj.concat(topAssists)
        data.bestStatsFlexQ = {
          'bestScores': obj
        }
        callback()
      })
    })
  })
}
stackFunctions.getLastFlexQ = function getLastFlexQ (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'FLEX_5' }
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
        date: { $dateToString: { format: '%d/%m/%Y', date: '$dategame' } },
        time: '$timegame'
      }
    },
    {
      $sort: {date: 1}
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    data.last5FlexQ = {
      games
    }
    callback()
  })
}
// NORMAL 5vs5
stackFunctions.getStatsNormal5 = function getStatsNormal5 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_5' }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        minions: {$sum: '$creeps'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        minions: '$minions',
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    data.statsNormal5 = {
      stats
    }
    callback()
  })
}
stackFunctions.getBestNormal5 = function getBestNormal5 (callback) {
  let obj
  let queryKill = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_5' }
    },
    {
      $project:
      {
        kills: '$kills',
        idGame: '$idGame'
      }
    },
    {
      $sort: {kills: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryDeaths = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_5' }
    },
    {
      $project:
      {
        deaths: '$deaths',
        idGame: '$idGame'
      }
    },
    {
      $sort: {deaths: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryAssists = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_5' }
    },
    {
      $project:
      {
        assists: '$assists',
        idGame: '$idGame'
      }
    },
    {
      $sort: {assists: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(queryKill, (error, topKills) => {
    if (error) return callback(error)
    Game.aggregate(queryDeaths, (error, topDeaths) => {
      if (error) return callback(error)
      obj = topKills.concat(topDeaths)
      Game.aggregate(queryAssists, (error, topAssists) => {
        if (error) return callback(error)
        obj = obj.concat(topAssists)
        data.bestStatsNormal5 = {
          'bestScores': obj
        }
        callback()
      })
    })
  })
}
stackFunctions.getLastNormal5 = function getLastNormal5 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_5' }
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
        date: { $dateToString: { format: '%d/%m/%Y', date: '$dategame' } },
        time: '$timegame'
      }
    },
    {
      $sort: {date: 1}
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    data.lastNormal5 = {
      games
    }
    callback()
  })
}
// RANK 3
stackFunctions.getStatsRank3 = function getStatsRank3 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_3' }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        minions: {$sum: '$creeps'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        minions: '$minions',
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    data.statsRank5 = {
      stats
    }
    callback()
  })
}
stackFunctions.getBestRank3 = function getBestRank3 (callback) {
  let obj
  let queryKill = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_3' }
    },
    {
      $project:
      {
        kills: '$kills',
        idGame: '$idGame'
      }
    },
    {
      $sort: {kills: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryDeaths = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_3' }
    },
    {
      $project:
      {
        deaths: '$deaths',
        idGame: '$idGame'
      }
    },
    {
      $sort: {deaths: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryAssists = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_3' }
    },
    {
      $project:
      {
        assists: '$assists',
        idGame: '$idGame'
      }
    },
    {
      $sort: {assists: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(queryKill, (error, topKills) => {
    if (error) return callback(error)
    Game.aggregate(queryDeaths, (error, topDeaths) => {
      if (error) return callback(error)
      obj = topKills.concat(topDeaths)
      Game.aggregate(queryAssists, (error, topAssists) => {
        if (error) return callback(error)
        obj = obj.concat(topAssists)
        data.bestStatsRank3 = {
          'bestScores': obj
        }
        callback()
      })
    })
  })
}
stackFunctions.getLastRank3 = function getLastRank3 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'SOLO_3' }
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
        date: { $dateToString: { format: '%d/%m/%Y', date: '$dategame' } },
        time: '$timegame'
      }
    },
    {
      $sort: {date: 1}
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    data.lastRank3Games = {
      games
    }
    callback()
  })
}
// NORMAL 3vs3
stackFunctions.getStatsNormal3 = function getStatsNormal3 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_3' }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: {$sum: '$kills'},
        deaths: {$sum: '$deaths'},
        assists: {$sum: '$assists'},
        minions: {$sum: '$creeps'},
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: {$sum: 1}
      }
    },
    {
      $project:
      {
        kills: '$kills',
        deaths: '$deaths',
        assists: '$assists',
        minions: '$minions',
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, stats) => {
    if (error) return callback(error)
    data.statsNormal5 = {
      stats
    }
    callback()
  })
}
stackFunctions.getBestNormal3 = function getBestNormal3 (callback) {
  let obj
  let queryKill = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_3' }
    },
    {
      $project:
      {
        kills: '$kills',
        idGame: '$idGame'
      }
    },
    {
      $sort: {kills: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryDeaths = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_3' }
    },
    {
      $project:
      {
        deaths: '$deaths',
        idGame: '$idGame'
      }
    },
    {
      $sort: {deaths: -1}
    },
    {
      $limit: 1
    }
  ]
  let queryAssists = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_3' }
    },
    {
      $project:
      {
        assists: '$assists',
        idGame: '$idGame'
      }
    },
    {
      $sort: {assists: -1}
    },
    {
      $limit: 1
    }
  ]
  Game.aggregate(queryKill, (error, topKills) => {
    if (error) return callback(error)
    Game.aggregate(queryDeaths, (error, topDeaths) => {
      if (error) return callback(error)
      obj = topKills.concat(topDeaths)
      Game.aggregate(queryAssists, (error, topAssists) => {
        if (error) return callback(error)
        obj = obj.concat(topAssists)
        data.bestStatsNormal3 = {
          'bestScores': obj
        }
        callback()
      })
    })
  })
}
stackFunctions.getLastNormal3 = function getLastNormal3 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, idChamp: championID, type: 'QUEUE_3' }
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
    data.lastNormal3 = {
      games
    }
    callback()
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
