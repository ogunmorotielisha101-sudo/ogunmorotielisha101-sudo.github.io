// Shared Telegram + server helpers for Flappy Arcade
(function () {
  var APIS = ["https://flappy-bot.ogunmorotielisha101.workers.dev", "https://flappy-arcade.pages.dev"];
  try { var pref = localStorage.getItem("fa_api"); if (pref && APIS.indexOf(pref) > 0) APIS = [pref].concat(APIS.filter(function (a) { return a !== pref; })); } catch (e) {}
  var tg = (window.Telegram && Telegram.WebApp) || null;
  var init = (tg && tg.initData) || "";
  if (tg) { try { tg.ready(); tg.expand(); } catch (e) {} }

  function timed(url, opts, ms) {
    return new Promise(function (res, rej) {
      var done = false, t = setTimeout(function () { if (!done) { done = true; rej(new Error("timeout")); } }, ms);
      fetch(url, opts).then(function (r) { if (done) return; done = true; clearTimeout(t); if (!r.ok && r.status >= 500) return rej(new Error("http " + r.status)); r.json().then(res, rej); },
        function (e) { if (done) return; done = true; clearTimeout(t); rej(e); });
    });
  }
  // Try each server in turn; remember the one that answers
  function call(path, opts, i) {
    i = i || 0;
    return timed(APIS[i] + path, opts, i === 0 ? 6000 : 9000).then(function (d) {
      if (i > 0) { try { localStorage.setItem("fa_api", APIS[i]); } catch (e) {} }
      return d;
    }, function (e) { if (i + 1 < APIS.length) return call(path, opts, i + 1); throw e; });
  }
  function post(path, body) {
    body = body || {}; body.initData = init;
    // text/plain avoids a CORS preflight round-trip on slow networks
    return call(path, { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify(body) });
  }
  var lastAd = 0, adc = null;
  window.Hub = {
    inTelegram: !!init,
    me: function () { return init ? post("/api/me") : Promise.reject("no-tg"); },
    daily: function () { return post("/api/daily"); },
    top: function (g) { return call("/api/top?game=" + g, {}); },
    submit: function (game, score, coins) { if (!init) return Promise.resolve(null); return post("/api/score", { game: game, score: score, coins: coins || 0 }).catch(function () { return null; }); },
    haptic: function (t) { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(t || "light"); } catch (e) {} },
    back: function (url) { if (tg && tg.BackButton) { tg.BackButton.show(); tg.BackButton.onClick(function () { location.href = url; }); } },
    interstitial: function () {
      if (!init || !window.Adsgram || Date.now() - lastAd < 90000) return;
      lastAd = Date.now();
      try { adc = adc || Adsgram.init({ blockId: "int-52857" }); adc.show().catch(function () {}); } catch (e) {}
    }
  };
})();
