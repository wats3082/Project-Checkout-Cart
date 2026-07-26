import { useMemo, useState } from 'react'
import { products } from './data/products'
import { submitCheckout } from './services/checkoutApi'
import './App.css'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const initialEntryForm = {
  name: '',
  price: '',
  quantity: '1',
  category: 'Services',
  status: 'Active',
  notes: '',
}

function App() {
  const [cart, setCart] = useState(() => products.map((item) => ({ ...item, quantity: 0 })))
  const [isProcessing, setIsProcessing] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [activeView, setActiveView] = useState('checkout')
  const [entryForm, setEntryForm] = useState(initialEntryForm)
  const [formErrors, setFormErrors] = useState({})
  const [entryNotice, setEntryNotice] = useState('')

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

  const openView = (viewName) => {
    setActiveView(viewName)
    if (viewName === 'add-entry') {
      setEntryNotice('')
    } else {
      setFormErrors({})
    }
  }

  const handleEntryChange = (event) => {
    const { name, value } = event.target
    setEntryForm((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const validateEntry = () => {
    const nextErrors = {}
    const price = Number(entryForm.price)
    const quantity = Number(entryForm.quantity)

    if (!entryForm.name.trim()) nextErrors.name = 'Item name is required.'
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = 'Enter a valid price greater than 0.'
    if (!Number.isInteger(quantity) || quantity < 1) {
      nextErrors.quantity = 'Quantity must be a whole number of at least 1.'
    }
    if (!entryForm.category.trim()) nextErrors.category = 'Category is required.'
    if (!entryForm.status.trim()) nextErrors.status = 'Status is required.'

    return nextErrors
  }

  const handleEntrySubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateEntry()
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      return
    }

    const name = entryForm.name.trim()
    const price = Number(entryForm.price)
    const quantity = Number(entryForm.quantity)
    const category = entryForm.category.trim()
    const status = entryForm.status.trim()
    const notes = entryForm.notes.trim()
    const description = [`Category: ${category}`, `Status: ${status}`, notes && `Notes: ${notes}`]
      .filter(Boolean)
      .join(' • ')

    const newEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      description,
      price,
      quantity,
    }

    setCart((items) => [...items, newEntry])
    setEntryForm(initialEntryForm)
    setFormErrors({})
    setReceipt(null)
    setEntryNotice(`Added ${name} to the product list.`)
    setActiveView('checkout')
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

      <nav className="view-nav" aria-label="Checkout app sections">
        <button
          type="button"
          className={`view-tab ${activeView === 'checkout' ? 'is-active' : ''}`}
          onClick={() => openView('checkout')}
        >
          Checkout View
        </button>
        <button
          type="button"
          className={`view-tab ${activeView === 'add-entry' ? 'is-active' : ''}`}
          onClick={() => openView('add-entry')}
        >
          Add Entry
        </button>
      </nav>

      {activeView === 'checkout' ? (
        <main className="layout">
          <section className="panel catalog">
            <div className="panel-head">
              <div className="panel-title-block">
                <p className="panel-kicker">Step 1 · Build cart</p>
                <h2>Product List</h2>
              </div>
              <span className="pill">In cart: {itemCount}</span>
            </div>
            {entryNotice && (
              <p className="entry-notice" role="status">
                {entryNotice}
              </p>
            )}
            {cart.map((item) => (
              <article key={item.id} className="item-row">
                <div className="item-copy">
                  <h3>
                    <span className="item-accent" aria-hidden="true">
                      ◉
                    </span>
                    {item.name}
                  </h3>
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
              <div className="panel-title-block">
                <p className="panel-kicker">Step 2 · Confirm payment</p>
                <h2>Checkout</h2>
              </div>
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
              <div className="field">
                <label htmlFor="customerEmail">Email for receipt</label>
                <input id="customerEmail" type="email" placeholder="shopper@example.com" />
              </div>
              <div className="field">
                <label htmlFor="promoCode">Promo code</label>
                <input id="promoCode" type="text" placeholder="Optional" />
              </div>
            </div>

            <button
              type="button"
              className="checkout"
              onClick={handleCheckout}
              disabled={subtotal <= 0 || isProcessing}
            >
              {isProcessing ? 'Processing…' : 'Complete demo checkout'}
            </button>
            <p className="cta-meta">🔒 Secure-style demo flow</p>

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
      ) : (
        <main className="layout add-layout">
          <section className="panel add-entry-panel">
            <div className="panel-head">
              <div className="panel-title-block">
                <p className="panel-kicker">Add payment/cart entry</p>
                <h2>Add Entry</h2>
              </div>
              <span className="pill">Products: {cart.length}</span>
            </div>

            <form className="entry-form" onSubmit={handleEntrySubmit} noValidate>
              <div className="field">
                <label htmlFor="entryName">Item name *</label>
                <input
                  id="entryName"
                  name="name"
                  value={entryForm.name}
                  onChange={handleEntryChange}
                  placeholder="Cloud Compliance Bundle"
                />
                {formErrors.name && <p className="field-error">{formErrors.name}</p>}
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="entryPrice">Price (USD) *</label>
                  <input
                    id="entryPrice"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={entryForm.price}
                    onChange={handleEntryChange}
                    placeholder="129.00"
                  />
                  {formErrors.price && <p className="field-error">{formErrors.price}</p>}
                </div>

                <div className="field">
                  <label htmlFor="entryQuantity">Quantity *</label>
                  <input
                    id="entryQuantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={entryForm.quantity}
                    onChange={handleEntryChange}
                  />
                  {formErrors.quantity && <p className="field-error">{formErrors.quantity}</p>}
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="entryCategory">Category *</label>
                  <select
                    id="entryCategory"
                    name="category"
                    value={entryForm.category}
                    onChange={handleEntryChange}
                  >
                    <option value="Services">Services</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Digital Goods">Digital Goods</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                  {formErrors.category && <p className="field-error">{formErrors.category}</p>}
                </div>

                <div className="field">
                  <label htmlFor="entryStatus">Status *</label>
                  <select
                    id="entryStatus"
                    name="status"
                    value={entryForm.status}
                    onChange={handleEntryChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Backorder">Backorder</option>
                  </select>
                  {formErrors.status && <p className="field-error">{formErrors.status}</p>}
                </div>
              </div>

              <div className="field">
                <label htmlFor="entryNotes">Notes</label>
                <textarea
                  id="entryNotes"
                  name="notes"
                  rows="3"
                  value={entryForm.notes}
                  onChange={handleEntryChange}
                  placeholder="Optional internal note for checkout context."
                />
              </div>

              <div className="entry-actions">
                <button type="submit" className="checkout">
                  Add entry to list
                </button>
                <button type="button" className="view-tab" onClick={() => openView('checkout')}>
                  Back to checkout
                </button>
              </div>
            </form>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
