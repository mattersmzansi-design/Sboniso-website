/* ============================================================
   COMPACT — store engine (shell)
   Cart, checkout and order tracking run on localStorage so the
   whole flow is testable before a real backend is connected.

   >>> CONTENT GOES HERE <<<
   Replace the PRODUCTS array below with your real catalogue.
   Every product needs: id, name, category, price (ZAR),
   sizes[], and (later) an image path.
   ============================================================ */

const STORE = {
  name: "COMPACT",
  currency: "R",
  freeShippingThreshold: 1500, // free delivery above this amount
  shippingOptions: [
    { id: "standard", label: "Standard Delivery", note: "3–5 working days", price: 85 },
    { id: "express", label: "Express Delivery", note: "1–2 working days", price: 160 },
    { id: "collect", label: "Click & Collect", note: "Collect in store — ready in 24h", price: 0 },
  ],
};

/* Placeholder catalogue — swap these for real products. */
const PRODUCTS = [
  { id: "p01", name: "Product Name 01", category: "T-Shirts",  price: 0, sizes: ["XS","S","M","L","XL"] },
  { id: "p02", name: "Product Name 02", category: "T-Shirts",  price: 0, sizes: ["XS","S","M","L","XL"] },
  { id: "p03", name: "Product Name 03", category: "Hoodies",   price: 0, sizes: ["S","M","L","XL"] },
  { id: "p04", name: "Product Name 04", category: "Hoodies",   price: 0, sizes: ["S","M","L","XL"] },
  { id: "p05", name: "Product Name 05", category: "Pants",     price: 0, sizes: ["28","30","32","34","36"] },
  { id: "p06", name: "Product Name 06", category: "Pants",     price: 0, sizes: ["28","30","32","34","36"] },
  { id: "p07", name: "Product Name 07", category: "Headwear",  price: 0, sizes: ["One Size"] },
  { id: "p08", name: "Product Name 08", category: "Headwear",  price: 0, sizes: ["One Size"] },
];

/* ---------- helpers ---------- */

function money(v) {
  return STORE.currency + " " + Number(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ---------- cart ---------- */

const Cart = {
  key: "compact_cart",

  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },

  write(lines) {
    localStorage.setItem(this.key, JSON.stringify(lines));
    this.renderBadge();
  },

  add(productId, size, qty) {
    const lines = this.read();
    const existing = lines.find((l) => l.productId === productId && l.size === size);
    if (existing) existing.qty += qty;
    else lines.push({ productId, size, qty });
    this.write(lines);
  },

  updateQty(index, qty) {
    const lines = this.read();
    if (!lines[index]) return;
    lines[index].qty = Math.max(1, qty);
    this.write(lines);
  },

  remove(index) {
    const lines = this.read();
    lines.splice(index, 1);
    this.write(lines);
  },

  clear() {
    this.write([]);
  },

  count() {
    return this.read().reduce((n, l) => n + l.qty, 0);
  },

  subtotal() {
    return this.read().reduce((sum, l) => {
      const p = getProduct(l.productId);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
  },

  renderBadge() {
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = this.count();
    });
  },
};

/* ---------- orders (local placeholder for a real backend) ---------- */

const Orders = {
  key: "compact_orders",

  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || {}; }
    catch { return {}; }
  },

  save(order) {
    const all = this.read();
    all[order.number] = order;
    localStorage.setItem(this.key, JSON.stringify(all));
  },

  get(number) {
    return this.read()[String(number).trim().toUpperCase()] || null;
  },

  makeNumber() {
    const n = Math.floor(100000 + Math.random() * 900000);
    return "CMP-" + n;
  },
};

/* Tracking stages. With no backend yet, an order advances one
   stage every 12 hours after it was placed, capped at the last
   stage — enough to demo the tracking page end-to-end. */
const ORDER_STAGES = [
  { id: "placed",     title: "Order Placed",        note: "We have received your order." },
  { id: "processing", title: "Processing",          note: "Your order is being prepared." },
  { id: "shipped",    title: "Shipped",             note: "Your parcel is on its way." },
  { id: "delivery",   title: "Out for Delivery",    note: "The courier is en route to you." },
  { id: "delivered",  title: "Delivered",           note: "Your order has been delivered." },
];

function orderStageIndex(order) {
  const hours = (Date.now() - order.placedAt) / 36e5;
  return Math.min(Math.floor(hours / 12), ORDER_STAGES.length - 1);
}

/* ---------- header / shared UI ---------- */

function initHeader() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }
  Cart.renderBadge();
}

/* ---------- page: shop / featured grids ---------- */

function productCardHTML(p) {
  return (
    '<a class="product-card" href="product.html?id=' + p.id + '">' +
      '<div class="product-thumb">Image</div>' +
      '<div class="product-meta">' +
        '<span class="name">' + p.name + "</span>" +
        '<span class="cat">' + p.category + "</span>" +
        '<span class="price">' + money(p.price) + "</span>" +
      "</div>" +
    "</a>"
  );
}

