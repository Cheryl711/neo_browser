"function" != typeof String.prototype.trim && (String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "")
}), Object.keys = Object.keys || function(o, k, r) {
	r = [];
	for(k in o) r.hasOwnProperty.call(o, k) && r.push(k);
	return r
}, Function.prototype.bind || (Function.prototype.bind = function(oThis) {
	var aArgs, fBound, fNOP, fToBind;
	if("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
	return aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
		return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)))
	}, this.prototype && (fNOP.prototype = this.prototype), fBound.prototype = new fNOP, fBound
}), String.prototype.includes || (String.prototype.includes = function() {
	return -1 !== String.prototype.indexOf.apply(this, arguments)
});
var baseURL, restAPI;
baseURL = "http://60.205.188.102:32474", restAPI = baseURL + "/db/data", angular.module("neo4jApp.settings", ["neo4jApp.utils"]).constant("Settings", {
	cmdchar: ":",
	endpoint: {
		discover: "" + baseURL,
		console: baseURL + "/db/manage/server/console",
		version: baseURL + "/db/manage/server/version",
		jmx: baseURL + "/db/manage/server/jmx/query",
		rest: restAPI,
		cypher: restAPI + "/cypher",
		transaction: restAPI + "/transaction",
		authUser: baseURL + "/user"
	},
	host: baseURL,
	maxExecutionTime: 3600,
	heartbeat: 60,
	maxFrames: 50,
	maxHistory: 100,
	maxNeighbours: 100,
	initialNodeDisplay: 300,
	maxRows: 1e3,
	filemode: !1,
	maxRawSize: 5e3,
	scrollToTop: !0,
	showVizDiagnostics: !1,
	acceptsReplies: !1,
	enableMotd: !0,
	initCmd: ":play start",
	refreshInterval: 10,
	userName: "Graph Friend",
	theme: "colorful",
	retainConnectionCredentials: !0,
	shouldReportUdc: !1,
	experimentalFeatures: !1,
	useBolt: !0,
	useBoltRouting: !1,
	boltHost: "60.205.188.102:32687",
	shownTermsAndPrivacy: !1,
	acceptedTermsAndPrivacy: !1,
	onboarding: !1,
	showSampleScripts: !0,
	autoComplete: !0
}), angular.module("neo4jApp.settings").service("SettingsStore", ["$rootScope", "localStorageService", "Settings", "Utils", function($rootScope, localStorageService, Settings, Utils) {
	var originalSettings;
	return originalSettings = angular.copy(Settings), {
		load: function() {
			var settings;
			return settings = localStorageService.get("settings"), angular.isObject(settings) ? Utils.extendDeep(Settings, settings) : void 0
		},
		reset: function() {
			return localStorageService.remove("settings"), angular.extend(Settings, originalSettings)
		},
		save: function() {
			return localStorageService.set("settings", angular.copy(Settings)), $rootScope.$broadcast("settings:saved")
		}
	}
}]), angular.module("neo4jApp.settings").run(["SettingsStore", function(SettingsStore) {
	return SettingsStore.load()
}]), angular.module("neo4jApp.parameters", []).constant("Parameters", {}), angular.module("neo4jApp.features", []).constant("Features", {
	showAdmin: !1,
	usingCoreEdge: !1,
	canListQueries: !1,
	canGetRoles: !1,
	canActivateUser: !1,
	canChangePassword: !1,
	usingCoreEdge: !1
}), angular.module("neo4jApp.utils", []).service("Utils", ["$timeout", function($timeout) {
	var that, utils;
	return utils = new neo.helpers, that = utils.extend(utils, this), that.debounce = function(func, wait, immediate) {
		var result, timeout;
		return result = void 0, timeout = null,
			function() {
				var args, callNow, context, later;
				return context = this, args = arguments, later = function() {
					return timeout = null, immediate ? void 0 : result = func.apply(context, args)
				}, callNow = immediate && !timeout, $timeout.cancel(timeout), timeout = $timeout(later, wait), callNow && (result = func.apply(context, args)), result
			}
	}, that
}]);
var app;
angular.module("neo4jApp.controllers", ["neo4jApp.utils"]), angular.module("neo4jApp.directives", ["ui.bootstrap.modal", "neo4jApp.utils"]), angular.module("neo4jApp.filters", []), angular.module("neo4jApp.services", ["neo4jApp.parameters", "LocalStorageModule", "neo4jApp.settings", "neo4jApp.features", "neo4jApp.utils", "base64", "AsciiTableModule", "auth0", "firebase", "angular-jwt", "neo.boltint"]), app = angular.module("neo4jApp", ["ngAnimate", "neo4jApp.controllers", "neo4jApp.directives", "neo4jApp.filters", "neo4jApp.services", "neo4jApp.animations", "neo.exportable", "neo.csv", "ui.bootstrap.dropdown", "ui.bootstrap.position", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.tabs", "ui.bootstrap.carousel", "ui.bootstrap.alert", "ui.codemirror", "ui.sortable", "angularMoment", "ngSanitize"]).config(["authProvider", "localStorageServiceProvider", function(authProvider, localStorageServiceProvider) {
	return authProvider.init({
		domain: "neo4j-sync.auth0.com",
		clientID: "OEWOmp34xybu0efvGQ8eM4zNTNUTJJOB"
	}), localStorageServiceProvider.setNotify(!0, !0)
}]).run(["auth", function(auth) {
	return auth.hookEvents()
}]), angular.module("neo4jApp").config(["$httpProvider", function($httpProvider) {
	var base;
	return $httpProvider.defaults.headers.common["X-stream"] = !0, $httpProvider.defaults.headers.common["Content-Type"] = "application/json", (base = $httpProvider.defaults.headers).get || (base.get = {}), $httpProvider.defaults.headers.get["Cache-Control"] = "no-cache", $httpProvider.defaults.headers.get.Pragma = "no-cache", $httpProvider.defaults.headers.get["If-Modified-Since"] = "Wed, 11 Dec 2013 08:00:00 GMT"
}]), angular.module("neo4jApp").run(["AuthService", "$rootScope", "$timeout", "Server", "Settings", "Frame", function(AuthService, $scope, $timeout, Server, Settings, Frame) {
	var timer;
	return timer = null, $scope.check = function() {
		return $timeout.cancel(timer), Server.addresses().success(function(r) {
			return $scope.offline = !1, timer = $timeout($scope.check, 1e3 * Settings.heartbeat), r
		}).error(function(r) {
			return $scope.offline = !0, $scope.unauthorized = !1, timer = $timeout($scope.check, 2e3), r
		}).then(function(r) {
			return AuthService.isConnected().then(function() {
				return $scope.unauthorized = !1, $scope.bolt_connection_failure = !1
			}, function(response) {
				var ref;
				return 401 === (ref = response.status) || 403 === ref || 429 === ref ? ($scope.unauthorized || Frame.create({
					input: Settings.cmdchar + "server connect"
				}), $scope.unauthorized || ($scope.server_auth_changed = !0), $scope.offline = !1, $scope.unauthorized = !0, $scope.bolt_connection_failure = !1) : ($scope.offline = !0, $scope.unauthorized = !1, $scope.bolt_connection_failure = !0)
			}).then(function() {
				return $scope.refresh()
			}), r
		})
	}, $timeout($scope.check, 2e4)
}]), angular.module("neo4jApp").config(["$tooltipProvider", function($tooltipProvider) {
	return $tooltipProvider.options({
		popupDelay: 1e3
	})
}]), angular.module("neo4jApp").run(["$rootScope", "UsageDataCollectionService", function($rootScope, UDC) {
	return $rootScope.$on("ntn:login", function(event, data) {
		var trackingObject;
		return trackingObject = {}, trackingObject.user_id = data.user_id, trackingObject.name = data.name, null != data.email && (trackingObject.email = data.email), UDC.connectUserWithUserIdAndName(data.user_id, data.name), UDC.trackEvent("syncAuthenticated", trackingObject)
	}), $rootScope.$on("ntn:logout", function(event) {
		return UDC.trackEvent("syncLogout", {}), UDC.disconnectUser()
	})
}]), angular.module("neo4jApp").run(["DefaultContentService", function(DefaultContentService) {
	return DefaultContentService.loadDefaultIfEmpty()
}]), angular.module("neo4jApp").config(["FrameProvider", "Settings", function(FrameProvider, Settings) {
	var argv, cmdchar, error, extractGraphModel, mapError, topicalize;
	return cmdchar = Settings.cmdchar, topicalize = function(input) {
		return null != input ? input.toLowerCase().trim().replace(/\s+/g, "-") : null
	}, argv = function(input) {
		var rv;
		return rv = null != input ? input.toLowerCase().split(" ") : void 0, rv || []
	}, error = function(msg, exception, data) {
		return null == exception && (exception = "Error"), {
			errors: [{
				message: msg,
				code: exception,
				data: data
			}]
		}
	}, mapError = function(r) {
		var returnObject;
		return r.errors || (returnObject = error("Error: " + r.raw.response.data.status + " - " + r.raw.response.data.statusText, "Request error"), r.errors = returnObject.errors), r
	}, FrameProvider.interpreters.push({
		type: "clear",
		matches: cmdchar + "clear",
		exec: ["Frame", function(Frame) {
			return function(input) {
				return Frame.reset(), !0
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "style",
		matches: cmdchar + "style",
		exec: ["$rootScope", "exportService", "GraphStyle", "$http", function($rootScope, exportService, GraphStyle, $http) {
			return function(input, q) {
				var clean_input;
				switch(argv(input)[1]) {
					case "reset":
						GraphStyle.resetToDefault();
						break;
					case "export":
						exportService.download("graphstyle.grass", "text/plain;charset=utf-8", GraphStyle.toString());
						break;
					default:
						clean_input = input.slice("style".length + 1).trim(), /^https?:\/\//i.test(clean_input) ? $http.get(clean_input).then(function(res) {
							return GraphStyle.importGrass(res.data)
						}, function(r) {
							return console.log("failed to load grass, because ", r)
						}) : clean_input.length > 0 ? GraphStyle.importGrass(clean_input) : $rootScope.togglePopup("styling")
				}
				return !0
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "history",
		matches: cmdchar + "history",
		templateUrl: "views/frame-history.html",
		exec: ["HistoryService", function(HistoryService) {
			return function(input, q) {
				return q.resolve(angular.copy(HistoryService.history)), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "shell",
		templateUrl: "views/frame-rest.html",
		matches: cmdchar + "schema",
		exec: ["ProtocolFactory", function(ProtocolFactory) {
			return function(input, q) {
				return ProtocolFactory.utils().getSchema(input).then(function(res) {
					return q.resolve(res)
				}, function(r) {
					return q.reject(r)
				}), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "play",
		templateUrl: "views/frame-guide.html",
		matches: cmdchar + "play",
		exec: ["$http", "$rootScope", "Utils", "UsageDataCollectionService", function($http, $rootScope, Utils, UDC) {
			var step_number;
			return step_number = 1,
				function(input, q) {
					var clean_url, host, host_ok, is_remote, topic, url;
					return clean_url = input.slice("play".length + 1).trim(), is_remote = !1, /^https?:\/\//i.test(clean_url) ? (is_remote = !0, url = input.slice("play".length + 2), host = url.match(/^(https?:\/\/[^\/]+)/)[1], host_ok = Utils.hostIsAllowed(host, $rootScope.kernel["browser.remote_content_hostname_whitelist"])) : (topic = topicalize(clean_url) || "start", url = "content/guides/" + topic + ".html"), is_remote && !host_ok ? (q.reject({
						page: url,
						contents: "",
						is_remote: is_remote,
						errors: [{
							code: "0",
							message: "Requested host is not whitelisted in browser.remote_content_hostname_whitelist."
						}]
					}), q.promise) : ($http.get(url).then(function(res) {
						return UDC.trackEvent("guide loaded", {
							topic: clean_url
						}), q.resolve({
							contents: res.data,
							page: url,
							is_remote: is_remote
						})
					}, function(r) {
						return r.is_remote = is_remote, q.reject(r)
					}), q.promise)
				}
		}]
	}), FrameProvider.interpreters.push({
		type: "play",
		matches: cmdchar + "sysinfo",
		exec: ["Frame", function(Frame) {
			return function(input, q) {
				return Frame.create({
					input: Settings.cmdchar + "play sysinfo"
				}), !0
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "help",
		templateUrl: "views/frame-help.html",
		matches: [cmdchar + "help", cmdchar + "man"],
		exec: ["$http", function($http) {
			return function(input, q) {
				var topic, url;
				return topic = topicalize(input.slice("help".length + 1)) || "help", url = "content/help/" + topic + ".html", $http.get(url).then(function() {
					return q.resolve({
						page: url
					})
				}, function(r) {
					return q.reject(r)
				}), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "config",
		templateUrl: "views/frame-config.html",
		matches: [cmdchar + "config"],
		exec: ["Settings", "SettingsStore", "Utils", function(Settings, SettingsStore, Utils) {
			return function(input, q) {
				var key, matches, property, value;
				return "reset" === argv(input)[1] ? (SettingsStore.reset(), q.resolve(Settings), q.promise) : (matches = Utils.extractCommandParameters("config", input), null != matches ? (key = matches[0], value = matches[1], null != value ? (value = function() {
					try {
						return eval(value)
					} catch(_error) {}
				}(), Settings[key] = value, SettingsStore.save()) : value = Settings[key], property = {}, property[key] = value, q.resolve(property)) : q.resolve(Settings), q.promise)
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "params",
		templateUrl: "views/frame-parameter.html",
		matches: [cmdchar + "param"],
		exec: [function() {
			return function(input, q) {
				return q.resolve(input), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "params",
		templateUrl: "views/frame-parameters.html",
		matches: [cmdchar + "params"],
		exec: ["Parameters", function(Parameters) {
			return function(input, q) {
				var matches, obj, value;
				return matches = /^[^\w]*params\s*(\{.*\})$/.exec(input), matches && matches[1] && (value = matches[1], obj = function() {
					try {
						return eval("(" + value + ")")
					} catch(_error) {}
				}(), "undefined" != typeof obj && (Object.keys(Parameters).forEach(function(key) {
					return delete Parameters[key]
				}), Object.keys(obj).forEach(function(key) {
					return Parameters[key] = obj[key]
				}))), q.resolve(angular.copy(Parameters)), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "http",
		templateUrl: "views/frame-rest.html",
		matches: [cmdchar + "get", cmdchar + "post", cmdchar + "delete", cmdchar + "put", cmdchar + "head"],
		exec: ["Server", function(Server) {
			return function(input, q) {
				var data, e, ref, regex, result, url, verb;
				regex = /^[^\w]*(get|GET|put|PUT|post|POST|delete|DELETE|head|HEAD)\s+(\S+)\s*([\S\s]+)?$/i, result = regex.exec(input);
				try {
					ref = [result[1], result[2], result[3]], verb = ref[0], url = ref[1], data = ref[2]
				} catch(_error) {
					return e = _error, q.reject(error("Unparseable http request", "Request error")), q.promise
				}
				if(verb = null != verb ? verb.toLowerCase() : void 0, !verb) return q.reject(error("Invalid verb, expected 'GET, PUT, POST, HEAD or DELETE'", "Request error")), q.promise;
				if(!(null != url ? url.length : void 0) > 0) return q.reject(error("Missing path", "Request error")), q.promise;
				if(("post" === verb || "put" === verb) && data) try {
					JSON.parse(data.replace(/\n/g, ""))
				} catch(_error) {
					return e = _error, q.reject(error("Payload does not seem to be valid data.", "Request payload error")), q.promise
				}
				return "function" == typeof Server[verb] && Server[verb](url, data).then(function(r) {
					return q.resolve(r.data)
				}, function(r) {
					return q.reject(error("Error: " + r.status + " - " + r.statusText, "Request error"))
				}), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "auth",
		fullscreenable: !1,
		templateUrl: "views/frame-connect.html",
		matches: function(input) {
			var pattern;
			return pattern = new RegExp("^" + cmdchar + "server connect"), input.match(pattern)
		},
		exec: ["AuthService", function(AuthService) {
			return function(input, q) {
				return q.resolve()
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "admin",
		fullscreenable: !0,
		templateUrl: "views/frame-user-admin.html",
		matches: function(input) {
			var pattern;
			return pattern = new RegExp("^" + cmdchar + "server user list"), input.match(pattern)
		},
		exec: [function() {
			return function(input, q) {
				return q.resolve()
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "admin",
		fullscreenable: !0,
		templateUrl: "views/frame-add-new-user.html",
		matches: function(input) {
			var pattern;
			return pattern = new RegExp("^" + cmdchar + "server user add"), input.match(pattern)
		},
		exec: [function() {
			return function(input, q) {
				return q.resolve()
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "auth",
		fullscreenable: !1,
		templateUrl: "views/frame-disconnect.html",
		matches: function(input) {
			var pattern;
			return pattern = new RegExp("^" + cmdchar + "server disconnect"), input.match(pattern)
		},
		exec: ["Settings", "AuthService", function(Settings, AuthService) {
			return function(input, q) {
				return q.resolve()
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "auth",
		fullscreenable: !1,
		templateUrl: "views/frame-server-status.html",
		matches: function(input) {
			var pattern;
			return pattern = new RegExp("^" + cmdchar + "server status"), input.match(pattern)
		},
		exec: ["AuthService", "ConnectionStatusService", function(AuthService, ConnectionStatusService) {
			return function(input, q) {
				return AuthService.hasValidAuthorization().then(function(r) {
					return q.resolve(r)
				}, function(r) {
					return q.reject(r)
				}), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "auth",
		fullscreenable: !1,
		templateUrl: "views/frame-change-password.html",
		matches: function(input) {
			var pattern;
			return pattern = new RegExp("^" + cmdchar + "server change-password"), input.match(pattern)
		},
		exec: ["AuthService", function(AuthService) {
			return function(input, q) {
				return q.resolve(), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "tools",
		templateUrl: "views/frame-queries.html",
		matches: cmdchar + "queries",
		exec: [function() {
			return function(input, q) {
				return q.resolve(), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "account",
		templateUrl: "views/frame-login.html",
		matches: [cmdchar + "login"],
		exec: ["CurrentUser", "$rootScope", function(CurrentUser, $rootScope) {
			return function(input, q) {
				return CurrentUser.login().then(function() {
					return q.resolve(CurrentUser.instance())
				}, function() {
					return q.reject("Unable to log in")
				}), q.promise
			}
		}]
	}), FrameProvider.interpreters.push({
		type: "account",
		templateUrl: "views/frame-logout.html",
		matches: [cmdchar + "logout"],
		exec: ["CurrentUser", function(CurrentUser) {
			return function(input, q) {
				return CurrentUser.logout(), q.resolve(), q.promise
			}
		}]
	}), extractGraphModel = function(response, CypherGraphModel) {
		var graph, nodes;
		return graph = new neo.models.Graph, nodes = response.nodes.reduce(function(all, curr) {
			return all.taken.indexOf(curr.id) > -1 ? all : (all.nodes.push(curr), all.taken.push(curr.id), all)
		}, {
			nodes: [],
			taken: []
		}).nodes, nodes.length > Settings.initialNodeDisplay && (nodes = nodes.slice(0, Settings.initialNodeDisplay), graph.display = {
			initialNodeDisplay: Settings.initialNodeDisplay,
			nodeCount: response.size
		}), nodes = nodes.map(CypherGraphModel.convertNode()).filter(function(node) {
			return node
		}), graph.addNodes(nodes), graph.addRelationships(CypherGraphModel.filterRelationshipsOnNodes(response.relationships, nodes).map(CypherGraphModel.convertRelationship(graph)).filter(function(rel) {
			return rel
		})), graph
	}, FrameProvider.interpreters.push({
		type: "cypher",
		matches: function(input) {
			var pattern;
			return pattern = new RegExp("^[^" + cmdchar + "]"), input.match(pattern)
		},
		templateUrl: "views/frame-cypher.html",
		exec: ["Cypher", "CypherGraphModel", "CypherParser", "Utils", function(Cypher, CypherGraphModel, CypherParser, Utils) {
			return function(input, q) {
				var commit_fn, current_transaction;
				return current_transaction = Cypher.transaction(), commit_fn = function() {
					return current_transaction.commit(input).then(function(response) {
						return response.size > Settings.maxRows && (response.displayedSize = Settings.maxRows), q.resolve({
							raw: response.raw,
							timings: response.raw.timings || Utils.buildTimingObject(response),
							table: response,
							graph: extractGraphModel(response, CypherGraphModel),
							notifications: response.notifications || [],
							protocol: response.protocol
						})
					}, function(r) {
						var obj;
						return obj = mapError(r), obj.notifications || (obj.notifications = []), q.reject(obj)
					})
				}, CypherParser.isPeriodicCommit(input) ? commit_fn() : current_transaction.begin().then(function() {
					return commit_fn()
				}, function(r) {
					var obj;
					return obj = mapError(r), obj.notifications || (obj.notifications = []), q.reject(obj)
				}), q.promise.transaction = current_transaction, q.promise.reject = q.reject, q.promise
			}
		}]
	})
}]), angular.module("neo4jApp").run(["CurrentUser", "$rootScope", function(CurrentUser, $rootScope) {
	return $rootScope.$on("ntn:authenticated", function() {
		return $rootScope.currentUser = CurrentUser.instance()
	})
}]), angular.module("neo4jApp.controllers").controller("LayoutCtrl", ["$rootScope", "$timeout", "$modal", "Editor", "Frame", "GraphStyle", "Utils", "Settings", "UsageDataCollectionService", "ConnectionStatusService", function($scope, $timeout, $modal, Editor, Frame, GraphStyle, Utils, Settings, UsageDataCollectionService, ConnectionStatusService) {
	var _codeMirror, checkCypherContent, dialog, dialogOptions, resizeStream;
	return $scope.settings = Settings, _codeMirror = null, dialog = null, dialogOptions = {
		backdrop: !0,
		backdropClick: !0,
		backdropFade: !0,
		dialogFade: !0,
		keyboard: !0,
		size: "lg"
	}, $scope.theme = Settings.theme, $scope.$on("settings:saved", function() {
		return $scope.theme = Settings.theme
	}), $scope.toggleMessenger = function() {
		return UsageDataCollectionService.toggleMessenger()
	}, $scope.showMessenger = function() {
		return UsageDataCollectionService.showMessenger()
	}, $scope.showMessengerButton = function() {
		return UsageDataCollectionService.connectedUser
	}, $scope.suggestionPlaceholder = "I want to X, tried Y, suggest Z", $scope.newMessage = function(suggestion) {
		return UsageDataCollectionService.newMessage(suggestion)
	}, $scope.showDoc = function() {
		return Frame.create({
			input: ":play"
		})
	}, $scope.showStats = function() {
		return Frame.create({
			input: ":schema"
		})
	}, $scope.focusEditor = function(ev) {
		return null != ev && ev.preventDefault(), $timeout(function() {
			return null != _codeMirror ? _codeMirror.focus() : void 0
		}, 0)
	}, $scope.codemirrorLoaded = function(_editor) {
		return _codeMirror = _editor, _codeMirror.focus(), _codeMirror.on("change", function(cm) {
			return $scope.editorChanged(cm), $scope.focusEditor()
		}), _codeMirror.on("keyup", function(cm, e) {
			return 27 === e.keyCode ? $timeout(function() {
				return cm.refresh()
			}, 0) : void 0
		}), _codeMirror.on("focus", function(cm) {
			return $scope.editorChanged(cm)
		})
	}, $scope.isEditorFocused = function() {
		return $(".CodeMirror-focused").length > 0
	}, $scope.editor = Editor, $scope.editorOneLine = !0, $scope.editorChanged = function(codeMirror) {
		return $scope.editorOneLine = 1 === codeMirror.lineCount() && !Editor.document, $scope.disableHighlighting = ":" === codeMirror.getValue().trim()[0], checkCypherContent(codeMirror)
	}, $scope.isDrawerShown = !1, $scope.whichDrawer = "", $scope.toggleDrawer = function(selectedDrawer, state) {
		return null == selectedDrawer && (selectedDrawer = ""), null == state && (state = !$scope.isDrawerShown || selectedDrawer !== $scope.whichDrawer), $scope.isDrawerShown = state, $scope.whichDrawer = selectedDrawer
	}, $scope.showingDrawer = function(named) {
		return $scope.isDrawerShown && $scope.whichDrawer === named
	}, $scope.$watch("isDrawerShown", function() {
		return $timeout(function() {
			return $scope.$emit("layout.changed", 0)
		})
	}), $scope.isPopupShown = !1, $scope.togglePopup = function(content) {
		return null != content ? dialog || (dialogOptions.templateUrl = "popup-" + content, dialogOptions.windowClass = "modal-" + content, dialog = $modal.open(dialogOptions), dialog.result["finally"](function() {
			return $scope.popupContent = null, $scope.isPopupShown = !1, dialog = null
		})) : (null != dialog && dialog.close(), dialog = null), $scope.popupContent = dialog, $scope.isPopupShown = !!dialog
	}, $scope.globalMouse = function(e) {
		return ConnectionStatusService.restartSessionCountdown()
	}, $scope.globalKey = function(e) {
		return resizeStream(), ConnectionStatusService.restartSessionCountdown(), $scope.isPopupShown && 191 !== e.keyCode ? void 0 : 27 === e.keyCode ? $scope.isPopupShown ? $scope.togglePopup() : Editor.maximize() : 191 !== e.keyCode || $scope.isEditorFocused() || "input" === e.target.localName ? void 0 : (e.preventDefault(), $scope.focusEditor())
	}, $scope.$on("visualization:stats", function(event, stats) {
		return $scope.showVizDiagnostics = Settings.showVizDiagnostics, Settings.showVizDiagnostics ? $scope.visualizationStats = stats : void 0
	}), $scope.$on("LocalStorageModule.notification.setitem", function(evt, item) {
		return "grass" === item.key ? GraphStyle.reloadFromStorage() : void 0
	}), resizeStream = Utils.debounce(function(ignored) {
		return $scope.editor.maximized ? void 0 : ($("#stream").css({
			top: $(".view-editor").height() + $(".file-bar").height()
		}), $scope.$emit("layout.changed"))
	}, 100), checkCypherContent = Utils.debounce(function(codeMirror) {
		return $scope.editor.checkCypherContent(codeMirror)
	}, 200), $(window).resize(resizeStream), navigator.userAgent.match(/Gecko\/[\d\.]+.*Firefox/) && $("html").addClass("browser-firefox"), $("body").bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
		return resizeStream()
	})
}]), angular.module("neo4jApp.directives").directive("keyup", ["$parse", function($parse) {
	return {
		restrict: "A",
		link: function(scope, elem, attr, ctrl) {
			return elem.bind("keyup", function(e) {
				var exp;
				return exp = $parse(attr.keyup), scope.$apply(function() {
					return exp(scope, {
						$event: e
					})
				})
			})
		}
	}
}]), angular.module("neo4jApp.directives").directive("scrollToTop", ["Settings", function(Settings) {
	return function(scope, element, attrs) {
		return Settings.scrollToTop ? scope.$watch(attrs.scrollToTop, function() {
			return $("#" + attrs.scrollToTop).animate({
				scrollTop: 0
			})
		}) : void 0
	}
}]), angular.module("neo4jApp.directives").directive("onEnter", [function() {
	return {
		restrict: "A",
		link: function(scope, elem, attr, ctrl) {
			return elem.bind("keydown", function(e) {
				var code, element;
				return code = e.which || e.keyCode, 13 === code ? (e.preventDefault(), "focus" === attr.onEnter ? (element = document.getElementById(attr.onEnterTargetId), element.focus()) : "click" === attr.onEnter ? (element = document.getElementById(attr.onEnterTargetId), angular.element(element).triggerHandler("click"), elem.select()) : void 0) : void 0
			})
		}
	}
}]), angular.module("neo4jApp.directives").directive("mousemove", ["$parse", "Utils", function($parse, Utils) {
	return {
		restrict: "A",
		link: function(scope, elem, attr) {
			var throttle;
			return throttle = Utils.throttle(function(e) {
				var exp;
				return exp = $parse(attr.mousemove), scope.$apply(function() {
					return exp(scope, {
						$event: e
					})
				})
			}, 5e3), elem.bind("mousemove", function(e) {
				return throttle(e)
			})
		}
	}
}]), angular.module("neo4jApp.filters").filter("uncomment", function() {
	return function(input) {
		var row;
		return null == input ? "" : function() {
			var i, len, ref, results;
			for(ref = input.split("\n"), results = [], i = 0, len = ref.length; len > i; i++) row = ref[i], 0 !== row.indexOf("//") && results.push(row);
			return results
		}().join("\n")
	}
}), angular.module("neo4jApp.filters").filter("autotitle", function() {
	return function(input) {
		var firstRow;
		return null == input ? "" : (firstRow = input.split("\n")[0], 0 === firstRow.indexOf("//") ? firstRow.slice(2) : input)
	}
}), angular.module("neo4jApp.filters").filter("basename", function() {
	return function(input) {
		return null == input ? "" : input.replace(/\\/g, "/").replace(/.*\//, "")
	}
}), angular.module("neo4jApp.filters").filter("dirname", function() {
	return function(input) {
		return null == input ? "" : input.replace(/\\/g, "/").replace(/\/[^\/]*$/, "")
	}
}), angular.module("neo4jApp.filters").filter("neo4jdoc", function() {
	return function(input) {
		return "string" != typeof input ? "" : input.replace(/^(\d\.\d)\.\d(-.+)?$/, function(match, majorMinor, nonGaSuffix) {
			return nonGaSuffix ? majorMinor + "-beta" : majorMinor
		})
	}
}).filter("neo4jDeveloperDoc", ["neo4jdocFilter", function(neo4jdocFilter) {
	return function(input) {
		return "string" != typeof input ? "" : "http://neo4j.com/docs/developer-manual/" + neo4jdocFilter(input)
	}
}]).filter("neo4jOperationsDoc", ["neo4jdocFilter", function(neo4jdocFilter) {
	return function(input) {
		return "string" != typeof input ? "" : "http://neo4j.com/docs/operations-manual/" + neo4jdocFilter(input)
	}
}]).filter("neo4jCypherRefcardDoc", ["neo4jdocFilter", function(neo4jdocFilter) {
	return function(input) {
		return "string" != typeof input ? "" : "http://neo4j.com/docs/cypher-refcard/" + neo4jdocFilter(input)
	}
}]), angular.module("neo4jApp.filters").filter("humanReadableBytes", [function() {
	return function(input) {
		var i, len, number, unit, units;
		if(number = +input, !isFinite(number)) return "-";
		if(1024 > number) return number + " B";
		for(number /= 1024, units = ["KiB", "MiB", "GiB", "TiB"], i = 0, len = units.length; len > i; i++) {
			if(unit = units[i], 1024 > number) return number.toFixed(2) + " " + unit;
			number /= 1024
		}
		return number.toFixed(2) + " PiB"
	}
}]);
var bind = function(fn, me) {
	return function() {
		return fn.apply(me, arguments)
	}
};
angular.module("neo4jApp.services").factory("Cypher", ["$q", "$rootScope", "Server", "UsageDataCollectionService", "ProtocolFactory", function($q, $rootScope, Server, UDC, ProtocolFactory) {
	var CypherService;
	return CypherService = function() {
		function CypherService() {
			this.rollbackAllTransactions = bind(this.rollbackAllTransactions, this), this._active_requests = {}
		}
		return CypherService.prototype.profile = function(query) {
			var q;
			return q = $q.defer(), Server.cypher("?profile=true", {
				query: query
			}).success(function(r) {
				return q.resolve(r.plan)
			}).error(q.reject), q.promise
		}, CypherService.prototype.send = function(query) {
			return this.transaction().commit(query)
		}, CypherService.prototype.getTransactionIDs = function() {
			return Object.keys(this._active_requests)
		}, CypherService.prototype.transaction = function(useBolt) {
			var transaction;
			return null == useBolt && (useBolt = null), transaction = ProtocolFactory.getCypherTransaction(useBolt), transaction.delegate = this, transaction
		}, CypherService.prototype.transactionStarted = function(id, transaction) {
			return this._active_requests[id] = transaction
		}, CypherService.prototype.transactionFinished = function(id) {
			return "undefined" !== this._active_requests[id] ? delete this._active_requests[id] : void 0
		}, CypherService.prototype.rollbackAllTransactions = function() {
			var ids;
			return ids = this.getTransactionIDs(), null != ids ? ids.forEach(function(d, i) {
				return this._active_requests[i].rollback()
			}) : void 0
		}, CypherService
	}(), window.Cypher = new CypherService
}]), angular.module("neo4jApp.services").factory("Collection", [function() {
	var Collection;
	return Collection = function() {
		function Collection(items, _model) {
			this._model = _model, this._reset(), null != items && this.add(items)
		}
		return Collection.prototype.add = function(items, opts) {
			var i, itemsToAdd, j, len;
			if(null == opts && (opts = {}), null != items) {
				for(items = angular.isArray(items) ? items : [items], itemsToAdd = [], j = 0, len = items.length; len > j; j++) i = items[j], !this._model || i instanceof this._model || (i = new this._model(i)), null == i || this.get(i) || (this._byId[null != i.id ? i.id : i] = i, itemsToAdd.push(i));
				return itemsToAdd.length && (angular.isNumber(opts.at) ? [].splice.apply(this.items, [opts.at, 0].concat(itemsToAdd)) : [].push.apply(this.items, itemsToAdd), this.length += itemsToAdd.length), this
			}
		}, Collection.prototype.all = function() {
			return this.items
		}, Collection.prototype.first = function() {
			return this.items[0]
		}, Collection.prototype.get = function(id) {
			return null == id ? void 0 : (id = null != id.id ? id.id : id, this._byId[id])
		}, Collection.prototype.indexOf = function(item) {
			return this.items.indexOf(item)
		}, Collection.prototype.last = function() {
			return this.items[this.length - 1]
		}, Collection.prototype.next = function(item) {
			var idx;
			return idx = this.indexOf(item), null != idx ? this.items[++idx] : void 0
		}, Collection.prototype.remove = function(items) {
			var index, item, itemsToRemove, j, len;
			for(itemsToRemove = angular.isArray(items) ? items : [items], j = 0, len = itemsToRemove.length; len > j; j++) item = itemsToRemove[j], item = this.get(item), item && (delete this._byId[item.id], index = this.items.indexOf(item), this.items.splice(index, 1), this.length--);
			return items
		}, Collection.prototype.reset = function(items) {
			return this._reset(), this.add(items)
		}, Collection.prototype.pluck = function(attr) {
			var i, j, len, ref, results;
			if(!angular.isString(attr)) return void 0;
			for(ref = this.items, results = [], j = 0, len = ref.length; len > j; j++) i = ref[j], results.push(i[attr]);
			return results
		}, Collection.prototype.prev = function(item) {
			var idx;
			return idx = this.indexOf(item), null != idx ? this.items[--idx] : void 0
		}, Collection.prototype.pop = function() {
			var item;
			return item = this.items.pop(), this.length = this.items.length, item
		}, Collection.prototype.push = function(items) {
			var itemsToPush;
			return itemsToPush = angular.isArray(items) ? items : [items], this.items.push.apply(this.items, itemsToPush), this.length = this.items.length, this
		}, Collection.prototype.where = function(attrs) {
			var item, j, key, len, matches, numAttrs, ref, rv, val;
			if(rv = [], !angular.isObject(attrs)) return rv;
			for(numAttrs = Object.keys(attrs).length, ref = this.items, j = 0, len = ref.length; len > j; j++) {
				item = ref[j], matches = 0;
				for(key in attrs) val = attrs[key], item[key] === val && matches++;
				numAttrs === matches && rv.push(item)
			}
			return rv
		}, Collection.prototype.save = function() {
			return this._model || angular.isFunction(this._model.save) ? (this._model.save(this.all()), this) : void 0
		}, Collection.prototype.fetch = function() {
			return this._model || angular.isFunction(this._model.fetch) ? (this.reset(this._model.fetch()), this) : void 0
		}, Collection.prototype._reset = function() {
			return this.items = [], this._byId = {}, this.length = 0
		}, Collection
	}()
}]), angular.module("neo4jApp.services").factory("Timer", function() {
	var Timer, TimerService, currentTime;
	return currentTime = function() {
		return(new Date).getTime()
	}, Timer = function() {
		function Timer() {
			this._start = null, this._end = null
		}
		return Timer.prototype.isRunning = function() {
			return null != this._start
		}, Timer.prototype.start = function() {
			return null == this._start && (this._start = currentTime()), this
		}, Timer.prototype.started = function() {
			return this._start
		}, Timer.prototype.stop = function() {
			return null == this._end && (this._end = currentTime()), this
		}, Timer.prototype.stopped = function() {
			return this._end
		}, Timer.prototype.time = function() {
			var end;
			return null == this._start ? 0 : (end = this._end || currentTime(), end - this._start)
		}, Timer
	}(), new(TimerService = function() {
		function TimerService() {}
		var timers;
		return timers = {}, TimerService.prototype["new"] = function(name) {
			return null == name && (name = "default"), timers[name] = new Timer
		}, TimerService.prototype.start = function(name) {
			var timer;
			return null == name && (name = "default"), timer = this["new"](name), timer.start()
		}, TimerService.prototype.stop = function(name) {
			return null == name && (name = "default"), null == timers[name] ? void 0 : timers[name].stop()
		}, TimerService.prototype.currentTime = currentTime, TimerService
	}())
}), angular.module("neo4jApp.directives").directive("focusOn", ["$timeout", function($timeout) {
	return function(scope, element, attrs) {
		return scope.$watch(attrs.focusOn, function(val) {
			return val ? $timeout(function() {
				return element[0].focus()
			}, 0, !1) : void 0
		})
	}
}]), angular.module("neo.csv", []).factory("CSV", [function() {
	var Serializer;
	return Serializer = neo.serializer, {
		Serializer: Serializer
	}
}]), angular.module("neo.boltint", []).service("BoltIntHelpers", [function() {
	return new neo.boltIntHelpers
}]), angular.module("neo4jApp").directive("resizable", [function() {
	return {
		controller: function($scope) {
			var startCallbacks, stopCallbacks;
			return startCallbacks = [], stopCallbacks = [], this.onStart = function(func) {
				return startCallbacks.push(func)
			}, this.onStop = function(func) {
				return stopCallbacks.push(func)
			}, this.start = function(amount) {
				var callback, i, len, results;
				for(results = [], i = 0, len = startCallbacks.length; len > i; i++) callback = startCallbacks[i], results.push(callback.call(void 0, amount));
				return results
			}, this.stop = function() {
				var callback, i, len, results;
				for(results = [], i = 0, len = stopCallbacks.length; len > i; i++) callback = stopCallbacks[i], results.push(callback.call(void 0));
				return results
			}
		}
	}
}]).directive("resize", function() {
	return {
		require: "^resizable",
		link: function(scope, element, attrs, resizableCtrl) {
			var initialValue, property;
			return property = attrs.resize, initialValue = +element.css(property).slice(0, -2), resizableCtrl.onStart(function(amount) {
				return element[0].style[property] = initialValue + amount + "px"
			}), resizableCtrl.onStop(function() {
				return initialValue = +element[0].style[property].slice(0, -2)
			})
		}
	}
}).directive("resizeChild", function() {
	return {
		require: "^resizable",
		link: function(scope, element, attrs, resizableCtrl) {
			var child, initialValue, property;
			return attrs = scope.$eval(attrs.resizeChild), child = Object.keys(attrs)[0], property = attrs[child], initialValue = null, resizableCtrl.onStart(function(amount) {
				return initialValue || (initialValue = +$(child, element).css(property).slice(0, -2)), $(child, element).css(property, initialValue + amount + "px")
			}), resizableCtrl.onStop(function() {
				return initialValue = +element[0].style[property].slice(0, -2)
			})
		}
	}
}).directive("handle", function() {
	return {
		require: "^resizable",
		link: function(scope, element, attrs, resizableCtrl) {
			return element.bind("mousedown", function(e) {
				var initialValue, lastValue;
				return e.preventDefault(), initialValue = lastValue = e.clientY, angular.element(document).bind("mousemove", function(e) {
					var mousePos, newValue;
					return mousePos = e.clientY, newValue = element[0].clientHeight - (lastValue - mousePos), lastValue = mousePos, resizableCtrl.start(lastValue - initialValue)
				}), angular.element(document).bind("mouseup", function() {
					return angular.element(document).unbind("mousemove"), angular.element(document).unbind("mouseup"), resizableCtrl.stop()
				})
			})
		}
	}
}), angular.module("neo4jApp.directives").controller("fileUpload", ["$attrs", "$parse", "$rootScope", "$scope", "$window", function($attrs, $parse, $rootScope, $scope, $window) {
	var INITIAL_STATUS, getFirstFileFromEvent, onUploadSuccess, scopeApply;
	return INITIAL_STATUS = $attrs.message || "Drop Cypher script file to import", $scope.status = INITIAL_STATUS, onUploadSuccess = function(content, name) {
		var exp;
		return $attrs.upload ? (exp = $parse($attrs.upload), $scope.$apply(function() {
			return exp($scope, {
				$content: content,
				$name: name
			})
		})) : void 0
	}, getFirstFileFromEvent = function(evt) {
		var files;
		return files = evt.originalEvent.dataTransfer.files, files[0]
	}, scopeApply = function(fn) {
		return function() {
			return fn.apply($scope, arguments), $scope.$apply()
		}
	}, this.onDragEnter = scopeApply(function(evt) {
		return getFirstFileFromEvent(evt), $scope.active = !0
	}), this.onDragLeave = scopeApply(function() {
		return $scope.active = !1
	}), this.onDrop = scopeApply(function(_this) {
		return function(evt) {
			var file, reg;
			return _this.preventDefault(evt), $scope.active = !1, file = getFirstFileFromEvent(evt), !file || $attrs.type && file.type.indexOf($attrs.type) < 0 ? void 0 : $attrs.extension && (reg = new RegExp($attrs.extension + "$"), !file.name.match(reg)) ? alert("Only ." + $attrs.extension + " files are supported") : ($scope.status = "Uploading...", _this.readFile(file))
		}
	}(this)), this.preventDefault = function(evt) {
		return evt.stopPropagation(), evt.preventDefault()
	}, this.readFile = function(file) {
		var reader;
		return reader = new $window.FileReader, reader.onerror = scopeApply(function(evt) {
			return $scope.status = function() {
				switch(evt.target.error.code) {
					case 1:
						return file.name + " not found.";
					case 2:
						return file.name + " has changed on disk, please re-try.";
					case 3:
						return "Upload cancelled.";
					case 4:
						return "Cannot read " + file.name;
					case 5:
						return "File too large for browser to upload."
				}
			}(), $rootScope.$broadcast("fileUpload:error", $scope.error)
		}), reader.onloadend = scopeApply(function(evt) {
			var data;
			return data = evt.target.result, data = data.split("base64,")[1], onUploadSuccess($window.atob(data), file.name), $scope.status = INITIAL_STATUS
		}), reader.readAsDataURL(file)
	}, this
}]), angular.module("neo4jApp.directives").directive("fileUpload", ["$window", function($window) {
	return {
		controller: "fileUpload",
		restrict: "E",
		scope: "@",
		transclude: !0,
		template: '<div class="file-drop-area" ng-class="{active: active}" ng-bind="status"></div>',
		link: function(scope, element, attrs, ctrl) {
			return $window.FileReader && $window.atob ? (element.bind("dragenter", ctrl.onDragEnter), element.bind("dragleave", ctrl.onDragLeave), element.bind("drop", ctrl.onDrop), element.bind("dragover", ctrl.preventDefault), element.bind("drop")) : void 0
		}
	}
}]);
var hasProp = {}.hasOwnProperty;
angular.module("neo4jApp.directives").directive("neoTable", ["Utils", function(Utils) {
	var bolt;
	return bolt = window.neo4j.v1, {
		replace: !0,
		restrict: "E",
		link: function(scope, elm, attr) {
			var cell2html, emptyMarker, json2html, render, unbind;
			return emptyMarker = function() {
				return "<em>(empty)</em>"
			}, unbind = scope.$watch(attr.tableData, function(result) {
				return result ? (elm.html(render(result)), unbind()) : void 0
			}), json2html = function(obj) {
				var html, k, v;
				if(!Object.keys(obj).length) return emptyMarker();
				html = "<table class='json-object'><tbody>";
				for(k in obj) hasProp.call(obj, k) && (v = obj[k], html += "<tr><th>" + Utils.escapeHTML(k) + "</th><td>" + cell2html(v) + "</td></tr>");
				return html += "</tbody></table>"
			}, cell2html = function(cell) {
				var el;
				return bolt.isInt(cell) ? cell.toString() : angular.isString(cell) ? cell.length ? Utils.escapeHTML(cell) : emptyMarker() : angular.isArray(cell) ? "[" + function() {
					var j, len, results;
					for(results = [], j = 0, len = cell.length; len > j; j++) el = cell[j], results.push(cell2html(el));
					return results
				}().join(", ") + "]" : angular.isObject(cell) ? json2html(cell) : Utils.escapeHTML(JSON.stringify(cell))
			}, render = function(result) {
				var cell, col, cols, html, i, j, l, len, len1, len2, m, n, ref, ref1, rows;
				if(rows = result.rows(), cols = result.columns() || [], !cols.length) return "";
				for(html = "<table class='table data'>", html += "<thead><tr>", j = 0, len = cols.length; len > j; j++) col = cols[j], html += "<th>" + Utils.escapeHTML(col) + "</th>";
				if(html += "</tr></thead>", html += "<tbody>", result.displayedSize)
					for(i = l = 0, ref = result.displayedSize; ref >= 0 ? ref > l : l > ref; i = ref >= 0 ? ++l : --l) {
						for(html += "<tr>", ref1 = rows[i], m = 0, len1 = ref1.length; len1 > m; m++) cell = ref1[m], html += "<td>" + cell2html(cell) + "</td>";
						html += "</tr>"
					} else {
						for(html += "<tr>", n = 0, len2 = cols.length; len2 > n; n++) col = cols[n], html += "<td>&nbsp;</td>";
						html += "</tr>"
					}
				return html += "</tbody>", html += "</table>"
			}
		}
	}
}]), angular.module("neo4jApp.directives").directive("neoGraph", ["exportService", "SVGUtils", function(exportService, SVGUtils) {
	var dir;
	return dir = {
		require: "ngController",
		restrict: "A"
	}, dir.link = function(scope, elm, attr, ngCtrl) {
		var unbinds, watchGraphData;
		return unbinds = [], watchGraphData = scope.$watch(attr.graphData, function(graph) {
			var listenerExportPNG, listenerExportSVG, listenerResetFrame;
			if(graph) return ngCtrl.render(graph), listenerExportSVG = scope.$on("export.graph.svg", function() {
				var svg;
				return svg = SVGUtils.prepareForExport(elm, dir.getDimensions(ngCtrl.getGraphView())), exportService.download("graph.svg", "image/svg+xml", (new XMLSerializer).serializeToString(svg.node())), svg.remove()
			}), listenerExportPNG = scope.$on("export.graph.png", function() {
				var svg;
				return svg = SVGUtils.prepareForExport(elm, dir.getDimensions(ngCtrl.getGraphView())), exportService.downloadPNGFromSVG(svg, "graph"), svg.remove()
			}), listenerResetFrame = scope.$on("reset.frame.views", function() {
				var i, len, unbind;
				for(i = 0, len = unbinds.length; len > i; i++)(unbind = unbinds[i])();
				return unbinds = [], $(elm[0]).empty(), dir.link(scope, elm, attr, ngCtrl)
			}), unbinds.push(listenerExportSVG), unbinds.push(listenerExportPNG), unbinds.push(listenerResetFrame), watchGraphData()
		})
	}, dir.getDimensions = function(view) {
		var boundingBox, dimensions;
		return boundingBox = view.boundingBox(), dimensions = {
			width: boundingBox.width,
			height: boundingBox.height,
			viewBox: [boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height].join(" ")
		}
	}, dir
}]), angular.module("neo4jApp.directives").directive("neoPlan", ["exportService", "SVGUtils", function(exportService, SVGUtils) {
	var dir;
	return dir = {
		restrict: "A"
	}, dir.link = function(scope, elm, attr) {
		var unbinds, watchQueryPlan;
		return unbinds = [], watchQueryPlan = scope.$watch(attr.queryPlan, function(originalPlan) {
			var display, listenerExportPNG, listenerExportSVG, listenerResetFrame, plan;
			if(originalPlan) return plan = JSON.parse(JSON.stringify(originalPlan)), display = function() {
				return neo.queryPlan(elm.get(0)).display(plan)
			}, display(), scope.toggleExpanded = function(expanded) {
				var visit;
				return visit = function(operator) {
					var child, i, len, ref, results;
					if(operator.expanded = expanded, operator.children) {
						for(ref = operator.children, results = [], i = 0, len = ref.length; len > i; i++) child = ref[i], results.push(visit(child));
						return results
					}
				}, visit(plan.root), display()
			}, listenerExportSVG = scope.$on("export.plan.svg", function() {
				var svg, svgData;
				return svg = SVGUtils.prepareForExport(elm, dir.getDimensions(elm.get(0))), svgData = (new XMLSerializer).serializeToString(svg.node()), svgData = svgData.replace(/&nbsp;/g, "&#160;"), exportService.download("plan.svg", "image/svg+xml", svgData), svg.remove()
			}), listenerExportPNG = scope.$on("export.plan.png", function() {
				var svg;
				return svg = SVGUtils.prepareForExport(elm, dir.getDimensions(elm.get(0))), exportService.downloadPNGFromSVG(svg, "plan"), svg.remove()
			}), listenerResetFrame = scope.$on("reset.frame.views", function() {
				var i, len, unbind;
				for(i = 0, len = unbinds.length; len > i; i++)(unbind = unbinds[i])();
				return unbinds = [], $(elm[0]).empty(), dir.link(scope, elm, attr)
			}), unbinds.push(listenerExportSVG), unbinds.push(listenerExportPNG), unbinds.push(listenerResetFrame), watchQueryPlan()
		})
	}, dir.getDimensions = function(element) {
		var dimensions, node;
		return node = d3.select(element), dimensions = {
			width: node.attr("width"),
			height: node.attr("height"),
			viewBox: node.attr("viewBox")
		}
	}, dir
}]), angular.module("neo4jApp.directives").directive("headersTable", ["Utils", function(Utils) {
	return {
		replace: !0,
		restrict: "E",
		link: function(scope, elm, attr) {
			var render, unbind;
			return unbind = scope.$watch(attr.tableData, function(result) {
				return result ? (elm.html(render(result)), unbind()) : void 0
			}), render = function(result) {
				var col, cols, html, i, j, len, rows, v;
				if(rows = result, cols = ["Header", "Value"], !Object.keys(rows).length) return "";
				for(html = "<table class='table data'>", html += "<thead><tr>", j = 0, len = cols.length; len > j; j++) col = cols[j], html += "<th>" + col + "</th>";
				html += "</tr></thead>", html += "<tbody>";
				for(i in rows) v = rows[i], html += "<tr>", html += "<td>" + Utils.escapeHTML(i) + "</td>", html += "<td>" + Utils.escapeHTML(v) + "</td>", html += "</tr>";
				return html += "</tbody>", html += "</table>"
			}
		}
	}
}]);
var indexOf = [].indexOf || function(item) {
	for(var i = 0, l = this.length; l > i; i++)
		if(i in this && this[i] === item) return i;
	return -1
};
angular.module("neo4jApp.directives").directive("generalRequestTable", ["Utils", function(Utils) {
	return {
		replace: !0,
		restrict: "E",
		link: function(scope, elm, attr) {
			var render, unbind;
			return unbind = scope.$watch(attr.tableData, function(result) {
				return result ? (elm.html(render(result)), unbind()) : void 0
			}), render = function(result) {
				var html, i, map, rows, v;
				if(rows = result, map = ["url", "method", "status"], !Object.keys(rows).length) return "";
				html = "<table class='table data'>", html += "<tbody>";
				for(i in rows) v = rows[i], indexOf.call(map, i) < 0 || (html += "<tr>", html += "<td>" + Utils.escapeHTML(i) + "</td>", html += "<td>" + Utils.escapeHTML(v) + "</td>", html += "</tr>");
				return html += "</tbody>", html += "</table>"
			}
		}
	}
}]), angular.module("neo4jApp.directives").directive("divToggler", ["Editor", function(Editor) {
	return {
		restrict: "C",
		link: function(scope, element, attrs) {
			return element.click(function(e) {
				return element.next("div").slideToggle(), element.toggleClass("collapsed"), scope.$apply()
			})
		}
	}
}]), angular.module("neo4jApp.controllers").controller("D3GraphCtrl", ["$attrs", "$element", "$parse", "$window", "$rootScope", "$scope", "$interval", "$timeout", "CircularLayout", "GraphExplorer", "GraphStyle", "Editor", "Settings", function($attrs, $element, $parse, $window, $rootScope, $scope, $interval, $timeout, CircularLayout, GraphExplorer, GraphStyle, Editor, Settings) {
	var attributeHandlerFactory, checkLimitsReached, checkMaxNodesReached, closeContextMenuForItem, graphView, initGraphView, itemMouseOut, itemMouseOver, measureSize, nodeClicked, nodeDragToggle, onCanvasClicked, selectItem, selectedItem, toggleSelection;
	return graphView = null, this.getGraphView = function() {
		return graphView
	}, measureSize = function() {
		return {
			width: $element.width(),
			height: $element.height()
		}
	}, attributeHandlerFactory = function(attribute) {
		return function(item) {
			var exp;
			return $attrs[attribute] ? (exp = $parse($attrs[attribute]), $scope.$applyAsync(function() {
				return exp($scope, {
					$item: item
				})
			})) : void 0
		}
	}, itemMouseOver = attributeHandlerFactory("onItemMouseOver"), itemMouseOut = attributeHandlerFactory("onItemMouseOut"), nodeDragToggle = attributeHandlerFactory("onNodeDragToggle"), onCanvasClicked = attributeHandlerFactory("onCanvasClicked"), selectItem = attributeHandlerFactory("onItemClick"), selectedItem = null, toggleSelection = function(_this) {
		return function(d) {
			return d === selectedItem ? (null != d && (d.selected = !1), selectedItem = null) : (null != selectedItem && (selectedItem.selected = !1), null != d && (d.selected = !0), selectedItem = d), graphView.update(), selectItem(selectedItem)
		}
	}(this), closeContextMenuForItem = function(_this) {
		return function(d) {
			return d === selectedItem ? (null != d && (d.selected = !1), selectedItem = null) : (null != selectedItem && (selectedItem.selected = !1), null != d && (d.selected = !0), selectedItem = d), graphView.update(), selectedItem
		}
	}(this), $rootScope.$on("layout.changed", function() {
		return null != graphView ? graphView.resize() : void 0
	}), $rootScope.$on("close.contextMenu", function() {
		return closeContextMenuForItem(selectedItem)
	}), $scope.$watch("displayInternalRelationships", function(displayInternalRelationships) {
		return graphView ? displayInternalRelationships ? GraphExplorer.internalRelationships(graphView.graph, [], graphView.graph.nodes()).then(function() {
			return graphView.update()
		}) : (graphView.graph.pruneInternalRelationships(), graphView.update()) : void 0
	}), nodeClicked = function(d) {
		return d.fixed = !0, toggleSelection(d)
	}, initGraphView = function(graph) {
		var emitStats, getNodeNeigbours;
		return getNodeNeigbours = function(d) {
			return GraphExplorer.exploreNeighbours(d, graph, $scope.displayInternalRelationships).then(function(_this) {
				return function(neighboursResult) {
					var linkDistance;
					return checkLimitsReached(neighboursResult), linkDistance = 60, CircularLayout.layout(graph.nodes(), d, linkDistance), d.expanded = !0, graphView.update()
				}
			}(this))
		}, checkMaxNodesReached(graph), graphView = new neo.graphView($element[0], measureSize, graph, GraphStyle), $scope.style = GraphStyle.rules, $scope.$watch("style", function(_this) {
			return function(val) {
				return val ? graphView.update() : void 0
			}
		}(this), !0), graphView.on("nodeClicked", function(d) {
			return d.contextMenuEvent || nodeClicked(d), d.contextMenuEvent = !1
		}).on("nodeClose", function(d) {
			return d.contextMenuEvent = !0, GraphExplorer.removeNodesAndRelationships(d, graph), toggleSelection(d)
		}).on("nodeUnlock", function(d) {
			return d.contextMenuEvent = !0, d.fixed = !1, toggleSelection(null)
		}).on("nodeDblClicked", function(d) {
			return d.minified = !1, d.expanded ? void 0 : (getNodeNeigbours(d), $rootScope.$$phase ? void 0 : $rootScope.$apply())
		}).on("deleteNode", function(d) {
			return Editor.setContent("MATCH (n) WHERE id(n) = " + d.id + " DETACH DELETE n"), $scope.focusEditor()
		}).on("editNode", function(d) {
			return Editor.setContent("MATCH (n) WHERE id(n) = " + d.id + " RETURN n"), $scope.focusEditor()
		}).on("relationshipClicked", function(d) {
			return toggleSelection(d)
		}).on("nodeMouseOver", itemMouseOver).on("nodeMouseOut", itemMouseOut).on("menuMouseOver", itemMouseOver).on("menuMouseOut", itemMouseOut).on("nodeDragToggle", nodeDragToggle).on("relMouseOver", itemMouseOver).on("relMouseOut", itemMouseOut).on("canvasClicked", function() {
			return toggleSelection(null), onCanvasClicked()
		}).on("updated", function() {
			return $rootScope.$broadcast("graph:changed", graph)
		}), emitStats = function() {
			var stats;
			return stats = graphView.collectStats(), stats.frameCount > 0 ? $rootScope.$emit("visualization:stats", stats) : void 0
		}, $interval(emitStats, 1e3), graphView.resize(), $rootScope.$broadcast("graph:changed", graph)
	}, this.render = function(initialGraph) {
		var graph;
		return graph = initialGraph, 0 !== graph.nodes().length ? $scope.displayInternalRelationships ? GraphExplorer.internalRelationships(graph, [], graph.nodes()).then(function() {
			return initGraphView(graph)
		}) : initGraphView(graph) : void 0
	}, checkLimitsReached = function(result) {
		return result.neighbourSize > result.neighbourDisplayedSize ? $scope.$emit("graph:max_neighbour_limit", result) : void 0
	}, checkMaxNodesReached = function(graph) {
		return null != graph.display ? $scope.$emit("graph:initial_node_display_limit", graph.display) : void 0
	}, this
}]), angular.module("neo4jApp").directive("editInPlace", ["$parse", "$timeout", function($parse, $timeout) {
	return {
		restrict: "A",
		scope: {
			value: "=editInPlace",
			callback: "&onBlur"
		},
		replace: !0,
		template: '<div ng-class=" {editing: editing} " class="edit-in-place"><form ng-submit="save()"><span ng-bind="value" ng-hide="editing"></span><input ng-show="editing" ng-model="value" class="edit-in-place-input"><div ng-click="edit($event)" ng-hide="editing" class="edit-in-place-trigger"></div></form></div>',
		link: function(scope, element, attrs) {
			var inputElement;
			return scope.editing = !1, inputElement = element.find("input"), scope.edit = function(e) {
				return e.preventDefault(), e.stopPropagation(), scope.editing = !0, $timeout(function() {
					return inputElement.focus()
				}, 0, !1)
			}, scope.save = function() {
				return scope.editing = !1, scope.callback ? scope.callback() : void 0
			}, inputElement.bind("blur", function(e) {
				return scope.save(), scope.$$phase ? void 0 : scope.$apply()
			})
		}
	}
}]), angular.module("neo4jApp.services").factory("Server", ["$http", "HTTP", "Bolt", "$q", "Settings", function($http, HTTP, Bolt, $q, Settings) {
	var Server, httpOptions, returnAndUpdate, returnAndUpdateArray, returnAndUpdateObject;
	return httpOptions = {
		timeout: 1e3 * Settings.maxExecutionTime
	}, returnAndUpdate = function(Type, initial, promise) {
		var rv;
		return rv = initial, promise.success(function(r) {
			return angular.isArray(rv) ? (rv.length = 0, rv.push.apply(rv, r)) : angular.extend(rv, r)
		}), rv
	}, returnAndUpdateArray = function(initial, promise) {
		return returnAndUpdate(Array, initial, promise)
	}, returnAndUpdateObject = function(initial, promise) {
		return returnAndUpdate(Object, initial, promise)
	}, new(Server = function() {
		function Server() {}
		return Server.prototype.options = function(path, options, host) {
			return null == path && (path = ""), null == options && (options = {}), null == host && (host = Settings.host), 0 !== path.indexOf(host) && (path = host + path), options.method = "OPTIONS", options.url = path, $http(options)
		}, Server.prototype.head = function(path, options, host) {
			return null == path && (path = ""), null == host && (host = Settings.host), 0 !== path.indexOf(host) && (path = host + path), $http.head(path, options || httpOptions)
		}, Server.prototype["delete"] = function(path, host) {
			return null == path && (path = ""), null == host && (host = Settings.host), 0 !== path.indexOf(host) && (path = host + path), $http["delete"](path, httpOptions)
		}, Server.prototype.get = function(path, options, host) {
			return null == path && (path = ""), null == host && (host = Settings.host), 0 !== path.indexOf(host) && (path = host + path), $http.get(path, options || httpOptions)
		}, Server.prototype.post = function(path, data, opts, host) {
			return null == path && (path = ""), null == host && (host = Settings.host), 0 !== path.indexOf(host) && (path = host + path), $http.post(path, data, angular.extend(httpOptions, opts))
		}, Server.prototype.put = function(path, data, host) {
			return null == path && (path = ""), null == host && (host = Settings.host), 0 !== path.indexOf(host) && (path = host + path), $http.put(path, data, httpOptions)
		}, Server.prototype.transaction = function(opts) {
			var host, i, len, path, s, statements;
			for(opts = angular.extend({
					path: "",
					statements: [],
					host: Settings.host
				}, opts), path = opts.path, statements = opts.statements, host = opts.host, path = Settings.endpoint.transaction + path, i = 0, len = statements.length; len > i; i++) s = statements[i], s.resultDataContents = ["row", "graph"], s.includeStats = !0;
			return this.post(path, {
				statements: statements
			}, {
				addAuthHeader: opts.addAuthHeader
			}, host)
		}, Server.prototype.buildStatement = function(query, params) {
			return {
				statements: [{
					statement: query,
					parameters: params
				}]
			}
		}, Server.prototype.runQueryOnCluster = function(cluster, query, params) {
			var q, qs, that;
			return q = $q.defer(), qs = [], that = this, cluster.forEach(function(member) {
				var s;
				return s = that.transaction({
					path: "/commit",
					addAuthHeader: !0,
					host: member.address,
					statements: [{
						statement: query,
						parameters: params
					}]
				}), qs.push(s)
			}), $q.all(qs.map(function(p) {
				return p.then(function(r) {
					return {
						state: "fulfilled",
						value: r
					}
				})["catch"](function(e) {
					return {
						state: "rejected",
						value: e
					}
				})
			})).then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(e)
			}), q.promise
		}, Server.prototype.console = function(command, engine) {
			return null == engine && (engine = "shell"), this.post(Settings.endpoint.console, {
				command: command,
				engine: engine
			})
		}, Server.prototype.cypher = function(path, data) {
			return null == path && (path = ""), this.post("" + Settings.endpoint.cypher + path, data)
		}, Server.prototype.jmx = function(query) {
			return this.post(Settings.endpoint.jmx, query)
		}, Server.prototype.labels = function(initial) {
			return null == initial && (initial = []), returnAndUpdateArray(initial, this.get(Settings.endpoint.rest + "/labels"))
		}, Server.prototype.relationships = function(initial) {
			return null == initial && (initial = []), returnAndUpdateArray(initial, this.get(Settings.endpoint.rest + "/relationship/types"))
		}, Server.prototype.propertyKeys = function(initial) {
			return null == initial && (initial = []), returnAndUpdateArray(initial, this.get(Settings.endpoint.rest + "/propertykeys"))
		}, Server.prototype.info = function(initial) {
			return null == initial && (initial = {}), returnAndUpdateObject(initial, this.get(Settings.endpoint.rest + "/"))
		}, Server.prototype.version = function(initial) {
			return null == initial && (initial = {}), returnAndUpdateObject(initial, this.get(Settings.endpoint.version + "/"))
		}, Server.prototype.addresses = function() {
			return this.get(Settings.endpoint.discover + "/")
		}, Server.prototype.status = function(params) {
			return null == params && (params = ""), this.get(Settings.endpoint.discover + "/", {
				skipAuthHeader: !0,
				timeout: 1e3 * Settings.heartbeat
			})
		}, Server.prototype.log = function(path) {
			return this.get(path).then(function(r) {
				return console.log(r)
			})
		}, Server.prototype.hasData = function() {
			var q;
			return q = $q.defer(), this.cypher("?profile=true", {
				query: "MATCH (n) RETURN ID(n) LIMIT 1"
			}).success(function(r) {
				return q.resolve(1 === r.plan.rows)
			}).error(q.reject), q.promise
		}, Server
	}())
}]);
var indexOf = [].indexOf || function(item) {
	for(var i = 0, l = this.length; l > i; i++)
		if(i in this && this[i] === item) return i;
	return -1
};
angular.module("neo4jApp.controllers").config(function($provide, $compileProvider, $filterProvider, $controllerProvider) {
	return $controllerProvider.register("MainCtrl", ["$rootScope", "$location", "$q", "Server", "Frame", "AuthService", "AuthDataService", "ConnectionStatusService", "Settings", "SettingsStore", "motdService", "UsageDataCollectionService", "Utils", "CurrentUser", "ProtocolFactory", "Features", function($scope, $location, $q, Server, Frame, AuthService, AuthDataService, ConnectionStatusService, Settings, SettingsStore, motdService, UDC, Utils, CurrentUser, ProtocolFactory, Features) {
		var clearDbInfo, executePostConnectCmd, featureCheck, fetchJMX, initailConnect, license, mapServerConfig, onboardingSequence, pickFirstFrame, refreshAllowOutgoingConnections, refreshPolicies, setAndSaveSetting;
		return $scope.features = Features, $scope.CurrentUser = CurrentUser, $scope.ConnectionStatusService = ConnectionStatusService, initailConnect = !0, $scope.kernel = {}, $scope.refresh = function() {
			return $scope.unauthorized || $scope.offline ? (clearDbInfo(), "") : ($scope.host = $location.host(), $scope.titlebarString = "- " + ConnectionStatusService.connectedAsUser() + "@" + $location.host() + ":" + $location.port(), $q.when().then(function() {
				return ProtocolFactory.utils().getProceduresList().then(function(procedures) {
					return $scope.procedures = procedures
				})
			}).then(function() {
				return ProtocolFactory.utils().getMeta().then(function(res) {
					return $scope.labels = res.labels, $scope.relationships = res.relationships, $scope.propertyKeys = res.propertyKeys
				})
			}).then(function() {
				return ProtocolFactory.utils().getVersion($scope.version).then(function(res) {
					return $scope.version = res
				})
			}).then(function() {
				return fetchJMX()
			}).then(function() {
				return featureCheck()
			}).then(function() {
				return Features.canGetClusterRole ? ProtocolFactory.utils().getCoreEdgeRole().then(function(res) {
					return $scope.neo4j.clusterRole = res
				}) : $scope.neo4j.clusterRole = !1
			}))
		}, clearDbInfo = function() {
			return $scope.procedures = [], $scope.labels = [], $scope.relationships = [], $scope.propertyKeys = [], $scope.kernel = {}, $scope.version = null, $scope.user = null, $scope.neo4j && ($scope.neo4j.clusterRole = null), $scope.neo4j ? $scope.neo4j.version = null : void 0
		}, clearDbInfo(), featureCheck = function() {
			return indexOf.call($scope.procedures, "dbms.security.listUsers") >= 0 ? ProtocolFactory.utils().getUser().then(function(res) {
				return $scope.user = res, Features.showAdmin = indexOf.call(res.roles, "admin") >= 0
			}) : $scope.user = $scope.static_user, Features.canListQueries = indexOf.call($scope.procedures, "dbms.listQueries") >= 0, Features.canGetRoles = indexOf.call($scope.procedures, "dbms.security.listRoles") >= 0, Features.canActivateUser = indexOf.call($scope.procedures, "dbms.security.activateUser") >= 0, Features.canChangePassword = indexOf.call($scope.procedures, "dbms.security.changeUserPassword") >= 0, Features.usingCoreEdge = indexOf.call($scope.procedures, "dbms.cluster.overview") >= 0, Features.canGetClusterRole = indexOf.call($scope.procedures, "dbms.cluster.role") >= 0
		}, fetchJMX = function() {
			return ProtocolFactory.utils().getJmx(["*:*,name=Configuration", "*:*,name=Kernel", "*:*,name=Store file sizes"]).then(function(response) {
				var a, allow_connections, i, j, len, len1, r, ref, ref1, ref2;
				for(ref = response.data, i = 0, len = ref.length; len > i; i++)
					for(r = ref[i], ref1 = r.attributes, j = 0, len1 = ref1.length; len1 > j; j++) a = ref1[j], $scope.kernel[a.name] = a.value;
				return $scope.neo4j.store_id = $scope.kernel.StoreId, UDC.updateStoreAndServerVersion($scope.version.version, $scope.kernel.StoreId), refreshPolicies($scope.kernel["browser.retain_connection_credentials"], $scope.kernel["browser.credential_timeout"]), allow_connections = null != (ref2 = [!1, "false", "no"].indexOf($scope.kernel["browser.allow_outgoing_browser_connections"]) < 0) ? ref2 : {
					yes: !1
				}, refreshAllowOutgoingConnections(allow_connections), executePostConnectCmd($scope.kernel["browser.post_connect_cmd"])
			})["catch"](function(r) {
				return $scope.kernel = {}
			})
		}, refreshAllowOutgoingConnections = function(allow_connections) {
			return $scope.neo4j.config.allow_outgoing_browser_connections !== allow_connections ? (allow_connections = $scope.neo4j.enterpriseEdition ? allow_connections : !0, mapServerConfig("allow_outgoing_browser_connections", allow_connections), allow_connections ? ($scope.motd.refresh(), UDC.loadUDC()) : allow_connections ? void 0 : UDC.unloadUDC()) : void 0
		}, refreshPolicies = function(retainConnectionCredentials, credentialTimeout) {
			var ref;
			return null == retainConnectionCredentials && (retainConnectionCredentials = !0), null == credentialTimeout && (credentialTimeout = 0), retainConnectionCredentials = null != (ref = [!1, "false", "no"].indexOf(retainConnectionCredentials) < 0) ? ref : {
				yes: !1
			}, credentialTimeout = Utils.parseTimeMillis(credentialTimeout) / 1e3, ConnectionStatusService.setAuthPolicies({
				retainConnectionCredentials: retainConnectionCredentials,
				credentialTimeout: credentialTimeout
			})
		}, mapServerConfig = function(key, val) {
			return $scope.neo4j.config[key] !== val ? $scope.neo4j.config[key] = val : void 0
		}, $scope.identity = angular.identity, $scope.motd = motdService, $scope.auth_service = AuthService, $scope.neo4j = license = {
			type: "GPLv3",
			url: "http://www.gnu.org/licenses/gpl.html",
			edition: "community",
			enterpriseEdition: !1
		}, $scope.neo4j.config = {}, $scope.$on("db:changed:labels", $scope.refresh), $scope.today = Date.now(), $scope.cmdchar = Settings.cmdchar, $scope.goodBrowser = -1 === navigator.userAgent.indexOf("Edge") && -1 === navigator.userAgent.indexOf("Trident") && -1 === navigator.userAgent.indexOf("MSIE"), $scope.$watch("offline", function(serverIsOffline) {
			return null != serverIsOffline ? serverIsOffline ? $scope.bolt_connection_failure = !0 : (UDC.trackConnectEvent(), $scope.bolt_connection_failure = !1) : void 0
		}), $scope.$on("auth:status_updated", function(e, is_connected) {
			return $scope.check(), is_connected ? ConnectionStatusService.setSessionStartTimer(new Date) : void 0
		}), setAndSaveSetting = function(key, value) {
			return Settings[key] = value, SettingsStore.save()
		}, onboardingSequence = function() {
			return Frame.createOne({
				input: Settings.cmdchar + "play neo4j-sync"
			}), setAndSaveSetting("onboarding", !1)
		}, pickFirstFrame = function() {
			return $q.when().then(function() {
				return Server.addresses().then(function(r) {
					return r = r.data, null != r.bolt && "" === Settings.boltHost ? $scope.boltHost = r.bolt.replace("bolt://", "") : $scope.boltHost = $location.host()
				})["catch"](function(r) {
					return $scope.boltHost = $location.host()
				})
			}).then(function() {
				var retainConnection;
				return CurrentUser.init(), AuthService.hasValidAuthorization(retainConnection = !0).then(function() {
					return Frame.closeWhere(Settings.cmdchar + "server connect")
				}, function(r) {
					return Settings.onboarding ? onboardingSequence() : Frame.create({
						input: Settings.cmdchar + "server connect"
					})
				})
			})
		}, pickFirstFrame(), executePostConnectCmd = function(cmd) {
			return cmd && initailConnect ? (initailConnect = !1, Frame.create({
				input: "" + Settings.cmdchar + cmd
			})) : void 0
		}, $scope.$on("ntn:data_loaded", function(evt, authenticated, newUser) {
			return ConnectionStatusService.isConnected() ? Frame.createOne({
				input: "" + Settings.initCmd
			}) : newUser ? Frame.create({
				input: Settings.cmdchar + "play welcome"
			}) : newUser ? void 0 : Frame.create({
				input: Settings.cmdchar + "server connect"
			})
		}), $scope.$watch("version", function(val) {
			return val && 0 !== Object.keys(val).length ? ($scope.neo4j.version = val.version, $scope.neo4j.edition = val.edition, $scope.neo4j.enterpriseEdition = "enterprise" === val.edition, $scope.$emit("db:updated:edition", val.edition), val = $scope.neo4j.version, val.includes("-") && !val.includes("-RC") ? Frame.create({
				input: Settings.cmdchar + "play beta"
			}) : Frame.create({
				input: "" + Settings.initCmd
			}), val.version ? $scope.motd.setCallToActionVersion(val.version) : void 0) : ""
		}, !0)
	}])
}).run(["$rootScope", "Utils", "Settings", "Editor", function($scope, Utils, Settings, Editor) {
	var cmdArgs, cmdCommand, cmdParam;
	if($scope.unauthorized = !0, cmdParam = Utils.getUrlParam("cmd", window.location.href)) {
		if("play" !== cmdParam[0]) return;
		return cmdCommand = "" + Settings.cmdchar + cmdParam[0] + " ", cmdArgs = Utils.getUrlParam("arg", decodeURIComponent(window.location.href)) || [], Editor.setContent(cmdCommand + cmdArgs.join(" "))
	}
}]);
var hasProp = {}.hasOwnProperty;
angular.module("neo4jApp.services").factory("Node", [function() {
	var Node;
	return Node = function() {
		function Node(id, labels, properties) {
			var key, value;
			this.id = id, this.labels = labels, this.propertyMap = properties, this.propertyList = function() {
				var results;
				results = [];
				for(key in properties) hasProp.call(properties, key) && (value = properties[key], results.push({
					key: key,
					value: value
				}));
				return results
			}()
		}
		return Node.prototype.toJSON = function() {
			return this.propertyMap
		}, Node.prototype.isNode = !0, Node.prototype.isRelationship = !1, Node
	}()
}]);
var hasProp = {}.hasOwnProperty;
angular.module("neo4jApp.services").factory("Relationship", [function() {
	var Relationship;
	return Relationship = function() {
		function Relationship(id, source, target, type, properties) {
			var key, value;
			this.id = id, this.source = source, this.target = target, this.type = type, this.propertyMap = properties, this.propertyList = function() {
				var ref, results;
				ref = this.propertyMap, results = [];
				for(key in ref) hasProp.call(ref, key) && (value = ref[key], results.push({
					key: key,
					value: value
				}));
				return results
			}.call(this)
		}
		return Relationship.prototype.toJSON = function() {
			return this.propertyMap
		}, Relationship.prototype.isNode = !1, Relationship.prototype.isRelationship = !0, Relationship
	}()
}]), angular.module("neo4jApp.controllers").controller("JMXCtrl", ["$scope", "Server", function($scope, Server) {
	var parseName, parseSection;
	return parseName = function(str) {
		return str.split("=").pop()
	}, parseSection = function(str) {
		return str.split("/")[0]
	}, Server.jmx(["*:*"]).success(function(response) {
		var i, len, r, section, sections;
		for(sections = {}, i = 0, len = response.length; len > i; i++) r = response[i], r.name = parseName(r.name), section = parseSection(r.url), null == sections[section] && (sections[section] = {}), sections[section][r.name] = r;
		return $scope.sections = sections, $scope.currentItem = sections[section][r.name]
	}), $scope.stringify = function(val) {
		return angular.isString(val) ? val : JSON.stringify(val, null, " ")
	}, $scope.selectItem = function(section, name) {
		return $scope.currentItem = $scope.sections[section][name]
	}, $scope.simpleValues = function(item) {
		return !$scope.objectValues(item)
	}, $scope.objectValues = function(item) {
		return angular.isObject(item.value)
	}
}]), angular.module("neo4jApp.services").factory("GraphExplorer", ["$q", "Cypher", "CypherGraphModel", "Settings", function($q, Cypher, CypherGraphModel, Settings) {
	return {
		removeNodesAndRelationships: function(node, graph) {
			return graph.removeNode(node), graph.removeConnectedRelationships(node)
		},
		exploreNeighbours: function(node, graph, withInternalRelationships) {
			var currentNeighbourIds, q, returnObj;
			return q = $q.defer(), currentNeighbourIds = graph.findNodeNeighbourIds(node.id), returnObj = {
				neighbourDisplayedSize: currentNeighbourIds.length,
				neighbourSize: currentNeighbourIds.length
			}, returnObj.neighbourDisplayedSize >= Settings.maxNeighbours ? (this.findNumberOfNeighbours(node).then(function(_this) {
				return function(numberNeighboursResult) {
					var ref;
					return returnObj.neighbourSize = null != (ref = numberNeighboursResult._response.data[0]) ? ref.row[0] : void 0, q.resolve(returnObj)
				}
			}(this)), q.promise) : (this.findNeighbours(node, currentNeighbourIds).then(function(_this) {
				return function(neighboursResult) {
					var ref;
					return graph.addNodes(neighboursResult.nodes.map(CypherGraphModel.convertNode())), graph.addRelationships(neighboursResult.relationships.map(CypherGraphModel.convertRelationship(graph))), currentNeighbourIds = graph.findNodeNeighbourIds(node.id), returnObj = {
						neighbourDisplayedSize: currentNeighbourIds.length,
						neighbourSize: null != (ref = neighboursResult._response.data[0]) ? ref.row[1] : void 0
					}, withInternalRelationships ? _this.internalRelationships(graph, graph.nodes(), neighboursResult.nodes).then(function() {
						return q.resolve(returnObj)
					}) : q.resolve(returnObj)
				}
			}(this)), q.promise)
		},
		findNeighbours: function(node, currentNeighbourIds) {
			var q;
			return q = $q.defer(), Cypher.transaction().commit("MATCH path = (a)--(o)\nWHERE id(a)= " + node.id + "\nAND NOT (id(o) IN[" + currentNeighbourIds.join(",") + "])\nRETURN path, size((a)--()) as c\nORDER BY id(o)\nLIMIT " + (Settings.maxNeighbours - currentNeighbourIds.length)).then(q.resolve), q.promise
		},
		findNumberOfNeighbours: function(node) {
			var q;
			return q = $q.defer(), Cypher.transaction().commit("MATCH (a)\nWHERE id(a)= " + node.id + "\nRETURN size((a)--()) as c").then(q.resolve), q.promise
		},
		internalRelationships: function(graph, existingNodes, newNodes) {
			var existingNodeIds, mapIds, newNodeIds, q;
			return q = $q.defer(), 0 === newNodes.length ? (q.resolve(), q.promise) : (mapIds = function(node) {
				return parseInt(node.id)
			}, newNodeIds = newNodes.map(mapIds), existingNodeIds = existingNodes.map(mapIds).concat(newNodeIds), Cypher.transaction().commit("MATCH (a)-[r]->(b) WHERE id(a) IN {node_ids}\nAND id(b) IN {new_node_ids}\nRETURN r;", {
				node_ids: existingNodeIds,
				new_node_ids: newNodeIds
			}).then(function(_this) {
				return function(result) {
					return graph.addInternalRelationships(result.relationships.map(CypherGraphModel.convertRelationship(graph))), q.resolve()
				}
			}(this)), q.promise)
		}
	}
}]), angular.module("neo4jApp.services").provider("GraphRenderer", [function() {
	return this.Renderer = function() {
		function Renderer(opts) {
			null == opts && (opts = {}), angular.extend(this, opts), null == this.onGraphChange && (this.onGraphChange = function() {}), null == this.onTick && (this.onTick = function() {})
		}
		return Renderer
	}(), this.nodeRenderers = [], this.relationshipRenderers = [], this.$get = function() {
		return {
			nodeRenderers: this.nodeRenderers,
			relationshipRenderers: this.relationshipRenderers,
			Renderer: this.Renderer
		}
	}, this
}]), angular.module("neo4jApp.services").provider("GraphStyle", [function() {
	var GraphStyle, Selector, StyleElement, StyleRule, provider;
	return provider = this, this.defaultStyle = {
		node: {
			diameter: "50px",
			color: "#A5ABB6",
			"border-color": "#9AA1AC",
			"border-width": "2px",
			"text-color-internal": "#FFFFFF",
			"font-size": "10px"
		},
		relationship: {
			color: "#A5ABB6",
			"shaft-width": "1px",
			"font-size": "8px",
			padding: "3px",
			"text-color-external": "#000000",
			"text-color-internal": "#FFFFFF",
			caption: "<type>"
		}
	}, this.defaultSizes = [{
		diameter: "10px"
	}, {
		diameter: "20px"
	}, {
		diameter: "50px"
	}, {
		diameter: "65px"
	}, {
		diameter: "80px"
	}], this.defaultArrayWidths = [{
		"shaft-width": "1px"
	}, {
		"shaft-width": "2px"
	}, {
		"shaft-width": "3px"
	}, {
		"shaft-width": "5px"
	}, {
		"shaft-width": "8px"
	}, {
		"shaft-width": "13px"
	}, {
		"shaft-width": "25px"
	}, {
		"shaft-width": "38px"
	}], this.defaultColors = [{
		color: "#A5ABB6",
		"border-color": "#9AA1AC",
		"text-color-internal": "#FFFFFF"
	}, {
		color: "#68BDF6",
		"border-color": "#5CA8DB",
		"text-color-internal": "#FFFFFF"
	}, {
		color: "#6DCE9E",
		"border-color": "#60B58B",
		"text-color-internal": "#FFFFFF"
	}, {
		color: "#FF756E",
		"border-color": "#E06760",
		"text-color-internal": "#FFFFFF"
	}, {
		color: "#DE9BF9",
		"border-color": "#BF85D6",
		"text-color-internal": "#FFFFFF"
	}, {
		color: "#FB95AF",
		"border-color": "#E0849B",
		"text-color-internal": "#FFFFFF"
	}, {
		color: "#FFD86E",
		"border-color": "#EDBA39",
		"text-color-internal": "#604A0E"
	}], this.defaultIconCodes = [{
		"icon-code": "a"
	}, {
		"icon-code": '"'
	}, {
		"icon-code": "z"
	}, {
		"icon-code": "_"
	}, {
		"icon-code": "/"
	}, {
		"icon-code": ">"
	}, {
		"icon-code": "k"
	}], Selector = function() {
		function Selector(tag1, classes1) {
			this.tag = tag1, this.classes = null != classes1 ? classes1 : []
		}
		return Selector.prototype.toString = function() {
			var classs, i, len, ref, str;
			for(str = this.tag, ref = this.classes, i = 0, len = ref.length; len > i; i++) classs = ref[i], null != classs && (str += "." + classs);
			return str
		}, Selector
	}(), StyleRule = function() {
		function StyleRule(selector1, props1) {
			this.selector = selector1, this.props = props1
		}
		return StyleRule.prototype.matches = function(selector) {
			var classs, i, len, ref;
			if(this.selector.tag !== selector.tag) return !1;
			for(ref = this.selector.classes, i = 0, len = ref.length; len > i; i++)
				if(classs = ref[i], null != classs && -1 === selector.classes.indexOf(classs)) return !1;
			return !0
		}, StyleRule.prototype.matchesExact = function(selector) {
			return this.matches(selector) && this.selector.classes.length === selector.classes.length
		}, StyleRule
	}(), StyleElement = function() {
		function StyleElement(selector) {
			this.selector = selector, this.props = {}
		}
		return StyleElement.prototype.applyRules = function(rules) {
			var i, len, rule;
			for(i = 0, len = rules.length; len > i; i++) rule = rules[i], rule.matches(this.selector) && angular.extend(this.props, rule.props);
			return this
		}, StyleElement.prototype.get = function(attr) {
			return this.props[attr] || ""
		}, StyleElement
	}(), GraphStyle = function() {
		function GraphStyle(storage) {
			var e, ref;
			this.storage = storage, this.rules = [];
			try {
				this.loadRules(null != (ref = this.storage) ? ref.get("grass") : void 0)
			} catch(_error) {
				e = _error
			}
		}
		var bolt, parseSelector;
		return bolt = window.neo4j.v1, GraphStyle.prototype.selector = function(item) {
			return item.isNode ? this.nodeSelector(item) : item.isRelationship ? this.relationshipSelector(item) : void 0
		}, GraphStyle.prototype.newSelector = function(tag, classes) {
			return new Selector(tag, classes)
		}, GraphStyle.prototype.calculateStyle = function(selector) {
			return new StyleElement(selector).applyRules(this.rules)
		}, GraphStyle.prototype.forEntity = function(item) {
			return this.calculateStyle(this.selector(item))
		}, GraphStyle.prototype.forNode = function(node) {
			var ref, selector, style;
			return null == node && (node = {}), selector = this.nodeSelector(node), (null != (ref = node.labels) ? ref.length : void 0) > 0 && this.setDefaultNodeStyling(selector, node), style = this.calculateStyle(selector), style.props.caption || (style.props.caption = this.getDefaultNodeCaption(node).caption), style
		}, GraphStyle.prototype.forRelationship = function(rel) {
			var selector;
			return selector = this.relationshipSelector(rel), this.calculateStyle(selector)
		}, GraphStyle.prototype.findAvailableDefaultColor = function() {
			var defaultColor, i, j, len, len1, ref, ref1, rule, usedColors;
			for(usedColors = {}, ref = this.rules, i = 0, len = ref.length; len > i; i++) rule = ref[i], null != rule.props.color && (usedColors[rule.props.color] = !0);
			for(ref1 = provider.defaultColors, j = 0, len1 = ref1.length; len1 > j; j++)
				if(defaultColor = ref1[j], null == usedColors[defaultColor.color]) return defaultColor;
			return provider.defaultColors[0]
		}, GraphStyle.prototype.setDefaultNodeStyling = function(selector, item) {
			var defaultCaption, defaultColor, i, len, minimalSelector, ref, rule;
			for(defaultColor = !0, defaultCaption = !0, ref = this.rules, i = 0, len = ref.length; len > i; i++) rule = ref[i], rule.selector.classes.length > 0 && rule.matches(selector) && (rule.props.hasOwnProperty("color") && (defaultColor = !1), rule.props.hasOwnProperty("caption") && (defaultCaption = !1));
			return minimalSelector = new Selector(selector.tag, selector.classes.sort().slice(0, 1)), defaultColor && this.changeForSelector(minimalSelector, this.findAvailableDefaultColor()), defaultCaption ? this.changeForSelector(minimalSelector, this.getDefaultNodeCaption(item)) : void 0
		}, GraphStyle.prototype.getDefaultNodeCaption = function(item) {
			var caption_prio_order, default_caption, ref;
			return !item || !(null != (ref = item.propertyList) ? ref.length : void 0) > 0 ? {
				caption: "<id>"
			} : (caption_prio_order = [/^name$/i, /^title$/i, /^label$/i, /name$/i, /description$/i, /^.+/], default_caption = caption_prio_order.reduceRight(function(leading, current) {
				var hits;
				return hits = item.propertyList.filter(function(prop) {
					return current.test(prop.key)
				}), hits.length ? "{" + hits[0].key + "}" : leading
			}, ""), default_caption || (default_caption = "<id>"), {
				caption: default_caption
			})
		}, GraphStyle.prototype.changeForSelector = function(selector, props) {
			var rule;
			return rule = this.findRule(selector), null == rule && (rule = new StyleRule(selector, {}), this.rules.push(rule)), angular.extend(rule.props, props), this.persist(), rule
		}, GraphStyle.prototype.destroyRule = function(rule) {
			var idx;
			return idx = this.rules.indexOf(rule), null != idx && this.rules.splice(idx, 1), this.persist()
		}, GraphStyle.prototype.findRule = function(selector) {
			var i, len, r, ref;
			for(ref = this.rules, i = 0, len = ref.length; len > i; i++)
				if(r = ref[i], r.matchesExact(selector)) return r;
			return void 0
		}, GraphStyle.prototype.nodeSelector = function(node) {
			var classes;
			return null == node && (node = {}), classes = null != node.labels ? node.labels : [], new Selector("node", classes)
		}, GraphStyle.prototype.relationshipSelector = function(rel) {
			var classes;
			return null == rel && (rel = {}), classes = null != rel.type ? [rel.type] : [], new Selector("relationship", classes)
		}, GraphStyle.prototype.reloadFromStorage = function() {
			var e, ref;
			try {
				return this.loadRules(null != (ref = this.storage) ? ref.get("grass") : void 0)
			} catch(_error) {
				e = _error
			}
		}, GraphStyle.prototype.importGrass = function(string) {
			var e, rules;
			try {
				return rules = this.parse(string), this.loadRules(rules), this.persist()
			} catch(_error) {
				e = _error
			}
		}, parseSelector = function(key) {
			var tokens;
			return tokens = key.split("."), new Selector(tokens[0], tokens.slice(1))
		}, GraphStyle.prototype.loadRules = function(data) {
			var key, props;
			angular.isObject(data) || (data = provider.defaultStyle), data.node || (data.node = provider.defaultStyle.node), data.relationship || (data.relationship = provider.defaultStyle.relationship), this.rules.length = 0;
			for(key in data) props = data[key], this.rules.push(new StyleRule(parseSelector(key), angular.copy(props)));
			return this
		}, GraphStyle.prototype.parse = function(string) {
			var c, chars, i, insideProps, insideString, j, k, key, keyword, len, len1, prop, props, ref, ref1, rules, skipThis, v, val;
			for(chars = string.split(""), insideString = !1, insideProps = !1, keyword = "", props = "", rules = {}, i = 0, len = chars.length; len > i; i++) {
				switch(c = chars[i], skipThis = !0, c) {
					case "{":
						insideString ? skipThis = !1 : insideProps = !0;
						break;
					case "}":
						insideString ? skipThis = !1 : (insideProps = !1, rules[keyword] = props, keyword = "", props = "");
						break;
					case "'":
					case '"':
						insideString ^= !0;
						break;
					default:
						skipThis = !1
				}
				skipThis || (insideProps ? props += c : c.match(/[\s\n]/) || (keyword += c))
			}
			for(k in rules)
				for(v = rules[k], rules[k] = {}, ref = v.split(";"), j = 0, len1 = ref.length; len1 > j; j++) prop = ref[j], ref1 = prop.split(":"), key = ref1[0], val = ref1[1], key && val && (rules[k][null != key ? key.trim() : void 0] = null != val ? val.trim() : void 0);
			return rules
		}, GraphStyle.prototype.persist = function() {
			var ref;
			return null != (ref = this.storage) ? ref.add("grass", JSON.stringify(this.toSheet())) : void 0
		}, GraphStyle.prototype.resetToDefault = function() {
			return this.loadRules(), this.persist()
		}, GraphStyle.prototype.toSheet = function() {
			var i, len, ref, rule, sheet;
			for(sheet = {}, ref = this.rules, i = 0, len = ref.length; len > i; i++) rule = ref[i], sheet[rule.selector.toString()] = rule.props;
			return sheet
		}, GraphStyle.prototype.toString = function() {
			var i, k, len, r, ref, ref1, str, v;
			for(str = "", ref = this.rules, i = 0, len = ref.length; len > i; i++) {
				r = ref[i], str += r.selector.toString() + " {\n", ref1 = r.props;
				for(k in ref1) v = ref1[k], "caption" === k && (v = "'" + v + "'"), str += "  " + k + ": " + v + ";\n";
				str += "}\n\n"
			}
			return str
		}, GraphStyle.prototype.defaultSizes = function() {
			return provider.defaultSizes
		}, GraphStyle.prototype.defaultArrayWidths = function() {
			return provider.defaultArrayWidths
		}, GraphStyle.prototype.defaultColors = function() {
			return angular.copy(provider.defaultColors)
		}, GraphStyle.prototype.defaultIconCodes = function() {
			return provider.defaultIconCodes
		}, GraphStyle.prototype.interpolate = function(str, item) {
			var ips;
			return ips = str.replace(/\{([^{}]*)\}/g, function(a, b) {
				var r;
				return r = item.propertyMap[b], bolt.isInt(r) ? r.toString() : ("object" == typeof r && (r = r.join(", ")), "string" == typeof r || "number" == typeof r ? r : "")
			}), ips.length < 1 && "{type}" === str && item.isRelationship && (ips = "<type>"), ips.length < 1 && "{id}" === str && item.isNode && (ips = "<id>"), ips.replace(/^<(id|type)>$/, function(a, b) {
				var r;
				return r = item[b], bolt.isInt(r) ? r.toString() : "string" == typeof r || "number" == typeof r ? r : ""
			})
		}, GraphStyle
	}(), this.$get = ["localStorageService", function(localStorageService) {
		return new GraphStyle(localStorageService)
	}], this
}]), angular.module("neo4jApp.services").service("GraphGeometry", ["GraphStyle", "TextMeasurement", function(GraphStyle, TextMeasurent) {
	var captionFitsInsideArrowShaftWidth, formatNodeCaptions, layoutRelationships, measureRelationshipCaption, measureRelationshipCaptions, setNodeRadii, shortenCaption, square;
	return square = function(distance) {
		return distance * distance
	}, setNodeRadii = function(nodes) {
		var j, len, node, results;
		for(results = [], j = 0, len = nodes.length; len > j; j++) node = nodes[j], results.push(node.radius = parseFloat(GraphStyle.forNode(node).get("diameter")) / 2);
		return results
	}, formatNodeCaptions = function(nodes) {
		var captionText, i, j, k, len, lines, node, ref, results, template, words;
		for(results = [], j = 0, len = nodes.length; len > j; j++) {
			for(node = nodes[j], template = GraphStyle.forNode(node).get("caption"), captionText = GraphStyle.interpolate(template, node), words = captionText.split(" "), lines = [], i = k = 0, ref = words.length - 1; ref >= 0 ? ref >= k : k >= ref; i = ref >= 0 ? ++k : --k) lines.push({
				node: node,
				text: words[i],
				baseline: 10 * (1 + i - words.length / 2)
			});
			results.push(node.caption = lines)
		}
		return results
	}, measureRelationshipCaption = function(relationship, caption) {
		var fontFamily, fontSize, padding;
		return fontFamily = "sans-serif", fontSize = parseFloat(GraphStyle.forRelationship(relationship).get("font-size")), padding = parseFloat(GraphStyle.forRelationship(relationship).get("padding")), TextMeasurent.measure(caption, fontFamily, fontSize) + 2 * padding
	}, captionFitsInsideArrowShaftWidth = function(relationship) {
		return parseFloat(GraphStyle.forRelationship(relationship).get("shaft-width")) > parseFloat(GraphStyle.forRelationship(relationship).get("font-size"))
	}, measureRelationshipCaptions = function(relationships) {
		var j, len, relationship, results;
		for(results = [], j = 0, len = relationships.length; len > j; j++) relationship = relationships[j], relationship.captionLength = measureRelationshipCaption(relationship, relationship.type), results.push(relationship.captionLayout = captionFitsInsideArrowShaftWidth(relationship) ? "internal" : "external");
		return results
	}, shortenCaption = function(relationship, caption, targetWidth) {
		var shortCaption, width;
		for(shortCaption = caption;;) {
			if(shortCaption.length <= 2) return ["", 0];
			if(shortCaption = shortCaption.substr(0, shortCaption.length - 2) + "\u2026", width = measureRelationshipCaption(relationship, shortCaption), targetWidth > width) return [shortCaption, width]
		}
	}, layoutRelationships = function(relationships) {
		var alongPath, dx, dy, endBreak, headHeight, headRadius, j, len, length, ref, relationship, results, shaftLength, shaftRadius, startBreak;
		for(results = [], j = 0, len = relationships.length; len > j; j++) relationship = relationships[j], dx = relationship.target.x - relationship.source.x, dy = relationship.target.y - relationship.source.y, length = Math.sqrt(square(dx) + square(dy)), relationship.arrowLength = length - relationship.source.radius - relationship.target.radius, alongPath = function(from, distance) {
			return {
				x: from.x + dx * distance / length,
				y: from.y + dy * distance / length
			}
		}, shaftRadius = parseFloat(GraphStyle.forRelationship(relationship).get("shaft-width")) / 2, headRadius = shaftRadius + 3, headHeight = 2 * headRadius, shaftLength = relationship.arrowLength - headHeight, relationship.startPoint = alongPath(relationship.source, relationship.source.radius), relationship.endPoint = alongPath(relationship.target, -relationship.target.radius), relationship.midShaftPoint = alongPath(relationship.startPoint, shaftLength / 2), relationship.angle = Math.atan2(dy, dx) / Math.PI * 180, relationship.textAngle = relationship.angle, (relationship.angle < -90 || relationship.angle > 90) && (relationship.textAngle += 180), ref = shaftLength > relationship.captionLength ? [relationship.type, relationship.captionLength] : shortenCaption(relationship, relationship.type, shaftLength), relationship.shortCaption = ref[0], relationship.shortCaptionLength = ref[1], "external" === relationship.captionLayout ? (startBreak = (shaftLength - relationship.shortCaptionLength) / 2, endBreak = shaftLength - startBreak, results.push(relationship.arrowOutline = ["M", 0, shaftRadius, "L", startBreak, shaftRadius, "L", startBreak, -shaftRadius, "L", 0, -shaftRadius, "Z", "M", endBreak, shaftRadius, "L", shaftLength, shaftRadius, "L", shaftLength, headRadius, "L", relationship.arrowLength, 0, "L", shaftLength, -headRadius, "L", shaftLength, -shaftRadius, "L", endBreak, -shaftRadius, "Z"].join(" "))) : results.push(relationship.arrowOutline = ["M", 0, shaftRadius, "L", shaftLength, shaftRadius, "L", shaftLength, headRadius, "L", relationship.arrowLength, 0, "L", shaftLength, -headRadius, "L", shaftLength, -shaftRadius, "L", 0, -shaftRadius, "Z"].join(" "));
		return results
	}, this.onGraphChange = function(graph) {
		return setNodeRadii(graph.nodes()), formatNodeCaptions(graph.nodes()), measureRelationshipCaptions(graph.relationships())
	}, this.onTick = function(graph) {
		return layoutRelationships(graph.relationships())
	}, this
}]), angular.module("neo4jApp").service("TextMeasurement", function() {
	var cache, measureUsingCanvas;
	return measureUsingCanvas = function(text, font) {
		var canvas, canvasSelection, context;
		return canvasSelection = d3.select("canvas#textMeasurementCanvas").data([this]), canvasSelection.enter().append("canvas").attr("id", "textMeasuringCanvas").style("display", "none"), canvas = canvasSelection.node(), context = canvas.getContext("2d"), context.font = font, context.measureText(text).width
	}, cache = function() {
		var cacheSize, list, map;
		return cacheSize = 1e4, map = {}, list = [],
			function(key, calc) {
				var cached, result;
				return cached = map[key], cached ? cached : (result = calc(), list.length > cacheSize && (delete map[list.splice(0, 1)], list.push(key)), map[key] = result)
			}
	}(), this.measure = function(text, fontFamily, fontSize) {
		var font;
		return font = "normal normal normal " + fontSize + "px/normal " + fontFamily, cache(text + font, function() {
			return measureUsingCanvas(text, font)
		})
	}, this
}), angular.module("neo4jApp.services").service("CircularLayout", function() {
	var CircularLayout;
	return CircularLayout = {}, CircularLayout.layout = function(nodes, center, radius) {
		var i, j, k, len, len1, n, node, results, unlocatedNodes;
		for(unlocatedNodes = [], j = 0, len = nodes.length; len > j; j++) node = nodes[j], (null == node.x || null == node.y) && unlocatedNodes.push(node);
		for(results = [], i = k = 0, len1 = unlocatedNodes.length; len1 > k; i = ++k) n = unlocatedNodes[i], n.x = center.x + radius * Math.sin(2 * Math.PI * i / unlocatedNodes.length), results.push(n.y = center.y + radius * Math.cos(2 * Math.PI * i / unlocatedNodes.length));
		return results
	}, CircularLayout
}), angular.module("neo4jApp.services").service("CircumferentialDistribution", function() {
	return this.distribute = function(arrowAngles, minSeparation) {
		var angle, center, expand, i, j, k, key, l, len, length, list, rawAngle, ref, ref1, ref2, ref3, result, run, runLength, runsOfTooDenseArrows, tooDense, wrapAngle, wrapIndex;
		list = [], ref = arrowAngles.floating;
		for(key in ref) angle = ref[key], list.push({
			key: key,
			angle: angle
		});
		for(list.sort(function(a, b) {
				return a.angle - b.angle
			}), runsOfTooDenseArrows = [], length = function(startIndex, endIndex) {
				return endIndex > startIndex ? endIndex - startIndex + 1 : endIndex + list.length - startIndex + 1
			}, angle = function(startIndex, endIndex) {
				return endIndex > startIndex ? list[endIndex].angle - list[startIndex].angle : 360 - (list[startIndex].angle - list[endIndex].angle)
			}, tooDense = function(startIndex, endIndex) {
				return angle(startIndex, endIndex) < length(startIndex, endIndex) * minSeparation
			}, wrapIndex = function(index) {
				return -1 === index ? list.length - 1 : index >= list.length ? index - list.length : index
			}, wrapAngle = function(angle) {
				return angle >= 360 ? angle - 360 : angle
			}, expand = function(startIndex, endIndex) {
				if(length(startIndex, endIndex) < list.length) {
					if(tooDense(startIndex, wrapIndex(endIndex + 1))) return expand(startIndex, wrapIndex(endIndex + 1));
					if(tooDense(wrapIndex(startIndex - 1), endIndex)) return expand(wrapIndex(startIndex - 1), endIndex)
				}
				return runsOfTooDenseArrows.push({
					start: startIndex,
					end: endIndex
				})
			}, i = j = 0, ref1 = list.length - 2; ref1 >= 0 ? ref1 >= j : j >= ref1; i = ref1 >= 0 ? ++j : --j) tooDense(i, i + 1) && expand(i, i + 1);
		for(result = {}, k = 0, len = runsOfTooDenseArrows.length; len > k; k++)
			for(run = runsOfTooDenseArrows[k], center = list[run.start].angle + angle(run.start, run.end) / 2, runLength = length(run.start, run.end), i = l = 0, ref2 = runLength - 1; ref2 >= 0 ? ref2 >= l : l >= ref2; i = ref2 >= 0 ? ++l : --l) rawAngle = center + (i - (runLength - 1) / 2) * minSeparation, result[list[wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
		ref3 = arrowAngles.floating;
		for(key in ref3) angle = ref3[key], result[key] || (result[key] = arrowAngles.floating[key]);
		return result
	}, this
}), angular.module("neo4jApp.controllers").controller("InspectorCtrl", ["$scope", "GraphStyle", "Collection", "Settings", "$timeout", function($scope, graphStyle, Collection, Settings, $timeout) {
	var arrowDisplayWidths, i, inspectorItem, nodeDisplaySizes, triggerInspectorUIUpdate;
	return $scope.sizes = graphStyle.defaultSizes(), $scope.arrowWidths = graphStyle.defaultArrayWidths(), $scope.iconCodes = graphStyle.defaultIconCodes(), $scope.colors = graphStyle.defaultColors(), $scope.currentItem = null, $scope.inspectorContracted = !0, $scope.inspectorChanged = !1, $scope.inspectorFixed = !1, inspectorItem = function(item, type) {
		return {
			data: item,
			type: type,
			tmpl: "inspector/" + type + ".html"
		}
	}, triggerInspectorUIUpdate = function() {
		return $timeout(function() {
			return $scope.inspectorChanged = !1
		}, 0), $timeout(function() {
			return $scope.inspectorChanged = !0
		}, 0)
	}, $scope.onNodeDragToggle = function(node) {
		return $scope.inspectorFixed = !!node
	}, $scope.onItemClick = function(item, type) {
		return item ? ($scope.currentItem = inspectorItem(item, type), $scope.Inspector.reset($scope.currentItem)) : ($scope.currentItem = null, $scope.Inspector.reset()), triggerInspectorUIUpdate()
	}, $scope.onItemHover = function(item, type) {
		return $scope.inspectorFixed ? void 0 : (item ? null != item.contextMenu ? $scope.Inspector.reset(inspectorItem(item.contextMenu, "contextMenu")) : $scope.Inspector.reset(inspectorItem(item, type)) : $scope.Inspector.reset($scope.currentItem), triggerInspectorUIUpdate())
	}, $scope.styleForItem = function(item) {
		var style;
		return style = graphStyle.forEntity(item), {
			"background-color": style.props.color,
			color: style.props["text-color-internal"]
		}
	}, $scope.styleForLabel = function(label) {
		var item;
		return item = {
			labels: [label],
			isNode: !0
		}, $scope.styleForItem(item)
	}, $scope.sizeLessThan = function(a, b) {
		return a = a ? a.replace("px", "") : 0, b = b ? b.replace("px", "") : 0, +b >= +a
	}, $scope.Inspector = new Collection, $scope.close = function() {
		return Inspector.visible = !1
	}, $scope.toggleInspector = function() {
		return Inspector.visible = !Inspector.visible
	}, $scope.selectArrowWidth = function(item, size) {
		return item.style = graphStyle.changeForSelector(item.style.selector, size)
	}, $scope.selectIcon = function(item, iconCode) {
		return $scope.$emit("close.contextMenu"), item.style = graphStyle.changeForSelector(item.style.selector, iconCode)
	}, $scope.selectCaption = function(item, caption) {
		return item.style = graphStyle.changeForSelector(item.style.selector, {
			caption: caption
		})
	}, $scope.isSelectedCaption = function(item, caption) {
		var grassProps;
		return grassProps = item.style.props, grassProps.caption === "" + caption || !grassProps.caption && ("<id>" === caption || "<type>" === caption)
	}, $scope.selectScheme = function(item, scheme) {
		return item.style = graphStyle.changeForSelector(item.style.selector, angular.copy(scheme))
	}, $scope.selectSize = function(item, size) {
		return $scope.$emit("close.contextMenu"), item.style = graphStyle.changeForSelector(item.style.selector, size)
	}, arrowDisplayWidths = function() {
		var j, results;
		for(results = [], i = j = 0; 10 >= j; i = ++j) results.push(5 + 3 * i + "px");
		return results
	}(), $scope.arrowDisplayWidth = function(idx) {
		return {
			width: arrowDisplayWidths[idx]
		}
	}, nodeDisplaySizes = function() {
		var j, results;
		for(results = [], i = j = 0; 10 >= j; i = ++j) results.push(12 + 2 * i + "px");
		return results
	}(), $scope.nodeDisplaySize = function(idx) {
		return {
			width: nodeDisplaySizes[idx],
			height: nodeDisplaySizes[idx]
		}
	}, $scope.$watch("style", function(oldValue, newValue) {
		return oldValue !== newValue && newValue !== !0 ? $scope.$emit("close.contextMenu") : void 0
	}), $scope.showIcons = Settings.experimentalFeatures
}]), angular.module("neo4jApp").controller("LegendCtrl", ["$scope", "Frame", "GraphStyle", function($scope, resultFrame, graphStyle) {
	var combineAttrs, graphChanged, graphStats, update;
	return $scope.graph = null, $scope.sizes = graphStyle.defaultSizes(), $scope.arrowWidths = graphStyle.defaultArrayWidths(), $scope.colors = graphStyle.defaultColors(), $scope.labelsContracted = !0, $scope.typesContracted = !0, combineAttrs = function(originalAttrs, newAttrs) {
		var attrs;
		return attrs = originalAttrs, newAttrs.forEach(function(newAttr) {
			return originalAttrs.indexOf(newAttr) < 0 ? attrs.push(newAttr) : void 0
		}), attrs
	}, graphStats = function(graph) {
		var attrs, base, base1, base2, base3, i, ignored, j, k, label, len, len1, len2, name, node, nodeAttrs, ref, ref1, ref2, rel, resultLabels, resultRelTypes, stats;
		for(resultLabels = {}, resultRelTypes = {}, stats = {
				labels: {},
				types: {}
			}, ref = graph.nodes(), i = 0, len = ref.length; len > i; i++)
			for(node = ref[i], null == (base = stats.labels)[""] && (base[""] = {
					label: "",
					attrs: [],
					count: 0,
					style: graphStyle.calculateStyle(graphStyle.newSelector("node"))
				}), stats.labels[""].count++, ref1 = node.labels, ignored = j = 0, len1 = ref1.length; len1 > j; ignored = ++j) label = ref1[ignored], nodeAttrs = Object.keys(node.propertyMap), attrs = stats.labels[label] ? combineAttrs(stats.labels[label].attrs, nodeAttrs) : nodeAttrs, null == (base1 = stats.labels)[label] && (base1[label] = {
				label: label,
				attrs: attrs,
				count: 0,
				style: graphStyle.calculateStyle(graphStyle.newSelector("node", [label]))
			}), stats.labels[label].count++;
		for(ref2 = graph.relationships(), k = 0, len2 = ref2.length; len2 > k; k++) rel = ref2[k], null == (base2 = stats.types)[""] && (base2[""] = {
			type: "",
			attrs: [],
			count: 0,
			style: graphStyle.calculateStyle(graphStyle.newSelector("relationship"))
		}), stats.types[""].count++, null == (base3 = stats.types)[name = rel.type] && (base3[name] = {
			type: rel.type,
			attrs: Object.keys(rel.propertyMap),
			count: 0,
			style: graphStyle.calculateStyle(graphStyle.newSelector("relationship", [rel.type]))
		}), stats.types[rel.type].count++;
		return stats
	}, update = function(graph) {
		var stats;
		return stats = graphStats(graph), $scope.labels = stats.labels, $scope.types = stats.types, $scope.$parent.hasLabels = stats.labels[""] && stats.labels[""].count > 0 ? !0 : !1, $scope.$parent.hasTypes = stats.types[""] && stats.types[""].count > 0 ? !0 : !1
	}, $scope.$watch("frame.response", function(frameResponse) {
		return frameResponse && frameResponse.graph ? ($scope.graph = frameResponse.graph, update(frameResponse.graph)) : void 0
	}), graphChanged = function(event, graph) {
		return graph === $scope.graph ? update(graph) : void 0
	}, $scope.$on("graph:changed", graphChanged)
}]), angular.module("neo4jApp.controllers").controller("StylePreviewCtrl", ["$scope", "$window", "GraphStyle", function($scope, $window, GraphStyle) {
	var serialize;
	return serialize = function() {
		return $scope.code = GraphStyle.toString()
	}, $scope.rules = GraphStyle.rules, $scope.$watch("rules", serialize, !0), $scope["import"] = function(content) {
		return GraphStyle.importGrass(content)
	}, $scope.reset = function() {
		return GraphStyle.resetToDefault()
	}, serialize()
}]);
var indexOf = [].indexOf || function(item) {
	for(var i = 0, l = this.length; l > i; i++)
		if(i in this && this[i] === item) return i;
	return -1
};
angular.module("neo4jApp.controllers").controller("CypherResultCtrl", ["$rootScope", "$scope", "AsciiTableFactory", "BoltIntHelpers", "Settings", function($rootScope, $scope, AsciiTableFactory, BoltIntHelpers, Settings) {
	var asciiTable, expectRecords, getBoltStatusMessage, getHitsString, getRecordString, getReturnString, getTimeString, haveRecords, haveUpdates, initializing, tableData;
	return $scope.displayInternalRelationships = Settings.autoComplete, initializing = !0, $scope.availableModes = [], $scope.slider = {
		min: 4,
		max: 20
	}, asciiTable = AsciiTableFactory.getInstance(), $scope.ascii = "", $scope.ascii_col_width = 30, tableData = [], $scope.$watch("frame.response", function(resp, old) {
		var ref, ref1, ref2, ref3, ref4, ref5;
		if(resp) return $scope.availableModes = [], resp.errors || ((null != (ref = resp.graph) ? ref._nodes.length : void 0) && $scope.availableModes.push("graph"), null != (null != (ref1 = resp.table) ? ref1.size : void 0) && $scope.availableModes.push("table"), (null != (ref2 = resp.table) ? ref2._response.plan : void 0) && $scope.availableModes.push("plan")), resp.raw && $scope.availableModes.push("raw"), resp.errors && $scope.availableModes.push("errors"), (null != (ref3 = resp.notifications) ? ref3.length : void 0) && $scope.availableModes.push("messages"), (null != (ref4 = resp.table) ? ref4.size : void 0) && $scope.availableModes.push("text"), (null != (ref5 = resp.table) ? ref5._response.data.length : void 0) && (tableData = resp.table._response), $scope.tab = $rootScope.stickyTab, $scope.isAvailable("messages") && $scope.frame.showCypherNotification ? $scope.tab = "messages" : $scope.isAvailable("plan") ? $scope.tab = "plan" : $scope.isAvailable("errors") && ($scope.tab = "errors"), null == $scope.tab && ($scope.tab = $scope.availableModes[0] || "table"), $scope.availableModes.indexOf($scope.tab) >= 0 ? void 0 : $scope.tab = "table"
	}), $scope.loadAscii = function() {
		var res, rows;
		if(tableData && tableData.data) return asciiTable.serializedItems || (rows = tableData.data.map(function(data_obj) {
			return BoltIntHelpers.mapBoltIntsToStrings(data_obj.row)
		}), rows.splice(0, 0, tableData.columns), asciiTable.setData(rows)), res = asciiTable.getFromSerializedData($scope.ascii_col_width), $scope.slider.max = asciiTable.maxWidth, $scope.ascii = res, initializing = !1
	}, $scope.$watch("ascii_col_width", function(n, o) {
		return initializing ? void 0 : $scope.loadAscii()
	}), $scope.setActive = function(tab) {
		return null == tab && (tab = "graph" === $scope.tab ? "table" : "graph"), "text" === tab && tab !== $scope.tab && $scope.loadAscii(), $rootScope.stickyTab = $scope.tab = tab
	}, $scope.isActive = function(tab) {
		var active;
		return active = tab === $scope.tab, initializing && active && "text" === $scope.tab && $scope.loadAscii(), active
	}, $scope.isAvailable = function(tab) {
		return indexOf.call($scope.availableModes, tab) >= 0
	}, $scope.resultStatistics = function(frame) {
		var messages, rowsStatistics, updatesMessages;
		return(null != frame ? frame.response : void 0) ? (updatesMessages = [], frame.response && expectRecords(frame) && (updatesMessages = $scope.updatesStatistics(frame)), rowsStatistics = $scope.returnedRowsStatistics(frame), messages = [].concat(updatesMessages, rowsStatistics), $scope.formatStatisticsOutput(messages)) : void 0
	}, $scope.graphStatistics = function(frame) {
		var graph, internalRelationships, message, plural, ref;
		return null != (null != frame && null != (ref = frame.response) ? ref.graph : void 0) ? (graph = frame.response.graph, plural = function(collection, noun) {
			return collection.length + " " + noun + (1 === collection.length ? "" : "s")
		}, message = "Displaying " + plural(graph.nodes(), "node") + ", " + plural(graph.relationships(), "relationship"), internalRelationships = graph.relationships().filter(function(r) {
			return r.internal
		}), internalRelationships.length > 0 && (message += " (completed with  " + plural(internalRelationships, "additional relationship") + ")"), message + ".") : void 0
	}, $scope.planStatistics = function(frame) {
		var collectHits, message, numHits, ref, ref1, root;
		return null != (null != frame && null != (ref = frame.response) && null != (ref1 = ref.table) ? ref1._response.plan : void 0) ? (root = frame.response.table._response.plan.root, collectHits = function(operator) {
			var child, hits, i, len, ref2, ref3;
			if(hits = null != (ref2 = operator.DbHits) ? ref2 : 0, operator.children)
				for(ref3 = operator.children, i = 0, len = ref3.length; len > i; i++) child = ref3[i], hits += collectHits(child);
			return hits
		}, message = "Cypher version: " + root.version + ", planner: " + root.planner + ", runtime: " + root.runtime + ".", numHits = collectHits(root), numHits && (message += " " + numHits + " total db " + getHitsString(numHits) + " in " + (frame.response.timings.resultAvailableAfter || frame.response.timings.responseTime || 0) + " ms."), message) : void 0
	}, $scope.formatStatisticsOutput = function(messages) {
		var joinedMessages;
		return joinedMessages = messages.join(", "), "" + joinedMessages.substring(0, 1).toUpperCase() + joinedMessages.substring(1) + "."
	}, $scope.returnedRowsStatistics = function(frame) {
		var messages, ref;
		return messages = [], null != (null != frame && null != (ref = frame.response) ? ref.table : void 0) && (messages = getTimeString(frame, "returnedRows"), frame.response.table.size > frame.response.table.displayedSize && messages.push("displaying first " + frame.response.table.displayedSize + " rows")), messages
	}, $scope.updatesStatistics = function(frame) {
		var field, messages, nonZeroFields, ref, stats, timeString;
		return haveUpdates(frame) ? (messages = [], null != (null != frame && null != (ref = frame.response) ? ref.table : void 0) && (stats = frame.response.table.stats, nonZeroFields = $scope.getNonZeroStatisticsFields(frame), messages = function() {
			var i, len, results;
			for(results = [], i = 0, len = nonZeroFields.length; len > i; i++) field = nonZeroFields[i], results.push(field.verb + " " + stats[field.field] + " " + (1 === stats[field.field] ? field.singular : field.plural));
			return results
		}(), timeString = getTimeString(frame, "updates"), messages = messages.length ? [].concat(messages, timeString) : timeString), messages) : []
	}, $scope.getNonZeroStatisticsFields = function(frame) {
		var field, fields, i, len, nonZeroFields, ref, stats;
		if(nonZeroFields = [], null != (null != frame && null != (ref = frame.response) ? ref.table : void 0))
			for(stats = frame.response.table.stats, fields = [{
					plural: "constraints",
					singular: "constraint",
					verb: "added",
					field: "constraints_added"
				}, {
					plural: "constraints",
					singular: "constraint",
					verb: "removed",
					field: "constraints_removed"
				}, {
					plural: "indexes",
					singular: "index",
					verb: "added",
					field: "indexes_added"
				}, {
					plural: "indexes",
					singular: "index",
					verb: "removed",
					field: "indexes_removed"
				}, {
					plural: "labels",
					singular: "label",
					verb: "added",
					field: "labels_added"
				}, {
					plural: "labels",
					singular: "label",
					verb: "removed",
					field: "labels_removed"
				}, {
					plural: "nodes",
					singular: "node",
					verb: "created",
					field: "nodes_created"
				}, {
					plural: "nodes",
					singular: "node",
					verb: "deleted",
					field: "nodes_deleted"
				}, {
					plural: "properties",
					singular: "property",
					verb: "set",
					field: "properties_set"
				}, {
					plural: "relationships",
					singular: "relationship",
					verb: "deleted",
					field: "relationship_deleted"
				}, {
					plural: "relationships",
					singular: "relationship",
					verb: "deleted",
					field: "relationships_deleted"
				}, {
					plural: "relationships",
					singular: "relationship",
					verb: "created",
					field: "relationships_created"
				}], i = 0, len = fields.length; len > i; i++) field = fields[i], stats[field.field] > 0 && nonZeroFields.push(field);
		return nonZeroFields
	}, $scope.rawStatistics = function(frame) {
		var ref;
		if(null != (ref = frame.response) ? ref.timings : void 0) return "client" === frame.response.timings.type ? "Request completed in " + frame.response.timings.responseTime + " ms." : $scope.formatStatisticsOutput(getTimeString(frame, "raw"))
	}, $scope.getRequestTitle = function(num_requests, index) {
		var titles;
		return titles = [
			["Autocommitting Transaction"],
			["Open Transaction", "Commit Transaction"]
		], titles[num_requests - 1][index]
	}, getRecordString = function(num) {
		return 1 === num ? "record" : "records"
	}, getHitsString = function(num) {
		return 1 === num ? "hit" : "hits"
	}, getReturnString = function(num) {
		return "returned " + num + " " + getRecordString(num)
	}, getTimeString = function(frame, context) {
		var messages, timeMessage;
		return messages = [], "bolt" === frame.response.timings.type ? getBoltStatusMessage(frame, context) : (timeMessage = " in " + frame.response.timings.responseTime + " ms", "updates" === context && (messages.push(getReturnString(frame.response.table.size)), expectRecords(frame) || (messages[messages.length - 1] = "statement completed"), messages[messages.length - 1] += timeMessage), "returnedRows" === context && expectRecords(frame) && !haveUpdates(frame) && (messages.push(getReturnString(frame.response.table.size)), messages[messages.length - 1] += timeMessage), messages)
	}, getBoltStatusMessage = function(frame, context) {
		var messages, statusMessage;
		return "updates" === context && haveUpdates(frame) ? (messages = [], expectRecords(frame) || messages.push("statement completed"), messages[messages.length - 1] += " in " + frame.response.timings.resultAvailableAfter + " ms", messages) : ["returnedRows", "raw"].indexOf(context) > -1 ? (statusMessage = expectRecords(frame) && haveRecords(frame) ? "started streaming " + frame.response.table.size + " " + getRecordString(frame.response.table.size) + " " + ("after " + frame.response.timings.resultAvailableAfter + " ms ") + ("and completed after " + frame.response.timings.totalTime + " ms") : expectRecords(frame) ? "returned " + frame.response.table.size + " " + getRecordString(frame.response.table.size) + ", " + ("completed after " + frame.response.timings.resultAvailableAfter + " ms") : "completed after " + frame.response.timings.resultAvailableAfter + " ms", [statusMessage]) : []
	}, expectRecords = function(frame) {
		var ref, ref1, ref2;
		return null != (ref = frame.response) && null != (ref1 = ref.table) && null != (ref2 = ref1._response.columns) ? ref2.length : void 0
	}, haveRecords = function(frame) {
		return frame.response.table.size > 0
	}, haveUpdates = function(frame) {
		return $scope.getNonZeroStatisticsFields(frame).length
	}, $scope.$on("frame.export.graph.svg", function() {
		return $scope.$broadcast("export.graph.svg")
	}), $scope.$on("frame.export.plan.svg", function() {
		return $scope.$broadcast("export.plan.svg")
	}), $scope.$on("frame.export.graph.png", function() {
		return $scope.$broadcast("export.graph.png")
	}), $scope.$on("frame.export.plan.png", function() {
		return $scope.$broadcast("export.plan.png")
	}), $scope.toggleDisplayInternalRelationships = function() {
		return $scope.displayInternalRelationships = !$scope.displayInternalRelationships
	}, $scope.$on("graph:max_neighbour_limit", function(event, result) {
		return event.stopPropagation && event.stopPropagation(), $scope.$broadcast("frame.notif.max_neighbour_limit", result)
	}), $scope.$on("graph:initial_node_display_limit", function(event, result) {
		return event.stopPropagation && event.stopPropagation(), $scope.$broadcast("frame.notif.initial_node_display_limit", result)
	})
}]), angular.module("neo4jApp.services").factory("motdService", ["$rootScope", "rssFeedService", "motdFeedParser", "Settings", function($rootScope, rssFeedService, motdFeedParser, Settings) {
	var Motd;
	return new(Motd = function() {
		function Motd() {}
		var choices, trackingData;
		return trackingData = "?utm_source=browser&utm_medium=motd&utm_content=blog&utm_campaign=browser", choices = {
			quotes: [{
				text: "When you label me, you negate me.",
				author: "Soren Kierkegaard"
			}, {
				text: "In the beginning was the command line.",
				author: "Neal Stephenson"
			}, {
				text: "Remember, all I'm offering is the truth \u2013 nothing more.",
				author: "Morpheus"
			}, {
				text: "Testing can show the presence of bugs, but never their absence.",
				author: "Edsger W. Dijkstra"
			}, {
				text: "We think your graph is a special snowflake.",
				author: "Neo4j"
			}, {
				text: "Still he'd see the matrix in his sleep, bright lattices of logic unfolding across that colorless void.",
				author: "William Gibson"
			}, {
				text: "Eventually everything connects.",
				author: "Charles Eames"
			}, {
				text: "To develop a complete mind: study the science of art. Study the art of science. Develop your senses - especially learn how to see. Realize that everything connects to everything else.",
				author: "Leonardo da Vinci"
			}],
			tips: ["Use <shift-return> for multi-line, <cmd-return> to evaluate command", "Navigate history with <ctrl- up/down arrow>", "When in doubt, ask for :help"],
			unrecognizable: ["Interesting. How does this make you feel?", "Even if I squint, I can't make out what that is. Is it an elephant?", "This one time, at bandcamp...", "Ineffable, enigmatic, possibly transcendent. Also quite good looking.", "I'm not (yet) smart enough to understand this.", "Oh I agree. Kaaviot ovat suuria!"],
			emptiness: ["No nodes. Know nodes?", "Waiting for the big bang of data.", "Ready for anything.", "Every graph starts with the first node."],
			disconnected: ["Disconnected from Neo4j. Please check if the cord is unplugged."],
			callToAction: [{
				d: "Every good graph starts with Neo4j.",
				u: "http://neo4j.com/" + trackingData
			}, {
				d: "Join our Neo4j Slack community.",
				u: "http://neo4j.com/slack/" + trackingData
			}, {
				d: "Start coding your application with a driver for your language of choice.",
				u: "http://neo4j.com/developer/language-guides/" + trackingData
			}, {
				d: "Visualize even more of your graph, using one of these great tools.",
				u: "http://neo4j.com/developer/guide-data-visualization/" + trackingData
			}, {
				d: "Keep this handy Cypher Reference Card with you at all times ;)",
				u: "http://neo4j.com/docs/stable/cypher-refcard/" + trackingData
			}, {
				d: "Free online training, to level-up your Neo4j skills.",
				u: "http://neo4j.com/graphacademy/online-training/" + trackingData
			}, {
				d: "Join the thousands who have graduated from Graph Academy.",
				u: "http://neo4j.com/graphacademy/" + trackingData
			}, {
				d: "Got data? Learn how to import it into Neo4j.",
				u: "http://neo4j.com/developer/guide-import-csv/" + trackingData
			}, {
				d: "Ready to launch? Check the Neo4j Performance Tuning Guide to maximize your success",
				u: "http://neo4j.com/developer/guide-performance-tuning/" + trackingData
			}, {
				d: "Fraud! Everything you need to know about detecting it with Neo4j.",
				u: "http://neo4j.com/use-cases/fraud-detection/"
			}, {
				d: "People like you have read this. Now they can make recommendations like an Amazonian.",
				u: "http://neo4j.com/use-cases/real-time-recommendation-engine/"
			}, {
				d: "Everything is social. Manage people relationships in your graph.",
				u: "http://neo4j.com/use-cases/social-network/"
			}]
		}, Motd.prototype.quote = "", Motd.prototype.tip = "", Motd.prototype.unrecognized = "", Motd.prototype.emptiness = "", Motd.prototype.setCallToActionVersion = function(version) {
			return this.cta_version !== version ? (this.cta_version = version, this.refresh()) : void 0
		}, Motd.prototype.getCallToActionFeedItem = function(feed) {
			var item, match_filter, ref, that;
			return that = this, match_filter = {
				version: function(val) {
					var re, res;
					return val ? (re = new RegExp("^" + val), res = re.test(that.cta_version)) : !0
				},
				combo: function(val) {
					var res;
					return val ? res = /^!/.test(val) : !1
				}
			}, item = motdFeedParser.getFirstMatch(feed, match_filter), (null != item ? item.d : void 0) || (match_filter = {
				version: function(val) {
					var hit, re;
					return val ? (re = new RegExp("^" + val), hit = re.test(that.cta_version), hit || "neo4j" === val) : !0
				}
			}, item = motdFeedParser.getFirstMatch(feed, match_filter)), item.bang = null != (ref = motdFeedParser.explodeTags(item.t).combo) ? ref.replace(/[^a-z]*/gi, "") : void 0, (null != item ? item.u : void 0) && item.u.indexOf("blog") >= 0 && (item.d = "Latest Blog: " + item.d), item
		}, Motd.prototype.refresh = function() {
			this.quote = this.pickRandomlyFrom(choices.quotes), this.tip = this.pickRandomlyFrom(choices.tips), this.unrecognized = this.pickRandomlyFrom(choices.unrecognizable), this.emptiness = this.pickRandomlyFrom(choices.emptiness), this.disconnected = this.pickRandomlyFrom(choices.disconnected), this.callToAction = this.pickRandomlyFrom(choices.callToAction), Settings.enableMotd !== !1 && !$rootScope.neo4j.config.allow_outgoing_browser_connections
		}, Motd.prototype.pickRandomlyFrom = function(fromThis) {
			return fromThis[Math.floor(Math.random() * fromThis.length)]
		}, Motd.prototype.pickRandomlyFromChoiceName = function(choiceName) {
			return choices[choiceName] ? this.pickRandomlyFrom(choices[choiceName]) : ""
		}, Motd
	}())
}]), angular.module("neo4jApp.directives").directive("fancyLogo", ["$window", function($window) {
	return {
		template: "<h1>fancified</h1>",
		link: function(scope, element, attrs, ctrl) {
			return element.html(Modernizr.inlinesvg ? '<span class="ball one"/><span class="ball two"/><span class="ball three"/>' : '<svg viewBox="41 29 125 154" width="125pt" height="154pt"><defs><pattern id="img1" patternUnits="objectBoundingBox" width="90" height="90"><image href="images/faces/abk.jpg" x="0" y="0" width="64" height="64"></image></pattern></defs><g class="logo" stroke="none" stroke-opacity="1" stroke-dasharray="none" fill-opacity="1"><circle class="node" cx="129.63533" cy="84.374286" r="32.365616" fill="#fad000"></circle><circle class="node" cx="62.714058" cy="50.834676" r="18.714163" fill="#fad000"></circle><circle class="node" cx="83.102398" cy="152.22447" r="26.895987" fill="#fad000"></circle><circle class="relationship" cx="91.557016" cy="45.320086" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="104.57301" cy="49.659258" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="55.755746" cy="78.59023" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="55.755746" cy="92.690676" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="58.64808" cy="108.24096" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="65.87916" cy="121.25976" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="118.67652" cy="138.25673" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="127.35707" cy="127.40609" r="5.0627656" fill="#ff4907" stroke="none"></circle><path class="swish" d="M 157.176255 67.359654 C 155.88412 65.2721 154.33242 63.29959 152.52118 61.488342 C 139.88167 48.84871 119.389024 48.84871 106.74953 61.488342 C 94.109954 74.127904 94.109954 94.620657 106.74953 107.260246 C 107.89654 108.40725 109.10819 109.45017 110.37279 110.38901 C 102.64778 97.90879 104.199466 81.316687 115.027814 70.488345 C 126.520325 58.995706 144.50541 57.952786 157.176255 67.35964 Z" fill="#f5aa00"></path><path class="swish" d="M 78.48786 41.29777 C 77.75747 40.117761 76.88036 39.00278 75.856537 37.978957 C 68.711942 30.834292 57.12829 30.834292 49.983703 37.978957 C 42.839068 45.123583 42.839068 56.707297 49.983703 63.85194 C 50.63206 64.500294 51.316958 65.089815 52.031784 65.6205 C 47.665153 58.565944 48.542256 49.187108 54.663076 43.06629 C 61.159322 36.569972 71.325554 35.980452 78.48786 41.297761 Z" fill="#f5aa00"></path><path class="swish" d="M 104.91025 138.61693 C 103.88164 136.955135 102.64641 135.384915 101.20457 133.94307 C 91.142876 123.88128 74.829684 123.88128 64.768004 133.94307 C 54.706255 144.00481 54.706255 160.31808 64.768004 170.37984 C 65.68108 171.29292 66.64562 172.12314 67.652304 172.8705 C 61.502802 162.93561 62.73802 149.727445 71.35794 141.10753 C 80.506564 131.958805 94.82361 131.12859 104.91025 138.61692 Z" fill="#f5aa00"></path><circle class="node-outline" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" cx="129.63533" cy="84.374286" r="32.365616" stroke="#eb7f00"></circle><circle class="node-outline" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" cx="62.714058" cy="50.834676" r="18.714163" stroke="#eb7f00"></circle><circle class="node-outline" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" cx="83.102394" cy="152.22448" r="26.895992" stroke="#eb7f00"></circle></g></svg>')
		}
	}
}]), angular.module("neo4jApp.services").factory("Persistable", ["$rootScope", "localStorageService", function($rootScope, localStorageService) {
	var Persistable;
	return Persistable = function() {
		function Persistable(data) {
			null == data && (data = {}), angular.isObject(data) && angular.extend(this, data), null == this.id && (this.id = UUID.genV1().toString())
		}
		return Persistable.fetch = function() {
			var i, len, p, persisted, results;
			if(persisted = function() {
					try {
						return localStorageService.get(this.storageKey)
					} catch(_error) {
						return null
					}
				}.call(this), !angular.isArray(persisted)) return [];
			for(results = [], i = 0, len = persisted.length; len > i; i++) p = persisted[i], results.push(new this(p));
			return results
		}, Persistable.save = function(data) {
			return localStorageService.add(this.storageKey, JSON.stringify(data))
		}, Persistable
	}()
}]);
var extend = function(child, parent) {
		function ctor() {
			this.constructor = child
		}
		for(var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
		return ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype, child
	},
	hasProp = {}.hasOwnProperty;
angular.module("neo4jApp.services").factory("Folder", ["Collection", "Document", "Persistable", function(Collection, Document, Persistable) {
	var Folder, Folders;
	return Folder = function(superClass) {
		function Folder(data) {
			this.expanded = !0, Folder.__super__.constructor.call(this, data), null == this.name && (this.name = "Unnamed folder")
		}
		return extend(Folder, superClass), Folder.storageKey = "folders", Folder.prototype.toJSON = function() {
			return {
				id: this.id,
				name: this.name,
				expanded: this.expanded
			}
		}, Folder
	}(Persistable), Folders = function(superClass) {
		function Folders() {
			return Folders.__super__.constructor.apply(this, arguments)
		}
		return extend(Folders, superClass), Folders.prototype.create = function(data) {
			var folder;
			return folder = new Folder(data), this.add(folder), this.save(), folder
		}, Folders.prototype.expand = function(folder) {
			return folder.expanded = !folder.expanded, this.save()
		}, Folders.prototype.klass = Folder, Folders.prototype["new"] = function(args) {
			return new Folder(args)
		}, Folders.prototype.destroy = function(folder) {
			var documentsToRemove;
			return documentsToRemove = Document.where({
				folder: folder.id
			}), Document.remove(documentsToRemove), this.remove(folder), this.save()
		}, Folders
	}(Collection), new Folders(null, Folder).fetch()
}]);
var extend = function(child, parent) {
		function ctor() {
			this.constructor = child
		}
		for(var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
		return ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype, child
	},
	hasProp = {}.hasOwnProperty;
angular.module("neo4jApp.services").factory("Document", ["Collection", "Persistable", function(Collection, Persistable) {
	var Document, Documents;
	return Document = function(superClass) {
		function Document(data) {
			Document.__super__.constructor.call(this, data), null == this.name && (this.name = "Unnamed document"), null == this.folder && (this.folder = !1)
		}
		return extend(Document, superClass), Document.storageKey = "documents", Document.prototype.toJSON = function() {
			return {
				id: this.id,
				name: this.name,
				folder: this.folder,
				content: this.content
			}
		}, Document
	}(Persistable), Documents = function(superClass) {
		function Documents() {
			return Documents.__super__.constructor.apply(this, arguments)
		}
		return extend(Documents, superClass), Documents.prototype.create = function(data) {
			var d;
			return d = new Document(data), this.add(d), this.save(), d
		}, Documents.prototype.klass = Document, Documents.prototype["new"] = function(args) {
			return new Document(args)
		}, Documents.prototype.remove = function(doc) {
			return Documents.__super__.remove.apply(this, arguments)
		}, Documents.prototype.destroy = function(doc) {
			return this.remove(doc), this.save()
		}, Documents
	}(Collection), new Documents(null, Document).fetch()
}]);
var bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments)
		}
	},
	extend = function(child, parent) {
		function ctor() {
			this.constructor = child
		}
		for(var key in parent) hasProp.call(parent, key) && (child[key] = parent[key]);
		return ctor.prototype = parent.prototype, child.prototype = new ctor, child.__super__ = parent.prototype, child
	},
	hasProp = {}.hasOwnProperty;
angular.module("neo4jApp.services").provider("Frame", [function() {
	var self;
	return self = this, this.interpreters = [], this.$get = ["$injector", "$q", "Collection", "Settings", "Features", "Utils", function($injector, $q, Collection, Settings, Features, Utils) {
		var Frame, Frames, frames;
		return Frame = function() {
			function Frame(data) {
				null == data && (data = {}), this.getDetailedErrorText = bind(this.getDetailedErrorText, this), this.setCustomError = bind(this.setCustomError, this), this.setError = bind(this.setError, this), this.addErrorText = bind(this.addErrorText, this), this.resetError = bind(this.resetError, this), this.setErrorMessages = bind(this.setErrorMessages, this), this.templateUrl = null, angular.isString(data) ? this.input = data : angular.extend(this, data), null == this.id && (this.id = UUID.genV1().toString())
			}
			return Frame.prototype.toJSON = function() {
				return {
					id: this.id,
					input: this.input
				}
			}, Frame.prototype.exec = function() {
				var intr, intrFn, intrPromise, query;
				return query = Utils.stripComments(this.input.trim()), query && (intr = frames.interpreterFor(query)) ? (this.type = intr.type, intrFn = $injector.invoke(intr.exec), this.setProperties(intr), this.errorText = !1, this.detailedErrorText = !1, this.hasErrors = !1, this.startTime || (this.isLoading = !0), this.isTerminating = !1, this.closeAttempts = 0, this.response = null, this.templateUrl = intr.templateUrl, this.startTime || (this.startTime = (new Date).getTime()), this.pinTime = 0, this.procedureNotFound = function(error) {
					return error && -1 !== error.search("ProcedureNotFound") ? !0 : void 0
				}, this.writeToReadOnlyError = function(error) {
					return Features.canGetClusterRole && Settings.useBoltRouting && error && -1 !== error.search("ForbiddenOnReadOnlyDatabase") ? !0 : void 0
				}, intrPromise = intrFn(query, $q.defer()), this.terminate = function(_this) {
					return function() {
						var q, that;
						return _this.resetError(), q = $q.defer(), intrPromise && intrPromise.transaction ? (intrPromise.reject("cancel main request"), _this.isTerminating = !0, that = _this, intrPromise.transaction.rollback().then(function(r) {
							return that.isTerminating = !1, q.resolve(r)
						})["catch"](function(r) {
							return that.isTerminating = !1, q.reject(r)
						}), q.promise) : (q.resolve({}), q.promise)
					}
				}(this), $q.when(intrPromise).then(function(_this) {
					return function(result) {
						var ref;
						return _this.isLoading = !1, _this.response = result, _this.requests = (null != intrPromise && null != (ref = intrPromise.transaction) ? ref.requests : void 0) || []
					}
				}(this), function(_this) {
					return function(result) {
						var ref;
						return null == result && (result = {}), _this.isLoading = !1, _this.response = result, _this.requests = (null != intrPromise && null != (ref = intrPromise.transaction) ? ref.requests : void 0) || [], _this.setError(result)
					}
				}(this)), this) : void 0
			}, Frame.prototype.setProperties = function(intr) {
				var ref;
				return this.exportable = "cypher" === (ref = this.type) || "http" === ref, this.fullscreenable = intr.fullscreenable === !0 || "undefined" == typeof intr.fullscreenable || null === intr.fullscreenable ? !0 : this.fullscreenable
			}, Frame.prototype.setErrorMessages = function(result) {
				var errors, ref, ref1;
				return null == result && (result = {}), "string" == typeof result && (result = {
					errors: [{
						code: "Error",
						message: result
					}]
				}), 401 !== (ref = result.status) && 403 !== ref && 429 !== ref && 422 !== ref && 404 !== ref || !result.data.errors || (result = result.data), result.status && (result = {
					errors: [{
						code: "HTTP Status: " + result.status,
						message: "HTTP Status: " + result.status + " - " + result.statusText
					}]
				}), result.is_remote && 0 === result.status && (result = {
					errors: [{
						code: 0,
						message: "No 'Access-Control-Allow-Origin' header is present on the requested resource and can therefore not be played."
					}]
				}), result.data && (null != (ref1 = result.data.errors) ? ref1.length : void 0) && (result = result.data), errors = result.errors[0], this.errorText = "" + errors.code, this.detailedErrorText = errors.message
			}, Frame.prototype.resetError = function() {
				return this.errorText = this.detailedErrorText = "", this.hasErrors = !1
			}, Frame.prototype.addErrorText = function(error) {
				return this.detailedErrorText += error, this.hasErrors = !0
			}, Frame.prototype.setError = function(response) {
				return this.setErrorMessages(response), this.hasErrors = !0
			}, Frame.prototype.setCustomError = function(code, details) {
				return this.errorText = "" + code, this.detailedErrorText = details, this.hasErrors = !0
			}, Frame.prototype.getDetailedErrorText = function() {
				return this.detailedErrorText
			}, Frame
		}(), Frames = function(superClass) {
			function Frames() {
				return Frames.__super__.constructor.apply(this, arguments)
			}
			var getFilteredInterpreters;
			return extend(Frames, superClass), Frames.prototype.create = function(data) {
				var frame, intr, ref, rv;
				return null == data && (data = {}), data.input && (intr = this.interpreterFor(data.input)) ? (intr.templateUrl ? frame = new Frame(data) : rv = $injector.invoke(intr.exec)(data.input), frame && (this.add(frame.exec()), this.length > Settings.maxFrames && this.close(null != (ref = this.where({
					pinTime: 0
				})) ? ref[0] : void 0)), frame || rv) : void 0
			}, Frames.prototype.close = function(frame) {
				var pr;
				return pr = frame.terminate(), pr.then(function(_this) {
					return function() {
						return _this.remove(frame)
					}
				}(this), function(_this) {
					return function(r) {
						return frame.closeAttempts < 1 ? (frame.response = r, frame.setError(r), frame.closeAttempts++) : _this.remove(frame)
					}
				}(this))
			}, Frames.prototype.closeWhere = function(input) {
				var f, j, len, results, rv;
				for(rv = this.where({
						input: input
					}), results = [], j = 0, len = rv.length; len > j; j++) f = rv[j], results.push(this.close(f));
				return results
			}, Frames.prototype.createOne = function(data) {
				var last;
				return null == data && (data = {}), last = this.last(), (null != last ? last.input : void 0) !== data.input ? this.create(data) : void 0
			}, getFilteredInterpreters = function() {
				var interpreters;
				return interpreters = self.interpreters.slice(0), interpreters = Features.canListQueries ? interpreters : interpreters.filter(function(i) {
					return "tools" !== i.type
				}), interpreters = Features.showAdmin ? interpreters : interpreters.filter(function(i) {
					return "admin" !== i.type
				})
			}, Frames.prototype.interpreterFor = function(input) {
				var cmds, firstWord, i, intr, j, len, ref;
				for(null == input && (input = ""), intr = null, input = Utils.stripComments(input.trim()), firstWord = Utils.firstWord(input).toLowerCase(), ref = getFilteredInterpreters(), j = 0, len = ref.length; len > j; j++)
					if(i = ref[j], angular.isFunction(i.matches)) {
						if(i.matches(input)) return i
					} else if(cmds = i.matches, angular.isString(i.matches) && (cmds = [cmds]), angular.isArray(cmds) && cmds.indexOf(firstWord) >= 0) return i;
				return intr
			}, Frames.prototype.klass = Frame, Frames
		}(Collection), frames = new Frames(null, Frame)
	}], this
}]), angular.module("neo4jApp.animations", []).animation(".frame-in", ["$window", function($window) {
	return {
		enter: function(element, done) {
			var afterFirst;
			return element.css({
					position: "absolute",
					top: "-100px",
					opacity: 0
				}), afterFirst = function() {
					return element.css({
						position: "relative"
					}), element.animate({
						opacity: 1,
						top: 0,
						maxHeight: element.height()
					}, {
						duration: 400,
						easing: "easeInOutCubic",
						complete: function() {
							return element.css({
								maxHeight: 1e4
							}), done()
						}
					})
				}, element.animate({
					opacity: .01
				}, 200, function() {
					return setTimeout(afterFirst, 0)
				}),
				function() {}
		},
		leave: function(element, done) {
			return element.css({
					height: element.height()
				}), element.animate({
					opacity: 0,
					height: 0
				}, {
					duration: 400,
					easing: "easeInOutCubic",
					complete: done
				}),
				function() {}
		}
	}
}]).animation(".intro-in", ["$window", function($window) {
	return {
		enter: function(element, done) {
			return element.css({
				opacity: 0,
				top: 0,
				display: "block"
			}), element.animate({
				opacity: 1,
				top: 0
			}, {
				duration: 1600,
				easing: "easeInOutCubic",
				complete: done
			})
		},
		leave: function(element, done) {
			return element.animate({
				opacity: 0,
				top: 40
			}, {
				duration: 400,
				easing: "easeInOutCubic",
				complete: done
			})
		}
	}
}]).animation(".slide-down", ["$window", function($window) {
	return {
		enter: function(element, done) {
			return element.css({
					maxHeight: 0,
					display: "block"
				}), element.animate({
					maxHeight: 49
				}, {
					duration: 400,
					easing: "easeInOutCubic",
					complete: done
				}),
				function() {}
		},
		leave: function(element, done) {
			return element.animate({
					height: 0
				}, {
					duration: 400,
					easing: "easeInOutCubic",
					complete: done
				}),
				function() {}
		}
	}
}]), angular.module("neo4jApp.directives").directive("outputRaw", ["Settings", function(Settings) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var unbind;
			return unbind = scope.$watch(attrs.outputRaw, function(val) {
				var rest, str;
				if(val) return angular.isString(val) || (val = JSON.stringify(val, null, 2)), str = val.substring(0, Settings.maxRawSize), rest = val.substring(Settings.maxRawSize + 1), attrs.overrideSizeLimit && (str = val, rest = !1), rest && (rest = rest.split("\n")[0] || "", str += rest + "\n...\n<truncated output>\n\nPress download to see complete response"), element.text(str), unbind()
			})
		}
	}
}]), angular.module("neo4jApp.directives").factory("fullscreenService", [function() {
	var container, root;
	return root = angular.element("body"), container = angular.element('<div class="fullscreen-container"></div>'), container.hide().appendTo(root), {
		display: function(element) {
			return container.append(element).show()
		},
		hide: function() {
			return container.hide()
		}
	}
}]), angular.module("neo4jApp.directives").directive("fullscreen", ["fullscreenService", function(fullscreenService) {
	return {
		restrict: "A",
		controller: ["$scope", function($scope) {
			return $scope.toggleFullscreen = function(state) {
				return null == state && (state = !$scope.fullscreen), $scope.fullscreen = state
			}, $scope.isFullScreen = function() {
				return $scope.fullscreen
			}
		}],
		link: function(scope, element, attrs) {
			var parent;
			return parent = element.parent(), scope.fullscreen = !1, scope.$watch("fullscreen", function(val, oldVal) {
				return val !== oldVal ? (val ? fullscreenService.display(element) : (parent.append(element), fullscreenService.hide()), scope.$emit("layout.changed")) : void 0
			})
		}
	}
}]), angular.module("neo.exportable", ["neo.csv"]).service("exportService", ["$window", "Canvg", "Utils", function($window, Canvg, Utils) {
	return {
		download: function(filename, mime, data) {
			var blob;
			return navigator.userAgent.match(/Version\/[\d\.]+.*Safari/) ? (data = "object" == typeof data ? Utils.ua2text(data) : unescape(encodeURIComponent(data)), $window.open("data:" + mime + ";base64," + btoa(data)), !0) : (blob = new Blob([data], {
				type: mime
			}), $window.saveAs(blob, filename))
		},
		downloadWithDataURI: function(filename, dataURI) {
			var byteString, i, ia, j, mimeString, ref;
			for(byteString = null, byteString = dataURI.split(",")[0].indexOf("base64") >= 0 ? atob(dataURI.split(",")[1]) : unescape(dataURI.split(",")[1]), mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0], ia = new Uint8Array(byteString.length), i = j = 0, ref = byteString.length; ref >= 0 ? ref >= j : j >= ref; i = ref >= 0 ? ++j : --j) ia[i] = byteString.charCodeAt(i);
			return this.download(filename, mimeString, ia)
		},
		downloadPNGFromSVG: function(svgObj, filename) {
			var canvas, png, svgData;
			return svgData = (new XMLSerializer).serializeToString(svgObj.node()), svgData = svgData.replace(/&nbsp;/g, "&#160;"), canvas = document.createElement("canvas"), canvas.width = svgObj.attr("width"), canvas.height = svgObj.attr("height"), Canvg(canvas, svgData), png = canvas.toDataURL("image/png"), this.downloadWithDataURI(filename + ".png", png)
		}
	}
}]).directive("exportable", [function() {
	return {
		restrict: "A",
		controller: ["$scope", "CSV", "exportService", "BoltIntHelpers", function($scope, CSV, exportService, BoltIntHelpers) {
			return $scope.exportGraphSVG = function() {
				return $scope.$emit("frame.export.graph.svg"), !0
			}, $scope.exportPlanSVG = function() {
				return $scope.$emit("frame.export.plan.svg"), !0
			}, $scope.exportGraphPNG = function() {
				return $scope.$emit("frame.export.graph.png"), !0
			}, $scope.exportPlanPNG = function() {
				return $scope.$emit("frame.export.plan.png"), !0
			}, $scope.exportJSON = function(data) {
				return data ? (data = BoltIntHelpers.mapBoltIntsToInts(data), exportService.download("result.json", "application/json", JSON.stringify(data))) : void 0
			}, $scope.exportCSV = function(data) {
				var csv, j, len, ref, row;
				if(data) {
					for(csv = new CSV.Serializer, csv.columns(data.columns()), ref = data.rows(), j = 0, len = ref.length; len > j; j++) row = ref[j], csv.append(row);
					return exportService.download("export.csv", "text/csv;charset=utf-8", csv.output())
				}
			}, $scope.exportText = function(data) {
				return data ? exportService.download("result.txt", "text/plain", data) : void 0
			}, $scope.exportGraSS = function(data) {
				return exportService.download("graphstyle.grass", "text/plain", data)
			}, $scope.exportScript = function(data) {
				return exportService.download("script.cypher", "text/plain", data)
			}
		}]
	}
}]), angular.module("neo4jApp.directives").directive("article", ["$rootScope", "Editor", "Frame", function($rootScope, Editor, Frame) {
	return {
		restrict: "E",
		link: function(scope, element, attrs) {
			return element.on("click", ".runnable", function(e) {
				var code;
				return code = e.currentTarget.textContent || e.currentTarget.innerText, (null != code ? code.length : void 0) > 0 ? (Editor.setContent(code.trim()), angular.element(e.currentTarget).addClass("clicked"), $rootScope.$$phase ? void 0 : $rootScope.$apply()) : void 0
			})
		}
	}
}]), angular.module("neo4jApp.directives").directive("article", ["$rootScope", function($rootScope) {
	return {
		restrict: "E",
		link: function(scope, element, attrs) {
			return element.on("keyup", "input[value-for]", function(e) {
				var key;
				return key = e.currentTarget.attributes.getNamedItem("value-for").value, angular.element(".code span[value-key=" + key + "]").text(e.currentTarget.value), $rootScope.$$phase ? void 0 : $rootScope.$apply()
			})
		}
	}
}]), angular.module("neo4jApp.directives").directive("helpTopic", ["$rootScope", "Frame", "Settings", function($rootScope, Frame, Settings) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var command, topic;
			return topic = attrs.helpTopic, command = "help", topic ? element.on("click", function(e) {
				return e.preventDefault(), topic = topic.toLowerCase().trim().replace(/-/g, " "),
					Frame.create({
						input: "" + Settings.cmdchar + command + " " + topic
					}), $rootScope.$$phase ? void 0 : $rootScope.$apply()
			}) : void 0
		}
	}
}]), angular.module("neo4jApp.directives").directive("playTopic", ["$rootScope", "Frame", "Settings", function($rootScope, Frame, Settings) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var command, topic;
			return topic = attrs.playTopic, command = "play", topic ? element.on("click", function(e) {
				return e.preventDefault(), topic = topic.trim(), /^https?:\/\//i.test(topic) || (topic = topic.toLowerCase().replace("-", " ")), Frame.create({
					input: "" + Settings.cmdchar + command + " " + topic
				}), $rootScope.$$phase ? void 0 : $rootScope.$apply()
			}) : void 0
		}
	}
}]), angular.module("neo4jApp.directives").directive("execTopic", ["$rootScope", "Frame", "Settings", function($rootScope, Frame, Settings) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var topic;
			return(topic = attrs.execTopic) ? element.on("click", function(e) {
				return e.preventDefault(), topic = topic.toLowerCase().trim().replace("-", " "), Frame.create({
					input: "" + Settings.cmdchar + topic
				}), $rootScope.$$phase ? void 0 : $rootScope.$apply()
			}) : void 0
		}
	}
}]), angular.module("neo4jApp.directives").directive("userRoles", ["$rootScope", "ProtocolFactory", function($rootScope, ProtocolFactory) {
	return {
		restrict: "A",
		templateUrl: "views/partials/user-roles.html",
		scope: {
			user: "=ngModel"
		},
		link: function(scope) {
			return scope.selectedItem = null, scope.isAddingRole = !1, scope.listOfAllKnownRoles = [], scope.listOfAssignedRoles = function() {
				return scope.user.roles
			}, scope.listOfKnownRoles = function() {
				return scope.listOfAllKnownRoles.filter(function(role) {
					return !scope.user.roles.includes(role)
				})
			}, ProtocolFactory.utils().getRolesList().then(function(response) {
				return scope.listOfAllKnownRoles = response.sort()
			})["catch"](function(r) {}), scope.$on("admin.resetRoles", function(event) {
				return scope.hideRole()
			}), scope.hideRole = function() {
				return scope.isAddingRole = !1, scope.selectedItem = null
			}, scope.showRole = function() {
				return scope.isAddingRole = !0
			}, scope.appendRole = function() {
				return null != scope.selectedItem ? (scope.$emit("admin.addRoleFor", scope.user.username, scope.selectedItem), scope.hideRole()) : void 0
			}, scope.removeRole = function(role) {
				return scope.$emit("admin.removeRoleFor", scope.user.username, role)
			}
		}
	}
}]), angular.module("neo4jApp.directives").directive("noNgAnimate", ["$animate", function($animate) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			return $animate.enabled(!1, element)
		}
	}
}]), angular.module("neo4jApp").config(["localStorageServiceProvider", function(localStorageServiceProvider) {
	return localStorageServiceProvider.setPrefix("neo4j")
}]), angular.module("neo4jApp.controllers").controller("EditorCtrl", ["$scope", "Editor", "motdService", "Settings", "SyncService", function($scope, Editor, motdService, Settings, SyncService) {
	return $scope.editor = Editor, $scope.motd = motdService, $scope.settings = Settings, $scope.editorHasContent = !1, $scope.$watch("editor.content", function(val, val2) {
		return $scope.editorHasContent = !!val
	}), $scope.create = function() {
		return $scope.toggleDrawer("scripts", !0), Editor.createDocument()
	}, $scope.clone = function() {
		return $scope.toggleDrawer("scripts", !0), Editor.cloneDocument()
	}, $scope.star = function() {
		return Editor.document || $scope.toggleDrawer("scripts", !0), SyncService.fetchAndUpdate().then(function(_this) {
			return function(response) {
				return Editor.saveDocument()
			}
		}(this))
	}
}]);
var hasProp = {}.hasOwnProperty,
	indexOf = [].indexOf || function(item) {
		for(var i = 0, l = this.length; l > i; i++)
			if(i in this && this[i] === item) return i;
		return -1
	};
angular.module("neo4jApp.controllers").controller("SidebarCtrl", ["$scope", "Document", "Editor", "Frame", "Folder", "GraphStyle", "SyncService", "CurrentUser", "DefaultContentService", function($scope, Document, Editor, Frame, Folder, GraphStyle, SyncService, CurrentUser, DefaultContentService) {
	var addMissingFolderDocumentsToRoot, nestedFolderStructure, scopeApply;
	return scopeApply = function(fn) {
		return function() {
			return fn.apply($scope, arguments), $scope.$apply()
		}
	}, $scope.clearSingleClicked = 0, $scope.updateClearSingleClicked = function(val) {
		return $scope.clearSingleClicked = val
	}, $scope.signoutAndClearLocalStorage = function() {
		return CurrentUser.logout()
	}, $scope.clearLocalStorage = function() {
		return CurrentUser.clear(), $scope.updateClearSingleClicked(0)
	}, $scope.removeFolder = function(folder) {
		return confirm("Are you sure you want to delete the folder?") ? Folder.destroy(folder) : void 0
	}, $scope.removeDocument = function(doc) {
		var k, results, v;
		Document.destroy(doc), results = [];
		for(k in doc) hasProp.call(doc, k) && (v = doc[k], results.push(doc[k] = null));
		return results
	}, $scope.importDocument = function(content, name) {
		return /\.grass$/.test(name) ? GraphStyle.importGrass(content) : Document.create({
			content: content
		})
	}, $scope.playDocument = function(content) {
		return Frame.create({
			input: content
		})
	}, $scope.sortableOptions = {
		connectWith: ".sortable",
		placeholder: "sortable-placeholder",
		items: "li",
		cursor: "move",
		dropOnEmpty: !0,
		stop: function(e, ui) {
			var doc, folder, i, j, len, len1, ref, ref1;
			for(doc = ui.item.sortable.moved || ui.item.scope().document, folder = null != ui.item.folder ? ui.item.folder : doc.folder, ui.item.resort && ui.item.relocate && (doc.folder = folder, "root" === doc.folder && (doc.folder = !1)), ref = $scope.folders, i = 0, len = ref.length; len > i; i++)
				for(folder = ref[i], ref1 = folder.documents, j = 0, len1 = ref1.length; len1 > j; j++) doc = ref1[j], Document.remove(doc), Document.add(doc);
			Document.save()
		},
		update: function(e, ui) {
			return ui.item.resort = !0
		},
		receive: function(e, ui) {
			var folder;
			return ui.item.relocate = !0, folder = angular.element(e.target).scope().folder, ui.item.folder = null != folder ? folder.id : !1
		}
	}, addMissingFolderDocumentsToRoot = function(documents, folders) {
		return documents.filter(function(key) {
			var item, ref;
			return ref = key.folder, indexOf.call(function() {
				var i, len, results;
				for(results = [], i = 0, len = folders.length; len > i; i++) item = folders[i], results.push(item.id);
				return results
			}(), ref) < 0 && key.folder !== !1
		}).map(function(doc) {
			return doc.folder = "root", doc
		})
	}, nestedFolderStructure = function() {
		var doc, documents, folder, nested, noFolder;
		return nested = function() {
			var i, len, ref, results;
			for(ref = Folder.all(), results = [], i = 0, len = ref.length; len > i; i++) folder = ref[i], documents = function() {
				var j, len1, ref1, results1;
				for(ref1 = Document.where({
						folder: folder.id
					}), results1 = [], j = 0, len1 = ref1.length; len1 > j; j++) doc = ref1[j], results1.push(doc);
				return results1
			}(), folder.documents = documents, results.push(folder);
			return results
		}(), noFolder = Folder["new"]({
			id: "root"
		}), noFolder.documents = function() {
			var i, len, ref, results;
			for(ref = Document.where({
					folder: !1
				}), results = [], i = 0, len = ref.length; len > i; i++) doc = ref[i], results.push(doc);
			return results
		}(), noFolder.documents = noFolder.documents.concat(addMissingFolderDocumentsToRoot(Document.all(), Folder.all())), noFolder.documents.length < 1 || nested.push(noFolder), nested
	}, $scope.folders = nestedFolderStructure(), $scope.sampleScripts = DefaultContentService.loadDefaultIfEmpty(), $scope.run = function(doc) {
		return Editor.setContent(doc.content)
	}, $scope.haveSavedScripts = function() {
		return $scope.folders.length
	}, $scope.$on("LocalStorageModule.notification.setitem", function(evt, item) {
		var ref;
		if("documents" === (ref = item.key) || "folders" === ref) return Folder.fetch(), Document.fetch(), $scope.folders = nestedFolderStructure()
	}), $scope.editor = Editor, $scope.substituteToken = function(query, token) {
		var escapedToken;
		return escapedToken = token.match(/^[A-Za-z][A-Za-z0-9_]*$/) ? token : "`" + token + "`", query.replace(/<token>/g, escapedToken)
	}, $scope.folderService = Folder, $scope.syncService = SyncService
}]), angular.module("neo4jApp.services").service("Editor", ["Document", "Frame", "Settings", "HistoryService", "CypherParser", "motdService", "$timeout", function(Document, Frame, Settings, HistoryService, CypherParser, motdService, $timeout) {
	var Editor, editor, moveCursorToEndOfLine;
	return Editor = function() {
		function Editor() {
			this.history = HistoryService, this.content = "", this.document = null
		}
		return Editor.prototype.execScript = function(input, no_duplicates) {
			var frame, ref;
			if(null == no_duplicates && (no_duplicates = !1), this.showMessage = !1, no_duplicates) {
				if(frame = Frame.createOne({
						input: input
					}), !frame) return
			} else frame = Frame.create({
				input: input
			});
			return frame || "" === input ? (Settings.filemode && (null != (ref = this.document) ? ref.id : void 0) || this.addToHistory(input), this.maximize(!1), this.document = null) : this.setMessage("<b>Unrecognized:</b> <i>" + input + "</i>.", "error")
		}, Editor.prototype.execCurrent = function() {
			return this.execScript(this.content)
		}, Editor.prototype.hasChanged = function() {
			var ref;
			return(null != (ref = this.document) ? ref.content : void 0) && this.document.content !== this.content
		}, Editor.prototype.historyNext = function() {
			var item;
			return this.history.setBuffer(this.content), item = this.history.next(), this.setContent(item)
		}, Editor.prototype.historyPrev = function() {
			var item;
			return this.history.setBuffer(this.content), item = this.history.prev(), this.setContent(item)
		}, Editor.prototype.historySet = function(idx) {
			var item;
			return item = this.history.get(idx), this.setContent(item)
		}, Editor.prototype.addToHistory = function(input) {
			var item;
			return item = this.history.add(input), this.content = item
		}, Editor.prototype.loadDocument = function(id) {
			var doc;
			return(doc = Document.get(id)) ? (this.content = doc.content, this.document = doc) : void 0
		}, Editor.prototype.maximize = function(state) {
			return null == state && (state = !this.maximized), this.maximized = !!state
		}, Editor.prototype.saveDocument = function() {
			var input, ref, ref1;
			return(input = this.content.trim()) ? ((null != (ref = this.document) ? ref.id : void 0) && (this.document = Document.get(this.document.id)), (null != (ref1 = this.document) ? ref1.id : void 0) ? (this.document.content = input, Document.save()) : this.document = Document.create({
				content: this.content
			})) : void 0
		}, Editor.prototype.createDocument = function(content, folder) {
			return null == content && (content = "// Untitled script\n"), this.content = content, this.document = Document.create({
				content: content,
				folder: folder
			})
		}, Editor.prototype.cloneDocument = function() {
			var folder, ref;
			return folder = null != (ref = this.document) ? ref.folder : void 0, this.createDocument(this.content, folder)
		}, Editor.prototype.setContent = function(content) {
			return null == content && (content = ""), $timeout(function(_this) {
				return function() {
					return _this.content = content
				}
			}(this), 0), this.document = null
		}, Editor.prototype.setMessage = function(message, type) {
			return null == type && (type = "info"), this.showMessage = !0, this.errorCode = type, this.errorMessage = message
		}, Editor.prototype.checkCypherContent = function(cm) {
			var cb, input;
			return cb = function(err, res) {
				var i, item, len, ref, ref1, results;
				if(cm.clearGutter("cypher-hints"), !err && (null != (ref = res.notifications) ? ref.length : void 0)) {
					for(ref1 = res.notifications, results = [], i = 0, len = ref1.length; len > i; i++) item = ref1[i], item.position || (item.position = {
						line: 1
					}), results.push(function(item) {
						return cm.setGutterMarker(item.position.line - 1, "cypher-hints", function() {
							var r;
							return r = document.createElement("div"), r.style.color = "#822", r.innerHTML = "<i class='fa fa-exclamation-triangle gutter-warning'></i>", r.title = item.title + "\n" + item.description, r.onclick = function() {
								return Frame.create({
									input: "EXPLAIN " + input,
									showCypherNotification: !0
								})
							}, r
						}())
					}(item));
					return results
				}
			}, input = cm.getValue(), !input || input && input[0] !== Settings.cmdchar ? CypherParser.runHints(cm, cb) : void 0
		}, Editor
	}(), moveCursorToEndOfLine = function(cm) {
		return $timeout(function() {
			return cm.setCursor(cm.lineCount(), 0)
		}, 0)
	}, editor = new Editor, CodeMirror.commands.handleEnter = function(cm) {
		return 1 !== cm.lineCount() || editor.document ? CodeMirror.commands.newlineAndIndent(cm) : editor.execCurrent()
	}, CodeMirror.commands.handleUp = function(cm) {
		return 1 === cm.lineCount() ? (editor.historyPrev(), moveCursorToEndOfLine(cm)) : CodeMirror.commands.goLineUp(cm)
	}, CodeMirror.commands.handleDown = function(cm) {
		return 1 === cm.lineCount() ? (editor.historyNext(), moveCursorToEndOfLine(cm)) : CodeMirror.commands.goLineDown(cm)
	}, CodeMirror.commands.historyPrev = function(cm) {
		return editor.historyPrev(), moveCursorToEndOfLine(cm)
	}, CodeMirror.commands.historyNext = function(cm) {
		return editor.historyNext(), moveCursorToEndOfLine(cm)
	}, CodeMirror.commands.execCurrent = function(cm) {
		return editor.execCurrent()
	}, CodeMirror.keyMap["default"].Enter = "handleEnter", CodeMirror.keyMap["default"]["Shift-Enter"] = "newlineAndIndent", CodeMirror.keyMap["default"]["Cmd-Enter"] = "execCurrent", CodeMirror.keyMap["default"]["Ctrl-Enter"] = "execCurrent", CodeMirror.keyMap["default"].Up = "handleUp", CodeMirror.keyMap["default"].Down = "handleDown", CodeMirror.keyMap["default"]["Cmd-Up"] = "historyPrev", CodeMirror.keyMap["default"]["Ctrl-Up"] = "historyPrev", CodeMirror.keyMap["default"]["Cmd-Down"] = "historyNext", CodeMirror.keyMap["default"]["Ctrl-Down"] = "historyNext", editor
}]), angular.module("neo4jApp.filters").filter("commandError", [function() {
	return function(input) {
		return ":" === (null != input ? input.charAt(0) : void 0) ? "Not-a-command" : "Unrecognized"
	}
}]), angular.module("neo4jApp.directives").directive("clickToCode", ["Editor", function(Editor) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var applyAction, code;
			return code = scope.$eval(attrs.clickToCode), element.click(function(e) {
				return applyAction(Editor.setContent)
			}), "true" === attrs.dblclickToExec && element.dblclick(function(e) {
				return applyAction(Editor.execScript)
			}), applyAction = function(fn) {
				return(null != code ? code.length : void 0) ? (fn.call(Editor, code.trim()), scope.$apply()) : void 0
			}
		}
	}
}]), angular.module("neo4jApp.directives").directive("overflowWithToggle", ["$window", "$timeout", function($window, $timeout) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var onResize;
			return onResize = function() {
				var growing, oneline;
				return growing = element.parent().find("ul").height(), oneline = parseInt(element.css("height")), 1.1 * oneline >= growing ? element.hide() : element.show()
			}, $timeout(function() {
				return onResize()
			}, 0), scope.$watch(function() {
				return element.parent().width()
			}, function(old, newv) {
				return onResize()
			}), "updateUi" in attrs ? scope.$watch(attrs.updateUi, function(new_val, old_val) {
				return new_val ? onResize() : void 0
			}) : void 0
		}
	}
}]), angular.module("neo4jApp.directives").directive("href", ["Editor", function(Editor) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			return attrs.href.match(/^http/) ? element.attr("target", "_blank") : void 0
		}
	}
}]), angular.module("neo4jApp.directives").directive("frameStream", ["Frame", "Editor", "motdService", function(Frame, Editor, motdService) {
	return {
		restrict: "A",
		priority: 0,
		templateUrl: "views/partials/stream.html",
		replace: !1,
		transclude: !1,
		scope: !1,
		controller: ["$scope", "Frame", "Editor", "motdService", function($scope, Frame, Editor, motdService) {
			return $scope.frames = Frame, $scope.motd = motdService, $scope.editor = Editor
		}]
	}
}]);
var RssFeedService;
RssFeedService = function() {
	function RssFeedService($http) {
		RssFeedService.prototype.get = function() {
			var apiUrl, format, username;
			return format = "json", username = "neo4jmotd", apiUrl = (document.location.protocol || "http:") + "//assets.neo4j.org/v2/" + format + "/" + username + "?callback=JSON_CALLBACK&count=10?plain=true", $http.jsonp(apiUrl).error(function(results) {
				return results
			}).then(function(response) {
				return response.data ? response.data : []
			})
		}
	}
	return RssFeedService
}(), angular.module("neo4jApp.services").service("rssFeedService", ["$http", RssFeedService]);
var MotdFeedParser;
MotdFeedParser = function() {
	function MotdFeedParser() {}
	return MotdFeedParser.prototype.explodeTags = function(tags) {
		var i, len, out, pair, parts;
		if(out = {}, !tags) return out;
		for(i = 0, len = tags.length; len > i; i++) pair = tags[i], parts = pair.split("="), out[parts[0]] = parts[1];
		return out
	}, MotdFeedParser.prototype.getFirstMatch = function(feed, match_filter) {
		var items, that;
		return that = this, items = feed.filter(function(x) {
			var k, tags, v;
			if(!Object.keys(match_filter).length) return !0;
			tags = that.explodeTags(x.t);
			for(k in match_filter)
				if(v = match_filter[k], !v(tags[k])) return !1;
			return !0
		}), items[0] || {}
	}, MotdFeedParser
}(), angular.module("neo4jApp.services").service("motdFeedParser", [MotdFeedParser]), angular.module("neo4jApp.services").service("CypherGraphModel", function() {
	var malformed;
	return malformed = function() {
		return new Error("Malformed graph: must add nodes before relationships that connect them")
	}, this.convertNode = function() {
		return function(node) {
			return node.deleted ? !1 : new neo.models.Node(node.id, node.labels, node.properties)
		}
	}, this.convertRelationship = function(graph) {
		return function(relationship) {
			var source, target;
			return relationship.deleted ? !1 : (source = graph.findNode(relationship.startNode) || function() {
				throw malformed()
			}(), target = graph.findNode(relationship.endNode) || function() {
				throw malformed()
			}(), new neo.models.Relationship(relationship.id, source, target, relationship.type, relationship.properties))
		}
	}, this.filterRelationshipsOnNodes = function(relationships, nodes) {
		var nodeIDs;
		return nodeIDs = nodes.map(function(n) {
			return n.id
		}), relationships.filter(function(rel) {
			return nodeIDs.indexOf(rel.startNode) > -1 && nodeIDs.indexOf(rel.endNode) > -1
		})
	}, this
});
var bind = function(fn, me) {
	return function() {
		return fn.apply(me, arguments)
	}
};
angular.module("neo4jApp.services").service("AuthService", ["ConnectionStatusService", "ProtocolFactory", "Settings", "$q", function(ConnectionStatusService, ProtocolFactory, Settings, $q) {
	var AuthService, clearConnectionAuthData, setConnectionAuthData;
	return setConnectionAuthData = function(username, password, emitChange) {
		return ConnectionStatusService.setConnectionAuthData(username, password, emitChange)
	}, clearConnectionAuthData = function() {
		return ConnectionStatusService.clearConnectionAuthData()
	}, new(AuthService = function() {
		function AuthService() {
			this.authenticate = bind(this.authenticate, this)
		}
		return AuthService.prototype.authenticate = function(username, password) {
			var promise, that, withoutCredentials;
			return that = this, this.current_password = password, setConnectionAuthData(username, password), promise = this.makeRequest(withoutCredentials = !1), promise.then(function(r) {
				return ConnectionStatusService.setConnected(!0), r
			}, function(r) {
				return 403 !== r.status && that.forget(), r
			}), promise
		}, AuthService.prototype.authorizationRequired = function() {
			var p, q, withoutCredentials;
			return q = $q.defer(), p = this.makeRequest(withoutCredentials = !0), p.then(function(r) {
				return clearConnectionAuthData(), ConnectionStatusService.setAuthorizationRequired(!1), ConnectionStatusService.setConnected(!0), q.resolve(r)
			}, function(r) {
				return ConnectionStatusService.setAuthorizationRequired(!0), q.reject(r)
			}), q.promise
		}, AuthService.prototype.hasValidAuthorization = function(retainConnection) {
			var q, that;
			return null == retainConnection && (retainConnection = !1), that = this, q = $q.defer(), ConnectionStatusService.connectionAuthData().length > 0 ? that.isConnected(retainConnection).then(function(r) {
				return ConnectionStatusService.setAuthorizationRequired(!1), q.resolve(r)
			}, function(r) {
				return that.authorizationRequired().then(function(r) {
					return ConnectionStatusService.setConnected(!0), q.resolve(r)
				}, function(r) {
					return ConnectionStatusService.setConnected(!1), q.reject(r)
				})
			}) : that.authorizationRequired().then(function(r) {
				return ConnectionStatusService.setConnected(!0), q.resolve(r)
			}, function(r) {
				return ConnectionStatusService.setConnected(!1), q.reject(r)
			}), q.promise
		}, AuthService.prototype.isConnected = function(retainConnection) {
			var p, q, that, withoutCredentials;
			return null == retainConnection && (retainConnection = !1), that = this, q = $q.defer(), p = this.makeRequest(withoutCredentials = !1), p.then(function(rr) {
				return ConnectionStatusService.setConnected(!0), q.resolve(rr)
			}, function(rr) {
				return 401 === rr.status && that.forget(), q.reject(rr)
			}), q.promise
		}, AuthService.prototype.makeRequest = function(withoutCredentials) {
			return null == withoutCredentials && (withoutCredentials = !1), ProtocolFactory.utils().makeRequest(withoutCredentials)
		}, AuthService.prototype.forget = function() {
			return this.getCurrentUser() && clearConnectionAuthData(), ConnectionStatusService.setConnected(!1), ProtocolFactory.utils().clearConnection()
		}, AuthService.prototype.setNewPassword = function(old_passwd, new_passwd) {
			var q, that;
			return that = this, q = $q.defer(), setConnectionAuthData(ConnectionStatusService.connectedAsUser(), old_passwd), ProtocolFactory.utils().setNewPassword(ConnectionStatusService.connectedAsUser(), new_passwd).then(function(r) {
				var emitChange;
				return setConnectionAuthData(ConnectionStatusService.connectedAsUser(), new_passwd, emitChange = !0), q.resolve(r)
			}, function(r) {
				return 401 === r.status && that.forget(), q.reject(r)
			}), q.promise
		}, AuthService.prototype.getCurrentUser = function() {
			return ConnectionStatusService.connectedAsUser()
		}, AuthService
	}())
}]), angular.module("neo4jApp.services").service("AuthDataService", ["localStorageService", "$base64", function(localStorageService, $base64) {
	var cached_authorization_data, cached_credential_timeout, cached_last_user, cached_retain_connection_credentials;
	return cached_authorization_data = localStorageService.get("authorization_data") || "", cached_last_user = localStorageService.get("last_user") || "", cached_retain_connection_credentials = null, cached_credential_timeout = null, this.setAuthData = function(authdata) {
		return authdata ? this.setEncodedAuthData($base64.encode(authdata)) : void 0
	}, this.setEncodedAuthData = function(encoded) {
		return encoded ? (cached_authorization_data = encoded, this.getPolicies().retainConnectionCredentials !== !1 ? localStorageService.set("authorization_data", encoded) : void 0) : void 0
	}, this.persistCachedAuthData = function() {
		if(this.getPolicies().retainConnectionCredentials !== !1) {
			if(cached_authorization_data === localStorageService.get("authorization_data")) return;
			return localStorageService.set("authorization_data", cached_authorization_data)
		}
	}, this.clearAuthData = function() {
		return localStorageService.remove("authorization_data"), cached_authorization_data = null
	}, this.clearPersistentAuthData = function() {
		return localStorageService.remove("authorization_data")
	}, this.getAuthData = function() {
		return cached_authorization_data || localStorageService.get("authorization_data") || ""
	}, this.getPlainAuthData = function() {
		var data;
		return data = this.getAuthData(), data ? $base64.decode(data) : ""
	}, this.setLastUser = function(lastUser) {
		return lastUser ? this.setEncodedLastUser($base64.encode(lastUser)) : void 0
	}, this.setEncodedLastUser = function(encoded) {
		return encoded ? (cached_last_user = encoded, this.getPolicies().retainConnectionCredentials !== !1 ? localStorageService.set("last_user", encoded) : void 0) : void 0
	}, this.persistCachedLastUser = function() {
		if(this.getPolicies().retainConnectionCredentials !== !1) {
			if(cached_last_user === localStorageService.get("last_user")) return;
			return localStorageService.set("last_user", cached_last_user)
		}
	}, this.clearLastUser = function() {
		return localStorageService.remove("last_user"), cached_last_user = null
	}, this.clearPersistentLastUser = function() {
		return localStorageService.remove("last_user")
	}, this.getLastUser = function() {
		return cached_last_user || localStorageService.get("last_user") || ""
	}, this.getPlainLastUser = function() {
		var data;
		return data = this.getLastUser(), data ? $base64.decode(data) : ""
	}, this.setStoreCredentials = function(retainConnectionCredentials) {
		return cached_retain_connection_credentials = retainConnectionCredentials
	}, this.setCredentialTimeout = function(credentialTimeout) {
		return cached_credential_timeout = credentialTimeout
	}, this.getPolicies = function() {
		return {
			retainConnectionCredentials: cached_retain_connection_credentials,
			credentialTimeout: cached_credential_timeout
		}
	}, this.clearPolicies = function() {
		return cached_retain_connection_credentials = null, cached_credential_timeout = null
	}, this
}]), angular.module("neo4jApp.controllers").controller("AuthCtrl", ["$rootScope", "$scope", "AuthService", "ConnectionStatusService", "Frame", "CurrentUser", "Settings", "Utils", "$timeout", function($rootScope, $scope, AuthService, ConnectionStatusService, Frame, CurrentUser, Settings, Utils, $timeout) {
	var connectIfNoAuthorizationRequired, setPolicyMessage;
	return $scope.username = ConnectionStatusService.lastConnectedAsUser() || ConnectionStatusService.connectedAsUser() || "neo4j", $scope.password = "", $scope.current_password = "", $scope.failed_connection_attempts = 0, $scope.connection_summary = ConnectionStatusService.getConnectionStatusSummary(), $scope.static_user = $scope.connection_summary.user, $scope.static_host = Utils.getServerHostname(Settings), $scope.static_is_authenticated = $scope.connection_summary.is_connected, $scope.policy_message = "", $scope.CurrentUser = CurrentUser, connectIfNoAuthorizationRequired = function() {
		return AuthService.authorizationRequired().then(function() {
			return $scope.static_user = ConnectionStatusService.connectedAsUser(), $scope.static_is_authenticated = ConnectionStatusService.isConnected()
		})
	}, setPolicyMessage = function() {
		var _connection_summary, msg;
		if($scope.static_is_authenticated) return _connection_summary = ConnectionStatusService.getConnectionStatusSummary(), null === _connection_summary.credential_timeout ? void $timeout(function() {
			return setPolicyMessage()
		}, 1e3) : (msg = "", msg += _connection_summary.retain_connection_credentials ? "Connection credentials are stored in your web browser" : "Connection credentials are not stored in your web browser", msg += _connection_summary.credential_timeout > 0 ? " and your credential timeout when idle is " + _connection_summary.credential_timeout + " seconds." : ".", $scope.$evalAsync(function() {
			return $scope.policy_message = msg
		}))
	}, $scope.authenticate = function() {
		return $scope.frame.resetError(), $scope.password.length || $scope.frame.addErrorText("You have to enter a password. "), $scope.username.length || $scope.frame.addErrorText("You have to enter a username. "), $scope.frame.getDetailedErrorText().length ? void 0 : AuthService.authenticate($scope.username, $scope.password).then(function(r) {
			return $scope.frame.resetError(), $scope.connection_summary = ConnectionStatusService.getConnectionStatusSummary(), $scope.static_user = $scope.connection_summary.user, $scope.static_is_authenticated = $scope.connection_summary.is_connected, $scope.static_host = Utils.getServerHostname(Settings), setPolicyMessage(), $scope.focusEditor()
		}, function(r) {
			var ref;
			return 403 === r.status && (null != (ref = r.data.password_change) ? ref.length : void 0) ? ($scope.current_password = $scope.password, $scope.password_change_required = !0) : ($scope.failed_connection_attempts = $scope.failed_connection_attempts + 1, $scope.frame.setError(r))
		})
	}, $scope.defaultPasswordChanged = function() {
		return AuthService.hasValidAuthorization().then(function() {
			return $scope.password_change_required = !1, $scope.static_user = ConnectionStatusService.connectedAsUser(), $scope.static_is_authenticated = ConnectionStatusService.isConnected()
		})
	}, setPolicyMessage(), ConnectionStatusService.isConnected() || connectIfNoAuthorizationRequired(), $scope.clusterRole = $rootScope.neo4j.clusterRole
}]), angular.module("neo4jApp.controllers").controller("DisconnectCtrl", ["$rootScope", "$scope", "AuthService", "ConnectionStatusService", function($rootScope, $scope, AuthService, ConnectionStatusService) {
	return AuthService.forget(), $rootScope.user = !1, $scope.static_user = ConnectionStatusService.connectedAsUser(), $scope.static_is_authenticated = ConnectionStatusService.isConnected(), $scope.focusEditor()
}]), angular.module("neo4jApp.controllers").controller("ChangePasswordCtrl", ["$scope", "AuthService", "ConnectionStatusService", "Frame", "Settings", function($scope, AuthService, ConnectionStatusService, Frame, Settings) {
	return $scope.new_password = "", $scope.new_password2 = "", $scope.current_password = "", $scope.password_changed = !1, $scope.$parent.frame.resetError(), $scope.static_user = ConnectionStatusService.connectedAsUser(), $scope.static_is_authenticated = ConnectionStatusService.isConnected(), $scope.showCurrentPasswordField = function() {
		return !$scope.$parent.password_change_required
	}, $scope.setNewPassword = function() {
		var is_authenticated;
		return is_authenticated = ConnectionStatusService.isConnected(), $scope.$parent.frame.resetError(), $scope.$parent.password_change_required && ($scope.current_password = $scope.$parent.current_password), $scope.static_user = ConnectionStatusService.connectedAsUser(), $scope.current_password.length || $scope.$parent.frame.addErrorText("You have to enter your current password. "), $scope.new_password.length || $scope.$parent.frame.addErrorText("You have to enter a new password. "), $scope.new_password !== $scope.new_password2 && $scope.$parent.frame.addErrorText("The new passwords mismatch, try again. "), $scope.$parent.frame.getDetailedErrorText().length ? void 0 : AuthService.setNewPassword($scope.current_password, $scope.new_password).then(function() {
			return is_authenticated || $scope.$parent.defaultPasswordChanged(), $scope.password_changed = !0, $scope.$parent.frame.resetError(), $scope.focusEditor()
		}, function(r) {
			return $scope.$parent.frame.setError(r)
		})
	}
}]), angular.module("neo4jApp.services").factory("HttpInterceptor", ["AuthDataService", "$q", "ConnectionStatusService", function(AuthDataService, $q, ConnectionStatusService) {
	var interceptor;
	return interceptor = {
		request: function(config) {
			var header, isLocalRequest, url;
			return config.headers["X-Ajax-Browser-Auth"] = !0, isLocalRequest = !0, /^https?:/.test(config.url) && (url = document.location.origin || window.location.protocol + "//" + window.location.host, config.url.indexOf(url) < 0 && (isLocalRequest = !1)), !config.skipAuthHeader && isLocalRequest || config.addAuthHeader ? (header = AuthDataService.getAuthData(), header && (config.headers.Authorization = "Basic " + header), config) : config
		},
		responseError: function(response) {
			return 401 === response.status && (ConnectionStatusService.setConnected(!1), ConnectionStatusService.clearConnectionAuthData()), $q.reject(response)
		}
	}
}]), angular.module("neo4jApp.services").config(["$httpProvider", function($httpProvider) {
	return $httpProvider.interceptors.push("HttpInterceptor")
}]);
var hasProp = {}.hasOwnProperty;
window.neo = window.neo || {}, neo.models = {}, neo.renderers = {
	menu: [],
	node: [],
	relationship: []
}, neo.utils = {
	copy: function(src) {
		return JSON.parse(JSON.stringify(src))
	},
	extend: function(dest, src) {
		var k, v;
		if(neo.utils.isObject(dest) || !neo.utils.isObject(src)) {
			for(k in src) hasProp.call(src, k) && (v = src[k], dest[k] = v);
			return dest
		}
	},
	isArray: Array.isArray || function(obj) {
		return "[object Array]" === Object.prototype.toString.call(obj)
	},
	isObject: function(obj) {
		return Object(obj) === obj
	}
}, neo.collision = function() {
	var collide, collision;
	return collision = {}, collide = function(node) {
		var nx1, nx2, ny1, ny2, r;
		return r = node.radius + 10, nx1 = node.x - r, nx2 = node.x + r, ny1 = node.y - r, ny2 = node.y + r,
			function(quad, x1, y1, x2, y2) {
				var l, x, y;
				return quad.point && quad.point !== node && (x = node.x - quad.point.x, y = node.y - quad.point.y, l = Math.sqrt(x * x + y * y), r = node.radius + 10 + quad.point.radius), r > l && (l = (l - r) / l * .5, node.x -= x *= l, node.y -= y *= l, quad.point.x += x, quad.point.y += y), x1 > nx2 || nx1 > x2 || y1 > ny2 || ny1 > y2
			}
	}, collision.avoidOverlap = function(nodes) {
		var i, len, n, q, results;
		for(q = d3.geom.quadtree(nodes), results = [], i = 0, len = nodes.length; len > i; i++) n = nodes[i], results.push(q.visit(collide(n)));
		return results
	}, collision
}();
var bind = function(fn, me) {
	return function() {
		return fn.apply(me, arguments)
	}
};
neo.models.Graph = function() {
	function Graph() {
		this.findAllRelationshipToNode = bind(this.findAllRelationshipToNode, this), this.findRelationship = bind(this.findRelationship, this), this.findNodeNeighbourIds = bind(this.findNodeNeighbourIds, this), this.findNode = bind(this.findNode, this), this.pruneInternalRelationships = bind(this.pruneInternalRelationships, this), this.addInternalRelationships = bind(this.addInternalRelationships, this), this.addRelationships = bind(this.addRelationships, this), this.removeConnectedRelationships = bind(this.removeConnectedRelationships, this), this.updateNode = bind(this.updateNode, this), this.removeNode = bind(this.removeNode, this), this.addNodes = bind(this.addNodes, this), this.nodeMap = {}, this._nodes = [], this.relationshipMap = {}, this._relationships = []
	}
	return Graph.prototype.nodes = function() {
		return this._nodes
	}, Graph.prototype.relationships = function() {
		return this._relationships
	}, Graph.prototype.groupedRelationships = function() {
		var NodePair, groups, i, ignored, len, nodePair, pair, ref, ref1, relationship, results;
		for(NodePair = function() {
				function NodePair(node1, node2) {
					this.relationships = [], node1.id < node2.id ? (this.nodeA = node1, this.nodeB = node2) : (this.nodeA = node2, this.nodeB = node1)
				}
				return NodePair.prototype.isLoop = function() {
					return this.nodeA === this.nodeB
				}, NodePair.prototype.toString = function() {
					return this.nodeA.id + ":" + this.nodeB.id
				}, NodePair
			}(), groups = {}, ref = this._relationships, i = 0, len = ref.length; len > i; i++) relationship = ref[i], nodePair = new NodePair(relationship.source, relationship.target), nodePair = null != (ref1 = groups[nodePair]) ? ref1 : nodePair, nodePair.relationships.push(relationship), groups[nodePair] = nodePair;
		results = [];
		for(ignored in groups) pair = groups[ignored], results.push(pair);
		return results
	}, Graph.prototype.addNodes = function(nodes) {
		var i, len, node;
		for(i = 0, len = nodes.length; len > i; i++) node = nodes[i], null == this.findNode(node.id) && (this.nodeMap[node.id] = node, this._nodes.push(node));
		return this
	}, Graph.prototype.removeNode = function(node) {
		return null != this.findNode(node.id) && (delete this.nodeMap[node.id], this._nodes.splice(this._nodes.indexOf(node), 1)), this
	}, Graph.prototype.updateNode = function(node) {
		return null != this.findNode(node.id) && (this.removeNode(node), node.expanded = !1, node.minified = !0, this.addNodes([node])), this
	}, Graph.prototype.removeConnectedRelationships = function(node) {
		var i, len, r, ref;
		for(ref = this.findAllRelationshipToNode(node), i = 0, len = ref.length; len > i; i++) r = ref[i], this.updateNode(r.source), this.updateNode(r.target), this._relationships.splice(this._relationships.indexOf(r), 1), delete this.relationshipMap[r.id];
		return this
	}, Graph.prototype.addRelationships = function(relationships) {
		var existingRelationship, i, len, relationship;
		for(i = 0, len = relationships.length; len > i; i++) relationship = relationships[i], existingRelationship = this.findRelationship(relationship.id), null != existingRelationship ? existingRelationship.internal = !1 : (relationship.internal = !1, this.relationshipMap[relationship.id] = relationship, this._relationships.push(relationship));
		return this
	}, Graph.prototype.addInternalRelationships = function(relationships) {
		var i, len, relationship;
		for(i = 0, len = relationships.length; len > i; i++) relationship = relationships[i], relationship.internal = !0, null == this.findRelationship(relationship.id) && (this.relationshipMap[relationship.id] = relationship, this._relationships.push(relationship));
		return this
	}, Graph.prototype.pruneInternalRelationships = function() {
		var relationships;
		return relationships = this._relationships.filter(function(relationship) {
			return !relationship.internal
		}), this.relationshipMap = {}, this._relationships = [], this.addRelationships(relationships)
	}, Graph.prototype.findNode = function(id) {
		return this.nodeMap[id]
	}, Graph.prototype.findNodeNeighbourIds = function(id) {
		return this._relationships.filter(function(relationship) {
			return relationship.source.id === id || relationship.target.id === id
		}).map(function(relationship) {
			return relationship.target.id === id ? relationship.source.id : relationship.target.id
		})
	}, Graph.prototype.findRelationship = function(id) {
		return this.relationshipMap[id]
	}, Graph.prototype.findAllRelationshipToNode = function(node) {
		return this._relationships.filter(function(relationship) {
			return relationship.source.id === node.id || relationship.target.id === node.id
		})
	}, Graph
}();
var NeoD3Geometry;
NeoD3Geometry = function() {
	function NeoD3Geometry(style1) {
		this.style = style1, this.relationshipRouting = new neo.utils.pairwiseArcsRelationshipRouting(this.style)
	}
	var addShortenedNextWord, fitCaptionIntoCircle, noEmptyLines, square;
	return square = function(distance) {
		return distance * distance
	}, addShortenedNextWord = function(line, word, measure) {
		var results;
		for(results = []; !(word.length <= 2);) {
			if(word = word.substr(0, word.length - 2) + "\u2026", measure(word) < line.remainingWidth) {
				line.text += " " + word;
				break
			}
			results.push(void 0)
		}
		return results
	}, noEmptyLines = function(lines) {
		var i, len, line;
		for(i = 0, len = lines.length; len > i; i++)
			if(line = lines[i], 0 === line.text.length) return !1;
		return !0
	}, fitCaptionIntoCircle = function(node, style) {
		var candidateLines, candidateWords, captionText, consumedWords, emptyLine, fitOnFixedNumberOfLines, fontFamily, fontSize, i, lineCount, lineHeight, lines, maxLines, measure, ref, ref1, ref2, template, words;
		for(template = style.forNode(node).get("caption"), captionText = style.interpolate(template, node), fontFamily = "sans-serif", fontSize = parseFloat(style.forNode(node).get("font-size")), lineHeight = fontSize, measure = function(text) {
				return neo.utils.measureText(text, fontFamily, fontSize)
			}, words = captionText.split(" "), emptyLine = function(lineCount, iLine) {
				var baseline, constainingHeight, lineWidth;
				return baseline = (1 + iLine - lineCount / 2) * lineHeight, style.forNode(node).get("icon-code") && (baseline += node.radius / 2), constainingHeight = lineCount / 2 > iLine ? baseline - lineHeight : baseline, lineWidth = 2 * Math.sqrt(square(node.radius) - square(constainingHeight)), {
					node: node,
					text: "",
					baseline: baseline,
					remainingWidth: lineWidth
				}
			}, fitOnFixedNumberOfLines = function(lineCount) {
				var i, iLine, iWord, line, lines, ref;
				for(lines = [], iWord = 0, iLine = i = 0, ref = lineCount - 1; ref >= 0 ? ref >= i : i >= ref; iLine = ref >= 0 ? ++i : --i) {
					for(line = emptyLine(lineCount, iLine); iWord < words.length && measure(" " + words[iWord]) < line.remainingWidth;) line.text += " " + words[iWord], line.remainingWidth -= measure(" " + words[iWord]), iWord++;
					lines.push(line)
				}
				return iWord < words.length && addShortenedNextWord(lines[lineCount - 1], words[iWord], measure), [lines, iWord]
			}, consumedWords = 0, maxLines = 2 * node.radius / fontSize, lines = [emptyLine(1, 0)], lineCount = i = 1, ref = maxLines; ref >= 1 ? ref >= i : i >= ref; lineCount = ref >= 1 ? ++i : --i)
			if(ref1 = fitOnFixedNumberOfLines(lineCount), candidateLines = ref1[0], candidateWords = ref1[1], noEmptyLines(candidateLines) && (ref2 = [candidateLines, candidateWords], lines = ref2[0], consumedWords = ref2[1]), consumedWords >= words.length) return lines;
		return lines
	}, NeoD3Geometry.prototype.formatNodeCaptions = function(nodes) {
		var i, len, node, results;
		for(results = [], i = 0, len = nodes.length; len > i; i++) node = nodes[i], results.push(node.caption = fitCaptionIntoCircle(node, this.style));
		return results
	}, NeoD3Geometry.prototype.formatRelationshipCaptions = function(relationships) {
		var i, len, relationship, results, template;
		for(results = [], i = 0, len = relationships.length; len > i; i++) relationship = relationships[i], template = this.style.forRelationship(relationship).get("caption"), results.push(relationship.caption = this.style.interpolate(template, relationship));
		return results
	}, NeoD3Geometry.prototype.setNodeRadii = function(nodes) {
		var i, len, node, results;
		for(results = [], i = 0, len = nodes.length; len > i; i++) node = nodes[i], results.push(node.radius = parseFloat(this.style.forNode(node).get("diameter")) / 2);
		return results
	}, NeoD3Geometry.prototype.onGraphChange = function(graph) {
		return this.setNodeRadii(graph.nodes()), this.formatNodeCaptions(graph.nodes()), this.formatRelationshipCaptions(graph.relationships()), this.relationshipRouting.measureRelationshipCaptions(graph.relationships())
	}, NeoD3Geometry.prototype.onTick = function(graph) {
		return this.relationshipRouting.layoutRelationships(graph)
	}, NeoD3Geometry
}();
var slice = [].slice;
neo.graphView = function() {
	function graphView(element, measureSize, graph, style) {
		var callbacks, layout;
		this.graph = graph, this.style = style, layout = neo.layout.force(), this.viz = neo.viz(element, measureSize, this.graph, layout, this.style), this.callbacks = {}, callbacks = this.callbacks, this.viz.trigger = function() {
			return function() {
				var args, callback, event, i, len, ref, results;
				for(event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [], ref = callbacks[event] || [], results = [], i = 0, len = ref.length; len > i; i++) callback = ref[i], results.push(callback.apply(null, args));
				return results
			}
		}()
	}
	return graphView.prototype.on = function(event, callback) {
		var base;
		return(null != (base = this.callbacks)[event] ? base[event] : base[event] = []).push(callback), this
	}, graphView.prototype.layout = function(value) {
		var layout;
		return arguments.length ? (layout = value, this) : layout
	}, graphView.prototype.grass = function(value) {
		return arguments.length ? (this.style.importGrass(value), this) : this.style.toSheet()
	}, graphView.prototype.update = function() {
		return this.viz.update(), this
	}, graphView.prototype.resize = function() {
		return this.viz.resize(), this
	}, graphView.prototype.boundingBox = function() {
		return this.viz.boundingBox()
	}, graphView.prototype.collectStats = function() {
		return this.viz.collectStats()
	}, graphView
}(), neo.layout = function() {
	var _layout;
	return _layout = {}, _layout.force = function() {
		var _force;
		return _force = {}, _force.init = function(render) {
			var accelerateLayout, currentStats, d3force, forceLayout, linkDistance, newStatsBucket, oneRelationshipPerPairOfNodes;
			return forceLayout = {}, linkDistance = 45, d3force = d3.layout.force().linkDistance(function(relationship) {
				return relationship.source.radius + relationship.target.radius + linkDistance
			}).charge(-1e3), newStatsBucket = function() {
				var bucket;
				return bucket = {
					layoutTime: 0,
					layoutSteps: 0
				}
			}, currentStats = newStatsBucket(), forceLayout.collectStats = function() {
				var latestStats;
				return latestStats = currentStats, currentStats = newStatsBucket(), latestStats
			}, accelerateLayout = function() {
				var d3Tick, maxAnimationFramesPerSecond, maxComputeTime, maxStepsPerTick, now;
				return maxStepsPerTick = 100, maxAnimationFramesPerSecond = 60, maxComputeTime = 1e3 / maxAnimationFramesPerSecond, now = window.performance && window.performance.now ? function() {
					return window.performance.now()
				} : function() {
					return Date.now()
				}, d3Tick = d3force.tick, d3force.tick = function() {
					var startCalcs, startTick, step;
					for(startTick = now(), step = maxStepsPerTick; step-- && now() - startTick < maxComputeTime;) {
						if(startCalcs = now(), currentStats.layoutSteps++, neo.collision.avoidOverlap(d3force.nodes()), d3Tick()) return maxStepsPerTick = 2, !0;
						currentStats.layoutTime += now() - startCalcs
					}
					return render(), !1
				}
			}, accelerateLayout(), oneRelationshipPerPairOfNodes = function(graph) {
				var i, len, pair, ref, results;
				for(ref = graph.groupedRelationships(), results = [], i = 0, len = ref.length; len > i; i++) pair = ref[i], results.push(pair.relationships[0]);
				return results
			}, forceLayout.update = function(graph, size) {
				var center, nodes, radius, relationships;
				return nodes = neo.utils.cloneArray(graph.nodes()), relationships = oneRelationshipPerPairOfNodes(graph), radius = nodes.length * linkDistance / (2 * Math.PI), center = {
					x: size[0] / 2,
					y: size[1] / 2
				}, neo.utils.circularLayout(nodes, center, radius), d3force.nodes(nodes).links(relationships).size(size).start()
			}, forceLayout.drag = d3force.drag, forceLayout
		}, _force
	}, _layout
}();
var hasProp = {}.hasOwnProperty;
neo.models.Node = function() {
	function Node(id, labels, properties) {
		var key, value;
		this.id = id, this.labels = labels, this.propertyMap = properties, this.propertyList = function() {
			var results;
			results = [];
			for(key in properties) hasProp.call(properties, key) && (value = properties[key], results.push({
				key: key,
				value: value
			}));
			return results
		}()
	}
	return Node.prototype.toJSON = function() {
		return this.propertyMap
	}, Node.prototype.isNode = !0, Node.prototype.isRelationship = !1, Node.prototype.relationshipCount = function(graph) {
		var i, len, node, ref, relationship, rels;
		for(node = this, rels = [], ref = graph.relationships(), i = 0, len = ref.length; len > i; i++) relationship = ref[i], (relationship.source === node || relationship.target === node) && rels.push[relationship];
		return rels.length
	}, Node
}(), neo.queryPlan = function(element) {
	var augment, color, colors, costColor, detailFontSize, display, dividerColor, fixedWidthFont, formatNumber, layout, linkColor, margin, maxChildOperators, maxComparableDbHits, maxComparableRows, maxCostHeight, operatorCategories, operatorColors, operatorCornerRadius, operatorDetailHeight, operatorDetails, operatorHeaderFontSize, operatorHeaderHeight, operatorMargin, operatorPadding, operatorWidth, plural, rankMargin, render, rows, standardFont, transform;
	return maxChildOperators = 2, maxComparableRows = 1e6, maxComparableDbHits = 1e6, operatorWidth = 180, operatorCornerRadius = 4, operatorHeaderHeight = 18, operatorHeaderFontSize = 11, operatorDetailHeight = 14, maxCostHeight = 50, detailFontSize = 10, operatorMargin = 50, operatorPadding = 3, rankMargin = 50, margin = 10, standardFont = "'Helvetica Neue',Helvetica,Arial,sans-serif", fixedWidthFont = "Monaco,'Courier New',Terminal,monospace", linkColor = "#DFE1E3", costColor = "#F25A29", dividerColor = "#DFE1E3", operatorColors = colorbrewer.Blues[9].slice(2), operatorCategories = {
		result: ["result"],
		seek: ["scan", "seek", "argument"],
		rows: ["limit", "top", "skip", "sort", "union", "projection"],
		other: [],
		filter: ["select", "filter", "apply", "distinct"],
		expand: ["expand", "product", "join", "optional", "path"],
		eager: ["eager"]
	}, augment = function(color) {
		return {
			color: color,
			"border-color": d3.rgb(color).darker(),
			"text-color-internal": d3.hsl(color).l < .7 ? "#FFFFFF" : "#000000"
		}
	}, colors = d3.scale.ordinal().domain(d3.keys(operatorCategories)).range(operatorColors), color = function(d) {
		var j, keyword, keywords, len, name;
		for(name in operatorCategories)
			for(keywords = operatorCategories[name], j = 0, len = keywords.length; len > j; j++)
				if(keyword = keywords[j], new RegExp(keyword, "i").test(d)) return augment(colors(name));
		return augment(colors("other"))
	}, rows = function(operator) {
		var ref, ref1;
		return null != (ref = null != (ref1 = operator.Rows) ? ref1 : operator.EstimatedRows) ? ref : 0
	}, plural = function(noun, count) {
		return 1 === count ? noun : noun + "s"
	}, formatNumber = d3.format(",.0f"), operatorDetails = function(operator) {
		var detail, details, expression, identifiers, index, j, len, ref, ref1, ref2, ref3, ref4, wordWrap, y;
		if(!operator.expanded) return [];
		for(details = [], wordWrap = function(string, className) {
				var firstWord, lastWord, measure, results, words;
				for(measure = function(text) {
						return neo.utils.measureText(text, fixedWidthFont, 10)
					}, words = string.split(/([^a-zA-Z\d])/), firstWord = 0, lastWord = 1, results = []; firstWord < words.length;) {
					for(; lastWord < words.length && measure(words.slice(firstWord, lastWord + 1).join("")) < operatorWidth - 2 * operatorPadding;) lastWord++;
					details.push({
						className: className,
						value: words.slice(firstWord, lastWord).join("")
					}), firstWord = lastWord, results.push(lastWord = firstWord + 1)
				}
				return results
			}, (identifiers = null != (ref = operator.identifiers) ? ref : null != (ref1 = operator.KeyNames) ? ref1.split(", ") : void 0) && (wordWrap(identifiers.filter(function(d) {
				return !/^  /.test(d)
			}).join(", "), "identifiers"), details.push({
				className: "padding"
			})), (index = operator.Index) && (wordWrap(index, "index"), details.push({
				className: "padding"
			})), (expression = null != (ref2 = null != (ref3 = null != (ref4 = operator.LegacyExpression) ? ref4 : operator.ExpandExpression) ? ref3 : operator.LabelName) ? ref2 : operator.Signature) && (wordWrap(expression, "expression"), details.push({
				className: "padding"
			})), null != operator.Rows && null != operator.EstimatedRows && details.push({
				className: "estimated-rows",
				key: "estimated rows",
				value: formatNumber(operator.EstimatedRows)
			}), null == operator.DbHits || operator.alwaysShowCost || details.push({
				className: "db-hits",
				key: plural("db hit", operator.DbHits || 0),
				value: formatNumber(operator.DbHits || 0)
			}), details.length && "padding" === details[details.length - 1].className && details.pop(), y = operatorDetailHeight, j = 0, len = details.length; len > j; j++) detail = details[j], detail.y = y, y += "padding" === detail.className ? 2 * operatorPadding : operatorDetailHeight;
		return details
	}, transform = function(queryPlan) {
		var collectLinks, links, operators, result;
		return operators = [], links = [], result = {
			operatorType: "Result",
			children: [queryPlan.root]
		}, collectLinks = function(operator, rank) {
			var child, j, len, ref, results;
			for(operators.push(operator), operator.rank = rank, ref = operator.children, results = [], j = 0, len = ref.length; len > j; j++) child = ref[j], child.parent = operator, collectLinks(child, rank + 1), results.push(links.push({
				source: child,
				target: operator
			}));
			return results
		}, collectLinks(result, 0), [operators, links]
	}, layout = function(operators, links) {
		var alpha, center, child, childrenWidth, collide, costHeight, currentY, height, iterations, j, k, l, len, len1, len2, len3, len4, link, linkWidth, m, n, operator, operatorHeight, rank, ranks, ref, ref1, relaxDownwards, relaxUpwards, tx, width;
		for(costHeight = function() {
				var scale;
				return scale = d3.scale.log().domain([1, Math.max(d3.max(operators, function(operator) {
						return operator.DbHits || 0
					}), maxComparableDbHits)]).range([0, maxCostHeight]),
					function(operator) {
						var ref;
						return scale((null != (ref = operator.DbHits) ? ref : 0) + 1)
					}
			}(), operatorHeight = function(operator) {
				var height;
				return height = operatorHeaderHeight, operator.expanded && (height += operatorDetails(operator).slice(-1)[0].y + 2 * operatorPadding), height += costHeight(operator)
			}, linkWidth = function() {
				var scale;
				return scale = d3.scale.log().domain([1, Math.max(d3.max(operators, function(operator) {
						return rows(operator) + 1
					}), maxComparableRows)]).range([2, (operatorWidth - 2 * operatorCornerRadius) / maxChildOperators]),
					function(operator) {
						return scale(rows(operator) + 1)
					}
			}(), j = 0, len = operators.length; len > j; j++)
			for(operator = operators[j], operator.height = operatorHeight(operator), operator.costHeight = costHeight(operator), operator.costHeight > operatorDetailHeight + operatorPadding && (operator.alwaysShowCost = !0), childrenWidth = d3.sum(operator.children, linkWidth), tx = (operatorWidth - childrenWidth) / 2, ref = operator.children, k = 0, len1 = ref.length; len1 > k; k++) child = ref[k], child.tx = tx, tx += linkWidth(child);
		for(l = 0, len2 = links.length; len2 > l; l++) link = links[l], link.width = linkWidth(link.source);
		for(ranks = d3.nest().key(function(operator) {
				return operator.rank
			}).entries(operators), currentY = 0, m = 0, len3 = ranks.length; len3 > m; m++)
			for(rank = ranks[m], currentY -= d3.max(rank.values, operatorHeight) + rankMargin, ref1 = rank.values, n = 0, len4 = ref1.length; len4 > n; n++) operator = ref1[n], operator.x = 0, operator.y = currentY;
		for(width = d3.max(ranks.map(function(rank) {
				return rank.values.length * (operatorWidth + operatorMargin)
			})), height = -currentY, collide = function() {
				var dx, i, lastOperator, len5, len6, p, q, ref2, results, x0;
				for(results = [], p = 0, len5 = ranks.length; len5 > p; p++) {
					for(rank = ranks[p], x0 = 0, ref2 = rank.values, q = 0, len6 = ref2.length; len6 > q; q++) operator = ref2[q], dx = x0 - operator.x, dx > 0 && (operator.x += dx), x0 = operator.x + operatorWidth + operatorMargin;
					dx = x0 - operatorMargin - width, dx > 0 ? (lastOperator = rank.values[rank.values.length - 1], x0 = lastOperator.x -= dx, results.push(function() {
						var r, ref3, results1;
						for(results1 = [], i = r = ref3 = rank.values.length - 2; r >= 0; i = r += -1) operator = rank.values[i], dx = operator.x + operatorWidth + operatorMargin - x0, dx > 0 ? (operator.x -= operatorWidth, results1.push(x0 = operator.x)) : results1.push(void 0);
						return results1
					}())) : results.push(void 0)
				}
				return results
			}, center = function(operator) {
				return operator.x + operatorWidth / 2
			}, relaxUpwards = function(alpha) {
				var len5, p, results, x;
				for(results = [], p = 0, len5 = ranks.length; len5 > p; p++) rank = ranks[p], results.push(function() {
					var len6, q, ref2, results1;
					for(ref2 = rank.values, results1 = [], q = 0, len6 = ref2.length; len6 > q; q++) operator = ref2[q], operator.children.length ? (x = d3.sum(operator.children, function(child) {
						return linkWidth(child) * center(child)
					}) / d3.sum(operator.children, linkWidth), results1.push(operator.x += (x - center(operator)) * alpha)) : results1.push(void 0);
					return results1
				}());
				return results
			}, relaxDownwards = function(alpha) {
				var len5, p, ref2, results;
				for(ref2 = ranks.slice().reverse(), results = [], p = 0, len5 = ref2.length; len5 > p; p++) rank = ref2[p], results.push(function() {
					var len6, q, ref3, results1;
					for(ref3 = rank.values, results1 = [], q = 0, len6 = ref3.length; len6 > q; q++) operator = ref3[q], operator.parent ? results1.push(operator.x += (center(operator.parent) - center(operator)) * alpha) : results1.push(void 0);
					return results1
				}());
				return results
			}, collide(), iterations = 300, alpha = 1; iterations--;) relaxUpwards(alpha), collide(), relaxDownwards(alpha), collide(), alpha *= .98;
		return width = d3.max(operators, function(o) {
			return o.x
		}) - d3.min(operators, function(o) {
			return o.x
		}) + operatorWidth, [width, height]
	}, render = function(operators, links, width, height, redisplay) {
		var join, svg;
		return svg = d3.select(element), svg.transition().attr("width", width + 2 * margin).attr("height", height + 2 * margin).attr("viewBox", [d3.min(operators, function(o) {
			return o.x
		}) - margin, -margin - height, width + 2 * margin, height + 2 * margin].join(" ")), (join = function(parent, children) {
			var child, j, len, ref, results, selection;
			for(ref = d3.entries(children), results = [], j = 0, len = ref.length; len > j; j++) child = ref[j], selection = parent.selectAll(child.key).data(child.value.data), child.value.selections(selection.enter(), selection, selection.exit()), child.value.children ? results.push(join(selection, child.value.children)) : results.push(void 0);
			return results
		})(svg, {
			"g.layer.links": {
				data: [links],
				selections: function(enter) {
					return enter.append("g").attr("class", "layer links")
				},
				children: {
					".link": {
						data: function(d) {
							return d
						},
						selections: function(enter) {
							return enter.append("g").attr("class", "link")
						},
						children: {
							path: {
								data: function(d) {
									return [d]
								},
								selections: function(enter, update) {
									return enter.append("path").attr("fill", linkColor), update.transition().attr("d", function(d) {
										var control1, control2, controlWidth, curvature, sourceX, sourceY, targetX, targetY, yi;
										return width = Math.max(1, d.width), sourceX = d.source.x + operatorWidth / 2, targetX = d.target.x + d.source.tx, sourceY = d.source.y + d.source.height, targetY = d.target.y, yi = d3.interpolateNumber(sourceY, targetY), curvature = .5, control1 = yi(curvature), control2 = yi(1 - curvature), controlWidth = Math.min(width / Math.PI, (targetY - sourceY) / Math.PI), sourceX > targetX + width / 2 && (controlWidth *= -1), ["M", sourceX + width / 2, sourceY, "C", sourceX + width / 2, control1 - controlWidth, targetX + width, control2 - controlWidth, targetX + width, targetY, "L", targetX, targetY, "C", targetX, control2 + controlWidth, sourceX - width / 2, control1 + controlWidth, sourceX - width / 2, sourceY, "Z"].join(" ")
									})
								}
							},
							text: {
								data: function(d) {
									var caption, key, ref, source, x, y;
									return x = d.source.x + operatorWidth / 2, y = d.source.y + d.source.height + operatorDetailHeight, source = d.source, null != source.Rows || null != source.EstimatedRows ? (ref = null != source.Rows ? ["Rows", "row"] : ["EstimatedRows", "estimated row"], key = ref[0], caption = ref[1], [{
										x: x,
										y: y,
										text: formatNumber(source[key]) + "\xa0",
										anchor: "end"
									}, {
										x: x,
										y: y,
										text: plural(caption, source[key]),
										anchor: "start"
									}]) : []
								},
								selections: function(enter, update) {
									return enter.append("text").attr("font-size", detailFontSize).attr("font-family", standardFont), update.transition().attr("x", function(d) {
										return d.x
									}).attr("y", function(d) {
										return d.y
									}).attr("text-anchor", function(d) {
										return d.anchor
									}).text(function(d) {
										return d.text
									})
								}
							}
						}
					}
				}
			},
			"g.layer.operators": {
				data: [operators],
				selections: function(enter) {
					return enter.append("g").attr("class", "layer operators")
				},
				children: {
					".operator": {
						data: function(d) {
							return d
						},
						selections: function(enter, update) {
							return enter.append("g").attr("class", "operator"), update.transition().attr("transform", function(d) {
								return "translate(" + d.x + "," + d.y + ")"
							})
						},
						children: {
							"rect.background": {
								data: function(d) {
									return [d]
								},
								selections: function(enter, update) {
									return enter.append("rect").attr("class", "background"), update.transition().attr("width", operatorWidth).attr("height", function(d) {
										return d.height
									}).attr("rx", operatorCornerRadius).attr("ry", operatorCornerRadius).attr("fill", "white").style("stroke", "none")
								}
							},
							"g.header": {
								data: function(d) {
									return [d]
								},
								selections: function(enter) {
									return enter.append("g").attr("class", "header").attr("pointer-events", "all").on("click", function(d) {
										return d.expanded = !d.expanded, redisplay()
									})
								},
								children: {
									"path.banner": {
										data: function(d) {
											return [d]
										},
										selections: function(enter, update) {
											return enter.append("path").attr("class", "banner"), update.attr("d", function(d) {
												var shaving;
												return shaving = d.height <= operatorHeaderHeight ? operatorCornerRadius : d.height < operatorHeaderHeight + operatorCornerRadius ? operatorCornerRadius - Math.sqrt(Math.pow(operatorCornerRadius, 2) - Math.pow(operatorCornerRadius - d.height + operatorHeaderHeight, 2)) : 0, ["M", operatorWidth - operatorCornerRadius, 0, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth, operatorCornerRadius, "L", operatorWidth, operatorHeaderHeight - operatorCornerRadius, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - shaving, operatorHeaderHeight, "L", shaving, operatorHeaderHeight, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, 0, operatorHeaderHeight - operatorCornerRadius, "L", 0, operatorCornerRadius, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorCornerRadius, 0, "Z"].join(" ")
											}).style("fill", function(d) {
												return color(d.operatorType).color
											})
										}
									},
									"path.expand": {
										data: function(d) {
											return "Result" === d.operatorType ? [] : [d]
										},
										selections: function(enter, update) {
											var rotateForExpand;
											return rotateForExpand = function(d) {
												return d3.transform(), "translate(" + operatorHeaderHeight / 2 + ", " + operatorHeaderHeight / 2 + ") " + ("rotate(" + (d.expanded ? 90 : 0) + ") ") + "scale(0.5)"
											}, enter.append("path").attr("class", "expand").attr("fill", function(d) {
												return color(d.operatorType)["text-color-internal"]
											}).attr("d", "M -5 -10 L 8.66 0 L -5 10 Z").attr("transform", rotateForExpand), update.transition().attrTween("transform", function(d, i, a) {
												return d3.interpolateString(a, rotateForExpand(d))
											})
										}
									},
									"text.title": {
										data: function(d) {
											return [d]
										},
										selections: function(enter) {
											return enter.append("text").attr("class", "title").attr("font-size", operatorHeaderFontSize).attr("font-family", standardFont).attr("x", operatorHeaderHeight).attr("y", 13).attr("fill", function(d) {
												return color(d.operatorType)["text-color-internal"]
											}).text(function(d) {
												return d.operatorType
											})
										}
									}
								}
							},
							"g.detail": {
								data: operatorDetails,
								selections: function(enter, update, exit) {
									return enter.append("g"), update.attr("class", function(d) {
										return "detail " + d.className
									}).attr("transform", function(d) {
										return "translate(0, " + (operatorHeaderHeight + d.y) + ")"
									}).attr("font-family", function(d) {
										return "expression" === d.className || "identifiers" === d.className ? fixedWidthFont : standardFont
									}), exit.remove()
								},
								children: {
									text: {
										data: function(d) {
											return d.key ? [{
												text: d.value + "\xa0",
												anchor: "end",
												x: operatorWidth / 2
											}, {
												text: d.key,
												anchor: "start",
												x: operatorWidth / 2
											}] : [{
												text: d.value,
												anchor: "start",
												x: operatorPadding
											}]
										},
										selections: function(enter, update, exit) {
											return enter.append("text").attr("font-size", detailFontSize), update.attr("x", function(d) {
												return d.x
											}).attr("text-anchor", function(d) {
												return d.anchor
											}).attr("fill", "black").transition().each("end", function() {
												return update.text(function(d) {
													return d.text
												})
											}), exit.remove()
										}
									},
									"path.divider": {
										data: function(d) {
											return "padding" === d.className ? [d] : []
										},
										selections: function(enter, update) {
											return enter.append("path").attr("class", "divider").attr("visibility", "hidden"), update.attr("d", ["M", 0, 2 * -operatorPadding, "L", operatorWidth, 2 * -operatorPadding].join(" ")).attr("stroke", dividerColor).transition().each("end", function() {
												return update.attr("visibility", "visible")
											})
										}
									}
								}
							},
							"path.cost": {
								data: function(d) {
									return [d]
								},
								selections: function(enter, update) {
									return enter.append("path").attr("class", "cost").attr("fill", costColor), update.transition().attr("d", function(d) {
										var shaving;
										return d.costHeight < operatorCornerRadius ? (shaving = operatorCornerRadius - Math.sqrt(Math.pow(operatorCornerRadius, 2) - Math.pow(operatorCornerRadius - d.costHeight, 2)), ["M", operatorWidth - shaving, d.height - d.costHeight, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - operatorCornerRadius, d.height, "L", operatorCornerRadius, d.height, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, shaving, d.height - d.costHeight, "Z"].join(" ")) : ["M", 0, d.height - d.costHeight, "L", operatorWidth, d.height - d.costHeight, "L", operatorWidth, d.height - operatorCornerRadius, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, operatorWidth - operatorCornerRadius, d.height, "L", operatorCornerRadius, d.height, "A", operatorCornerRadius, operatorCornerRadius, 0, 0, 1, 0, d.height - operatorCornerRadius, "Z"].join(" ")
									})
								}
							},
							"text.cost": {
								data: function(d) {
									var y;
									return d.alwaysShowCost ? (y = d.height - d.costHeight + operatorDetailHeight, [{
										text: formatNumber(d.DbHits) + "\xa0",
										anchor: "end",
										y: y
									}, {
										text: "db hits",
										anchor: "start",
										y: y
									}]) : []
								},
								selections: function(enter, update) {
									return enter.append("text").attr("class", "cost").attr("font-size", detailFontSize).attr("font-family", standardFont).attr("fill", "white"), update.attr("x", operatorWidth / 2).attr("text-anchor", function(d) {
										return d.anchor
									}).transition().attr("y", function(d) {
										return d.y
									}).each("end", function() {
										return update.text(function(d) {
											return d.text
										})
									})
								}
							},
							"rect.outline": {
								data: function(d) {
									return [d]
								},
								selections: function(enter, update) {
									return enter.append("rect").attr("class", "outline"), update.transition().attr("width", operatorWidth).attr("height", function(d) {
										return d.height
									}).attr("rx", operatorCornerRadius).attr("ry", operatorCornerRadius).attr("fill", "none").attr("stroke-width", 1).style("stroke", function(d) {
										return color(d.operatorType)["border-color"]
									})
								}
							}
						}
					}
				}
			}
		})
	}, display = function(queryPlan) {
		var height, links, operators, ref, ref1, width;
		return ref = transform(queryPlan), operators = ref[0], links = ref[1], ref1 = layout(operators, links), width = ref1[0], height = ref1[1], render(operators, links, width, height, function() {
			return display(queryPlan)
		})
	}, this.display = display, this
};
var hasProp = {}.hasOwnProperty;
neo.models.Relationship = function() {
	function Relationship(id, source, target, type, properties) {
		var key, value;
		this.id = id, this.source = source, this.target = target, this.type = type, this.propertyMap = properties, this.propertyList = function() {
			var ref, results;
			ref = this.propertyMap, results = [];
			for(key in ref) hasProp.call(ref, key) && (value = ref[key], results.push({
				key: key,
				value: value
			}));
			return results
		}.call(this)
	}
	return Relationship.prototype.toJSON = function() {
		return this.propertyMap
	}, Relationship.prototype.isNode = !1, Relationship.prototype.isRelationship = !0, Relationship.prototype.isLoop = function() {
		return this.source === this.target
	}, Relationship
}(), neo.Renderer = function() {
	function Renderer(opts) {
		null == opts && (opts = {}), neo.utils.extend(this, opts), null == this.onGraphChange && (this.onGraphChange = function() {}), null == this.onTick && (this.onTick = function() {})
	}
	return Renderer
}(), neo.style = function() {
	var GraphStyle, Selector, StyleElement, StyleRule, _style;
	return _style = function(storage) {
		return new GraphStyle(storage)
	}, _style.defaults = {
		autoColor: !0,
		colors: [{
			color: "#DFE1E3",
			"border-color": "#D4D6D7",
			"text-color-internal": "#000000"
		}, {
			color: "#F25A29",
			"border-color": "#DC4717",
			"text-color-internal": "#FFFFFF"
		}, {
			color: "#AD62CE",
			"border-color": "#9453B1",
			"text-color-internal": "#FFFFFF"
		}, {
			color: "#30B6AF",
			"border-color": "#46A39E",
			"text-color-internal": "#FFFFFF"
		}, {
			color: "#FF6C7C",
			"border-color": "#EB5D6C",
			"text-color-internal": "#FFFFFF"
		}, {
			color: "#FCC940",
			"border-color": "#F3BA25",
			"text-color-internal": "#000000"
		}, {
			color: "#4356C0",
			"border-color": "#3445A2",
			"text-color-internal": "#FFFFFF"
		}],
		style: {
			node: {
				diameter: "40px",
				color: "#DFE1E3",
				"border-color": "#D4D6D7",
				"border-width": "2px",
				"text-color-internal": "#000000",
				caption: "{id}",
				"font-size": "10px"
			},
			relationship: {
				color: "#D4D6D7",
				"shaft-width": "1px",
				"font-size": "8px",
				padding: "3px",
				"text-color-external": "#000000",
				"text-color-internal": "#FFFFFF"
			}
		},
		sizes: [{
			diameter: "10px"
		}, {
			diameter: "20px"
		}, {
			diameter: "30px"
		}, {
			diameter: "50px"
		}, {
			diameter: "80px"
		}],
		arrayWidths: [{
			"shaft-width": "1px"
		}, {
			"shaft-width": "2px"
		}, {
			"shaft-width": "3px"
		}, {
			"shaft-width": "5px"
		}, {
			"shaft-width": "8px"
		}, {
			"shaft-width": "13px"
		}, {
			"shaft-width": "25px"
		}, {
			"shaft-width": "38px"
		}]
	}, Selector = function() {
		function Selector(selector) {
			var ref;
			ref = selector.indexOf(".") > 0 ? selector.split(".") : [selector, void 0], this.tag = ref[0], this.klass = ref[1]
		}
		return Selector.prototype.toString = function() {
			var str;
			return str = this.tag, null != this.klass && (str += "." + this.klass), str
		}, Selector
	}(), StyleRule = function() {
		function StyleRule(selector1, props1) {
			this.selector = selector1, this.props = props1
		}
		return StyleRule.prototype.matches = function(selector) {
			return this.selector.tag !== selector.tag || this.selector.klass !== selector.klass && this.selector.klass ? !1 : !0
		}, StyleRule.prototype.matchesExact = function(selector) {
			return this.selector.tag === selector.tag && this.selector.klass === selector.klass
		}, StyleRule
	}(), StyleElement = function() {
		function StyleElement(selector, data1) {
			this.data = data1, this.selector = selector, this.props = {}
		}
		return StyleElement.prototype.applyRules = function(rules) {
			var i, j, len, len1, rule;
			for(i = 0, len = rules.length; len > i; i++)
				if(rule = rules[i], rule.matches(this.selector)) {
					neo.utils.extend(this.props, rule.props);
					break
				}
			for(j = 0, len1 = rules.length; len1 > j; j++)
				if(rule = rules[j], rule.matchesExact(this.selector)) {
					neo.utils.extend(this.props, rule.props);
					break
				}
			return this
		}, StyleElement.prototype.get = function(attr) {
			return this.props[attr] || ""
		}, StyleElement
	}(), GraphStyle = function() {
		function GraphStyle(storage1) {
			this.storage = storage1, this.rules = [], this.loadRules()
		}
		return GraphStyle.prototype.selector = function(item) {
			return item.isNode ? this.nodeSelector(item) : item.isRelationship ? this.relationshipSelector(item) : void 0
		}, GraphStyle.prototype.calculateStyle = function(selector, data) {
			return new StyleElement(selector, data).applyRules(this.rules)
		}, GraphStyle.prototype.forEntity = function(item) {
			return this.calculateStyle(this.selector(item), item)
		}, GraphStyle.prototype.forNode = function(node) {
			var ref, selector;
			return null == node && (node = {}), selector = this.nodeSelector(node), (null != (ref = node.labels) ? ref.length : void 0) > 0 && this.setDefaultStyling(selector), this.calculateStyle(selector, node)
		}, GraphStyle.prototype.forRelationship = function(rel) {
			return this.calculateStyle(this.relationshipSelector(rel), rel)
		}, GraphStyle.prototype.findAvailableDefaultColor = function() {
			var defaultColor, i, j, len, len1, ref, ref1, rule, usedColors;
			for(usedColors = {}, ref = this.rules, i = 0, len = ref.length; len > i; i++) rule = ref[i], null != rule.props.color && (usedColors[rule.props.color] = !0);
			for(ref1 = _style.defaults.colors, j = 0, len1 = ref1.length; len1 > j; j++)
				if(defaultColor = ref1[j], null == usedColors[defaultColor.color]) return neo.utils.copy(defaultColor);
			return neo.utils.copy(_style.defaults.colors[0])
		}, GraphStyle.prototype.setDefaultStyling = function(selector) {
			var rule;
			return rule = this.findRule(selector), _style.defaults.autoColor && null == rule ? (rule = new StyleRule(selector, this.findAvailableDefaultColor()), this.rules.push(rule), this.persist()) : void 0
		}, GraphStyle.prototype.change = function(item, props) {
			var rule, selector;
			return selector = this.selector(item), rule = this.findRule(selector), null == rule && (rule = new StyleRule(selector, {}), this.rules.push(rule)), neo.utils.extend(rule.props, props), this.persist(), rule
		}, GraphStyle.prototype.destroyRule = function(rule) {
			var idx;
			return idx = this.rules.indexOf(rule), null != idx && this.rules.splice(idx, 1), this.persist()
		}, GraphStyle.prototype.findRule = function(selector) {
			var i, len, r, ref, rule;
			for(ref = this.rules, i = 0, len = ref.length; len > i; i++) r = ref[i], r.matchesExact(selector) && (rule = r);
			return rule
		}, GraphStyle.prototype.nodeSelector = function(node) {
			var ref, selector;
			return null == node && (node = {}), selector = "node", (null != (ref = node.labels) ? ref.length : void 0) > 0 && (selector += "." + node.labels[0]), new Selector(selector)
		}, GraphStyle.prototype.relationshipSelector = function(rel) {
			var selector;
			return null == rel && (rel = {}), selector = "relationship", null != rel.type && (selector += "." + rel.type), new Selector(selector)
		}, GraphStyle.prototype.importGrass = function(string) {
			var e, rules;
			try {
				return rules = this.parse(string), this.loadRules(rules), this.persist()
			} catch(_error) {
				e = _error
			}
		}, GraphStyle.prototype.loadRules = function(data) {
			var props, rule;
			neo.utils.isObject(data) || (data = _style.defaults.style), this.rules.length = 0;
			for(rule in data) props = data[rule], this.rules.push(new StyleRule(new Selector(rule), neo.utils.copy(props)));
			return this
		}, GraphStyle.prototype.parse = function(string) {
			var c, chars, i, insideProps, insideString, j, k, key, keyword, len, len1, prop, props, ref, ref1, rules, skipThis, v, val;
			for(chars = string.split(""), insideString = !1, insideProps = !1, keyword = "", props = "", rules = {}, i = 0, len = chars.length; len > i; i++) {
				switch(c = chars[i], skipThis = !0, c) {
					case "{":
						insideString ? skipThis = !1 : insideProps = !0;
						break;
					case "}":
						insideString ? skipThis = !1 : (insideProps = !1, rules[keyword] = props, keyword = "", props = "");
						break;
					case "'":
					case '"':
						insideString ^= !0;
						break;
					default:
						skipThis = !1
				}
				skipThis || (insideProps ? props += c : c.match(/[\s\n]/) || (keyword += c))
			}
			for(k in rules)
				for(v = rules[k], rules[k] = {}, ref = v.split(";"), j = 0, len1 = ref.length; len1 > j; j++) prop = ref[j], ref1 = prop.split(":"), key = ref1[0], val = ref1[1], key && val && (rules[k][null != key ? key.trim() : void 0] = null != val ? val.trim() : void 0);
			return rules
		}, GraphStyle.prototype.persist = function() {
			var ref;
			return null != (ref = this.storage) ? ref.add("grass", JSON.stringify(this.toSheet())) : void 0
		}, GraphStyle.prototype.resetToDefault = function() {
			return this.loadRules(), this.persist()
		}, GraphStyle.prototype.toSheet = function() {
			var i, len, ref, rule, sheet;
			for(sheet = {}, ref = this.rules, i = 0, len = ref.length; len > i; i++) rule = ref[i], sheet[rule.selector.toString()] = rule.props;
			return sheet
		}, GraphStyle.prototype.toString = function() {
			var i, k, len, r, ref, ref1, str, v;
			for(str = "", ref = this.rules, i = 0, len = ref.length; len > i; i++) {
				r = ref[i], str += r.selector.toString() + " {\n", ref1 = r.props;
				for(k in ref1) v = ref1[k], "caption" === k && (v = "'" + v + "'"), str += "  " + k + ": " + v + ";\n";
				str += "}\n\n"
			}
			return str
		}, GraphStyle.prototype.nextDefaultColor = 0, GraphStyle.prototype.defaultColors = function() {
			return neo.utils.copy(_style.defaults.colors)
		}, GraphStyle.prototype.interpolate = function(str, id, properties) {
			return str.replace(/\{([^{}]*)\}/g, function(a, b) {
				var r;
				return r = properties[b] || id, "string" == typeof r || "number" == typeof r ? r : a
			})
		}, GraphStyle
	}(), _style
}();
var slice = [].slice;
neo.viz = function(el, measureSize, graph, layout, style) {
	var base_group, clickHandler, container, currentStats, draw, force, geometry, interpolateZoom, isZoomingIn, layoutDimension, newStatsBucket, now, onNodeClick, onNodeDblClick, onNodeDragToggle, onNodeMouseOut, onNodeMouseOver, onRelMouseOut, onRelMouseOver, onRelationshipClick, rect, render, root, updateViz, viz, zoomBehavior, zoomClick, zoomInClick, zoomLevel, zoomOutClick, zoomed;
	return viz = {
		style: style
	}, root = d3.select(el), base_group = root.append("g").attr("transform", "translate(0,0)"), rect = base_group.append("rect").style("fill", "none").style("pointer-events", "all").attr("x", "-2500").attr("y", "-2500").attr("width", "5000").attr("height", "5000").attr("transform", "scale(1)"), container = base_group.append("g"), geometry = new NeoD3Geometry(style), draw = !1, layoutDimension = 200, updateViz = !0, viz.trigger = function() {
		var args, event;
		event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : []
	}, onNodeClick = function(_this) {
		return function(node) {
			return updateViz = !1, viz.trigger("nodeClicked", node)
		}
	}(this), onNodeDblClick = function(_this) {
		return function(node) {
			return viz.trigger("nodeDblClicked", node)
		}
	}(this), onNodeDragToggle = function(node) {
		return viz.trigger("nodeDragToggle", node)
	}, onRelationshipClick = function(_this) {
		return function(relationship) {
			return d3.event.stopPropagation(), updateViz = !1, viz.trigger("relationshipClicked", relationship)
		}
	}(this), onNodeMouseOver = function(node) {
		return viz.trigger("nodeMouseOver", node)
	}, onNodeMouseOut = function(node) {
		return viz.trigger("nodeMouseOut", node)
	}, onRelMouseOver = function(rel) {
		return viz.trigger("relMouseOver", rel)
	}, onRelMouseOut = function(rel) {
		return viz.trigger("relMouseOut", rel)
	}, zoomLevel = null, zoomed = function() {
		return draw = !0, container.attr("transform", "translate(" + zoomBehavior.translate() + ")scale(" + zoomBehavior.scale() + ")")
	}, zoomBehavior = d3.behavior.zoom().scaleExtent([.2, 1]).on("zoom", zoomed), interpolateZoom = function(translate, scale) {
		return d3.transition().duration(500).tween("zoom", function() {
			var s, t;
			return t = d3.interpolate(zoomBehavior.translate(), translate), s = d3.interpolate(zoomBehavior.scale(), scale),
				function(a) {
					return zoomBehavior.scale(s(a)).translate(t(a)), zoomed()
				}
		})
	}, isZoomingIn = !0, zoomInClick = function() {
		return isZoomingIn = !0, zoomClick(this)
	}, zoomOutClick = function() {
		return isZoomingIn = !1, zoomClick(this)
	}, zoomClick = function(element) {
		return draw = !0, d3.event.preventDefault, d3.select(element.parentNode).selectAll("button").classed("faded", !1), isZoomingIn ? (zoomLevel = Number((1.2 * zoomBehavior.scale()).toFixed(2)), zoomLevel >= zoomBehavior.scaleExtent()[1] ? (d3.select(element).classed("faded", !0), interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[1])) : interpolateZoom(zoomBehavior.translate(), zoomLevel)) : (zoomLevel = Number((.8 * zoomBehavior.scale()).toFixed(2)), zoomLevel <= zoomBehavior.scaleExtent()[0] ? (d3.select(element).classed("faded", !0), interpolateZoom(zoomBehavior.translate(), zoomBehavior.scaleExtent()[0])) : interpolateZoom(zoomBehavior.translate(), zoomLevel))
	}, rect.on("click", function() {
		return draw ? void 0 : viz.trigger("canvasClicked", el)
	}), base_group.call(zoomBehavior).on("dblclick.zoom", null).on("click.zoom", function() {
		return draw = !1
	}).on("DOMMouseScroll.zoom", null).on("wheel.zoom", null).on("mousewheel.zoom", null), newStatsBucket = function() {
		var bucket;
		return bucket = {
			frameCount: 0,
			geometry: 0,
			relationshipRenderers: function() {
				var timings;
				return timings = {}, neo.renderers.relationship.forEach(function(r) {
					return timings[r.name] = 0
				}), timings
			}()
		}, bucket.duration = function() {
			return bucket.lastFrame - bucket.firstFrame
		}, bucket.fps = function() {
			return(1e3 * bucket.frameCount / bucket.duration()).toFixed(1)
		}, bucket.lps = function() {
			return(1e3 * bucket.layout.layoutSteps / bucket.duration()).toFixed(1)
		}, bucket.top = function() {
			var name, ref, renderers, time, totalRenderTime;
			renderers = [], ref = bucket.relationshipRenderers;
			for(name in ref) time = ref[name], renderers.push({
				name: name,
				time: time
			});
			return renderers.push({
				name: "forceLayout",
				time: bucket.layout.layoutTime
			}), renderers.sort(function(a, b) {
				return b.time - a.time
			}), totalRenderTime = renderers.reduce(function(prev, current) {
				return prev + current.time
			}, 0), renderers.map(function(d) {
				return d.name + ": " + (100 * d.time / totalRenderTime).toFixed(1) + "%"
			}).join(", ")
		}, bucket
	}, currentStats = newStatsBucket(), now = window.performance && window.performance.now ? function() {
		return window.performance.now()
	} : function() {
		return Date.now()
	}, render = function() {
		var i, j, len, len1, nodeGroups, ref, ref1, relationshipGroups, renderer, startRender, startRenderer;
		for(currentStats.firstFrame || (currentStats.firstFrame = now()), currentStats.frameCount++, startRender = now(), geometry.onTick(graph), currentStats.geometry += now() - startRender, nodeGroups = container.selectAll("g.node").attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")"
			}), ref = neo.renderers.node, i = 0, len = ref.length; len > i; i++) renderer = ref[i], nodeGroups.call(renderer.onTick, viz);
		for(relationshipGroups = container.selectAll("g.relationship").attr("transform", function(d) {
				return "translate(" + d.source.x + " " + d.source.y + ") rotate(" + (d.naturalAngle + 180) + ")"
			}), ref1 = neo.renderers.relationship, j = 0, len1 = ref1.length; len1 > j; j++) renderer = ref1[j], startRenderer = now(), relationshipGroups.call(renderer.onTick, viz), currentStats.relationshipRenderers[renderer.name] += now() - startRenderer;
		return currentStats.lastFrame = now()
	}, force = layout.init(render), force.drag().on("dragstart.node", function(d) {
		return onNodeDragToggle(d)
	}).on("dragend.node", function() {
		return onNodeDragToggle()
	}), viz.collectStats = function() {
		var latestStats;
		return latestStats = currentStats, latestStats.layout = force.collectStats(), currentStats = newStatsBucket(), latestStats
	}, viz.update = function() {
		var i, j, k, layers, len, len1, len2, nodeGroups, nodes, ref, ref1, ref2, relationshipGroups, relationships, renderer;
		if(graph) {
			for(layers = container.selectAll("g.layer").data(["relationships", "nodes"]), layers.enter().append("g").attr("class", function(d) {
					return "layer " + d
				}), nodes = graph.nodes(), relationships = graph.relationships(), relationshipGroups = container.select("g.layer.relationships").selectAll("g.relationship").data(relationships, function(d) {
					return d.id
				}), relationshipGroups.enter().append("g").attr("class", "relationship").on("mousedown", onRelationshipClick).on("mouseover", onRelMouseOver).on("mouseout", onRelMouseOut), relationshipGroups.classed("selected", function(relationship) {
					return relationship.selected
				}), geometry.onGraphChange(graph), ref = neo.renderers.relationship, i = 0, len = ref.length; len > i; i++) renderer = ref[i], relationshipGroups.call(renderer.onGraphChange, viz);
			for(relationshipGroups.exit().remove(), nodeGroups = container.select("g.layer.nodes").selectAll("g.node").data(nodes, function(d) {
					return d.id
				}), nodeGroups.enter().append("g").attr("class", "node").call(force.drag).call(clickHandler).on("mouseover", onNodeMouseOver).on("mouseout", onNodeMouseOut), nodeGroups.classed("selected", function(node) {
					return node.selected
				}), ref1 = neo.renderers.node, j = 0, len1 = ref1.length; len1 > j; j++) renderer = ref1[j], nodeGroups.call(renderer.onGraphChange, viz);
			for(ref2 = neo.renderers.menu, k = 0, len2 = ref2.length; len2 > k; k++) renderer = ref2[k], nodeGroups.call(renderer.onGraphChange, viz);
			return nodeGroups.exit().remove(), updateViz && (force.update(graph, [layoutDimension, layoutDimension]), viz.resize(), viz.trigger("updated")), updateViz = !0
		}
	}, viz.resize = function() {
		var size;
		return size = measureSize(), root.attr("viewBox", [0, (layoutDimension - size.height) / 2, layoutDimension, size.height].join(" "))
	}, viz.boundingBox = function() {
		return container.node().getBBox()
	}, clickHandler = neo.utils.clickHandler(), clickHandler.on("click", onNodeClick), clickHandler.on("dblclick", onNodeDblClick), d3.select(root.node().parentNode).select("button.zoom_in").on("click", zoomInClick), d3.select(root.node().parentNode).select("button.zoom_out").on("click", zoomOutClick), viz
};
var hasProp = {}.hasOwnProperty;
neo.utils.adjacentAngles = function() {
		function adjacentAngles() {}
		return adjacentAngles.prototype.findRuns = function(angleList, minSeparation) {
			var end, extendEnd, extendStart, key, minStart, p, runs, scanForDensePair, start, step, stepCount, tooDense, value;
			for(p = 0, start = 0, end = 0, runs = [], minStart = function() {
					return 0 === runs.length ? 0 : runs[0].start
				}, scanForDensePair = function() {
					return start = p, end = angleList.wrapIndex(p + 1), end === minStart() ? "done" : (p = end, tooDense(start, end) ? extendEnd : scanForDensePair)
				}, extendEnd = function() {
					return p === minStart() ? "done" : tooDense(start, angleList.wrapIndex(p + 1)) ? (end = angleList.wrapIndex(p + 1), p = end, extendEnd) : (p = start, extendStart)
				}, extendStart = function() {
					var candidateStart;
					return candidateStart = angleList.wrapIndex(p - 1), tooDense(candidateStart, end) && candidateStart !== end ? (start = candidateStart, p = start, extendStart) : (runs.push({
						start: start,
						end: end
					}), p = end, scanForDensePair)
				}, tooDense = function(start, end) {
					var run;
					return run = {
						start: start,
						end: end
					}, angleList.angle(run) < angleList.length(run) * minSeparation
				}, stepCount = 0, step = scanForDensePair;
				"done" !== step;) {
				if(stepCount++ > 10 * angleList.totalLength()) {
					console.log("Warning: failed to layout arrows", function() {
						var ref, results;
						ref = angleList.list, results = [];
						for(key in ref) hasProp.call(ref, key) && (value = ref[key], results.push(key + ": " + value.angle));
						return results
					}().join("\n"), minSeparation);
					break
				}
				step = step()
			}
			return runs
		}, adjacentAngles
	}(), neo.utils.angleList = function() {
		function angleList(list) {
			this.list = list
		}
		return angleList.prototype.getAngle = function(index) {
			return this.list[index].angle
		}, angleList.prototype.fixed = function(index) {
			return this.list[index].fixed
		}, angleList.prototype.totalLength = function() {
			return this.list.length
		}, angleList.prototype.length = function(run) {
			return run.start < run.end ? run.end - run.start : run.end + this.list.length - run.start
		}, angleList.prototype.angle = function(run) {
			return run.start < run.end ? this.list[run.end].angle - this.list[run.start].angle : 360 - (this.list[run.start].angle - this.list[run.end].angle)
		}, angleList.prototype.wrapIndex = function(index) {
			return -1 === index ? this.list.length - 1 : index >= this.list.length ? index - this.list.length : index
		}, angleList
	}(), neo.utils.arcArrow = function() {
		function arcArrow(startRadius, endRadius, endCentre, deflection, arrowWidth, headWidth, headLength, captionLayout) {
			var angleTangent, arcRadius, c1, c2, coord, cx, cy, deflectionRadians, endAngle, endAttach, endNormal, endOverlayCorner, endTangent, g1, g2, headRadius, homotheticCenter, intersectWithOtherCircle, midShaftAngle, negativeSweep, positiveSweep, radiusRatio, shaftRadius, square, startAngle, startAttach, startTangent, sweepAngle;
			this.deflection = deflection, square = function(l) {
				return l * l
			}, deflectionRadians = this.deflection * Math.PI / 180, startAttach = {
				x: Math.cos(deflectionRadians) * startRadius,
				y: Math.sin(deflectionRadians) * startRadius
			}, radiusRatio = startRadius / (endRadius + headLength), homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio), intersectWithOtherCircle = function(fixedPoint, radius, xCenter, polarity) {
				var A, B, C, gradient, hc, intersection;
				return gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter), hc = fixedPoint.y - gradient * fixedPoint.x, A = 1 + square(gradient), B = 2 * (gradient * hc - xCenter), C = square(hc) + square(xCenter) - square(radius), intersection = {
					x: (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A)
				}, intersection.y = (intersection.x - homotheticCenter) * gradient, intersection
			}, endAttach = intersectWithOtherCircle(startAttach, endRadius + headLength, endCentre, -1), g1 = -startAttach.x / startAttach.y, c1 = startAttach.y + square(startAttach.x) / startAttach.y, g2 = -(endAttach.x - endCentre) / endAttach.y, c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y, cx = (c1 - c2) / (g2 - g1), cy = g1 * cx + c1, arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y)), startAngle = Math.atan2(startAttach.x - cx, cy - startAttach.y), endAngle = Math.atan2(endAttach.x - cx, cy - endAttach.y), sweepAngle = endAngle - startAngle, this.deflection > 0 && (sweepAngle = 2 * Math.PI - sweepAngle), this.shaftLength = sweepAngle * arcRadius, startAngle > endAngle && (this.shaftLength = 0), midShaftAngle = (startAngle + endAngle) / 2, this.deflection > 0 && (midShaftAngle += Math.PI), this.midShaftPoint = {
				x: cx + arcRadius * Math.sin(midShaftAngle),
				y: cy - arcRadius * Math.cos(midShaftAngle)
			}, startTangent = function(dr) {
				var dx, dy;
				return dx = (0 > dr ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1))), dy = g1 * dx, {
					x: startAttach.x + dx,
					y: startAttach.y + dy
				}
			}, endTangent = function(dr) {
				var dx, dy;
				return dx = (0 > dr ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2))), dy = g2 * dx, {
					x: endAttach.x + dx,
					y: endAttach.y + dy
				}
			}, angleTangent = function(angle, dr) {
				return {
					x: cx + (arcRadius + dr) * Math.sin(angle),
					y: cy - (arcRadius + dr) * Math.cos(angle)
				}
			}, endNormal = function(dc) {
				var dx, dy;
				return dx = (0 > dc ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2))), dy = dx / g2, {
					x: endAttach.x + dx,
					y: endAttach.y - dy
				}
			}, endOverlayCorner = function(dr, dc) {
				var arrowTip, shoulder;
				return shoulder = endTangent(dr), arrowTip = endNormal(dc), {
					x: shoulder.x + arrowTip.x - endAttach.x,
					y: shoulder.y + arrowTip.y - endAttach.y
				}
			}, coord = function(point) {
				return point.x + "," + point.y
			}, shaftRadius = arrowWidth / 2, headRadius = headWidth / 2, positiveSweep = startAttach.y > 0 ? 0 : 1, negativeSweep = startAttach.y < 0 ? 0 : 1, this.outline = function(shortCaptionLength) {
				var captionSweep, endBreak, startBreak;
				return startAngle > endAngle ? ["M", coord(endTangent(-headRadius)), "L", coord(endNormal(headLength)), "L", coord(endTangent(headRadius)), "Z"].join(" ") : "external" === captionLayout ? (captionSweep = shortCaptionLength / arcRadius, this.deflection > 0 && (captionSweep *= -1), startBreak = midShaftAngle - captionSweep / 2, endBreak = midShaftAngle + captionSweep / 2, ["M", coord(startTangent(shaftRadius)), "L", coord(startTangent(-shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(angleTangent(startBreak, -shaftRadius)), "L", coord(angleTangent(startBreak, shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius)), "Z", "M", coord(angleTangent(endBreak, shaftRadius)), "L", coord(angleTangent(endBreak, -shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)), "L", coord(endTangent(-headRadius)), "L", coord(endNormal(headLength)), "L", coord(endTangent(headRadius)), "L", coord(endTangent(shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(angleTangent(endBreak, shaftRadius))].join(" ")) : ["M", coord(startTangent(shaftRadius)), "L", coord(startTangent(-shaftRadius)), "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, positiveSweep, coord(endTangent(-shaftRadius)), "L", coord(endTangent(-headRadius)), "L", coord(endNormal(headLength)), "L", coord(endTangent(headRadius)), "L", coord(endTangent(shaftRadius)), "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, negativeSweep, coord(startTangent(shaftRadius))].join(" ")
			}, this.overlay = function(minWidth) {
				var radius;
				return radius = Math.max(minWidth / 2, shaftRadius), ["M", coord(startTangent(radius)), "L", coord(startTangent(-radius)), "A", arcRadius - radius, arcRadius - radius, 0, 0, positiveSweep, coord(endTangent(-radius)), "L", coord(endOverlayCorner(-radius, headLength)), "L", coord(endOverlayCorner(radius, headLength)), "L", coord(endTangent(radius)), "A", arcRadius + radius, arcRadius + radius, 0, 0, negativeSweep, coord(startTangent(radius))].join(" ")
			}
		}
		return arcArrow
	}(), neo.utils.cloneArray = function(original) {
		var clone, i, idx, len, node;
		for(clone = new Array(original.length), idx = i = 0, len = original.length; len > i; idx = ++i) node = original[idx], clone[idx] = node;
		return clone
	}, neo.utils.circularLayout = function(nodes, center, radius) {
		var i, j, k, len, len1, n, node, results, unlocatedNodes;
		for(unlocatedNodes = [], j = 0, len = nodes.length; len > j; j++) node = nodes[j], (null == node.x || null == node.y) && unlocatedNodes.push(node);
		for(results = [], i = k = 0, len1 = unlocatedNodes.length; len1 > k; i = ++k) n = unlocatedNodes[i], n.x = center.x + radius * Math.sin(2 * Math.PI * i / unlocatedNodes.length), results.push(n.y = center.y + radius * Math.cos(2 * Math.PI * i / unlocatedNodes.length));
		return results
	}, neo.utils.distributeCircular = function(arrowAngles, minSeparation) {
		var angle, angleList, center, i, j, k, key, l, len, len1, list, m, moveableRuns, n, o, rawAngle, ref, ref1, ref2, ref3, ref4, ref5, result, run, runLength, runsOfTooDenseArrows, separation, splitByFixedArrows, tooDenseRun, wrapAngle;
		list = [], ref = arrowAngles.floating;
		for(key in ref) angle = ref[key], list.push({
			key: key,
			angle: angle,
			fixed: !1
		});
		ref1 = arrowAngles.fixed;
		for(key in ref1) angle = ref1[key], list.push({
			key: key,
			angle: angle,
			fixed: !0
		});
		for(list.sort(function(a, b) {
				return a.angle - b.angle
			}), angleList = new neo.utils.angleList(list), runsOfTooDenseArrows = (new neo.utils.adjacentAngles).findRuns(angleList, minSeparation), wrapAngle = function(angle) {
				return angle >= 360 ? angle - 360 : 0 > angle ? angle + 360 : angle
			}, result = {}, splitByFixedArrows = function(run) {
				var currentStart, i, j, ref2, runs, wrapped;
				for(runs = [], currentStart = run.start, i = j = 1, ref2 = angleList.length(run); ref2 >= 1 ? ref2 >= j : j >= ref2; i = ref2 >= 1 ? ++j : --j) wrapped = angleList.wrapIndex(run.start + i), angleList.fixed(wrapped) && (runs.push({
					start: currentStart,
					end: wrapped
				}), currentStart = wrapped);
				return angleList.fixed(run.end) || runs.push({
					start: currentStart,
					end: run.end
				}), runs
			}, j = 0, len = runsOfTooDenseArrows.length; len > j; j++)
			for(tooDenseRun = runsOfTooDenseArrows[j], moveableRuns = splitByFixedArrows(tooDenseRun), k = 0, len1 = moveableRuns.length; len1 > k; k++)
				if(run = moveableRuns[k], runLength = angleList.length(run), angleList.fixed(run.start) && angleList.fixed(run.end))
					for(separation = angleList.angle(run) / runLength, i = l = 0, ref2 = runLength; ref2 >= 0 ? ref2 >= l : l >= ref2; i = ref2 >= 0 ? ++l : --l) rawAngle = list[run.start].angle + i * separation, result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
				else if(angleList.fixed(run.start) && !angleList.fixed(run.end))
			for(i = m = 0, ref3 = runLength; ref3 >= 0 ? ref3 >= m : m >= ref3; i = ref3 >= 0 ? ++m : --m) rawAngle = list[run.start].angle + i * minSeparation, result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
		else if(!angleList.fixed(run.start) && angleList.fixed(run.end))
			for(i = n = 0, ref4 = runLength; ref4 >= 0 ? ref4 >= n : n >= ref4; i = ref4 >= 0 ? ++n : --n) rawAngle = list[run.end].angle - (runLength - i) * minSeparation, result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
		else
			for(center = list[run.start].angle + angleList.angle(run) / 2, i = o = 0, ref5 = runLength; ref5 >= 0 ? ref5 >= o : o >= ref5; i = ref5 >= 0 ? ++o : --o) rawAngle = center + (i - runLength / 2) * minSeparation, result[list[angleList.wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
		for(key in arrowAngles.floating) result.hasOwnProperty(key) || (result[key] = arrowAngles.floating[key]);
		for(key in arrowAngles.fixed) result.hasOwnProperty(key) || (result[key] = arrowAngles.fixed[key]);
		return result
	}, neo.utils.circumferentialRelationshipRouting = function() {
		function circumferentialRelationshipRouting(style) {
			this.style = style
		}
		return circumferentialRelationshipRouting.prototype.measureRelationshipCaption = function(relationship, caption) {
			var fontFamily, fontSize, padding;
			return fontFamily = "sans-serif", fontSize = parseFloat(this.style.forRelationship(relationship).get("font-size")), padding = parseFloat(this.style.forRelationship(relationship).get("padding")), neo.utils.measureText(caption, fontFamily, fontSize) + 2 * padding
		}, circumferentialRelationshipRouting.prototype.captionFitsInsideArrowShaftWidth = function(relationship) {
			return parseFloat(this.style.forRelationship(relationship).get("shaft-width")) > parseFloat(this.style.forRelationship(relationship).get("font-size"))
		}, circumferentialRelationshipRouting.prototype.measureRelationshipCaptions = function(relationships) {
			var i, len, relationship, results;
			for(results = [], i = 0, len = relationships.length; len > i; i++) relationship = relationships[i], relationship.captionLength = this.measureRelationshipCaption(relationship, relationship.type), results.push(relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(relationship) ? "internal" : "external");
			return results
		}, circumferentialRelationshipRouting.prototype.shortenCaption = function(relationship, caption, targetWidth) {
			var shortCaption, width;
			for(shortCaption = caption;;) {
				if(shortCaption.length <= 2) return ["", 0];
				if(shortCaption = shortCaption.substr(0, shortCaption.length - 2) + "\u2026", width = this.measureRelationshipCaption(relationship, shortCaption), targetWidth > width) return [shortCaption, width]
			}
		}, circumferentialRelationshipRouting.prototype.layoutRelationships = function(graph) {
			var angle, arrowAngles, centreDistance, deflection, distributedAngles, dx, dy, headHeight, headRadius, i, id, j, k, l, len, len1, len2, len3, node, ref, ref1, ref2, ref3, relationship, relationshipMap, relationships, results, shaftRadius, sortedNodes, square;
			for(ref = graph.relationships(), i = 0, len = ref.length; len > i; i++) relationship = ref[i], dx = relationship.target.x - relationship.source.x, dy = relationship.target.y - relationship.source.y, relationship.naturalAngle = (Math.atan2(dy, dx) / Math.PI * 180 + 180) % 360, delete relationship.arrow;
			for(sortedNodes = graph.nodes().sort(function(a, b) {
					return b.relationshipCount(graph) - a.relationshipCount(graph)
				}), results = [], j = 0, len1 = sortedNodes.length; len1 > j; j++) {
				for(node = sortedNodes[j], relationships = [], ref1 = graph.relationships(), k = 0, len2 = ref1.length; len2 > k; k++) relationship = ref1[k], (relationship.source === node || relationship.target === node) && relationships.push(relationship);
				for(arrowAngles = {
						floating: {},
						fixed: {}
					}, relationshipMap = {}, l = 0, len3 = relationships.length; len3 > l; l++) relationship = relationships[l], relationshipMap[relationship.id] = relationship, node === relationship.source && (relationship.hasOwnProperty("arrow") ? arrowAngles.fixed[relationship.id] = relationship.naturalAngle + relationship.arrow.deflection : arrowAngles.floating[relationship.id] = relationship.naturalAngle), node === relationship.target && (relationship.hasOwnProperty("arrow") ? arrowAngles.fixed[relationship.id] = (relationship.naturalAngle - relationship.arrow.deflection + 180) % 360 : arrowAngles.floating[relationship.id] = (relationship.naturalAngle + 180) % 360);
				distributedAngles = {}, ref2 = arrowAngles.floating;
				for(id in ref2) angle = ref2[id], distributedAngles[id] = angle;
				ref3 = arrowAngles.fixed;
				for(id in ref3) angle = ref3[id], distributedAngles[id] = angle;
				relationships.length > 1 && (distributedAngles = neo.utils.distributeCircular(arrowAngles, 30)), results.push(function() {
					var ref4, results1;
					results1 = [];
					for(id in distributedAngles) angle = distributedAngles[id], relationship = relationshipMap[id], relationship.hasOwnProperty("arrow") ? results1.push(void 0) : (deflection = node === relationship.source ? angle - relationship.naturalAngle : (relationship.naturalAngle - angle + 180) % 360, shaftRadius = parseFloat(this.style.forRelationship(relationship).get("shaft-width")) / 2 || 2, headRadius = shaftRadius + 3, headHeight = 2 * headRadius, dx = relationship.target.x - relationship.source.x, dy = relationship.target.y - relationship.source.y, square = function(distance) {
						return distance * distance
					}, centreDistance = Math.sqrt(square(dx) + square(dy)), Math.abs(deflection) < Math.PI / 180 ? relationship.arrow = new neo.utils.straightArrow(relationship.source.radius, relationship.target.radius, centreDistance, shaftRadius, headRadius, headHeight, relationship.captionLayout) : relationship.arrow = new neo.utils.arcArrow(relationship.source.radius, relationship.target.radius, centreDistance, deflection, 2 * shaftRadius, 2 * headRadius, headHeight, relationship.captionLayout), results1.push((ref4 = relationship.arrow.shaftLength > relationship.captionLength ? [relationship.caption, relationship.captionLength] : this.shortenCaption(relationship, relationship.caption, relationship.arrow.shaftLength), relationship.shortCaption = ref4[0], relationship.shortCaptionLength = ref4[1], ref4)));
					return results1
				}.call(this))
			}
			return results
		}, circumferentialRelationshipRouting
	}(), neo.utils.clickHandler = function() {
		var cc, event;
		return cc = function(selection) {
			var dist, down, last, tolerance, wait;
			return dist = function(a, b) {
				return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2))
			}, down = void 0, tolerance = 5, last = void 0, wait = null, selection.on("mousedown", function() {
				return d3.event.target.__data__.fixed = !0, down = d3.mouse(document.body), last = +new Date, d3.event.stopPropagation()
			}), selection.on("mouseup", function() {
				return dist(down, d3.mouse(document.body)) > tolerance ? void 0 : wait ? (window.clearTimeout(wait), wait = null, event.dblclick(d3.event.target.__data__)) : (event.click(d3.event.target.__data__), wait = window.setTimeout(function(e) {
					return function() {
						return wait = null
					}
				}(d3.event), 250))
			})
		}, event = d3.dispatch("click", "dblclick"), d3.rebind(cc, event, "on")
	}, neo.utils.loopArrow = function() {
		function loopArrow(nodeRadius, straightLength, spreadDegrees, shaftWidth, headWidth, headLength, captionHeight) {
			var Point, endPoint, loopRadius, normalPoint, r1, r2, r3, shaftRadius, spread, startPoint;
			spread = spreadDegrees * Math.PI / 180, r1 = nodeRadius, r2 = nodeRadius + headLength, r3 = nodeRadius + straightLength, loopRadius = r3 * Math.tan(spread / 2), shaftRadius = shaftWidth / 2, this.shaftLength = 3 * loopRadius + shaftWidth, Point = function() {
				function Point(x, y) {
					this.x = x, this.y = y
				}
				return Point.prototype.toString = function() {
					return this.x + " " + this.y
				}, Point
			}(), normalPoint = function(sweep, radius, displacement) {
				var cy, localLoopRadius;
				return localLoopRadius = radius * Math.tan(spread / 2), cy = radius / Math.cos(spread / 2), new Point((localLoopRadius + displacement) * Math.sin(sweep), cy + (localLoopRadius + displacement) * Math.cos(sweep))
			}, this.midShaftPoint = normalPoint(0, r3, shaftRadius + captionHeight / 2 + 2), startPoint = function(radius, displacement) {
				return normalPoint((Math.PI + spread) / 2, radius, displacement)
			}, endPoint = function(radius, displacement) {
				return normalPoint(-(Math.PI + spread) / 2, radius, displacement)
			}, this.outline = function() {
				var inner, outer;
				return inner = loopRadius - shaftRadius, outer = loopRadius + shaftRadius, ["M", startPoint(r1, shaftRadius), "L", startPoint(r3, shaftRadius), "A", outer, outer, 0, 1, 1, endPoint(r3, shaftRadius), "L", endPoint(r2, shaftRadius), "L", endPoint(r2, -headWidth / 2), "L", endPoint(r1, 0), "L", endPoint(r2, headWidth / 2), "L", endPoint(r2, -shaftRadius), "L", endPoint(r3, -shaftRadius), "A", inner, inner, 0, 1, 0, startPoint(r3, -shaftRadius), "L", startPoint(r1, -shaftRadius), "Z"].join(" ")
			}, this.overlay = function(minWidth) {
				var displacement, inner, outer;
				return displacement = Math.max(minWidth / 2, shaftRadius), inner = loopRadius - displacement, outer = loopRadius + displacement, ["M", startPoint(r1, displacement), "L", startPoint(r3, displacement), "A", outer, outer, 0, 1, 1, endPoint(r3, displacement), "L", endPoint(r2, displacement), "L", endPoint(r2, -displacement), "L", endPoint(r3, -displacement), "A", inner, inner, 0, 1, 0, startPoint(r3, -displacement), "L", startPoint(r1, -displacement), "Z"].join(" ")
			}
		}
		return loopArrow
	}(), neo.utils.pairwiseArcsRelationshipRouting = function() {
		function pairwiseArcsRelationshipRouting(style) {
			this.style = style
		}
		return pairwiseArcsRelationshipRouting.prototype.measureRelationshipCaption = function(relationship, caption) {
			var fontFamily, padding;
			return fontFamily = "sans-serif", padding = parseFloat(this.style.forRelationship(relationship).get("padding")), neo.utils.measureText(caption, fontFamily, relationship.captionHeight) + 2 * padding
		}, pairwiseArcsRelationshipRouting.prototype.captionFitsInsideArrowShaftWidth = function(relationship) {
			return parseFloat(this.style.forRelationship(relationship).get("shaft-width")) > relationship.captionHeight
		}, pairwiseArcsRelationshipRouting.prototype.measureRelationshipCaptions = function(relationships) {
			var j, len, relationship, results;
			for(results = [], j = 0, len = relationships.length; len > j; j++) relationship = relationships[j], relationship.captionHeight = parseFloat(this.style.forRelationship(relationship).get("font-size")), relationship.captionLength = this.measureRelationshipCaption(relationship, relationship.caption), results.push(relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(relationship) && !relationship.isLoop() ? "internal" : "external");
			return results
		}, pairwiseArcsRelationshipRouting.prototype.shortenCaption = function(relationship, caption, targetWidth) {
			var shortCaption, width;
			for(shortCaption = caption || "caption";;) {
				if(shortCaption.length <= 2) return ["", 0];
				if(shortCaption = shortCaption.substr(0, shortCaption.length - 2) + "\u2026", width = this.measureRelationshipCaption(relationship, shortCaption), targetWidth > width) return [shortCaption, width]
			}
		}, pairwiseArcsRelationshipRouting.prototype.computeGeometryForNonLoopArrows = function(nodePairs) {
			var angle, centreDistance, dx, dy, j, len, nodePair, relationship, results, square;
			for(square = function(distance) {
					return distance * distance
				}, results = [], j = 0, len = nodePairs.length; len > j; j++) nodePair = nodePairs[j], nodePair.isLoop() ? results.push(void 0) : (dx = nodePair.nodeA.x - nodePair.nodeB.x, dy = nodePair.nodeA.y - nodePair.nodeB.y, angle = (Math.atan2(dy, dx) / Math.PI * 180 + 360) % 360, centreDistance = Math.sqrt(square(dx) + square(dy)), results.push(function() {
				var k, len1, ref, results1;
				for(ref = nodePair.relationships, results1 = [], k = 0, len1 = ref.length; len1 > k; k++) relationship = ref[k], relationship.naturalAngle = relationship.target === nodePair.nodeA ? (angle + 180) % 360 : angle, results1.push(relationship.centreDistance = centreDistance);
				return results1
			}()));
			return results
		}, pairwiseArcsRelationshipRouting.prototype.distributeAnglesForLoopArrows = function(nodePairs, relationships) {
			var angle, angles, biggestGap, end, i, j, k, l, len, len1, len2, node, nodePair, relationship, results, separation, start;
			for(results = [], j = 0, len = nodePairs.length; len > j; j++)
				if(nodePair = nodePairs[j], nodePair.isLoop()) {
					for(angles = [],
						node = nodePair.nodeA, k = 0, len1 = relationships.length; len1 > k; k++) relationship = relationships[k], relationship.isLoop() || (relationship.source === node && angles.push(relationship.naturalAngle), relationship.target === node && angles.push(relationship.naturalAngle + 180));
					if(angles = angles.map(function(a) {
							return(a + 360) % 360
						}).sort(function(a, b) {
							return a - b
						}), angles.length > 0) {
						for(biggestGap = {
								start: 0,
								end: 0
							}, i = l = 0, len2 = angles.length; len2 > l; i = ++l) angle = angles[i], start = angle, end = i === angles.length - 1 ? angles[0] + 360 : angles[i + 1], end - start > biggestGap.end - biggestGap.start && (biggestGap.start = start, biggestGap.end = end);
						separation = (biggestGap.end - biggestGap.start) / (nodePair.relationships.length + 1), results.push(function() {
							var len3, m, ref, results1;
							for(ref = nodePair.relationships, results1 = [], i = m = 0, len3 = ref.length; len3 > m; i = ++m) relationship = ref[i], results1.push(relationship.naturalAngle = (biggestGap.start + (i + 1) * separation - 90) % 360);
							return results1
						}())
					} else separation = 360 / nodePair.relationships.length, results.push(function() {
						var len3, m, ref, results1;
						for(ref = nodePair.relationships, results1 = [], i = m = 0, len3 = ref.length; len3 > m; i = ++m) relationship = ref[i], results1.push(relationship.naturalAngle = i * separation);
						return results1
					}())
				} else results.push(void 0);
			return results
		}, pairwiseArcsRelationshipRouting.prototype.layoutRelationships = function(graph) {
			var defaultDeflectionStep, deflection, deflectionStep, headHeight, headWidth, i, j, k, len, len1, maximumTotalDeflection, middleRelationshipIndex, nodePair, nodePairs, numberOfSteps, ref, relationship, results, shaftWidth, totalDeflection;
			for(nodePairs = graph.groupedRelationships(), this.computeGeometryForNonLoopArrows(nodePairs), this.distributeAnglesForLoopArrows(nodePairs, graph.relationships()), results = [], j = 0, len = nodePairs.length; len > j; j++) {
				for(nodePair = nodePairs[j], ref = nodePair.relationships, k = 0, len1 = ref.length; len1 > k; k++) relationship = ref[k], delete relationship.arrow;
				middleRelationshipIndex = (nodePair.relationships.length - 1) / 2, defaultDeflectionStep = 30, maximumTotalDeflection = 150, numberOfSteps = nodePair.relationships.length - 1, totalDeflection = defaultDeflectionStep * numberOfSteps, deflectionStep = totalDeflection > maximumTotalDeflection ? maximumTotalDeflection / numberOfSteps : defaultDeflectionStep, results.push(function() {
					var l, len2, ref1, ref2, results1;
					for(ref1 = nodePair.relationships, results1 = [], i = l = 0, len2 = ref1.length; len2 > l; i = ++l) relationship = ref1[i], shaftWidth = parseFloat(this.style.forRelationship(relationship).get("shaft-width")) || 2, headWidth = shaftWidth + 6, headHeight = headWidth, nodePair.isLoop() ? relationship.arrow = new neo.utils.loopArrow(relationship.source.radius, 40, defaultDeflectionStep, shaftWidth, headWidth, headHeight, relationship.captionHeight) : i === middleRelationshipIndex ? relationship.arrow = new neo.utils.straightArrow(relationship.source.radius, relationship.target.radius, relationship.centreDistance, shaftWidth, headWidth, headHeight, relationship.captionLayout) : (deflection = deflectionStep * (i - middleRelationshipIndex), nodePair.nodeA !== relationship.source && (deflection *= -1), relationship.arrow = new neo.utils.arcArrow(relationship.source.radius, relationship.target.radius, relationship.centreDistance, deflection, shaftWidth, headWidth, headHeight, relationship.captionLayout)), results1.push((ref2 = relationship.arrow.shaftLength > relationship.captionLength ? [relationship.caption, relationship.captionLength] : this.shortenCaption(relationship, relationship.caption, relationship.arrow.shaftLength), relationship.shortCaption = ref2[0], relationship.shortCaptionLength = ref2[1], ref2));
					return results1
				}.call(this))
			}
			return results
		}, pairwiseArcsRelationshipRouting
	}(), neo.utils.straightArrow = function() {
		function straightArrow(startRadius, endRadius, centreDistance, shaftWidth, headWidth, headHeight, captionLayout) {
			var endArrow, endShaft, headRadius, shaftRadius, startArrow;
			this.length = centreDistance - (startRadius + endRadius), this.shaftLength = this.length - headHeight, startArrow = startRadius, endShaft = startArrow + this.shaftLength, endArrow = startArrow + this.length, shaftRadius = shaftWidth / 2, headRadius = headWidth / 2, this.midShaftPoint = {
				x: startArrow + this.shaftLength / 2,
				y: 0
			}, this.outline = function(shortCaptionLength) {
				var endBreak, startBreak;
				return "external" === captionLayout ? (startBreak = startArrow + (this.shaftLength - shortCaptionLength) / 2, endBreak = endShaft - (this.shaftLength - shortCaptionLength) / 2, ["M", startArrow, shaftRadius, "L", startBreak, shaftRadius, "L", startBreak, -shaftRadius, "L", startArrow, -shaftRadius, "Z", "M", endBreak, shaftRadius, "L", endShaft, shaftRadius, "L", endShaft, headRadius, "L", endArrow, 0, "L", endShaft, -headRadius, "L", endShaft, -shaftRadius, "L", endBreak, -shaftRadius, "Z"].join(" ")) : ["M", startArrow, shaftRadius, "L", endShaft, shaftRadius, "L", endShaft, headRadius, "L", endArrow, 0, "L", endShaft, -headRadius, "L", endShaft, -shaftRadius, "L", startArrow, -shaftRadius, "Z"].join(" ")
			}, this.overlay = function(minWidth) {
				var radius;
				return radius = Math.max(minWidth / 2, shaftRadius), ["M", startArrow, radius, "L", endArrow, radius, "L", endArrow, -radius, "L", startArrow, -radius, "Z"].join(" ")
			}
		}
		return straightArrow.prototype.deflection = 0, straightArrow
	}(), neo.utils.measureText = function() {
		var cache, measureUsingCanvas;
		return measureUsingCanvas = function(text, font) {
				var canvas, canvasSelection, context;
				return canvasSelection = d3.select("canvas#textMeasurementCanvas").data([this]), canvasSelection.enter().append("canvas").attr("id", "textMeasurementCanvas").style("display", "none"), canvas = canvasSelection.node(), context = canvas.getContext("2d"), context.font = font, context.measureText(text).width
			}, cache = function() {
				var cacheSize, list, map;
				return cacheSize = 1e4, map = {}, list = [],
					function(key, calc) {
						var cached, result;
						return cached = map[key], cached ? cached : (result = calc(), list.length > cacheSize && (delete map[list.splice(0, 1)], list.push(key)), map[key] = result)
					}
			}(),
			function(text, fontFamily, fontSize) {
				var font;
				return font = "normal normal normal " + fontSize + "px/normal " + fontFamily, cache(text + font, function() {
					return measureUsingCanvas(text, font)
				})
			}
	}(),
	function() {
		var arrowPath, nodeCaption, nodeIcon, nodeOutline, nodeRing, nodeRingStrokeSize, noop, relationshipOverlay, relationshipType;
		return noop = function() {}, nodeRingStrokeSize = 8, nodeOutline = new neo.Renderer({
			onGraphChange: function(selection, viz) {
				var circles;
				return circles = selection.selectAll("circle.outline").data(function(node) {
					return [node]
				}), circles.enter().append("circle").classed("outline", !0).attr({
					cx: 0,
					cy: 0
				}), circles.attr({
					r: function(node) {
						return node.radius
					},
					fill: function(node) {
						return viz.style.forNode(node).get("color")
					},
					stroke: function(node) {
						return viz.style.forNode(node).get("border-color")
					},
					"stroke-width": function(node) {
						return viz.style.forNode(node).get("border-width")
					}
				}), circles.exit().remove()
			},
			onTick: noop
		}), nodeCaption = new neo.Renderer({
			onGraphChange: function(selection, viz) {
				var text;
				return text = selection.selectAll("text.caption").data(function(node) {
					return node.caption
				}), text.enter().append("text").classed("caption", !0).attr({
					"text-anchor": "middle"
				}).attr({
					"pointer-events": "none"
				}), text.text(function(line) {
					return line.text
				}).attr("y", function(line) {
					return line.baseline
				}).attr("font-size", function(line) {
					return viz.style.forNode(line.node).get("font-size")
				}).attr({
					fill: function(line) {
						return viz.style.forNode(line.node).get("text-color-internal")
					}
				}), text.exit().remove()
			},
			onTick: noop
		}), nodeIcon = new neo.Renderer({
			onGraphChange: function(selection, viz) {
				var text;
				return text = selection.selectAll("text").data(function(node) {
					return node.caption
				}), text.enter().append("text").attr({
					"text-anchor": "middle"
				}).attr({
					"pointer-events": "none"
				}).attr({
					"font-family": "streamline"
				}), text.text(function(line) {
					return viz.style.forNode(line.node).get("icon-code")
				}).attr("dy", function(line) {
					return line.node.radius / 16
				}).attr("font-size", function(line) {
					return line.node.radius
				}).attr({
					fill: function(line) {
						return viz.style.forNode(line.node).get("text-color-internal")
					}
				}), text.exit().remove()
			},
			onTick: noop
		}), nodeRing = new neo.Renderer({
			onGraphChange: function(selection) {
				var circles;
				return circles = selection.selectAll("circle.ring").data(function(node) {
					return [node]
				}), circles.enter().insert("circle", ".outline").classed("ring", !0).attr({
					cx: 0,
					cy: 0,
					"stroke-width": nodeRingStrokeSize + "px"
				}), circles.attr({
					r: function(node) {
						return node.radius + 4
					}
				}), circles.exit().remove()
			},
			onTick: noop
		}), arrowPath = new neo.Renderer({
			name: "arrowPath",
			onGraphChange: function(selection, viz) {
				var paths;
				return paths = selection.selectAll("path.outline").data(function(rel) {
					return [rel]
				}), paths.enter().append("path").classed("outline", !0), paths.attr("fill", function(rel) {
					return viz.style.forRelationship(rel).get("color")
				}).attr("stroke", "none"), paths.exit().remove()
			},
			onTick: function(selection) {
				return selection.selectAll("path").attr("d", function(d) {
					return d.arrow.outline(d.shortCaptionLength)
				})
			}
		}), relationshipType = new neo.Renderer({
			name: "relationshipType",
			onGraphChange: function(selection, viz) {
				var texts;
				return texts = selection.selectAll("text").data(function(rel) {
					return [rel]
				}), texts.enter().append("text").attr({
					"text-anchor": "middle"
				}).attr({
					"pointer-events": "none"
				}), texts.attr("font-size", function(rel) {
					return viz.style.forRelationship(rel).get("font-size")
				}).attr("fill", function(rel) {
					return viz.style.forRelationship(rel).get("text-color-" + rel.captionLayout)
				}), texts.exit().remove()
			},
			onTick: function(selection, viz) {
				return selection.selectAll("text").attr("x", function(rel) {
					return rel.arrow.midShaftPoint.x
				}).attr("y", function(rel) {
					return rel.arrow.midShaftPoint.y + parseFloat(viz.style.forRelationship(rel).get("font-size")) / 2 - 1
				}).attr("transform", function(rel) {
					return rel.naturalAngle < 90 || rel.naturalAngle > 270 ? "rotate(180 " + rel.arrow.midShaftPoint.x + " " + rel.arrow.midShaftPoint.y + ")" : null
				}).text(function(rel) {
					return rel.shortCaption
				})
			}
		}), relationshipOverlay = new neo.Renderer({
			name: "relationshipOverlay",
			onGraphChange: function(selection) {
				var rects;
				return rects = selection.selectAll("path.overlay").data(function(rel) {
					return [rel]
				}), rects.enter().append("path").classed("overlay", !0), rects.exit().remove()
			},
			onTick: function(selection) {
				var band;
				return band = 16, selection.selectAll("path.overlay").attr("d", function(d) {
					return d.arrow.overlay(band)
				})
			}
		}), neo.renderers.node.push(nodeOutline), neo.renderers.node.push(nodeIcon), neo.renderers.node.push(nodeCaption), neo.renderers.node.push(nodeRing), neo.renderers.relationship.push(arrowPath), neo.renderers.relationship.push(relationshipType), neo.renderers.relationship.push(relationshipOverlay)
	}(),
	function() {
		var arc, attachContextEvent, createMenuItem, donutExpandNode, donutRemoveNode, donutUnlockNode, getSelectedNode, noop, numberOfItemsInContextMenu;
		return noop = function() {}, numberOfItemsInContextMenu = 3, arc = function(radius, itemNumber, width) {
			var endAngle, innerRadius, startAngle;
			return null == width && (width = 30), itemNumber -= 1, startAngle = 2 * Math.PI / numberOfItemsInContextMenu * itemNumber, endAngle = startAngle + 2 * Math.PI / numberOfItemsInContextMenu, innerRadius = Math.max(radius + 8, 20), d3.svg.arc().innerRadius(innerRadius).outerRadius(innerRadius + width).startAngle(startAngle).endAngle(endAngle).padAngle(.03)
		}, getSelectedNode = function(node) {
			return node.selected ? [node] : []
		}, attachContextEvent = function(event, elems, viz, content, label) {
			var elem, i, len, results;
			for(results = [], i = 0, len = elems.length; len > i; i++) elem = elems[i], elem.on("mousedown.drag", function() {
				return d3.event.stopPropagation(), null
			}), elem.on("mouseup", function(node) {
				return viz.trigger(event, node)
			}), elem.on("mouseover", function(node) {
				return node.contextMenu = {
					menuSelection: event,
					menuContent: content,
					label: label
				}, viz.trigger("menuMouseOver", node)
			}), results.push(elem.on("mouseout", function(node) {
				return delete node.contextMenu, viz.trigger("menuMouseOut", node)
			}));
			return results
		}, createMenuItem = function(selection, viz, eventName, itemNumber, className, position, textValue, helpValue) {
			var path, tab, text, textpath;
			return path = selection.selectAll("path." + className).data(getSelectedNode), textpath = selection.selectAll("text." + className).data(getSelectedNode), tab = path.enter().append("path").classed(className, !0).classed("context-menu-item", !0).attr({
				d: function(node) {
					return arc(node.radius, itemNumber, 1)()
				}
			}), text = textpath.enter().append("text").classed("context-menu-item", !0).text(textValue).attr("transform", "scale(0.1)").attr({
				"font-family": "FontAwesome",
				fill: function(node) {
					return viz.style.forNode(node).get("text-color-internal")
				},
				x: function(node) {
					return arc(node.radius, itemNumber).centroid()[0] + position[0]
				},
				y: function(node) {
					return arc(node.radius, itemNumber).centroid()[1] + position[1]
				}
			}), attachContextEvent(eventName, [tab, text], viz, helpValue, textValue), tab.transition().duration(200).attr({
				d: function(node) {
					return arc(node.radius, itemNumber)()
				}
			}), text.attr("transform", "scale(1)"), path.exit().transition().duration(200).attr({
				d: function(node) {
					return arc(node.radius, itemNumber, 1)()
				}
			}).remove(), textpath.exit().attr("transform", "scale(0)").remove()
		}, donutRemoveNode = new neo.Renderer({
			onGraphChange: function(selection, viz) {
				return createMenuItem(selection, viz, "nodeClose", 1, "remove_node", [-4, 0], "\uf00d", "Remove node from the visualization")
			},
			onTick: noop
		}), donutExpandNode = new neo.Renderer({
			onGraphChange: function(selection, viz) {
				return createMenuItem(selection, viz, "nodeDblClicked", 2, "expand_node", [0, 4], "\uf0b2", "Expand child relationships")
			},
			onTick: noop
		}), donutUnlockNode = new neo.Renderer({
			onGraphChange: function(selection, viz) {
				return createMenuItem(selection, viz, "nodeUnlock", 3, "unlock_node", [4, 0], "\uf09c", "Unlock the node to re-layout the graph")
			},
			onTick: noop
		}), neo.renderers.menu.push(donutExpandNode), neo.renderers.menu.push(donutRemoveNode), neo.renderers.menu.push(donutUnlockNode)
	}(), angular.module("neo4jApp.services").service("HistoryService", ["Settings", "localStorageService", function(Settings, localStorageService) {
		var HistoryService, storageKey;
		return storageKey = "history", new(HistoryService = function() {
			function HistoryService() {
				this.history = localStorageService.get(storageKey), angular.isArray(this.history) || (this.history = []), this.current = "", this.cursor = -1
			}
			return HistoryService.prototype.add = function(input) {
				if(this.current = "", (null != input ? input.length : void 0) > 0 && this.history[0] !== input) {
					for(this.history.unshift(input); !(this.history.length <= Settings.maxHistory);) this.history.pop();
					localStorageService.set(storageKey, JSON.stringify(this.history))
				}
				return this.get(-1)
			}, HistoryService.prototype.next = function() {
				var idx;
				return idx = this.cursor, null == idx && (idx = this.history.length), idx--, this.get(idx)
			}, HistoryService.prototype.prev = function() {
				var idx;
				return idx = this.cursor, null == idx && (idx = -1), idx++, this.get(idx)
			}, HistoryService.prototype.setBuffer = function(input) {
				return this.buffer = input
			}, HistoryService.prototype.get = function(idx) {
				return -1 === this.cursor && -1 !== idx && (this.current = this.buffer), 0 > idx && (idx = -1), idx >= this.history.length && (idx = this.history.length - 1), this.cursor = idx, this.history[idx] || this.current
			}, HistoryService
		}())
	}]), angular.module("neo4jApp.directives").directive("serverTopic", ["$rootScope", "Frame", "Settings", function($rootScope, Frame, Settings) {
		return {
			restrict: "A",
			link: function(scope, element, attrs) {
				var command, topic;
				return topic = attrs.serverTopic, command = "server", topic ? element.on("click", function(e) {
					return e.preventDefault(), topic = topic.toLowerCase().trim(), Frame.create({
						input: "" + Settings.cmdchar + command + " " + topic
					}), $rootScope.$$phase ? void 0 : $rootScope.$apply()
				}) : void 0
			}
		}
	}]), angular.module("neo4jApp.services").factory("AsciiTableFactory", ["AsciiTable", function(AsciiTable) {
		var AsciiTableClass, at;
		return at = AsciiTable, AsciiTableClass = function() {
			function AsciiTableClass() {
				this.maxWidth = 0, this.serializedItems = null
			}
			return AsciiTableClass.prototype.get = function(items, maxColumnWidth) {
				return this.maxWidth || (this.maxWidth = at.maxColumnWidth(items)), at.table(items, maxColumnWidth)
			}, AsciiTableClass.prototype.setData = function(items) {
				return this.serializedItems = at.serializeData(items)
			}, AsciiTableClass.prototype.getFromSerializedData = function(maxColumnWidth) {
				return at.tableFromSerializedData(this.serializedItems, maxColumnWidth)
			}, AsciiTableClass
		}(), {
			getInstance: function() {
				return new AsciiTableClass
			}
		}
	}]), angular.module("neo4jApp.services").service("CypherParser", ["Utils", "Cypher", "Settings", function(Utils, Cypher, Settings) {
		var CypherParser;
		return new(CypherParser = function() {
			function CypherParser() {
				this.last_checked_query = ""
			}
			return CypherParser.prototype.isPeriodicCommit = function(input) {
				var clean_input, pattern;
				return pattern = /(^|\s+)USING\s+PERIODIC\s+COMMIT/i, clean_input = Utils.stripComments(input), pattern.test(clean_input)
			}, CypherParser.prototype.isProfileExplain = function(input) {
				var clean_input, pattern;
				return pattern = /^\s*(PROFILE|EXPLAIN)\s/i, clean_input = Utils.stripComments(input), pattern.test(clean_input)
			}, CypherParser.prototype.runHints = function(editor, cb) {
				var input, p, that;
				return(input = editor.getValue()) ? input === this.last_checked_query || this.isPeriodicCommit(input) || this.isProfileExplain(input) ? void 0 : (this.last_checked_query = input, that = this, p = Cypher.transaction().commit("EXPLAIN " + input), p.then(function(res) {
					return cb(null, res)
				}, function() {
					return cb(!0, null), that.last_checked_query = ""
				})) : editor.clearGutter("cypher-hints")
			}, CypherParser
		}())
	}]), angular.module("neo4jApp.services").service("ConnectionStatusService", ["$rootScope", "AuthDataService", "Settings", "$timeout", function($rootScope, AuthDataService, Settings, $timeout) {
		var that;
		return this.updatePersistentAuthData = function(data) {
			return data ? AuthDataService.setAuthData(data) : AuthDataService.clearAuthData()
		}, this.updatePersistentLastUser = function(lastUser) {
			return lastUser ? AuthDataService.setLastUser(lastUser) : AuthDataService.clearLastUser()
		}, this.unpersistCredentials = function() {
			return AuthDataService.clearPersistentAuthData()
		}, this.updateRetainConnectionCredentials = function(retainConnectionCredentials) {
			var ref, ref1;
			return(null != (ref = $rootScope.neo4j) ? ref.enterpriseEdition : void 0) ? retainConnectionCredentials === !0 && (retainConnectionCredentials = null != (ref1 = [!1, "false", "no"].indexOf(Settings.retainConnectionCredentials) < 0) ? ref1 : {
				yes: !1
			}) : retainConnectionCredentials = !0, retainConnectionCredentials || this.unpersistCredentials(), AuthDataService.setStoreCredentials(retainConnectionCredentials)
		}, this.updateCredentialTimeout = function(credentialTimeout) {
			var ref;
			return(null != (ref = $rootScope.neo4j) ? ref.enterpriseEdition : void 0) || (credentialTimeout = 0), AuthDataService.setCredentialTimeout(credentialTimeout)
		}, this.connected_user = "", this.last_connected_user = "", this.authorization_required = !0, this.is_connected = !1, this.session_start_time = new Date, this.session_countdown = null, this.waiting_policies = !1, this.setConnectionAuthData = function(username, password, emitChange) {
			return null == emitChange && (emitChange = !1), this.setConnectedUser(username), this.updatePersistentAuthData(username + ":" + password), this.setLastConnectedUser(username), emitChange ? $rootScope.$emit("connection:authdata_updated") : void 0
		}, this.connectionAuthData = function() {
			return AuthDataService.getAuthData()
		}, this.plainConnectionAuthData = function() {
			var data;
			return data = AuthDataService.getPlainAuthData(), data ? data.split(":") : ["", ""]
		}, this.clearConnectionAuthData = function() {
			return this.setConnectedUser(""), this.updatePersistentAuthData(!1), AuthDataService.clearPolicies()
		}, this.setConnectedUser = function(username) {
			return this.connected_user = username
		}, this.setLastConnectedUser = function(username) {
			return this.last_connected_user = username, this.updatePersistentLastUser(username)
		}, this.connectedAsUser = function() {
			return this.connected_user
		}, this.lastConnectedAsUser = function() {
			return this.last_connected_user || AuthDataService.getPlainLastUser() || ""
		}, this.setAuthorizationRequired = function(authorization_required) {
			return this.authorization_required = authorization_required
		}, this.authorizationRequired = function() {
			return this.authorization_required
		}, this.setConnected = function(is_connected) {
			var old_connection;
			return old_connection = this.is_connected, this.is_connected = is_connected, old_connection !== is_connected && $rootScope.$emit("auth:status_updated", is_connected), is_connected || $rootScope.$emit("auth:disconnected"), is_connected ? this.setConnectedUser(this.plainConnectionAuthData()[0]) : void 0
		}, this.isConnected = function() {
			return this.is_connected
		}, this.setAuthPolicies = function(policies) {
			return $rootScope.neo4j && $rootScope.neo4j.version ? (policies.retainConnectionCredentials ? policies.retainConnectionCredentials && (this.updateRetainConnectionCredentials(!0), AuthDataService.persistCachedAuthData()) : this.updateRetainConnectionCredentials(!1), this.getCredentialTimeout() !== policies.credentialTimeout && (this.updateCredentialTimeout(policies.credentialTimeout), this.restartSessionCountdown()), this.waiting_policies = !1) : this.waiting_policies = policies
		}, this.getRetainConnectionCredentials = function() {
			return AuthDataService.getPolicies().retainConnectionCredentials
		}, this.getCredentialTimeout = function() {
			return AuthDataService.getPolicies().credentialTimeout
		}, this.setSessionStartTimer = function(start_date) {
			return this.session_start_time = start_date, this.startSessionCountdown()
		}, this.startSessionCountdown = function() {
			var that, ttl;
			return this.isConnected() && AuthDataService.getPolicies().credentialTimeout ? (that = this, this.session_start_time = new Date, ttl = (new Date).getTime() / 1e3 + AuthDataService.getPolicies().credentialTimeout - this.session_start_time.getTime() / 1e3, this.session_countdown = $timeout(function() {
				return that.clearConnectionAuthData(), that.setConnected(!1)
			}, 1e3 * ttl)) : void this.clearSessionCountdown()
		}, this.clearSessionCountdown = function() {
			return this.session_countdown ? $timeout.cancel(this.session_countdown) : void 0
		}, this.restartSessionCountdown = function() {
			return this.clearSessionCountdown(), this.startSessionCountdown()
		}, this.getConnectionAge = function() {
			return Math.ceil(((new Date).getTime() - this.session_start_time.getTime()) / 1e3)
		}, this.getConnectionStatusSummary = function() {
			return {
				user: this.connectedAsUser(),
				authorization_required: this.authorizationRequired(),
				is_connected: this.isConnected(),
				retain_connection_credentials: this.getRetainConnectionCredentials(),
				credential_timeout: this.getCredentialTimeout(),
				connection_age: this.getConnectionAge()
			}
		}, $rootScope.$on("settings:saved", function() {
			return that.setAuthPolicies({
				retainConnectionCredentials: Settings.retainConnectionCredentials,
				credentialTimeout: AuthDataService.getPolicies().credentialTimeout
			}), AuthDataService.getPolicies().retainConnectionCredentials === !1 ? that.unpersistCredentials() : AuthDataService.persistCachedAuthData()
		}), $rootScope.$on("db:updated:edition", function(e, edition) {
			return AuthDataService.clearPolicies(), that.waiting_policies ? that.setAuthPolicies(that.waiting_policies) : void 0
		}), this.setConnectedUser(this.plainConnectionAuthData()[0]), that = this, this
	}]);
var bind = function(fn, me) {
	return function() {
		return fn.apply(me, arguments)
	}
};
angular.module("neo4jApp.services").service("UsageDataCollectionService", ["Settings", "localStorageService", "Intercom", "$timeout", function(Settings, localStorageService, Intercom, $timeout) {
	var UsageDataCollectionService, storageKey;
	return storageKey = "udc", new(UsageDataCollectionService = function() {
		function UsageDataCollectionService() {
			this.shouldConnect = bind(this.shouldConnect, this), this.data = localStorageService.get(storageKey), angular.isObject(this.data) || (this.data = this.reset()), this.data.client_starts = (this.data.client_starts || 0) + 1, this.save(), this.connectedUser = !1, this.user_id = !1
		}
		return UsageDataCollectionService.prototype.reset = function() {
			return this.data = {
				uuid: UUID.genV1().toString(),
				created_at: Math.round(Date.now() / 1e3),
				client_starts: 0,
				events: []
			}, this.save(), this.data
		}, UsageDataCollectionService.prototype.loadUDC = function() {
			return Intercom.load(), Intercom.reload(), this.connectUser()
		}, UsageDataCollectionService.prototype.unloadUDC = function() {
			return Intercom.unload()
		}, UsageDataCollectionService.prototype.reloadUDC = function() {
			return Intercom.unload(), Intercom.load(), Intercom.reload()
		}, UsageDataCollectionService.prototype.set = function(key, value) {
			return this.data[key] = value, this.save(), value
		}, UsageDataCollectionService.prototype.deleteKey = function(key) {
			return delete this.data[key], this.save()
		}, UsageDataCollectionService.prototype.increment = function(key) {
			return this.data[key] = (this.data[key] || 0) + 1, this.save(), this.data[key]
		}, UsageDataCollectionService.prototype.updateStoreAndServerVersion = function(neo4jVersion, storeId) {
			return this.set("store_id", storeId), this.set("neo4j_version", neo4jVersion), this.connectedUser ? Intercom.update(this.userData()) : void 0
		}, UsageDataCollectionService.prototype.connectUserWithUserIdAndName = function(userId, name) {
			return this.deleteKey("user_id"), this.user_id = userId, this.set("name", null != name ? name : {
				name: "Graph Friend"
			}), this.connectUser()
		}, UsageDataCollectionService.prototype.disconnectUser = function() {
			return this.connectedUser = !1, this.user_id = !1, Intercom.disconnect(), this.reloadUDC()
		}, UsageDataCollectionService.prototype.trackEvent = function(name, data) {
			return this.connectedUser && (this.isBeta() || Settings.shouldReportUdc) ? Intercom.event(name, data) : (this.data.events = this.data.events || [], this.data.events.push({
				name: name,
				data: data
			}), this.save())
		}, UsageDataCollectionService.prototype.trackConnectEvent = function() {
			return this.shouldTriggerConnectEvent() ? this.trackEvent("connect", {
				store_id: this.data.store_id,
				neo4j_version: this.data.neo4j_version,
				client_starts: this.data.client_starts,
				cypher_attempts: this.data.cypher_attempts,
				cypher_wins: this.data.cypher_wins,
				cypher_fails: this.data.cypher_fails,
				accepts_replies: Settings.acceptsReplies
			}) : void 0
		}, UsageDataCollectionService.prototype.toggleMessenger = function() {
			return Intercom.toggle()
		}, UsageDataCollectionService.prototype.showMessenger = function() {
			return Intercom.showMessenger()
		}, UsageDataCollectionService.prototype.newMessage = function(message) {
			return Intercom.newMessage(message)
		}, UsageDataCollectionService.prototype.connectUser = function() {
			var event, i, len, ref;
			if(!this.connectedUser && this.shouldConnect()) {
				if(this.isBeta() || Settings.shouldReportUdc) {
					for(Intercom.user(this.user_id, this.userData()), ref = this.data.events, i = 0, len = ref.length; len > i; i++) event = ref[i], Intercom.event(event.name, event.data);
					this.data.events = []
				} else Intercom.user(this.user_id, {});
				this.connectedUser = !0
			}
			return this.connectedUser
		}, UsageDataCollectionService.prototype.userData = function() {
			var userData;
			return userData = $.extend({}, this.data), delete userData.events, this.data.neo4j_version && this.data.store_id && (userData.companies = [{
				type: "company",
				name: "Neo4j " + this.data.neo4j_version + " " + this.data.store_id,
				company_id: this.data.store_id
			}]), userData
		}, UsageDataCollectionService.prototype.shouldConnect = function() {
			return this.user_id && Intercom.isLoaded()
		}, UsageDataCollectionService.prototype.shouldTriggerConnectEvent = function() {
			var pingTime, today;
			return pingTime = new Date(this.data.pingTime || 0), today = new Date, today = new Date(today.getFullYear(), today.getMonth(), today.getDate()), today > pingTime ? (this.set("pingTime", today.getTime()), !0) : !1
		}, UsageDataCollectionService.prototype.isBeta = function() {
			return /-M\d\d/.test(this.data.neo4j_version)
		}, UsageDataCollectionService.prototype.save = function() {
			return localStorageService.set(storageKey, JSON.stringify(this.data))
		}, UsageDataCollectionService
	}())
}]);
var slice = [].slice;
angular.module("neo4jApp.services").service("Intercom", ["$log", "$window", "$timeout", function($log, $window, $timeout) {
	var IntercomService;
	return new(IntercomService = function() {
		function IntercomService() {
			this._Intercom = $window.Intercom, this.booted = !1
		}
		return IntercomService.prototype.load = function() {
			return this._Intercom ? void 0 : function() {
				var d, i, ic, l;
				return ic = $window.Intercom, l = function() {
					var s, x;
					s = d.createElement("script"), s.type = "text/javascript", s.async = !0, s.src = "https://widget.intercom.io/widget/lq70afwx", x = d.getElementsByTagName("script")[0], x.parentNode.insertBefore(s, x)
				}, "function" == typeof ic ? ic("reattach_activator") : (d = document, i = function() {
					i.c(arguments)
				}, i.q = [], i.c = function(args) {
					i.q.push(args)
				}, $window.Intercom = i, l())
			}()
		}, IntercomService.prototype.unload = function() {
			return this._Intercom = !1
		}, IntercomService.prototype.reload = function() {
			return this._Intercom = $window.Intercom, this.booted = !1
		}, IntercomService.prototype["do"] = function() {
			var args, command, params, that;
			return command = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [], this._Intercom ? (that = this, args = arguments, $timeout(function() {
				return $window.Intercom.apply(that, args)
			})) : void 0
		}, IntercomService.prototype.user = function(userID, userData) {
			var intercomSettings;
			if(this._Intercom) return intercomSettings = {
				app_id: "lq70afwx",
				user_id: userID
			}, angular.extend(intercomSettings, userData), this.booted ? void 0 : (this["do"]("boot", intercomSettings), this._Intercom("hide"), this._Intercom("onShow", function(_this) {
				return function() {
					return _this.isShowing = !0
				}
			}(this)), this._Intercom("onHide", function(_this) {
				return function() {
					return _this.isShowing = !1
				}
			}(this)), this.booted = !0)
		}, IntercomService.prototype.toggle = function() {
			return this.isShowing ? this["do"]("hide") : (this.isShowing = !0, this["do"]("show"))
		}, IntercomService.prototype.showMessenger = function() {
			return this["do"]("show")
		}, IntercomService.prototype.newMessage = function(message) {
			return this["do"]("showNewMessage", message)
		}, IntercomService.prototype.update = function(userData) {
			return this["do"]("update", userData)
		}, IntercomService.prototype.event = function(eventName, eventData) {
			return this["do"]("trackEvent", eventName, eventData)
		}, IntercomService.prototype.isLoaded = function() {
			return !!this._Intercom
		}, IntercomService.prototype.disconnect = function() {
			return this["do"]("shutdown")
		}, IntercomService
	}())
}]), angular.module("neo4jApp.controllers").controller("NotificationCtrl", ["$scope", "$sce", "$log", "Settings", "SettingsStore", function($scope, $sce, $log, Settings, SettingsStore) {
	return $scope.notifications = [], $scope.hasNotifications = function() {
		return $scope.notifications.length > 0
	}, $scope.defaultNotifications = [{
		setting: "shouldReportUdc",
		message: "Hello and thanks for downloading Neo4j! Help us make Neo4j even better by sharing <a href='http://neo4j.com/legal/neo4j-user-experience/'> non&#8209;sensitive data</a>. Would that be OK?",
		style: "warning",
		options: [{
			label: "Yes, I'm happy to help!",
			icon: "fa-smile-o",
			btn: "btn-good",
			value: !0
		}, {
			label: "Sorry no, but good luck",
			icon: "fa-frown-o",
			btn: "btn-neutral",
			value: !1
		}]
	}], $scope.rememberThenDismiss = function(_this) {
		return function(notification, value) {
			return Settings[notification.setting] = value, SettingsStore.save(), $scope.notifications.shift()
		}
	}(this), angular.forEach($scope.defaultNotifications, function(_this) {
		return function(notification) {
			return null == Settings[notification.setting] ? $scope.notifications.push(notification) : void 0
		}
	}(this))
}]), angular.module("neo4jApp.controllers").controller("SettingsCtrl", ["$scope", "Frame", "Settings", "SettingsStore", "Bolt", "$location", "$rootScope", function($scope, Frame, Settings, SettingsStore, Bolt, $location, $rootScope) {
	return $scope.settings = Settings, $scope.save = function() {
		return SettingsStore.save()
	}, $scope.openBoltHelp = function() {
		return Frame.create({
			input: Settings.cmdchar + "help bolt"
		})
	}, $scope.openBoltRoutingHelp = function() {
		return Frame.create({
			input: Settings.cmdchar + "help bolt routing"
		})
	}, $scope.toggleBoltUsage = function() {
		return $rootScope.bolt_connection_failure = !1, Settings.useBolt ? Bolt.connect().then(function() {
			return $rootScope.refresh()
		}) : void 0
	}, $scope.updateBoltConnection = function() {
		return Bolt.connect().then(function() {
			return $rootScope.refresh()
		})
	}, $scope.toggleBoltRouting = function() {
		return Settings.useBoltRouting = !Settings.useBoltRouting, $scope.save(), $scope.updateBoltConnection()
	}, $scope.defaultBoltHost = $location.host()
}]), angular.module("neo4jApp.services").service("Canvg", ["$window", function($window) {
	return $window.canvg
}]), angular.module("neo4jApp.services").service("SVGUtils", [function() {
	return this.prepareForExport = function($element, dimensions) {
		var svg;
		return svg = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg")), svg.append("title").text("Neo4j Graph Visualization"), svg.append("desc").text("Created using Neo4j (http://www.neo4j.com/)"), d3.select($element.get(0)).selectAll("g.layer").each(function() {
				return svg.node().appendChild($(this).clone().get(0))
			}), svg.selectAll(".overlay, .ring").remove(), svg.selectAll(".context-menu-item").remove(), svg.selectAll("text").attr("font-family", "sans-serif"), svg.attr("width", dimensions.width),
			svg.attr("height", dimensions.height), svg.attr("viewBox", dimensions.viewBox), svg
	}, this
}]);
var bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments)
		}
	},
	indexOf = [].indexOf || function(item) {
		for(var i = 0, l = this.length; l > i; i++)
			if(i in this && this[i] === item) return i;
		return -1
	};
angular.module("neo4jApp.services").service("SyncService", ["localStorageService", "NTN", "CurrentUser", "Utils", "DefaultContentService", "$q", "$rootScope", function(localStorageService, NTN, CurrentUser, Utils, DefaultContentService, $q, $rootScope) {
	var SyncKeys, SyncService, getStorage, setStorageForKey, setStorageJSON, syncKeys, syncService;
	return SyncKeys = function() {
		function SyncKeys() {
			this.syncKeys = [new SyncKey("documents", "favorites"), new SyncKey("folders"), new SyncKey("grass")]
		}
		var SyncKey;
		return SyncKeys.prototype.get = function() {
			return this.syncKeys
		}, SyncKeys.prototype.getValues = function() {
			return this.syncKeys.map(function(k) {
				return k.value
			})
		}, SyncKey = function() {
			function SyncKey(value, display) {
				null == display && (display = null), this.value = value, this.display = display || this.value
			}
			return SyncKey
		}(), SyncKeys
	}(), syncKeys = new SyncKeys, setStorageJSON = function(response) {
		var i, key, len, ref;
		for(ref = syncKeys.getValues(), i = 0, len = ref.length; len > i; i++) key = ref[i], "undefined" != typeof response[key] ? setStorageForKey(key, response[key]) : localStorageService.remove(key);
		return setStorageForKey("updated_at", 1), response
	}, setStorageForKey = function(key, val) {
		return localStorageService.set(key, val)
	}, getStorage = function() {
		var d;
		return d = {}, d.documents = localStorageService.get("documents"), d.folders = localStorageService.get("folders"), d.stores = localStorageService.get("stores"), d.grass = JSON.stringify(localStorageService.get("grass") || ""), d
	}, $rootScope.$watch("ntn_data", function(ntn_data) {
		var forStorage;
		if(ntn_data) return ntn_data.$id && "undefined" == typeof ntn_data.documents ? syncService.push() : (forStorage = {}, syncKeys.getValues().forEach(function(key) {
			return forStorage[key] = Array.isArray(ntn_data[key]) ? ntn_data[key][0].data : ntn_data[key]
		}), setStorageJSON(forStorage))
	}), SyncService = function() {
		function SyncService() {
			this.setResponse = bind(this.setResponse, this), this.push = bind(this.push, this), this.fetch = bind(this.fetch, this), this.fetchAndUpdate = bind(this.fetchAndUpdate, this), $rootScope.$on("LocalStorageModule.notification.setitem", function(_this) {
				return function(evt, item) {
					return _this.syncItem(item)
				}
			}(this)), $rootScope.$on("ntn:authenticated", function(_this) {
				return function(evt, authenticated) {
					var documents;
					return _this.authenticated = authenticated, documents = getStorage().documents || [], _this.currentFavs = Utils.removeDocumentsFromArray(DefaultContentService.getDefaultDocuments(), documents), authenticated ? _this.fetch() : void 0
				}
			}(this)), $rootScope.$on("ntn:data_loaded", function(_this) {
				return function(evt, didLoad) {
					var newFavs;
					if(didLoad === !0 && _this.currentFavs.length > 0 && (newFavs = Utils.mergeDocumentArrays($rootScope.ntn_data.documents[0].data, _this.currentFavs), $rootScope.ntn_data.documents[0].data.length !== newFavs.length)) return setStorageForKey("documents", newFavs)
				}
			}(this)), $rootScope.$on("ntn:connection_status", function(s, isConnected) {
				return syncService.setSyncConnection(isConnected)
			}), $rootScope.$on("ntn:last_synced", function() {
				return syncService.setSyncedAt()
			})
		}
		return SyncService.prototype.syncItem = function(item) {
			var key, newSyncVal, newvalue, ref;
			if("updated_at" === item.key && this.authenticated) return this.setSyncedAt();
			if(ref = item.key, !(indexOf.call(function() {
					var i, len, ref1, results;
					for(ref1 = syncKeys.getValues(), results = [], i = 0, len = ref1.length; len > i; i++) key = ref1[i], results.push(key);
					return results
				}(), ref) < 0)) {
				if(newvalue = "grass" === item.key ? item.newvalue : JSON.parse(item.newvalue), newvalue = this.getObjectStruct(newvalue), !$rootScope.ntn_data) return this.inSync = !1;
				if(newSyncVal = this.upgradeFormat($rootScope.ntn_data[item.key], item), !newSyncVal.length || !Utils.equals(newSyncVal[0].data, newvalue.data)) return newSyncVal.splice(0, 0, newvalue), newSyncVal.length <= 5 || newSyncVal.splice(-1, 1), newSyncVal[0].syncedAt = (new Date).getTime(), $rootScope.ntn_data[item.key] = newSyncVal, this.authenticated ? this.inSync = !0 : this.inSync = !1
			}
		}, SyncService.prototype.fetchAndUpdate = function() {
			var promise, q;
			return promise = this.fetch(), promise ? promise.then(function(_this) {
				return function(response) {
					return _this.setResponse(response)
				}
			}(this)) : (q = $q.defer(), q.resolve(), q.promise)
		}, SyncService.prototype.fetch = function() {
			return this.authenticated ? CurrentUser.getStore().then(function(store) {
				return store ? NTN.fetch(store) : void 0
			}) : void 0
		}, SyncService.prototype.push = function() {
			var currentLocal, that;
			return that = this, this.authenticated ? (currentLocal = getStorage(), that = this, syncKeys.getValues().forEach(function(key) {
				var tmpObj;
				return tmpObj = {
					key: key,
					newvalue: "grass" !== key ? JSON.stringify(currentLocal[key]) : currentLocal[key]
				}, that.syncItem(tmpObj)
			})) : void 0
		}, SyncService.prototype.setResponse = function(response) {
			return this.conflict = !1, setStorageJSON(response)
		}, SyncService.prototype.setSyncedAt = function() {
			return this.hasConnection ? (this.inSync = !0, this.lastSyncedAt = new Date) : void 0
		}, SyncService.prototype.setSyncConnection = function(isConnected) {
			return this.hasConnection = isConnected, this.setSyncedAt()
		}, SyncService.prototype.upgradeFormat = function(data, item) {
			return data ? ("grass" === item.key ? Array.isArray(data) || (data = [this.getObjectStruct(data)]) : Array.isArray(data[0].data) || (data = [this.getObjectStruct(data)]), data) : []
		}, SyncService.prototype.getObjectStruct = function(data) {
			return {
				data: data || null,
				syncedAt: 0,
				client: Utils.getBrowserName()
			}
		}, SyncService.prototype.restoreToVersion = function(key, versionTimestamp, cb) {
			var indexToRestore, versionToRestore;
			return cb = cb || function() {}, indexToRestore = $rootScope.ntn_data[key].reduce(function(pass, curr, index) {
				return curr.syncedAt !== versionTimestamp ? pass : index
			}, -1), indexToRestore >= 0 ? (versionToRestore = $rootScope.ntn_data[key][indexToRestore], $rootScope.ntn_data[key].splice(indexToRestore, 1), setStorageForKey(key, versionToRestore.data), cb(null, 1)) : cb("Version not found", null)
		}, SyncService.prototype.authenticated = !1, SyncService.prototype.conflict = !1, SyncService.prototype.inSync = !1, SyncService.prototype.lastSyncedAt = null, SyncService.prototype.syncKeys = syncKeys.get(), SyncService
	}(), syncService = new SyncService
}]);
var bind = function(fn, me) {
	return function() {
		return fn.apply(me, arguments)
	}
};
angular.module("neo4jApp.services").service("CurrentUser", ["Settings", "Editor", "AuthService", "NTN", "localStorageService", "AuthDataService", "jwtHelper", "$q", "$rootScope", "UsageDataCollectionService", "DefaultContentService", "GraphStyle", function(Settings, Editor, AuthService, NTN, localStorageService, AuthDataService, jwtHelper, $q, $rootScope, UDC, DefaultContentService, GraphStyle) {
	var CurrentUser, cu;
	return CurrentUser = function() {
		function CurrentUser() {
			this.persist = bind(this.persist, this)
		}
		return CurrentUser.prototype._user = {}, CurrentUser.prototype.store = null, CurrentUser.prototype.getStoreCreds = function() {
			var local;
			return local = localStorageService.get("stores"), local || []
		}, CurrentUser.prototype.setStoreCreds = function(creds_array) {
			return localStorageService.set("stores", creds_array)
		}, CurrentUser.prototype.addCurrentStoreCreds = function(id) {
			var creds, current_creds;
			return creds = this.getStoreCreds(), (current_creds = AuthDataService.getAuthData()) ? (creds.push({
				store_id: id,
				creds: current_creds
			}), this.setStoreCreds(creds)) : void 0
		}, CurrentUser.prototype.removeCurrentStoreCreds = function(id) {
			var cred, creds, i, j, len;
			for(creds = this.getStoreCreds(), i = j = 0, len = creds.length; len > j; i = ++j)
				if(cred = creds[i], cred.store_id === id) {
					creds.splice(i, 1);
					break
				}
			return this.setStoreCreds(creds)
		}, CurrentUser.prototype.getCurrentStoreCreds = function(id) {
			var cred, creds, j, len;
			for(creds = this.getStoreCreds(), j = 0, len = creds.length; len > j; j++)
				if(cred = creds[j], cred.store_id === id) return cred;
			return {}
		}, CurrentUser.prototype.fetch = function() {
			return NTN.fetch(this.store)
		}, CurrentUser.prototype.getToken = function(id) {
			return id ? localStorageService.get("ntn_" + id) : !1
		}, CurrentUser.prototype.loadUserFromLocalStorage = function() {
			var data_token, q, that;
			if(this.isAuthenticated()) return q = $q.defer(), that = this, this._user = localStorageService.get("ntn_profile"), data_token = this.getToken("data_token"), this.store = !1, this._user && data_token ? NTN.getUserStore(this._user.user_id, data_token).then(function(store) {
				var data;
				return that.store = store, q.resolve(), data = localStorageService.get("ntn_profile"), $rootScope.$emit("ntn:authenticated", "yes", data)
			}) : q.resolve(), q.promise
		}, CurrentUser.prototype.getStore = function() {
			var q, that;
			return that = this, q = $q.defer(), this.store && this.store.getAuth() ? (q.resolve(this.store), q.promise) : (this.refreshToken().then(q.resolve(that.store)), q.promise)
		}, CurrentUser.prototype.persist = function(res) {
			return res.token && localStorageService.set("ntn_token", res.token), res.data_token && localStorageService.set("ntn_data_token", res.data_token), res.profile && localStorageService.set("ntn_profile", res.profile), res.refreshToken && localStorageService.set("ntn_refresh_token", res.refreshToken), this.loadUserFromLocalStorage()
		}, CurrentUser.prototype.clear = function() {
			return localStorageService.clearAll(), DefaultContentService.resetToDefault(), GraphStyle.resetToDefault(), this.loadUserFromLocalStorage()
		}, CurrentUser.prototype.login = function() {
			var q, that;
			return q = $q.defer(), that = this, NTN.login().then(function(res) {
				var data;
				return that.persist(res), data = localStorageService.get("ntn_profile"), $rootScope.$emit("ntn:login", data), q.resolve(res)
			}, function(err) {
				return q.reject()
			}), q.promise
		}, CurrentUser.prototype.logout = function() {
			return $rootScope.currentUser = null, NTN.logout(), this.store && this.store.unauth(), localStorageService.remove("ntn_token"), localStorageService.remove("ntn_data_token"), localStorageService.remove("ntn_refresh_token"), localStorageService.remove("ntn_profile"), localStorageService.remove("stores"), AuthService.forget(), this.clear(), $rootScope.$emit("ntn:logout"), Editor.execScript(Settings.cmdchar + "server disconnect")
		}, CurrentUser.prototype.instance = function() {
			return angular.copy(this._user)
		}, CurrentUser.prototype.isAuthenticated = function() {
			return localStorageService.get("ntn_data_token")
		}, CurrentUser.prototype.init = function() {
			return NTN.connection()
		}, CurrentUser
	}(), cu = new CurrentUser
}]), angular.module("neo4jApp.services").factory("NTN", ["auth", "Settings", "$q", "$firebaseAuth", "$firebaseObject", "$rootScope", function(auth, Settings, $q, $firebaseAuth, $firebaseObject, $rootScope) {
	var _connection, _fetch, _getUserStore, _login, _push, _refreshTokens, _sync_object, _unbind;
	return _unbind = function() {}, _sync_object = !1, _connection = function() {
		var connectedRef;
		return connectedRef = new Firebase("https://fiery-heat-7952.firebaseio.com/.info/connected"), connectedRef.on("value", function(snapshot) {
			var variable;
			return variable = snapshot.val(), variable ? $rootScope.$broadcast("ntn:connection_status", !0) : $rootScope.$broadcast("ntn:connection_status", !1)
		})
	}, _getUserStore = function(id, token) {
		var fbauth, q, ref;
		return q = $q.defer(), ref = new Firebase("https://fiery-heat-7952.firebaseio.com/users/" + id + "/"), fbauth = $firebaseAuth(ref), fbauth.$authWithCustomToken(token).then(function(success) {
			return q.resolve(ref)
		}, function(err) {
			return q.reject(err)
		}), q.promise
	}, _fetch = function(_store) {
		return _store ? (_sync_object = $firebaseObject(_store), _sync_object.$bindTo($rootScope, "ntn_data").then(function(unbind) {
			var newUser, ref1;
			return newUser = (null != (ref1 = $rootScope.ntn_data.documents) ? ref1.length : void 0) ? !1 : !0, $rootScope.$emit("ntn:data_loaded", !0, newUser), _unbind = unbind
		}, function(err) {
			return _unbind()
		})) : !1
	}, _push = function(_store, data) {
		var completed, q;
		return q = $q.defer(), completed = function(err) {
			return err ? q.reject(err) : q.resolve()
		}, _store ? (_store.set(data, completed), q.promise) : !1
	}, _login = function() {
		var con, domain, e, pollInterval, q, win;
		q = $q.defer(), domain = "https://auth.neo4j.com/index.html", win = window.open(domain, "loginWindow", "location=0,status=0,scrollbars=0, width=1080,height=720");
		try {
			win.moveTo(500, 300)
		} catch(_error) {
			e = _error
		}
		return window.addEventListener("message", function(event) {
			return clearInterval(pollInterval), con(event.data), win.close()
		}, !1), pollInterval = setInterval(function() {
			var message;
			return message = "Polling for results", win.postMessage(message, domain)
		}, 6e3), con = function(response) {
			return q.resolve(response)
		}, q.promise
	}, _refreshTokens = function(refreshToken) {
		var q;
		return q = $q.defer(), auth.getToken({
			refresh_token: refreshToken,
			api: "auth0"
		}).then(function(auth0_res) {
			return auth.getToken({
				api: "firebase",
				id_token: auth0_res.id_token
			}).then(function(fb_res) {
				return q.resolve({
					token: auth0_res.id_token,
					data_token: fb_res.id_token
				})
			})
		}), q.promise
	}, {
		login: _login,
		logout: function() {
			return auth.signout(), _unbind(), _sync_object ? _sync_object.$destroy() : void 0
		},
		authenticate: function(profile, token) {
			return auth.authenticate(profile, token).then(function() {
				return _unbind()
			})
		},
		isAuthenticated: function() {
			return auth.isAuthenticated
		},
		refreshToken: _refreshTokens,
		fetch: _fetch,
		push: _push,
		getUserStore: _getUserStore,
		connection: _connection
	}
}]), angular.module("neo4jApp.controllers").controller("AdLibDataController", ["$scope", "AuthService", "Frame", "Settings", function($scope, Settings) {
	return $scope.nodeLabelA = "Person", $scope.propertyKeyA = "name", $scope.propertyValueA = "Ann", $scope.nodeLabelB = "Person", $scope.propertyKeyB = "name", $scope.propertyValueB = "Dan", $scope.relationshipType = "KNOWS", $scope.relationshipDepth = 3
}]), angular.module("neo4jApp.filters").filter("tickitize", function() {
	return function(input) {
		return input.match(/^[A-Za-z][A-Za-z0-9_]*$/) ? input : "`" + input + "`"
	}
}), angular.module("neo4jApp.controllers").controller("SysinfoController", ["$rootScope", "$scope", "$location", "Utils", "Settings", "ProtocolFactory", "Features", "$timeout", "UtilityREST", "UtilityBolt", function($rootScope, $scope, $location, Utils, Settings, ProtocolFactory, Features, $timeout, UtilityREST, UtilityBolt) {
	var base, base1, base2, base3, refreshLater, timer;
	return $scope.autoRefresh = !1, $scope.sysinfo = {}, null == (base = $scope.sysinfo).primitives && (base.primitives = {}), null == (base1 = $scope.sysinfo).cache && (base1.cache = {
		available: !1
	}), null == (base2 = $scope.sysinfo).tx && (base2.tx = {
		available: !1
	}), null == (base3 = $scope.sysinfo).ha && (base3.ha = {}), $scope.showConnectOption = !1, $scope.refresh = function() {
		var base4;
		return null == (base4 = $scope.sysinfo).kernel && (base4.kernel = {}), ProtocolFactory.utils().getJmx(["*:*"]).then(function(response) {
			var a, clusterMember, connectedMemberId, i, intialResponse, j, jmxQueryPrefix, k, l, len, len1, len2, len3, ma, member, r, ref, ref1, ref2, ref3, ref4, results;
			for(intialResponse = response.data[0], jmxQueryPrefix = intialResponse.name.split(",")[0], ref = response.data, results = [], i = 0, len = ref.length; len > i; i++)
				if(r = ref[i], (ref1 = r.name) === jmxQueryPrefix + ",name=Configuration" || ref1 === jmxQueryPrefix + ",name=Kernel" || ref1 === jmxQueryPrefix + ",name=Store file sizes") results.push(function() {
					var j, len1, ref2, results1;
					for(ref2 = r.attributes, results1 = [], j = 0, len1 = ref2.length; len1 > j; j++) a = ref2[j], results1.push($scope.sysinfo.kernel[a.name] = a.value);
					return results1
				}());
				else if(r.name === jmxQueryPrefix + ",name=Primitive count") results.push(function() {
				var j, len1, ref2, results1;
				for(ref2 = r.attributes, results1 = [], j = 0, len1 = ref2.length; len1 > j; j++) a = ref2[j], results1.push($scope.sysinfo.primitives[a.name] = a.value);
				return results1
			}());
			else if(r.name === jmxQueryPrefix + ",name=Page cache") $scope.sysinfo.cache.available = !0, results.push(function() {
				var j, len1, ref2, results1;
				for(ref2 = r.attributes, results1 = [], j = 0, len1 = ref2.length; len1 > j; j++) a = ref2[j], results1.push($scope.sysinfo.cache[a.name] = a.value);
				return results1
			}());
			else if(r.name === jmxQueryPrefix + ",name=Transactions") $scope.sysinfo.tx.available = !0, results.push(function() {
				var j, len1, ref2, results1;
				for(ref2 = r.attributes, results1 = [], j = 0, len1 = ref2.length; len1 > j; j++) a = ref2[j], results1.push($scope.sysinfo.tx[a.name] = a.value);
				return results1
			}());
			else if(r.name === jmxQueryPrefix + ",name=High Availability") {
				for($scope.sysinfo.ha.clustered = !0, ref2 = r.attributes, j = 0, len1 = ref2.length; len1 > j; j++)
					if(a = ref2[j], "InstancesInCluster" === a.name)
						for($scope.sysinfo.ha.ClusterMembers = {}, ref3 = a.value, k = 0, len2 = ref3.length; len2 > k; k++) {
							if(member = ref3[k], clusterMember = {}, null != member.properties) clusterMember = member.properties;
							else
								for(ref4 = member.value, l = 0, len3 = ref4.length; len3 > l; l++) ma = ref4[l], clusterMember[ma.name] = ma.value;
							clusterMember.connected = !1, $scope.sysinfo.ha.ClusterMembers[clusterMember.instanceId] = clusterMember
						} else "InstanceId" === a.name && (connectedMemberId = a.value), $scope.sysinfo.ha[a.name] = a.value;
				results.push($scope.sysinfo.ha.ClusterMembers[connectedMemberId].connected = !0)
			} else results.push(void 0);
			return results
		})["catch"](function(r) {
			return $scope.sysinfo.kernel = {}, $scope.sysinfo.primitives = {}, $scope.sysinfo.cache = {
				available: !1
			}, $scope.sysinfo.tx = {
				available: !1
			}, $scope.sysinfo.ha = {
				clustered: !1
			}
		}), Features.usingCoreEdge ? ProtocolFactory.utils().getClusterOverview().then(function(response) {
			return $scope.sysinfo.ce = response, $scope.showConnectOption = response.length > 1
		}) : void 0
	}, timer = null, refreshLater = function(_this) {
		return function() {
			return $timeout.cancel(timer), $scope.autoRefresh ? ($scope.refresh(), timer = $timeout(refreshLater, 1e3 * Settings.refreshInterval)) : void 0
		}
	}(this), $scope.$on("$destroy", function(_this) {
		return function() {
			return $timeout.cancel(timer)
		}
	}(this)), $scope.isMaster = function(member) {
		return "master" === member.haRole
	}, $scope.toggleAutoRefresh = function() {
		return $scope.autoRefresh = !$scope.autoRefresh, refreshLater()
	}, $scope.isCurrentConnection = function(addresses) {
		var boltAddressForMember, boltHost, restAddressForMember;
		return Settings.useBolt ? (boltHost = Utils.ensureFullBoltAddress(UtilityBolt.getHost()), boltAddressForMember = Utils.getServerAddressByProtocol("bolt", addresses)[0], boltAddressForMember && boltAddressForMember === boltHost) : (restAddressForMember = Utils.getServerAddressByProtocol($location.protocol(), addresses)[0], restAddressForMember && restAddressForMember === UtilityREST.getHost())
	}, $scope.refresh(), $scope.getHttpAddress = function(addresses) {
		return Utils.getServerAddressByProtocol($location.protocol(), addresses)[0]
	}
}]);
var indexOf = [].indexOf || function(item) {
	for(var i = 0, l = this.length; l > i; i++)
		if(i in this && this[i] === item) return i;
	return -1
};
angular.module("neo4jApp.controllers").controller("UserAdminController", ["$scope", "Settings", "ProtocolFactory", "Features", function($scope, Settings, ProtocolFactory, Features) {
	var setError, setSuccessMessage;
	return $scope.autoRefresh = !1, $scope.defaultSelection = "", $scope.resetPasswordValue = null, $scope.fileredUsernames = [], $scope.Features = Features, $scope.samePasswordCheck = function(user) {
		return user.samePassword = user.resetPasswordValue === user.resetPasswordConfirmationValue
	}, $scope.showResetPassword = function(user, value) {
		return user.shouldShowResetPassword = value
	}, setSuccessMessage = function(message) {
		return $scope.frame.successMessage = message, $scope.frame.resetError()
	}, setError = function(response) {
		return $scope.frame.successMessage = !1, $scope.frame.setError(response)
	}, $scope.resetPassword = function(user) {
		return user.resetPasswordValue !== user.resetPasswordConfirmationValue ? (user.resetPasswordValue = null, user.resetPasswordConfirmationValue = null, user.shouldShowResetPassword = !1, user.shouldShowConfirmation = !1, setError("Passwords do not match")) : ProtocolFactory.utils().changeUserPassword(user.username, user.resetPasswordConfirmationValue).then(function() {
			return $scope.refresh(), setSuccessMessage("Changed password for  " + user.username)
		})["catch"](function(r) {
			return setError(r)
		})
	}, $scope.refresh = function() {
		return ProtocolFactory.utils().getUserList().then(function(response) {
			return $scope.users = response, $scope.filteredUsernames = response.filter(function(user) {
				return $scope.user.username !== user.username
			}).map(function(u) {
				return u.username
			})
		})["catch"](function(r) {})
	}, $scope.activate = function(username) {
		return ProtocolFactory.utils().activateUser(username).then(function() {
			return $scope.refresh(), setSuccessMessage("Activated " + username)
		})["catch"](function(r) {
			return setError(r)
		})
	}, $scope.suspend = function(username) {
		return ProtocolFactory.utils().suspendUser(username).then(function() {
			return $scope.refresh(), setSuccessMessage("Suspended " + username)
		})["catch"](function(r) {
			return setError(r)
		})
	}, $scope["delete"] = function(username) {
		return ProtocolFactory.utils().deleteUser(username).then(function() {
			return $scope.refresh(), setSuccessMessage("Deleted " + username)
		})["catch"](function(r) {
			return setError(r)
		})
	}, $scope.notCurrentUser = function(username) {
		return indexOf.call($scope.filteredUsernames, username) >= 0
	}, $scope.showConfirmation = function(user) {
		return user.resetPasswordValue, user.confirmationLabel = !0, user.shouldShowResetPassword = !1, user.shouldShowConfirmation = !0
	}, $scope.$on("admin.addRoleFor", function(event, username, role) {
		return ProtocolFactory.utils().addUserToRole(username, role).then(function() {
			return $scope.refresh(), setSuccessMessage("Assigned role of " + role + " to " + username)
		})["catch"](function(r) {
			return setError(r)
		})
	}), $scope.$on("admin.removeRoleFor", function(event, username, role) {
		return ProtocolFactory.utils().removeRoleFromUser(username, role).then(function() {
			return $scope.refresh(), setSuccessMessage("Removed role of " + role + " from " + username)
		})["catch"](function(r) {
			return setError(r)
		})
	}), $scope.refresh()
}]);
var indexOf = [].indexOf || function(item) {
	for(var i = 0, l = this.length; l > i; i++)
		if(i in this && this[i] === item) return i;
	return -1
};
angular.module("neo4jApp.controllers").controller("UserAdminCreateUserController", ["$scope", "Settings", "ProtocolFactory", "Features", function($scope, Settings, ProtocolFactory, Features) {
	var getNewUserObject, setError, setSuccessMessage, setWarning;
	return $scope.defaultSelection = "", $scope.selectedItem = null, $scope.resetPasswordValue = null, $scope.editingRole = !0, $scope.listOfAllKnownRoles = [], $scope.Features = Features, $scope.addingUser = !1, setSuccessMessage = function(message) {
		return $scope.frame.successMessage = message, $scope.frame.warningText = !1, $scope.frame.resetError()
	}, setError = function(response) {
		return $scope.frame.successMessage = !1, $scope.frame.warningText = !1, $scope.frame.setError(response)
	}, setWarning = function(warningMessage) {
		return $scope.frame.resetError(), $scope.frame.successMessage = !1, $scope.frame.warningText = warningMessage
	}, getNewUserObject = function() {
		return {
			fields: {
				username: "",
				password: "",
				passwordConfirmation: "",
				requirePasswordChange: !1,
				roles: []
			},
			isAddingRole: !1
		}
	}, $scope.user = getNewUserObject(), $scope.addNewUser = function() {
		return $scope.user.fields.username ? $scope.user.fields.password ? $scope.user.fields.passwordConfirmation ? $scope.user.fields.password !== $scope.user.fields.passwordConfirmation ? setWarning("Password and password confirmation are different") : ProtocolFactory.utils().addNewUser($scope.user.fields.username, $scope.user.fields.password, $scope.user.fields.requirePasswordChange).then(function() {
			return $scope.roleErrors = {}, Promise.all($scope.user.fields.roles.map(function(role) {
				return $scope.addRole($scope.user.fields.username, role)
			}))
		}).then(function() {
			var errors;
			return $scope.$broadcast("admin.resetRoles"), $scope.user = getNewUserObject(), Object.keys($scope.roleErrors).length > 0 ? (errors = Object.keys($scope.roleErrors).map(function(key) {
				return "Could not add role(s): " + $scope.roleErrors[key].join(", ") + " due to " + key
			}), setWarning("User " + $scope.user.fields.username + " created but not all roles could be added. " + errors.join(". "))) : setSuccessMessage("User " + $scope.user.fields.username + " created")
		})["catch"](function(r) {
			return setError(r)
		}) : setWarning("Password confirmation required") : setWarning("Password required") : setWarning("Username required")
	}, $scope.fileredUsernames = [], $scope.addRole = function(username, role) {
		return ProtocolFactory.utils().addUserToRole(username, role).then(function() {
			return $scope.refresh()
		}, function(r) {
			var errorMessage;
			return errorMessage = r.errors[0].code + ":" + r.errors[0].message, $scope.roleErrors[errorMessage] = $scope.roleErrors[errorMessage] || [], $scope.roleErrors[errorMessage].push(role)
		})
	}, $scope.notCurrentUser = function(username) {
		return indexOf.call($scope.filteredUsernames, username) >= 0
	}, $scope.enableSubmit = function() {
		return "" !== $scope.user.fields.username && "" !== $scope.user.fields.password
	}, $scope.$on("admin.addRoleFor", function(event, username, role) {
		return $scope.user.fields.roles.push(role)
	}), $scope.$on("admin.removeRoleFor", function(event, username, role) {
		return $scope.user.fields.roles.splice($scope.user.fields.roles.indexOf(role), 1)
	})
}]), angular.module("neo4jApp.controllers").controller("FrameCtrl", ["$scope", function($scope) {
	return $scope.expanded = !0, $scope.toggleVisibleContent = function() {
		return $scope.expanded = !$scope.expanded
	}, $scope.pinned = !1, $scope.pin = function(frame) {
		return $scope.pinned = !$scope.pinned, $scope.pinned ? frame.pinTime = (new Date).getTime() : (frame.pinTime = 0, frame.startTime = (new Date).getTime())
	}
}]), angular.module("neo4jApp.controllers").controller("FrameNotificationCtrl", ["$scope", "$timeout", "Editor", "Settings", function($scope, $timeout, Editor, Settings) {
	var $$id, addNotification;
	return $scope.notifications = [], $$id = 0, addNotification = function(type, message, fn, ttl) {
		var $$timeout, current_id, obj;
		return null == type && (type = "default"), null == ttl && (ttl = 0), current_id = ++$$id, obj = {
			type: type,
			message: message,
			fn: fn,
			$$id: current_id,
			$$is_closing: !1
		}, $scope.notifications.push(obj), $$timeout = $timeout(function() {
			return $scope.close(obj)
		}, ttl), obj.$$timeout = $$timeout, obj
	}, $scope.close = function(obj) {
		return obj.$$timeout && $timeout.cancel(obj.$$timeout), $timeout(function() {
			return $scope.notifications = $scope.notifications.filter(function(item) {
				return item.$$id !== obj.$$id
			})
		}, 700), obj.$$is_closing = !0
	}, $scope.$on("frame.notif.max_neighbour_limit", function(event, result) {
		var fn, msg;
		return msg = "Rendering was limited to " + result.neighbourDisplayedSize + " of the node's total " + result.neighbourSize + " connections ", msg += "due to browser config maxNeighbours.", fn = function() {
			return Editor.setContent(Settings.cmdchar + "config maxNeighbours: " + result.neighbourDisplayedSize)
		}, addNotification("default", msg, fn, 1e4)
	}), $scope.$on("frame.notif.initial_node_display_limit", function(event, result) {
		var fn, msg;
		return msg = "Showing " + result.initialNodeDisplay + " of " + result.nodeCount + " nodes. Click to adjust initialNodeDisplay nodes.", fn = function() {
			return Editor.setContent(Settings.cmdchar + "config initialNodeDisplay: " + result.initialNodeDisplay)
		}, addNotification("default", msg, fn, 1e4)
	})
}]), angular.module("neo4jApp.directives").directive("cypherHint", [function() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var unbind;
			return unbind = scope.$watch(attrs.cypherHint, function(val) {
				var i, inputArr, outputArr;
				if(val) return val.position || (val.position = {
					line: 1,
					column: 1,
					offset: 0
				}), inputArr = attrs.cypherInput.replace(/^\s*(EXPLAIN|PROFILE)\s*/, "").split("\n"), 1 === val.position.line && 1 === val.position.column && 0 === val.position.offset ? outputArr = inputArr : (outputArr = [inputArr[val.position.line - 1]], outputArr.push(function() {
					var j, ref, results;
					for(results = [], i = j = 0, ref = val.position.column; ref >= 0 ? ref > j : j > ref; i = ref >= 0 ? ++j : --j) results.push(" ");
					return results
				}().join("") + "^")), element.text(outputArr.join("\n")), unbind()
			})
		}
	}
}]), angular.module("neo4jApp.directives").directive("playSrc", ["$compile", "$rootScope", "Utils", function($compile, $rootScope, Utils) {
	return function(scope, element, attrs) {
		var unbind;
		return unbind = scope.$watch("frame.response", function(response) {
			return response ? (response.is_remote && (response.contents = Utils.cleanHTML(response.contents)), element.html(response.contents), $compile(element.contents())(scope), unbind()) : void 0
		})
	}
}]), angular.module("neo4jApp.directives").directive("rangeSlider", [function() {
	return {
		replace: !0,
		restrict: "E",
		require: "ngModel",
		template: '<input type="range"/>',
		link: function(scope, element, attrs, ngModel) {
			var init, ngRangeMax, ngRangeMin, ngRangeStep, read, setValue, value;
			ngRangeMin = void 0, ngRangeMax = void 0, ngRangeStep = void 0, value = void 0, init = function() {
				angular.isDefined(attrs.ngRangeMin) ? scope.$watch(attrs.ngRangeMin, function(newValue, oldValue, scope) {
					angular.isDefined(newValue) && (ngRangeMin = newValue, setValue())
				}) : ngRangeMin = 0, angular.isDefined(attrs.ngRangeMax) ? scope.$watch(attrs.ngRangeMax, function(newValue, oldValue, scope) {
					angular.isDefined(newValue) && (ngRangeMax = newValue, setValue())
				}) : ngRangeMax = 100, angular.isDefined(attrs.ngRangeStep) ? scope.$watch(attrs.ngRangeStep, function(newValue, oldValue, scope) {
					angular.isDefined(newValue) && (ngRangeStep = newValue, setValue())
				}) : ngRangeStep = 1, angular.isDefined(ngModel) ? scope.$watch(function() {
					return ngModel.$modelValue
				}, function(newValue, oldValue, scope) {
					angular.isDefined(newValue) && (value = newValue, setValue())
				}) : value = 50, ngModel && ngModel.$parsers.push(function(value) {
					var val;
					return val = Number(value), val !== val && (val = void 0), val
				})
			}, setValue = function() {
				angular.isDefined(ngRangeMin) && angular.isDefined(ngRangeMax) && angular.isDefined(ngRangeStep) && angular.isDefined(value) && (element.attr("min", ngRangeMin), element.attr("max", ngRangeMax), element.attr("step", ngRangeStep), element.val(value))
			}, read = function() {
				angular.isDefined(ngModel) && ngModel.$setViewValue(value)
			}, element.on("change", function() {
				angular.isDefined(value) && value !== element.val() && (value = element.val(), scope.$apply(read))
			}), init()
		}
	}
}]), angular.module("neo4jApp.services").factory("HTTP", ["$http", "Settings", function($http, Settings) {
	var httpOptions;
	return httpOptions = {
		timeout: 1e3 * Settings.maxExecutionTime
	}, {
		transaction: function(opts) {
			var i, len, method, path, s, statements;
			for(opts = angular.extend({
					path: "",
					statements: [],
					method: "post"
				}, opts), path = opts.path, statements = opts.statements, method = opts.method, path = Settings.endpoint.transaction + path, method = method.toLowerCase(), i = 0, len = statements.length; len > i; i++) s = statements[i], s.resultDataContents = ["row", "graph"], s.includeStats = !0;
			return 0 !== path.indexOf(Settings.host) && (path = Settings.host + path), $http.post(path, {
				statements: statements
			}, httpOptions)
		}
	}
}]);
var indexOf = [].indexOf || function(item) {
	for(var i = 0, l = this.length; l > i; i++)
		if(i in this && this[i] === item) return i;
	return -1
};
angular.module("neo4jApp.services").factory("Bolt", ["Settings", "AuthDataService", "localStorageService", "$rootScope", "$location", "$q", "Utils", "BoltIntHelpers", "Features", function(Settings, AuthDataService, localStorageService, $rootScope, $location, $q, Utils, BoltIntHelpers, Features) {
	var _driversObj, _errorStatus, _getAuthData, _getDirectDriver, _getRoutedDriver, _shouldEncryptConnection, bolt, boltPlanToRESTPlan, boltPlanToRESTPlanShared, boltResultToRESTResult, boltStatsToRESTStats, buildErrorObj, callProcedure, checkConnectionError, clearConnection, connect, constructCoreEdgeOverview, constructRolesListResult, constructUserListResult, constructUserResult, directTransaction, extractDataForGraphFormat, extractDataForRowsFormat, extractPathForRowsFormat, extractPathsForGraphFormat, getBoltHost, getClusterRole, getDriverObj, getRESTGraphFromBolt, getRESTMetaFromBolt, getRESTRowsFromBolt, getSocketErrorObj, jmxResultToRESTResult, metaResultToRESTResult, recursivelyBoltIntToJsNumber, routedReadTransaction, routedWriteTransaction, runQueryOnCluster, schemaResultToRESTResult, testConnection, transaction, versionResultToRESTResult;
	return bolt = window.neo4j.v1, _driversObj = null, _errorStatus = null, checkConnectionError = function(error) {
		var message;
		return message = error.message || error.fields && error.fields[0].message, 0 === message.indexOf("WebSocket connection failure") || 0 === message.indexOf("No operations allowed until you send an INIT message successfully") ? $rootScope.check() : void 0
	}, _getRoutedDriver = function(host, auth, opts, driversObj) {
		var uri;
		return Settings.useBoltRouting && Features.usingCoreEdge ? driversObj.routed ? driversObj.routed : (uri = "bolt+routing://" + host.split("bolt://").join(""), driversObj.routed = bolt.driver(uri, auth, opts)) : _getDirectDriver(host, auth, opts, driversObj)
	}, _getDirectDriver = function(host, auth, opts, driversObj) {
		var uri;
		return driversObj.direct ? driversObj.direct : (uri = "bolt://" + host.split("bolt://").join(""), driversObj.direct = bolt.driver(uri, auth, opts))
	}, _shouldEncryptConnection = function() {
		var encrypted;
		return encrypted = "https" === $location.protocol() ? !0 : !1
	}, _getAuthData = function() {
		var authData;
		return authData = AuthDataService.getPlainAuthData(), authData ? authData.match(/^([^:]+):(.*)$/) : ["", "", ""]
	}, runQueryOnCluster = function(cluster, query, params) {
		var _m, password, q, qs, ref, username;
		return null == params && (params = {}),
			q = $q.defer(), qs = [], ref = _getAuthData(), _m = ref[0], username = ref[1], password = ref[2], cluster.forEach(function(member) {
				var d, s;
				return d = bolt.driver("bolt://" + member.address.split("bolt://").join(""), bolt.auth.basic(username, password), {
					encrypted: _shouldEncryptConnection()
				}), s = d.session(), qs.push(s.run(query, params).then(function(r) {
					return d.close(), r
				}))
			}), $q.all(qs.map(function(p) {
				return p.then(function(r) {
					return {
						state: "fulfilled",
						value: r
					}
				})["catch"](function(e) {
					return {
						state: "rejected",
						value: e
					}
				})
			})).then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(e)
			}), q.promise
	}, getBoltHost = function() {
		return Settings.boltHost || $rootScope.boltHost
	}, getDriverObj = function(withoutCredentials) {
		var _m, auth, drivers, driversObj, host, password, ref, username;
		return null == withoutCredentials && (withoutCredentials = !1), driversObj = {}, drivers = {}, host = getBoltHost(), ref = _getAuthData(), _m = ref[0], username = ref[1], password = ref[2], auth = withoutCredentials ? bolt.auth.basic("", "") : bolt.auth.basic(username, password), drivers.getDirectDriver = function() {
			return _getDirectDriver(host, auth, {
				encrypted: _shouldEncryptConnection()
			}, driversObj)
		}, drivers.getRoutedDriver = function() {
			return _getRoutedDriver(host, auth, {
				encrypted: _shouldEncryptConnection()
			}, driversObj)
		}, drivers.close = function() {
			return driversObj.direct && driversObj.direct.close(), driversObj.routed ? driversObj.routed.close() : void 0
		}, drivers
	}, testConnection = function(withoutCredentials) {
		var driver, driversObj, q, session;
		return null == withoutCredentials && (withoutCredentials = !1), q = $q.defer(), _driversObj ? q.resolve({}) : (driversObj = getDriverObj(withoutCredentials), driver = driversObj.getDirectDriver(), driver.onError = function(e) {
			return driversObj.close(), _driversObj = null, e instanceof Event && "error" === e.type ? q.reject(getSocketErrorObj()) : e.code && e.message ? q.reject(buildErrorObj(e.code, e.message)) : e.fields && e.fields[0] ? q.reject(e) : void 0
		}, driver.onCompleted = function(m) {
			return _driversObj = driversObj, session.close(), q.resolve(m)
		}, session = driver.session()), q.promise
	}, connect = function(withoutCredentials) {
		var q;
		return null == withoutCredentials && (withoutCredentials = !1), clearConnection(), q = $q.defer(), testConnection(withoutCredentials).then(function(r) {
			return q.resolve(r)
		}, function(e) {
			return q.reject(e)
		}), q.promise
	}, clearConnection = function() {
		return null != _driversObj && _driversObj.close(), _driversObj = null
	}, transaction = function(opts, session, tx) {
		var p, parameters, q, ref, ref1, statement;
		return statement = (null != (ref = opts[0]) ? ref.statement : void 0) || "", parameters = (null != (ref1 = opts[0]) ? ref1.parameters : void 0) || {}, q = $q.defer(), session ? (p = session.run(statement, parameters), p.then(function(r) {
			return session.close(), q.resolve(r)
		})["catch"](function(e) {
			return session.close(), checkConnectionError(e), q.reject(e)
		})) : ($rootScope.check(), q.reject(getSocketErrorObj())), {
			promise: q.promise,
			session: session
		}
	}, routedWriteTransaction = function(query, parameters) {
		var session, statements;
		return null == parameters && (parameters = {}), statements = query ? [{
			statement: query,
			parameters: parameters
		}] : [], session = _driversObj ? _driversObj.getRoutedDriver().session(bolt.session.WRITE) : !1, transaction(statements, session)
	}, routedReadTransaction = function(query, parameters) {
		var session, statements;
		return null == parameters && (parameters = {}), statements = query ? [{
			statement: query,
			parameters: parameters
		}] : [], session = _driversObj ? _driversObj.getRoutedDriver().session(bolt.session.READ) : !1, transaction(statements, session)
	}, directTransaction = function(query, parameters) {
		var session, statements;
		return null == parameters && (parameters = {}), statements = query ? [{
			statement: query,
			parameters: parameters
		}] : [], session = _driversObj ? _driversObj.getDirectDriver().session() : !1, transaction(statements, session)
	}, callProcedure = function(query, parameters) {
		var q, result, statements;
		return null == parameters && (parameters = {}), statements = query ? [{
			statement: "CALL " + query,
			parameters: parameters
		}] : [], result = transaction(statements), q = $q.defer(), result.promise.then(function(res) {
			return q.resolve(res.records)
		})["catch"](function(err) {
			return q.resolve([])
		}), q.promise
	}, metaResultToRESTResult = function(labels, relationshipTypes, propertyKeys) {
		return {
			labels: labels.get(1),
			relationships: relationshipTypes.get(1),
			propertyKeys: propertyKeys.get(1)
		}
	}, versionResultToRESTResult = function(r) {
		return r.records ? {
			version: r.records[0].get("versions")[0],
			edition: r.records[0].get("edition")
		} : null
	}, constructUserResult = function(r) {
		var getRoles, record;
		return r.records ? (record = r.records[0], getRoles = indexOf.call(record.keys, "roles") >= 0 ? record.get("roles") : ["admin"], {
			username: record.get("username"),
			roles: getRoles
		}) : null
	}, constructCoreEdgeOverview = function(r) {
		var entries;
		return r.records ? entries = r.records.map(function(entry) {
			return {
				id: entry.get("id"),
				addresses: entry.get("addresses"),
				role: entry.get("role")
			}
		}) : null
	}, getClusterRole = function(r) {
		return r.records && r.records.length > 0 ? r.records[0].get("role") : null
	}, constructUserListResult = function(r) {
		var hasRoles, records;
		return(records = r.records) ? (hasRoles = indexOf.call(records[0].keys, "roles") >= 0 ? !0 : !1, records.map(function(user) {
			var roles;
			return roles = hasRoles ? user.get("roles") : "N/A", {
				username: user.get("username"),
				roles: roles,
				flags: user.get("flags")
			}
		})) : null
	}, constructRolesListResult = function(r) {
		return r.records ? r.records.map(function(user) {
			return user.get("role")
		}) : null
	}, jmxResultToRESTResult = function(r) {
		var mapped;
		return r.records ? (mapped = r.records.map(function(record) {
			var origAttributes;
			return origAttributes = record.get("attributes"), {
				name: record.get("name"),
				description: record.get("description"),
				attributes: Object.keys(record.get("attributes")).map(function(attributeName) {
					return {
						name: attributeName,
						description: origAttributes[attributeName].description,
						value: origAttributes[attributeName].value
					}
				})
			}
		}), {
			data: BoltIntHelpers.mapBoltIntsToStrings(mapped)
		}) : {
			data: []
		}
	}, schemaResultToRESTResult = function(indexes, constraints) {
		var constraint, constraintsString, index, indexString, j, k, len, len1;
		if(indexString = "", constraintsString = "", 0 === indexes.length) indexString = "No indexes";
		else
			for(indexString = "Indexes", j = 0, len = indexes.length; len > j; j++) index = indexes[j], indexString += "\n  " + index.description.replace("INDEX", "") + " " + index.state.toUpperCase(), "node_unique_property" === index.type && (indexString += " (for uniqueness constraint)");
		if(0 === constraints.length) constraintsString = "No constraints";
		else
			for(constraintsString = "Constraints", k = 0, len1 = constraints.length; len1 > k; k++) constraint = constraints[k], constraintsString += "\n  " + constraint.description.replace("CONSTRAINT", "");
		return indexString + "\n\n" + constraintsString + "\n"
	}, boltResultToRESTResult = function(result) {
		var keys, obj, res, rows;
		return res = result.records || [], obj = {
			config: {},
			headers: function() {
				return []
			},
			data: {
				results: [{
					columns: [],
					data: [],
					stats: {}
				}],
				notifications: result.summary && result.summary.notifications ? result.summary.notifications : [],
				errors: []
			}
		}, result.fields ? (obj.data.errors = result.fields, obj) : result.code && result.message ? boltResultToRESTResult(buildErrorObj(result.code, result.message)) : (keys = res.length ? res[0].keys : [], obj.data.results[0].columns = keys, result.summary && result.summary.plan && (obj.data.results[0].plan = boltPlanToRESTPlan(result.summary.plan)), result.summary && result.summary.profile && (obj.data.results[0].plan = boltPlanToRESTPlan(result.summary.profile)), obj.data.results[0].stats = boltStatsToRESTStats(result.summary), rows = res.map(function(record) {
			return {
				row: getRESTRowsFromBolt(record, keys),
				meta: getRESTMetaFromBolt(record, keys),
				graph: getRESTGraphFromBolt(record, keys)
			}
		}), obj.data.results[0].data = rows, obj)
	}, getRESTRowsFromBolt = function(record, keys) {
		return keys.reduce(function(tot, curr) {
			var res;
			return res = extractDataForRowsFormat(record.get(curr)), Array.isArray(res) && (res = [res]), tot.concat(res)
		}, [])
	}, getRESTMetaFromBolt = function(record, keys) {
		var items;
		return items = keys.map(function(key) {
			return record.get(key)
		}), items.map(function(item) {
			var type;
			return item instanceof bolt.types.Node && (type = "node"), item instanceof bolt.types.Relationship && (type = "relationship"), type ? {
				id: item.identity,
				type: type
			} : null
		})
	}, getRESTGraphFromBolt = function(record, keys) {
		var graphItems, items, nodes, rels;
		return items = keys.map(function(key) {
			return record.get(key)
		}), graphItems = Utils.flattenArray([extractDataForGraphFormat(items)]), graphItems.map(function(item) {
			return item.identity && (item.id = item.identity.toString()), item
		}), nodes = graphItems.filter(function(item) {
			return item instanceof bolt.types.Node
		}), rels = graphItems.filter(function(item) {
			return item instanceof bolt.types.Relationship
		}).map(function(item) {
			return item.startNode = item.start.toString(), item.endNode = item.end.toString(), item
		}), {
			nodes: nodes,
			relationships: rels
		}
	}, extractDataForRowsFormat = function(item) {
		var out;
		return item instanceof bolt.types.Node ? item.properties : item instanceof bolt.types.Relationship ? item.properties : item instanceof bolt.types.Path ? [].concat.apply([], extractPathForRowsFormat(item)) : null === item ? item : bolt.isInt(item) ? item : Array.isArray(item) ? item.map(function(subitem) {
			return extractDataForRowsFormat(subitem)
		}) : "object" == typeof item ? (out = {}, Object.keys(item).forEach(function(_this) {
			return function(key) {
				return out[key] = extractDataForRowsFormat(item[key])
			}
		}(this)), out) : item
	}, extractPathForRowsFormat = function(path) {
		return path.segments.map(function(segment) {
			return [extractDataForRowsFormat(segment.start), extractDataForRowsFormat(segment.relationship), extractDataForRowsFormat(segment.end)]
		})
	}, extractPathsForGraphFormat = function(paths) {
		return Array.isArray(paths) || (paths = [paths]), paths.reduce(function(all, path) {
			return path.segments.forEach(function(segment) {
				return all.push(segment.start), all.push(segment.end), all.push(segment.relationship)
			}), all
		}, [])
	}, extractDataForGraphFormat = function(item) {
		var out;
		return item instanceof bolt.types.Node ? item : item instanceof bolt.types.Relationship ? item : item instanceof bolt.types.Path ? [].concat.apply([], extractPathsForGraphFormat(item)) : null === item ? !1 : bolt.isInt(item) ? item : Array.isArray(item) ? item.map(function(subitem) {
			return extractDataForGraphFormat(subitem)
		}).filter(function(i) {
			return i
		}) : "object" == typeof item ? (out = Object.keys(item).map(function(key) {
			return extractDataForGraphFormat(item[key])
		}).filter(function(i) {
			return i
		}), out.length ? out : !1) : !1
	}, boltPlanToRESTPlan = function(plan) {
		var obj;
		return obj = boltPlanToRESTPlanShared(plan), obj["runtime-impl"] = plan.arguments["runtime-impl"], obj["planner-impl"] = plan.arguments["planner-impl"], obj.version = plan.arguments.version, obj.KeyNames = plan.arguments.KeyNames, obj.planner = plan.arguments.planner, obj.runtime = plan.arguments.runtime, {
			root: obj
		}
	}, boltPlanToRESTPlanShared = function(plan) {
		return {
			operatorType: plan.operatorType,
			LegacyExpression: plan.arguments.LegacyExpression,
			ExpandExpression: plan.arguments.ExpandExpression,
			Signature: plan.arguments.Signature,
			DbHits: plan.dbHits,
			Rows: plan.rows,
			EstimatedRows: plan.arguments.EstimatedRows,
			identifiers: plan.identifiers,
			Index: plan.arguments.Index,
			children: plan.children.map(boltPlanToRESTPlanShared)
		}
	}, boltStatsToRESTStats = function(summary) {
		var counters, newStats, stats;
		return summary && summary.counters ? (counters = summary.counters, stats = counters._stats, newStats = {}, Object.keys(stats).forEach(function(key) {
			var newKey;
			return newKey = key.replace(/([A-Z]+)/, function(m) {
				return "_" + m.toLowerCase()
			}), newStats[newKey] = stats[key]
		}), newStats.contains_updates = counters.containsUpdates(), newStats) : {}
	}, getSocketErrorObj = function() {
		return _errorStatus ? _errorStatus : buildErrorObj("Socket.Error", "Socket error. Is the server online and have websockets open?")
	}, buildErrorObj = function(code, message) {
		return {
			fields: [{
				code: code,
				message: message
			}]
		}
	}, recursivelyBoltIntToJsNumber = function(any) {
		var operation, test;
		return test = function(n) {
			return bolt.isInt(n)
		}, operation = function(n) {
			return n.toNumber()
		}, Utils.transformWhatInVal(any, test, [operation])
	}, $rootScope.$on("connection:authdata_updated", function() {
		return connect()
	}), {
		getBoltHost: getBoltHost,
		bolt: bolt,
		runQueryOnCluster: runQueryOnCluster,
		testConnection: testConnection,
		connect: connect,
		transaction: transaction,
		boltTransaction: routedWriteTransaction,
		routedWriteTransaction: routedWriteTransaction,
		routedReadTransaction: routedReadTransaction,
		directTransaction: directTransaction,
		callProcedure: callProcedure,
		constructUserResult: constructUserResult,
		constructCoreEdgeOverview: constructCoreEdgeOverview,
		getClusterRole: getClusterRole,
		constructUserListResult: constructUserListResult,
		constructRolesListResult: constructRolesListResult,
		constructResult: function(res) {
			return boltResultToRESTResult(res)
		},
		constructMetaResult: function(labels, relationshipTypes, propertyKeys) {
			return metaResultToRESTResult(labels, relationshipTypes, propertyKeys)
		},
		constructSchemaResult: function(indexes, constraints) {
			return schemaResultToRESTResult(indexes, constraints)
		},
		constructJmxResult: jmxResultToRESTResult,
		constructVersionResult: versionResultToRESTResult,
		clearConnection: clearConnection,
		recursivelyBoltIntToJsNumber: recursivelyBoltIntToJsNumber
	}
}]), angular.module("neo4jApp.services").factory("CypherResult", ["$rootScope", function($rootScope) {
	var CypherResult;
	return CypherResult = function() {
		function CypherResult(_response) {
			var base, i, j, k, len, len1, len2, node, ref, ref1, ref2, ref3, relationship, row;
			if(this._response = null != _response ? _response : {}, this.nodes = [], this.other = [], this.relationships = [], this.size = 0, this.displayedSize = 0, this.stats = {}, this.size = (null != (ref = this._response.data) ? ref.length : void 0) || 0, this.displayedSize = this.size, this._response.stats && this._setStats(this._response.stats), null == (base = this._response).data && (base.data = []), null == this._response.data) return this._response;
			for(ref1 = this._response.data, i = 0, len = ref1.length; len > i; i++) {
				for(row = ref1[i], ref2 = row.graph.nodes, j = 0, len1 = ref2.length; len1 > j; j++) node = ref2[j], this.nodes.push(node);
				for(ref3 = row.graph.relationships, k = 0, len2 = ref3.length; len2 > k; k++) relationship = ref3[k], this.relationships.push(relationship)
			}
			this._response
		}
		return CypherResult.prototype.response = function() {
			return this._response
		}, CypherResult.prototype.rows = function() {
			var cell, entry, i, len, ref, results;
			for(ref = this._response.data, results = [], i = 0, len = ref.length; len > i; i++) entry = ref[i], results.push(function() {
				var j, len1, ref1, results1;
				for(ref1 = entry.row, results1 = [], j = 0, len1 = ref1.length; len1 > j; j++) cell = ref1[j], null == cell ? results1.push(null) : null != cell.self ? results1.push(angular.copy(cell.data)) : results1.push(angular.copy(cell));
				return results1
			}());
			return results
		}, CypherResult.prototype.columns = function() {
			return this._response.columns
		}, CypherResult.prototype.isTextOnly = function() {
			return 0 === this.nodes.length && 0 === this.relationships.length
		}, CypherResult.prototype._setStats = function(stats) {
			return this.stats = stats, null != this.stats && (this.stats.labels_added > 0 || this.stats.labels_removed > 0) ? $rootScope.$broadcast("db:changed:labels", angular.copy(this.stats)) : void 0
		}, CypherResult
	}()
}]);
var addLeadingZero;
addLeadingZero = function(num) {
	return("00" + num).slice(-2)
}, angular.module("neo4jApp.filters").filter("toDateString", function() {
	return function(input) {
		return null == input ? "" : new Date(input).toDateString()
	}
}).filter("toISOString", function() {
	return function(input) {
		return null == input ? "" : new Date(input).toISOString()
	}
}).filter("toYYYYMMDDHis", function() {
	return function(input) {
		var date;
		return null == input ? "" : (date = new Date(input), date.getUTCFullYear() + "-" + addLeadingZero(date.getUTCMonth() + 1) + "-" + addLeadingZero(date.getUTCDate()) + " " + addLeadingZero(date.getUTCHours()) + ":" + addLeadingZero(date.getUTCMinutes()) + ":" + addLeadingZero(date.getUTCSeconds()) + " UTC")
	}
}), angular.module("neo4jApp.filters").filter("isObjectEmpty", function() {
	return function(obj) {
		return !obj || Array.isArray(obj) || "object" != typeof obj || Object.keys(obj).length < 1
	}
}), angular.module("neo4jApp.controllers").controller("SyncVersionRestoreKeyCtrl", ["$scope", "SyncService", function($scope, SyncService) {
	return $scope.removeElementCallback = function(el) {
		return function(err, success) {
			return err ? void 0 : $scope.pickedTimestamp = 0
		}
	}
}]), angular.module("neo4jApp.services").service("DefaultContentService", ["Document", "Folder", function(Document, Folder) {
	var DefaultContent, basic_scripts, example_graphs, procedure_scripts, profile_scripts;
	return basic_scripts = [{
		folder: "basics",
		content: "// Query Template\n:play query-template"
	}, {
		folder: "basics",
		content: '// Hello World!\nCREATE (database:Database {name:"Neo4j"})-[r:SAYS]->(message:Message {name:"Hello World!"}) RETURN database, message, r'
	}, {
		folder: "basics",
		content: "// Get some data\nMATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25"
	}, {
		folder: "basics",
		not_executable: !0,
		content: "// Create an index\n// Replace:\n//   'LabelName' with label to index\n//   'propertyKey' with property to be indexed\nCREATE INDEX ON :<LabelName>(<propertyKey>)"
	}, {
		folder: "basics",
		not_executable: !0,
		content: "// Create unique property constraint\n// Replace:\n//   'LabelName' with node label\n//   'propertyKey' with property that should be unique\nCREATE CONSTRAINT ON (n:<LabelName>) ASSERT n.<propertyKey> IS UNIQUE"
	}], profile_scripts = [{
		folder: "profile",
		content: "// Count all nodes\nMATCH (n)\nRETURN count(n)"
	}, {
		folder: "profile",
		content: "// Count all relationships\nMATCH ()-->() RETURN count(*);"
	}, {
		folder: "profile",
		content: "// What kind of nodes exist\n// Sample some nodes, reporting on property and relationship counts per node.\nMATCH (n) WHERE rand() <= 0.1\nRETURN\nDISTINCT labels(n),\ncount(*) AS SampleSize,\navg(size(keys(n))) as Avg_PropertyCount,\nmin(size(keys(n))) as Min_PropertyCount,\nmax(size(keys(n))) as Max_PropertyCount,\navg(size( (n)-[]-() ) ) as Avg_RelationshipCount,\nmin(size( (n)-[]-() ) ) as Min_RelationshipCount,\nmax(size( (n)-[]-() ) ) as Max_RelationshipCount"
	}, {
		folder: "profile",
		content: "// What is related, and how\nCALL db.schema()"
	}, {
		folder: "profile",
		content: "// List node labels\nCALL db.labels()"
	}, {
		folder: "profile",
		content: "// List relationship types\nCALL db.relationshipTypes()"
	}, {
		folder: "profile",
		content: "// Display contraints and indexes\n:schema"
	}], example_graphs = [{
		folder: "graphs",
		content: "// Movie Graph\n:play movie-graph"
	}, {
		folder: "graphs",
		content: "// Northwind Graph\n:play northwind-graph"
	}], procedure_scripts = [{
		folder: "procedures",
		content: "// List procedures\nCALL dbms.procedures()"
	}, {
		folder: "procedures",
		content: "// List functions\nCALL dbms.functions()"
	}, {
		folder: "procedures",
		content: "// Show meta-graph\nCALL db.schema()"
	}, {
		folder: "procedures",
		content: "// List running queries\nCALL dbms.listQueries()"
	}, {
		folder: "procedures",
		not_executable: !0,
		content: '// Wait for index to come online\n// E.g. db.awaitIndex(":Person(name)"))\nCALL db.awaitIndex(<param>)'
	}, {
		folder: "procedures",
		not_executable: !0,
		content: '// Schedule resampling of an index\n// E.g. db.resampleIndex(":Person(name)"))\nCALL db.resampleIndex(<param>)'
	}], new(DefaultContent = function() {
		function DefaultContent() {}
		return DefaultContent.prototype.getDefaultDocuments = function() {
			return basic_scripts.concat(example_graphs.concat(profile_scripts))
		}, DefaultContent.prototype.resetToDefault = function() {
			return Document.reset()
		}, DefaultContent.prototype.loadDefaultIfEmpty = function() {
			return [{
				id: "basics",
				name: "Basic Queries",
				expanded: !1,
				documents: basic_scripts
			}, {
				id: "graphs",
				name: "Example Graphs",
				expanded: !1,
				documents: example_graphs
			}, {
				id: "profile",
				name: "Data Profiling",
				expanded: !1,
				documents: profile_scripts
			}, {
				id: "procedures",
				name: "Common Procedures",
				expanded: !1,
				documents: procedure_scripts
			}]
		}, DefaultContent
	}())
}]), angular.module("neo4jApp.services").factory("CypherTransactionREST", ["$q", "CypherResult", "Server", "UsageDataCollectionService", "Timer", "Parameters", "Settings", function($q, CypherResult, Server, UDC, Timer, Parameters, Settings) {
	var CypherTransactionREST, parseId, promiseResult;
	return parseId = function(resource) {
		var id;
		return null == resource && (resource = ""), id = resource.split("/").slice(-2, -1), parseInt(id, 10)
	}, promiseResult = function(promise) {
		var q;
		return q = $q.defer(), promise.then(function(r) {
			var partResult, raw, results;
			return raw = {
				responseTime: r.data.responseTime || 0,
				request: r.config,
				response: {
					headers: r.headers(),
					data: r.data
				}
			}, raw.request.status = r.status, r ? r.data.errors && r.data.errors.length > 0 ? q.reject({
				protocol: "rest",
				errors: r.data.errors,
				raw: raw
			}) : (results = [], partResult = new CypherResult(r.data.results[0] || {}), partResult.protocol = "rest", partResult.raw = raw, partResult.notifications = r.data.notifications, results.push(partResult), q.resolve(results[0])) : q.reject({
				protocol: "rest",
				raw: raw
			})
		}, function(r) {
			var raw;
			return raw = {
				request: r.config,
				response: {
					headers: r.headers(),
					data: r.data
				}
			}, raw.request.status = r.status, q.reject({
				protocol: "rest",
				errors: r.data.errors || r.errors,
				raw: raw
			})
		}), q.promise
	}, CypherTransactionREST = function() {
		function CypherTransactionREST() {
			var delegate;
			this._reset(), this.requests = [], delegate = null
		}
		return CypherTransactionREST.prototype._requestDone = function(promise) {
			var that;
			return that = this, promise.then(function(res) {
				return that.requests.push(res)
			}, function(res) {
				return that.requests.push(res)
			})
		}, CypherTransactionREST.prototype._onSuccess = function() {}, CypherTransactionREST.prototype._onError = function() {}, CypherTransactionREST.prototype._reset = function() {
			return this.id = null
		}, CypherTransactionREST.prototype.begin = function(query) {
			var parsed_result, rr, statements;
			return statements = query ? [{
				statement: query
			}] : [], rr = Server.transaction({
				path: "",
				statements: statements
			}).success(function(_this) {
				return function(r) {
					var ref;
					return _this.id = parseId(r.commit), null != (ref = _this.delegate) && ref.transactionStarted.call(_this.delegate, _this.id, _this), r
				}
			}(this)), parsed_result = promiseResult(rr), this._requestDone(parsed_result), parsed_result
		}, CypherTransactionREST.prototype.execute = function(query) {
			var parsed_result;
			return this.id ? (parsed_result = promiseResult(Server.transaction({
				path: "/" + this.id,
				statements: [{
					statement: query
				}]
			})), this._requestDone(parsed_result), parsed_result) : this.begin(query)
		}, CypherTransactionREST.prototype.commit = function(query, params) {
			var p, q, res, rr, statements, timer;
			return null == params && (params = null), params = angular.extend({}, Parameters, params), statements = query ? [{
				statement: query,
				parameters: params
			}] : [], UDC.increment("cypher_attempts"), timer = Timer.start(), this.id ? (q = $q.defer(), rr = Server.transaction({
				path: "/" + this.id + "/commit",
				statements: statements
			}).success(function(_this) {
				return function(r) {
					var ref;
					return r.responseTime = timer.stop().time(), null != (ref = _this.delegate) && ref.transactionFinished.call(_this.delegate, _this.id), _this._reset(), q.resolve(r)
				}
			}(this)).error(function(r) {
				return r.responseTime = timer.stop().time(), q.reject(r)
			}), res = promiseResult(rr), res.then(function() {
				return UDC.increment("cypher_wins")
			}, function() {
				return UDC.increment("cypher_fails")
			}), this._requestDone(res), res) : (p = Server.transaction({
				path: "/commit",
				statements: statements
			}), p.success(function(r) {
				return r.responseTime = timer.stop().time()
			}).error(function(r) {
				return r.responseTime = timer.stop().time()
			}), res = promiseResult(p), res.then(function() {
				return UDC.increment("cypher_wins")
			}, function() {
				return UDC.increment("cypher_fails")
			}), this._requestDone(res), res)
		}, CypherTransactionREST.prototype.rollback = function() {
			var q, server_promise;
			return q = $q.defer(), this.id ? (server_promise = Server["delete"](Settings.endpoint.transaction + "/" + this.id), server_promise.then(function(_this) {
				return function(r) {
					return _this._reset(), q.resolve(r)
				}
			}(this), function(r) {
				return q.reject(r)
			}), q.promise) : (q.resolve({}), q.promise)
		}, CypherTransactionREST
	}()
}]), angular.module("neo4jApp.services").factory("CypherTransactionBolt", ["$q", "CypherResult", "Bolt", "UsageDataCollectionService", "Parameters", "Utils", "$rootScope", function($q, CypherResult, Bolt, UDC, Parameters, Utils, $rootScope) {
	var CypherTransactionBolt, parseId, promiseResult;
	return parseId = function(resource) {
		var id;
		return null == resource && (resource = ""), id = resource.split("/").slice(-2, -1), parseInt(id, 10)
	}, promiseResult = function(promise) {
		var q;
		return q = $q.defer(), promise.then(function(res) {
			var partResult, raw, remapped, results;
			return raw = res.original, remapped = res.remapped, remapped ? remapped.data.errors && remapped.data.errors.length > 0 ? q.reject({
				protocol: "bolt",
				errors: remapped.data.errors,
				raw: raw
			}) : (results = [], partResult = new CypherResult(remapped.data.results[0] || {}), partResult.protocol = "bolt", partResult.raw = raw, partResult.notifications = remapped.data.notifications, results.push(partResult), q.resolve(results[0])) : q.reject({
				protocol: "bolt",
				raw: raw
			})
		}, function(res) {
			var remapped;
			return remapped = res.remapped, q.reject({
				protocol: "bolt",
				raw: res.original,
				errors: remapped.data.errors,
				notifications: remapped.data.notifications
			})
		}), q.promise
	}, CypherTransactionBolt = function() {
		function CypherTransactionBolt() {
			var delegate;
			this._reset(), this.requests = [], delegate = null, this.session = null
		}
		return CypherTransactionBolt.prototype._requestDone = function(promise) {
			var that;
			return that = this, promise.then(function(res) {
				return that.requests.push(res)
			}, function(res) {
				return that.requests.push(res)
			})
		}, CypherTransactionBolt.prototype._onSuccess = function() {}, CypherTransactionBolt.prototype._onError = function() {}, CypherTransactionBolt.prototype._reset = function() {
			return this.session = null
		}, CypherTransactionBolt.prototype.begin = function() {
			var q;
			return q = $q.defer(), q.resolve(), q.promise
		}, CypherTransactionBolt.prototype.commit = function(query, params) {
			var promise, q, ref, res, session, that, transformFn;
			return null == params && (params = null), that = this, params = angular.extend({}, Parameters, params), transformFn = function(n) {
				return parseInt(n) === Number(n) ? Bolt.bolt["int"](n) : Number(n)
			}, params = Utils.findNumberInVal(params, [transformFn]), UDC.increment("cypher_attempts"), q = $q.defer(), ref = Bolt.routedWriteTransaction(query, params), promise = ref.promise, session = ref.session, this.session = session, promise.then(function(r) {
				return $rootScope.bolt_connection_failure = !1, r.timings = Utils.buildTimingObject(Bolt.recursivelyBoltIntToJsNumber(r)), q.resolve({
					original: r,
					remapped: Bolt.constructResult(r)
				}), that._reset()
			})["catch"](function(r) {
				var errObj;
				return errObj = Bolt.constructResult(r), ("Socket.Error" === errObj.data.errors[0].code || 0 === errObj.data.errors[0].message.indexOf("WebSocket connection failure")) && ($rootScope.bolt_connection_failure = !0 && !$rootScope.unauthorized), r.timings = Utils.buildTimingObject(Bolt.recursivelyBoltIntToJsNumber(r)), q.reject({
					original: r,
					remapped: errObj
				}), that._reset()
			}), res = promiseResult(q.promise), res.then(function() {
				return UDC.increment("cypher_wins")
			}, function() {
				return UDC.increment("cypher_fails")
			}), this._requestDone(res), res
		}, CypherTransactionBolt.prototype.rollback = function() {
			var q, that;
			return q = $q.defer(), that = this, this.session ? this.session.close(function() {
				return that._reset(), q.resolve({
					original: {},
					remapped: Bolt.constructResult({})
				})
			}) : q.resolve({
				original: {},
				remapped: Bolt.constructResult({})
			}), promiseResult(q.promise)
		}, CypherTransactionBolt
	}()
}]), angular.module("neo4jApp.services").factory("UtilityBolt", ["Bolt", "Settings", "Utils", "$q", "$rootScope", function(Bolt, Settings, Utils, $q, $rootScope) {
	return {
		clearConnection: function() {
			return Bolt.clearConnection()
		},
		getSchema: function() {
			var q;
			return q = $q.defer(), Bolt.routedReadTransaction("CALL db.indexes() YIELD description, state, type WITH COLLECT({description: description, state: state, type: type}) AS indexes RETURN 'indexes' AS name, indexes AS items UNION CALL db.constraints() YIELD description WITH COLLECT({description: description}) AS constraints RETURN 'constraints' AS name, constraints AS items").promise.then(function(result) {
				return result.records.length ? q.resolve(Bolt.constructSchemaResult(result.records[0].get("items"), result.records[1].get("items"))) : q.resolve(Bolt.constructSchemaResult([], []))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		getMeta: function() {
			var q;
			return q = $q.defer(), Bolt.routedReadTransaction("CALL db.labels() YIELD label\nWITH COLLECT(label) AS labels\nRETURN 'labels' as a, labels as result\nUNION\nCALL db.relationshipTypes() YIELD relationshipType\nWITH COLLECT(relationshipType) AS relationshipTypes\nRETURN 'relationshipTypes'as a, relationshipTypes as result\nUNION\nCALL db.propertyKeys() YIELD propertyKey\nWITH COLLECT(propertyKey) AS propertyKeys\nRETURN 'propertyKeys' as a, propertyKeys as result").promise.then(function(result) {
				var res, res2, res3;
				return result.records.length ? (res = result.records[0], res2 = result.records[1], res3 = result.records[2], q.resolve(Bolt.constructMetaResult(res, res2, res3))) : q.resolve(Bolt.constructMetaResult([], [], []))
			}), q.promise
		},
		getUser: function() {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.showCurrentUser()").promise.then(function(r) {
				return q.resolve(Bolt.constructUserResult(r))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		getCoreEdgeRole: function() {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.cluster.role()").promise.then(function(r) {
				return q.resolve(Bolt.getClusterRole(r))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		getUserList: function() {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.listUsers()").promise.then(function(r) {
				return q.resolve(Bolt.constructUserListResult(r))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		getRolesList: function() {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.listRoles() YIELD role").promise.then(function(r) {
				return q.resolve(Bolt.constructRolesListResult(r))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		addNewUser: function(username, password, requirePasswordChange) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.createUser({username}, {password}, {requirePasswordChange})", {
				username: username,
				password: password,
				requirePasswordChange: requirePasswordChange
			}).promise.then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		changeUserPassword: function(username, password) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.changeUserPassword({username}, {password})", {
				username: username,
				password: password
			}).promise.then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		activateUser: function(username) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.activateUser({username})", {
				username: username
			}).promise.then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e).data)
			}), q.promise
		},
		suspendUser: function(username) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.suspendUser({username})", {
				username: username
			}).promise.then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e).data)
			}), q.promise
		},
		deleteUser: function(username) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.deleteUser({username})", {
				username: username
			}).promise.then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e).data)
			}), q.promise
		},
		addUserToRole: function(username, role) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.addRoleToUser({role}, {username})", {
				username: username,
				role: role
			}).promise.then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e).data)
			}), q.promise
		},
		removeRoleFromUser: function(username, role) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.security.removeRoleFromUser({role}, {username})", {
				username: username,
				role: role
			}).promise.then(function(r) {
				return q.resolve(r)
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e).data)
			}), q.promise
		},
		getVersion: function() {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.components()").promise.then(function(r) {
				return q.resolve(Bolt.constructVersionResult(r))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		getProceduresList: function() {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.procedures()").promise.then(function(r) {
				return q.resolve(r.records.map(function(r) {
					return r.get("name")
				}))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		getJmx: function(whatToGet) {
			var name, q;
			return null == whatToGet && (whatToGet = []), q = $q.defer(), name = 1 === whatToGet.length ? whatToGet[0] : "*:*", Bolt.directTransaction("CALL dbms.queryJmx('" + name + "')").promise.then(function(r) {
				return q.resolve(Bolt.constructJmxResult(r))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		makeRequest: function(withoutCredentials) {
			var q, r;
			return q = $q.defer(), r = Bolt.testConnection(withoutCredentials), r.then(function(r) {
				var errObj;
				return r.credentials_expired ? (errObj = {
					data: {}
				}, errObj.data.password_change = "true", errObj.status = 403, q.reject(errObj)) : ($rootScope.bolt_connection_failure = !1, q.resolve({}))
			}, function(err) {
				var errObj;
				return errObj = Bolt.constructResult(err), "Socket.Error" === errObj.data.errors[0].code || 0 === errObj.data.errors[0].message.indexOf("WebSocket connection failure") ? (errObj.status = 0, $rootScope.bolt_connection_failure = !0 && !$rootScope.unauthorized) : errObj.status = 401, q.reject(errObj)
			}), q.promise
		},
		setNewPassword: function(username, newPasswd) {
			var q;
			return q = $q.defer(), Bolt.directTransaction("CALL dbms.changePassword({password})", {
				password: newPasswd
			}).promise.then(function(r) {
				return q.resolve(Bolt.constructResult(r))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		getClusterOverview: function() {
			var q, that;
			return that = this, q = $q.defer(), Bolt.directTransaction("CALL dbms.cluster.overview()").promise.then(function(res) {
				var cluster, r;
				return r = Bolt.constructResult(res), cluster = Utils.fakeSingleInstanceCluster(r, that.getHost, "bolt"), cluster ? q.resolve(cluster) : q.reject(r)
			})["catch"](function(err) {
				var cluster, e;
				return e = Bolt.constructResult(err), cluster = Utils.fakeSingleInstanceCluster(e, that.getHost, "bolt"), cluster ? q.resolve(cluster) : q.reject(e)
			}), q.promise
		},
		getRunningQueries: function(cluster) {
			var q;
			return null == cluster && (cluster = []), q = $q.defer(), Bolt.runQueryOnCluster(cluster, "CALL dbms.listQueries()").then(function(r) {
				return q.resolve(r.map(function(result) {
					return "fulfilled" !== result.state ? !1 : Bolt.recursivelyBoltIntToJsNumber(Bolt.constructResult(result.value))
				}))
			})["catch"](function(e) {
				return q.reject(Bolt.constructResult(e))
			}), q.promise
		},
		killQuery: function(instance, queryId) {
			return Bolt.runQueryOnCluster([instance], "CALL dbms.killQuery($id)", {
				id: queryId
			})
		},
		getProtocol: function() {
			return "bolt"
		},
		getHost: function() {
			return "bolt://" + Bolt.getBoltHost()
		},
		getServerAddress: Utils.getServerAddressByProtocol.bind(null, "bolt")
	}
}]), angular.module("neo4jApp.services").factory("UtilityREST", ["Server", "Settings", "Utils", "$q", "$location", function(Server, Settings, Utils, $q, $location) {
	return {
		clearConnection: function() {
			return angular.noop
		},
		getJmx: function(whatToGet) {
			return null == whatToGet && (whatToGet = []), Server.jmx(whatToGet)
		},
		mapResult: function(columns, data) {
			var returnObject;
			return returnObject = {}, columns.forEach(function(c, i) {
				return returnObject[c] = data[i]
			}), returnObject
		},
		getUser: function() {
			var q, that;
			return q = $q.defer(), that = this, Server.cypher("", {
				query: "CALL dbms.security.showCurrentUser()"
			}).then(function(res) {
				var mappedResult;
				return mappedResult = that.mapResult(res.data.columns, res.data.data[0]), null != mappedResult.roles ? q.resolve({
					username: mappedResult.username,
					roles: mappedResult.roles
				}) : q.resolve({
					username: mappedResult.username,
					roles: ["admin"]
				})
			}), q.promise
		},
		getCoreEdgeRole: function() {
			var q;
			return q = $q.defer(), Server.cypher("", {
				query: "CALL dbms.cluster.role()"
			}).then(function(res) {
				return res.data.data && res.data.data.length > 0 && res.data.data[0].length > 0 ? q.resolve(res.data.data[0][0]) : q.resolve(null)
			}), q.promise
		},
		getUserList: function() {
			var q, that;
			return q = $q.defer(), that = this, Server.cypher("", {
				query: "CALL dbms.security.listUsers()"
			}).then(function(res) {
				var data, users;
				return data = res.data, users = data.data.map(function(user) {
					return that.mapResult(res.data.columns, user)
				}), q.resolve(users)
			}), q.promise
		},
		getRolesList: function() {
			var q;
			return q = $q.defer(), Server.cypher("", {
				query: "CALL dbms.security.listRoles() YIELD role"
			}).then(function(res) {
				var data, users;
				return data = res.data, users = data.data.map(function(v) {
					return v[0]
				}), q.resolve(users)
			}), q.promise
		},
		callUserAdminProcedure: function(statement, parameters) {
			var p, q, statements;
			return q = $q.defer(), statements = [{
				statement: statement,
				parameters: parameters
			}], p = Server.transaction({
				path: "/commit",
				statements: statements
			}), q = $q.defer(), p.then(function(res) {
				return res.data.errors.length > 0 && q.reject(res.data), 0 === res.data.errors.length ? q.resolve(!0) : void 0
			}, function(res) {
				return q.reject(res)
			}), q.promise
		},
		changeUserPassword: function(username, password) {
			return this.callUserAdminProcedure("CALL dbms.security.changeUserPassword({username}, {password})", {
				username: username,
				password: password
			})
		},
		addNewUser: function(username, password, requirePasswordChange) {
			return this.callUserAdminProcedure("CALL dbms.security.createUser({username}, {password}, {requirePasswordChange})", {
				username: username,
				password: password,
				requirePasswordChange: requirePasswordChange
			})
		},
		suspendUser: function(username) {
			return this.callUserAdminProcedure("CALL dbms.security.suspendUser({username})", {
				username: username
			})
		},
		deleteUser: function(username) {
			return this.callUserAdminProcedure("CALL dbms.security.deleteUser({username})", {
				username: username
			})
		},
		activateUser: function(username) {
			return this.callUserAdminProcedure("CALL dbms.security.activateUser({username})", {
				username: username
			})
		},
		addUserToRole: function(username, role) {
			return this.callUserAdminProcedure("CALL dbms.security.addRoleToUser({role}, {username})", {
				username: username,
				role: role
			})
		},
		removeRoleFromUser: function(username, role) {
			return this.callUserAdminProcedure("CALL dbms.security.removeRoleFromUser({role}, {username})", {
				username: username,
				role: role
			})
		},
		getProceduresList: function() {
			var q;
			return q = $q.defer(), Server.cypher("", {
				query: "CALL dbms.procedures()"
			}).then(function(res) {
				return q.resolve(res.data.data.map(function(record) {
					return record[0]
				}))
			}), q.promise
		},
		getVersion: function(version) {
			var q;
			return q = $q.defer(), q.resolve(Server.version(version)), q.promise
		},
		getAddresses: function() {
			var q;
			return q = $q.defer(), q.resolve(Server.addresses()), q.promise
		},
		getSchema: function(input) {
			var q;
			return q = $q.defer(), Server.console(input.substr(1)).then(function(r) {
				var response;
				return response = r.data[0], response.match("Unknown") ? q.reject(error("Unknown action", null, response)) : q.resolve(response)
			}), q.promise
		},
		getMeta: function() {
			var obj, q;
			return q = $q.defer(), obj = {
				labels: Server.labels(),
				relationships: Server.relationships(),
				propertyKeys: Server.propertyKeys()
			}, q.resolve(obj), q.promise
		},
		makeRequest: function(withoutCredentials) {
			var opts, p;
			return opts = withoutCredentials ? {
				skipAuthHeader: withoutCredentials
			} : {}, p = Server.get(Settings.endpoint.rest + "/", opts)
		},
		setNewPassword: function(username, newPasswd) {
			return Server.post(Settings.endpoint.authUser + "/" + username + "/password", {
				password: newPasswd
			})
		},
		getClusterOverview: function() {
			var q, that;
			return that = this, q = $q.defer(), Server.transaction(Server.buildStatement("CALL dbms.cluster.overview()")).then(function(r) {
				var cluster;
				return cluster = Utils.fakeSingleInstanceCluster(r, that.getHost, $location.protocol()), cluster ? q.resolve(cluster) : q.reject(r)
			})["catch"](function(e) {
				var cluster;
				return cluster = Utils.fakeSingleInstanceCluster(e, that.getHost, $location.protocol()), cluster ? q.resolve(cluster) : q.reject(e)
			}), q.promise
		},
		getRunningQueries: function(cluster) {
			var q;
			return null == cluster && (cluster = []), q = $q.defer(), Server.runQueryOnCluster(cluster, "CALL dbms.listQueries()").then(function(r) {
				return q.resolve(r.map(function(result) {
					return "fulfilled" !== result.state ? !1 : result.value
				}))
			})["catch"](function(e) {
				return q.reject(e)
			}), q.promise
		},
		killQuery: function(instance, queryId) {
			return Server.runQueryOnCluster([instance], "CALL dbms.killQuery($id)", {
				id: queryId
			})
		},
		getProtocol: function() {
			return $location.protocol()
		},
		getHost: function() {
			return Settings.host || $location.protocol() + "://" + $location.host() + ":" + $location.port()
		},
		getServerAddress: Utils.getServerAddressByProtocol.bind(null, $location.protocol())
	}
}]), angular.module("neo4jApp.services").factory("ProtocolFactory", ["Settings", "CypherTransactionREST", "CypherTransactionBolt", "UtilityREST", "UtilityBolt", function(Settings, CypherTransactionREST, CypherTransactionBolt, UtilityREST, UtilityBolt) {
	return {
		getCypherTransaction: function(useBolt) {
			return null == useBolt && (useBolt = Settings.useBolt), useBolt ? new CypherTransactionBolt : new CypherTransactionREST
		},
		utils: function(useBolt) {
			return null == useBolt && (useBolt = Settings.useBolt), useBolt ? UtilityBolt : UtilityREST
		}
	}
}]), angular.module("neo4jApp.controllers").controller("SyncSigninController", ["$scope", "Settings", "SettingsStore", "CurrentUser", "Editor", function($scope, Settings, SettingsStore, CurrentUser, Editor) {
	return $scope.settings = Settings, $scope.showSignupWarning = !1, $scope.signInToSync = function() {
		return $scope.settings.acceptedTermsAndPrivacy ? (Settings.shownTermsAndPrivacy = !0, SettingsStore.save(), CurrentUser.login()) : $scope.showSignupWarning = !0
	}, $scope.noThanks = function() {
		return Settings.shownTermsAndPrivacy = !0, SettingsStore.save(), Editor.execScript(Settings.cmdchar + "server connect")
	}, $scope.closeWarning = function() {
		return $scope.showSignupWarning = !1
	}, $scope.save = function() {
		return $scope.settings.acceptedTermsAndPrivacy && ($scope.showSignupWarning = !1), SettingsStore.save()
	}
}]), angular.module("neo4jApp.controllers").controller("QueryStatusCtrl", ["$scope", "ProtocolFactory", "Settings", "Features", "Utils", "$timeout", function($scope, ProtocolFactory, Settings, Features, Utils, $timeout) {
	var checkCluster, checkRunningQueriesInCluster, cluster, convertToJSON, maxRows, maxRowsHit, numQueries, numQueriesShown, queryLengthLimit, refreshInterval, removeFromQueryList, timer;
	return $scope.queries = [], $scope.isFetching = !1, $scope.autoRefresh = !1, $scope.hasErrors = !1, cluster = [], refreshInterval = 20, maxRows = Settings.maxRows, maxRowsHit = !1, numQueries = 0, numQueriesShown = 0, queryLengthLimit = 180, convertToJSON = ["parameters", "metaData"], timer = null, $scope.killQuery = function(clusterMember, queryId) {
		return removeFromQueryList(queryId), ProtocolFactory.utils().killQuery(clusterMember, queryId).then(function(r) {
			return $timeout(function() {
				return checkRunningQueriesInCluster(cluster)
			}, 500)
		})
	}, $scope.statusMessage = function() {
		var _clusterSize, _msgs, _numMachinesMsg, _numQueriesMsg;
		return _msgs = [], $scope.hasErrors && _msgs.push("Connecting to one or more cluster servers failed"), _clusterSize = cluster.length, _numMachinesMsg = "running on one server", _clusterSize > 1 && (_numMachinesMsg = "running on " + _clusterSize + " cluster servers"), _numQueriesMsg = numQueries > 1 ? "queries" : "query", maxRowsHit ? _msgs.push("Found " + numQueries + " " + _numQueriesMsg + " " + _numMachinesMsg + ", but displaying " + numQueriesShown + " of those due to config maxRows") : _msgs.push("Found " + numQueriesShown + " " + _numQueriesMsg + " " + _numMachinesMsg), _msgs.join(". ")
	}, $scope.toggleAutoRefresh = function() {
		return $scope.autoRefresh = !$scope.autoRefresh, $scope.refreshLater()
	}, $scope.refreshLater = function(_this) {
		return function() {
			return $timeout.cancel(timer), checkCluster(), $scope.autoRefresh ? timer = $timeout($scope.refreshLater, 1e3 * refreshInterval) : void 0
		}
	}(this), $scope.$on("$destroy", function(_this) {
		return function() {
			return $timeout.cancel(timer)
		}
	}(this)), checkCluster = function() {
		var mapAddressesFromResponse;
		return mapAddressesFromResponse = function(result) {
			return result.map(function(_c) {
				var _protocolAddress;
				return _protocolAddress = ProtocolFactory.utils().getServerAddress(_c.addresses), _c.address = null != _protocolAddress ? _protocolAddress[0] : void 0, _c
			}).filter(function(_c) {
				return _c.address
			})
		}, $scope.isFetching = !0, Features.usingCoreEdge ? ProtocolFactory.utils().getClusterOverview().then(function(r) {
			return cluster = mapAddressesFromResponse(r), checkRunningQueriesInCluster(cluster)
		})["catch"](function(_e) {
			return console.log(_e), $scope.isFetching = !1
		}) : (cluster = mapAddressesFromResponse(Utils.fakeSingleInstanceCluster(null, ProtocolFactory.utils().getHost, "bolt")), checkRunningQueriesInCluster(cluster))
	}, checkRunningQueriesInCluster = function(cluster) {
		return $scope.hasErrors = !1, ProtocolFactory.utils().getRunningQueries(cluster).then(function(_resArr) {
			var _outQueries, _sortArr;
			return _resArr = _resArr.reduce(function(_all, _r, _clusterMemberIndex) {
				return _r ? (_r.data.results[0].data.forEach(function(_member) {
					var _tmp;
					return _tmp = {}, _member.row.forEach(function(_col, i) {
						var _suffix;
						return convertToJSON.indexOf(_r.data.results[0].columns[i]) > -1 && (_col = JSON.stringify(_col)), _suffix = _col.length > queryLengthLimit ? "..." : "", _tmp[_r.data.results[0].columns[i]] = _col.substring(0, queryLengthLimit) + _suffix
					}), _tmp.clusterMember = cluster[_clusterMemberIndex], _all.push(_tmp)
				}), _all) : ($scope.hasErrors = !0, _all)
			}, []), _sortArr = _resArr.map(function(query, i) {
				return {
					index: i,
					sortVal: "" + query.clusterMember.address + query.elapsedTime
				}
			}), _sortArr.sort(function(a, b) {
				return a.sortVal < b.sortVal ? -1 : 1
			}), _outQueries = _sortArr.map(function(el) {
				return _resArr[el.index]
			}), _resArr = null, numQueries = _outQueries.length, maxRowsHit = numQueries > maxRows ? !0 : !1, numQueriesShown = maxRowsHit ? maxRows : numQueries, $scope.isFetching = !1, $scope.queries = maxRowsHit ? _outQueries.slice(0, numQueriesShown) : _outQueries, _outQueries = null
		})["catch"](function(e) {
			return console.log(e), $scope.isFetching = !1
		})
	}, removeFromQueryList = function(queryId) {
		return $scope.queries = $scope.queries.filter(function(query) {
			return query.queryId !== queryId
		})
	}, checkCluster()
}]), angular.module("neo4jApp.directives").directive("checkOverflowingChildren", ["$timeout", function($timeout) {
	return {
		restrict: "A",
		scope: {
			overflowModel: "="
		},
		link: function(scope, element, attrs) {
			return $timeout(function() {
				var checks, overflows;
				if(scope.overflowModel.overflows !== !0 && scope.overflowModel.overflows !== !1) return checks = $(element).find(".check-overflow"), overflows = !1, checks.each(function(i, e) {
					return e.scrollWidth > e.offsetWidth ? overflows = !0 : void 0
				}), scope.overflowModel.overflows = overflows
			}, 0)
		}
	}
}]);
var neo, indexOf = [].indexOf || function(item) {
	for(var i = 0, l = this.length; l > i; i++)
		if(i in this && this[i] === item) return i;
	return -1
};
"undefined" != typeof global && null !== global && (global.neo = global.neo || {}), "undefined" != typeof window && null !== window && (window.neo = window.neo || {}), neo = ("undefined" != typeof global && null !== global ? global.neo : void 0) || ("undefined" != typeof window && null !== window ? window.neo : void 0), neo.helpers = function() {
	function helpers() {
		this.argv = function(input) {
			var rv;
			return rv = input.toLowerCase().split(" "), rv || []
		}, this.parseId = function(resource) {
			var id;
			return null == resource && (resource = ""), id = resource.substr(resource.lastIndexOf("/") + 1), parseInt(id, 10)
		}, this.stripComments = function(input) {
			var j, len, row, rows, rv;
			for(rows = input.split("\n"), rv = [], j = 0, len = rows.length; len > j; j++) row = rows[j], 0 !== row.indexOf("//") && rv.push(row);
			return rv.join("\n")
		}, this.firstWord = function(input) {
			return input.split(/\n| /)[0]
		}, this.equals = function(one, two) {
			return typeof one != typeof two ? !1 : "string" == typeof one && "string" == typeof two ? one === two : JSON.stringify(one) === JSON.stringify(two)
		}, this.mergeDocumentArrays = function(arr1, arr2) {
			return [].concat(arr1, arr2).reduce(function(tot, curr) {
				return tot.done.indexOf(curr.content) > -1 ? tot : (tot.done.push(curr.content), tot.out.push(curr), tot)
			}, {
				out: [],
				done: []
			}).out
		}, this.removeDocumentsFromArray = function(toRemove, removeFrom) {
			var toRemoveContent;
			return toRemoveContent = toRemove.map(function(doc) {
				return doc.content
			}), removeFrom.reduce(function(out, curr) {
				return toRemoveContent.indexOf(curr.content) > -1 ? out : out.concat(curr)
			}, [])
		}, this.extendDeep = function(_this) {
			return function(dst) {
				var index, key, obj, that, value;
				that = _this;
				for(index in arguments)
					if(obj = arguments[index], obj !== dst)
						for(key in obj) value = obj[key], dst[key] && "object" == typeof dst[key] && Object.getOwnPropertyNames(dst[key]).length > 0 ? that.extendDeep(dst[key], value) : "function" != typeof dst[key] && (dst[key] = value);
				return dst
			}
		}(this), this.extend = function(objects) {
			var extended, i, j, merge, obj, ref;
			for(extended = {}, merge = function(obj) {
					var index, prop, results1;
					results1 = [];
					for(index in obj) prop = obj[index], Object.prototype.hasOwnProperty.call(obj, index) ? results1.push(extended[index] = obj[index]) : results1.push(void 0);
					return results1
				}, merge(arguments[0]), i = j = 1, ref = arguments.length; ref >= 1 ? ref > j : j > ref; i = ref >= 1 ? ++j : --j) obj = arguments[i], merge(obj);
			return extended
		}, this.throttle = function(func, wait) {
			var last_timestamp, limit;
			return last_timestamp = null, limit = wait,
				function() {
					var args, context, now;
					return context = this, args = arguments, now = Date.now(), !last_timestamp || now - last_timestamp >= limit ? (last_timestamp = now, func.apply(context, args)) : void 0
				}
		}, this.parseTimeMillis = function(_this) {
			return function(timeWithOrWithoutUnit) {
				var unit, value;
				if(timeWithOrWithoutUnit += "", unit = timeWithOrWithoutUnit.match(/\D+/), value = parseInt(timeWithOrWithoutUnit), 1 !== (null != unit ? unit.length : void 0)) return 1e3 * value;
				switch(unit[0]) {
					case "ms":
						return value;
					case "s":
						return 1e3 * value;
					case "m":
						return 1e3 * value * 60;
					default:
						return 0
				}
			}
		}(this), this.ua2text = function(ua) {
			var i, j, ref, s;
			for(s = "", i = j = 0, ref = ua.length; ref >= 0 ? ref >= j : j >= ref; i = ref >= 0 ? ++j : --j) s = s + "" + String.fromCharCode(ua[i]);
			return s
		}, this.escapeHTML = function(string) {
			var entityMap;
			return entityMap = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
				"/": "&#x2F;"
			}, String(string).replace(/[&<>"'\/]/g, function(s) {
				return entityMap[s]
			})
		}, this.cleanHTML = function(string) {
			return this.stripNGAttributes(this.stripScripts(string))
		}, this.stripScripts = function(string) {
			return null == string && (string = ""), string = string.replace(/(\s+(on[^\s=]+)[^\s=]*\s*=\s*("[^"]*"|'[^']*'|[\w\-.:]+\s*))/gi, ""), string.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*(<\/script>)?/gi, "")
		}, this.stripNGAttributes = function(string) {
			return null == string && (string = ""), string.replace(/(\s+(ng|data|x)[^\s=]*\s*=\s*("[^"]*"|'[^']*'|[\w\-.:]+\s*))/gi, "")
		}, this.hostIsAllowed = function(uri, whitelist) {
			var host_without_port, hostname, hostnamePlusProtocol, whitelisted_hosts;
			return "*" === whitelist ? !0 : (host_without_port = document.createElement("a"), host_without_port.setAttribute("href", uri), hostnamePlusProtocol = host_without_port.protocol + "//" + host_without_port.hostname, hostname = host_without_port.hostname, whitelisted_hosts = null != whitelist && "" !== whitelist ? whitelist.split(",") : ["guides.neo4j.com", "localhost"], indexOf.call(whitelisted_hosts, hostname) >= 0 || indexOf.call(whitelisted_hosts, hostnamePlusProtocol) >= 0)
		}, this.getBrowserName = function() {
			return window.opera || navigator.userAgent.indexOf(" OPR/") >= 0 ? "Opera" : "undefined" != typeof InstallTrigger ? "Firefox" : Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor") > 0 ? "Safari" : window.chrome ? "Chrome" : document.documentMode ? "Internet Explorer" : window.StyleMedia ? "Edge" : "Unknown"
		}, this.getServerHostname = function(Settings) {
			return Settings.host ? Settings.host : location.href
		}, this.flattenArray = function(arr) {
			var that;
			return that = this, Array.isArray(arr) ? arr.reduce(function(flat, item) {
				return Array.isArray(item) || flat.push(item), Array.isArray(item) && (flat = [].concat.apply(flat, [].concat.apply(that.flattenArray(item)))), flat
			}, []) : !1
		}, this.getUrlParam = function(name, theLocation) {
			var out, re, results;
			if(!theLocation) return !1;
			for(out = [], re = new RegExp("[\\?&]" + name + "=([^&#]*)", "g"); null !== (results = re.exec(theLocation));) results && results[1] && out.push(results[1]);
			return out.length ? out : void 0
		}, this.isNumber = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n)
		}, this.applyOperationsTo = function(n, operations) {
			var val;
			return null == operations && (operations = []), val = n, operations.forEach(function(o) {
				return val = o(val)
			}), val
		}, this.findNumberInVal = function(val, operations) {
			var test, that;
			return null == operations && (operations = []), that = this, test = function(n) {
				return "number" == typeof n || "string" == typeof n && that.isNumber(n)
			}, this.transformWhatInVal(val, test, operations)
		}, this.transformWhatInVal = function(val, test, operations) {
			return null == operations && (operations = []), test(val) ? this.applyOperationsTo(val, operations) : Array.isArray(val) ? this.transformWhatInArray(val, test, operations) : "object" == typeof val && null !== val ? this.transformWhatInObject(val, test, operations) : val
		}, this.transformWhatInArray = function(arr, test, operations) {
			return null == operations && (operations = []), arr.map(function(_this) {
				return function(n) {
					return _this.transformWhatInVal(n, test, operations)
				}
			}(this))
		}, this.transformWhatInObject = function(obj, test, operations) {
			var out;
			return null == operations && (operations = []), out = {}, Object.keys(obj).forEach(function(_this) {
				return function(p) {
					return out[p] = _this.transformWhatInVal(obj[p], test, operations)
				}
			}(this)), out
		}, this.ensureFullBoltAddress = function(address) {
			var URLREGEX, everythingElse, host, port, scheme;
			return URLREGEX = new RegExp(["([^/]+//)", "([^:/?#]*)", "(?::([0-9]+))?", ".*"].join("")), scheme = address.match(URLREGEX)[1], "bolt://" !== c ? address : (port = address.match(URLREGEX)[3] || 7687, host = address.match(URLREGEX)[2], everythingElse = address.match(URLREGEX)[4], everythingElse = everythingElse ? everythingElse + "/" : "", scheme + host + ":" + port + everythingElse)
		}, this.getServerAddressByProtocol = function(protocol, addresses) {
			var f;
			return null == addresses && (addresses = []), f = addresses.filter(function(a) {
				return 0 === a.indexOf(protocol + ":")
			}), f || void 0
		}, this.fakeSingleInstanceCluster = function(r, getHost, protocol) {
			var cluster, ref, ref1;
			return(null != r && null != (ref = r.data) && null != (ref1 = ref.errors) ? ref1.length : void 0) && "Neo.ClientError.Procedure.ProcedureNotFound" !== r.data.errors[0].code ? !1 : !r || r.data.errors.length ? [{
				addresses: [getHost()]
			}] : (cluster = [], r.data.results[0].data.forEach(function(member) {
				var tmp;
				return tmp = {}, member.row.forEach(function(col, i) {
					return tmp[r.data.results[0].columns[i]] = col
				}), !tmp.addresses && tmp.address && (tmp.addresses = [protocol + "://" + tmp.address]), cluster.push(tmp)
			}), cluster)
		}, this.buildTimingObject = function(result) {
			var obj, ref;
			return null == result && (result = {}), obj = {
				resultAvailableAfter: void 0,
				resultConsumedAfter: void 0,
				responseTime: (null != (ref = result.raw) ? ref.responseTime : void 0) || void 0,
				type: "client"
			}, result && result.summary && "undefined" != typeof result.summary.resultAvailableAfter && (obj.resultAvailableAfter = result.summary.resultAvailableAfter, obj.resultConsumedAfter = result.summary.resultConsumedAfter, obj.totalTime = obj.resultAvailableAfter + obj.resultConsumedAfter, obj.responseTime = void 0, obj.type = "bolt"), obj
		}, this.extractCommandParameters = function(cmd, input) {
			var matches, name, re, val;
			return cmd && input ? (re = new RegExp("^[^\\w]*" + cmd + "\\s+(?:(?:`([^`]+)`)|([^:]+))\\s*(?:(?::\\s?([^$]*))?)$"), (matches = re.exec(input)) ? (name = matches[1] || matches[2], val = matches[3], [name, val]) : null) : null
		}
	}
	return helpers
}();
var neo;
"undefined" != typeof global && null !== global && (global.neo = global.neo || {}), "undefined" != typeof window && null !== window && (window.neo = window.neo || {}), neo = ("undefined" != typeof global && null !== global ? global.neo : void 0) || ("undefined" != typeof window && null !== window ? window.neo : void 0), neo.boltIntHelpers = function() {
	function boltIntHelpers() {
		this.stringify = stringify, this.mapBoltIntsToStrings = mapBoltIntsToStrings, this.mapBoltIntsToInts = mapBoltIntsToInts
	}
	var bolt, mapBoltInts, mapBoltIntsToInts, mapBoltIntsToStrings, stringify;
	return bolt = window.neo4j.v1, stringify = function(val) {
		return bolt.isInt(val) ? val.toString() : Array.isArray(val) ? "[" + val.map(function(item) {
			return stringify(item)
		}).join() + "]" : null === val ? "null" : "object" == typeof val ? "{" + Object.keys(val).map(function(key) {
			return '"' + key + '":' + stringify(val[key])
		}).join() + "}" : "string" == typeof val ? '"' + val + '"' : val.toString()
	}, mapBoltIntsToStrings = function(val) {
		return mapBoltInts(val, function(boltInt) {
			return boltInt.toString()
		})
	}, mapBoltIntsToInts = function(val) {
		return mapBoltInts(val, function(boltInt) {
			return parseInt(boltInt.toString())
		})
	}, mapBoltInts = function(val, mappingFunc) {
		var out;
		return bolt.isInt(val) ? mappingFunc(val) : Array.isArray(val) ? val.map(function(item) {
			return mapBoltInts(item, mappingFunc)
		}) : "object" == typeof val && null !== val ? (out = {}, Object.keys(val).forEach(function(key) {
			return out[key] = mapBoltInts(val[key], mappingFunc)
		}), out) : val
	}, boltIntHelpers
}();
var neo;
"undefined" != typeof global && null !== global && (global.neo = global.neo || {}), "undefined" != typeof window && null !== window && (window.neo = window.neo || {}), neo = ("undefined" != typeof global && null !== global ? global.neo : void 0) || ("undefined" != typeof window && null !== window ? window.neo : void 0), neo.serializer = function() {
	function serializer(opts) {
		null == opts && (opts = {}), this.options = (new neo.helpers).extend(opts, {
			delimiter: ","
		}), this._output = "", this._columns = null, this.append = function(row) {
			var cell, ref;
			if(!Array.isArray(row) && row.length === (null != (ref = this._columns) ? ref.length : void 0)) throw "CSV: Row must an Array of column size";
			return this._output += "\n", this._output += function() {
				var i, len, results;
				for(results = [], i = 0, len = row.length; len > i; i++) cell = row[i], results.push(this._escape(cell));
				return results
			}.call(this).join(this.options.delimiter)
		}, this.columns = function(cols) {
			var c;
			if(null == cols) return this._columns;
			if(!Array.isArray(cols)) throw "CSV: Columns must an Array";
			return this._columns = function() {
				var i, len, results;
				for(results = [], i = 0, len = cols.length; len > i; i++) c = cols[i], results.push(this._escape(c));
				return results
			}.call(this), this._output = this._columns.join(this.options.delimiter)
		}, this.output = function() {
			return this._output
		}, this._escape = function(string) {
			return null == string ? "" : ("string" != typeof string && (string = (new neo.boltIntHelpers).stringify(string)), string.length ? ((string.indexOf(this.options.delimiter) > 0 || string.indexOf('"') >= 0) && (string = '"' + string.replace(/"/g, '""') + '"'), string) : '""')
		}
	}
	return serializer
}(), angular.module("neo4jApp.controllers").controller("DatabaseDrawerCtrl", ["$scope", "$rootScope", function($scope, $rootScope) {
	var load, seedList, setSeedList, setup;
	return seedList = {}, $scope.limitStep = 50, $scope.labels = null, $scope.relationships = null, $scope.propertyKeys = null, $scope.showMore = function(type) {
		return load(type, $scope[type].showing + $scope.limitStep)
	}, $scope.showAll = function(type) {
		return load(type, $scope[type].total)
	}, setSeedList = function(type, list) {
		return seedList[type] = [].concat(list).sort()
	}, setup = function(type) {
		return $scope.$watch(function() {
			return $rootScope[type]
		}, function() {
			var numToShow;
			return numToShow = $scope.limitStep, $scope[type] && $scope[type].showing >= $scope.limitStep && (numToShow = $scope[type].showing), setSeedList(type, $rootScope[type]), load(type, numToShow)
		}, !0)
	}, load = function(type, num) {
		var list, ref, ref1, showing, total;
		return null == num && (num = $scope.limitStep), list = null != (ref = seedList[type]) ? ref.slice(0, num) : void 0, showing = (null != list ? list.length : void 0) || 0, total = null != (ref1 = seedList[type]) ? ref1.length : void 0, $scope[type] = {
			list: list,
			showing: showing,
			total: total,
			nextStepSize: total - showing < $scope.limitStep ? total - showing : $scope.limitStep
		}
	}, setup("labels"), setup("relationships"), setup("propertyKeys")
}]), angular.module("neo4jApp.controllers").controller("ParameterCtrl", ["Parameters", "$scope", "Utils", function(Parameters, $scope, Utils) {
	var parseInput, setNotFoundError, setParamSet, setParsingError, setSuccessMessage;
	return $scope.setParam = {}, setParamSet = function(key, val) {
		var _obj;
		return $scope.setParam = (_obj = {}, _obj[key] = val, _obj)
	}, setSuccessMessage = function() {
		return $scope.frame.successMessage = "Parameter sucessfully set"
	}, setParsingError = function() {
		return $scope.frame.setCustomError("Could not interpret the input", null)
	}, setNotFoundError = function() {
		return $scope.frame.setCustomError("Could not find a defined parameter with that key", null)
	}, (parseInput = function(input) {
		var key, matches, value;
		return matches = Utils.extractCommandParameters("param", input), null == matches ? setParsingError() : (key = matches[0], value = matches[1], void 0 !== value && null !== value ? (value = function() {
			try {
				return eval("(" + value + ")")
			} catch(_error) {}
		}(), "undefined" != typeof value ? (Parameters[key] = value, setParamSet(key, Parameters[key]), setSuccessMessage()) : setParsingError()) : (setParamSet(key, Parameters[key]), "undefined" == typeof Parameters[key] ? setNotFoundError() : void 0))
	})($scope.frame.response)
}]);