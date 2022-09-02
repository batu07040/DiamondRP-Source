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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/web/src/addons/custom_sound/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/web/src/addons/custom_sound/index.ts":
/*!**************************************************!*\
  !*** ./src/web/src/addons/custom_sound/index.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const audioSource = new Map();
const peerInput = new Map();
const panner = new Map();
/**
 * @param key type_remoteID
 * @param value position
 */
let players = {};
const context = new AudioContext();
const gain = context.createGain();
gain.connect(context.destination);
window.custom_sound = {
    playCustomSoundAtEntity: (url, volume, max_dist, netid) => {
        console.log(url, volume, max_dist, netid);
        let entity = searchPlayer(netid);
        if (entity == null)
            return;
        let id = window.custom_sound.currentMillisecond();
        audioSource.set('tmp_' + id, window.custom_sound.generateAudioSource(url));
        if (audioSource.get('tmp_' + id).duration == Infinity) {
            audioSource.delete('tmp_' + id);
            return;
        }
        let source = audioSource.get('tmp_' + id);
        source.volume = volume;
        source.id = 'tmp_' + id;
        source.user = netid;
        source.checkTime = false;
        source.checkTimeData = 0;
        peerInput.set('tmp_' + id, context.createMediaElementSource(source));
        panner.set('tmp_' + id, context.createPanner());
        let pannerSource = panner.get('tmp_' + id);
        pannerSource.distanceModel = 'linear';
        pannerSource.refDistance = 1;
        pannerSource.rolloffFactor = 1;
        pannerSource.coneInnerAngle = 360;
        pannerSource.coneOuterAngle = 0;
        pannerSource.coneOuterGain = 0;
        pannerSource.panningModel = 'HRTF';
        peerInput.get('tmp_' + id).connect(pannerSource);
        pannerSource.connect(context.destination);
        pannerSource.setPosition(entity.x, entity.y, entity.z);
        pannerSource.maxDistance = max_dist;
        pannerSource.target = netid;
        source.muted = false;
        source.addEventListener('ended', function () {
            removeAllByName(this.id);
        }, false);
        setTimeout(function () {
            source.play();
        }, 100);
    },
    setCustomSoundList: (name, url, volume, list) => {
        if (audioSource.has(name))
            return;
        audioSource.set(name, window.custom_sound.generateAudioSource(url));
        audioSource.get(name).volume = volume;
        audioSource.get(name).id = name;
        audioSource.get(name).srcTmp = url;
        audioSource.get(name).loop = true;
        audioSource.get(name).user = null;
        audioSource.get(name).checkTime = true;
        audioSource.get(name).checkTimeData = 0;
        let count_parent = 1;
        peerInput.set(name, context.createMediaElementSource(audioSource.get(name)));
        for (let key in list) {
            let block = list[key];
            panner.set(name + '_' + count_parent, context.createPanner());
            panner.get(name + '_' + count_parent).distanceModel = 'linear';
            panner.get(name + '_' + count_parent).panningModel = 'HRTF';
            panner.get(name + '_' + count_parent).refDistance = 1;
            panner.get(name + '_' + count_parent).rolloffFactor = 1;
            panner.get(name + '_' + count_parent).coneInnerAngle = 360;
            panner.get(name + '_' + count_parent).coneOuterAngle = 0;
            panner.get(name + '_' + count_parent).coneOuterGain = 0;
            panner.get(name + '_' + count_parent).setPosition(block.x, block.y, block.z);
            panner.get(name + '_' + count_parent).maxDistance = block.dist;
            panner.get(name + '_' + count_parent).target = null;
            peerInput.get(name).connect(panner.get(name + '_' + count_parent));
            panner.get(name + '_' + count_parent).connect(context.destination);
            count_parent++;
        }
        audioSource.get(name).muted = false;
        setTimeout(function () {
            audioSource.get(name).play();
            audioSource.get(name).addEventListener('ended', function () {
                this.currentTime = 0;
                this.play();
            }, false);
        }, 10000);
    },
    setCustomSound: (name, url, volume, max_dist, x, y, z) => {
        if (audioSource.has(name))
            return;
        audioSource.set(name, window.custom_sound.generateAudioSource(url));
        audioSource.get(name).volume = volume;
        audioSource.get(name).id = name;
        audioSource.get(name).srcTmp = url;
        audioSource.get(name).loop = true;
        audioSource.get(name).user = null;
        audioSource.get(name).checkTime = true;
        audioSource.get(name).checkTimeData = 0;
        if (x != null && y != null && z != null && max_dist != null) {
            peerInput.set(name, context.createMediaElementSource(audioSource.get(name)));
            panner.set(name, context.createPanner());
            panner.get(name).distanceModel = 'linear';
            panner.get(name).panningModel = 'HRTF';
            panner.get(name).refDistance = 1;
            panner.get(name).rolloffFactor = 1;
            panner.get(name).coneInnerAngle = 360;
            panner.get(name).coneOuterAngle = 0;
            panner.get(name).coneOuterGain = 0;
            peerInput.get(name).connect(panner.get(name));
            panner.get(name).connect(context.destination);
            panner.get(name).setPosition(x, y, z);
            panner.get(name).maxDistance = max_dist;
            panner.get(name).target = null;
        }
        audioSource.get(name).muted = false;
        setTimeout(function () {
            audioSource.get(name).play();
        }, 100);
    },
    removeCustomSound: (name) => {
        removeAllByName(name);
    },
    playCustomSound: (url, volume, max_dist, x, y, z) => {
        if (GetDistanceBetweenCoords(context.listener.positionX.value, context.listener.positionY.value, context.listener.positionZ.value, x, y, z) >
            max_dist + 5)
            return; // Не создаём в том случае, если мы очень далеко от источника звука
        let id = window.custom_sound.currentMillisecond();
        audioSource.set('tmp_' + id, window.custom_sound.generateAudioSource(url));
        if (audioSource.get('tmp_' + id).duration == Infinity) {
            audioSource.delete('tmp_' + id);
            return;
        }
        audioSource.get('tmp_' + id).volume = volume;
        audioSource.get('tmp_' + id).id = 'tmp_' + id;
        audioSource.get('tmp_' + id).checkTime = false;
        if (x != null && y != null && z != null && max_dist != null) {
            peerInput.set('tmp_' + id, context.createMediaElementSource(audioSource.get('tmp_' + id)));
            panner.set('tmp_' + id, context.createPanner());
            panner.get('tmp_' + id).distanceModel = 'linear';
            panner.get('tmp_' + id).panningModel = 'HRTF';
            panner.get('tmp_' + id).refDistance = 1;
            panner.get('tmp_' + id).rolloffFactor = 1;
            panner.get('tmp_' + id).coneInnerAngle = 360;
            panner.get('tmp_' + id).coneOuterAngle = 0;
            panner.get('tmp_' + id).coneOuterGain = 0;
            peerInput.get('tmp_' + id).connect(panner.get('tmp_' + id));
            panner.get('tmp_' + id).connect(context.destination);
            panner.get('tmp_' + id).setPosition(x, y, z);
            panner.get('tmp_' + id).maxDistance = max_dist;
            panner.get('tmp_' + id).target = null;
        }
        audioSource.get('tmp_' + id).muted = false;
        audioSource.get('tmp_' + id).addEventListener('ended', function () {
            removeAllByName(this.id);
        }, false);
        setTimeout(function () {
            audioSource.get('tmp_' + id).play();
        }, 100);
    },
    setAllData: (x, y, z, fx, fy, fz, data) => {
        let playersdata = JSON.parse(data);
        context.listener.setPosition(x, y, z); // Позиция игрока
        context.listener.upX.value = fx; //////////////////////////
        context.listener.upY.value = fy; /// Направление камеры ///
        context.listener.upZ.value = fz; //////////////////////////
        players = playersdata;
        for (let key in panner.keys()) {
            let data = panner.get(key);
            if (data.target != null) {
                if (playersdata[data.target]) {
                    let usr = playersdata[data.target];
                    panner.get(key).setPosition(usr.x, usr.y, usr.z);
                }
            }
        }
    },
    generateAudioSource: (url) => {
        const a = new Audio(url);
        a.crossOrigin = 'anonymous';
        return a;
    },
    currentMillisecond: () => {
        currentCounter++;
        return currentCounter;
    }
};
let currentCounter = 1;
const pretedentForKill = new Map();
setInterval(function () {
    for (let key in audioSource.keys()) {
        let data = audioSource.get(key);
        if (data.user != null) {
            if (pretedentForKill.get(data.id)) {
                let q = pretedentForKill.get(data.id);
                q = true;
            }
            else {
                removeAllByName(data.id);
                pretedentForKill.delete(data.id);
            }
        }
        else {
            pretedentForKill.delete(data.id);
        }
    }
}, 5000);
// setInterval(function() {
//     for (let key in panner.keys()) {
//         let data = panner.get(key);
//         if (data.target != null) {
//             let usr = searchPlayer(data.target);
//             if (usr) panner.get(key).setPosition(usr.x, usr.y, usr.z);
//         }
//     }
// }, 50);
setInterval(function () {
    for (let key in audioSource.keys()) {
        if (audioSource.get(key).checkTime) {
            if (audioSource.get(key).currentTime - audioSource.get(key).checkTimeData < 1 ||
                audioSource.get(key).currentTime == 0) {
                let tmp = audioSource.get(key).src;
                audioSource.get(key).src = '';
                audioSource.get(key).loop = false;
                audioSource.get(key).src = tmp;
                audioSource.get(key).loop = true;
                audioSource.get(key).play();
            }
            audioSource.get(key).checkTimeData = audioSource.get(key).currentTime;
        }
    }
}, 5000);
//audioSource[name].checkTime = false;
function GetDistanceBetweenCoords(x0, y0, z0, x1, y1, z1) {
    // Дистанция между координатами
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;
    let deltaZ = z1 - z0;
    let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    return distance;
}
function searchPlayer(id) {
    if (players[id]) {
        return players[id];
    }
}
function removeAllByName(name) {
    audioSource.get(name).src = '';
    audioSource.get(name).loop = false;
    panner.get(name).disconnect(context.destination);
    audioSource.delete(name);
    panner.delete(name);
    peerInput.delete(name);
}


/***/ })

/******/ });
//# sourceMappingURL=custom_sound.js.map