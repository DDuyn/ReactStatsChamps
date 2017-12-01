'use strict'

// CONSTANTS
const fetch = require('node-fetch')
const Game = require('../models/games')
const Champ = require('../models/champs')
const Summoner = require('../models/summoner')
const riot = require('../riot')
const async = require('async')
const round = require('mongo-round')
const sleep = require('sleep-promise')
const Common = require('../common/functions')

// VAR CONTROLLER
let data = {}
let stackFunctions = {}
let summonerID = 70542347
let accountID = 219959385
let common = new Common()

function getParticipantID (participants) {
  let id = 0
  participants.forEach(function (participant) {
    if (participant.player.currentAccountId === accountID) {
      id = participant.participantId
    }
  })
  return id
}

function getParticipant (idParticipant, participants) {
  let objParticipant = {}
  participants.forEach(function (participant) {
    if (participant.participantId === idParticipant) {
      objParticipant = participant
    }
  })
  return objParticipant
}

function saveStats (games, region, api) {
  games.forEach(function (game) {
    fetch(riot.getMatch(region, game.gameId, api))
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        if (data.gameType !== 'CUSTOM_GAME' && data.queue !== 960) {
          let game = new Game()
          let gameUpdate = {}
          let participantId = getParticipantID(data.participantIdentities)
          let participants = getParticipant(participantId, data.participants)
          game.idGame = data.gameId
          game.timegame = data.gameDuration
          game.dategame = new Date(data.gameCreation)
          game.idMap = data.mapId
          game.type = common.getValueEnum(data.queueId)
          game.idSummoner = parseInt(summonerID) // Session
          game.idChamp = participants.championId
          game.win = participants.stats.win
          game.kills = common.checkUndefined(participants.stats.kills)
          game.deaths = common.checkUndefined(participants.stats.deaths)
          game.assists = common.checkUndefined(participants.stats.assists)
          game.creeps = common.checkUndefined(participants.stats.totalMinionsKilled)
          game.multikill = common.checkUndefined(participants.stats.largestMultiKill)
          game.totalDamageDealt = common.checkUndefined(participants.stats.totalDamageDealt)
          game.totalDamageTaken = common.checkUndefined(participants.stats.totalDamageTaken)
          game.totalHeal = common.checkUndefined(participants.stats.totalHeal)
          gameUpdate = Object.assign(gameUpdate, game._doc)
          delete gameUpdate._id
          if (game.type !== 'NONE') {
            Game.findOneAndUpdate({idGame: data.gameId, idSummoner: parseInt(summonerID)},
            gameUpdate, { new: true, upsert: true }, (error, gameStore) => {
              if (error) console.log(error)
            })
          }
        }
      })
  })
  return true
}

function saveGames (request, response) {
  fetch(riot.getRecentMatchs('euw1', accountID, request.get('API')))
    .then((response) => {
      return response.json()
    })
    .then(sleep(1000))
    .then((data) => {
      let games = data.matches
      if (saveStats(games, 'euw1', request.get('API'))) return response.send({ message: `Save Succesfully` })
    })
}

// Methods Info Summoner
stackFunctions.info = function getInfo (callback) {
  Summoner.find({id: summonerID}, (error, summoner) => {
    if (error) return callback(error)
    data.info = {
      summoner
    }
    callback()
  })
}

// Methods Top Stats Champs
stackFunctions.topKills = function getTopKills (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        kills: { $sum: '$kills' },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        kills: '$kills',
        totalGames: '$total'
      }
    },
    {
      $sort: { kills: -1 }
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.kills = {
        games
      }
      callback()
    })
  })
}
stackFunctions.topAssists = function getTopAssists (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group: { _id: '$idChamp', assists: { $sum: '$assists' }, total: { $sum: 1 } }
    },
    {
      $project:
      {
        assists: '$assists',
        totalGames: '$total'
      }
    },
    {
      $sort: { assists: -1 }
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.assists = {
        games
      }
      callback()
    })
  })
}
stackFunctions.topDeaths = function getTopDeaths (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group: { _id: '$idChamp', deaths: { $sum: '$deaths' }, total: { $sum: 1 } }
    },
    {
      $project:
      {
        deaths: '$deaths',
        totalGames: '$total'
      }
    },
    {
      $sort: { deaths: -1 }
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.deaths = {
        games
      }
      callback()
    })
  })
}
stackFunctions.topWins = function getTopWins (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        wins: '$wins',
        totalGames: '$total'
      }
    },
    {
      $sort: { wins: -1 }
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.wins = {
        games
      }
      callback()
    })
  })
}
stackFunctions.topLosses = function getTopLosses (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        losses: '$losses',
        totalGames: '$total'
      }
    },
    {
      $sort: { losses: -1 }
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.losses = {
        games
      }
      callback()
    })
  })
}
stackFunctions.topMinions = function getTopMinions (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        minions: { $sum: '$creeps' },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        minions: '$minions',
        total: '$total'
      }
    },
    {
      $sort: { minions: -1 }
    },
    {
      $limit: 5
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.minions = {
        games
      }
      callback()
    })
  })
}
stackFunctions.topWinRate = function getTopWinRate (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idChamp',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
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
        wins: '$wins',
        losses: '$losses',
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
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Champ.populate(games, {path: '_id'}, (error, games) => {
      if (error) return callback(error)
      data.winrate = {
        games
      }
      callback()
    })
  })
}

