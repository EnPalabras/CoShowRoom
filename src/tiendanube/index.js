import dotenv from 'dotenv'

dotenv.config()

const { AUTH_TIENDANUBE } = process.env

const URL = 'https://api.tiendanube.com/v1/1705915/orders/'

export const createOrder = async (id) => {
  const orderInfo = 'hola'
}
