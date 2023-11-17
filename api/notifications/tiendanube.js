import express from 'express'

const TiendaNube = express.Router()

TiendaNube.get('/', async (req, res) => {
  res.status(200).json({
    message: 'TiendaNube',
    availableRoutes: ['/'],
    example: 'http://yourUrl/api/tienda-nube/',
  })
})

export default TiendaNube
