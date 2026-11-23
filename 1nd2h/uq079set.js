(function () {
	"use strict";

	var PATHS = {"lumenjet":"/toj9sr/xlsdptsb8u.js","conductorApi":"/6curt/6g43bmqi.js","utils":"/rxcb2/ma9gw3zy.js","flux":"/m3fhr/gtaaf7kh.mjs","sw":"/l6xsg4.js","relay":{"default":"/tvv4up/","nyc":"/c0vsgo/","sv":"/0t425w/","stockholm":"/9dyy9e/","tokyo":"/fjmrut/","montreal":"/v1bmez/","singapore":"/tt198v/","telaviv":"/29pdos/"},"region":"default"};

	function currentRegion() {
		var path = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
		if (path === "/calculus") return PATHS.region;
		var match = path.match(/^\/calculus\/([a-z]+)$/);
		if (match) return PATHS.relay[match[1]] ? match[1] : PATHS.region;
		try {
			var saved = localStorage.getItem("calculusregion");
			if (saved && PATHS.relay[saved]) return saved;
		} catch (err) {}
		return PATHS.region;
	}

	var REGION = currentRegion();

	var RELAY_URL =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		PATHS.relay[REGION];

	var SEARCH = "https://duckduckgo.com/?t=h_&ia=web&q=";

	function isSecureContext() {
		return (
			location.protocol === "https:" ||
			location.hostname === "localhost" ||
			location.hostname === "127.0.0.1" ||
			location.hostname === "[::1]"
		);
	}

	var scripts = {};
	function loadScript(src) {
		if (!scripts[src]) {
			scripts[src] = new Promise(function (resolve, reject) {
				var el = document.createElement("script");
				el.src = src;
				el.async = false;
				el.onload = function () {
					resolve();
				};
				el.onerror = function () {
					delete scripts[src];
					reject(new Error("could not load " + src));
				};
				(document.head || document.documentElement).appendChild(el);
			});
		}
		return scripts[src];
	}

	var swPromise = null;
	function registerSW() {
		if (swPromise) return swPromise;

		swPromise = (async function () {
			if (!isSecureContext())
				throw new Error(
					"Service workers need https (or localhost); this page is on " +
						location.origin +
						"."
				);
			if (!navigator.serviceWorker)
				throw new Error("This browser has no service worker support.");

			try {
				var stale = await navigator.serviceWorker.getRegistrations();
				await Promise.all(
					stale.map(function (reg) {
						return reg.scope.indexOf("/frog/") === -1 ? null : reg.unregister();
					})
				);
			} catch (err) {
				console.warn("could not clean up old service workers:", err);
			}

			var registration = await navigator.serviceWorker.register(PATHS.sw, {
				scope: "/",
			});
			await navigator.serviceWorker.ready;

			if (!navigator.serviceWorker.controller) {
				await new Promise(function (resolve) {
					var timer = setTimeout(resolve, 4000);
					navigator.serviceWorker.addEventListener(
						"controllerchange",
						function () {
							clearTimeout(timer);
							resolve();
						},
						{ once: true }
					);
				});
			}

			return registration;
		})();

		swPromise.catch(function () {
			swPromise = null;
		});

		return swPromise;
	}

	var keepalive = null;
	function startKeepalive() {
		if (keepalive) return;
		keepalive = setInterval(function () {
			var worker = navigator.serviceWorker && navigator.serviceWorker.controller;
			if (worker) worker.postMessage("$keepalive$");
		}, 10000);
	}

	var conductorPromise = null;
	function ready() {
		if (conductorPromise) return conductorPromise;

		conductorPromise = (async function () {
			await loadScript(PATHS.lumenjet);
			await loadScript(PATHS.conductorApi);
			await loadScript(PATHS.utils);

			var registration = await registerSW();
			var FluxClient = (await import(PATHS.flux)).default;

			var conductor = new $lumenjetConductor.Conductor({
				serviceworker: navigator.serviceWorker.controller || registration.active,
				transport: new FluxClient({ websocket: RELAY_URL }),
				lumenjetConfig: $lumenjet.defaultConfig,
			});
			await conductor.wait();
			startKeepalive();

			return conductor;
		})();

		conductorPromise.catch(function () {
			conductorPromise = null;
		});

		return conductorPromise;
	}

	async function createFrame(element, options) {
		options = options || {};

		var conductor = await ready();
		var utils = self.$lumenjetUtils;
		var plugins = [];

		if (options.cache) plugins.push(new utils.HttpCachePlugin());
		if (options.onUrlChange)
			plugins.push(new utils.UrlWatcherPlugin(options.onUrlChange));
		if (options.onEscape)
			plugins.push(new utils.CatchEscapedLinksPlugin(options.onEscape));

		return conductor.createFrame(element, { plugins: plugins });
	}

	function isUrl(value) {
		value = value || "";
		return (
			/^https?:\/\//.test(value) || (value.indexOf(".") !== -1 && value[0] !== " ")
		);
	}

	function normalize(input) {
		var value = (input || "").trim();
		if (!value) return "";
		if (!isUrl(value)) return SEARCH + encodeURIComponent(value);
		if (!/^https?:\/\//.test(value)) return "https://" + value;
		return value;
	}

	window.FrogProxy = {
		paths: PATHS,
		region: REGION,
		regions: Object.keys(PATHS.relay),
		relayUrl: RELAY_URL,
		ready: ready,
		registerSW: registerSW,
		createFrame: createFrame,
		normalize: normalize,
		isUrl: isUrl,
	};

	window.registerSW = registerSW;
	window.isUrl = isUrl;
	window.decodeURL = window.__decodeUrl = function (url) {
		return url;
	};
	window.__encodeUrl = function (url) {
		return url;
	};
})();
