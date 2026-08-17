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
    var pos = toPixels(pin.xPercent, pin.yPercent);
    var marker = el("div", {
      class: "fw-marker" + (pin.state === "closed" ? " fw-resolved" : ""),
      style: "left:" + pos.x + "px; top:" + pos.y + "px;",
    });
    var num = el("div", { class: "fw-marker-num", text: String(pin.number) });
    marker.appendChild(num);
    marker.addEventListener("click", function (ev) {
      ev.stopPropagation();
      openThreadPopup(pin, pos);
    });
    document.body.appendChild(marker);
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

  function openThreadPopup(pin, pos) {
    closeAnyPopup();
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

  function openNewPinPopup(xPercent, yPercent, clickX, clickY) {
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
    var xPercent = (ev.pageX / docWidth()) * 100;
    var yPercent = (ev.pageY / docHeight()) * 100;
    openNewPinPopup(xPercent, yPercent, ev.clientX, ev.clientY);
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
