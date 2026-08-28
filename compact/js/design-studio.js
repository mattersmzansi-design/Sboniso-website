/* ============================================================
   COMPACT — Design Studio
   Lets a customer upload an image or type text, place it on a
   product mockup, and add the result to the existing Cart engine
   (js/store.js) as a custom line item. No backend: the design is
   captured as a canvas snapshot (data URL) and stored with the
   order, same as everything else in this shell.
   ============================================================ */

const STUDIO_PRODUCTS = {
  tshirt: {
    name: "Custom T-Shirt",
    category: "Design Studio",
    price: 350,
    sizes: ["XS", "S", "M", "L", "XL"],
    fillColor: "#A7D8C7",
    svg:
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="garment-fill" d="M37 15 L50 24 L63 15 L82 28 L70 42 L63 36 V84 H37 V36 L30 42 L18 28 Z"/>' +
      "</svg>",
  },
  hoodie: {
    name: "Custom Hoodie",
    category: "Design Studio",
    price: 550,
    sizes: ["S", "M", "L", "XL"],
    fillColor: "#A7D8C7",
    svg:
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="garment-fill" d="M35 20 Q50 8 65 20 L82 30 L70 44 L64 38 V84 H36 V38 L30 44 L18 30 Z"/>' +
      '<path class="garment-fill" d="M42 56 H58 V70 H42 Z" fill="none"/>' +
      "</svg>",
  },
  cap: {
    name: "Custom Cap",
    category: "Design Studio",
    price: 250,
    sizes: ["One Size"],
    fillColor: "#A7D8C7",
    svg:
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="garment-fill" d="M20 58 Q20 26 50 26 Q80 26 80 58 Z"/>' +
      '<ellipse class="garment-fill" cx="52" cy="60" rx="36" ry="9"/>' +
      "</svg>",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("studio-canvas");
  const mockupBg = document.getElementById("mockup-bg");
  if (!canvas || !mockupBg) return; // not on the design studio page

  const productPicker = document.getElementById("product-picker");
  const uploadInput = document.getElementById("design-upload");
  const textInput = document.getElementById("design-text");
  const addTextBtn = document.getElementById("add-text-btn");
  const adjustGroup = document.getElementById("adjust-group");
  const scaleRange = document.getElementById("scale-range");
  const rotateRange = document.getElementById("rotate-range");
  const removeLayerBtn = document.getElementById("remove-layer-btn");
  const sizesWrap = document.getElementById("studio-sizes");
  const qtyInput = document.getElementById("studio-qty");
  const priceEl = document.getElementById("studio-price");
  const addToCartBtn = document.getElementById("studio-add-to-cart");
  const emptyNote = document.getElementById("studio-empty-note");

  const state = {
    productKey: "tshirt",
    size: null,
    qty: 1,
    layerType: null, // "image" | "text" | null
    layerSrc: null, // data URL for image, text string for text
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  };

  let layerEl = null;

  function currentProduct() {
    return STUDIO_PRODUCTS[state.productKey];
  }

  function renderMockup() {
    mockupBg.innerHTML = currentProduct().svg;
  }

  function renderSizes() {
    const sizes = currentProduct().sizes;
    state.size = sizes[0];
    sizesWrap.innerHTML = sizes
      .map((s, i) => '<button type="button" data-size="' + s + '"' + (i === 0 ? ' class="selected"' : "") + ">" + s + "</button>")
      .join("");
  }

  function renderPrice() {
    priceEl.textContent = money(currentProduct().price * state.qty);
  }

  function applyLayerTransform() {
    if (!layerEl) return;
    layerEl.style.transform =
      "translate(-50%, -50%) translate(" + state.x + "px, " + state.y + "px) " +
      "rotate(" + state.rotation + "deg) scale(" + state.scale + ")";
  }

  function clearLayer() {
    if (layerEl) layerEl.remove();
    layerEl = null;
    state.layerType = null;
    state.layerSrc = null;
    state.x = 0;
    state.y = 0;
    state.scale = 1;
    state.rotation = 0;
    scaleRange.value = 100;
    rotateRange.value = 0;
    adjustGroup.style.display = "none";
  }

  function setImageLayer(dataUrl) {
    clearLayer();
    state.layerType = "image";
    state.layerSrc = dataUrl;
    layerEl = document.createElement("div");
    layerEl.className = "design-layer";
    const img = document.createElement("img");
    img.src = dataUrl;
    layerEl.appendChild(img);
    canvas.appendChild(layerEl);
    attachDrag(layerEl);
    applyLayerTransform();
    adjustGroup.style.display = "";
  }

  function setTextLayer(text) {
    clearLayer();
    state.layerType = "text";
    state.layerSrc = text;
    layerEl = document.createElement("div");
    layerEl.className = "design-layer";
    const span = document.createElement("span");
    span.className = "text-node";
    span.style.fontSize = "22px";
    span.textContent = text;
    layerEl.appendChild(span);
    canvas.appendChild(layerEl);
    attachDrag(layerEl);
    applyLayerTransform();
    adjustGroup.style.display = "";
  }

  function attachDrag(el) {
    let dragging = false;
    let startPX = 0, startPY = 0, startX = 0, startY = 0;

    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      startPX = e.clientX;
      startPY = e.clientY;
      startX = state.x;
      startY = state.y;
    });
    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      state.x = startX + (e.clientX - startPX);
      state.y = startY + (e.clientY - startPY);
      applyLayerTransform();
    });
    ["pointerup", "pointercancel"].forEach((evt) => {
      el.addEventListener(evt, () => { dragging = false; });
    });
  }

  /* ---------- controls ---------- */

  productPicker.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-product]");
    if (!btn) return;
    state.productKey = btn.dataset.product;
    productPicker.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderMockup();
    renderSizes();
    renderPrice();
  });

  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageLayer(reader.result);
    reader.readAsDataURL(file);
  });

  addTextBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) { toast("Type something first"); return; }
    setTextLayer(text);
  });

  scaleRange.addEventListener("input", () => {
    state.scale = Number(scaleRange.value) / 100;
    applyLayerTransform();
  });
  rotateRange.addEventListener("input", () => {
    state.rotation = Number(rotateRange.value);
    applyLayerTransform();
  });
  removeLayerBtn.addEventListener("click", clearLayer);

  sizesWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-size]");
    if (!btn) return;
    state.size = btn.dataset.size;
    sizesWrap.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
  });

  document.getElementById("studio-qty-minus").addEventListener("click", () => {
    state.qty = Math.max(1, state.qty - 1);
    qtyInput.value = state.qty;
    renderPrice();
  });
  document.getElementById("studio-qty-plus").addEventListener("click", () => {
    state.qty += 1;
    qtyInput.value = state.qty;
    renderPrice();
  });

  /* ---------- snapshot + add to cart ---------- */

  function buildSnapshot() {
    const size = 640;
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const ctx = off.getContext("2d");

    ctx.fillStyle = currentProduct().fillColor;
    ctx.fillRect(0, 0, size, size);

    const rect = canvas.getBoundingClientRect();
    const ratio = size / rect.width;
    const cx = size / 2 + state.x * ratio;
    const cy = size / 2 + state.y * ratio;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.scale(state.scale, state.scale);

    if (state.layerType === "image" && layerEl) {
      const img = layerEl.querySelector("img");
      const w = 160 * ratio;
      const h = w * (img.naturalHeight / img.naturalWidth || 1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else if (state.layerType === "text") {
      ctx.fillStyle = "#101010";
      ctx.font = "700 " + 22 * ratio + "px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(state.layerSrc, 0, 0);
    }
    ctx.restore();

    return off.toDataURL("image/jpeg", 0.85);
  }

  addToCartBtn.addEventListener("click", () => {
    if (!state.layerType) {
      emptyNote.style.display = "block";
      toast("Add an image or text first");
      return;
    }
    emptyNote.style.display = "none";

    const p = currentProduct();
    Cart.addCustom({
      name: p.name,
      category: p.category,
      price: p.price,
      size: state.size,
      qty: state.qty,
      designImage: buildSnapshot(),
    });
    toast("Added to bag");
  });

  /* ---------- boot ---------- */
  renderMockup();
  renderSizes();
  renderPrice();
});
