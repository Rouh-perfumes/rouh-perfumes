// --- منطق تفاعل تطبيق متجر رُوح للعطور ---
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const productsGrid = document.getElementById("products-grid");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");
  const sortSelect = document.getElementById("sort-select");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const resultsCount = document.getElementById("results-count");
  const toastNotice = document.getElementById("toast-notice");
  const toastMessage = document.getElementById("toast-message");

  let currentCategory = "all";
  let searchQuery = "";
  let currentSort = "default";

  // Category counts setup
  function updateCategoryCounts() {
    filterButtons.forEach(btn => {
      const cat = btn.getAttribute("data-category");
      const countSpan = btn.querySelector(".filter-count");
      if (!countSpan) return;
      if (cat === "all") {
        countSpan.textContent = PRODUCTS.length;
      } else {
        const count = PRODUCTS.filter(p => p.category === cat).length;
        countSpan.textContent = count;
      }
    });
  }

  // Filter and Sort Logic
  function getFilteredProducts() {
    return PRODUCTS.filter(product => {
      // Category check
      const matchCategory = (currentCategory === "all") || (product.category === currentCategory);

      // Search check
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCategory;

      const inName = (product.name || "").toLowerCase().includes(query);
      const inBrand = (product.brand || "").toLowerCase().includes(query);
      const inCode = (product.id || "").toLowerCase().includes(query);
      const inDesc = (product.desc || "").toLowerCase().includes(query);
      const inNotes = (product.notes || []).some(n => n.toLowerCase().includes(query));

      return matchCategory && (inName || inBrand || inCode || inDesc || inNotes);
    }).sort((a, b) => {
      if (currentSort === "price-asc") return a.price - b.price;
      if (currentSort === "price-desc") return b.price - a.price;
      if (currentSort === "name-asc") return a.name.localeCompare(b.name, "ar");
      return 0; // default catalog order
    });
  }

  // Render products
  function renderProducts() {
    const list = getFilteredProducts();
    resultsCount.textContent = list.length;

    if (list.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h3>عفواً، لم نجد عطور مطابقة للبحث!</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">جرب كتابة اسم العطر، الكود (مثل RH-0110)، أو إحدى نوتات الرائحة كـ (فانيلا، عنبر).</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = list.map(p => `
      <div class="product-card" data-id="${p.id}">
        <div class="card-top">
          <span class="card-code-badge">${escapeHtml(p.id)}</span>
          <span class="card-category-badge">${escapeHtml(p.categoryName)}</span>
        </div>

        <div class="card-image-box">
          <svg class="bottle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2h4"></path>
            <path d="M12 2v3"></path>
            <path d="M8 5h8v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5z"></path>
            <path d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z"></path>
            <line x1="9" y1="14" x2="15" y2="14"></line>
            <line x1="12" y1="12" x2="12" y2="16"></line>
          </svg>
          <span class="card-size-pill">${escapeHtml(p.size || '100 ml')}</span>
        </div>

        <div class="card-body">
          <div class="card-brand">${escapeHtml(p.brand || 'ROUH')}</div>
          <h3 class="card-title">${escapeHtml(p.name)}</h3>
          <p class="card-desc">${escapeHtml(p.desc || '')}</p>

          <div class="card-notes">
            ${(p.notes || []).map(note => `<span class="note-tag">${escapeHtml(note)}</span>`).join('')}
          </div>
        </div>

        <div class="card-footer">
          <div class="price-box">
            <span class="price-amount">${p.price.toLocaleString('en-US')}</span>
            <span class="price-currency">${STORE_CONFIG.currency}</span>
          </div>

          <button class="btn-buy-messenger" onclick="orderViaMessenger('${p.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.908 1.455 5.516 3.737 7.199V22l3.413-1.874c.905.251 1.865.388 2.85.388 5.523 0 10-4.145 10-9.256C22 6.145 17.523 2 12 2zm1.002 12.443l-2.55-2.72-4.978 2.72 5.474-5.815 2.614 2.72 4.914-2.72-5.474 5.815z"/>
            </svg>
            <span>شراء الآن</span>
          </button>
        </div>
      </div>
    `).join("");
  }

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

  // Filter Buttons click
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category");
      renderProducts();
    });
  });

  // Search input change
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? "block" : "none";
    renderProducts();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderProducts();
  });

  // Sort select change
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // Order via Messenger handler
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

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).then(() => {
        showToast(`تم نسخ تفاصيل العطر (${product.name})! جاري فتح الماسنجر...`);
      }).catch(() => {
        showToast(`جاري فتح شات الماسنجر لطلب (${product.name})...`);
      });
    } else {
      showToast(`جاري فتح شات الماسنجر لطلب (${product.name})...`);
    }

    // Open Messenger after short delay
    setTimeout(() => {
      window.open(STORE_CONFIG.messengerUrl, "_blank");
    }, 700);
  };

  // Toast Function
  let toastTimer;
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastNotice.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove("show");
    }, 3500);
  }

  // Initialize
  updateCategoryCounts();
  renderProducts();
});
