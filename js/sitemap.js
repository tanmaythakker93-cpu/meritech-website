(function () {
  var divisions = [
    {
      key: "wl", tag: "WL", name: "Wireless T&amp;M",
      hub: { name: "Explore Wireless Portfolio", file: "Wireless.html" },
      groups: [
        { label: "Products", items: [
          { name: "Sigma-LA", file: "sigma_la.html" },
          { name: "Sigma-ML", file: "sigma_ml.html" },
          { name: "Sigma-AQ", file: "sigma_aq.html" },
          { name: "Sigma-AQ Boss", file: "sigma_aq_boss.html" },
          { name: "Sigma-One", file: "sigma_one.html" },
          { name: "Sigma-PA", file: "Sigma_PA.html" },
          { name: "Centra-SD", file: "centra_sd.html" },
          { name: "Sigma-NEO", file: "sigma_neo.html" }
        ]},
        { label: "Services", items: [
          { name: "Planning &amp; Design", file: "planning_design.html" },
          { name: "Drive &amp; Walk Test", file: "drive_walk_test.html" },
          { name: "Network Optimisation", file: "network_optimization.html" },
          { name: "Wireless Services", file: "wireless_services.html" }
        ]}
      ]
    },
    {
      key: "iot", tag: "IOT", name: "IoT &amp; Edge AI",
      hub: { name: "IoT Services", file: "iot_services.html" },
      groups: [
        { label: "Products", items: [
          { name: "monoZ / IoT Portfolio", file: "ExploreIoTportfolio.html" },
          { name: "Centra-IoT", file: "CENTRA_IoT.html" },
          { name: "Xeno+ Suite", file: "XENO+.html" },
          { name: "Mesimo", file: "mesimo.html" }
        ]},
        { label: "Services", items: [
          { name: "IoT Consulting", file: "iot_consulting.html" },
          { name: "Device Management", file: "device_management.html" },
          { name: "Connectivity Solutions", file: "connectivity_solutions.html" },
          { name: "Cloud Software Development", file: "cloud_software_development.html" },
          { name: "Operations Support &amp; Maintenance", file: "operations_support_maintenance.html" }
        ]}
      ]
    },
    {
      key: "itc", tag: "ITC", name: "IT &amp; Cloud",
      hub: { name: "Explore IT &amp; Cloud Portfolio", file: "it_services.html" },
      groups: [
        { label: "Services", items: [
          { name: "Digital Synergy", file: "digital_synergy_solutions_1.html" },
          { name: "Data &amp; AI", file: "data_ai.html" },
          { name: "DevOps", file: "devops.html" },
          { name: "Cloud", file: "cloud.html" },
          { name: "IT Consulting", file: "it_consulting.html" },
          { name: "IT Outsourcing", file: "it_outsourcing_services.html" },
          { name: "ServiceNow", file: "servicenow.html" },
          { name: "Managed IT", file: "managed_it_services.html" },
          { name: "zoECON™", file: "zoecon_cloud_cost_optimizer.html" },
          { name: "Independent Validation Services", file: "independent_validation_services.html" }
        ]}
      ]
    },
    {
      key: "cor", tag: "COR", name: "Corporate",
      hub: null,
      groups: [
        { label: "Company", items: [
          { name: "About the Company", file: "about.html" },
          { name: "Leadership", file: "leadership.html" },
          { name: "Clients &amp; Partners", file: "clients_partners.html" },
          { name: "Contact Us", file: "contact_us.html" }
        ]},
        { label: "Use Cases", items: [
          { name: "Use Cases", file: "case_studies.html" }
        ]},
        { label: "Utility", items: [
          { name: "Privacy Policy", file: "privacy_policy.html" },
          { name: "404 — Page Not Found", file: "404.html" }
        ]}
      ]
    }
  ];

  var COLLAPSE_AFTER = 6;

  function pageRow(it, collapsedIndex) {
    var name = it.name.toLowerCase();
    var planned = it.planned || !it.file; // defensive: no file means not live yet
    var extraClass = collapsedIndex != null ? " sm-collapsed" : "";
    if (planned) {
      return '<li class="sm-planned-row' + extraClass + '" data-name="' + name + '">' +
        '<span class="sm-dot sm-dot--planned"></span>' +
        '<span><span class="sm-pagename">' + it.name + '</span>' +
        (it.note ? '<span class="sm-path">' + it.note + '</span>' : '') + '</span></li>';
    }
    return '<li class="' + extraClass.trim() + '" data-name="' + name + '">' +
      '<span class="sm-dot sm-dot--live"></span>' +
      '<a href="' + it.file + '">' +
      '<span class="sm-pagename">' + it.name + '</span>' +
      '<span class="sm-path">/' + it.file + '</span>' +
      '</a></li>';
  }

  function renderGroup(g, groupIdx, divKey) {
    var items = g.items;
    var rows = items.map(function (it, i) {
      return pageRow(it, i >= COLLAPSE_AFTER ? i : null);
    }).join("");
    var toggle = "";
    if (items.length > COLLAPSE_AFTER) {
      var hiddenCount = items.length - COLLAPSE_AFTER;
      var groupId = "smg-" + divKey + "-" + groupIdx;
      toggle = '<button class="sm-more-toggle" data-target="' + groupId + '">+ ' + hiddenCount + ' more</button>';
      return '<div class="sm-group" id="' + groupId + '"><div class="sm-group-label">' + g.label + '</div>' +
        '<ul class="sm-pages">' + rows + '</ul>' + toggle + '</div>';
    }
    return '<div class="sm-group"><div class="sm-group-label">' + g.label + '</div>' +
      '<ul class="sm-pages">' + rows + '</ul></div>';
  }

  function renderGrid() {
    var grid = document.getElementById("smGrid");
    grid.innerHTML = divisions.map(function (d) {
      var count = d.groups.reduce(function (s, g) { return s + g.items.length; }, 0);
      var hub = d.hub ? '<div class="sm-hub">Hub: <a href="' + d.hub.file + '">' + d.hub.name + '</a></div>' : "";
      var groups = d.groups.map(function (g, gi) { return renderGroup(g, gi, d.key); }).join("");
      return '<div class="sm-card" data-div="' + d.key + '">' +
        '<div class="sm-card-head"><div class="sm-card-head-left"><span class="sm-tag">' + d.tag + '</span>' +
        '<h2 class="sm-card-title">' + d.name + '</h2></div><span class="sm-card-count">' + count + '</span></div>' +
        hub + groups + '</div>';
    }).join("");

  }

  function currentDiv() {
    var active = document.querySelector(".ss-pill.is-active");
    return active ? active.dataset.div : "all";
  }

  function applyFilters() {
    var div = currentDiv();
    var q = (document.getElementById("smSearch").value || "").trim().toLowerCase();
    var visibleCount = 0;

    document.querySelectorAll("#smGrid .sm-card").forEach(function (card) {
      var divMatch = div === "all" || card.dataset.div === div;
      var anyRow = false;
      card.querySelectorAll(".sm-group").forEach(function (group) {
        var groupHas = false;
        group.querySelectorAll("li").forEach(function (li) {
          var match = divMatch && (!q || li.dataset.name.indexOf(q) !== -1);
          li.classList.toggle("sm-hidden", !match);
          if (match && q) li.classList.remove("sm-collapsed");
          if (match) { groupHas = true; visibleCount++; }
        });
        group.classList.toggle("sm-hidden", !groupHas);
        if (groupHas) anyRow = true;
      });
      card.classList.toggle("sm-hidden", !anyRow);
    });

    document.getElementById("smCount").textContent = visibleCount + " pages shown";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderGrid();
    applyFilters();

    document.querySelectorAll(".ss-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        document.querySelectorAll(".ss-pill").forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        applyFilters();
      });
    });

    document.getElementById("smSearch").addEventListener("input", applyFilters);

    document.getElementById("smGrid").addEventListener("click", function (e) {
      var btn = e.target.closest(".sm-more-toggle");
      if (!btn) return;
      var group = document.getElementById(btn.dataset.target);
      group.querySelectorAll("li.sm-collapsed").forEach(function (li) { li.classList.remove("sm-collapsed"); });
      btn.remove();
    });
  });
})();
