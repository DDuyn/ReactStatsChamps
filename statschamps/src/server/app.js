'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const api = require('../../API')
const path = require('path')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/', api)
app.use(express.static(path.join(__dirname, './public')))

module.exports = app
