/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/web/src/addons/livemap/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/util/fractions.ts":
/*!*******************************!*\
  !*** ./src/util/fractions.ts ***!
  \*******************************/
/*! exports provided: recLists, fractionList, fraction, fractionUtil */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recLists", function() { return recLists; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fractionList", function() { return fractionList; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fraction", function() { return fraction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fractionUtil", function() { return fractionUtil; });
const recLists = [
    // Выдача
    { name: "Рецепт на марихуану", param: "allow_marg", fractions: [16], rank: 5, give: true, cost: 1000 },
    { name: "Рецепт на антипохмелин", param: "allow_antipohmel", fractions: [16], rank: 5, give: true, cost: 1000 },
    { name: "Медицинская страховка", param: "med_lic", fractions: [16], rank: 5, give: true, cost: 15000 },
    { name: "Лицензия на адвоката", param: "law_lic", fractions: [1], rank: 7, give: true, cost: 15000 },
    { name: "Лицензия на бизнес", param: "biz_lic", fractions: [1], rank: 7, give: true, cost: 10000 },
    { name: "Лицензия на рыбалку", param: "fish_lic", fractions: [1], rank: 7, give: true, cost: 7000 },
    { name: "Лицензия на оружие", param: "gun_lic", fractions: [2, 7, 3], rank: 6, give: true, cost: 15000 },
    // Изъятие
    { name: "Медицинская страховка", param: "med_lic", fractions: [16], rank: 6, remove: true },
    { name: "Лицензия категории A", param: "a_lic", fractions: [2, 3, 7], rank: 6, remove: true },
    { name: "Лицензия категории B", param: "b_lic", fractions: [2, 3, 7], rank: 6, remove: true },
    { name: "Лицензия категории C", param: "c_lic", fractions: [2, 3, 7], rank: 6, remove: true },
    { name: "Лицензия воздушного ТС", param: "air_lic", fractions: [2, 3, 7], rank: 6, remove: true },
    { name: "Лицензия водного ТС", param: "ship_lic", fractions: [2, 3, 7], rank: 6, remove: true },
    { name: "Лицензия на оружие", param: "gun_lic", fractions: [2, 3, 7], rank: 6, remove: true },
    { name: "Лицензия на рыбалку", param: "fish_lic", fractions: [2, 3, 7], rank: 6, remove: true },
    { name: "Лицензия на адвоката", param: "biz_lic", fractions: [1], rank: 7, remove: true },
    { name: "Лицензия на бизнес", param: "biz_lic", fractions: [1], rank: 7, remove: true },
];
const fractionList = [
    { id: 1, name: "Government", desc: "Правительство", icon: "GOV", gos: true, mafia: false, gang: false, ranks: ["Практикант", "Ассистент", "Младший специалист", "Специалист", "Старший специалист", "Зам. начальника отдела", "Начальник отдела", "Департамент Мэра", "Прокурор", "Судья", "Ген.Прокурор", "Верховный судья", "Вице-Губернатор", "Губернатор"], moneybase: 0, moneymultipler: 1000 },
    {
        id: 2, name: "LSPD", desc: "Polis Departmanı", icon: "LSPD", gos: true, mafia: false, gang: false, ranks: [
            "Stajyer Memur",
            "Memur",
            "Kıdemli Memur",
            "Komiser Yardımcısı",
            "Komiser",
            "Başkomiser",
            "Amir",
            "Eğitmen",
            "Birim Şefi",
            "Emniyet Genel Müdür Yd.",
            "Emniyet Genel Müdürü"
        ], moneybase: 0, moneymultipler: 1100
    },
    {
        id: 3, name: "FIB", desc: "FIB", icon: "fib", gos: true, mafia: false, gang: false, ranks: [
            "Stajyer Ajan",
            "Ajan",
            "Denetimci Özel Ajan",
            "Sorumlu Özel Ajan",
            "Müdür Yardımcısı",
            "Genel Müdür",
            "Direktör Danışmanı",
            "Yardımcı Direktör",
            "Direktör"
        ], moneybase: 0, moneymultipler: 1200
    },
    {
        id: 4, name: "Army", desc: "Army", icon: "Army", gos: true, mafia: false, gang: false, ranks: [
            "Cezalı Personel",
            "Ulusal Muhafız Er",
            "Uzman Çavuş",
            "Astsubay Kıdemli Çavuş",
            "Astsubay Kıdemli Üstçavuş",
            "Astsubay Kıdemli Başçavuş",
            "Teğmen",
            "Üsteğmen",
            "Yüzbaşı",
            "Binbaşı",
            "Yarbay",
            "Albay",
            "Tuğgeneral",
            "Tümgeneral",
            "Korgeneral",
            "Orgeneral"
        ],
        moneybase: 0, moneymultipler: 1050
    },
    {
        id: 7, name: "Sheriffs Department", desc: "Шериф Департамент", icon: "Sheriff", gos: true, mafia: false, gang: false, ranks: [
            "Stajyer Memur",
            "Memur",
            "Kıdemli Memur",
            "Komiser Yardımcısı",
            "Komiser",
            "SWAT",
            "Başkomiser",
            "CSD Dedektif",
            "Amir",
            "Eğitmen",
            "Bir. Şefi",
            "CSD Baş Dedektif",
            "Sheriff Yardımcısı",
            "Sheriff"
        ], moneybase: 0, moneymultipler: 1100
    },
    { id: 8, name: "Russian Mafia", desc: "Русская Мафия", icon: "russia", gos: false, mafia: true, gang: false, ranks: ["Шпана", "Боец", "Браток", "Блатной", "Доверенный", "Бродяга", "Дипломат", "Смотрящий", "Положенец", "Авторитет"], moneybase: 0, moneymultipler: 0 },
    { id: 9, name: "LCN", desc: "Итальянская Мафия", icon: "lcn", gos: false, mafia: true, gang: false, ranks: ["Novizio", "Associate", "Combattente", "Soldato", "Regime", "Sotto Cappo", "Caporegime", "Giovane boss", "Consigliere", "Don"], moneybase: 0, moneymultipler: 0 },
    { id: 10, name: "Yakuza", desc: "Японская Мафия", icon: "japan", gos: false, mafia: true, gang: false, ranks: ["Taiko", "Satei", "Kumi-in", "Fuku-Hombute", "Bengoshi", "Kanbu", "Kyodai", "Kaikei", "Shingiin", "Saiko-Komon", "Kumicho"], moneybase: 0, moneymultipler: 0 },
    { id: 11, name: "Ukrainian Mafia", desc: "Украинская мафия", icon: "ukraine", gos: false, mafia: true, gang: false, ranks: ["Казак", "Приказный", "Урядник", "Вахмистр", "Подхорунжий", "Доверенный хлопец", "Хорунжий", "Есаул", "Атаман", "Гетман"], moneybase: 0, moneymultipler: 0 },
    { id: 16, name: "EMS", desc: "Отделение Больницы", icon: "EMS", gos: true, mafia: false, gang: false, ranks: ["Практикант ", "Интерн", "Ординатор ", "Младший специалист", "Старший специалист ", "Главный специалист", "Фельдшер", "Ассистент врача", "Врач", "Зам.Глава отдела", "Глава отдела", "Глава Департамента", "Зам. Директора", "Директор"], moneybase: 0, moneymultipler: 1000 },
    { id: 18, name: "Ballas", desc: "Ballas", icon: "Ballas", gos: false, mafia: false, gang: true, ranks: ["Blade", "Buster", "Сracker", "gunBrogh", "upBrogh", "Gangster", "Federal block", "Foulkes", "Rich Nig", "Big Gangster"], moneybase: 0, moneymultipler: 0, color: "#CD42FF" },
    { id: 19, name: "Families", desc: "Families", icon: "Families", gos: false, mafia: false, gang: true, ranks: ["Beginner", "Youngsta", "Killa", "Wang G", "Shooter", "Big Brother", "High", "The King", "Deputy Boss", "Mad Dog"], moneybase: 0, moneymultipler: 0, color: "#41AB5D" },
    { id: 20, name: "Marabunta Grande", desc: "Marabunta Grande", icon: "mara", gos: false, mafia: false, gang: true, ranks: ["Novato", "Experimentado", "Maton", "El asesino", "Viendo", "Trusted", "Cerrar", "Mano izquierda", "Mano derecha", "Capitulo"], moneybase: 0, moneymultipler: 0, color: "#49A2E6" },
    { id: 21, name: "Vagos", desc: "Vagos", icon: "Vagos", gos: false, mafia: false, gang: true, ranks: ["Novato", "Guardian", "Verificado", "Local", "Bandito", "Medio", "Assessino", "Sabio", "Mano Derechа", "El Padre"], moneybase: 0, moneymultipler: 0, color: "#FCCD4C" },
];
const fraction = {
    list: fractionList,
    /** Поиск конфигурации фракции по её ID */
    getFraction: (fractionid) => {
        return fractionList.find(item => item.id == fractionid);
    },
    /** Название фракции */
    getFractionName: (fractionid) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return null;
        return data.name;
    },
    /** Цвет фракции */
    getFractionColor: (fractionid) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return "#fc0317";
        return data.color || "#fc0317";
    },
    /** Иконка фракции */
    getFractionIcon: (fractionid) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return null;
        return data.icon;
    },
    /** Описание фракции */
    getFractionDesc: (fractionid) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return null;
        return data.desc;
    },
    /** Список рангов */
    getFractionRanks: (fractionid) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return [];
        return data.ranks;
    },
    /** Получить ранг лидера */
    getLeaderRank: (fractionid) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return null;
        return data.ranks.length;
    },
    /** Получить ранг зама лидера */
    getSubLeaderRank: (fractionid) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return null;
        return data.ranks.length - 1;
    },
    /** Является ли член фракции лидером */
    isLeader: (fractionid, rank) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return false;
        return data.ranks.length <= rank;
    },
    /** Является ли член фракции замом лидера */
    isSubLeader: (fractionid, rank) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return false;
        return (data.ranks.length - 1) <= rank;
    },
    /** Позволяет узнать, существует ли указанный ранг во фракции */
    isRankCorrect: (fractionid, rank) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return false;
        if (!data.ranks[rank - 1])
            return false;
        return true;
    },
    /** Позволяет узнать, существует ли указанный ранг во фракции */
    getRankName: (fractionid, rank) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return null;
        if (!data.ranks[rank - 1])
            return null;
        return data.ranks[rank - 1];
    },
    /** Подсчёт денег, которые заработает член фракции */
    getPayDayMoney: (fractionid, rank) => {
        let data = fraction.getFraction(fractionid);
        if (!data)
            return 0;
        return data.moneybase + data.moneymultipler * rank;
    }
};
const fractionUtil = fraction;