// Methods Stats Summoners
stackFunctions.statsSummoner = function getstatsSummoner (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: { $in: [ 'ARAM', 'SOLO_5', 'FLEX_5', 'QUEUE_5', 'QUEUE_3', 'SOLO_3' ] } }
    },
    {
      $group:
      {
        _id: '$idSummoner',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Summoner.populate(games, {path: 'id'}, (error, games) => {
      if (error) return callback(error)
      data.summonerStats = {
        games
      }
      callback()
    })
  })
}
stackFunctions.wRSummonerAram = function getwRSummonerAram (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: 'ARAM' }
    },
    {
      $group:
      {
        _id: '$idSummoner',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Summoner.populate(games, {path: 'id'}, (error, games) => {
      if (error) return callback(error)
      data.aramWinRate = {
        games
      }
      callback()
    })
  })
}
stackFunctions.wRSummonerRank5 = function getwRSummonerRank5 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: 'SOLO_5' }
    },
    {
      $group:
      {
        _id: '$idSummoner',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Summoner.populate(games, {path: 'id'}, (error, games) => {
      if (error) return callback(error)
      data.rank5WinRate = {
        games
      }
      callback()
    })
  })
}
stackFunctions.wRSummonerFlexQ = function getwRSummonerFlexQ (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: 'FLEX_5' }
    },
    {
      $group:
      {
        _id: '$idSummoner',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Summoner.populate(games, {path: 'id'}, (error, games) => {
      if (error) return callback(error)
      data.flexQSummoner = {
        games
      }
      callback()
    })
  })
}
stackFunctions.wRSummonerNor5 = function getwRSummonerNor5 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: 'QUEUE_5' }
    },
    {
      $group:
      {
        _id: '$idSummoner',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Summoner.populate(games, {path: 'id'}, (error, games) => {
      if (error) return callback(error)
      data.normal5Summoner = {
        games
      }
      callback()
    })
  })
}
stackFunctions.wrSummonerNor3 = function getwRSummonerNor3 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: 'QUEUE_3' }
    },
    {
      $group:
      {
        _id: '$idSummoner',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Summoner.populate(games, {path: 'id'}, (error, games) => {
      if (error) return callback(error)
      data.normal3Summoner = {
        games
      }
      callback()
    })
  })
}
stackFunctions.wRSummonerRank3 = function getwRSummonerRank3 (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID, type: 'SOLO_3' }
    },
    {
      $group:
      {
        _id: '$idSummoner',
        losses: { $sum: { $cond: ['$win', 0, 1] } },
        wins: { $sum: { $cond: ['$win', 1, 0] } },
        total: { $sum: 1 }
      }
    },
    {
      $project:
      {
        winrate: round({ $multiply: [100, { $divide: ['$wins', '$total'] }] }, 2),
        wins: '$wins',
        losses: '$losses',
        totalGames: '$total'
      }
    }
  ]
  Game.aggregate(query, (error, games) => {
    if (error) return callback(error)
    Summoner.populate(games, {path: 'id'}, (error, games) => {
      if (error) return callback(error)
      data.rank3WinRate = {
        games
      }
      callback()
    })
  })
}

// Last games
stackFunctions.lastGames = function getLastGames (callback) {
  let query = [
    {
      $match: { idSummoner: summonerID }
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
  summonerID = common.getSummonerId(request.params.summonerID)
  async.parallel(stackFunctions, function (err) {
    if (err) return next(err)
    response.status(200).send({ data })
  })
}

module.exports = {
  saveGames,
  getStats
}
