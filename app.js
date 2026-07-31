
const searchContainer = document.querySelector('.search-container');
const searchInput = document.querySelector('#search-input');
const searchInfo = document.querySelector('.search-results-info');
const btnSearch = document.querySelector('#search-icon');
const cartContent = document.querySelector('.cart-container');
const cartBtn = document.querySelector('#cart-icon');
const userBtn = document.querySelector('#user-icon');
const userContent = document.querySelector('.user-cotainer');
const burgerMenu = document.querySelector('#burger-menu');
const navList = document.querySelector('.navigation');
const navLinks = document.querySelectorAll('.navigation a');

const closePanels = () => {
    searchContainer?.classList.remove('active');
    cartContent?.classList.remove('active');
    userContent?.classList.remove('active');
    navList?.classList.remove('active');
};

if (btnSearch) {
    btnSearch.addEventListener('click', (e) => {
        e.stopPropagation();
        searchContainer?.classList.toggle('active');
        cartContent?.classList.remove('active');
        userContent?.classList.remove('active');
    });
}

if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartContent?.classList.toggle('active');
        searchContainer?.classList.remove('active');
        userContent?.classList.remove('active');
    });
}

if (userBtn) {
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userContent?.classList.toggle('active');
        searchContainer?.classList.remove('active');
        cartContent?.classList.remove('active');
        navList?.classList.remove('active');
    });
}

if (burgerMenu) {
    burgerMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        navList?.classList.toggle('active');
        searchContainer?.classList.remove('active');
        cartContent?.classList.remove('active');
        userContent?.classList.remove('active');
    });
}

if (navList) {
    navList.addEventListener('click', (e) => e.stopPropagation());
}

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
        if (window.innerWidth <= 900) {
            navList?.classList.remove('active');
        }
    });
});

if (searchContainer) {
    searchContainer.addEventListener('click', (e) => e.stopPropagation());
}

if (cartContent) {
    cartContent.addEventListener('click', (e) => e.stopPropagation());
}

if (userContent) {
    userContent.addEventListener('click', (e) => e.stopPropagation());
}

document.addEventListener('click', closePanels);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePanels();
    }
});

const productItems = Array.from(document.querySelectorAll('.produits-box'));
const newsItems = Array.from(document.querySelectorAll('.news .box'));
const allSearchableItems = [...productItems, ...newsItems];

const normalizeForSearch = (value) => {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/(.)\1+/g, '$1');
};

const getSearchText = (element) => {
    return [
        element.querySelector('h2')?.textContent,
        element.querySelector('img')?.alt,
        element.querySelector('img')?.src,
        element.querySelector('span')?.textContent,
        element.textContent,
        element.dataset.search
    ].filter(Boolean).join(' ');
};

const matchesQuery = (text, query) => {
    const normalizedText = normalizeForSearch(text);
    const normalizedQuery = normalizeForSearch(query);

    if (!normalizedQuery) return true;

    return normalizedText.includes(normalizedQuery)
        || normalizedText.includes(normalizedQuery.replace(/ll/g, 'l'));
};

const filterProducts = () => {
    const query = searchInput?.value.trim() || '';
    let visibleCount = 0;

    allSearchableItems.forEach((item) => {
        const matches = matchesQuery(getSearchText(item), query);
        item.style.display = matches ? '' : 'none';
        if (matches) visibleCount += 1;
    });

    if (searchInfo) {
        if (!query) {
            searchInfo.textContent = '';
        } else if (visibleCount) {
            searchInfo.textContent = `${visibleCount} produit(s) correspondant(s)`;
        } else {
            searchInfo.textContent = 'Aucun produit trouvé.';
        }
    }
};

if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
}

const cartItemsList = document.querySelector('.cart-items');
const cartTotalValue = document.querySelector('.cart-total-value');
const cartEmpty = document.querySelector('.cart-empty');
const cartData = [];

const parsePrice = (value) => {
    if (!value) return 0;
    const digits = String(value).replace(/\s+/g, '').replace(/FCFA|fcfa|F CFA|CFA/g, '').match(/\d+/g);
    return digits ? Number(digits.join('')) : 0;
};

const formatPrice = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value);
};

const getProductInfo = (element) => {
    const image = element.querySelector('img')?.src || '';
    const name = element.querySelector('h2')?.textContent?.trim()
        || element.querySelector('img')?.alt?.trim()
        || 'Produit';
    const priceText = element.querySelector('span')?.textContent || element.querySelector('h3')?.textContent || '';
    const price = parsePrice(priceText);

    return { name, price, image };
};

const renderCart = () => {
    cartItemsList.innerHTML = '';

    if (!cartData.length) {
        cartEmpty.style.display = 'block';
        cartTotalValue.textContent = '0';
        return;
    }

    cartEmpty.style.display = 'none';

    cartData.forEach((item) => {
        const cartCard = document.createElement('div');
        cartCard.className = 'cart-card';
        cartCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-text">
                <h3>${item.name}</h3>
                <span>${formatPrice(item.price)} FCFA</span>
                <span>${item.quantity}x</span>
            </div>
            <i class="bx bx-trash" data-id="${item.id}"></i>
        `;
        cartItemsList.appendChild(cartCard);
    });

    const total = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalValue.textContent = formatPrice(total);
};

const addCartItem = (product) => {
    const id = `${product.name}-${product.price}-${product.image}`;
    const existingItem = cartData.find((item) => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartData.push({ ...product, id, quantity: 1 });
    }

    renderCart();
};

const removeCartItem = (id) => {
    const index = cartData.findIndex((item) => item.id === id);
    if (index !== -1) {
        cartData.splice(index, 1);
        renderCart();
    }
};

const productCartButtons = document.querySelectorAll('.produits-box-content .bx-cart');
productCartButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const box = button.closest('.produits-box');
        if (!box) return;
        addCartItem(getProductInfo(box));
    });
});

const newsCartButtons = document.querySelectorAll('.news .btn');
newsCartButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const box = button.closest('.box');
        if (!box) return;
        addCartItem(getProductInfo(box));
    });
});

cartItemsList.addEventListener('click', (e) => {
    if (e.target.matches('.bx-trash')) {
        removeCartItem(e.target.dataset.id);
    }
});

renderCart();

      var swiper = new Swiper('.news-cont', {
        spaceBetween: 20,
        loop: true,
        centeredSlides: true,
        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },
        breakpoints: {
            0: {
                slidesPerView: 1,
            },
            568: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 2,
            },
            1020: {
                slidesPerView: 3,
            }
        },
      });
    

// Adaptive video behavior: pause on small screens to save bandwidth
(function(){
    const vid = document.querySelector('.adaptive-video');
    if (!vid) return;

    const handle = () => {
        if (window.innerWidth < 600) {
            vid.pause();
        } else {
            // try to play (muted allows autoplay on many browsers)
            vid.play().catch(() => {});
        }
    };

    window.addEventListener('resize', handle);
    document.addEventListener('DOMContentLoaded', handle);
    handle();
})();



