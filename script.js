// Produit par défaut si localStorage est vide
const initialProducts = [
    {
        id: 1,
        name: "Hoodie Oversize Heavyweight",
        category: "Streetwear / Unisex",
        price: 450,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Pantalon Cargo Tactical Fit",
        category: "Pantalons / Urban",
        price: 390,
        image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "T-Shirt Graphic LUNARAE",
        category: "T-Shirts / Boxy Fit",
        price: 250,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Doudoune Puffer Jacket Street",
        category: "Outwear / Hiver",
        price: 750,
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop"
    }
];

// Variables globales
let products = JSON.parse(localStorage.getItem("lunarae_products")) || initialProducts;
let cart = JSON.parse(localStorage.getItem("lunarae_cart")) || [];
const ADMIN_PASS = "admin123";

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    saveProducts();
    renderProducts();
    updateCartUI();
    initEventListeners();
});

// Sauvegarder dans LocalStorage
function saveProducts() {
    localStorage.setItem("lunarae_products", JSON.stringify(products));
}

function saveCart() {
    localStorage.setItem("lunarae_cart", JSON.stringify(cart));
}

// 1. RENDER DU CATALOGUE
function renderProducts() {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-image">
                <span class="badge">Drop 2026</span>
                <img src="${p.image}" alt="${p.name}">
                <button class="add-to-cart-btn" onclick="addToCart(${p.id})">
                    <i class="fa-solid fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="category">${p.category}</p>
                <p class="price">${p.price} DH</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 2. GESTION DU PANIER
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    toggleCart(true);
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const cartBody = document.getElementById("cart-body");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total-price");
    const modalTotal = document.getElementById("modal-total-price");

    cartBody.innerHTML = "";
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartBody.innerHTML = `<p style="text-align:center; color:#999; margin-top:20px;">Votre panier est vide.</p>`;
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price} DH</p>
                    <div>
                        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                        <span style="margin: 0 8px;">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
            `;
            cartBody.appendChild(div);
        });
    }

    cartCount.textContent = count;
    cartTotal.textContent = `${total} DH`;
    modalTotal.textContent = `${total} DH`;
}

function toggleCart(open) {
    const cartDrawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("overlay");
    if (open) {
        cartDrawer.classList.add("active");
        overlay.classList.add("active");
    } else {
        cartDrawer.classList.remove("active");
        overlay.classList.remove("active");
    }
}

// 3. EVENT LISTENERS & MODALS
function initEventListeners() {
    // Menu Burger
    document.getElementById("burger-menu").addEventListener("click", () => {
        document.getElementById("nav-links").classList.toggle("active");
    });

    // Cart Drawer Toggles
    document.getElementById("open-cart-btn").addEventListener("click", () => toggleCart(true));
    document.getElementById("close-cart-btn").addEventListener("click", () => toggleCart(false));
    document.getElementById("overlay").addEventListener("click", () => {
        toggleCart(false);
        closeModals();
    });

    // Checkout Modal
    document.getElementById("checkout-btn").addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Votre panier est vide !");
            return;
        }
        toggleCart(false);
        document.getElementById("checkout-modal").classList.add("active");
    });

    document.getElementById("close-modal-btn").addEventListener("click", closeModals);
    
    // Soumission Formulaire Commande Client
    document.getElementById("order-form").addEventListener("submit", (e) => {
        e.preventDefault();
        document.getElementById("checkout-step-1").classList.add("hidden");
        document.getElementById("checkout-step-2").classList.remove("hidden");
        cart = [];
        saveCart();
        updateCartUI();
    });

    document.getElementById("finish-order-btn").addEventListener("click", () => {
        closeModals();
        document.getElementById("checkout-step-1").classList.remove("hidden");
        document.getElementById("checkout-step-2").classList.add("hidden");
    });

    // ESPACE ADMIN
    document.getElementById("open-admin-btn").addEventListener("click", () => {
        document.getElementById("admin-modal").classList.add("active");
    });
    document.getElementById("close-admin-btn").addEventListener("click", closeModals);

    // Login Admin
    document.getElementById("admin-login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const pass = document.getElementById("admin-pass-input").value;
        if (pass === ADMIN_PASS) {
            document.getElementById("admin-login-view").classList.add("hidden");
            document.getElementById("admin-dashboard-view").classList.remove("hidden");
            renderAdminTable();
        } else {
            alert("Mot de passe incorrect !");
        }
    });

    document.getElementById("admin-logout-btn").addEventListener("click", () => {
        document.getElementById("admin-login-view").classList.remove("hidden");
        document.getElementById("admin-dashboard-view").classList.add("hidden");
        document.getElementById("admin-pass-input").value = "";
    });

    // Ajouter un produit (Admin)
    document.getElementById("add-product-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const newProd = {
            id: Date.now(),
            name: document.getElementById("new-p-name").value,
            category: document.getElementById("new-p-category").value,
            price: parseFloat(document.getElementById("new-p-price").value),
            image: document.getElementById("new-p-image").value
        };

        products.push(newProd);
        saveProducts();
        renderProducts();
        renderAdminTable();
        document.getElementById("add-product-form").reset();
        alert("Nouveau produit/collection ajouté avec succès !");
    });
}

function closeModals() {
    document.getElementById("checkout-modal").classList.remove("active");
    document.getElementById("admin-modal").classList.remove("active");
}

// 4. FONCTIONS DASHBOARD ADMIN
function renderAdminTable() {
    const tbody = document.getElementById("admin-product-table");
    tbody.innerHTML = "";

    products.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${p.image}" alt=""></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>
                <input type="number" value="${p.price}" class="price-edit-input" id="price-input-${p.id}"> DH
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="saveNewPrice(${p.id})"><i class="fa-solid fa-save"></i> Enregistrer</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveNewPrice(productId) {
    const input = document.getElementById(`price-input-${productId}`);
    const newPrice = parseFloat(input.value);

    if (newPrice > 0) {
        const prod = products.find(p => p.id === productId);
        if (prod) {
            prod.price = newPrice;
            saveProducts();
            renderProducts();
            renderAdminTable();
            alert(`Le prix de "${prod.name}" a été mis à jour à ${newPrice} DH !`);
        }
    }
}

function deleteProduct(productId) {
    if (confirm("Voulez-vous vraiment supprimer ce produit de la boutique ?")) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderProducts();
        renderAdminTable();
    }
}