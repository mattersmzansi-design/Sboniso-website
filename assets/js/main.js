/* ============================================================
   Squnga'esihle Trading — Shared interactions
   Mobile nav · Hero slideshow · Credential modals · Lightbox
   ============================================================ */
(function () {
    "use strict";

    /* ---------- Mobile navigation ---------- */
    const navToggle = document.querySelector(".nav-toggle");
    const mainNav = document.querySelector(".main-nav");
    if (navToggle && mainNav) {
        navToggle.addEventListener("click", function () {
            mainNav.classList.toggle("open");
        });
        mainNav.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () { mainNav.classList.remove("open"); });
        });
    }

    /* ---------- Hero slideshow ---------- */
    const show = document.querySelector(".slideshow");
    if (show) {
        const slides = Array.prototype.slice.call(show.querySelectorAll(".slide"));
        const dotsWrap = show.querySelector(".slide-dots");
        const progress = show.querySelector(".slide-progress");
        const playBtn = show.querySelector("[data-play]");
        const INTERVAL = 5000;
        let current = 0;
        let timer = null;
        let progTimer = null;
        let playing = true;

        // Build dots
        const dots = slides.map(function (_, i) {
            const d = document.createElement("button");
            d.className = "dot" + (i === 0 ? " active" : "");
            d.setAttribute("aria-label", "Go to slide " + (i + 1));
            d.addEventListener("click", function () { goTo(i, true); });
            if (dotsWrap) dotsWrap.appendChild(d);
            return d;
        });

        function render() {
            slides.forEach(function (s, i) { s.classList.toggle("active", i === current); });
            dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
        }

        function startProgress() {
            if (!progress) return;
            progress.style.transition = "none";
            progress.style.width = "0%";
            // force reflow so the reset applies before we animate
            void progress.offsetWidth;
            if (playing) {
                progress.style.transition = "width " + INTERVAL + "ms linear";
                progress.style.width = "100%";
            }
        }

        function goTo(i, userAction) {
            current = (i + slides.length) % slides.length;
            render();
            if (userAction) restart();
            else startProgress();
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function play() {
            playing = true;
            if (playBtn) { playBtn.textContent = "❚❚"; playBtn.setAttribute("aria-label", "Pause slideshow"); }
            clearInterval(timer);
            timer = setInterval(next, INTERVAL);
            startProgress();
        }
        function pause() {
            playing = false;
            if (playBtn) { playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "Play slideshow"); }
            clearInterval(timer);
            if (progress) {
                // freeze the bar where it is
                const w = getComputedStyle(progress).width;
                progress.style.transition = "none";
                progress.style.width = w;
            }
        }
        function restart() { if (playing) play(); else startProgress(); }
        function togglePlay() { playing ? pause() : play(); }

        // Controls
        const nextBtn = show.querySelector(".slide-btn.next");
        const prevBtn = show.querySelector(".slide-btn.prev");
        if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
        if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
        if (playBtn) playBtn.addEventListener("click", togglePlay);

        // Pause on hover
        show.addEventListener("mouseenter", function () { if (playing) { clearInterval(timer); const w = progress ? getComputedStyle(progress).width : 0; if (progress) { progress.style.transition = "none"; progress.style.width = w; } } });
        show.addEventListener("mouseleave", function () { if (playing) play(); });

        // Keyboard support
        document.addEventListener("keydown", function (e) {
            if (document.querySelector(".lightbox.open") || document.querySelector(".modal-overlay.open")) return;
            if (e.key === "ArrowRight") { next(); restart(); }
            else if (e.key === "ArrowLeft") { prev(); restart(); }
            else if (e.key === " " && document.activeElement === document.body) { e.preventDefault(); togglePlay(); }
        });

        // Touch / swipe
        let startX = null;
        show.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
        show.addEventListener("touchend", function (e) {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); restart(); }
            startX = null;
        });

        // Respect reduced-motion preference
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        render();
        if (reduce) { pause(); } else { play(); }
    }

    /* ---------- Credential modals ---------- */
    const modal = document.getElementById("info-modal");
    if (modal) {
        const titleEl = modal.querySelector(".modal-header");
        const bodyEl = modal.querySelector(".modal-body");
        window.openInfo = function (key) {
            const data = window.CREDENTIALS && window.CREDENTIALS[key];
            if (!data) return;
            titleEl.textContent = data.title;
            bodyEl.innerHTML = data.body;
            modal.classList.add("open");
        };
        window.closeInfo = function () { modal.classList.remove("open"); };
        modal.addEventListener("click", function (e) { if (e.target === modal) window.closeInfo(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.closeInfo(); });
    }

    /* ---------- Lightbox (journey gallery) ---------- */
    const lb = document.getElementById("lightbox");
    if (lb) {
        const lbImg = lb.querySelector("img");
        const lbCap = lb.querySelector(".lightbox-cap");
        document.querySelectorAll("[data-full]").forEach(function (el) {
            el.addEventListener("click", function () {
                lbImg.src = el.getAttribute("data-full");
                lbImg.alt = el.getAttribute("data-cap") || "";
                lbCap.textContent = el.getAttribute("data-cap") || "";
                lb.classList.add("open");
            });
        });
        function closeLb() { lb.classList.remove("open"); lbImg.src = ""; }
        lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lightbox-close")) closeLb(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
    }

    /* ---------- Footer year ---------- */
    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
})();
