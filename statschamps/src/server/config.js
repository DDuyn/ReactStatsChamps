module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB || 'mongodb://admin:admin@ds137281.mlab.com:37281/statchamps'
  // db: process.env.LOCAL || 'mongodb://localhost:27017/statchamps'
}
