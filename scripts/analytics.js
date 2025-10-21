// Central analytics loader and helper
(function () {
    const MEASUREMENT_ID = 'G-SDFV8LQ21J';

    window.analytics = window.analytics || { enabled: false };

    // Minimal gtag bootstrap that will be executed once gtag script is loaded
    function initGtag() {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        window.GA_MEASUREMENT_ID = MEASUREMENT_ID;
        gtag('js', new Date());
        gtag('config', MEASUREMENT_ID, { send_page_view: false });
    }

    // Expose loadGtag — loads the external gtag script and initializes it
    window.loadGtag = function loadGtag() {
        if (window._gtag_loaded) return;
        window._gtag_loaded = true;
        const s = document.createElement('script');
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
        s.addEventListener('load', initGtag);
        document.head.appendChild(s);
    };

    function sendPageView(path) {
        if (typeof window.gtag !== 'function') return;
        const payload = {
            page_path: path || (window.location.pathname + window.location.search + window.location.hash),
            page_location: window.location.href,
            page_title: document.title,
            debug_mode: true
        };
        window.gtag('event', 'page_view', payload);
        // Also emit a console debug message to aid realtime troubleshooting
        try { console.debug('trackPageView ->', payload); } catch (e) { /* ignore */ }
    }

    // Exported helper — respects analytics.enabled
    window.trackPageView = function (path) {
        if (!window.analytics || !window.analytics.enabled) return;
        // If gtag isn't loaded yet, attempt to load it
        if (!window._gtag_loaded && typeof window.loadGtag === 'function') {
            window.loadGtag();
        }
        sendPageView(path);
    };

    // If the user previously granted consent, load gtag now (covers cases where
    // the consent banner set localStorage before this script executed).
    try {
        const stored = localStorage.getItem('sbo_analytics_consent_v1');
        if (stored === 'granted') {
            window.analytics.enabled = true;
            if (typeof window.loadGtag === 'function') window.loadGtag();
        }
    } catch (err) {
        // ignore localStorage access errors (private mode, etc.)
    }
})();
