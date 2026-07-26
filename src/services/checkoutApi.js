const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function submitCheckout(payload) {
  await delay(900)
  const hasItems = payload.cart.some((item) => item.quantity > 0)

  if (!hasItems) {
    throw new Error('Cart is empty')
  }

  return {
    status: 'paid (simulated)',
    confirmationId: `demo_${Date.now()}`,
  }
}