/***/ }),

/***/ "./src/util/vip.ts":
/*!*************************!*\
  !*** ./src/util/vip.ts ***!
  \*************************/
/*! exports provided: BASE_AFK_TIME, vipStatus */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BASE_AFK_TIME", function() { return BASE_AFK_TIME; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "vipStatus", function() { return vipStatus; });
const BASE_AFK_TIME = 10;
const vipStatus = {
    data: [
        {
            id: "Diamond",
            name: "VIP Diamond",
            cost: 1250,
            moneybonus: 2500,
            skillpersbonus: 5,
            skilljobbonus: 5,
            vipuninvite: true,
            changeslots: true,
            sitepay: true,
            givecoin: 1,
            expbonus: 2,
            healmultipler: true,
            afkminutes: 45
        },
        {
            id: "Gold",
            name: "VIP Gold",
            cost: 750,
            moneybonus: 1500,
            changeslots: true,
            sitepay: true,
            skillpersbonus: 10,
            skilljobbonus: 10,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 1,
            healmultipler: true,
            afkminutes: 35
        },
        {
            id: "Silver",
            name: "VIP Silver",
            cost: 500,
            moneybonus: 1000,
            changeslots: true,
            skillpersbonus: 20,
            skilljobbonus: 20,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: 25
        },
        {
            id: "Bronze",
            name: "VIP Bronze",
            cost: 250,
            moneybonus: 500,
            skillpersbonus: 20,
            skilljobbonus: 0,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: 15
        },
        {
            id: "MediaLight",
            media: true,
            name: "Media VIP Light",
            cost: 0,
            moneybonus: 750,
            skillpersbonus: 10,
            skilljobbonus: 10,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: BASE_AFK_TIME
        },
        {
            id: "MediaHard",
            media: true,
            name: "Media VIP Hard",
            cost: 0,
            moneybonus: 1500,
            skillpersbonus: 5,
            skilljobbonus: 5,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: BASE_AFK_TIME
        },
        {
            id: "Start",
            name: "VIP Start",
            cost: 0,
            moneybonus: 250,
            skillpersbonus: 10,
            skilljobbonus: 10,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 1,
            healmultipler: true,
            afkminutes: BASE_AFK_TIME
        },
        {
            id: "Bonus",
            name: "VIP Bonus",
            cost: 0,
            moneybonus: 2500,
            skillpersbonus: 5,
            skilljobbonus: 5,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 2,
            healmultipler: true,
            afkminutes: 45
        },
        //! Старые випки, которые нужно перевыдать
        {
            id: "Turbo",
            name: "VIP Turbo",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["Start", 10]
        },
        {
            id: "Light",
            name: "VIP Light",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["Silver", 60]
        },
        {
            id: "Hard",
            name: "VIP Hard",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["Gold", 90]
        },
        {
            id: "YouTube",
            name: "VIP YouTube",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["MediaLight", 999]
        }
    ],
    getVipStatusData: (id) => {
        return vipStatus.data.find(item => item.id == id);
    }
};


/***/ }),

/***/ "./src/web/src/addons/livemap/config.ts":
/*!**********************************************!*\
  !*** ./src/web/src/addons/livemap/config.ts ***!
  \**********************************************/
/*! exports provided: _MAP_tileURL, _MAP_iconURL, _MAP_currentUri, _MAP_currentMarker, _MAP_markerStore, setMarkerStore, pushMarkerStore, setCurrentMarker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_MAP_tileURL", function() { return _MAP_tileURL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_MAP_iconURL", function() { return _MAP_iconURL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_MAP_currentUri", function() { return _MAP_currentUri; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_MAP_currentMarker", function() { return _MAP_currentMarker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_MAP_markerStore", function() { return _MAP_markerStore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMarkerStore", function() { return setMarkerStore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pushMarkerStore", function() { return pushMarkerStore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCurrentMarker", function() { return setCurrentMarker; });
const _MAP_tileURL = "livemap/images/map/";
const _MAP_iconURL = "livemap/images/icons/";
const _MAP_currentUri = location.pathname + location.search;
var _MAP_currentMarker;
var _MAP_markerStore;
const setMarkerStore = (data) => {
    _MAP_markerStore = data;
};
const pushMarkerStore = (data) => {
    _MAP_markerStore.push(data);
};
const setCurrentMarker = (item) => {
    _MAP_currentMarker = item;
};


/***/ }),

/***/ "./src/web/src/addons/livemap/funcs/admin.ts":
/*!***************************************************!*\
  !*** ./src/web/src/addons/livemap/funcs/admin.ts ***!
  \***************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./init */ "./src/web/src/addons/livemap/funcs/init.ts");
