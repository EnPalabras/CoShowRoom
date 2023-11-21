import express from 'express'
import { appendData } from '../../src/connections/google.js'
import { createOrder, createPaidOrder } from '../../src/tiendanube/index.js'

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

    if (event === 'order/created') {
      const order = await createOrder(id)

      return res.status(200).json({
        message: 'Notification received',
        orderStatus: order.status,
      })
    }
    if (event === 'order/paid') {
      const order = await createPaidOrder(id)

      return res.status(200).json({
        message: 'Notification received',
        orderStatus: order.status,
      })
    }
    if (event === 'order/cancelled') {
    }

    if (event === 'order/fulfilled' || event === 'order/packed') {
    }
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: 'Error',
    })
  }
})

export default TiendaNube
