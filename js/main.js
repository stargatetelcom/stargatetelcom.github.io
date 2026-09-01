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

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isOfferId(id) {
    return id === "home" || id === "roam" || id === "boost" || id === "marketplace";
  }

  var offerWindows = Array.prototype.slice.call(document.querySelectorAll(".offer-window"));
  var contactCard = document.querySelector(".contact-card");
  var revealToken = 0;
  var landingOffer = false;

  function scrollToId(id, smooth) {
    var target = document.getElementById(id);
    if (!target) {
      return false;
    }
    target.scrollIntoView({
      behavior: smooth && !reducedMotion() ? "smooth" : "auto",
      block: "start"
    });
    return true;
  }

  function cardMostlyVisible(card) {
    var box = card.getBoundingClientRect();
    var topLimit = 88;
    var bottomLimit = window.innerHeight - 24;
    return box.top >= topLimit - 12 && box.bottom <= bottomLimit + 12;
  }

  function offeringsFramed() {
    var section = document.getElementById("offerings");
    if (!section) {
      return false;
    }
    var box = section.getBoundingClientRect();
    var header = 96;
    return box.top >= header - 24 && box.top <= header + 120;
  }

  function nudgeCardIfClipped(card, done) {
    if (!card || cardMostlyVisible(card) || reducedMotion()) {
      if (done) {
        done();
      }
      return;
    }
    card.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
    if (done) {
      afterScrollSettles(done);
      return;
    }
  }

  function frameOfferingsThenCard(card, done) {
    var section = document.getElementById("offerings");

    function afterFrame() {
      nudgeCardIfClipped(card, done);
    }

    if (!section || offeringsFramed() || reducedMotion()) {
      afterFrame();
      return;
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    afterScrollSettles(afterFrame);
  }

  function bringCardIntoView(card, done) {
    if (offeringsFramed()) {
      nudgeCardIfClipped(card, done);
      return;
    }
    frameOfferingsThenCard(card, done);
  }

  function afterScrollSettles(callback) {
    var done = false;
    function finish() {
      if (done) {
        return;
      }
      done = true;
      callback();
    }
    if (reducedMotion()) {
      finish();
      return;
    }
    window.addEventListener("scrollend", finish, { once: true });
    window.setTimeout(finish, 720);
  }

  function closeOfferCards() {
    cards.forEach(function (card) {
      card.classList.remove("is-open", "is-arriving");
    });
  }

  function closeContact() {
    if (contactCard) {
      contactCard.classList.remove("is-open");
    }
  }

  function highlightChip(id) {
    offerWindows.forEach(function (item) {
      var href = item.getAttribute("href") || "";
      if (id && href === "#" + id) {
        item.classList.add("is-selected");
      } else {
        item.classList.remove("is-selected");
      }
    });
  }

  function selectOfferChip(id) {
    highlightChip(id);
  }

  function clearChipSelection() {
    highlightChip(null);
  }

  function sheenCard(card) {
    card.classList.remove("is-arriving");
    void card.offsetWidth;
    card.classList.add("is-arriving");
  }

  function awakenCard(card) {
    var box = card.getBoundingClientRect();
    card.style.setProperty("--mx", box.width / 2 + "px");
    card.style.setProperty("--my", box.height * 0.36 + "px");
    card.classList.add("is-open");
    sheenCard(card);
  }

  function awakenContact() {
    closeContact();
    if (!contactCard) {
      return;
    }
    void contactCard.offsetWidth;
    contactCard.classList.add("is-open");
  }

  var offerOrder = ["home", "roam", "boost", "marketplace"];
  var tourTimer;
  var tourIndex = 0;
  var tourActive = false;
  var tourPaused = false;
  var TOUR_INTRO = 1200;
  var TOUR_HOLD = 3800;
  var TOUR_GAP = 900;
  var TOUR_LOOP = 2400;

  function offeringsVisible() {
    var section = document.getElementById("offerings");
    if (!section) {
      return false;
    }
    var box = section.getBoundingClientRect();
    var mid = box.top + box.height * 0.28;
    return mid < window.innerHeight && box.bottom > 140;
  }

  function stopTour() {
    tourActive = false;
    tourPaused = false;
    window.clearTimeout(tourTimer);
    closeOfferCards();
    highlightChip(null);
  }

  function pauseTour() {
    if (!tourActive) {
      return;
    }
    tourPaused = true;
    window.clearTimeout(tourTimer);
    closeOfferCards();
    highlightChip(null);
  }

  function resumeTour() {
    if (!tourActive || !tourPaused || landingOffer || reducedMotion() || document.hidden) {
      return;
    }
    tourPaused = false;
    window.clearTimeout(tourTimer);
    tourTimer = window.setTimeout(openTourCard, 1300);
  }

  function openTourCard() {
    if (!tourActive || tourPaused || landingOffer || document.hidden || reducedMotion()) {
      return;
    }
    var id = offerOrder[tourIndex];
    var card = document.getElementById(id);
    if (!card) {
      return;
    }
    closeOfferCards();
    highlightChip(id);
    bringCardIntoView(card, function () {
      if (!tourActive || tourPaused || landingOffer) {
        return;
      }
      awakenCard(card);
      tourTimer = window.setTimeout(closeTourCard, TOUR_HOLD);
    });
  }

  function closeTourCard() {
    if (!tourActive || tourPaused || landingOffer) {
      return;
    }
    closeOfferCards();
    highlightChip(null);
    tourIndex = (tourIndex + 1) % offerOrder.length;
    tourTimer = window.setTimeout(
      openTourCard,
      tourIndex === 0 ? TOUR_LOOP : TOUR_GAP
    );
  }

  function startTour() {
    if (reducedMotion() || landingOffer || document.hidden) {
      return;
    }
    if (tourActive && !tourPaused) {
      return;
    }
    if (tourActive && tourPaused) {
      resumeTour();
      return;
    }
    restartTour();
  }

  function restartTour() {
    if (reducedMotion() || landingOffer || document.hidden) {
      return;
    }
    tourActive = true;
    tourPaused = false;
    tourIndex = 0;
    window.clearTimeout(tourTimer);
    closeOfferCards();
    highlightChip(null);
    tourTimer = window.setTimeout(openTourCard, TOUR_INTRO);
  }

  function continueTourAfter(id) {
    if (reducedMotion() || document.hidden) {
      landingOffer = false;
      return;
    }
    var idx = offerOrder.indexOf(id);
    tourIndex = idx < 0 ? 0 : (idx + 1) % offerOrder.length;
    tourActive = true;
    tourPaused = false;
    landingOffer = false;
    window.clearTimeout(tourTimer);
    tourTimer = window.setTimeout(function () {
      if (!tourActive || tourPaused) {
        return;
      }
      closeOfferCards();
      highlightChip(null);
      tourTimer = window.setTimeout(openTourCard, TOUR_GAP);
    }, TOUR_HOLD);
  }

  function revealOffer(id) {
    var card = document.getElementById(id);
    if (!card || !card.classList.contains("card")) {
      return;
    }

    stopTour();
    landingOffer = true;
    revealToken += 1;
    var token = revealToken;
    closeOfferCards();
    closeContact();
    highlightChip(id);

    function play() {
      if (token !== revealToken) {
        return;
      }
      awakenCard(card);
      continueTourAfter(id);
    }

    if (reducedMotion()) {
      frameOfferingsThenCard(card, play);
      return;
    }

    frameOfferingsThenCard(card, play);
  }

  function goToSection(id) {
    if (isOfferId(id)) {
      revealOffer(id);
      return;
    }

    revealToken += 1;
    stopTour();
    closeOfferCards();
    clearChipSelection();

    if (id === "contact") {
      scrollToId("contact", true);
      afterScrollSettles(awakenContact);
      return;
    }

    closeContact();

    if (id === "offerings") {
      scrollToId("offerings", true);
      afterScrollSettles(restartTour);
      return;
    }

    if (id === "top" || !id) {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion() ? "auto" : "smooth"
      });
    }
  }

  function fineHover() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function scrollToOfferings() {
    if (window.location.hash !== "#offerings") {
      history.replaceState(null, "", "#offerings");
    }
    scrollToId("offerings", false);
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
    var id = hash.replace(/^#/, "");

    if (type === "reload") {
      scrollToOfferings();
      closeOfferCards();
      closeContact();
      clearChipSelection();
      startTour();
      return;
    }

    if (type === "back_forward") {
      goToSection(id);
      return;
    }

    if (isOfferId(id) || id === "contact" || id === "offerings") {
      goToSection(id);
      return;
    }

    scrollToTop();
    closeOfferCards();
    closeContact();
    clearChipSelection();
  }

  applyLandingScroll();
  window.addEventListener("load", function () {
    var id = window.location.hash.replace(/^#/, "");
    if (isOfferId(id) || id === "contact") {
      return;
    }
    applyLandingScroll();
    window.setTimeout(applyLandingScroll, 60);
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      return;
    }
    var id = window.location.hash.replace(/^#/, "");
    if (isOfferId(id) || id === "contact") {
      return;
    }
    applyLandingScroll();
  });
  window.addEventListener("popstate", function () {
    var id = window.location.hash.replace(/^#/, "");
    goToSection(id || "top");
  });

  var cardHoverCount = 0;

  cards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      var box = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - box.left + "px");
      card.style.setProperty("--my", event.clientY - box.top + "px");
    });

    card.addEventListener("pointerenter", function () {
      if (!fineHover()) {
        return;
      }
      cardHoverCount += 1;
      pauseTour();
    });

    card.addEventListener("pointerleave", function () {
      if (!fineHover()) {
        return;
      }
      cardHoverCount = Math.max(0, cardHoverCount - 1);
      if (cardHoverCount === 0) {
        resumeTour();
      }
    });

    card.addEventListener("click", function () {
      if (!card.id || !isOfferId(card.id)) {
        return;
      }
      if (window.location.hash !== "#" + card.id) {
        history.pushState(null, "", "#" + card.id);
      }
      revealOffer(card.id);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href") || "";
      var id = href.slice(1);
      if (!id) {
        return;
      }
      event.preventDefault();
      if (id === "top") {
        history.pushState(null, "", window.location.pathname + window.location.search);
        goToSection("top");
        return;
      }
      if (window.location.hash !== href) {
        history.pushState(null, "", href);
      }
      goToSection(id);
    });
  });

  var offeringsSection = document.getElementById("offerings");
  if (offeringsSection && "IntersectionObserver" in window) {
    var offeringsObserver = new IntersectionObserver(function (entries) {
      var entry = entries[0];
      if (!entry) {
        return;
      }
      if (entry.isIntersecting) {
        startTour();
      } else {
        stopTour();
      }
    }, { threshold: [0, 0.04, 0.12, 0.28], rootMargin: "0px 0px -22% 0px" });
    offeringsObserver.observe(offeringsSection);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pauseTour();
      return;
    }
    if (offeringsVisible()) {
      if (tourActive) {
        resumeTour();
      } else {
        startTour();
      }
    }
  });

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
      if (document.hidden || hovered || tourActive || landingOffer) {
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
        if (!fineHover()) {
          return;
        }
        hovered = true;
        window.clearTimeout(timer);
        clearAwake();
      });
      item.addEventListener("pointerleave", function () {
        if (!fineHover()) {
          return;
        }
        hovered = false;
        timer = window.setTimeout(pulse, between(1600, 2800));
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.clearTimeout(timer);
        clearAwake();
      } else if (!hovered && !tourActive && !landingOffer) {
        timer = window.setTimeout(pulse, between(1200, 2200));
      }
    });

    timer = window.setTimeout(pulse, between(1800, 2800));
  }
})();
