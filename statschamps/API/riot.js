'use strict'

// const key = 'RGAPI-32dfee3d-1b65-4ede-b180-8b87d05da7e9'
const staticAPI = 'static-data/'
const versionAPI = 'v3/'
const urlAPI = '.api.riotgames.com/lol/'
const https = 'https://'

function getChampions (region, apiKey) {
  return endPoint('Static', region) + 'champions' + setAPIKEY(apiKey) + '&tags=image'
}

function getSummonerId (region, nameSummoner, apiKey) {
  return endPoint('Summoner', region) + 'summoners/by-name/' + nameSummoner + setAPIKEY(apiKey)
}

function getRecentMatchs (region, idAccount, apiKey) {
  return endPoint('Match', region) + 'matchlists/by-account/' + idAccount + '/recent' + setAPIKEY(apiKey)
}

function getMaps (region, apiKey) {
  return endPoint('Static', region) + 'maps' + setAPIKEY(apiKey)
}

function getMatch (region, idGame, apiKey) {
  return endPoint('Match', region) + 'matches/' + idGame + setAPIKEY(apiKey)
}

function endPoint (type, region) {
  let endPoint = null
  switch (type) {
    case 'Static':
      endPoint = https + region + urlAPI + staticAPI + versionAPI
      break
    case 'Match':
      endPoint = https + region + urlAPI + 'match/' + versionAPI
      break
    case 'Summoner':
      endPoint = https + region + urlAPI + 'summoner/' + versionAPI
  }
  return endPoint
}

function setAPIKEY (apiKey) {
  return '?api_key=' + apiKey
}

module.exports = {
  getChampions,
  getSummonerId,
  getRecentMatchs,
  getMaps,
  getMatch
}
