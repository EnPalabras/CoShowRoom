import express from 'express'
import { appendData } from '../../src/connections/google'

const TiendaNube = express.Router()

TiendaNube.get('/', async (req, res) => {
  res.status(200).json({
    message: 'TiendaNube',
    availableRoutes: ['/'],
    example: 'http://yourUrl/api/tienda-nube/',
  })
})

TiendaNube.post('/', async (req, res) => {
  const { body } = req
  const { id, event } = body

  try {
    console.log(`id: ${id}, event: ${event}`)
    await appendData('Ventas!M2', [[id], [event]])
    if (event === 'order/cancelled') {
    }

    if (event === 'order/created') {
    }

    if (event === 'order/paid') {
    }

    if (event === 'order/fulfilled' || event === 'order/packed') {
    }

    res.status(200).json({
      message: 'Notification received',
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: 'Error',
    })
  }
})

export default TiendaNube