/* harmony import */ var _markers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./markers */ "./src/web/src/addons/livemap/funcs/markers.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../config */ "./src/web/src/addons/livemap/config.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/web/src/addons/livemap/funcs/utils.ts");
/* harmony import */ var _util_vip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../../util/vip */ "./src/util/vip.ts");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./map */ "./src/web/src/addons/livemap/funcs/map.ts");
/* harmony import */ var _util_fractions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../../util/fractions */ "./src/util/fractions.ts");







var queryDict = {};
location.search.substr(1).split("&").forEach(function (item) { queryDict[item.split("=")[0]] = item.split("=")[1]; });
let players = new Map();
let playersData = new Map();
let playersPopup = new Map();
// @ts-ignore
window.playersPopup = playersPopup;
if (queryDict.adminshow) {
    $(document).ready(() => {
        setTimeout(() => {
            $("#playerListBlock").show(500);
            $("#playerListHeader").click(() => {
                $("#playerList").slideToggle(200);
            });
        }, 500);
    });
    setInterval(() => {
        fetch('/mobile/playersPosition?login=' + queryDict.login + "&token=" + queryDict.token).then(datas => {
            datas.json().then((datas) => {
                if (datas.err)
                    return console.error(datas.err);
                let currentids = [];
                datas.players.map(data => {
                    let popupContent = `
                    <div class="info-window" style="color:black;font-size: 15px;">
                        <div id=info-body>
                        Игрок: (${data.id}) ${data.name}<br />
                        Измерение/Отыгранное за сутки время: ${data.d} / ${data.playedTime} ч.<br />
                        Social Club: <a href="https://ru.socialclub.rockstargames.com/member/${data.social}/" target="_blank">${data.social} <img style="width:30px;height:30px;" src="https://a.rsg.sc//n/${data.social.toLowerCase()}" /></a><br />
                        IP Текущий / IP Регистрации: <a href="https://ru.infobyip.com/ip-${data.ip}.html" target="_blank">${data.ip}</a> / <a href="https://ru.infobyip.com/ip-${data.ip_reg}.html" target="_blank">${data.ip_reg}</a><br />
                        Наличка/Банк: $${data.money} / $${data.bank} (${data.bankcard})<br />
                        VIP: ${data.vip && _util_vip__WEBPACK_IMPORTED_MODULE_4__["vipStatus"].getVipStatusData(data.vip) ? _util_vip__WEBPACK_IMPORTED_MODULE_4__["vipStatus"].getVipStatusData(data.vip).name : data.vip}<br />
                        Фракция: ${_util_fractions__WEBPACK_IMPORTED_MODULE_6__["fractionUtil"].getFractionName(data.fraction)}<br />
                        Админ/Хелпер уровень: ${data.adminLvl} / ${data.helperLvl}<br />
                        HP/AP: ${data.hp.toFixed(2)}% / ${data.ap.toFixed(2)}%<br />
                        </div>
                    </div>`;
                    if (players.has(data.id)) {
                        var marker = _config__WEBPACK_IMPORTED_MODULE_2__["_MAP_markerStore"][players.get(data.id)];
                        marker.setPosition(Object(_utils__WEBPACK_IMPORTED_MODULE_3__["convertToMapGMAP"])(data.position.x, data.position.y));
                        // marker.setIcon({ url: `https://a.rsg.sc//n/${data.social.toLowerCase()}`, scaledSize:{width:22,height:22}});
                        // marker.icon.url = `https://a.rsg.sc//n/${data.social.toLowerCase()}`;
                        marker.popup.setContent(popupContent);
                        playersPopup.set(data.id, marker.popup);
                    }
                    else {
                        players.set(data.id, Object(_init__WEBPACK_IMPORTED_MODULE_0__["createBlip"])({
                            pos: data.position,
                            type: 6,
                            description: "Загрузка данных",
                            name: `${data.name} (${data.id})`
                        }).markerId);
                    }
                    playersData.set(data.id, data);
                    currentids.push(data.id);
                });
                playersData.forEach(obj => {
                    if (!currentids.includes(obj.id)) {
                        clearMarker(players.get(obj.id));
                        players.delete(obj.id);
                        playersData.delete(obj.id);
                        playersPopup.delete(obj.id);
                    }
                });
                $('#playerList').html('');
                playersData.forEach(item => {
                    let itemq = $(`<span style="cursor:pointer;">(${item.id}) ${item.name}</span><br/>`);
                    itemq.click(() => {
                        let marker = _config__WEBPACK_IMPORTED_MODULE_2__["_MAP_markerStore"][players.get(item.id)];
                        console.log(marker);
                        marker.popup.open(_map__WEBPACK_IMPORTED_MODULE_5__["map"], marker);
                        _map__WEBPACK_IMPORTED_MODULE_5__["map"].panTo(marker.getPosition());
                    });
                    $('#playerList').prepend(itemq);
                });
            });
        });
    }, 1000);
}
function getBlipIndex(blip) {
    if (_init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blip.type] == null) {
        return -1;
    }
    var blipArrayForType = _init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blip.type];
    for (var b in blipArrayForType) {
        var blp = blipArrayForType[b];
        if (blp.pos.x == blip.pos.x && blp.pos.y == blip.pos.y && blp.pos.z == blip.pos.z) {
            return parseInt(b);
        }
    }
    // Couldn't find it..
    return -1;
}
function getBlipIdByName(name) {
    let resid = -1;
    for (var type in _init__WEBPACK_IMPORTED_MODULE_0__["_blips"]) {
        var blipArrayForType = _init__WEBPACK_IMPORTED_MODULE_0__["_blips"][type];
        for (var b in blipArrayForType) {
            var blp = blipArrayForType[b];
            if (blp.name == name) {
                resid = blp.markerId;
            }
        }
    }
    return resid;
}
function getBlipMarkerId(blip) {
    if (_init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blip.type] == null) {
        return -1;
    }
    var blipArrayForType = _init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blip.type];
    for (var b in blipArrayForType) {
        var blp = blipArrayForType[b];
        if (blp.pos.x == blip.pos.x && blp.pos.y == blip.pos.y && blp.pos.z == blip.pos.z) {
            return blp.markerId;
        }
    }
    // Couldn't find it..
    return -1;
}
function doesBlipExist(blip) {
    if (_init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blip.type] == null) {
        return false;
    }
    var blipArrayForType = _init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blip.type];
    for (var b in blipArrayForType) {
        var blp = blipArrayForType[b];
        if (blp.pos.x == blip.pos.x && blp.pos.y == blip.pos.y && blp.pos.z == blip.pos.z) {
            return true;
        }
    }
    return false;
}
function addBlip(blipObj) {
    if (doesBlipExist(blipObj)) {
        return; // Meh, it already exists.. Just don't add it
    }
    if (!blipObj.hasOwnProperty("description")) { // Doesn't have a description
        blipObj.description = "";
    }
    Object(_init__WEBPACK_IMPORTED_MODULE_0__["createBlip"])(blipObj);
}
function clearMarker(id) {
    if (_config__WEBPACK_IMPORTED_MODULE_2__["_MAP_markerStore"][id]) {
        _config__WEBPACK_IMPORTED_MODULE_2__["_MAP_markerStore"][id].setMap(null);
        _config__WEBPACK_IMPORTED_MODULE_2__["_MAP_markerStore"][id] = null;
        $("#marker_" + id).remove();
    }
}
function removeBlip(blipObj) {
    if (doesBlipExist(blipObj)) {
        // Remove it
        var markerId = getBlipMarkerId(blipObj);
        var index = getBlipIndex(blipObj);
        clearMarker(markerId);
        _init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blipObj.type].splice(index, 1);
        if (_init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blipObj.type].length == 0) {
            delete _init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blipObj.type];
        }
        Object(_init__WEBPACK_IMPORTED_MODULE_0__["blipCountMinus"])();
        $("#blip_count").text(_init__WEBPACK_IMPORTED_MODULE_0__["_blipCount"]);
    }
}
function updateBlip(blipObj) {
    if (doesBlipExist(blipObj)) {
        // Can update it
        var markerId = getBlipMarkerId(blipObj);
        var blipIndex = getBlipIndex(blipObj);
        var marker = _config__WEBPACK_IMPORTED_MODULE_2__["_MAP_markerStore"][markerId];
        if (blipObj.hasOwnProperty("new_pos")) {
            // Blips are supposed to be static so, why this would even be fucking needed it beyond me
            // Still, better to prepare for the inevitability that someone wants this fucking feature
            marker.setPosition(Object(_utils__WEBPACK_IMPORTED_MODULE_3__["convertToMapGMAP"])(blipObj.new_pos.x, blipObj.new_pos.y));
            blipObj.pos = blipObj.new_pos;
            delete blipObj.new_pos;
        }
        var name = "No name blip..";
        var html = "";
        if (blipObj.hasOwnProperty("name")) {
            name = blipObj.name;
        }
        else {
            // No name given, might as well use the default one... If it exists...
            if (_markers__WEBPACK_IMPORTED_MODULE_1__["MarkerTypes"][blipObj.type] != undefined && _markers__WEBPACK_IMPORTED_MODULE_1__["MarkerTypes"][blipObj.type].name != undefined) {
                name = _markers__WEBPACK_IMPORTED_MODULE_1__["MarkerTypes"][blipObj.type].name;
            }
        }
        for (var key in blipObj) {
            if (key == "name" || key == "type") {
                continue; // Name is already shown
            }
            if (key == "pos") {
                html += '<div class="row info-body-row"><strong>Position:</strong>&nbsp;X {' + blipObj.pos.x.toFixed(2) + "} Y {" + blipObj.pos.y.toFixed(2) + "} Z {" + blipObj.pos.z.toFixed(2) + "}</div>";
            }
            else {
                // Make sure the first letter of the key is capitalised
                // @ts-ignore
                key[0] = key[0].toUpperCase();
                // @ts-ignore
                html += '<div class="row info-body-row"><strong>' + key + ":</strong>&nbsp;" + blipObj[key] + "</div>";
            }
        }
        var info = '<div class="info-window"><div class="info-header-box"><div class="info-header">' + name + '</div></div><div class="clear"></div><div id=info-body>' + html + "</div></div>";
        marker.popup.setContent(info);
        _init__WEBPACK_IMPORTED_MODULE_0__["_blips"][blipObj.type][blipIndex] = blipObj;
    }
}


