import TiendaNube from './notifications/tiendanube'

const apiRoutes = express.Router()

apiRoutes.use('/tienda-nube', TiendaNube)

export default apiRoutes
