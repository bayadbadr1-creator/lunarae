// ==========================================
// 1. DONNÉES DES PRODUITS (DATABASE PROVISOIRE)
// ==========================================
const products = [
    {
        id: 1,
        name: "Oversized Hoodie Vintage Black",
        category: "hoodies",
        price: 350,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "T-Shirt Graphic Heavyweight White",
        category: "tshirts",
        price: 220,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Cargo Pants Tactical Grey",
        category: "pants",
        price: 420,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Zip Hoodie Urban Street",
        category: "hoodies",
        price: 380,
        image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500&auto=format&fit=crop"
    }
];

// État global du panier
let cart = JSON.parse(localStorage.getItem('lunarae_cart')) || [];

// ==========================================
// 2. INITIALISATION DU SITE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    updateCartUI();
    setupEventListeners();
});

// ==========================================
// 3. AFFICHAGE DES PRODUITS
// ==========================================
function displayProducts(items) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = items.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${product.price} DH</p>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">
                    Ajouter au panier
                </button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 4. GESTION DU PANIER (AJOUT, SUPPRESSION)
// ==========================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    openCartModal();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('lunarae_cart', JSON.stringify(cart));
}

// ==========================================
// 5. MISE À JOUR DE L'INTERFACE DU PANIER
// ==========================================
function updateCartUI() {
    // Compteur de panier dans la barre de navigation
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.innerText = totalItems;

    // Éléments du panier
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.price} DH</p>
                        <div class="quantity-controls">
                            <button onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">&times;</button>
                </div>
            `).join('');
        }
    }

    // Calcul du Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalElement) cartTotalElement.innerText = `${total} DH`;
}

// ==========================================
// 6. ENVOI DE LA COMMANDE SUR WHATSAPP 📱
// ==========================================
function checkoutWhatsApp(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    // Récupération des données du formulaire
    const nom = document.getElementById('client-name').value.trim();
    const telephone = document.getElementById('client-phone').value.trim();
    const adresse = document.getElementById('client-address').value.trim();
    const ville = document.getElementById('client-city').value.trim();

    if (!nom || !telephone || !adresse || !ville) {
        alert("Veuillez remplir tous les champs de livraison.");
        return;
    }

    // Numéro WhatsApp cible (Maroc)
    const whatsappNum = "212705948052";

    // Préparation de la liste des articles
    let itemsText = "";
    let totalPrix = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        totalPrix += subtotal;
        itemsText += `• *${item.name}* (x${item.quantity}) : ${subtotal} DH\n`;
    });

    // Construction du message WhatsApp
    const message = `🛍️ *NOUVELLE COMMANDE - LUNARAE.MA*\n` +
                    `----------------------------------\n` +
                    `👤 *Nom :* ${nom}\n` +
                    `📞 *Téléphone :* ${telephone}\n` +
                    `📍 *Adresse :* ${adresse}\n` +
                    `🏙️ *Ville :* ${ville}\n` +
                    `----------------------------------\n` +
                    `📦 *PRODUITS COMMANDÉS :*\n` +
                    `${itemsText}` +
                    `----------------------------------\n` +
                    `💰 *TOTAL À PAYER :* ${totalPrix} DH\n` +
                    `💳 *Mode de paiement :* Cash à la livraison\n\n` +
                    `Merci de confirmer la commande !`;

    // Encodage et ouverture de l'application WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
    
    // Réinitialiser le panier après la commande
    cart = [];
    saveCart();
    updateCartUI();
    closeCartModal();

    // Redirection WhatsApp
    window.open(whatsappURL, '_blank');
}

// ==========================================
// 7. ÉVÉNEMENTS & MODALE PANIER
// ==========================================
function setupEventListeners() {
    // Boutons d'ouverture/fermeture Panier
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const checkoutForm = document.getElementById('checkout-form');

    if (cartBtn) cartBtn.addEventListener('click', openCartModal);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);
    if (checkoutForm) checkoutForm.addEventListener('submit', checkoutWhatsApp);

    // Filtres par catégorie
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.dataset.category;
            if (category === 'all') {
                displayProducts(products);
            } else {
                const filtered = products.filter(p => p.category === category);
                displayProducts(filtered);
            }
        });
    });
}

function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.add('active');
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.remove('active');
}