/***/ }),

/***/ "./src/web/src/addons/livemap/funcs/controls.ts":
/*!******************************************************!*\
  !*** ./src/web/src/addons/livemap/funcs/controls.ts ***!
  \******************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./init */ "./src/web/src/addons/livemap/funcs/init.ts");

Object(_init__WEBPACK_IMPORTED_MODULE_0__["globalInit"])();
window.onload = function () {
    // test()
};
function test() {
    // console.clear();
    console.log("INIT TEST");
    Object(_init__WEBPACK_IMPORTED_MODULE_0__["drawWarZone"])({
        pos: {
            x: 0,
            y: 0,
            z: 0,
            d: 100
        },
        desc: "asgasgs",
        name: "asgasg", attack: true,
        color: {
            r: 255, g: 0, b: 0
        }
    });
}


/***/ }),

/***/ "./src/web/src/addons/livemap/funcs/init.ts":
/*!**************************************************!*\
  !*** ./src/web/src/addons/livemap/funcs/init.ts ***!
  \**************************************************/
/*! exports provided: _blips, _blipCount, blipCountPlus, blipCountMinus, _disabledBlips, globalInit, createBlip, drawWarZone */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_blips", function() { return _blips; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_blipCount", function() { return _blipCount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blipCountPlus", function() { return blipCountPlus; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blipCountMinus", function() { return blipCountMinus; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_disabledBlips", function() { return _disabledBlips; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalInit", function() { return globalInit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBlip", function() { return createBlip; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "drawWarZone", function() { return drawWarZone; });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map */ "./src/web/src/addons/livemap/funcs/map.ts");
/* harmony import */ var _objects__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objects */ "./src/web/src/addons/livemap/funcs/objects.ts");
/* harmony import */ var _markers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./markers */ "./src/web/src/addons/livemap/funcs/markers.ts");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../config */ "./src/web/src/addons/livemap/config.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils */ "./src/web/src/addons/livemap/funcs/utils.ts");
/* harmony import */ var _util_fractions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../../util/fractions */ "./src/util/fractions.ts");






