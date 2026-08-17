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
          { name: "Sigma-Neo", file: "sigma_neo.html" },
          { name: "Centra-Experitest", file: "centra_experitest.html" },
          { name: "Sigma-AQ Reporting Server", planned: true }
        ]},
        { label: "Services", items: [
          { name: "Planning &amp; Design", file: "planning_design.html" },
          { name: "Drive &amp; Walk Test", file: "drive_walk_test.html" },
          { name: "Network Optimization", file: "network_optimization.html" },
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
        ]},
        { label: "Resources — planned", items: [
          { name: "Case Studies – IoT", planned: true },
          { name: "Use Cases – IoT", planned: true }
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
        ]},
        { label: "Resources — planned", items: [
          { name: "Case Studies – IT", planned: true },
          { name: "Use Cases – IT", planned: true }
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
          { name: "Client &amp; Partners", file: "clients_partners.html" },
          { name: "News &amp; Events", file: "news_events.html" },
          { name: "Contact Us", file: "contact_us.html" }
        ]},
        { label: "Success Stories (16)", items: [
          { name: "Success Stories — hub", file: "success_stories.html" },
          { name: "Railways Track / Relay Management", file: "story_railways_track_relay.html" },
          { name: "Diagnostic System for Air Conditioners", file: "story_diagnostic_air_conditioners.html" },
          { name: "Activity Monitoring — Elderly Care", file: "story_elderly_care.html" },
          { name: "Next-Gen Healthcare Cloud System", file: "story_healthcare_cloud.html" },
          { name: "Sales &amp; Finance Management System", file: "story_sales_finance.html" },
          { name: "Nurse Operations Management System", file: "story_nurse_operations.html" },
          { name: "Social &amp; Behavioural Skill Assessment", file: "story_social_behavioural.html" },
          { name: "CMS — Bedside Monitor Monitoring", file: "story_cms_bedside_monitors.html" },
          { name: "DevOps Consulting", file: "story_devops_consulting.html" },
          { name: "Agri Controller Gateway (LoRa)", file: "story_agri_controller_lora.html" },
          { name: "Telco Network Site Management", file: "story_telco_site_management.html" },
          { name: "Surface Wear Monitoring IoT Device", file: "story_surface_wear_monitoring.html" },
          { name: "BLE Heating Device", file: "story_ble_heating_device.html" },
          { name: "Sensor Watch — Patient Care", file: "story_sensor_watch_patient_care.html" },
          { name: "Pests Sound Classification Device", file: "story_pests_sound_classification.html" },
          { name: "Fleet Management System", file: "story_fleet_management.html" }
        ]},
        { label: "Case Studies", items: [
          { name: "Case Studies", file: "case_studies.html" }
        ]},
        { label: "Utility", items: [
          { name: "Privacy Policy", file: "privacy_policy.html" },
          { name: "404 — Page Not Found", file: "404.html" },
          { name: "Cookie Policy", planned: true },
          { name: "Terms of Use", planned: true }
        ]}
      ]
    }
  ];

  var extraPlanned = [
    { name: "certificates", note: "pending decision — footer vs About Us" }
  ];

  function countAll() {
    var live = 1, planned = 0; // 1 = home
    divisions.forEach(function (d) {
      d.groups.forEach(function (g) {
        g.items.forEach(function (it) { it.planned ? planned++ : live++; });
      });
    });
    planned += extraPlanned.length;
    return { live: live, planned: planned };
  }

  function renderStats() {
    var c = countAll();
    var total = c.live + c.planned;
    document.getElementById("smStats").innerHTML =
      '<div><div class="wl-stat-num">' + total + '</div><div class="wl-stat-label">Total pages</div></div>' +
      '<div><div class="wl-stat-num">' + c.live + '</div><div class="wl-stat-label">Live now</div></div>' +
      '<div><div class="wl-stat-num">' + c.planned + '</div><div class="wl-stat-label">Planned</div></div>' +
      '<div><div class="wl-stat-num">' + divisions.length + '</div><div class="wl-stat-label">Divisions</div></div>';
  }

  function pageRow(it) {
    var name = it.name.toLowerCase();
    if (it.planned) {
      return '<li class="sm-planned-row" data-name="' + name + '">' +
        '<span class="sm-dot sm-dot--planned"></span>' +
        '<span><span class="sm-pagename">' + it.name + '</span>' +
        (it.note ? '<span class="sm-path">' + it.note + '</span>' : '') + '</span></li>';
    }
    return '<li data-name="' + name + '">' +
      '<span class="sm-dot sm-dot--live"></span>' +
      '<a href="' + it.file + '">' +
      '<span class="sm-pagename">' + it.name + '</span>' +
      '<span class="sm-path">/' + it.file + '</span>' +
      '</a></li>';
  }

  function renderGrid() {
    var grid = document.getElementById("smGrid");
    grid.innerHTML = divisions.map(function (d) {
      var count = d.groups.reduce(function (s, g) { return s + g.items.length; }, 0);
      var hub = d.hub ? '<div class="sm-hub">Hub: <a href="' + d.hub.file + '">' + d.hub.name + '</a></div>' : "";
      var groups = d.groups.map(function (g) {
        return '<div class="sm-group"><div class="sm-group-label">' + g.label + '</div>' +
          '<ul class="sm-pages">' + g.items.map(pageRow).join("") + '</ul></div>';
      }).join("");
      return '<div class="sm-card" data-div="' + d.key + '">' +
        '<div class="sm-card-head"><div class="sm-card-head-left"><span class="sm-tag">' + d.tag + '</span>' +
        '<h2 class="sm-card-title">' + d.name + '</h2></div><span class="sm-card-count">' + count + '</span></div>' +
        hub + groups + '</div>';
    }).join("");

    if (extraPlanned.length) {
      grid.innerHTML += '<div class="sm-card" data-div="cor">' +
        '<div class="sm-card-head"><div class="sm-card-head-left"><span class="sm-tag" style="color:#B08A3E;background:rgba(176,138,62,.12);">TBD</span>' +
        '<h2 class="sm-card-title">Unplaced — pending decision</h2></div><span class="sm-card-count">' + extraPlanned.length + '</span></div>' +
        '<div class="sm-group"><ul class="sm-pages">' + extraPlanned.map(pageRow).join("") + '</ul></div></div>';
    }
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
    renderStats();
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
  });
})();
