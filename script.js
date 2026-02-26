let cart = [];

// --- НАВІГАЦІЯ ТА МЕНЮ ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    
    // Перемикаємо анімацію кнопки (три палки -> хрестик)
    if (menuBtn) menuBtn.classList.toggle('open');
    
    if (!sidebar.classList.contains('active')) {
        sidebar.style.display = 'block';
        setTimeout(() => {
            sidebar.classList.add('active');
        }, 10);
    } else {
        sidebar.classList.remove('active');
        setTimeout(() => {
            sidebar.style.display = 'none';
        }, 500); // Час анімації елегантного меню
    }
}

function login() {
    const email = prompt("Введіть ваш Email:");
    if (email === "admin@levkovo.com") {
        alert("Вітаю, пане Адміністратор!");
        const adminLink = document.getElementById('admin-link');
        if (adminLink) adminLink.style.display = 'block';
    } else if (email) {
        alert("Ви увійшли як користувач.");
    }
}

// --- КОШИК ---
function openCart() {
    document.getElementById('cartModal').style.display = 'flex';
    renderCart();
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function addToCart(name, price, img) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, img, qty: 1, selected: true, escaped: false });
    }
    updateCartCount();
    openCart();
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) countElement.innerText = cart.length;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        if (item.selected) total += item.price * item.qty;

        container.innerHTML += `
            <div class="cart-item">
                <input type="checkbox" class="cart-checkbox" ${item.selected ? 'checked' : ''} onclick="toggleSelect(${index})">
                <img src="${item.img}" class="cart-img">
                <div style="flex-grow:1;">
                    <div style="font-weight:bold; font-size:0.9rem;">${item.name}</div>
                    <div style="display:flex; gap:10px; align-items:center; margin-top:5px;">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="runaway-delete ${item.escaped ? 'active' : ''}" 
                     style="${item.escaped ? `top:${item.ey}px; left:${item.ex}px;` : ''}"
                     onclick="handleDelete(${index})">✕</div>
            </div>
        `;
    });
    const totalElement = document.getElementById('cart-total');
    if (totalElement) totalElement.innerText = `Разом: ${total} грн`;
}

function handleDelete(index) {
    if (!cart[index].escaped) {
        // Хрестик активується і тікає в межах видимого вікна
        cart[index].escaped = true;
        const margin = 50;
        cart[index].ex = Math.random() * (window.innerWidth - margin * 2) + margin;
        cart[index].ey = Math.random() * (window.innerHeight - margin * 2) + margin;
        renderCart();
    } else {
        // Видалення товару
        cart.splice(index, 1);
        updateCartCount();
        renderCart();
    }
}

function toggleSelect(index) {
    cart[index].selected = !cart[index].selected;
    renderCart();
}

function changeQty(index, delta) {
    if (cart[index].qty + delta > 0) {
        cart[index].qty += delta;
        renderCart();
    }
}

// --- ОФОРМЛЕННЯ ЗАМОВЛЕННЯ ---
function openCheckout() {
    closeCart(); 
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'flex';
        renderCheckoutSummary();
    }
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function renderCheckoutSummary() {
    const container = document.getElementById('checkout-items');
    let total = 0;
    container.innerHTML = '';

    cart.forEach(item => {
        if (item.selected) {
            total += item.price * item.qty;
            container.innerHTML += `
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom: 5px;">
                    <span>${item.name} x${item.qty}</span>
                    <span>${item.price * item.qty} грн</span>
                </div>`;
        }
    });
    const checkoutTotal = document.getElementById('checkout-total');
    if (checkoutTotal) checkoutTotal.innerText = `До сплати: ${total} грн`;
}