var _invervalId;
var _isLive = false;
var _blips = {};
var _blipCount = 0;
const blipCountPlus = () => {
    _blipCount++;
};
const blipCountMinus = () => {
    _blipCount--;
};
var _showBlips = true;
var _isConnected = false;
var _trackPlayer = null;
var playerCount = 0;
var _overlays = [];
var _disabledBlips = [];
function globalInit() {
    Object(_map__WEBPACK_IMPORTED_MODULE_0__["mapInit"])("map-canvas");
    initPage();
    // initBlips();
    for (var i = 0; i < _overlays.length; i++) {
        var o = _overlays[i];
        $("#overlaySelect").append(`<option value="${i}">${o.name}</option>`);
    }
    fetch('http://' + location.hostname + ':3400/warzones').then(datas => {
        datas.json().then((dataq) => {
            console.log(dataq);
            dataq.map(data => {
                drawWarZone({
                    pos: data.position,
                    name: data.name,
                    desc: data.ownername,
                    attack: data.attack,
                    color: data.color
                });
            });
        });
    });
    fetch('http://' + location.hostname + ':3400/resps').then(datas => {
        datas.json().then((dataq) => {
            console.log(dataq);
            dataq.map(data => {
                createBlip({
                    pos: { x: data.x, y: data.y, z: data.z },
                    name: _util_fractions__WEBPACK_IMPORTED_MODULE_5__["fractionUtil"].getFractionName(data.fractionid),
                    type: 84,
                    description: ""
                });
            });
        });
    });
}
// window.createBlip = createBlip;
function initPage() {
    $(window).on("load resize", function () {
        $(".map-tab-content").height((($("#tab-content").height() - $(".page-title-1").height()) - ($("#map-overlay-global-controls").height() * 4.2)));
    });
    var $myGroup = $('#control-wrapper');
    $myGroup.on('show.bs.collapse', '.collapse', function () {
        console.log("hidding?");
        // @ts-ignore
        $myGroup.find('.collapse.show').collapse('hide');
    });
}
function createBlip(blip) {
    let obj = new _objects__WEBPACK_IMPORTED_MODULE_1__["MarkerObject"](blip.name, new _objects__WEBPACK_IMPORTED_MODULE_1__["Coordinates"](blip.pos.x, blip.pos.y, blip.pos.z), _markers__WEBPACK_IMPORTED_MODULE_2__["MarkerTypes"][blip.type], blip.description, "");
    if (_blips[blip.type] == null) {
        _blips[blip.type] = [];
    }
    // @ts-ignore
    blip.markerId = Object(_map__WEBPACK_IMPORTED_MODULE_0__["createMarker"])(false, false, obj) - 1;
    _blips[blip.type].push(blip);
    _blipCount++;
    return blip;
}
function hexToRgbA(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        // @ts-ignore
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
    }
    throw new Error('Bad Hex');
}
function drawWarZone(item) {
    // console.log(convertToMap(item.pos.x, item.pos.y));
    let north = Object(_utils__WEBPACK_IMPORTED_MODULE_4__["convertToMapGMAP"])(item.pos.x - (item.pos.d / 2), item.pos.y + (item.pos.d / 2));
    let south = Object(_utils__WEBPACK_IMPORTED_MODULE_4__["convertToMapGMAP"])(item.pos.x + (item.pos.d / 2), item.pos.y + (item.pos.d / 2));
    let east = Object(_utils__WEBPACK_IMPORTED_MODULE_4__["convertToMapGMAP"])(item.pos.x - (item.pos.d / 2), item.pos.y - (item.pos.d / 2));
    let west = Object(_utils__WEBPACK_IMPORTED_MODULE_4__["convertToMapGMAP"])(item.pos.x + (item.pos.d / 2), item.pos.y - (item.pos.d / 2));
    let html = '';
    if (item.desc) {
        html += '<div class="row info-body-row">' + item.desc + "</div>";
    }
    let infoContent = '<div class="info-window"><div class="info-header-box"><div class="info-header">' + item.name + '</div></div><div class="clear"></div><div id=info-body>' + html + "</div></div>";
    let infoBox = new google.maps.InfoWindow({
        content: infoContent
    });
    const baseColor = hexToRgbA(item.color);
    let marker = new google.maps.Polygon({
        strokeColor: '#FFFFF',
        strokeOpacity: 0.8,
        strokeWeight: 0.0,
        fillColor: 'rgba(' + baseColor + ',1)',
        fillOpacity: 0.5,
        map: _map__WEBPACK_IMPORTED_MODULE_0__["map"],
        draggable: !!item.drag,
        paths: [
            north,
            south,
            west,
            east,
        ],
        // @ts-ignore
        popup: infoBox,
    });
    if (item.attack) {
        setInterval(() => {
            marker.setOptions({ fillColor: marker.get("fillColor") == 'rgba(' + baseColor + ',0.5)' ? 'rgba(' + baseColor + ',1)' : 'rgba(' + baseColor + ',0.5)' });
        }, 1000);
    }
    // createBlip({type:84,pos:item.pos,name:"Территория",description:"Контроллирует: Хуй"})
    let infowindow = new google.maps.InfoWindow({
        content: ``
    });
    Object(_config__WEBPACK_IMPORTED_MODULE_3__["pushMarkerStore"])(marker);
    google.maps.event.addListener(marker, 'click', function (event) {
        if (_config__WEBPACK_IMPORTED_MODULE_3__["_MAP_currentMarker"]) {
            _config__WEBPACK_IMPORTED_MODULE_3__["_MAP_currentMarker"].popup.close();
        }
        infowindow.setContent(`<div class="info-window" style="color:black;font-size: 20px;">
        <div id=info-body>
            <b>Название</b>: ${item.name}<br/>
            <b>Контроллирует</b>: ${item.desc}<br/>
        </div>
        </div>`);
        infowindow.setPosition(event.latLng);
        infowindow.open(_map__WEBPACK_IMPORTED_MODULE_0__["map"], marker);
        // @ts-ignore
        Object(_config__WEBPACK_IMPORTED_MODULE_3__["setCurrentMarker"])({ popup: infowindow });
    });
    return marker;
}
let list = [];
function drawWarZoneTest(id, x, y, z, d) {
    if (list.find(item => item.id == id))
        return console.error('Данный ID уже есть');
    let marker = drawWarZone({ pos: { x, y, z, d }, desc: "Точка " + id, name: "Точка " + id, color: "#fc0317", drag: true });
    list.push({ id, x, y, d });
    google.maps.event.addListener(marker, 'drag', function (event) {
        // console.log(event);
        // console.log(marker.dg.bounds);
        let crd = Object(_utils__WEBPACK_IMPORTED_MODULE_4__["convertToGameCoord"])(marker.dg.bounds.Ka, marker.dg.bounds.Ia);
        crd.x += (d / 2);
        crd.y += (d / 2);
        // console.log(crd);
        // console.log('++++++++++++++++++++++++++++++++++++++++')
        // console.log(convertToGameCoord(event.latLng.lat(), event.latLng.lng()))
        let q = list.find(item => item.id == id);
        q.x = crd.x;
        q.y = crd.y;
        marker.setOptions({ fillColor: 'rgba(0, 0, 0 ,1)' });
    });
}
function saveTestData() {
    console.log(JSON.stringify(list));
}
function loadTestData(data) {
    let q = typeof data == "string" ? JSON.parse(data) : data;
    q.map((item) => {
        drawWarZoneTest(item.id, item.x, item.y, item.z, item.d);
    });
}
window.drawWarZoneTest = drawWarZoneTest;
window.saveTestData = saveTestData;
window.loadTestData = loadTestData;


/***/ }),

/***/ "./src/web/src/addons/livemap/funcs/map.ts":
/*!*************************************************!*\
  !*** ./src/web/src/addons/livemap/funcs/map.ts ***!
  \*************************************************/
/*! exports provided: map, mapInit, createMarker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map", function() { return map; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapInit", function() { return mapInit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createMarker", function() { return createMarker; });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./src/web/src/addons/livemap/config.ts");
/* harmony import */ var _objects__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objects */ "./src/web/src/addons/livemap/funcs/objects.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./src/web/src/addons/livemap/funcs/utils.ts");



