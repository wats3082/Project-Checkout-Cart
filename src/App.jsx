import { useMemo, useState } from 'react'
import { products } from './data/products'
import { submitCheckout } from './services/checkoutApi'
import './App.css'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function App() {
  const [cart, setCart] = useState(() => products.map((item) => ({ ...item, quantity: 0 })))
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )
  const processingFee = subtotal > 0 ? Math.max(1.49, subtotal * 0.029) : 0
  const total = subtotal + processingFee

  const updateQuantity = (id, direction) => {
    setReceipt(null)
    setCart((items) =>
      items.map((item) => {
        if (item.id !== id) return item
        const next = direction === 'inc' ? item.quantity + 1 : Math.max(0, item.quantity - 1)
        return { ...item, quantity: next }
      }),
    )
  }

  const handleCheckout = async () => {
    if (subtotal <= 0 || isProcessing) return
    setIsProcessing(true)
    try {
      const result = await submitCheckout({ cart, subtotal, processingFee, total })
      setReceipt(result)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Indigo commerce demo</p>
        <h1>Project Checkout Cart</h1>
        <p>
          React frontend with dummy transaction data today, designed for an eventual AWS backend
          (Lambda + API Gateway + DynamoDB + Stripe webhooks).
        </p>
        <p className="standard-note">Project standard portfolio shell</p>
      </header>

      <main className="layout">
        <section className="panel catalog">
          <div className="panel-head">
            <h2>Product List</h2>
            <span className="pill">In cart: {itemCount}</span>
          </div>
          {cart.map((item) => (
            <article key={item.id} className="item-row">
              <div className="item-copy">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              <div className="item-actions">
                <span className="price">{currency.format(item.price)}</span>
                <div className="qty">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 'dec')}
                    aria-label={`Decrease ${item.name}`}
                  >
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 'inc')}
                    aria-label={`Increase ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="panel summary">
          <div className="panel-head">
            <h2>Checkout</h2>
            <span className="pill muted">Step 2 of 2</span>
          </div>
          <h3 className="subheading">Order Summary</h3>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{currency.format(subtotal)}</dd>
            </div>
            <div>
              <dt>Processing</dt>
              <dd>{currency.format(processingFee)}</dd>
            </div>
            <div className="total">
              <dt>Total</dt>
              <dd>{currency.format(total)}</dd>
            </div>
          </dl>

          <div className="checkout-form" aria-label="Checkout details">
            <label htmlFor="customerEmail">Email for receipt</label>
            <input id="customerEmail" type="email" placeholder="shopper@example.com" />
            <label htmlFor="promoCode">Promo code</label>
            <input id="promoCode" type="text" placeholder="Optional" />
          </div>

          <button
            type="button"
            className="checkout"
            onClick={handleCheckout}
            disabled={subtotal <= 0 || isProcessing}
          >
            {isProcessing ? 'Processing…' : 'Pay now'}
          </button>

          <p className="note">Demo mode only — no real card charges are made.</p>

          {receipt && (
            <div className="receipt" role="status">
              <h3>Payment simulated</h3>
              <p>Confirmation: {receipt.confirmationId}</p>
              <p>Status: {receipt.status}</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App