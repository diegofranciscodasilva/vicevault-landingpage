/* ==========================================================================
   VICEVAULT - Landing page | JavaScript (vanilla, sem dependências)
   Módulos:
   1. Utilidades        2. Menu mobile        3. Header + scroll spy
   4. Contagens         5. Filtros (catálogo/FAQ)   6. Accordion do FAQ
   7. Carrinho (toast)  8. Formulários        9. Modal do trailer
   10. Reveal ao rolar  11. Extras (ano, imagens quebradas)
   ========================================================================== */
(function () {
    "use strict";

    /* 1. UTILIDADES ------------------------------------------------------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

    /** Converte milissegundos em dias/horas/minutos/segundos. */
    function splitTime(ms) {
        const total = Math.max(0, Math.floor(ms / 1000));
        return {
            days: Math.floor(total / 86400),
            hours: Math.floor((total % 86400) / 3600),
            minutes: Math.floor((total % 3600) / 60),
            seconds: total % 60
        };
    }

    /* Toast de notificação */
    const toastEl = $("#toast");
    let toastTimer;
    function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
    }

    /* 2. MENU MOBILE ------------------------------------------------------ */
    const nav = $("#primary-nav");
    const navToggle = $(".nav-toggle");
    const desktopMQ = window.matchMedia("(min-width: 1024px)");

    function setMenu(open) {
        if (!nav || !navToggle) return;
        nav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", String(open));
        navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
        $(".icon", navToggle).textContent = open ? "close" : "menu";
    }

    if (navToggle) {
        navToggle.addEventListener("click", () => setMenu(navToggle.getAttribute("aria-expanded") !== "true"));
        // Fecha ao clicar em um link
        $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
        // Fecha com ESC
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
        // Fecha ao ir para o layout desktop
        desktopMQ.addEventListener("change", (e) => { if (e.matches) setMenu(false); });
    }

    /* 3. HEADER (sombra ao rolar) + SCROLL SPY ----------------------------- */
    const header = $(".header");
    const navLinks = $$(".nav__link");
    const clearActiveNavLinks = () => {
        navLinks.forEach((link) => {
            link.classList.remove("is-active");
            link.removeAttribute("aria-current");
        });
    };
    const isAtPageBoundary = () =>
        window.scrollY <= 10 ||
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
    const onScroll = () => {
        if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
        if (isAtPageBoundary()) clearActiveNavLinks();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    $$(".logo[href='#top']").forEach((logo) => {
        logo.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "auto" });
        });
    });

    // Destaca o link do menu correspondente à seção visível
    const spyTargets = navLinks
        .map((link) => ({ link, section: $(link.getAttribute("href")) }))
        .filter((item) => item.section);

    if ("IntersectionObserver" in window && spyTargets.length) {
        const spy = new IntersectionObserver((entries) => {
            if (isAtPageBoundary()) {
                clearActiveNavLinks();
                return;
            }
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                clearActiveNavLinks();
                const match = spyTargets.find((t) => t.section === entry.target);
                if (match) { match.link.classList.add("is-active"); match.link.setAttribute("aria-current", "true"); }
            });
        }, { rootMargin: "-40% 0px -55% 0px" });
        spyTargets.forEach((t) => spy.observe(t.section));
    }

    /* 4. CONTAGENS REGRESSIVAS --------------------------------------------- */

    // 4.1 Lançamento (data definida em data-launch no HTML)
    const launchBox = $(".countdown[data-launch]");
    if (launchBox) {
        const target = new Date(launchBox.dataset.launch).getTime();
        const units = {
            days: $('[data-unit="days"]', launchBox),
            hours: $('[data-unit="hours"]', launchBox),
            minutes: $('[data-unit="minutes"]', launchBox),
            seconds: $('[data-unit="seconds"]', launchBox)
        };
        const tickLaunch = () => {
            const t = splitTime(target - Date.now());
            units.days.textContent = pad(t.days);
            units.hours.textContent = pad(t.hours);
            units.minutes.textContent = pad(t.minutes);
            units.seconds.textContent = pad(t.seconds);
        };
        tickLaunch();
        setInterval(tickLaunch, 1000);
    }

    // 4.2 Oferta relâmpago: dura 8h34m19s e reinicia ao expirar.
    //     O fim é salvo no localStorage para não zerar ao recarregar a página.
    const flashH = $('[data-flash="hours"]');
    if (flashH) {
        const FLASH_DURATION = ((8 * 60 + 34) * 60 + 19) * 1000;
        const KEY = "vicevault_flash_end";
        const flashM = $('[data-flash="minutes"]');
        const flashS = $('[data-flash="seconds"]');

        const getEnd = () => {
            let end = 0;
            try { end = Number(localStorage.getItem(KEY)); } catch (_) { /* storage bloqueado */ }
            if (!end || end <= Date.now()) {
                end = Date.now() + FLASH_DURATION;
                try { localStorage.setItem(KEY, String(end)); } catch (_) { /* ignora */ }
            }
            return end;
        };

        let flashEnd = getEnd();
        const tickFlash = () => {
            if (flashEnd - Date.now() <= 0) flashEnd = getEnd();
            const t = splitTime(flashEnd - Date.now());
            const totalHours = t.days * 24 + t.hours;
            flashH.textContent = pad(totalHours);
            flashM.textContent = pad(t.minutes);
            flashS.textContent = pad(t.seconds);
        };
        tickFlash();
        setInterval(tickFlash, 1000);
    }

    /* 5. FILTROS (catálogo e FAQ) -------------------------------------------
       Botões [data-filter] dentro de [data-filter-group="nome"] filtram itens
       que possuem data-category (aceita várias categorias separadas por espaço). */
    function setupFilter(groupName, itemsSelector, emptyEl) {
        const group = $(`[data-filter-group="${groupName}"]`);
        if (!group) return;
        const buttons = $$("[data-filter]", group);
        const items = $$(itemsSelector);

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const filter = btn.dataset.filter;
                buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
                let visible = 0;
                items.forEach((item) => {
                    const match = filter === "all" || item.dataset.category.split(" ").includes(filter);
                    item.hidden = !match;
                    if (match) visible++;
                });
                if (emptyEl) emptyEl.hidden = visible > 0;
            });
        });
    }
    setupFilter("catalog", "#catalog-grid .product", $("#catalog-empty"));
    setupFilter("faq", "#faq-list .faq__item");

    /* 6. ACCORDION DO FAQ (um item aberto por vez) -------------------------- */
    const faqItems = $$(".faq__item");
    faqItems.forEach((item) => {
        const trigger = $(".faq__trigger", item);
        trigger.addEventListener("click", () => {
            const willOpen = !item.classList.contains("is-open");
            faqItems.forEach((other) => {
                other.classList.remove("is-open");
                $(".faq__trigger", other).setAttribute("aria-expanded", "false");
            });
            if (willOpen) {
                item.classList.add("is-open");
                trigger.setAttribute("aria-expanded", "true");
            }
        });
    });

    /* 7. CARRINHO (demonstração com toast) -----------------------------------
       Integre aqui com seu e-commerce (API/checkout). */
    $$("[data-add-to-cart]").forEach((btn) => {
        btn.addEventListener("click", () => {
            showToast(`"${btn.dataset.product}" adicionado ao seu cofre de compras.`);
        });
    });

    /* 8. FORMULÁRIOS ---------------------------------------------------------- */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setFieldError(input, message) {
        const field = input.closest(".field");
        const errorEl = $(`#${input.id}-error`);
        if (field) field.classList.toggle("has-error", Boolean(message));
        if (errorEl) errorEl.textContent = message || "";
        input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    // 8.1 Contato
    const contactForm = $("#contact-form");
    if (contactForm) {
        const nameInput = $("#name");
        const emailInput = $("#email");
        const messageInput = $("#message");
        const success = $("#form-success");

        const validators = [
            [nameInput, (v) => (v.trim().length < 2 ? "Informe seu nome ou gamertag." : "")],
            [emailInput, (v) => (!emailRegex.test(v.trim()) ? "Informe um e-mail válido." : "")],
            [messageInput, (v) => (v.trim().length < 10 ? "Escreva pelo menos 10 caracteres." : "")]
        ];

        // Validação em tempo real após o primeiro erro
        validators.forEach(([input, fn]) => {
            input.addEventListener("blur", () => setFieldError(input, fn(input.value)));
            input.addEventListener("input", () => {
                if (input.closest(".field").classList.contains("has-error")) setFieldError(input, fn(input.value));
            });
        });

        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            success.hidden = true;
            let firstInvalid = null;
            validators.forEach(([input, fn]) => {
                const msg = fn(input.value);
                setFieldError(input, msg);
                if (msg && !firstInvalid) firstInvalid = input;
            });
            if (firstInvalid) { firstInvalid.focus(); return; }

            // Esta landing page é estática; conecte a integração ao backend antes de publicar.
            contactForm.reset();
            $("input[name='alerts']", contactForm).checked = true; // mantém padrão marcado
            success.hidden = false;
            success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }

    // 8.2 Newsletter
    const newsForm = $("#newsletter-form");
    if (newsForm) {
        const newsInput = $("#news-email");
        const newsMsg = $("#newsletter-msg");
        newsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            newsMsg.className = "newsletter__msg";
            if (!emailRegex.test(newsInput.value.trim())) {
                newsMsg.textContent = "Digite um e-mail válido.";
                newsMsg.classList.add("is-error");
                newsInput.focus();
                return;
            }
            // Esta landing page é estática; conecte a integração ao provedor de e-mail antes de publicar.
            newsMsg.textContent = "Inscrição confirmada! Seu cupom de 10% chegará por e-mail.";
            newsMsg.classList.add("is-success");
            newsForm.reset();
        });
    }

    /* 9. MODAL DO TRAILER (elemento <dialog> nativo) ------------------------ */
    const stage = $("#trailer-stage");
    const playBtn = $("#trailer-play");
    const note = $("#trailer-note");

    $$("[data-modal-open]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const dialog = document.getElementById(btn.dataset.modalOpen);
            if (dialog && typeof dialog.showModal === "function") {
                dialog.showModal();
                document.body.style.overflow = "hidden";
            }
        });
    });

    $$("dialog.modal").forEach((dialog) => {
        // Fecha ao clicar no fundo escurecido
        dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
        // Botão de fechar
        $$("[data-modal-close]", dialog).forEach((b) => b.addEventListener("click", () => dialog.close()));
        // Restaura a rolagem e remove vídeo ao fechar (também para o áudio)
        dialog.addEventListener("close", () => {
            document.body.style.overflow = "";
            const frame = $("iframe", dialog);
            if (frame) frame.remove();
            if (playBtn) playBtn.hidden = false;
            if (note) note.hidden = false;
        });
    });

    // Reproduz o vídeo apenas se data-video-url estiver preenchido no HTML
    if (playBtn && stage) {
        playBtn.addEventListener("click", () => {
            const url = stage.dataset.videoUrl;
            if (!url) {
                if (note) note.textContent = "Defina a URL do vídeo em data-video-url para reproduzir o trailer.";
                return;
            }
            const iframe = document.createElement("iframe");
            iframe.src = url + (url.includes("?") ? "&" : "?") + "autoplay=1";
            iframe.title = "Trailer oficial de GTA VI";
            iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
            iframe.allowFullscreen = true;
            stage.appendChild(iframe);
            playBtn.hidden = true;
            if (note) note.hidden = true;
        });
    }

    /* 10. REVEAL AO ROLAR (IntersectionObserver) ------------------------------ */
    const revealEls = $$(".reveal");
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target); // anima uma única vez
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach((el) => io.observe(el));
    } else {
        // Fallback para navegadores antigos
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    /* 11. EXTRAS ---------------------------------------------------------------- */

    // Ano do rodapé sempre atualizado
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Imagens quebradas: o container mostra o degradê neon de fallback
    $$(".product__media img, .media-frame img").forEach((img) => {
        const markBroken = () => img.parentElement.classList.add("is-broken");
        img.addEventListener("error", markBroken);
        if (img.complete && img.naturalWidth === 0) markBroken();
    });
})();
