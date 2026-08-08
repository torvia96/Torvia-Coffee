const WHATSAPP_NUMBER = '919XXXXXXXXX';

let cart = [];
const productQty = {
  strong250: 1,
  strong100: 1,
  pure250: 1,
  pure100: 1,
  honey500: 1
};

const $ = (s) => document.querySelector(s);
const cartEl = $('#cart');
const overlay = $('#overlay');

function openCart() {
  cartEl.classList.add('show');
  overlay.classList.add('show');
}
function closeCart() {
  cartEl.classList.remove('show');
  overlay.classList.remove('show');
}

$('#openCart').onclick = openCart;
$('#openCart2').onclick = openCart;
$('#closeCart').onclick = closeCart;
overlay.onclick = closeCart;

document.querySelectorAll('[data-plus]').forEach((button) => {
  button.onclick = () => {
    const id = button.dataset.plus;
    productQty[id] = (Number(productQty[id]) || 1) + 1;
    $('#qty-' + id).textContent = productQty[id];
  };
});

document.querySelectorAll('[data-minus]').forEach((button) => {
  button.onclick = () => {
    const id = button.dataset.minus;
    productQty[id] = Math.max(1, (Number(productQty[id]) || 1) - 1);
    $('#qty-' + id).textContent = productQty[id];
  };
});

document.querySelectorAll('[data-add]').forEach((button) => {
  button.onclick = () => {
    const id = button.dataset.id;
    const qty = Number(productQty[id]) || 1;
    const price = Number(button.dataset.price);
    const mrp = Number(button.dataset.mrp);
    const existing = cart.find((item) => item.id === id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id,
        name: button.dataset.name,
        price,
        mrp,
        qty,
        img: button.closest('.product').querySelector('img').src
      });
    }

    productQty[id] = 1;
    $('#qty-' + id).textContent = '1';
    render();
    openCart();
  };
});

function render() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + item.mrp * item.qty, 0);

  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = '₹' + total.toLocaleString('en-IN');

  $('#cartItems').innerHTML = cart.length
    ? cart.map((item, index) => `
      <div class="cart-row">
        <img src="${item.img}" alt="">
        <div>
          <h4>${item.name}</h4>
          <div class="cart-price-line">
            <span>₹${item.price.toLocaleString('en-IN')}</span>
            <s>MRP ₹${item.mrp.toLocaleString('en-IN')}</s>
          </div>
          <div class="qty">
            <button onclick="changeQty(${index}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>
        </div>
        <strong>₹${(item.price * item.qty).toLocaleString('en-IN')}</strong>
      </div>
    `).join('')
    : '<div class="empty">Your cart is waiting for something from Coorg.</div>';

  const saving = mrpTotal - total;
  const savingEl = $('#cartSaving');
  if (savingEl) {
    savingEl.textContent = saving > 0 ? 'You save ₹' + saving.toLocaleString('en-IN') : '';
  }
}

window.changeQty = (index, delta) => {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  render();
};

$('#whatsapp').onclick = () => {
  if (!cart.length) return alert('Please add a product first.');

  const name = $('#customerName').value.trim();
  const phone = $('#phone').value.trim();
  const address = $('#address').value.trim();
  const city = $('#city').value.trim();
  const pin = $('#pincode').value.trim();
  const notes = $('#notes').value.trim();

  if (!name || !phone || !address || !city || !pin) {
    return alert('Please fill in your name, mobile, address, city and PIN code.');
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + item.mrp * item.qty, 0);
  const savings = mrpTotal - total;

  let message = `*TORVIA — NEW ORDER*\n\n`;
  message += `*Customer:* ${name}\n*Mobile:* ${phone}\n\n`;
  message += `*Delivery Address:*\n${address}\n${city} - ${pin}\n\n`;
  message += `*ORDER DETAILS*\n`;

  cart.forEach((item) => {
    message += `• ${item.name} × ${item.qty} — ₹${(item.price * item.qty).toLocaleString('en-IN')} (MRP ₹${(item.mrp * item.qty).toLocaleString('en-IN')})\n`;
  });

  message += `\n*MRP Total: ₹${mrpTotal.toLocaleString('en-IN')}*`;
  message += `\n*Offer Total: ₹${total.toLocaleString('en-IN')}*`;
  if (savings > 0) message += `\n*You Save: ₹${savings.toLocaleString('en-IN')}*`;
  message += `\n\nPlease confirm the order and payment details.`;
  if (notes) message += `\n\n*Notes:* ${notes}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
};

render();
