document.addEventListener("DOMContentLoaded", () => {
  // 1. Scroll Progress & Header State + Active Nav Spy
  const scrollProgress = document.getElementById("scrollProgress");
  const siteHeader = document.getElementById("siteHeader");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");
  const sections = document.querySelectorAll("main > section[id]");

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    if (scrollProgress) scrollProgress.style.width = `${pct}%`;

    if (siteHeader) {
      siteHeader.classList.toggle("scrolled", scrollTop > 20);
    }

    let currentId = "home";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 130;
      if (scrollTop >= top) {
        currentId = sec.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === currentId);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mainNav = document.getElementById("mainNav");

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mainNav.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Solutions Filtering, Search & Need-Based Quick Matcher
  const filterTabs = document.querySelectorAll(".filter-tab");
  const needChips = document.querySelectorAll(".need-chip");
  const searchInput = document.getElementById("solutionSearch");
  const solutionCards = document.querySelectorAll(".solution-card");
  const domainBoxes = document.querySelectorAll(".domain-box[data-filter]");
  const emptyState = document.getElementById("solutionEmptyState");

  let activeCategory = "all";
  let activeNeedIds = null;

  function applySolutionFilters() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    let visibleCount = 0;

    solutionCards.forEach((card) => {
      const cat = card.dataset.category;
      const id = card.dataset.id;
      const keywords = (card.dataset.keywords || "").toLowerCase();

      const matchCat = activeCategory === "all" || cat === activeCategory;
      const matchNeed = !activeNeedIds || activeNeedIds.includes(id);
      const matchQuery = !query || keywords.includes(query);

      const isVisible = matchCat && matchNeed && matchQuery;
      card.style.display = isVisible ? "flex" : "none";
      card.classList.toggle("highlighted", Boolean(activeNeedIds && activeNeedIds.includes(id)));

      if (isVisible) visibleCount++;
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.category;
      activeNeedIds = null;

      filterTabs.forEach((t) => t.classList.toggle("active", t === tab));
      needChips.forEach((c) => c.classList.remove("active"));
      applySolutionFilters();
    });
  });

  needChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const isAlreadyActive = chip.classList.contains("active");
      needChips.forEach((c) => c.classList.remove("active"));

      if (isAlreadyActive || chip.dataset.ids === "all") {
        activeNeedIds = null;
      } else {
        chip.classList.add("active");
        activeNeedIds = chip.dataset.ids.split(",");
        activeCategory = "all";
        filterTabs.forEach((t) => t.classList.toggle("active", t.dataset.category === "all"));
      }
      applySolutionFilters();
    });
  });

  domainBoxes.forEach((box) => {
    box.addEventListener("click", () => {
      const targetCat = box.dataset.filter;
      const solutionsSec = document.getElementById("solutions");
      if (solutionsSec) {
        solutionsSec.scrollIntoView({ behavior: "smooth" });
      }
      const matchingTab = document.querySelector(`.filter-tab[data-category="${targetCat}"]`);
      if (matchingTab) {
        matchingTab.click();
      }
    });
  });

  // 3-B. SMP Security Map (smpeoples-security-map.html) Ring & List Interaction
  const smpMap = document.getElementById("smpMap");
  if (smpMap) {
    const rings = smpMap.querySelectorAll(".ring");
    const items = smpMap.querySelectorAll(".smp-item");

    function focusKey(key) {
      smpMap.classList.toggle("is-focus", Boolean(key));
      rings.forEach((r) => r.classList.toggle("on", r.dataset.key === key));
      items.forEach((i) => i.classList.toggle("on", i.dataset.key === key));
    }

    items.forEach((item) => {
      const a = item.querySelector("a");
      item.addEventListener("mouseenter", () => focusKey(item.dataset.key));
      item.addEventListener("mouseleave", () => focusKey(null));
      if (a) {
        a.addEventListener("focus", () => focusKey(item.dataset.key));
        a.addEventListener("blur", () => focusKey(null));
        a.addEventListener("click", (e) => {
          const targetCat = a.dataset.filter;
          if (targetCat) {
            e.preventDefault();
            const solutionsSec = document.getElementById("solutions");
            if (solutionsSec) {
              solutionsSec.scrollIntoView({ behavior: "smooth" });
            }
            const matchingTab = document.querySelector(`.filter-tab[data-category="${targetCat}"]`);
            if (matchingTab) {
              matchingTab.click();
            }
          }
        });
      }
    });

    rings.forEach((ring) => {
      const link = smpMap.querySelector(`.smp-item[data-key="${ring.dataset.key}"] a`);
      ring.addEventListener("mouseenter", () => focusKey(ring.dataset.key));
      ring.addEventListener("mouseleave", () => focusKey(null));
      ring.addEventListener("click", () => {
        if (link) link.click();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applySolutionFilters();
    });
  }

  // 4. PDF Brochure Preview Modal
  const pdfModal = document.getElementById("pdfModal");
  const pdfModalTitle = document.getElementById("pdfModalTitle");
  const pdfModalSubtitle = document.getElementById("pdfModalSubtitle");
  const pdfModalFrame = document.getElementById("pdfModalFrame");
  const pdfModalDownload = document.getElementById("pdfModalDownload");
  const pdfModalClose = document.getElementById("pdfModalClose");

  document.querySelectorAll(".btn-preview-pdf").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      const vendor = btn.dataset.vendor;
      const pdfUrl = btn.dataset.pdf;

      if (pdfModal && pdfModalFrame) {
        pdfModalTitle.textContent = `${title} (${vendor}) 제품소개서`;
        pdfModalSubtitle.textContent = `에스엠피플스㈜ 공식 공급 솔루션 브로셔`;
        pdfModalFrame.src = encodeURI(pdfUrl);
        pdfModalDownload.href = encodeURI(pdfUrl);
        pdfModal.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    });
  });

  function closePdfModal() {
    if (pdfModal && pdfModalFrame) {
      pdfModal.classList.remove("open");
      pdfModalFrame.src = "about:blank";
      document.body.style.overflow = "";
    }
  }

  if (pdfModalClose) {
    pdfModalClose.addEventListener("click", closePdfModal);
  }
  if (pdfModal) {
    pdfModal.addEventListener("click", (e) => {
      if (e.target === pdfModal) closePdfModal();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pdfModal && pdfModal.classList.contains("open")) {
      closePdfModal();
    }
  });

  // 5. Toast & Clipboard Copy Helper
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2600);
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast(`복사되었습니다: ${text}`);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showToast(`복사되었습니다: ${text}`);
      }
    });
  });

  // 6. Initialize Maps (Kakao Map SDK if authorized, otherwise Leaflet/OSM interactive map)
  const offices = [
    {
      containerId: "mapHq",
      name: "에스엠피플스㈜ 본사",
      address: "경기도 고양시 덕양구 청초로 66 덕은리버워크 B동 1619, 1607호",
      lat: 37.57787320936661,
      lng: 126.86238524970182,
    },
    {
      containerId: "mapBranch",
      name: "에스엠피플스㈜ 대전 지사",
      address: "대전시 대덕구 대화동 611 가온비즈타워 1124호",
      lat: 36.366509,
      lng: 127.407302,
    },
  ];

  function initMaps() {
    // Check if Kakao Maps SDK loaded and is usable
    if (window.kakao && window.kakao.maps && typeof window.kakao.maps.Map === "function") {
      try {
        offices.forEach((loc) => {
          const el = document.getElementById(loc.containerId);
          if (!el) return;
          const pos = new window.kakao.maps.LatLng(loc.lat, loc.lng);
          const map = new window.kakao.maps.Map(el, {
            center: pos,
            level: 3,
          });
          new window.kakao.maps.Marker({
            map,
            position: pos,
            title: loc.name,
          });
        });
        return;
      } catch (err) {
        console.warn("Kakao Map fallback to Leaflet:", err);
      }
    }

    // Fallback to Leaflet interactive maps so maps always work regardless of domain
    if (window.L) {
      offices.forEach((loc) => {
        const el = document.getElementById(loc.containerId);
        if (!el) return;
        const map = window.L.map(el, { scrollWheelZoom: false }).setView([loc.lat, loc.lng], 16);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        window.L.marker([loc.lat, loc.lng])
          .addTo(map)
          .bindPopup(`<strong>${loc.name}</strong><br><span style="font-size:12px;">${loc.address}</span>`)
          .openPopup();
      });
    }
  }

  initMaps();

  // 7. Light / Dark Theme Toggle (Default: Light Mode, with localStorage & URL param support)
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeToggleLabel = document.getElementById("themeToggleLabel");

  function applyTheme(isDark, announce = false) {
    document.body.classList.toggle("dark-theme", isDark);
    if (themeToggleLabel) {
      themeToggleLabel.textContent = isDark ? "라이트모드" : "다크모드";
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute("aria-label", isDark ? "라이트모드로 전환" : "다크모드로 전환");
      themeToggleBtn.setAttribute("aria-pressed", String(isDark));
    }
    try {
      localStorage.setItem("smpeoples-theme", isDark ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
    if (announce) {
      showToast(isDark ? "다크모드로 전환되었습니다." : "라이트모드로 전환되었습니다.");
    }
  }

  // Restore saved theme or check ?theme=dark
  const urlParams = new URLSearchParams(window.location.search);
  const queryTheme = urlParams.get("theme");
  let initialDark = false;
  if (queryTheme === "dark") {
    initialDark = true;
  } else if (queryTheme === "light") {
    initialDark = false;
  } else {
    try {
      initialDark = localStorage.getItem("smpeoples-theme") === "dark";
    } catch {
      initialDark = false;
    }
  }
  applyTheme(initialDark, false);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextDark = !document.body.classList.contains("dark-theme");
      applyTheme(nextDark, true);
    });
  }

  // 8. Smart Inquiry Composer
  const solPills = document.querySelectorAll("#composerSolutionPills .sol-pill");
  const inqType = document.getElementById("inqType");
  const inqOrg = document.getElementById("inqOrg");
  const inqMemo = document.getElementById("inqMemo");
  const copyInquiryTextBtn = document.getElementById("copyInquiryTextBtn");
  const sendInquiryMailBtn = document.getElementById("sendInquiryMailBtn");

  solPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pill.classList.toggle("selected");
    });
  });

  function buildInquiryPayload() {
    const selectedSols = Array.from(document.querySelectorAll("#composerSolutionPills .sol-pill.selected")).map(
      (el) => el.dataset.sol
    );
    const solsText = selectedSols.length > 0 ? selectedSols.join(", ") : "보안 솔루션 전반";
    const recipient = inqType ? inqType.value : "sales@smpeoples.kr";
    const isTech = recipient.startsWith("tech@");
    const org = inqOrg && inqOrg.value.trim() ? inqOrg.value.trim() : "(미기재)";
    const memo = inqMemo && inqMemo.value.trim() ? inqMemo.value.trim() : "상세 상담을 요청드립니다.";

    const subject = `[에스엠피플스 홈페이지 ${isTech ? "기술문의" : "영업문의"}] ${solsText} 관련 문의`;
    const body = [
      `안녕하세요, 에스엠피플스㈜ 담당자님.`,
      ``,
      `■ 문의 구분: ${isTech ? "기술문의 (구축·연동·기술지원)" : "영업문의 (도입·견적·제안 요청)"}`,
      `■ 관심 솔루션: ${solsText}`,
      `■ 고객사 / 담당자: ${org}`,
      `■ 문의 내용:`,
      `${memo}`,
      ``,
      `확인 후 회신 부탁드립니다. 감사합니다.`,
    ].join("\n");

    return { recipient, subject, body };
  }

  if (copyInquiryTextBtn) {
    copyInquiryTextBtn.addEventListener("click", async () => {
      const { recipient, subject, body } = buildInquiryPayload();
      const fullText = `수신: ${recipient}\n제목: ${subject}\n\n${body}`;
      try {
        await navigator.clipboard.writeText(fullText);
        showToast(`문의 메일 전문이 클립보드에 복사되었습니다. (${recipient})`);
      } catch {
        showToast("복사에 실패했습니다.");
      }
    });
  }

  if (sendInquiryMailBtn) {
    sendInquiryMailBtn.addEventListener("click", () => {
      const { recipient, subject, body } = buildInquiryPayload();
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
});

