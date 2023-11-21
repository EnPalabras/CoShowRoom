import dotenv from 'dotenv'
import { appendData, getRows } from '../connections/google.js'

dotenv.config()

const { AUTH_TIENDANUBE } = process.env

const checkIds = async () => {
  const checkData = await getRows('Ventas!AK2:AK')

  const orders = checkData.data.values

  if (!orders) {
    return []
  }

  const ordersIds = orders.map((order) => order[0])
  return ordersIds
}

const PAYMENT_STATUS = {
  paid: 'Pagado',
  pending: 'Pendiente',
  refunded: 'Reembolsado',
  voided: 'Anulado',
  authorized: 'Autorizado',
  abandoned: 'Abandonado',
}

const ORDER_STATUS = {
  open: 'Abierta',
  closed: 'Cerrada',
  cancelled: 'Cancelada',
}

export const createOrder = async (id, event) => {
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

  if (
    shipping_option_code !== 'branch_374917' &&
    shipping_option_code !== 'branch_374918' &&
    shipping_option_code !== 'branch_374916' &&
    shipping_option_code !== 'branch_374913'
  ) {
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

    if (payment_status === 'paid' && event === 'order/created') {
      return {
        status: 'PAID',
        message:
          'Pagado: Se creará la venta en el sistema con la notificación de pago',
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
        ORDER_STATUS[status],
        PAYMENT_STATUS[payment_status],
        new Date(paid_at).toLocaleString('es-AR'),
        contact_name,
        contact_email,
        contact_identification,
        contact_phone,
        shipping_status,
        null,
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

  await appendData('Ventas!R2', csvLines)

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
