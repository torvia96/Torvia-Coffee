/* ============================================================
   TORVIA — cart, billing and WhatsApp order
   ------------------------------------------------------------
   >>> SET YOUR BUSINESS WHATSAPP NUMBER HERE <<<
   Format: country code + number, digits only, no + or spaces.
   Example for India: '919876543210'
   ============================================================ */
const WHATSAPP_NUMBER = '919XXXXXXXXX';

/* ---------- state ---------- */
let cart = [];
let step = 'cart'; // 'cart' | 'billing'

const productQty = {
  strong250: 1,
  strong100: 1,
  pure250: 1,
  pure100: 1,
  honey500: 1
};

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const cartEl = $('#cart');
const overlay = $('#overlay');
const stickyBar = $('#stickyBar');
const toast = $('#toast');

const totals = () => {
  const qty = cart.reduce((s, i) => s + i.qty, 0);
  const pay = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const mrp = cart.reduce((s, i) => s + i.mrp * i.qty, 0);
  return { qty, pay, mrp, saved: mrp - pay };
};

/* ---------- drawer ---------- */
function openCart(goTo) {
  step = goTo === 'billing' ? 'billing' : 'cart';
  if (!cart.length) step = 'cart';
  hideToast();
  cartEl.classList.add('show');
  cartEl.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  render();
}
function closeCart() {
  cartEl.classList.remove('show');
  cartEl.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  syncStickyBar();
}

$('#openCart').onclick = () => openCart('cart');
$('#openCart2').onclick = () => openCart('cart');
$('#closeCart').onclick = closeCart;
overlay.onclick = closeCart;
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartEl.classList.contains('show')) closeCart();
});

/* ---------- product quantity steppers ---------- */
document.querySelectorAll('[data-plus]').forEach((b) => {
  b.onclick = () => {
    const id = b.dataset.plus;
    productQty[id] = Math.min(99, (Number(productQty[id]) || 1) + 1);
    $('#qty-' + id).textContent = productQty[id];
  };
});
document.querySelectorAll('[data-minus]').forEach((b) => {
  b.onclick = () => {
    const id = b.dataset.minus;
    productQty[id] = Math.max(1, (Number(productQty[id]) || 1) - 1);
    $('#qty-' + id).textContent = productQty[id];
  };
});

/* ---------- ADD TO CART — never jumps to checkout ---------- */
document.querySelectorAll('[data-add]').forEach((btn) => {
  btn.onclick = () => {
    const id = btn.dataset.id;
    const qty = Number(productQty[id]) || 1;
    const existing = cart.find((i) => i.id === id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        mrp: Number(btn.dataset.mrp),
        qty,
        img: btn.closest('.product').querySelector('img').getAttribute('src')
      });
    }

    // reset the card stepper
    productQty[id] = 1;
    $('#qty-' + id).textContent = '1';

    // button feedback
    const label = btn.textContent;
    btn.textContent = '✓ Added';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = label; btn.classList.remove('added'); }, 1300);

    // header badge bump
    const cb = $('#openCart');
    cb.classList.remove('bump');
    void cb.offsetWidth;
    cb.classList.add('bump');

    render();
    showToast(btn.dataset.name, btn.closest('.product').querySelector('img').getAttribute('src'));
  };
});

/* ---------- toast ---------- */
let toastTimer;
function showToast(name, img) {
  if (cartEl.classList.contains('show')) return; // drawer already open
  $('#toastName').textContent = name;
  $('#toastImg').src = img;
  toast.hidden = false;
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4500);
}
function hideToast() {
  clearTimeout(toastTimer);
  toast.classList.remove('show');
  setTimeout(() => { if (!toast.classList.contains('show')) toast.hidden = true; }, 320);
}
$('#toastKeep').onclick = hideToast;
$('#toastView').onclick = () => openCart('cart');

/* ---------- sticky bar ---------- */
function syncStickyBar() {
  const { qty, pay } = totals();
  if (!qty || cartEl.classList.contains('show')) {
    stickyBar.classList.remove('show');
    setTimeout(() => { if (!stickyBar.classList.contains('show')) stickyBar.hidden = true; }, 360);
    return;
  }
  $('#sbCount').textContent = qty + (qty === 1 ? ' item in cart' : ' items in cart');
  $('#sbTotal').textContent = rupees(pay);
  stickyBar.hidden = false;
  void stickyBar.offsetWidth;
  stickyBar.classList.add('show');
}
$('#sbKeep').onclick = () => {
  hideToast();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
};
$('#sbGo').onclick = () => openCart('cart');
$('#emptyShop').onclick = () => {
  closeCart();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
};

/* ---------- cart line controls ---------- */
window.changeQty = (index, delta) => {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  if (!cart.length) step = 'cart';
  render();
};
window.removeItem = (index) => {
  cart.splice(index, 1);
  if (!cart.length) step = 'cart';
  render();
};

/* ---------- steps ---------- */
$('#proceedBtn').onclick = () => {
  if (!cart.length) return;
  step = 'billing';
  render();
  $('#stepBilling').scrollTop = 0;
};
$('#backBtn').onclick = () => { step = 'cart'; render(); };

