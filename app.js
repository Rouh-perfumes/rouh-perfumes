// ==========================================================================
// متجر رُوح للعطور | ROUH & CO. — SCENTS FOR YOUR STORY
// Official Interactive Script (Faces.eg Luxury Architecture)
// Version: 2026.2 (Unisex Support, Mouse Drag/Scroll Fix, High Contrast Light Theme)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const productsGrid = document.getElementById("products-grid");
  const desktopSearchInput = document.getElementById("desktop-search-input");
  const desktopSearchClear = document.getElementById("desktop-search-clear");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  const searchSuggestions = document.getElementById("search-suggestions");
  const sortSelect = document.getElementById("sort-select");
  const resultsCount = document.getElementById("results-count");
  const activeTagsContainer = document.getElementById("active-tags-container");
  
  // Theme Toggle
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIconSun = document.getElementById("theme-icon-sun");
  const themeIconMoon = document.getElementById("theme-icon-moon");
  const mainBrandLogo = document.getElementById("main-brand-logo");

  // Announcement Ticker
  const tickerItems = document.querySelectorAll(".ticker-item");
  const tickerPrev = document.getElementById("ticker-prev");
  const tickerNext = document.getElementById("ticker-next");

  // Story Track & Category Pills
  const storyHighlightsTrack = document.getElementById("story-highlights-track");
  const storyPrevBtn = document.getElementById("story-prev-btn");
  const storyNextBtn = document.getElementById("story-next-btn");
  const storyItems = document.querySelectorAll(".story-item");

  const categoryPillsContainer = document.getElementById("category-pills-container");
  const pillsScrollPrev = document.getElementById("pills-scroll-prev");
  const pillsScrollNext = document.getElementById("pills-scroll-next");
  const filterPills = document.querySelectorAll(".filter-pill");

  // Gender Chips
  const genderChips = document.querySelectorAll(".gender-chip");

  // Wishlist Elements
  const openWishlistBtn = document.getElementById("open-wishlist-btn");
  const wishlistDrawer = document.getElementById("wishlist-drawer");
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const wishlistItemsList = document.getElementById("wishlist-items-list");
  const wishlistTotalPrice = document.getElementById("wishlist-total-price");
  const btnWishlistCheckout = document.getElementById("btn-wishlist-checkout");
  const wishlistCounter = document.getElementById("wishlist-counter");
  const bottomWishlistBadge = document.getElementById("bottom-wishlist-badge");

  // Quick View Modal Elements
  const quickviewModal = document.getElementById("quickview-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalContentBody = document.getElementById("modal-content-body");

  // Mobile Bottom Nav
  const mobileNavHome = document.getElementById("mobile-nav-home");
  const mobileNavSearch = document.getElementById("mobile-nav-search");
  const mobileNavWishlist = document.getElementById("mobile-nav-wishlist");

  // Toast
  const toastFeedback = document.getElementById("toast-feedback");
  const toastText = document.getElementById("toast-text");

  // --- State Variables ---
  let currentCategory = "all";
  let currentGender = "all";
  let searchQuery = "";
  let currentSort = "default";
  let activeTickerIndex = 0;
  let tickerInterval;

  // LocalStorage Wishlist
  let wishlist = [];
  try {
    const saved = localStorage.getItem("rouh_wishlist");
    if (saved) wishlist = JSON.parse(saved);
  } catch (e) {
    wishlist = [];
  }

  // --- 1. Theme Management (Dark Theme as Default) ---
  function initTheme() {
    const savedTheme = localStorage.getItem("rouh_theme") || "dark";
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      themeIconSun.style.display = "none";
      themeIconMoon.style.display = "block";
      if (mainBrandLogo) mainBrandLogo.src = "logo.png";
    } else {
      document.body.classList.remove("light-theme");
      themeIconSun.style.display = "block";
      themeIconMoon.style.display = "none";
      if (mainBrandLogo) mainBrandLogo.src = "logo_dark.png";
    }
  }

  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem("rouh_theme", isLight ? "light" : "dark");
    themeIconSun.style.display = isLight ? "none" : "block";
    themeIconMoon.style.display = isLight ? "block" : "none";
    if (mainBrandLogo) mainBrandLogo.src = isLight ? "logo.png" : "logo_dark.png";
    showToast(isLight ? "تم تفعيل الوضع النهاري" : "تم تفعيل الوضع الليلي الفاخر ✨");
  });

  // --- 2. Announcement Ticker Logic ---
  function showTickerItem(index) {
    tickerItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
    activeTickerIndex = index;
  }

  function nextTicker() {
    const nextIdx = (activeTickerIndex + 1) % tickerItems.length;
    showTickerItem(nextIdx);
  }

  function prevTicker() {
    const prevIdx = (activeTickerIndex - 1 + tickerItems.length) % tickerItems.length;
    showTickerItem(prevIdx);
  }

  if (tickerNext && tickerPrev) {
    tickerNext.addEventListener("click", () => {
      clearInterval(tickerInterval);
      nextTicker();
      startTickerAuto();
    });
    tickerPrev.addEventListener("click", () => {
      clearInterval(tickerInterval);
      prevTicker();
      startTickerAuto();
    });
  }

  function startTickerAuto() {
    clearInterval(tickerInterval);
    tickerInterval = setInterval(nextTicker, 4500);
  }

  // --- 3. Mouse Wheel & Drag to Scroll on Category Pills & Stories ---
  function setupHorizontalScrolling(container, prevBtn, nextBtn) {
    if (!container) return;

    // A) Mouse Wheel support (converts vertical wheel deltaY to horizontal scroll)
    container.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        // In RTL languages, scrolling direction is inverted
        container.scrollBy({ left: -e.deltaY * 1.5, behavior: "auto" });
      }
    }, { passive: false });

    // B) Mouse Click & Drag (Grab to Scroll)
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener("mousedown", (e) => {
      isDown = true;
      container.classList.add("grabbing");
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener("mouseleave", () => {
      isDown = false;
      container.classList.remove("grabbing");
    });

    container.addEventListener("mouseup", () => {
      isDown = false;
      container.classList.remove("grabbing");
    });

    container.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.8;
      container.scrollLeft = scrollLeft - walk;
    });

    // C) Prev / Next Buttons Click
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        container.scrollBy({ left: 240, behavior: "smooth" });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        container.scrollBy({ left: -240, behavior: "smooth" });
      });
    }
  }

  setupHorizontalScrolling(categoryPillsContainer, pillsScrollPrev, pillsScrollNext);
  setupHorizontalScrolling(storyHighlightsTrack, storyPrevBtn, storyNextBtn);

  // --- 4. Category Counts Setup ---
  function updateCategoryCounts() {
    const totalCount = PRODUCTS.length;
    
    // Update individual pills and stories
    document.querySelectorAll("[data-category]").forEach(el => {
      const cat = el.getAttribute("data-category");
      let count = 0;
      if (cat === "all") {
        count = totalCount;
      } else {
        count = PRODUCTS.filter(p => p.category === cat).length;
      }
      
      const pillCount = el.querySelector(".pill-count");
      if (pillCount) pillCount.textContent = count;
      
      const storyCount = el.querySelector(".story-count");
      if (storyCount) storyCount.textContent = count;
    });
  }

  // --- 5. Filtering and Sorting Logic ---
  function getFilteredProducts() {
    return PRODUCTS.filter(product => {
      // Category Match
      const matchCat = (currentCategory === "all") || (product.category === currentCategory);

      // Gender Match (Quick filter)
      const matchGender = (currentGender === "all") || (product.gender === currentGender);

      // Search Query Match
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCat && matchGender;

      const inName = (product.name || "").toLowerCase().includes(query);
      const inBrand = (product.brand || "").toLowerCase().includes(query);
      const inCode = (product.id || "").toLowerCase().includes(query);
      const inDesc = (product.desc || "").toLowerCase().includes(query);
      const inNotes = (product.notes || []).some(n => n.toLowerCase().includes(query));

      return matchCat && matchGender && (inName || inBrand || inCode || inDesc || inNotes);
    }).sort((a, b) => {
      if (currentSort === "price-asc") return a.price - b.price;
      if (currentSort === "price-desc") return b.price - a.price;
      if (currentSort === "name-asc") return a.name.localeCompare(b.name, "ar");
      return 0; // default catalog order
    });
  }

  // --- 6. Render Products Grid ---
  function renderProducts() {
    const list = getFilteredProducts();
    resultsCount.textContent = list.length;
    renderActiveTags();

    if (list.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-catalog-state">
          <div class="empty-state-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3 class="empty-state-title">عفواً، لا توجد عطور مطابقة للبحث!</h3>
          <p class="empty-state-text">جرب البحث بكلمة أخرى، اسم العطر، الكود (مثل RH-0010)، أو إحدى النوتات العطرية كـ (فانيلا، عنبر، عود).</p>
          <button class="btn-primary-gold" onclick="resetAllFilters()">عرض كل العطور (198)</button>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = list.map(p => {
      const isWishlisted = wishlist.includes(p.id);
      const genderBadge = p.gender === 'unisex' ? '🚻 للجنسين' : (p.gender === 'women' ? '👗 حريمي' : '👔 رجالي');

      return `
        <div class="product-card" data-id="${p.id}">
          <div class="card-header-bar">
            <span class="card-badge" title="${escapeHtml(p.categoryName || '')}">${genderBadge} • ${escapeHtml(p.categoryName || 'عطر فاخر')}</span>
            <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                    onclick="toggleWishlist('${p.id}', event)" 
                    title="${isWishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div class="card-image-wrapper" onclick="openQuickView('${p.id}')">
            <img src="${p.image || 'images/logo.jpg'}" alt="${escapeHtml(p.name)}" class="card-product-img" loading="lazy" onerror="this.src='batch1_images/img_001.jpg';">
            <span class="card-size-tag">${escapeHtml(p.size || '100 ml')}</span>
            <div class="card-quickview-overlay">
              <span class="btn-quickview-hover">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                عرض سريع
              </span>
            </div>
          </div>

          <div class="card-details">
            <span class="card-brand-label">${escapeHtml(p.brand || 'ROUH & CO.')}</span>
            <h3 class="card-product-title" onclick="openQuickView('${p.id}')" style="cursor:pointer;" title="${escapeHtml(p.name)}">
              ${escapeHtml(p.name)}
            </h3>

            <div class="card-notes-list">
              ${(p.notes || []).slice(0, 3).map(n => `<span class="note-chip" onclick="searchByNote('${escapeHtml(n)}', event)">${escapeHtml(n)}</span>`).join('')}
            </div>
          </div>

          <div class="card-footer-box">
            <div class="card-price-container">
              <span class="price-val">${Number(p.price).toLocaleString('en-US')}</span>
              <span class="price-currency-lbl">${STORE_CONFIG.currency || 'ج.م'}</span>
            </div>

            <button class="btn-card-order-messenger" onclick="orderViaMessenger('${p.id}')" title="طلب مباشر عبر ماسنجر">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.908 1.455 5.516 3.737 7.199V22l3.413-1.874c.905.251 1.865.388 2.85.388 5.523 0 10-4.145 10-9.256C22 6.145 17.523 2 12 2zm1.002 12.443l-2.55-2.72-4.978 2.72 5.474-5.815 2.614 2.72 4.914-2.72-5.474 5.815z"/>
              </svg>
              <span>طلب العطر</span>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- 7. Active Filter Tags Indicator ---
  function renderActiveTags() {
    let tagsHtml = "";
    if (currentGender !== "all") {
      const genderLabel = currentGender === "unisex" ? "للجنسين (Unisex)" : (currentGender === "men" ? "رجالي" : "حريمي");
      tagsHtml += `<span class="active-tag">الفئة: ${escapeHtml(genderLabel)} <span class="active-tag-remove" onclick="filterByGender('all')">✕</span></span>`;
    }
    if (currentCategory !== "all") {
      const activeBtn = document.querySelector(`.filter-pill[data-category="${currentCategory}"]`);
      const catLabel = activeBtn ? activeBtn.querySelector("span").textContent : currentCategory;
      tagsHtml += `<span class="active-tag">قسم: ${escapeHtml(catLabel)} <span class="active-tag-remove" onclick="filterBy('all')">✕</span></span>`;
    }
    if (searchQuery.trim()) {
      tagsHtml += `<span class="active-tag">بحث: "${escapeHtml(searchQuery)}" <span class="active-tag-remove" onclick="clearSearch()">✕</span></span>`;
    }
    activeTagsContainer.innerHTML = tagsHtml;
  }

  // --- 8. Search & Predictive Suggestions ---
  function handleSearchInput(val) {
    searchQuery = val;
    desktopSearchInput.value = val;
    if (mobileSearchInput) mobileSearchInput.value = val;

    desktopSearchClear.style.display = val ? "block" : "none";

    // Predictive Dropdown for Desktop
    if (val.trim().length >= 2) {
      const matches = PRODUCTS.filter(p => {
        const q = val.toLowerCase();
        return (p.name || "").toLowerCase().includes(q) ||
               (p.brand || "").toLowerCase().includes(q) ||
               (p.id || "").toLowerCase().includes(q);
      }).slice(0, 5);

      if (matches.length > 0) {
        searchSuggestions.innerHTML = matches.map(p => `
          <div class="suggestion-item" onclick="openQuickView('${p.id}'); hideSuggestions();">
            <img src="${p.image || 'batch1_images/img_001.jpg'}" alt="${escapeHtml(p.name)}" class="suggestion-img">
            <div class="suggestion-details">
              <div class="suggestion-name">${escapeHtml(p.name)}</div>
              <div class="suggestion-meta">${escapeHtml(p.brand || '')} • ${escapeHtml(p.size || '100 ml')}</div>
            </div>
            <div class="suggestion-price">${Number(p.price).toLocaleString('en-US')} ج.م</div>
          </div>
        `).join("");
        searchSuggestions.classList.add("show");
      } else {
        searchSuggestions.classList.remove("show");
      }
    } else {
      searchSuggestions.classList.remove("show");
    }

    renderProducts();
  }

  desktopSearchInput.addEventListener("input", (e) => handleSearchInput(e.target.value));
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", (e) => handleSearchInput(e.target.value));
  }

  desktopSearchClear.addEventListener("click", () => {
    clearSearch();
    desktopSearchInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search-container")) {
      searchSuggestions.classList.remove("show");
    }
  });

  window.hideSuggestions = function() {
    searchSuggestions.classList.remove("show");
  };

  window.clearSearch = function() {
    searchQuery = "";
    desktopSearchInput.value = "";
    if (mobileSearchInput) mobileSearchInput.value = "";
    desktopSearchClear.style.display = "none";
    hideSuggestions();
    renderProducts();
  };

  window.searchByNote = function(note, event) {
    if (event) event.stopPropagation();
    handleSearchInput(note);
    document.getElementById("catalog-section").scrollIntoView({ behavior: "smooth" });
  };

  // --- 9. Filter Pills & Stories Interaction ---
  window.filterBy = function(cat) {
    currentCategory = cat;

    // Synchronize both pills and story items
    filterPills.forEach(pill => {
      pill.classList.toggle("active", pill.getAttribute("data-category") === cat);
    });

    storyItems.forEach(story => {
      story.classList.toggle("active", story.getAttribute("data-category") === cat);
    });

    renderProducts();
  };

  window.filterByGender = function(gender) {
    currentGender = gender;
    genderChips.forEach(chip => {
      chip.classList.toggle("active", chip.getAttribute("data-gender") === gender);
    });
    renderProducts();
  };

  filterPills.forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-category");
      filterBy(cat);
    });
  });

  storyItems.forEach(story => {
    story.addEventListener("click", () => {
      const cat = story.getAttribute("data-category");
      filterBy(cat);
      document.getElementById("catalog-section").scrollIntoView({ behavior: "smooth" });
    });
  });

  // Sort Selection
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  window.resetAllFilters = function() {
    clearSearch();
    filterByGender("all");
    filterBy("all");
  };

  // --- 10. Wishlist Management (LocalStorage) ---
  function updateWishlistBadge() {
    const count = wishlist.length;
    wishlistCounter.textContent = count;
    bottomWishlistBadge.textContent = count;
    wishlistCounter.classList.add("bump");
    setTimeout(() => wishlistCounter.classList.remove("bump"), 300);
  }

  window.toggleWishlist = function(productId, event) {
    if (event) event.stopPropagation();
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      showToast(`تمت إزالة (${product.name}) من المفضلة`);
    } else {
      wishlist.push(productId);
      showToast(`✨ تمت إضافة (${product.name}) إلى المفضلة`);
    }

    try {
      localStorage.setItem("rouh_wishlist", JSON.stringify(wishlist));
    } catch (e) {}

    updateWishlistBadge();
    renderProducts();
    if (wishlistDrawer.classList.contains("open")) {
      renderWishlistDrawer();
    }
  };

  function renderWishlistDrawer() {
    if (wishlist.length === 0) {
      wishlistItemsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🤍</div>
          <h4 style="color: var(--text-primary); font-size: 1.1rem; margin-bottom: 0.5rem;">قائمة المفضلة فارغة حالياً</h4>
          <p style="font-size: 0.85rem;">اضغط على علامة القلب (❤️) الموجودة على أي عطر لإضافته لقائمتك المفضلة والرجوع له بسهولة.</p>
        </div>
      `;
      wishlistTotalPrice.textContent = "0 ج.م";
      btnWishlistCheckout.style.display = "none";
      return;
    }

    btnWishlistCheckout.style.display = "flex";
    const items = wishlist.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    const total = items.reduce((sum, p) => sum + (p.price || 0), 0);
    wishlistTotalPrice.textContent = `${total.toLocaleString('en-US')} ج.م`;

    wishlistItemsList.innerHTML = items.map(p => `
      <div class="drawer-item-card">
        <img src="${p.image || 'batch1_images/img_001.jpg'}" alt="${escapeHtml(p.name)}" class="drawer-item-img">
        <div class="drawer-item-info">
          <div class="drawer-item-name">${escapeHtml(p.name)}</div>
          <div class="drawer-item-price">${Number(p.price).toLocaleString('en-US')} ج.م</div>
        </div>
        <button class="drawer-remove-item" onclick="toggleWishlist('${p.id}')" title="إزالة">
          ✕
        </button>
      </div>
    `).join("");
  }

  openWishlistBtn.addEventListener("click", () => {
    renderWishlistDrawer();
    wishlistDrawer.classList.add("open");
  });

  drawerCloseBtn.addEventListener("click", () => {
    wishlistDrawer.classList.remove("open");
  });

  wishlistDrawer.addEventListener("click", (e) => {
    if (e.target === wishlistDrawer) wishlistDrawer.classList.remove("open");
  });

  // Bulk Wishlist Checkout to Messenger
  btnWishlistCheckout.addEventListener("click", () => {
    const items = wishlist.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    if (items.length === 0) return;

    const total = items.reduce((sum, p) => sum + (p.price || 0), 0);
    let message = `مرحباً متجر رُوح، أود طلب العطور التالية من قائمتي المفضلة:\n\n`;

    items.forEach((p, i) => {
      message += `${i + 1}. ${p.name} (${p.id}) - ${p.price} ج.م\n`;
    });

    message += `\n💰 الإجمالي التقديري: ${total.toLocaleString('en-US')} ج.م\n` +
               `----------------------\n` +
               `برجاء تأكيد توفر العطور وتحديد موعد الشحن.`;

    copyAndOpenMessenger(message, `تم نسخ طلب ${items.length} عطور مفضلة! جاري فتح ماسنجر...`);
  });

  // --- 11. Quick View Modal ---
  window.openQuickView = function(productId) {
    const p = PRODUCTS.find(prod => prod.id === productId);
    if (!p) return;

    const isWishlisted = wishlist.includes(p.id);
    const genderBadge = p.gender === 'unisex' ? '🚻 للجنسين (Unisex)' : (p.gender === 'women' ? '👗 حريمي' : '👔 رجالي');

    modalContentBody.innerHTML = `
      <div class="modal-image-col">
        <img src="${p.image || 'batch1_images/img_001.jpg'}" alt="${escapeHtml(p.name)}" class="modal-perfume-img">
      </div>
      <div class="modal-info-col">
        <span class="modal-brand">${escapeHtml(p.brand || 'ROUH & CO.')}</span>
        <h2 class="modal-title">${escapeHtml(p.name)}</h2>

        <div class="modal-meta-row">
          <span class="card-badge">${genderBadge}</span>
          <span class="card-badge">${escapeHtml(p.categoryName || 'عطر فاخر')}</span>
          <span style="font-size: 0.82rem; color: var(--gold-accent);">الحجم: ${escapeHtml(p.size || '100 ml')}</span>
          <span style="font-size: 0.82rem; color: var(--text-muted); font-family: monospace;">كود: ${escapeHtml(p.id)}</span>
        </div>

        <p class="modal-desc">
          ${escapeHtml(p.desc || 'توليفة عطرية ملكية فاخرة مختارة بعناية لتحقيق أقصى درجات الثبات والفوحان.')}
        </p>

        <div class="modal-notes-section">
          <div class="modal-notes-heading">النوتات والمكونات العطرية:</div>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
            ${(p.notes || []).map(n => `<span class="note-chip">${escapeHtml(n)}</span>`).join('')}
          </div>
        </div>

        <div class="modal-price-action-row">
          <div class="card-price-container">
            <span class="price-val" style="font-size:1.6rem;">${Number(p.price).toLocaleString('en-US')}</span>
            <span class="price-currency-lbl">${STORE_CONFIG.currency || 'ج.م'}</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem;">
            <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${p.id}'); openQuickView('${p.id}');" title="المفضلة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>

            <button class="btn-card-order-messenger" style="padding:0.75rem 1.4rem; font-size:0.95rem;" onclick="orderViaMessenger('${p.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.908 1.455 5.516 3.737 7.199V22l3.413-1.874c.905.251 1.865.388 2.85.388 5.523 0 10-4.145 10-9.256C22 6.145 17.523 2 12 2zm1.002 12.443l-2.55-2.72-4.978 2.72 5.474-5.815 2.614 2.72 4.914-2.72-5.474 5.815z"/></svg>
              <span>طلب العطر عبر ماسنجر</span>
            </button>
          </div>
        </div>
      </div>
    `;

    quickviewModal.classList.add("open");
  };

  modalCloseBtn.addEventListener("click", () => {
    quickviewModal.classList.remove("open");
  });

  quickviewModal.addEventListener("click", (e) => {
    if (e.target === quickviewModal) quickviewModal.classList.remove("open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      quickviewModal.classList.remove("open");
      wishlistDrawer.classList.remove("open");
    }
  });

  // --- 12. Order via Messenger Logic ---
  window.orderViaMessenger = function(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const message = `مرحباً متجر رُوح، أود طلب العطر التالي:\n` +
      `✨ الاسم: ${product.name}\n` +
      `🏷️ الكود: ${product.id}\n` +
      `📦 الحجم: ${product.size}\n` +
      `💰 السعر: ${product.price} ج.م\n` +
      `----------------------\n` +
      `برجاء تأكيد توفر العطر وإرسال تفاصيل الشحن.`;

    copyAndOpenMessenger(message, `تم نسخ بيانات (${product.name})! جاري فتح شات ماسنجر...`);
  };

  function copyAndOpenMessenger(text, successToastMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successToastMsg);
      }).catch(() => {
        showToast("جاري فتح شات ماسنجر...");
      });
    } else {
      showToast("جاري فتح شات ماسنجر...");
    }

    setTimeout(() => {
      window.open(STORE_CONFIG.messengerUrl, "_blank");
    }, 700);
  }

  // --- 13. Toast Feedback ---
  let toastTimeout;
  function showToast(msg) {
    toastText.textContent = msg;
    toastFeedback.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastFeedback.classList.remove("show");
    }, 3500);
  }

  // --- 14. Mobile Bottom Nav Handlers ---
  mobileNavHome.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveBottomNav(mobileNavHome);
  });

  mobileNavSearch.addEventListener("click", () => {
    document.getElementById("catalog-section").scrollIntoView({ behavior: "smooth" });
    const mobSearch = document.getElementById("mobile-search-input");
    if (mobSearch) mobSearch.focus();
    setActiveBottomNav(mobileNavSearch);
  });

  mobileNavWishlist.addEventListener("click", () => {
    renderWishlistDrawer();
    wishlistDrawer.classList.add("open");
  });

  function setActiveBottomNav(activeItem) {
    document.querySelectorAll(".bottom-nav-item").forEach(item => item.classList.remove("active"));
    activeItem.classList.add("active");
  }

  // Header Scroll Effect
  window.addEventListener("scroll", () => {
    const header = document.getElementById("site-header");
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Helper Escape HTML
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Initialize Everything ---
  initTheme();
  startTickerAuto();
  updateCategoryCounts();
  updateWishlistBadge();
  renderProducts();
});