function renderProductGrid(el, list) {
  if (!el) return;
  if (!list.length) {
    el.innerHTML =
      '<div class="empty-state" style="grid-column:1/-1">' +
      "<strong>No products yet</strong>Products will appear here once the catalogue is loaded.</div>";
    return;
  }
  el.innerHTML = list.map(productCardHTML).join("");
}

function initShopPage() {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  const catBoxes = Array.from(document.querySelectorAll('input[name="cat"]'));
  const sortSel = document.getElementById("sort");
  const countEl = document.getElementById("result-count");

  const preset = qs("cat");
  if (preset) {
    catBoxes.forEach((b) => { if (b.value === preset) b.checked = true; });
  }

  function apply() {
    const active = catBoxes.filter((b) => b.checked).map((b) => b.value);
    let list = PRODUCTS.filter((p) => !active.length || active.includes(p.category));
    if (sortSel) {
      if (sortSel.value === "price-asc") list = list.slice().sort((a, b) => a.price - b.price);
      if (sortSel.value === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);
    }
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " item" : " items");
    renderProductGrid(grid, list);
  }

  catBoxes.forEach((b) => b.addEventListener("change", apply));
  if (sortSel) sortSel.addEventListener("change", apply);
  apply();
}

/* ---------- page: product ---------- */

function initProductPage() {
  const root = document.getElementById("pdp");
  if (!root) return;

  const p = getProduct(qs("id")) || PRODUCTS[0];
  if (!p) return;

  document.title = p.name + " — " + STORE.name;
  document.getElementById("pdp-name").textContent = p.name;
  document.getElementById("pdp-cat").textContent = p.category;
  document.getElementById("pdp-price").textContent = money(p.price);

  let selectedSize = null;
  const sizeWrap = document.getElementById("pdp-sizes");
  sizeWrap.innerHTML = p.sizes
    .map((s) => '<button type="button" data-size="' + s + '">' + s + "</button>")
    .join("");
  sizeWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-size]");
    if (!btn) return;
    selectedSize = btn.dataset.size;
    sizeWrap.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
  });

  const qtyInput = document.getElementById("pdp-qty");
  document.getElementById("qty-minus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qtyInput.value = Number(qtyInput.value) + 1;
  });

  document.getElementById("add-to-cart").addEventListener("click", () => {
    if (!selectedSize) { toast("Please select a size"); return; }
    Cart.add(p.id, selectedSize, Math.max(1, Number(qtyInput.value) || 1));
    toast("Added to bag");
  });

  renderProductGrid(
    document.getElementById("related-grid"),
    PRODUCTS.filter((x) => x.id !== p.id).slice(0, 4)
  );
}

/* ---------- page: cart ---------- */

