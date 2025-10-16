(function () {
  function __registerWeddingAlpine() {
    if (window.__weddingAlpineRegistered) return;
    window.__weddingAlpineRegistered = true;
    Alpine.data("countdown", (targetIso) => ({
      remaining: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      intervalId: null,
      endTime: new Date(targetIso).getTime(),
      start() {
        this.tick();
        this.intervalId = setInterval(() => this.tick(), 1000);
      },
      tick() {
        const now = Date.now();
        let diff = Math.max(0, this.endTime - now);
        const dayMs = 86400000;
        const hourMs = 3600000;
        const minuteMs = 60000;
        const secondMs = 1000;
        const days = Math.floor(diff / dayMs);
        diff -= days * dayMs;
        const hours = Math.floor(diff / hourMs);
        diff -= hours * hourMs;
        const minutes = Math.floor(diff / minuteMs);
        diff -= minutes * minuteMs;
        const seconds = Math.floor(diff / secondMs);
        this.remaining = { days, hours, minutes, seconds };
        if (this.endTime <= now) {
          clearInterval(this.intervalId);
        }
      },
    }));
    Alpine.data("gradientCrossfade", () => ({
      index: 0,
      palettes: [
        "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100",
        "bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100",
        "bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100",
        "bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100",
      ],
      aClass: "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100",
      bClass: "bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100",
      aOpacity: "opacity-40",
      bOpacity: "opacity-0",
      useA: true,
      nextIndex(i) {
        return (i + 1) % this.palettes.length;
      },
      swap() {
        if (this.useA) {
          this.bClass = this.palettes[this.nextIndex(this.index)];
          this.aOpacity = "opacity-0";
          this.bOpacity = "opacity-40";
        } else {
          this.aClass = this.palettes[this.nextIndex(this.index)];
          this.aOpacity = "opacity-40";
          this.bOpacity = "opacity-0";
        }
        setTimeout(() => {
          this.index = this.nextIndex(this.index);
          this.useA = !this.useA;
        }, 3200);
      },
      start() {
        const reduce =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          this.aOpacity = "opacity-30";
          this.bOpacity = "opacity-0";
          return;
        }
        setInterval(() => this.swap(), 9000);
      },
    }));

    Alpine.data("bgSlideshow", () => ({
      images: Array.from({ length: 6 }, (_, i) => `images/${i + 1}.jpg`),
      index: 0,
      aSrc: "",
      bSrc: "",
      useA: true,
      timerId: null,
      intervalMs: 5000,
      nextIndex(i) {
        return (i + 1) % this.images.length;
      },
      preload(src) {
        if (!src) return;
        const img = new Image();
        img.src = src;
      },
      setInitial() {
        if (this.images.length === 0) return;
        this.index = 0;
        this.aSrc = this.images[this.index];
        this.bSrc = this.images[this.nextIndex(this.index)];
        this.useA = true;
      },
      swap() {
        if (this.images.length < 2) return;
        this.useA = !this.useA;
        this.index = this.nextIndex(this.index);
        const upcoming = this.images[this.nextIndex(this.index)];
        this.preload(upcoming);
        if (this.useA) {
          // b is visible, prepare a for next
          this.aSrc = upcoming;
        } else {
          // a is visible, prepare b for next
          this.bSrc = upcoming;
        }
      },
      start() {
        this.setInitial();
        if (this.images.length < 2) return;
        const reduce =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) return;
        this.preload(this.aSrc);
        this.preload(this.bSrc);
        this.timerId = setInterval(() => this.swap(), this.intervalMs);
      },
      stop() {
        if (this.timerId) {
          clearInterval(this.timerId);
          this.timerId = null;
        }
      },
    }));

    const initTypewriter = () => {
      const target = document.getElementById("hero-names");
      if (!target || !window.Typewriter) return;
      const reduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        target.textContent = "Aljon and Lynn";
        return;
      }
      if (target._tw) {
        try {
          target._tw.stop();
        } catch (e) {}
        target._tw = null;
      }
      const tw = new Typewriter(target, {
        loop: true,
        delay: 90,
        deleteSpeed: 50,
        cursor: "_",
      });
      tw.deleteAll(1)
        .typeString("Aljon<br>and<br>Lynn")
        .pauseFor(1800)
        .deleteAll()
        .typeString("Lynn<br>and<br>Aljon")
        .pauseFor(1800)
        .deleteAll()
        .start();
      target._tw = tw;
    };
    const ready = () => initTypewriter();
    if (document.readyState === "complete") {
      ready();
    } else {
      window.addEventListener("load", ready, { once: true });
    }

    // Fingerprint helper (loads library on demand and caches the ID)
    (function setupFingerprint() {
      const SOURCES = [
        "https://openfpcdn.io/fingerprintjs/v3/3.8.0/fp.min.js",
        "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js",
        "https://unpkg.com/@fingerprintjs/fingerprintjs@3/dist/fp.min.js",
      ];
      let loadPromise = null;
      let getPromise = null;
      function loadFrom(src) {
        return new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          let settled = false;
          const to = setTimeout(() => {
            if (settled) return;
            settled = true;
            try {
              s.remove();
            } catch (e) {}
            try {
              console.warn("[FingerprintJS] load timeout", src);
            } catch (e) {}
            reject(new Error("timeout"));
          }, 3000);
          s.onload = () => {
            if (settled) return;
            settled = true;
            clearTimeout(to);
            resolve();
          };
          s.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(to);
            try {
              s.remove();
            } catch (e) {}
            try {
              console.warn("[FingerprintJS] failed to load", src);
            } catch (e) {}
            reject(new Error("error"));
          };
          document.head.appendChild(s);
        });
      }
      function ensureLibraryLoaded() {
        if (
          window.FingerprintJS &&
          typeof window.FingerprintJS.load === "function"
        ) {
          return Promise.resolve();
        }
        if (!loadPromise) {
          loadPromise = (async () => {
            for (let i = 0; i < SOURCES.length; i++) {
              try {
                await loadFrom(SOURCES[i]);
                if (
                  window.FingerprintJS &&
                  typeof window.FingerprintJS.load === "function"
                )
                  return;
              } catch (e) {
                // try next
              }
            }
            throw new Error("All FingerprintJS sources failed");
          })();
        }
        return loadPromise;
      }
      window.getFingerprint = async function () {
        try {
          const cached = JSON.parse(
            localStorage.getItem("wedding.fingerprint") || "null"
          );
          if (cached && typeof cached.id === "string" && cached.id) {
            return cached.id;
          }
        } catch (e) {}
        if (!getPromise) {
          getPromise = (async () => {
            try {
              await ensureLibraryLoaded();
              if (
                !window.FingerprintJS ||
                typeof window.FingerprintJS.load !== "function"
              )
                throw new Error("FingerprintJS not available");
              const fp = await window.FingerprintJS.load();
              const result = await fp.get();
              const id = result && result.visitorId ? result.visitorId : null;
              if (id) {
                try {
                  localStorage.setItem(
                    "wedding.fingerprint",
                    JSON.stringify({ id, obtainedAt: new Date().toISOString() })
                  );
                } catch (e) {}
              }
              return id;
            } catch (e) {
              try {
                console.warn(
                  "[FingerprintJS] get failed",
                  e && e.message ? e.message : e
                );
              } catch (_) {}
              return null;
            }
          })();
        }
        const id = await getPromise;
        if (!id) {
          // Allow retry next time if it failed
          getPromise = null;
        }
        return id;
      };
    })();

    // Startup RSVP status check
    (async function checkRsvpStatus() {
      const url =
        "https://primary-production-a114c.up.railway.app/webhook/rsvp-check";
      const payload = {};
      try {
        const fp = await (typeof window.getFingerprint === "function"
          ? window.getFingerprint()
          : Promise.resolve(null));
        if (fp) payload.device = fp;
      } catch (e) {}
      try {
        console.debug("[RSVP CHECK] payload", payload);
      } catch (e) {}
      try {
        const localKey = "wedding.rsvp";
        const stored = JSON.parse(localStorage.getItem(localKey) || "null");
        if (stored && stored.id !== undefined && stored.id !== null) {
          payload.id = stored.id;
        }
      } catch (e) {
        console.log("RSVP CHECK 1", e);
      }
      try {
        const auth = "Basic " + btoa("admin:rsvpMentos172025!");
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: auth },
          body: JSON.stringify(payload),
          keepalive: true,
        })
          .then(async (r) => {
            if (!r.ok) {
              try {
                const t = await r.text();
                console.error("[RSVP CHECK] HTTP " + r.status + " body:", t);
              } catch (_) {}
              throw new Error("HTTP " + r.status);
            }
            return r.json().catch(() => ({}));
          })
          .then((data) => {
            console.log("RSVP CHECK", data);
            try {
              window.__rsvpStatus = data || {};
            } catch (e) {}
            try {
              window.dispatchEvent(
                new CustomEvent("rsvpstatus", { detail: data || {} })
              );
            } catch (e) {}
          })
          .catch((err) => {
            try {
              console.error(
                "[RSVP CHECK] failed",
                err && err.message ? err.message : err
              );
            } catch (_) {}
            try {
              localStorage.removeItem("wedding.rsvp");
            } catch (_) {}
          });
      } catch (e) {
        console.log("RSVP CHECK 2", e);
      }
    })();

    // Particles.js init (respects reduced motion; scales for mobile)
    const initParticles = () => {
      const container = document.getElementById("particles-js");
      if (!container || !window.particlesJS) return;
      const prefersReduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
      const hasCoarsePointer =
        window.matchMedia && window.matchMedia("(pointer:coarse)").matches;
      const lowEndHints =
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 2);
      const isMobileLike = hasCoarsePointer || lowEndHints;
      const particleNumber = isMobileLike ? 240 : 180;
      const particleSize = 8;
      const moveSpeed = isMobileLike ? 1.5 : 0.6;
      window.particlesJS("particles-js", {
        particles: {
          number: {
            value: particleNumber,
            density: { enable: true, value_area: 900 },
          },
          color: {
            value: [
              "#fb7185",
              "#f472b6",
              "#fda4af",
              "#e879f9",
              "#7dd3fc",
              "#EEEEEE",
            ],
          },
          shape: { type: "circle" },
          opacity: { value: 0.35 },
          size: { value: particleSize, random: true },
          line_linked: { enable: false },
          move: {
            enable: true,
            speed: moveSpeed,
            direction: "top",
            random: false,
            straight: false,
            out_mode: "out",
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: false },
            onclick: { enable: false },
            resize: true,
          },
        },
        retina_detect: true,
      });
    };
    const readyParticles = () => initParticles();
    if (document.readyState === "complete") {
      readyParticles();
    } else {
      window.addEventListener("load", readyParticles, { once: true });
    }

    // Shared intersection observer for reveal animations
    window.__reveal = {
      observer: null,
      observe(rootEl) {
        if (!("IntersectionObserver" in window)) {
          rootEl
            .querySelectorAll(".reveal-hidden")
            .forEach((el) => el.classList.add("reveal-show"));
          return;
        }
        if (!this.observer) {
          this.observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const el = entry.target;
                if (entry.isIntersecting) {
                  el.classList.add("reveal-show");
                  el.classList.remove("reveal-hidden");
                } else {
                  el.classList.remove("reveal-show");
                  el.classList.add("reveal-hidden");
                }
              });
            },
            { threshold: 0.15 }
          );
        }
        rootEl
          .querySelectorAll(".reveal-hidden")
          .forEach((el) => this.observer.observe(el));
      },
    };
    // Ensure initial elements are observed immediately
    window.__reveal.observe(document);

    Alpine.data("pageNav", () => ({
      sections: [],
      active: 0,
      scrolling: false,
      isDesktop: false,
      init() {
        this.sections = Array.from(document.querySelectorAll("section"));
        this.updateActive();
        // Update dots when goToSection announces a sectionchange
        window.addEventListener("sectionchange", (e) => {
          if (typeof e.detail?.index === "number") {
            this.active = e.detail.index;
          }
        });
        window.addEventListener(
          "scroll",
          this.throttle(() => this.updateActive(), 150)
        );
        // Set input mode and enable wheel/keyboard navigation for desktop
        this.isDesktop = window.matchMedia("(pointer:fine)").matches;
        if (this.isDesktop) {
          window.addEventListener("wheel", (e) => this.onWheel(e), {
            passive: false,
          });
        }
        // Keyboard navigation for all
        window.addEventListener("keydown", (e) => this.onKey(e));
        // Simple touch swipe to advance sections on mobile
        let startY = null;
        window.addEventListener(
          "touchstart",
          (e) => {
            startY = e.touches[0].clientY;
          },
          { passive: false }
        );
        window.addEventListener(
          "touchmove",
          (e) => {
            e.preventDefault();
            if (startY === null) return;
            const dy = e.touches[0].clientY - startY;
            if (Math.abs(dy) > 80) {
              if (dy < 0) this.next();
              else this.prev();
              startY = null;
            }
          },
          { passive: false }
        );
        window.addEventListener(
          "touchend",
          () => {
            startY = null;
          },
          { passive: true }
        );
      },
      throttle(fn, wait) {
        let last = 0;
        return (...args) => {
          const now = Date.now();
          if (now - last > wait) {
            last = now;
            fn(...args);
          }
        };
      },
      updateActive() {
        const mid = window.innerHeight / 2;
        const idx = this.sections.findIndex((s) => {
          const r = s.getBoundingClientRect();
          return r.top <= mid && r.bottom >= mid;
        });
        if (idx >= 0) this.active = idx;
      },
      go(idx) {
        if (idx < 0 || idx >= this.sections.length) return;
        if (idx === this.active) return;
        if (this.scrolling) return;
        this.scrolling = true;
        if (this.isDesktop) {
          try {
            window.goToSection(idx);
          } catch (e) {
            this.sections[idx].scrollIntoView({ behavior: "smooth" });
          }
        } else {
          this.sections[idx].scrollIntoView({ behavior: "smooth" });
        }
        setTimeout(() => {
          this.scrolling = false;
          this.active = idx;
        }, 900);
      },
      next() {
        this.go(this.active + 1);
      },
      prev() {
        this.go(this.active - 1);
      },
      onWheel(e) {
        if (Math.abs(e.deltaY) < 20) return;
        e.preventDefault();
        if (this.scrolling) return;
        const idx = this.active + (e.deltaY > 0 ? 1 : -1);
        this.go(idx);
      },
      onKey(e) {
        const target = e.target;
        const tag = target && target.tagName ? target.tagName.toLowerCase() : "";
        const isEditable =
          target &&
          (target.isContentEditable ||
            tag === "input" ||
            tag === "textarea" ||
            tag === "select");
        if (isEditable) return;
        if (["ArrowDown", "PageDown", " "].includes(e.key)) {
          e.preventDefault();
          this.next();
        }
        if (["ArrowUp", "PageUp"].includes(e.key)) {
          e.preventDefault();
          this.prev();
        }
      },
      dotClass(i) {
        return (
          "h-3 w-3 rounded-full ring-2 ring-white/60 transition " +
          (this.active === i ? "bg-rose-400" : "bg-white/70 hover:bg-white")
        );
      },
      tabClass(i) {
        return (
          "px-3 py-1.5 rounded-full text-[10px] sm:text-xs ring-1 ring-white/60 backdrop-blur transition " +
          (this.active === i
            ? "bg-rose-800/80 text-white  italic"
            : "bg-white/70 text-gray-700 hover:bg-white")
        );
      },
    }));

    Alpine.data("rsvp", () => ({
      open: false,
      name: "",
      companion: "",
      companionBeverage: "",
      companion2: "",
      companion2Beverage: "",
      beverage: "",
      responded: false,
      recordId: null,
      isSubmitting: false,
      companionCount: 1,
      applyStatus(data) {
        try {
          if (!data || typeof data !== "object") return;
          if (data.device) this.responded = true;
          if (data.id !== undefined && data.id !== null) {
            this.recordId = data.id;
            this.responded = true;
          }
          if (typeof data.name === "string" && data.name.trim().length) {
            this.name = data.name.trim();
          }
          if (typeof data.beverage === "string" && data.beverage.trim().length) {
            this.beverage = data.beverage.trim();
          }
          if (
            typeof data.companion === "string" &&
            data.companion.trim().length
          ) {
            this.companion = data.companion.trim();
          }
          if (
            typeof data.companionBeverage === "string" &&
            data.companionBeverage.trim().length
          ) {
            this.companionBeverage = data.companionBeverage.trim();
          }
          if (
            typeof data.companion2 === "string" &&
            data.companion2.trim().length
          ) {
            this.companion2 = data.companion2.trim();
          }
          if (
            typeof data.companion2Beverage === "string" &&
            data.companion2Beverage.trim().length
          ) {
            this.companion2Beverage = data.companion2Beverage.trim();
          }
          if (
            typeof data.companionCount === "number" &&
            data.companionCount >= 0
          ) {
            this.companionCount = data.companionCount;
          }
        } catch (e) {}
      },
      init() {
        // Check for companion count parameter
        try {
          const params =
            typeof window.getUrlParams === "function"
              ? window.getUrlParams()
              : {};
          const companionParam =
            params.companion ?? params.Companion ?? params.COMPANION;
          if (typeof companionParam === "string" && companionParam.length) {
            const count = parseInt(companionParam, 10);
            if (!isNaN(count)) {
              const clamped = Math.max(0, Math.min(5, count));
              this.companionCount = clamped;
              if (clamped === 0) {
                this.companion = "";
                this.companionBeverage = "";
                this.companion2 = "";
                this.companion2Beverage = "";
              }
            }
          }
        } catch (e) {}

        // Prefill from local storage if present
        try {
          const localKey = "wedding.rsvp";
          const stored = JSON.parse(localStorage.getItem(localKey) || "null");
          if (stored) this.applyStatus(stored);
        } catch (e) {}
        try {
          const params =
            typeof window.getUrlParams === "function"
              ? window.getUrlParams()
              : {};
          const main = params.main ?? params.Main ?? params.MAIN;
          const sub = params.sub ?? params.Sub ?? params.SUB;
          if (typeof main === "string" && main.length) {
            this.name = decodeURIComponent(main).replace(/\+/g, " ").trim();
          }
          if (typeof sub === "string" && sub.length) {
            this.companion = decodeURIComponent(sub).replace(/\+/g, " ").trim();
          }
        } catch (e) {}
        // Apply RSVP status if already checked on startup
        try {
          const st = window.__rsvpStatus;
          if (st) this.applyStatus(st);
        } catch (e) {}
        // Listen for async status resolution from startup check
        try {
          window.addEventListener("rsvpstatus", (e) => {
            const data = (e && e.detail) || {};
            this.applyStatus(data);
          });
        } catch (e) {}
      },
      canSubmit() {
        const hasName =
          typeof this.name === "string" && this.name.trim().length > 0;
        const hasBeverage =
          typeof this.beverage === "string" && this.beverage.trim().length > 0;
        const hasCompanion =
          typeof this.companion === "string" && this.companion.trim().length >= 3;
        const hasCompanionBeverage =
          typeof this.companionBeverage === "string" &&
          this.companionBeverage.trim().length > 0;
        const hasCompanion2 =
          typeof this.companion2 === "string" &&
          this.companion2.trim().length >= 3;
        const hasCompanion2Beverage =
          typeof this.companion2Beverage === "string" &&
          this.companion2Beverage.trim().length > 0;

        // Check first companion
        const companion1Valid =
          this.companionCount < 1 || !hasCompanion || hasCompanionBeverage;
        // Check second companion if companion count is 2 or more
        const companion2Valid =
          this.companionCount < 2 || !hasCompanion2 || hasCompanion2Beverage;

        return hasName && hasBeverage && companion1Valid && companion2Valid;
      },
      capitalize(str) {
        return (str || "").trim().replace(/\b\w/g, (c) => c.toUpperCase());
      },
      showRsvpInfo() {
        if (window.Swal && typeof window.Swal.fire === "function") {
          window.Swal.fire({
            title: "RSVP Confirmation",
            html: `
                   <div style="text-align: left; line-height: 1.6;">
                     <p style="margin-bottom: 16px;">While we truly appreciate multiple guests, our wedding has limited seating.</p>
                     <p style="margin-bottom: 16px;">We kindly ask you to confirm your attendance at your earliest convenience.</p>
                     <p style="margin-bottom: 16px;">Your RSVP will help us plan and ensure everyone has a wonderful experience. 💍✨</p>
                   </div>
                 `,
            icon: "info",
            showCancelButton: false,
            confirmButtonText: "Continue to RSVP",
            cancelButtonText: "Cancel",
            confirmButtonColor: "rgba(159, 18, 57, 0.8)",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
            customClass: {
              icon: "my-custom-icon",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              this.open = true;
            }
          });
        } else {
          // Fallback if SweetAlert is not available
          if (
            confirm(
              "While we truly appreciate multiple guests, our wedding has limited seating.\n\nWe kindly ask you to confirm your attendance at your earliest convenience.\n\nYour RSVP will help us plan and ensure everyone has a wonderful experience. 💍✨\n\nDo you want to continue with RSVP?"
            )
          ) {
            this.open = true;
          }
        }
      },
      async submit() {
        if (!this.canSubmit()) return;
        const url =
          "https://primary-production-a114c.up.railway.app/webhook/rsvp";
        let fingerprint = null;
        try {
          fingerprint = await (typeof window.getFingerprint === "function"
            ? window.getFingerprint()
            : Promise.resolve(null));
        } catch (e) {}
        const payload = {
          name: this.capitalize(this.name),
          beverage: this.capitalize(this.beverage),
          companion:
            this.companionCount >= 1
              ? this.capitalize(this.companion) || null
              : null,
          companionBeverage:
            this.companionCount >= 1
              ? (((this.capitalize(this.companion) || "").trim().length >= 3 &&
                  this.capitalize(this.companionBeverage)) || null)
              : null,
          companion2:
            this.companionCount >= 2
              ? (this.capitalize(this.companion2) || "").trim() || null
              : null,
          companion2Beverage:
            this.companionCount >= 2
              ? ((this.capitalize(this.companion2) || "").trim().length >= 3 &&
                  (this.capitalize(this.companion2Beverage) || "").trim()) ||
                null
              : null,
          //  companionCount: this.companionCount,
          type: "rsvp_accept",
          device: fingerprint ?? null,
          submittedDate: new Date().toISOString(),
        };
        if (fingerprint) payload.device = fingerprint;
        try {
          console.debug(
            "[RSVP SUBMIT] fingerprint",
            fingerprint,
            "payload",
            payload
          );
        } catch (e) {}
        if (this.recordId !== null && this.recordId !== undefined) {
          payload.id = this.recordId;
        }
        if (this.isSubmitting) return;
        this.isSubmitting = true;
        try {
          const auth = "Basic " + btoa("admin:rsvpMentos172025!");
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: auth,
            },
            body: JSON.stringify(payload),
            keepalive: true,
          })
            .then((res) => {
              if (!res.ok) throw new Error("HTTP " + res.status);
              return res.json().catch(() => ({}));
            })
            .then((data) => {
              try {
                const localKey = "wedding.rsvp";
                const recordId =
                  (data && (data.id ?? data.recordId)) ?? this.recordId ?? null;
                if (recordId !== null && recordId !== undefined)
                  this.recordId = recordId;
                const toStore = {
                  id: recordId,
                  name: (this.name || "").trim(),
                  beverage: (this.beverage || "").trim(),
                  companion:
                    this.companionCount >= 1
                      ? (this.companion || "").trim() || null
                      : null,
                  companionBeverage:
                    this.companionCount >= 1
                      ? (this.companion || "").trim().length >= 3
                        ? (this.companionBeverage || "").trim() || null
                        : null
                      : null,
                  companion2:
                    this.companionCount >= 2
                      ? (this.companion2 || "").trim() || null
                      : null,
                  companion2Beverage:
                    this.companionCount >= 2
                      ? (this.companion2 || "").trim().length >= 3
                        ? (this.companion2Beverage || "").trim() || null
                        : null
                      : null,
                  //  companionCount: this.companionCount,
                  device: fingerprint || null,
                  type: "rsvp_accept",
                  submittedDate: new Date().toISOString(),
                };
                localStorage.setItem(localKey, JSON.stringify(toStore));
                try {
                  window.__rsvpStatus = Object.assign({}, data || {}, toStore);
                } catch (e) {}
              } catch (e) {}
              this.responded = true;
              this.open = false;
              if (window.Swal && typeof window.Swal.fire === "function") {
                window.Swal.fire({
                  icon: "success",
                  title: "RSVP sent",
                  text: "Thank you! We have received your response. See you soon!",
                  confirmButtonColor: "rgba(159, 18, 57, 0.8)",
                  customClass: {
                    icon: "my-custom-icon",
                  },
                }).then(() => {
                  try {
                    window.location.reload();
                  } catch (e) {}
                });
              } else {
                alert("RSVP sent. Thank you!");
                try {
                  window.location.reload();
                } catch (e) {}
              }
            })
            .catch((err) => {
              console.error("RSVP error:", err);
              if (window.Swal && typeof window.Swal.fire === "function") {
                window.Swal.fire({
                  icon: "error",
                  title: "Failed to send",
                  text: "Please try again later or email us directly.",
                  confirmButtonColor: "rgba(159, 18, 57, 0.8)",
                });
              } else {
                alert("Failed to send RSVP. Please try again later or email us.");
              }
            })
            .finally(() => {
              this.isSubmitting = false;
            });
        } catch (e) {
          console.error("RSVP error:", e);
          alert("Failed to send RSVP. Please try again later or email us.");
          this.isSubmitting = false;
        }
      },
    }));
  }
  if (window.Alpine && typeof window.Alpine.data === "function") {
    __registerWeddingAlpine();
    try {
      if (typeof window.Alpine.initTree === "function") {
        window.Alpine.initTree(document.body);
      }
    } catch (e) {}
  } else {
    document.addEventListener("alpine:init", __registerWeddingAlpine);
  }
})();
// Simple URL params helper
window.getUrlParams = function () {
  try {
    const out = {};
    const usp = new URLSearchParams(window.location.search || "");
    usp.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  } catch (e) {
    return {};
  }
};
// Helper for desktop: temporarily enable scroll to jump sections via buttons/dots
window.goToSection = function (index) {
  const sections = Array.from(document.querySelectorAll("section"));
  const el = sections[index];
  if (!el) return;
  const root = document.documentElement;
  const body = document.body;
  const prevRoot = root.style.overflowY;
  const prevBody = body.style.overflowY;
  root.style.overflowY = "auto";
  body.style.overflowY = "auto";
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // proactively notify listeners which section is active
  try {
    window.dispatchEvent(
      new CustomEvent("sectionchange", { detail: { index } })
    );
  } catch (e) {}
  setTimeout(() => {
    root.style.overflowY = "hidden";
    body.style.overflowY = "hidden";
    try {
      window.dispatchEvent(
        new CustomEvent("sectionchange", { detail: { index } })
      );
    } catch (e) {}
  }, 900);
};