// --- ФОРМУВАННЯ ЧЕКА ТА ЗАВЕРШЕННЯ ---
function generateReceipt(event) {
    event.preventDefault(); 
    
    const totalText = document.getElementById('checkout-total').innerText;
    let itemsText = cart.filter(i => i.selected).map(i => `${i.name} [x${i.qty}]`).join('<br>');

    const receiptHTML = `
        <div style="text-align:center;">
            <h2 style="margin-bottom:5px;">LEVKOVO HANDMADE</h2>
            <p style="font-size:0.8rem;">Вінниця, Crazy Horse Leather</p>
            <hr style="border:1px dashed #ccc;">
            <div style="text-align:left; font-size:0.9rem; margin: 15px 0;">
                ${itemsText}
            </div>
            <hr style="border:1px dashed #ccc;">
            <h3 style="margin: 15px 0;">${totalText}</h3>
            <p style="font-style:italic;">Дякуємо за замовлення!</p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="modal-btn btn-confirm" onclick="window.print()">Друк чека</button>
                <button class="modal-btn btn-continue" onclick="location.reload()">На головну</button>
            </div>
        </div>
    `;

    const receiptPrint = document.getElementById('receiptPrint');
    const receiptOverlay = document.getElementById('receiptOverlay');
    
    if (receiptPrint && receiptOverlay) {
        receiptPrint.innerHTML = receiptHTML;
        receiptOverlay.style.display = 'flex';
    }
}
function handleShippingChange() {
    const method = document.getElementById('shippingMethod').value;
    const npOptions = document.getElementById('npOptions');
    const details = document.getElementById('shippingDetails');
    
    // Очищуємо поля при зміні
    details.innerHTML = '';
    details.style.display = 'none';

    if (method === 'nova') {
        npOptions.style.display = 'block';
    } else if (method === 'ukr') {
        npOptions.style.display = 'none';
        details.style.display = 'block';
        details.innerHTML = `
            <input type="text" placeholder="Місто" required>
            <input type="text" placeholder="Номер відділення Укрпошти (індекс)" required style="margin-top:10px;">
        `;
    }
}

function handleNPTypeChange() {
    const type = document.getElementById('npType').value;
    const details = document.getElementById('shippingDetails');
    details.style.display = 'block';
    details.innerHTML = ''; // Очищуємо перед додаванням нових

    if (type === 'department') {
        details.innerHTML = `
            <input type="text" placeholder="Місто" required>
            <input type="text" placeholder="Номер відділення Нової Пошти" required style="margin-top:10px;">
        `;
    } else if (type === 'courier') {
        details.innerHTML = `
            <input type="text" placeholder="Місто" required>
            <input type="text" placeholder="Вулиця" required style="margin-top:10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top:10px;">
                <input type="text" placeholder="Буд." required>
                <input type="text" placeholder="Під'їзд">
                <input type="text" placeholder="Кв.">
            </div>
        `;
    }
}
// Твої дані (встав сюди свої цифри)
const TG_TOKEN = "8705332906:AAHBZOXkeKIkg9YjLAHtRiMO1K8mdmR4HJI"; 
const TG_CHAT_ID = "1366887003";

async function generateReceipt(event) {
    event.preventDefault(); 
    
    // Збираємо дані з полів форми
    const formData = {
        firstName: event.target[0].value,
        lastName: event.target[1].value,
        phone: event.target[2].value,
        email: event.target[3].value,
        callback: document.querySelector('input[name="callback"]:checked').value,
        shipping: document.getElementById('shippingMethod').value,
        details: Array.from(document.querySelectorAll('#shippingDetails input')).map(i => i.value).join(', '),
        payment: document.getElementById('paymentMethod').value,
        comment: document.querySelector('textarea').value
    };

    const totalText = document.getElementById('checkout-total').innerText;
    let itemsText = cart.filter(i => i.selected).map(i => `${i.name} [x${i.qty}]`).join('\n');

    // Формуємо шаблон повідомлення для Telegram
    const message = `
📦 **НОВЕ ЗАМОВЛЕННЯ: LEVKOVO**
-------------------------
👤 **Клієнт:** ${formData.firstName} ${formData.lastName}
📞 **Тел:** ${formData.phone}
📧 **Email:** ${formData.email}
💬 **Зв'язок:** ${formData.callback}

🛒 **Товари:**
${itemsText}

💰 **${totalText}**
-------------------------
🚚 **Доставка:** ${formData.shipping}
📍 **Адреса:** ${formData.details}
💳 **Оплата:** ${formData.payment}
📝 **Коментар:** ${formData.comment}
    `;

    // Відправка в Telegram
    try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        // Показуємо чек після успішної відправки
        renderReceiptOverlay(totalText, itemsText);
    } catch (error) {
        alert("Помилка відправки замовлення. Спробуйте ще раз.");
    }
}

function renderReceiptOverlay(total, items) {
    const receiptHTML = `
        <div style="text-align:center;">
            <h2>ЗАМОВЛЕННЯ ПРИЙНЯТО ✅</h2>
            <p>Вже скоро ви будете власником виробу ручно роботи від levkovo</p>
            <p>Замовлення вже опрацьовується</p>
            <hr>
            <div style="text-align:left;">${items.replace(/\n/g, '<br>')}</div>
            <hr>
            <h3>${total}</h3>
            <button class="modal-btn btn-confirm" onclick="window.print()">Друк чека</button>
            <button class="modal-btn btn-continue" onclick="location.reload()">На головну</button>
        </div>
    `;
    document.getElementById('receiptPrint').innerHTML = receiptHTML;
    document.getElementById('receiptOverlay').style.display = 'flex';
}