/* ---------- render ---------- */
function render() {
  const { qty, pay, mrp, saved } = totals();

  $('#cartCount').textContent = qty;
  if (!cart.length) step = 'cart';

  /* ---- step 1: items ---- */
  $('#cartItems').innerHTML = cart.length
    ? cart.map((item, i) => `
        <div class="cart-row">
          <img src="${esc(item.img)}" alt="">
          <div>
            <h4>${esc(item.name)}</h4>
            <div class="cart-price-line">
              <span>${rupees(item.price)}</span>
              ${item.mrp > item.price ? `<s>${rupees(item.mrp)}</s>` : ''}
            </div>
            <div class="qty">
              <button type="button" onclick="changeQty(${i},-1)" aria-label="Decrease">−</button>
              <span>${item.qty}</span>
              <button type="button" onclick="changeQty(${i},1)" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="cart-right">
            <strong>${rupees(item.price * item.qty)}</strong>
            <button type="button" class="remove" onclick="removeItem(${i})">Remove</button>
          </div>
        </div>`).join('') +
      `<button type="button" class="keep-shopping" onclick="closeCartAndShop()">+ Add another product</button>`
    : `<div class="empty">
         <p>Your cart is waiting for something from Coorg.</p>
         <button type="button" class="empty-cta" onclick="closeCartAndShop()">Browse the collection</button>
       </div>`;

  /* ---- step 2: itemised bill ---- */
  $('#billBox').innerHTML = `
    <h4>ORDER SUMMARY</h4>
    ${cart.map((i) => `
      <div class="bill-row">
        <span>${esc(i.name)} <span class="q">× ${i.qty}</span></span>
        <span>${rupees(i.price * i.qty)}</span>
      </div>`).join('')}`;

  /* ---- shared summary + payable ---- */
  $('#summaryBox').innerHTML = `
    <div class="sum-row"><span>Items</span><span>${qty}</span></div>
    ${saved > 0 ? `<div class="sum-row"><span>MRP total</span><s>${rupees(mrp)}</s></div>` : ''}
    ${saved > 0 ? `<div class="sum-row save"><span>Discount</span><span>− ${rupees(saved)}</span></div>` : ''}
    <div class="sum-row"><span>Delivery</span><span>To be confirmed</span></div>`;
  $('#payAmount').textContent = rupees(pay);

  /* ---- step chrome ---- */
  const billing = step === 'billing';
  $('#stepCart').hidden = billing;
  $('#stepBilling').hidden = !billing;
  $('#proceedBtn').hidden = billing;
  $('#finalActions').hidden = !billing;
  $('#proceedBtn').disabled = !cart.length;
  $('#cartTitle').textContent = billing ? 'Billing' : 'Cart';
  $('#cartStepLabel').textContent = billing ? 'STEP 2 OF 2 — BILLING & DELIVERY' : 'STEP 1 OF 2 — YOUR CART';

  syncStickyBar();
}

window.closeCartAndShop = () => {
  closeCart();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
};

/* ---------- validation ---------- */
function validate() {
  const f = {
    customerName: $('#customerName'),
    phone: $('#phone'),
    address: $('#address'),
    city: $('#city'),
    pincode: $('#pincode')
  };
  Object.values(f).forEach((el) => el.classList.remove('err'));

  const missing = Object.entries(f).filter(([, el]) => !el.value.trim());
  if (missing.length) {
    missing.forEach(([, el]) => el.classList.add('err'));
    missing[0][1].focus();
    return 'Please fill in your name, mobile number, address, city and PIN code.';
  }
  const phone = f.phone.value.replace(/\D/g, '');
  if (phone.length < 10) { f.phone.classList.add('err'); f.phone.focus(); return 'Please enter a valid 10-digit mobile number.'; }
  if (!/^\d{6}$/.test(f.pincode.value.trim())) { f.pincode.classList.add('err'); f.pincode.focus(); return 'Please enter a valid 6-digit PIN code.'; }
  return '';
}

/* ---------- WhatsApp order ---------- */
$('#whatsapp').onclick = () => {
  const errBox = $('#formError');
  errBox.hidden = true;

  if (!cart.length) { step = 'cart'; render(); return; }

  const problem = validate();
  if (problem) { errBox.textContent = problem; errBox.hidden = false; return; }

  const name = $('#customerName').value.trim();
  const phone = $('#phone').value.trim();
  const address = $('#address').value.trim();
  const city = $('#city').value.trim();
  const pin = $('#pincode').value.trim();
  const notes = $('#notes').value.trim();
  const { qty, pay, mrp, saved } = totals();

  let m = '*TORVIA — NEW ORDER*\n\n';
  m += `*Customer:* ${name}\n*Mobile:* ${phone}\n\n`;
  m += `*Delivery Address:*\n${address}\n${city} - ${pin}\n\n`;
  m += '*ORDER DETAILS*\n';
  cart.forEach((i) => {
    m += `• ${i.name} × ${i.qty} — ${rupees(i.price * i.qty)}\n`;
  });
  m += `\n*Items:* ${qty}`;
  if (saved > 0) {
    m += `\n*MRP Total:* ${rupees(mrp)}`;
    m += `\n*Discount:* − ${rupees(saved)}`;
  }
  m += `\n\n*AMOUNT TO PAY: ${rupees(pay)}*`;
  m += '\n_(Delivery charges NOT included — please confirm shipping for my address.)_';
  if (notes) m += `\n\n*Notes:* ${notes}`;
  m += '\n\nPlease confirm the order, delivery charge and payment details.';

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(m)}`, '_blank');
};

/* ---------- nav shadow ---------- */
const nav = $('#siteNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

render();
