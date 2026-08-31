/* Link Asia — site behaviour. No dependencies. */
(function () {
  "use strict";

  /* Photo URLs → absolute (fixes subpath hosting, e.g. GitHub Pages).
     Browsers disagree on the base URL for url() inside custom properties
     declared in inline styles; an absolute URL removes the ambiguity. */
  document.querySelectorAll('[style*="--photo"]').forEach(function (el) {
    var m = (el.getAttribute("style") || "").match(/--photo:\s*url\((['"]?)([^'")]+)\1\)/);
    if (m && m[2] && m[2].indexOf("data:") !== 0) {
      try {
        el.style.setProperty("--photo", 'url("' + new URL(m[2], document.baseURI).href + '")');
      } catch (err) { /* leave gradient fallback */ }
    }
  });

  /* Mobile nav ------------------------------------------------------ */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  /* Scroll reveal --------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Count-up stats -------------------------------------------------- */
  function formatNum(n) { return n.toLocaleString("en-US"); }

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var suffix = el.getAttribute("data-suffix") || "";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.innerHTML = formatNum(target) + (suffix ? "<span>" + suffix + "</span>" : "");
      return;
    }
    var start = null;
    var dur = 1400;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.innerHTML = formatNum(val) + (suffix ? "<span>" + suffix + "</span>" : "");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var countObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* Current year ---------------------------------------------------- */
  var years = document.querySelectorAll("[data-year]");
  var y = new Date().getFullYear();
  years.forEach(function (el) { el.textContent = y; });

  /* Guide gate modal ------------------------------------------------ */
  var modal = document.getElementById("gate-modal");
  var gate = document.getElementById("gate");
  if (modal && gate) {
    var shown = false;
    var lastFocus = null;

    function openModal() {
      if (shown) return;
      shown = true;
      lastFocus = document.activeElement;
      modal.hidden = false;
      var first = modal.querySelector("a, button");
      if (first) first.focus();
    }
    function closeModal() {
      modal.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    modal.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close")) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    if ("IntersectionObserver" in window) {
      var gateObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setTimeout(openModal, 900);
              gateObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      gateObs.observe(gate);
    }
  }

  /* Inquiry forms ---------------------------------------------------- */
  document.querySelectorAll(".inquiry-form").forEach(function (form) {
    var status = form.querySelector(".form__status");
    form.addEventListener("submit", function (e) {
      var endpoint = form.getAttribute("action") || "";
      // Until a live endpoint is connected, fall back to a pre-filled email.
      if (!endpoint || endpoint === "#") {
        e.preventDefault();
        var data = new FormData(form);
        var lines = [];
        data.forEach(function (v, k) { if (v) lines.push(k + ": " + v); });
        var subject = "Employer inquiry — " + (data.get("company") || "New enquiry");
        window.location.href =
          "mailto:business@linkasiamanpower.ph?subject=" +
          encodeURIComponent(subject) +
          "&body=" +
          encodeURIComponent(lines.join("\n"));
        if (status) {
          status.setAttribute("data-state", "ok");
          status.textContent = "Opening your email app with the details filled in.";
        }
      }
    });
  });
})();
