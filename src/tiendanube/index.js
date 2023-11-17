import dotenv from 'dotenv'
import { appendData, getRows } from '../connections/google.js'

dotenv.config()

const { AUTH_TIENDANUBE } = process.env

const checkIds = async () => {
  const checkData = await getRows('Ventas!AF2:AF')

  const orders = checkData.data.values

  const ordersIds = orders.map((order) => order[0])
  return ordersIds
}

export const createOrder = async (id) => {
  const existingIds = await checkIds()

  if (existingIds.includes(String(id))) {
    return {
      status: 'ALREADY_EXISTS',
      message: 'Ya existe la venta',
    }
  }

  const URL = `https://api.tiendanube.com/v1/1705915/orders/${id}`

  const headers = {
    'Content-Type': 'application/json',
    Authentication: AUTH_TIENDANUBE,
    'User-Agent': 'En Palabras (enpalabrass@gmail.com)',
  }

  const response = await fetch(URL, {
    method: 'GET',
    headers,
  })

  const data = await response.json()

  const { shipping_option_code, gateway_name, payment_status, gateway } = data

  if (shipping_option_code !== 'table_6629488') {
    return {
      status: 'NOT_VALID_SHIPPING_OPTION',
      message: 'No es una venta con retiro por local',
    }
  }

  if (gateway_name === 'Transferencia (Válido para Argentina)') {
    if (payment_status !== 'paid') {
      return {
        status: 'NOT_PAID',
        message: 'No se realizó todavía el pago',
      }
    }
  }

  if (gateway === 'mercadopago') {
    if (payment_status !== 'paid') {
      return {
        status: 'NOT_PAID',
        message: 'No se realizó todavía el pago',
      }
    }
  }

  const {
    number,
    created_at,
    status,
    paid_at,
    shipping_status,
    shipped_at,
    contact_name,
    contact_email,
    contact_phone,
    contact_identification,
    shipping_option,
    products,
    subtotal,
    discount,
    total,
    currency,
  } = data

  const csvLines = []

  products.map((product) => {
    const valuesToInclude = [
      [
        number,
        new Date(created_at).toLocaleString('es-AR'),
        status,
        payment_status,
        new Date(paid_at).toLocaleString('es-AR'),
        contact_name,
        contact_email,
        contact_phone,
        contact_identification,
        shipping_status,
        new Date(shipped_at).toLocaleString('es-AR'),
        shipping_option,
        product.name,
        product.quantity,
        gateway_name,
        subtotal,
        discount,
        total,
        currency,
        id,
      ],
    ]

    csvLines.push(...valuesToInclude)
  })

  await appendData('Ventas!M2', csvLines)

  return {
    status: 'OK',
    message: 'Nueva Venta con retiro por local',
    data: {
      number,
      contact_name,
      contact_email,
      contact_phone,
    },
  }
}