let map;
var bounds = {
    3: 2,
    4: 5,
    5: 10,
    6: 21,
    7: 42
};
function getNormalizedCoord(coord, zoom) {
    var y = coord.y;
    var x = coord.x;
    // tile range in one direction range is dependent on zoom level
    // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    var tileRange = 1 << zoom;
    // don't repeat across y-axis (vertically)
    if (y < 0 || y >= tileRange) {
        return null;
    }
    // repeat across x-axis
    if (x < 0 || x >= tileRange) {
        x = (x % tileRange + tileRange) % tileRange;
    }
    return {
        x: x,
        y: y
    };
}
// Start atlas
var mapAtlasOptions = {
    getTileUrl: function (coord, zoom) {
        var normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord || normalizedCoord.x > bounds[zoom] || normalizedCoord.y > bounds[zoom]) {
            return null;
        }
        return _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_tileURL"] + 'atlas/' + zoom + '_' + normalizedCoord.x + '_' + normalizedCoord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 7,
    name: "Atlas",
    alt: "GTA V Atlas Map"
};
var mapAtlas = new google.maps.ImageMapType(mapAtlasOptions);
mapAtlas.projection = new _objects__WEBPACK_IMPORTED_MODULE_1__["EuclideanProjection"]();
//End atlas
//Start satellite
var mapSatelliteOptions = {
    getTileUrl: function (coord, zoom) {
        var normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord || normalizedCoord.x > bounds[zoom] || normalizedCoord.y > bounds[zoom]) {
            return null;
        }
        return _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_tileURL"] + 'satellite/' + zoom + '_' + normalizedCoord.x + '_' + normalizedCoord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 7,
    name: "Satellite",
    alt: "GTA V Satellite Map"
};
var mapSatellite = new google.maps.ImageMapType(mapSatelliteOptions);
mapSatellite.projection = new _objects__WEBPACK_IMPORTED_MODULE_1__["EuclideanProjection"]();
//end satellite
//start road
var mapRoadOptions = {
    getTileUrl: function (coord, zoom) {
        var normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord || normalizedCoord.x > bounds[zoom] || normalizedCoord.y > bounds[zoom]) {
            return null;
        }
        return _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_tileURL"] + 'road/' + zoom + '_' + normalizedCoord.x + '_' + normalizedCoord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 7,
    //minZoom: 5,
    name: "Road",
    alt: "GTA V Road Map"
};
var mapRoad = new google.maps.ImageMapType(mapRoadOptions);
mapRoad.projection = new _objects__WEBPACK_IMPORTED_MODULE_1__["EuclideanProjection"]();
//end road
//start UV
var mapUVInvOptions = {
    getTileUrl: function (coord, zoom) {
        var normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord || normalizedCoord.x > bounds[zoom] || normalizedCoord.y > bounds[zoom]) {
            return null;
        }
        return _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_tileURL"] + 'uv-invert/' + zoom + '_' + normalizedCoord.x + '_' + normalizedCoord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 7,
    name: "UV Invert",
    alt: "GTA V UV Invert Map"
};
var mapUVInv = new google.maps.ImageMapType(mapUVInvOptions);
mapUVInv.projection = new _objects__WEBPACK_IMPORTED_MODULE_1__["EuclideanProjection"]();
//end uv
// Postcode map
var mapPostcodeOptions = {
    getTileUrl: function (coord, zoom) {
        var normalizedCoord = getNormalizedCoord(coord, zoom);
        if (!normalizedCoord || normalizedCoord.x > bounds[zoom] || normalizedCoord.y > bounds[zoom]) {
            return null;
        }
        return _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_tileURL"] + 'postcode/' + zoom + '_' + normalizedCoord.x + '_' + normalizedCoord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 7,
    name: "Postcode",
    alt: "GTA V Postcode Map"
};
var mapPostcode = new google.maps.ImageMapType(mapPostcodeOptions);
mapPostcode.projection = new _objects__WEBPACK_IMPORTED_MODULE_1__["EuclideanProjection"]();
//end postcode
function mapInit(elementID) {
    Object(_config__WEBPACK_IMPORTED_MODULE_0__["setMarkerStore"])([]);
    var centerCoords = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["convertToMapGMAP"])(315.7072466019408, 1701.7513644599276);
    var mapID = [];
    mapID.push("Atlas");
    map = new google.maps.Map(document.getElementById(elementID), {
        backgroundColor: "inherit",
        minZoom: 4,
        maxZoom: 7,
        // isPng: true,
        mapTypeControl: true,
        streetViewControl: false,
        center: centerCoords,
        zoom: 4,
        scrollwheel: true,
        zoomControl: true,
        mapTypeControlOptions: {
            mapTypeIds: []
        }
    });
    map.mapTypes.set("Atlas", mapAtlas);
    //TODO: Maybe make this an option or something?
    //_overlays.push(streetOverlayImages);
    //TODO: If a postcode overlay get made or something, add it here too..
    map.setMapTypeId("Atlas");
    google.maps.event.addListener(map, "maptypeid_changed", function () {
        var type = map.getMapTypeId();
        switch (type) {
            case "Atlas":
            case "Postcode":
                $("#" + elementID).css({
                    "background-color": "#0fa8d2"
                });
                break;
            case "Satellite":
                $("#" + elementID).css({
                    "background-color": "#143d6b"
                });
                break;
            case "Road":
                $("#" + elementID).css({
                    "background-color": "#1862ad"
                });
                break;
            case "UV Invert":
                $("#" + elementID).css({
                    "background-color": "#f2f0b6"
                });
                break;
        }
    });
}
function createMarker(animated, draggable, objectRef) {
    var name = objectRef.reference;
    if (name == "@DEBUG@@Locator") {
        name = "@Locator";
    }
    objectRef.position = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["stringCoordToFloat"])(objectRef.position);
    var coord = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["convertToMapGMAP"])(objectRef.position.x, objectRef.position.y);
    var locationType = objectRef.type;
    //console.log(JSON.stringify(locationType));
    var html = '';
    if (objectRef.description) {
        html += '<div class="row info-body-row">' + objectRef.description + "</div>";
    }
    var infoContent = '<div class="info-window"><div class="info-header-box"><div class="info-header">' + name + '</div></div><div class="clear"></div><div id=info-body>' + html + "</div></div>";
    var infoBox = new google.maps.InfoWindow({
        content: infoContent
    });
    var image = {
        // @ts-ignore
        url: _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_iconURL"] + locationType.icon,
        size: locationType.size,
        origin: locationType.origin,
        scaledSize: locationType.scaledSize == undefined ? locationType.size : locationType.scaledSize,
        anchor: locationType.anchor
    };
    //console.log("image: " + JSON.stringify(image));
    var marker = new google.maps.Marker({
        // @ts-ignore
        id: _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_markerStore"].length,
        // @ts-ignore
        type: locationType.name,
        position: coord,
        icon: image,
        map: map,
        popup: infoBox,
        object: objectRef,
        draggable: draggable ? true : false,
        animation: animated ? google.maps.Animation.DROP : 0
    });
    google.maps.event.addListener(marker, "click", function () {
        if (_config__WEBPACK_IMPORTED_MODULE_0__["_MAP_currentMarker"]) {
            _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_currentMarker"].popup.close();
        }
        Object(_config__WEBPACK_IMPORTED_MODULE_0__["setCurrentMarker"])(marker);
        marker.popup.open(map, this);
    });
    google.maps.event.addListener(marker, "drag", function () {
        var posConverted = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["convertToGame"])(marker.position.lat(), marker.position.lng());
        objectRef.position.x = posConverted.x;
        objectRef.position.y = posConverted.y;
        if (objectRef.reference == "@DEBUG@@Locator") {
            $("#locator_x").val(posConverted.x);
            $("#locator_y").val(posConverted.y);
        }
    });
    if (name == "@DEBUG@@Locator") {
        $("#marker-list").append('<div id="marker_' + marker.id + '" data-id="' + marker.id + '" class="marker-item"><div class="marker-desc"><span class="marker_name">@Locator</span></div><div class="marker-options"><a href="#" class="marker_view" title="View"><img src="images/icons/view.png" alt="View" height="16" width="16" /></a> </div></div><div class="clear"></div>');
    }
    else {
        $("#marker-list").append('<div id="marker_' + marker.id + '" data-id="' + marker.id + '" class="marker-item"><div class="marker-desc"><span class="marker_name">' + name + '</span></div><div class="marker-options"><a href="#" class="marker_view" title="View"><img src="images/icons/view.png" alt="View" height="16" width="16" /></a> / <a href="#" class="marker_delete" title="Delete"><img src="images/icons/delete.png" alt="Delete" height="16" width="16" /></a></div></div><div class="clear"></div>');
    }
    Object(_config__WEBPACK_IMPORTED_MODULE_0__["pushMarkerStore"])(marker);
    return _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_markerStore"].length;
}
function setMapCenter(lat, lng) {
    map.setCenter(new google.maps.LatLng(lat, lng));
    map.setZoom(6);
}
function setMapCenterGMAP(coord) {
    map.setCenter(coord);
    map.setZoom(6);
}
function clearMarker(id) {
    if (_config__WEBPACK_IMPORTED_MODULE_0__["_MAP_markerStore"][id]) {
        _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_markerStore"][id].setMap(null);
        _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_markerStore"][id] = null;
        $("#marker_" + id).remove();
    }
}
function getMarker(id) {
    if (_config__WEBPACK_IMPORTED_MODULE_0__["_MAP_markerStore"][id]) {
        return _config__WEBPACK_IMPORTED_MODULE_0__["_MAP_markerStore"][id];
    }
}
;


/***/ }),

/***/ "./src/web/src/addons/livemap/funcs/markers.ts":
/*!*****************************************************!*\
  !*** ./src/web/src/addons/livemap/funcs/markers.ts ***!
  \*****************************************************/
/*! exports provided: MarkerTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MarkerTypes", function() { return MarkerTypes; });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./src/web/src/addons/livemap/config.ts");
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./init */ "./src/web/src/addons/livemap/funcs/init.ts");


