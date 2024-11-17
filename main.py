from tkinter import *
from tkinter import IntVar, messagebox
import stripe

root = Tk()
root.title("This is a test frame.")
root.geometry("400x700")
# root.iconbitmap('input pathway here for different window icon')

frame = LabelFrame(root, padx=10, pady=20)
frame.pack(padx=20, pady=20)

button = Button(frame, text="Dont click here.")
# dont put this in root, add it to frame instead
button.grid(row=0, column=0)
button2 = Button(frame, text="Or here....")
# you can also use grid and pack together when working with frames
button2.grid(row=1, column=0)


# radio buttons or the round buttons next to menu


def Click(value):
    myLabel = Label(root, text=value)
    myLabel.pack()


# using a kinter variable here, not python
r: IntVar = IntVar()  # lets kinter update changes throught the entire program
r.set("1")

# create a Python tuple list for wanted radio options
TOPPINGS = [
    ("Pepperoni", "Pepperoni"),
    ("Cheese", "Cheese"),  # first thing is option shows on screen, 2nd is the value it passes
    ("Mushroom", "Mushroom"),
    ("Olive", "Olive"),
]
pizza = StringVar()
pizza.set("Pepperoni")

for text, mode in TOPPINGS:
    Radiobutton(root, text=text, variable=pizza, value=mode).pack(anchor=W)  # loop to create alot of buttons easier

# radio1 = Radiobutton(root, text="Option 1", variable=r, value=1, command=lambda : Click(r.get()))  # when they click this one, it is option 1
# radio1.pack()
# radio2 = Radiobutton(root, text="Option 2", variable=r, value=2, command=lambda : Click(r.get()))  # when they click this one, it is option 2
# radio2.pack()
# myLabel = Label(root, text= r.get())
# myLabel.pack()
myButton = Button(root, text="Add to Cart...", command=lambda: Click(pizza.get()))
myButton.pack()


# MESSAGE BOX
# can use showinfo, showwarning, showerror, askquestion, askokcancel, askyesno
def Popup():
    response = messagebox.askyesno("This is my popbox", "Hello World")
    print(response)
    if response == 1:
        Label(root, text="You clicked Yes").pack()
    else:
        Label(root, text="You clicked No").pack()


Button(root, text="popup", command=Popup).pack()

# SLIDERS
# notice how you have to use an underscore for the from, also how it is called Scale not slider
slider1 = Scale(root, from_=0, to=100)
slider1.pack()
slider2 = Scale(root, from_=0, to=10, orient=HORIZONTAL)
slider2.pack()

# CHECKBOXES

def Show():
    label4 = Label(root, text=var.get()).pack()


var = StringVar()
checkbox1 = Checkbutton(root, text="check here to add fries and a drink +$4",variable=var, onvalue="On", offvalue="Off")
checkbox1.deselect()
checkbox1.pack()
myButton4 = Button(root, text="Show Selection", command=Show).pack()



# DROP DOWN BOX

clicked = StringVar()
clicked.set("Monday")
dropdown1 = OptionMenu(root, clicked, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday")
dropdown1.pack()
print(clicked.get())



root.mainloop()



























"""
```

python
import stripe

# Set your secret key (get this from your Stripe Dashboard)
stripe.api_key = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'  # Replace with your own secret key

# Example: Create a PaymentIntent to charge a customer
def create_payment_intent(amount, currency='usd'):
    try:
        # Create a PaymentIntent object
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount is in cents, so 1000 is $10.00
            currency=currency,
        )
        print(f"Payment Intent created: {payment_intent.id}")
        return payment_intent
    except stripe.error.StripeError as e:
        print(f"Error creating payment intent: {e}")
        return None

# Example of creating a PaymentIntent for $10.00 (1000 cents)
payment_intent = create_payment_intent(1000)

# You can now use this payment_intent for further actions (like confirming it, handling the payment flow, etc.)
```

### 4. Handling the Client-Side (Frontend)

On the client-side (e.g., a web app), youll need to create a Stripe Checkout session or handle Stripe Elements to collect payment details securely. Here's an example of how to create a Checkout session using the `stripe.checkout.sessions.create()` method:
python
def create_checkout_session():
    try:
        # Create a Checkout Session to redirect the user to Stripe's hosted checkout page
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'T-shirt',
                        },
                        'unit_amount': 2000,  # Amount in cents (e.g., $20.00)
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url='https://your-site.com/success',
            cancel_url='https://your-site.com/cancel',
        )
        return session.url  # URL for the user to be redirected to for payment
    except stripe.error.StripeError as e:
        print(f"Error creating checkout session: {e}")
        return None

checkout_url = create_checkout_session()
if checkout_url:
    print(f"Redirect the user to: {checkout_url}")


### 5. Handle Webhooks for Asynchronous Payment Status Updates (Optional)

Stripe sends events to your server via webhooks to notify you of changes in payment status (e.g., successful payments, failed payments, etc.). You can use this feature to update your system when a payment is completed.

Set up a webhook endpoint (e.g., using Flask or Django) to receive and handle these events. Here's an example using Flask:

python
from flask import Flask, request, jsonify
import stripe

app = Flask(__name__)

# Set your secret key (use your own key from Stripe)
stripe.api_key = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'

# Your webhook secret (get this from the Stripe Dashboard)
endpoint_secret = 'whsec_...'

@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')

    try:
        # Verify the webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']  # contains a Stripe PaymentIntent
            print(f"PaymentIntent was successful! ID: {payment_intent['id']}")

        # Add more event handling logic for other events as needed
        # (e.g., payment_intent.failed, charge.succeeded, etc.)

        return '', 200  # Respond with a 200 status to acknowledge receipt

    except ValueError as e:
        # Invalid payload
        print(f"Invalid payload: {e}")
        return '', 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print(f"Webhook signature verification failed: {e}")
        return '', 400

if __name__ == '__main__':
    app.run(port=4242)
"""
