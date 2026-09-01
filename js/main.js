(function () {
  var year = document.getElementById("year");
  var cards = document.querySelectorAll(".card");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function navigationType() {
    var entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
    var entry = entries && entries[0];

    if (entry && entry.type) {
      return entry.type;
    }

    if (performance.navigation) {
      if (performance.navigation.type === 1) {
        return "reload";
      }
      if (performance.navigation.type === 2) {
        return "back_forward";
      }
    }

    return "navigate";
  }

  function scrollToId(id) {
    var target = document.getElementById(id);
    if (!target) {
      return false;
    }
    target.scrollIntoView({ behavior: "auto", block: "start" });
    return true;
  }

  function scrollToOfferings() {
    if (window.location.hash !== "#offerings") {
      history.replaceState(null, "", "#offerings");
    }
    scrollToId("offerings");
  }

  function scrollToTop() {
    if (window.location.hash === "#offerings" || window.location.hash === "#top") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
  }

  function applyLandingScroll() {
    var type = navigationType();
    var hash = window.location.hash;

    if (type === "reload") {
      scrollToOfferings();
      return;
    }

    if (type === "back_forward") {
      if (hash === "#offerings") {
        scrollToId("offerings");
      } else if (hash && hash !== "#top") {
        scrollToId(hash.slice(1));
      }
      return;
    }

    if (hash && hash !== "#top" && hash !== "#offerings") {
      scrollToId(hash.slice(1));
      return;
    }

    scrollToTop();
  }

  applyLandingScroll();
  window.addEventListener("load", function () {
    applyLandingScroll();
    window.setTimeout(applyLandingScroll, 60);
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      return;
    }
    applyLandingScroll();
  });

  cards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      var box = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - box.left + "px");
      card.style.setProperty("--my", event.clientY - box.top + "px");
    });

    card.addEventListener("click", function () {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }
      cards.forEach(function (other) {
        if (other !== card) {
          other.classList.remove("is-open");
        }
      });
      card.classList.toggle("is-open");
    });
  });

  var offerWindows = Array.prototype.slice.call(document.querySelectorAll(".offer-window"));
  if (
    offerWindows.length &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    var lastIndex = -1;
    var queue = [];
    var hovered = false;
    var timer;

    function between(min, max) {
      return min + Math.random() * (max - min);
    }

    function shuffle(items) {
      var copy = items.slice();
      var i;
      var j;
      var swap;

      for (i = copy.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        swap = copy[i];
        copy[i] = copy[j];
        copy[j] = swap;
      }

      return copy;
    }

    function isLeftToRight(items) {
      var i;

      for (i = 1; i < items.length; i += 1) {
        if (items[i] !== items[i - 1] + 1) {
          return false;
        }
      }

      return items.length > 1;
    }

    function refillQueue() {
      var indexes = offerWindows.map(function (_item, index) {
        return index;
      });

      do {
        queue = shuffle(indexes);
      } while (isLeftToRight(queue));

      if (queue.length > 1 && queue[0] === lastIndex) {
        var swapWith = 1 + Math.floor(Math.random() * (queue.length - 1));
        var first = queue[0];
        queue[0] = queue[swapWith];
        queue[swapWith] = first;
      }
    }

    function nextOffer() {
      if (!queue.length) {
        refillQueue();
      }

      lastIndex = queue.shift();
      return lastIndex;
    }

    function clearAwake() {
      offerWindows.forEach(function (item) {
        item.classList.remove("is-awake");
      });
    }

    function pulse() {
      if (document.hidden || hovered) {
        timer = window.setTimeout(pulse, 900);
        return;
      }

      var next = nextOffer();
      clearAwake();
      offerWindows[next].classList.add("is-awake");

      timer = window.setTimeout(function () {
        offerWindows[next].classList.remove("is-awake");
        timer = window.setTimeout(pulse, between(2400, 4200));
      }, between(560, 800));
    }

    offerWindows.forEach(function (item) {
      item.addEventListener("pointerenter", function () {
        hovered = true;
        window.clearTimeout(timer);
        clearAwake();
      });
      item.addEventListener("pointerleave", function () {
        hovered = false;
        timer = window.setTimeout(pulse, between(1600, 2800));
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.clearTimeout(timer);
        clearAwake();
      } else if (!hovered) {
        timer = window.setTimeout(pulse, between(1200, 2200));
      }
    });

    timer = window.setTimeout(pulse, between(1800, 2800));
  }
})();