// divide by 2 since we want to make icons 32x32 images
var customImageWidth = 64 / 2; // 64 =  sheetWidth / 16
var customImageHeight = 64 / 2; // 64 = sheetHeight / 16
var MarkerTypes = {
    0: {
        icon: "blank.png",
        size: new google.maps.Size(0, 0),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 0)
    },
    999: {
        icon: "debug.png",
        size: new google.maps.Size(23, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11.5, 32)
    },
    // Apparently players have an icon of "6" so, might as well make normal that
    6: {
        icon: "normal.png",
        size: new google.maps.Size(22, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 32)
    }
    // Custom markers are generated and added below
};
// FUCK ME, GTA HAS A LOT OF FUCKING BLIPS
var types = {
    Standard: { id: 1, x: 0, y: 0 },
    Jet: { id: 16 },
    Lift: { id: 36 },
    RaceFinish: { id: 38 },
    Safehouse: { id: 40 },
    PoliceHelicopter: { id: 43 },
    ChatBubble: { id: 47 },
    Garage2: { id: 50 },
    Drugs: {},
    Store: {},
    PoliceCar: { id: 56 },
    PoliceStation: { id: 60, x: 12, y: 0 },
    Hospital: {},
    Helicopter: { id: 64 },
    StrangersAndFreaks: {},
    ArmoredTruck: { x: 0, y: 1 },
    TowTruck: { id: 68 },
    Barber: { id: 71 },
    LosSantosCustoms: {},
    Clothes: {},
    TattooParlor: { id: 75 },
    Simeon: {},
    Lester: {},
    Michael: {},
    Trevor: {},
    Rampage: { id: 84, x: 11 },
    VinewoodTours: {},
    Lamar: {},
    Franklin: { id: 88 },
    Chinese: {},
    Airport: { x: 0, y: 2 },
    Bar: { id: 93 },
    BaseJump: {},
    CarWash: { id: 100, x: 4 },
    ComedyClub: { id: 102 },
    Dart: {},
    Fib: { id: 106, x: 9 },
    Bank: { id: 108, x: 11 },
    Golf: {},
    AmmuNation: {},
    Exile: { id: 112 },
    ShootingRange: { id: 119, x: 1, y: 3 },
    Solomon: {},
    StripClub: {},
    Tennis: {},
    Triathlon: { id: 126, x: 7 },
    OffRoadRaceFinish: {},
    Key: { id: 134, x: 10 },
    MovieTheater: {},
    Music: {},
    Marijuana: { id: 140, x: 14 },
    Hunting: {},
    ArmsTraffickingGround: { id: 147, y: 4, x: 0 },
    Nigel: { id: 149 },
    AssaultRifle: {},
    Bat: {},
    Grenade: {},
    Health: {},
    Knife: {},
    Molotov: {},
    Pistol: {},
    Rpg: {},
    Shotgun: {},
    Smg: {},
    Sniper: {},
    PointOfInterest: { id: 162 },
    GtaOPassive: {},
    GtaOUsingMenu: {},
    Minigun: { id: 173, x: 0, y: 5 },
    GrenadeLauncher: {},
    Armor: {},
    Castle: {},
    Camera: { id: 184, x: 7 },
    Handcuffs: { id: 188, x: 11 },
    Yoga: { id: 197 },
    Cab: {},
    Shrink: { id: 205 },
    Epsilon: {},
    PersonalVehicleCar: { id: 225, x: 5, y: 6 },
    PersonalVehicleBike: {},
    Custody: { id: 237, x: 10 },
    ArmsTraffickingAir: { id: 251 },
    Fairground: { id: 266, x: 15 },
    PropertyManagement: { x: 0, y: 7 },
    Altruist: { id: 269 },
    Chop: { id: 273, x: 3 },
    Hooker: { id: 279, x: 7 },
    Friend: {},
    GtaOMission: { id: 304, x: 14 },
    GtaOSurvival: {},
    CrateDrop: { x: 0, y: 8 },
    PlaneDrop: {},
    Sub: {},
    Race: {},
    Deathmatch: {},
    ArmWrestling: {},
    AmmuNationShootingRange: { id: 313 },
    RaceAir: {},
    RaceCar: {},
    RaceSea: {},
    GarbageTruck: { id: 318, x: 11 },
    SafehouseForSale: { id: 350, x: 14 },
    Package: {},
    MartinMadrazo: { x: 0, y: 9 },
    Boost: { id: 354 },
    Devin: {},
    Marina: {},
    Garage: {},
    GolfFlag: {},
    Hangar: {},
    Helipad: {},
    JerryCan: {},
    Masks: {},
    HeistSetup: {},
    PickupSpawn: { id: 365 },
    BoilerSuit: {},
    Completed: {},
    Rockets: {},
    GarageForSale: {},
    HelipadForSale: { x: 0, y: 10 },
    MarinaForSale: {},
    HangarForSale: {},
    Business: { id: 374 },
    BusinessForSale: {},
    RaceBike: {},
    Parachute: {},
    TeamDeathmatch: {},
    RaceFoot: {},
    VehicleDeathmatch: {},
    Barry: {},
    Dom: {},
    MaryAnn: {},
    Cletus: {},
    Josh: {},
    Minute: {},
    Omega: { x: 0, y: 11 },
    Tonya: {},
    Paparazzo: {},
    Abigail: { id: 400 },
    Blimp: {},
    Repair: {},
    Testosterone: {},
    Dinghy: {},
    Fanatic: {},
    CaptureBriefcase: { id: 408 },
    LastTeamStanding: {},
    Boat: {},
    CaptureHouse: {},
    JerryCan2: { id: 415, x: 14 },
    CaptureAmericanFlag: { id: 419 },
    CaptureFlag: { x: 0, y: 12 },
    Tank: {},
    GunCar: { id: 426, x: 3 },
    Speedboat: {},
    Heist: {},
    Stopwatch: { id: 430 },
    DollarSignCircled: {},
    Crosshair2: {},
    DollarSignSquared: { id: 434 }
};
var nameToId = {};
var blipCss = `.blip {
    background: url("${_config__WEBPACK_IMPORTED_MODULE_0__["_MAP_iconURL"]}blips_texturesheet.png");
    background-size: ${1024 / 2}px ${1024 / 2}px;
    display: inline-block;
    width: ${customImageWidth}px;
    height: ${customImageHeight}px;
}`;
function generateBlipControls() {
    for (var blipName in types) {
        $("#blip-control-container").append(`<a data-blip-number="${nameToId[blipName]}" id="blip_${blipName}_link" class="blip-button-a list-group-item d-inline-block collapsed blip-enabled" href="#"><span class="blip blip-${blipName}"></span></a>`);
    }
    // Events
    $(".blip-button-a").on("click", function (e) {
        var ele = $(e.currentTarget);
        var blipId = ele.data("blipNumber").toString();
        // Toggle blip
        if (_init__WEBPACK_IMPORTED_MODULE_1__["_disabledBlips"].includes(blipId)) {
            // Already disabled, enable it
            _init__WEBPACK_IMPORTED_MODULE_1__["_disabledBlips"].splice(_init__WEBPACK_IMPORTED_MODULE_1__["_disabledBlips"].indexOf(blipId), 1);
            ele.removeClass("blip-disabled").addClass("blip-enabled");
        }
        else {
            // Enabled, disable it
            _init__WEBPACK_IMPORTED_MODULE_1__["_disabledBlips"].push(blipId);
            ele.removeClass("blip-enabled").addClass("blip-disabled");
        }
    });
}
function generateBlipShit() {
    var currentX = 0, currentY = 0, currentId = 0;
    var previousLeft = 0, previousTop = 0;
    var linePadding = 0;
    for (var blipName in types) {
        var blip = types[blipName];
        if (typeof (blip.id) != 'undefined') {
            currentId = blip.id;
        }
        else {
            currentId++;
        }
        if (typeof (blip.x) != 'undefined') {
            currentX = blip.x;
        }
        else {
            currentX++;
        }
        if (typeof (blip.y) != 'undefined') {
            currentY = blip.y;
        }
        MarkerTypes[currentId] = {
            name: blipName.replace(/([A-Z0-9])/g, ' $1').trim(),
            icon: "blips_texturesheet.png",
            size: new google.maps.Size(customImageWidth, customImageHeight),
            anchor: new google.maps.Point(customImageWidth / 2, customImageHeight),
            scaledSize: new google.maps.Size(1024 / 2, 1024 / 2),
            origin: new google.maps.Point(customImageWidth * currentX, customImageHeight * currentY),
        };
        nameToId[blipName] = currentId;
        // CSS GENERATOR FOR BLIP ICONS IN HTML
        // Just add the class "blip blip-<NAME>" to the element for blip icons
        // e.g. <span class="blip blip-Standard"> for a Standard blip
        var left = (currentX * customImageWidth) + linePadding; // 0 = padding between images
        var top = (currentY * customImageHeight) + linePadding; // 0 = padding
        // For styling spans and shit
        blipCss += `.blip-${blipName} { background-position: -${left}px -${top}px }
`;
    }
    $("head").append(`<style>${blipCss}</style>`);
    setTimeout(generateBlipControls, 50);
}
setTimeout(generateBlipShit, 50);


