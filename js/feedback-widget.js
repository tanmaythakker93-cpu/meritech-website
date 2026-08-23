(function () {
  var API = "/.netlify/functions/pins";
  var page = window.location.pathname;
  var pinMode = false;
  var markers = [];

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") e.textContent = attrs[k];
        else e.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      e.appendChild(c);
    });
    return e;
  }

  function docHeight() {
    return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  }
  function docWidth() {
    return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  }

  function toPixels(xPercent, yPercent) {
    return {
      x: (xPercent / 100) * docWidth(),
      y: (yPercent / 100) * docHeight(),
    };
  }

  // Pins anchor to the nearest section (not the whole document) so their
  // percent position is measured against a small, stable box instead of
  // full-page scrollWidth/scrollHeight — which vary across browsers/OS
  // display-scale settings and drift more the further down the page you go.
  function getContainer(target) {
    var container = target.closest("section, header, footer, main, article");
    return container || document.body;
  }

  function cssPath(node) {
    var parts = [];
    while (node && node.nodeType === 1) {
      if (node.id) {
        parts.unshift("#" + CSS.escape(node.id));
        return parts.join(" > ");
      }
      if (node === document.body) {
        parts.unshift("body");
        return parts.join(" > ");
      }
      var parent = node.parentElement;
      if (!parent) {
        parts.unshift(node.tagName.toLowerCase());
        return parts.join(" > ");
      }
      var siblings = Array.prototype.filter.call(parent.children, function (c) {
        return c.tagName === node.tagName;
      });
      var tag = node.tagName.toLowerCase();
      parts.unshift(siblings.length > 1 ? tag + ":nth-of-type(" + (siblings.indexOf(node) + 1) + ")" : tag);
      node = parent;
    }
    return parts.join(" > ");
  }

  function resolveContainer(pin) {
    if (!pin.selector) return null;
    try {
      return document.querySelector(pin.selector);
    } catch (e) {
      return null;
    }
  }

  function ensurePositioned(container) {
    if (container === document.body) return;
    if (window.getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
  }

  function closeAnyPopup() {
    var existing = document.querySelector(".fw-popup");
    if (existing) existing.remove();
  }

  function getStoredName() {
    return localStorage.getItem("fw_author") || "";
  }
  function setStoredName(name) {
    localStorage.setItem("fw_author", name);
  }

  function renderMarker(pin) {
    var marker = el("div", {
      class: "fw-marker" + (pin.state === "closed" ? " fw-resolved" : ""),
    });
    var container = resolveContainer(pin);
    if (container) {
      ensurePositioned(container);
      marker.style.left = pin.xPercent + "%";
      marker.style.top = pin.yPercent + "%";
      container.appendChild(marker);
    } else {
      // Legacy pins saved before container-relative anchoring: keep the old
      // full-document math so they don't jump to a new spot.
      var pos = toPixels(pin.xPercent, pin.yPercent);
      marker.style.left = pos.x + "px";
      marker.style.top = pos.y + "px";
      document.body.appendChild(marker);
    }
    var num = el("div", { class: "fw-marker-num", text: String(pin.number) });
    marker.appendChild(num);
    marker.addEventListener("click", function (ev) {
      ev.stopPropagation();
      openThreadPopup(pin, marker);
    });
    markers.push(marker);
  }

  function clearMarkers() {
    markers.forEach(function (m) {
      m.remove();
    });
    markers = [];
  }

  async function loadPins() {
    clearMarkers();
    try {
      var res = await fetch(API + "?page=" + encodeURIComponent(page));
      if (!res.ok) return;
      var pins = await res.json();
      pins.forEach(renderMarker);
    } catch (e) {
      console.error("feedback widget: failed to load pins", e);
    }
  }

  function openThreadPopup(pin, marker) {
    closeAnyPopup();
    var rect = marker.getBoundingClientRect();
    var pos = { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
    var popup = el("div", {
      class: "fw-popup",
      style: "left:" + (pos.x + 16) + "px; top:" + Math.max(pos.y - 20, 10) + "px;",
    });
    popup.appendChild(el("button", { class: "fw-close", text: "×" }));
    popup.lastChild.addEventListener("click", closeAnyPopup);

    var commentView = el("div", { text: pin.comment });
    popup.appendChild(commentView);
    popup.appendChild(
      el("div", { class: "fw-meta", text: "#" + pin.number + " by " + pin.author + " — " + pin.state })
    );

    var actions = el("div", { class: "fw-row" });

    var editBtn = el("button", { class: "fw-btn-secondary", text: "Edit" });
    editBtn.onclick = function () {
      var textarea = el("textarea", { rows: "3" });
      textarea.value = pin.comment;
      commentView.replaceWith(textarea);
      commentView = textarea;
      editBtn.textContent = "Save";
      editBtn.onclick = async function () {
        var newComment = textarea.value.trim();
        if (!newComment) return;
        editBtn.disabled = true;
        try {
          await fetch(API + "?id=" + pin.number + "&action=edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment: newComment }),
          });
          closeAnyPopup();
          loadPins();
        } catch (e) {
          editBtn.disabled = false;
          alert("Could not save edit, please try again.");
        }
      };
    };

    var doneBtn = el("button", {
      class: "fw-btn-secondary",
      text: pin.state === "closed" ? "Reopen" : "Mark as done",
    });
    doneBtn.addEventListener("click", async function () {
      var action = pin.state === "closed" ? "reopen" : "resolve";
      await fetch(API + "?id=" + pin.number + "&action=" + action, { method: "POST" });
      closeAnyPopup();
      loadPins();
    });

    var deleteBtn = el("button", { class: "fw-btn-secondary", text: "Delete" });
    deleteBtn.addEventListener("click", async function () {
      if (!confirm("Permanently delete this pin? This cannot be undone.")) return;
      deleteBtn.disabled = true;
      try {
        await fetch(API + "?id=" + pin.number + "&action=delete", { method: "POST" });
        closeAnyPopup();
        loadPins();
      } catch (e) {
        deleteBtn.disabled = false;
        alert("Could not delete pin, please try again.");
      }
    });

    var githubLink = el("a", { href: pin.html_url, target: "_blank", text: "View on GitHub" });
    actions.appendChild(githubLink);
    actions.appendChild(editBtn);
    actions.appendChild(doneBtn);
    actions.appendChild(deleteBtn);
    popup.appendChild(actions);

    document.body.appendChild(popup);
  }

  function openNewPinPopup(xPercent, yPercent, selector, clickX, clickY) {
    closeAnyPopup();
    var popup = el("div", {
      class: "fw-popup",
      style: "left:" + (clickX + 12) + "px; top:" + clickY + "px;",
    });
    popup.appendChild(el("button", { class: "fw-close", text: "×" }));
    popup.lastChild.addEventListener("click", closeAnyPopup);

    var nameInput = el("input", { type: "text", placeholder: "Your name", value: getStoredName() });
    var commentInput = el("textarea", { rows: "3", placeholder: "What should change here?" });

    popup.appendChild(nameInput);
    popup.appendChild(commentInput);

    var actions = el("div", { class: "fw-row" });
    var cancelBtn = el("button", { class: "fw-btn-secondary", text: "Cancel" });
    cancelBtn.addEventListener("click", closeAnyPopup);
    var submitBtn = el("button", { class: "fw-btn-primary", text: "Drop pin" });
    submitBtn.addEventListener("click", async function () {
      var author = nameInput.value.trim() || "Anonymous";
      var comment = commentInput.value.trim();
      if (!comment) {
        commentInput.focus();
        return;
      }
      setStoredName(author);
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving…";
      try {
        await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: page,
            xPercent: xPercent,
            yPercent: yPercent,
            selector: selector,
            comment: comment,
            author: author,
          }),
        });
        closeAnyPopup();
        loadPins();
      } catch (e) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Drop pin";
        alert("Could not save pin, please try again.");
      }
    });
    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);
    popup.appendChild(actions);

    document.body.appendChild(popup);
    commentInput.focus();
  }

  function onDocumentClick(ev) {
    if (!pinMode) return;
    if (ev.target.closest(".fw-popup") || ev.target.closest("#fw-toggle") || ev.target.closest(".fw-marker")) {
      return;
    }
    var container = getContainer(ev.target);
    var rect = container.getBoundingClientRect();
    var xPercent = ((ev.clientX - rect.left) / rect.width) * 100;
    var yPercent = ((ev.clientY - rect.top) / rect.height) * 100;
    var selector = cssPath(container);
    openNewPinPopup(xPercent, yPercent, selector, ev.clientX, ev.clientY);
  }

  function init() {
    var toggle = el("button", { id: "fw-toggle", text: "💬 Feedback" });
    toggle.addEventListener("click", function () {
      pinMode = !pinMode;
      toggle.classList.toggle("fw-active", pinMode);
      toggle.textContent = pinMode ? "✕ Cancel pin" : "💬 Feedback";
      document.body.classList.toggle("fw-pin-mode", pinMode);
      closeAnyPopup();
    });
    document.body.appendChild(toggle);
    document.addEventListener("click", onDocumentClick);
    loadPins();
    window.addEventListener("resize", loadPins);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
