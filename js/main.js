document.addEventListener("DOMContentLoaded", () => {

    const cartCountEl = document.querySelector("[data-cart-count]");
    const cartListEl = document.querySelector("[data-cart-items]");
    const clearButton = document.querySelector("[data-clear-cart]");
    const productButtons = document.querySelectorAll("[data-add-to-cart] button");

    const loginBtn = document.querySelector("[data-login-btn]");
    const logoutBtn = document.querySelector("[data-logout-btn]");

    const STORAGE_KEY = "pulseThreadsCart";
    const USER_KEY = "PulseUser";
    const VIEWED_KEY = "PulseRecentlyViewed";
    const FAVORITES_KEY = "pulseThreadsFavorites";

    // Price mapping for all products
    const PRICE_MAP = {
        "AeroFlex Jacket": 129.99,
        "Lumen Slip Dress": 89.99,
        "Nova Playset": 59.99,
        "Bundle Boost Pack": 199.99,
        "Arc Parka": 179.99,
        "Halo Knit Set": 119.99,
        "Strata Blazer": 149.99,
        "Lithe Wrap Set": 99.99,
        "Solace Trench": 189.99,
        "Aster Knit Dress": 79.99,
        "Nova Explorer Set": 69.99,
        "Prism Rain Kit": 49.99,
        "Orbit Sneaker Pack": 54.99,
        "Weekender Bundle": 249.99,
        "Studio Pack": 129.99,
        "Mini Explorer Trio": 89.99
    };

    let cartState = readCartState();

    updateBadge();
    renderCartItems();
    applyAuthState();
    initializeFavorites();

    if (productButtons) {
        productButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const card = button.closest("[data-add-to-cart]");
                const product = card.getAttribute("data-product");
                const category = card.getAttribute("data-category");
                const price = PRICE_MAP[product] || 0;

                addToCart(product, category, price, button);
                addRecentlyViewed(product, category);
            });
        });
    }
    
    // Display prices on products
    displayProductPrices();

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem(USER_KEY);
            applyAuthState();
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            cartState = { count: 0, items: [] };
            persistCart();
            updateBadge();
            renderCartItems();
        });
    }

    function applyAuthState() {
        const user = readUser();
        if (user && user.loggedIn) {
            if (loginBtn) loginBtn.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "inline-block";
        } else {
            if (loginBtn) loginBtn.style.display = "inline-block";
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    }

    function addRecentlyViewed(product, category) {
        const list = readRecentlyViewed();
        list.unshift({ product, category });

        const unique = [];
        const names = new Set();

        list.forEach((item) => {
            if (!names.has(item.product)) {
                names.add(item.product);
                unique.push(item);
            }
        });

        const finalList = unique.slice(0, 6);
        localStorage.setItem(VIEWED_KEY, JSON.stringify(finalList));
    }

    function readRecentlyViewed() {
        try {
            const raw = localStorage.getItem(VIEWED_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function addToCart(product, category, price, button) {
        cartState.count += 1;
        cartState.items.push({ product, category, price });
        persistCart();
        updateBadge();
        renderCartItems();

        if (button) {
            button.classList.add("pulse");
            setTimeout(() => button.classList.remove("pulse"), 400);
        }
    }
    
    function displayProductPrices() {
        const productCards = document.querySelectorAll("[data-add-to-cart]");
        productCards.forEach(card => {
            const product = card.getAttribute("data-product");
            const price = PRICE_MAP[product];
            
            if (price) {
                // Check if price already exists
                if (!card.querySelector(".product-price")) {
                    const priceEl = document.createElement("p");
                    priceEl.className = "product-price";
                    priceEl.textContent = `$${price.toFixed(2)}`;
                    
                    // Insert before the "Add to cart" button
                    const button = card.querySelector("button[type='button']:not(.favorite-btn)");
                    if (button) {
                        button.parentNode.insertBefore(priceEl, button);
                    } else {
                        card.appendChild(priceEl);
                    }
                }
            }
        });
    }

    function renderCartItems() {
        if (!cartListEl) return;

        cartListEl.innerHTML = "";

        if (!cartState.items.length) {
            const empty = document.createElement("li");
            empty.className = "empty-state";
            empty.textContent = "Your cart is empty.";
            cartListEl.appendChild(empty);
            
            // Hide checkout button if cart is empty
            const checkoutBtn = document.querySelector("[data-checkout-btn]");
            if (checkoutBtn) checkoutBtn.style.display = "none";
            return;
        }

        let total = 0;
        cartState.items.forEach((item) => {
            const li = document.createElement("li");
            let label = "";
            const price = item.price || PRICE_MAP[item.product] || 0;
            total += price;

            if (item.category === "mens") label = "Menswear pick";
            else if (item.category === "womens") label = "Womenswear pick";
            else if (item.category === "kids") label = "Kidswear pick";
            else if (item.category === "discount") label = "Discount deal";
            else label = "Fresh drop";

            li.innerHTML = `
                <div>
                    <span class="product-name">${item.product}</span>
                    <span class="product-label">${label}</span>
                </div>
                <span class="product-price-cart">$${price.toFixed(2)}</span>
            `;
            cartListEl.appendChild(li);
        });
        
        // Add total if cart total element exists
        const cartTotalEl = document.querySelector("[data-cart-total]");
        if (cartTotalEl) {
            cartTotalEl.textContent = `$${total.toFixed(2)}`;
        }
        
        // Show checkout button if cart has items
        const checkoutBtn = document.querySelector("[data-checkout-btn]");
        if (checkoutBtn) checkoutBtn.style.display = "inline-block";
    }

    function updateBadge() {
        if (cartCountEl) {
            cartCountEl.textContent = cartState.count.toString();
        }
    }

    function readCartState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : { count: 0, items: [] };
        } catch {
            return { count: 0, items: [] };
        }
    }

    function persistCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
    }

    function readUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    const recentListEl = document.querySelector("[data-recently-viewed]");
    if (recentListEl) {
        const viewed = readRecentlyViewed();
        viewed.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.product + " (" + item.category + ")";
            recentListEl.appendChild(li);
        });
    }

    // Favorites functionality
    function initializeFavorites() {
        const favoriteButtons = document.querySelectorAll("[data-favorite-btn]");
        favoriteButtons.forEach(button => {
            const card = button.closest("[data-add-to-cart]");
            if (card) {
                const product = card.getAttribute("data-product");
                const category = card.getAttribute("data-category");
                updateFavoriteButton(button, product, category);
                
                // Remove existing listeners to avoid duplicates
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleFavorite(product, category, newButton);
                });
            }
        });
    }
    
    // Make functions globally accessible
    window.initializeFavorites = initializeFavorites;
    window.addToCartFromFavorites = function(product, category) {
        const price = PRICE_MAP[product] || 0;
        addToCart(product, category, price, null);
    };
    window.getCartState = function() {
        return cartState;
    };
    window.PRICE_MAP = PRICE_MAP;

    function toggleFavorite(product, category, button) {
        const favorites = readFavorites();
        const itemKey = `${product}_${category}`;
        const index = favorites.findIndex(item => `${item.product}_${item.category}` === itemKey);
        
        if (index > -1) {
            // Remove from favorites
            favorites.splice(index, 1);
            button.classList.remove("active");
            button.setAttribute("aria-label", "Add to favorites");
        } else {
            // Add to favorites
            favorites.push({ product, category });
            button.classList.add("active");
            button.setAttribute("aria-label", "Remove from favorites");
        }
        
        persistFavorites(favorites);
    }

    function updateFavoriteButton(button, product, category) {
        const favorites = readFavorites();
        const itemKey = `${product}_${category}`;
        const isFavorite = favorites.some(item => `${item.product}_${item.category}` === itemKey);
        
        if (isFavorite) {
            button.classList.add("active");
            button.setAttribute("aria-label", "Remove from favorites");
        } else {
            button.classList.remove("active");
            button.setAttribute("aria-label", "Add to favorites");
        }
    }

    function readFavorites() {
        try {
            const raw = localStorage.getItem(FAVORITES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function persistFavorites(favorites) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }

    // Export for use in favorites.html
    window.getFavorites = readFavorites;

});