/***/ }),

/***/ "./src/web/src/addons/livemap/funcs/objects.ts":
/*!*****************************************************!*\
  !*** ./src/web/src/addons/livemap/funcs/objects.ts ***!
  \*****************************************************/
/*! exports provided: EuclideanProjection, Coordinates, MarkerObject */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EuclideanProjection", function() { return EuclideanProjection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Coordinates", function() { return Coordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MarkerObject", function() { return MarkerObject; });
class EuclideanProjection {
    constructor() {
        var EUCLIDEAN_RANGE = 256;
        this.pixelOrigin_ = new google.maps.Point(EUCLIDEAN_RANGE / 2, EUCLIDEAN_RANGE / 2);
        this.pixelsPerLonDegree_ = EUCLIDEAN_RANGE / 360;
        this.pixelsPerLonRadian_ = EUCLIDEAN_RANGE / (2 * Math.PI);
        this.scaleLat = 2;
        this.scaleLng = 2;
        this.offsetLat = 0;
        this.offsetLng = 0;
    }
    fromLatLngToPoint(latLng, opt_point) {
        var point = opt_point || new google.maps.Point(0, 0);
        var origin = this.pixelOrigin_;
        point.x = (origin.x + (latLng.lng() + this.offsetLng) * this.scaleLng * this.pixelsPerLonDegree_);
        point.y = (origin.y + (-1 * latLng.lat() + this.offsetLat) * this.scaleLat * this.pixelsPerLonDegree_);
        return point;
    }
    fromPointToLatLng(point) {
        var me = this;
        var origin = me.pixelOrigin_;
        var lng = (((point.x - origin.x) / me.pixelsPerLonDegree_) / this.scaleLng) - this.offsetLng;
        var lat = ((-1 * (point.y - origin.y) / me.pixelsPerLonDegree_) / this.scaleLat) - this.offsetLat;
        return new google.maps.LatLng(lat, lng, true);
    }
}
class Coordinates {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class MarkerObject {
    constructor(reference, position, type, description, data) {
        this.reference = reference;
        this.position = position;
        this.type = type;
        this.description = description;
        this.data = data;
    }
}


/***/ }),

/***/ "./src/web/src/addons/livemap/funcs/utils.ts":
/*!***************************************************!*\
  !*** ./src/web/src/addons/livemap/funcs/utils.ts ***!
  \***************************************************/
/*! exports provided: isNumeric, game_1_x, game_1_y, map_1_lng, map_1_lat, game_2_x, game_2_y, map_2_lng, map_2_lat, convertToGame, convertToGameCoord, convertToMap, convertToMapGMAP, convertToMapGMAPcoord, stringCoordToFloat */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumeric", function() { return isNumeric; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "game_1_x", function() { return game_1_x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "game_1_y", function() { return game_1_y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map_1_lng", function() { return map_1_lng; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map_1_lat", function() { return map_1_lat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "game_2_x", function() { return game_2_x; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "game_2_y", function() { return game_2_y; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map_2_lng", function() { return map_2_lng; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "map_2_lat", function() { return map_2_lat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertToGame", function() { return convertToGame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertToGameCoord", function() { return convertToGameCoord; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertToMap", function() { return convertToMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertToMapGMAP", function() { return convertToMapGMAP; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertToMapGMAPcoord", function() { return convertToMapGMAPcoord; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stringCoordToFloat", function() { return stringCoordToFloat; });
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
var game_1_x = 1972.606;
var game_1_y = 3817.044;
var map_1_lng = -60.8258056640625;
var map_1_lat = 72.06379257078102;
var game_2_x = -1154.11;
var game_2_y = -2715.203;
var map_2_lng = -72.1417236328125;
var map_2_lat = 48.41572128171852;
function convertToGame(lat, lng) {
    var rX = game_1_x + (lng - map_1_lng) * (game_1_x - game_2_x) / (map_1_lng - map_2_lng);
    var rY = game_1_y + (lat - map_1_lat) * (game_1_y - game_2_y) / (map_1_lat - map_2_lat);
    return {
        x: rX,
        y: rY
    };
}
function convertToGameCoord(lat, lng) {
    var rX = game_1_x + (lng - map_1_lng) * (game_1_x - game_2_x) / (map_1_lng - map_2_lng);
    var rY = game_1_y + (lat - map_1_lat) * (game_1_y - game_2_y) / (map_1_lat - map_2_lat);
    return {
        x: rX,
        y: rY,
        z: 0
    };
}
function convertToMap(x, y) {
    var rLng = map_1_lng + (x - game_1_x) * (map_1_lng - map_2_lng) / (game_1_x - game_2_x);
    var rLat = map_1_lat + (y - game_1_y) * (map_1_lat - map_2_lat) / (game_1_y - game_2_y);
    return {
        lat: rLat,
        lng: rLng
    };
}
function convertToMapGMAP(x, y) {
    var rLng = map_1_lng + (x - game_1_x) * (map_1_lng - map_2_lng) / (game_1_x - game_2_x);
    var rLat = map_1_lat + (y - game_1_y) * (map_1_lat - map_2_lat) / (game_1_y - game_2_y);
    return new google.maps.LatLng(rLat, rLng);
}
function convertToMapGMAPcoord(coord) {
    var rLng = map_1_lng + (coord.x - game_1_x) * (map_1_lng - map_2_lng) / (game_1_x - game_2_x);
    var rLat = map_1_lat + (coord.y - game_1_y) * (map_1_lat - map_2_lat) / (game_1_y - game_2_y);
    return new google.maps.LatLng(rLat, rLng);
}
function stringCoordToFloat(coord) {
    return {
        x: parseFloat(coord.x),
        y: parseFloat(coord.y),
        z: parseFloat(coord.z),
    };
}
;


/***/ }),

/***/ "./src/web/src/addons/livemap/index.ts":
/*!*********************************************!*\
  !*** ./src/web/src/addons/livemap/index.ts ***!
  \*********************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _funcs_objects__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./funcs/objects */ "./src/web/src/addons/livemap/funcs/objects.ts");
/* harmony import */ var _funcs_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./funcs/utils */ "./src/web/src/addons/livemap/funcs/utils.ts");
/* harmony import */ var _funcs_map__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./funcs/map */ "./src/web/src/addons/livemap/funcs/map.ts");
/* harmony import */ var _funcs_markers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./funcs/markers */ "./src/web/src/addons/livemap/funcs/markers.ts");
/* harmony import */ var _funcs_init__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./funcs/init */ "./src/web/src/addons/livemap/funcs/init.ts");
/* harmony import */ var _funcs_controls__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./funcs/controls */ "./src/web/src/addons/livemap/funcs/controls.ts");
/* harmony import */ var _funcs_admin__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./funcs/admin */ "./src/web/src/addons/livemap/funcs/admin.ts");









/***/ })

/******/ });
//# sourceMappingURL=livemap.js.map