function initCartPage() {
  const wrap = document.getElementById("cart-lines");
  if (!wrap) return;

  function render() {
    const lines = Cart.read();
    const summary = document.getElementById("cart-summary");

    if (!lines.length) {
      wrap.innerHTML =
        '<div class="empty-state"><strong>Your bag is empty</strong>' +
        'Browse the shop to add items.<br><br>' +
        '<a class="btn ghost" href="shop.html">Go to Shop</a></div>';
      if (summary) summary.style.display = "none";
      return;
    }
    if (summary) summary.style.display = "";

    wrap.innerHTML = lines
      .map((l, i) => {
        const p = getProduct(l.productId);
        if (!p) return "";
        return (
          '<div class="cart-line">' +
            '<div class="thumb">Image</div>' +
            '<div class="line-info">' +
              '<span class="name">' + p.name + "</span>" +
              '<span class="variant">' + p.category + " · Size " + l.size + "</span>" +
              '<div class="qty-picker">' +
                '<button data-act="minus" data-i="' + i + '">−</button>' +
                '<input type="text" value="' + l.qty + '" readonly>' +
                '<button data-act="plus" data-i="' + i + '">+</button>' +
              "</div>" +
            "</div>" +
            '<div class="line-right">' +
              "<span>" + money(p.price * l.qty) + "</span>" +
              '<button class="remove" data-act="remove" data-i="' + i + '">Remove</button>' +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    const sub = Cart.subtotal();
    document.getElementById("sum-subtotal").textContent = money(sub);
    document.getElementById("sum-total").textContent = money(sub);
  }

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const i = Number(btn.dataset.i);
    const lines = Cart.read();
    if (btn.dataset.act === "minus") Cart.updateQty(i, lines[i].qty - 1);
    if (btn.dataset.act === "plus") Cart.updateQty(i, lines[i].qty + 1);
    if (btn.dataset.act === "remove") Cart.remove(i);
    render();
  });

  render();
}

/* ---------- page: checkout ---------- */

function initCheckoutPage() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  const lines = Cart.read();
  if (!lines.length) {
    document.getElementById("checkout-body").innerHTML =
      '<div class="empty-state"><strong>Your bag is empty</strong>' +
      "Add items before checking out.<br><br>" +
      '<a class="btn ghost" href="shop.html">Go to Shop</a></div>';
    return;
  }

  /* order summary */
  const sub = Cart.subtotal();
  let shippingId = STORE.shippingOptions[0].id;

  function shippingCost() {
    const opt = STORE.shippingOptions.find((o) => o.id === shippingId);
    if (!opt) return 0;
    if (opt.price > 0 && sub >= STORE.freeShippingThreshold) return 0;
    return opt.price;
  }

  function renderSummary() {
    const itemsEl = document.getElementById("co-items");
    itemsEl.innerHTML = lines
      .map((l) => {
        const p = getProduct(l.productId);
        return p
          ? '<div class="summary-row"><span>' + p.name + " × " + l.qty +
            ' <small style="color:var(--ink-faint)">(' + l.size + ")</small></span><span>" +
            money(p.price * l.qty) + "</span></div>"
          : "";
      })
      .join("");
    document.getElementById("co-subtotal").textContent = money(sub);
    document.getElementById("co-shipping").textContent =
      shippingCost() === 0 ? "Free" : money(shippingCost());
    document.getElementById("co-total").textContent = money(sub + shippingCost());
  }

  /* shipping choices */
  const shipWrap = document.getElementById("shipping-options");
  shipWrap.innerHTML = STORE.shippingOptions
    .map((o, i) => {
      const price = o.price > 0 && sub >= STORE.freeShippingThreshold ? "Free" : (o.price === 0 ? "Free" : money(o.price));
      return (
        '<label class="choice' + (i === 0 ? " selected" : "") + '">' +
          '<input type="radio" name="shipping" value="' + o.id + '"' + (i === 0 ? " checked" : "") + ">" +
          '<span class="choice-main"><strong>' + o.label + "</strong><span>" + o.note + "</span></span>" +
          '<span class="choice-price">' + price + "</span>" +
        "</label>"
      );
    })
    .join("");
  shipWrap.addEventListener("change", (e) => {
    if (e.target.name !== "shipping") return;
    shippingId = e.target.value;
    shipWrap.querySelectorAll(".choice").forEach((c) => c.classList.remove("selected"));
    e.target.closest(".choice").classList.add("selected");
    renderSummary();
  });

  renderSummary();

  /* submit */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("input[required]").forEach((input) => {
      const field = input.closest(".field");
      const ok = input.value.trim().length > 0 &&
        (input.type !== "email" || /\S+@\S+\.\S+/.test(input.value));
      field.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      toast("Please complete the highlighted fields");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const order = {
      number: Orders.makeNumber(),
      placedAt: Date.now(),
      email: data.email,
      name: data.firstName + " " + data.lastName,
      address: {
        line1: data.address, suburb: data.suburb, city: data.city,
        province: data.province, postal: data.postal,
      },
      shipping: shippingId,
      items: lines,
      subtotal: sub,
      shippingCost: shippingCost(),
      total: sub + shippingCost(),
    };
    Orders.save(order);
    Cart.clear();
    location.href = "confirmation.html?order=" + encodeURIComponent(order.number);
  });
}

/* ---------- page: confirmation ---------- */

function initConfirmationPage() {
  const el = document.getElementById("confirm-number");
  if (!el) return;
  const number = qs("order");
  const order = number ? Orders.get(number) : null;
  el.textContent = number || "—";
  const emailEl = document.getElementById("confirm-email");
  if (order && emailEl) {
    emailEl.textContent = order.email;
    emailEl.parentElement.style.display = "";
  }
  const trackLink = document.getElementById("confirm-track");
  if (trackLink && number) {
    trackLink.href = "track.html?order=" + encodeURIComponent(number);
  }
}

/* ---------- page: track ---------- */

function initTrackPage() {
  const form = document.getElementById("track-form");
  if (!form) return;

  const input = document.getElementById("track-input");
  const errEl = document.getElementById("track-error");
  const result = document.getElementById("track-result");

  function show(order) {
    errEl.style.display = "none";
    result.style.display = "block";

    document.getElementById("tr-number").textContent = order.number;
    document.getElementById("tr-date").textContent =
      new Date(order.placedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
    document.getElementById("tr-total").textContent = money(order.total);
    document.getElementById("tr-items").textContent =
      order.items.reduce((n, l) => n + l.qty, 0) + " item(s)";

    const stage = orderStageIndex(order);
    document.getElementById("tr-status").textContent = ORDER_STAGES[stage].title;

    document.getElementById("timeline").innerHTML = ORDER_STAGES
      .map((s, i) => {
        const cls = i < stage ? "done" : i === stage ? "done current" : "pending";
        return (
          '<div class="timeline-step ' + cls + '">' +
            '<span class="node"></span>' +
            "<h4>" + s.title + "</h4><p>" + s.note + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const order = Orders.get(input.value);
    if (!order) {
      result.style.display = "none";
      errEl.style.display = "block";
      return;
    }
    show(order);
  });

  const preset = qs("order");
  if (preset) {
    input.value = preset;
    const order = Orders.get(preset);
    if (order) show(order);
  }
}

/* ---------- boot ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  renderProductGrid(document.getElementById("featured-grid"), PRODUCTS.slice(0, 4));
  initShopPage();
  initProductPage();
  initCartPage();
  initCheckoutPage();
  initConfirmationPage();
  initTrackPage();
});
