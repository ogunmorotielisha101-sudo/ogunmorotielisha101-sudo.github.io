// Shared Telegram + server helpers for Elisha's games
(function () {
  var API = "https://flappy-bot.ogunmorotielisha101.workers.dev";
  var tg = (window.Telegram && Telegram.WebApp) || null;
  var init = (tg && tg.initData) || "";
  if (tg) { try { tg.ready(); tg.expand(); } catch (e) {} }
  function post(path, body) {
    body = body || {}; body.initData = init;
    return fetch(API + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  }
  var lastAd = 0, adc = null;
  window.Hub = {
    inTelegram: !!init,
    me: function () { return init ? post("/api/me") : Promise.reject("no-tg"); },
    daily: function () { return post("/api/daily"); },
    top: function (g) { return fetch(API + "/api/top?game=" + g).then(function (r) { return r.json(); }); },
    submit: function (game, score, coins) { if (!init) return Promise.resolve(null); return post("/api/score", { game: game, score: score, coins: coins || 0 }).catch(function () { return null; }); },
    haptic: function (t) { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(t || "light"); } catch (e) {} },
    back: function (url) { if (tg && tg.BackButton) { tg.BackButton.show(); tg.BackButton.onClick(function () { location.href = url; }); } },
    interstitial: function () {
      // AdsGram interstitial at most every 90s, only inside Telegram
      if (!init || !window.Adsgram || Date.now() - lastAd < 90000) return;
      lastAd = Date.now();
      try { adc = adc || Adsgram.init({ blockId: "int-52857" }); adc.show().catch(function () {}); } catch (e) {}
    }
  };
})();
