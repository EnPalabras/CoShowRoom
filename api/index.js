import express from 'express'
import TiendaNube from './notifications/tiendanube.js'

const apiRoutes = express.Router()

apiRoutes.use('/tienda-nube', TiendaNube)

export default apiRoutes
