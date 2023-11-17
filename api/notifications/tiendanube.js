import express from 'express'

const TiendaNube = express.Router()

TiendaNube.get('/', async (req, res) => {
  res.status(200).json({
    message: 'TiendaNube',
    availableRoutes: ['/'],
    example: 'http://yourUrl/api/tienda-nube/',
  })
})

TiendaNube.post('/', async (req, res) => {
  console.log(req.body)
  res.status(200).json({
    request: req.body,
  })
})

export default TiendaNube
