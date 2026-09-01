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
  var offerPinned = false;

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
    offerPinned = Boolean(id);
  }

  function clearChipSelection() {
    highlightChip(null);
    offerPinned = false;
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
    if (!offerPinned) {
      closeOfferCards();
      highlightChip(null);
    }
  }

  function pauseTour() {
    if (!tourActive) {
      return;
    }
    tourPaused = true;
    window.clearTimeout(tourTimer);
    if (!offerPinned) {
      closeOfferCards();
      highlightChip(null);
    }
  }

  function resumeTour() {
    if (!tourActive || !tourPaused || offerPinned || reducedMotion() || document.hidden) {
      return;
    }
    tourPaused = false;
    window.clearTimeout(tourTimer);
    tourTimer = window.setTimeout(openTourCard, 1300);
  }

  function openTourCard() {
    if (!tourActive || tourPaused || offerPinned || document.hidden || reducedMotion()) {
      return;
    }
    var id = offerOrder[tourIndex];
    var card = document.getElementById(id);
    if (!card) {
      return;
    }
    closeOfferCards();
    highlightChip(id);
    awakenCard(card);
    tourTimer = window.setTimeout(closeTourCard, TOUR_HOLD);
  }

  function closeTourCard() {
    if (!tourActive || tourPaused || offerPinned) {
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
    if (reducedMotion() || offerPinned || document.hidden) {
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
    if (reducedMotion() || offerPinned || document.hidden) {
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

  function revealOffer(id) {
    var card = document.getElementById(id);
    if (!card || !card.classList.contains("card")) {
      return;
    }

    stopTour();
    revealToken += 1;
    var token = revealToken;
    closeOfferCards();
    closeContact();
    selectOfferChip(id);

    function play() {
      if (token !== revealToken) {
        return;
      }
      awakenCard(card);
    }

    if (reducedMotion()) {
      scrollToId(id, false);
      play();
      return;
    }

    var box = card.getBoundingClientRect();
    var inView = box.top < window.innerHeight * 0.72 && box.bottom > 110;

    scrollToId(id, true);

    if (inView) {
      window.setTimeout(play, 70);
      return;
    }

    afterScrollSettles(play);
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
      if (fineHover()) {
        return;
      }
      var opening = !card.classList.contains("is-open");
      stopTour();
      closeOfferCards();
      closeContact();
      if (opening && card.id) {
        card.classList.add("is-open");
        sheenCard(card);
        selectOfferChip(card.id);
        history.replaceState(null, "", "#" + card.id);
      } else {
        clearChipSelection();
      }
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
      if (entry.intersectionRatio >= 0.28) {
        startTour();
      } else if (entry.intersectionRatio < 0.1) {
        stopTour();
      }
    }, { threshold: [0, 0.1, 0.28, 0.45] });
    offeringsObserver.observe(offeringsSection);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pauseTour();
      return;
    }
    if (offeringsVisible() && !offerPinned) {
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
      if (document.hidden || hovered || offerPinned || tourActive) {
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
      } else if (!hovered && !offerPinned && !tourActive) {
        timer = window.setTimeout(pulse, between(1200, 2200));
      }
    });

    timer = window.setTimeout(pulse, between(1800, 2800));
  }
})();
