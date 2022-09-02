/// <reference path="../declaration/client.ts" />

import { Container } from './modules/data';
import { methods } from './modules/methods';
import { enums } from './enums';
import { ui } from './modules/ui';
import { coffer } from './coffer';
import { business } from './business';
import { weather } from './managers/weather';
import { weapons } from './weapons';
import { items_old } from './items_old';
import { inventory } from './inventory';
import { gui } from './modules/gui';
import { jobPoint } from './managers/jobPoint';
import { syncData } from './managers/sync.elements';
import { fractionUtil } from '../util/fractions';
import { RAGE_BETA } from '../util/newrage';
import { vipStatus } from '../util/vip';
import { healProtection, teleportProtection } from './modules/ach';
import { vehicles } from './vehicles';
import UIMenu from './modules/menu';
let _isLogin = false;
export let userData = new Map();
export let userDataCh = new Map();

let datingList = new Map();

const player = mp.players.local;
let targetEntity: any = undefined;
let currentScale = 0;
let pulse = false;
let currentKey = 'G';
let scaleForm = mp.game.graphics.requestScaleformMovie("mp_car_stats_01");
let vehicleInfo: any = null;
let vehicleData: any = null;
let targetEntityPrev: any = undefined;

mp.events.add('transferMoney', async () => {
  gui.setGui(null);
  let bankPrefix = methods.parseInt(await UIMenu.Menu.GetUserInput('Harita on eki', '', 4));
  let bankNumber = methods.parseInt(await UIMenu.Menu.GetUserInput('Kart numarasi', '', 9));
  let money = methods.parseInt(await UIMenu.Menu.GetUserInput('Transfer tutari', '', 9));
  mp.events.callRemote('server:bank:transferMoney', bankPrefix, bankNumber, money);
})

const dressSet = (target: PlayerMp, data: {
  [param: string]: [number, number];
}) => {
  for (let param in data) {
    const is_prop = param.includes('p');
    const id = parseInt(param.replace('p', ''));
    const value = data[param];
    if (is_prop) {
      target.setPropIndex(id, value[0], value[1], true);
    } else {
      target.setComponentVariation(id, value[0], value[1], 2);
    }
  }
}

mp.events.add('entityStreamIn', (entity: PlayerMp) => {
  if (entity.type != "player") return;
  const data: string = entity.getVariable('dressSync');
  if (!data) return;
  dressSet(entity, JSON.parse(data))
});

mp.events.addDataHandler("dressSync", (entity: PlayerMp, value: string) => {
  if (!value) return;
  dressSet(entity, JSON.parse(value))
});


setTimeout(() => {
  mp.events.register('isPlayAnimation', (dict: string, anim: string) => {
    return mp.players.local.isPlayingAnim(dict, anim, 3);
  })
  mp.events.register('isPlayTask', () => {
    return mp.players.local.isActiveInScenario();
  })
}, 1000)
setInterval(() => {
  if (!user.isLogin()) return;
  mp.game.stats.statSetInt(mp.game.joaat("SP0_TOTAL_CASH"), user.get('money') + user.get('money_bank'), false);
}, 3000)

mp.events.add('getStreetFromCoord', (q: string) => {
  mp.console.logInfo(q);
  if (!q) return;
  let items: {
    id: number;
    withCoord?: boolean;
    posX?: number;
    posY?: number;
  }[] = JSON.parse(q);
  items.forEach(item => {
    let street = mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(item.posX, item.posY, 0));
    mp.events.triggerBrowser('updateStreet', item.id, street);
  })
})

mp.events.add('drawLocalBlip', (identity: string, pos: Vector3Mp, name: string, blipid: number, blipcolor: number, short = true) => {
  let blip = mp.blips.toArray().find(item => item.identity === identity);
  if (blip) blip.destroy();
  let q = mp.blips.new(blipid, pos, {
    color: blipcolor,
    name: name,
    shortRange: short
  });
  q.identity = identity
  q.setRoute(true)
  // q.setRouteColour(blipcolor)
})
mp.events.add('removeLocalBlip', (identity: string) => {
  let blip = mp.blips.toArray().find(item => item.identity === identity);
  if (blip) blip.destroy();
})

mp.events.add('server:login:success:after', () => {
  setTimeout(() => {
    if (user.isLogin() && user.get('jail_time') <= 0) {
      user.updateCharacterFace();
      user.updateCharacterCloth();
    }
  }, 1000)
})

mp.events.add("server:test", () => {
  user.testServer = true;
});
mp.events.add("set:heading", (h) => {
  mp.players.local.setHeading(h)
});

mp.events.add("checkcomponent", () => {
  user.checkComponent();
});

mp.events.add('user.client.updateChips', (chipsBalance: number) => {
  user.chipsBalance = chipsBalance;
  mp.events.triggerBrowser('cef:hud:setChips', chipsBalance);
});

mp.events.add("setLevel", (h) => {
  user.level = h;
});
mp.events.add("setExp", (h) => {
  user.exp = h;
});
mp.events.add("played:time", (h, t) => {
  user.online_time = h;
  user.online_today = t;
});
mp.events.add("played:warns", (h) => {
  user.warns = h;
});

const user = {
  isMale: () => {
    if (player.model == 1885233650) return true;
    else return false;
    
  },
  getShowingId: (player: PlayerMp = mp.players.local): number => {
    if (!mp.players.exists(player)) return -1;
    if (player.getVariable('idLabel')) return player.getVariable('idLabel');
    return player.getVariable('id');
  },
  getShowingIdString: (target: PlayerMp): string => {
    if (!mp.players.exists(target)) return "-1"
    if (!target.getVariable('idLabel')) return target.getVariable('id').toString();
    if (target.getVariable('idLabel') == target.getVariable('id')) return target.getVariable('id').toString();
    if (!user.get('admin_level')) return target.getVariable('idLabel').toString();
    return `${user.getShowingId(target)} (RID:${target.getVariable('id')})`
  },
  warns: 0,
  audioRadioVolume: 1,
  online_time: 0,
  online_today: 0,
  testServer: false,
  showhpap: false,
  adminAdvancedData: false,
  godmode: false,
  isTeleport: false,
  currentId: 0,
  chipsBalance: 0,
  level: 0,
  exp: 0,
  passwords: <{ [key: string]: number }>{},
  hideCurrentWeapon: () => {
    mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 0, 1, 1, 1)
  },
  passwordCheck: () => { },
  getExp: () => {
    return user.exp
  },
  getMaxExp: () => {
    return user.getLevel() * 6
  },
  getLevel: () => {
    return user.level
  },
  notify: (text: string) => {
    ui.showSubtitle(text);
  },
  getVipData: () => {
    return vipStatus.getVipStatusData(user.get('vip_status'));
  },

  updateCache: async () => {
    userData = await Container.GetAll(player.remoteId);
  },

  get: (item: any) => {
    try {
      if (userData.has(item)) return userData.get(item);
      return undefined;
    } catch (e) {
      methods.debug('Exception: user.get');
      methods.debug(e);
      userData = new Map();
      /*user.updateCache().then(function () {
              user.updateCharacterFace();
              user.updateCharacterCloth();
          });*/
      return undefined;
    }
  },

  has: (item: any) => {
    return userData.has(item);
  },

  set: (key: string, value: any) => {
    userData.set(key, value);
    userDataCh.set(key, value);
  },

  getDating: (item: any) => {
    try {
      if (datingList.has(item)) return datingList.get(item);
      return item;
    } catch (e) {
      methods.debug('Exception: user.getDating');
      methods.debug(e);
      datingList = new Map();
      return item;
    }
  },

  hasDating: (item: number) => {
    return datingList.has(item);
  },

  setDating: (key: any, value: any) => {
    datingList.set(key, value);
  },

  getSex: (): number => {
    if (player.model === mp.game.joaat('mp_f_freemode_01')) return 1;
    else if (player.model === mp.game.joaat('mp_m_freemode_01')) return 0;
    else if (user.isLogin()) {
      let skin = JSON.parse(user.get('skin'));
      return skin['SEX'];
    } else return 0;
  },

  getMonth: () => {
    if (user.isLogin()) return methods.parseInt(user.get('exp_age') / 31);
    return 0;
  },

  setProp: (slot: number, type: number, color: number, check = true) => {
    methods.debug('user.setProp');

    slot = methods.parseInt(slot);
    type = methods.parseInt(type);
    color = methods.parseInt(color);

    mp.events.callRemote('server:user:setProp', slot, type, color);
  },

  clearAllProp: () => {
    mp.events.callRemote('server:user:clearAllProp');
  },

  kick: (reason: string) => {
    mp.events.callRemote('server:player:kick', reason);
  },

  kickAntiCheat: (reason: string) => {
    mp.events.callRemote('server:player:kickAntiCheat', reason);
  },

  engineVehicle: () => {
    if (player.vehicle) {
      if (player.vehicle.getVariable('fraction_id') > 0) {
        if (player.vehicle.getVariable('fraction_id') == user.get('fraction_id'))
          mp.events.callRemote('server:vehicle:engineStatus');
        else mp.game.ui.notifications.show('~r~Tasima anahtarlariniz yok');
      } else mp.events.callRemote('server:vehicle:engineStatus');
    }
  },

  revive: (hp = 20) => {
    healProtection()
    user.isTeleport = true;
    let hospPos = player.position;
    //player.resurrect();
    //player.position = hospPos;
    mp.events.callRemote('server:user:respawn', hospPos.x, hospPos.y, hospPos.z);
    player.health = hp;
    player.freezePosition(false);
    setTimeout(function () {
      user.isTeleport = false;
    }, 1500);
  },

  respawn: (x: number, y: number, z: number) => {
    healProtection()
    user.isTeleport = true;
    mp.events.callRemote('server:user:respawn', x, y, z);
    setTimeout(function () {
      user.isTeleport = false;
    }, 1500);
  },

  clearChat: () => {
    if (gui.hudLoaded) {
      gui.browser.execute(`chatAPI.clear()`);
    }
  },

  hideLoadDisplay: (duration: number = 500, hud: boolean = true) => {
    mp.game.cam.doScreenFadeIn(duration);
    teleportProtection(5000)
    if (hud) {
      setTimeout(() => {
        ui.showHud();
      }, duration);
    }
  },

  showLoadDisplay: (duration: number = 500, hud: boolean = true) => {
    mp.game.cam.doScreenFadeOut(duration);
    teleportProtection(5000)
    if (hud) {
      ui.hideHud();
    }
  },

  addHistory: (type: string, reason: string) => {
    mp.events.callRemote('server:user:addHistory', type, reason);
  },

  removeWeapon: (hash: number) => {
    if (Container.HasLocally(0, hash.toString())) {
      Container.ResetLocally(0, hash.toString());
      Container.Reset(player.remoteId, hash.toString());
    }
    mp.game.invoke(methods.REMOVE_WEAPON_FROM_PED, player.handle, hash);
  },

  removeAllWeapons: () => {
    //player.removeAllWeapons();

    weapons.hashesMap.forEach((item) => {
      if (item[0] == 'Unarmed') return;
      let hash = item[1] / 2;
      user.removeWeapon(hash);
    });
    syncData()
  },

  giveWeaponByHash: (model: string, pt: number, inHand = false) => {
    // todo Check native types
    let modelh = model == "WEAPON_REVOLVER" ? mp.game.joaat(model) as number << 0 : model
    mp.game.invoke(methods.GIVE_WEAPON_TO_PED, player.handle, modelh, pt, true, inHand);
    Container.SetLocally(0, model.toString(), true);
    Container.Set(player.remoteId, model.toString(), pt);
  },

  giveWeapon: (model: string, pt: number) => {
    // todo Check native types
    let isGive = false;
    weapons.hashesMap.forEach((item) => {
      if ('WEAPON_' + item[0].toUpperCase() == model.toUpperCase()) {
        let hash = item[1] / 2;
        mp.game.invoke(methods.GIVE_WEAPON_TO_PED, player.handle, hash, pt, true, false);
        Container.SetLocally(0, hash.toString(), true);
        Container.Set(player.remoteId, hash.toString(), pt);
        isGive = true;
        return true;
      }
    });
    if (!isGive)
      methods.saveLog(
        'CheatEngine',
        `${user.get('rp_name')} (${user.get('id')}) try give ${model}`
      );
  },

  teleportv: async (pos: Vector3Mp, h?: number) => {
    user.isTeleport = true;
    mp.game.streaming.requestCollisionAtCoord(pos.x, pos.y, pos.z);
    user.showLoadDisplay();
    player.freezePosition(true);
    await methods.sleep(500);
    player.position = pos;
    if (h) {
      mp.players.local.setHeading(h)
      mp.game.cam.setGameplayCamRelativeHeading(0);
    }
    player.freezePosition(false);
    user.hideLoadDisplay();
    await methods.sleep(500);
    user.isTeleport = false;
  },

  teleportVehV: (pos: Vector3Mp) => {
    user.isTeleport = true;
    mp.game.streaming.requestCollisionAtCoord(pos.x, pos.y, pos.z);
    if (mp.game.interior.getInteriorAtCoords(pos.x, pos.y, pos.z)) {
      mp.game.interior.refreshInterior(mp.game.interior.getInteriorAtCoords(pos.x, pos.y, pos.z))
    }
    user.showLoadDisplay();
    //methods.wait(500);
    setTimeout(function () {
      if (mp.players.local.vehicle) mp.players.local.vehicle.position = new mp.Vector3(pos.x, pos.y, pos.z + 0.5);
      else mp.players.local.position = pos;
      if (mp.players.local.vehicle) mp.players.local.vehicle.setOnGroundProperly();
      //methods.wait(500);
      setTimeout(function () {
        user.hideLoadDisplay();
        setTimeout(function () {
          user.isTeleport = false;
          if (mp.game.interior.getInteriorAtCoords(pos.x, pos.y, pos.z)) {
            mp.game.interior.refreshInterior(mp.game.interior.getInteriorAtCoords(pos.x, pos.y, pos.z))
          }
        }, 1000);
      }, 500);
    }, 500);
  },

  teleport: (x: number, y: number, z: number, h?: number) => {
    // if (typeof rot != 'number') rot = player.heading;
    user.teleportv(new mp.Vector3(x, y, z), h);
  },

  teleportVeh: (x: number, y: number, z: number) => {
    user.teleportVehV(new mp.Vector3(x, y, z));
  },

  tpToWaypoint: () => {
    //* find GPS blip

    try {
      let entity = mp.players.local.vehicle && mp.players.local.vehicle.getPedInSeat(-1) == mp.players.local.handle ? mp.players.local.vehicle : mp.players.local
      let pos = methods.getWaypointPosition();
      if (pos.x != 0) {
        user.teleport(pos.x, pos.y, pos.z);
        setTimeout(() => {
          const z = mp.game.gameplay.getGroundZFor3dCoord(
            entity.position.x,
            entity.position.y,
            entity.position.z,
            0.0,
            false
          );
          entity.setCoordsNoOffset(
            entity.position.x,
            entity.position.y,
            z,
            false,
            false,
            false
          );
          setTimeout(() => {
            const z = mp.game.gameplay.getGroundZFor3dCoord(
              entity.position.x,
              entity.position.y,
              entity.position.z + 1000,
              0.0,
              false
            );
            entity.setCoordsNoOffset(
              entity.position.x,
              entity.position.y,
              z,
              false,
              false,
              false
            );
          }, 200)
        }, 600)
      }
    } catch (e) {
      mp.console.logError(e);
    }
  },

  setWaypoint: (x: number, y: number) => {
    mp.game.ui.setNewWaypoint(methods.parseInt(x), methods.parseInt(y));
    if (mp.game.gameplay.getDistanceBetweenCoords(mp.players.local.position.x, mp.players.local.position.y, 0, x, y, 0, true) < 1) return;
    ui.showSubtitle('Etiket B ~g~GPS~s~ Kuruldu');
  },

  setWaypointTarget: (x: number, y: number, z: number) => {
    jobPoint.create(new mp.Vector3(x, y, z - 2), true, 20, true);
    ui.showSubtitle('Метка в ~g~GPS~s~ была установлена');
  },


  clearWaypointTarget: () => {
    jobPoint.delete();
  },

  removeWaypoint: () => {
    user.setWaypoint(player.position.x, player.position.y);
  },

  isLogin: () => {
    return _isLogin;
  },

  isAdmin: (adminLevel = 1) => {
    return user.get('admin_level') >= adminLevel;
  },

  stopAllAnimation: () => {
    if (!player.getVariable('isBlockAnimation')) {
      //player.clearTasks();
      //player.clearSecondaryTask();
      if (Container.HasLocally(0, 'hasSeat')) {
        let plPos = player.position;
        player.freezePosition(false);
        player.setCollision(true, true);
        player.position = new mp.Vector3(plPos.x, plPos.y, plPos.z + 0.95);
        Container.ResetLocally(0, 'hasSeat');
      }
      mp.events.callRemote('server:stopAllAnimation');
    }
  },

  stopScenario: () => {
    mp.events.callRemote('server:stopScenario');
  },

  playScenario: (name: string, x?: number, y?: number, z?: number, h?: number, teleport = true) => {
    if (RAGE_BETA) return mp.events.call('client:syncScenario', mp.players.local.remoteId, name, x, y, z, h, teleport)
    mp.events.callRemote('server:playScenario', name, x, y, z, h, teleport);
  },
  playNearestScenarioCoord: (x: number, y: number, z: number, r: number) => {
    mp.events.callRemote('server:playNearestScenarioCoord', x, y, z, r);
  },

  /**
          8 = нормально играть
          9 = цикл
          48 = нормально играть только верхнюю часть тела
          49 = цикл только верхняя часть тела
      */
  playAnimation: (dict: string, anim: string, flag: number = 49, accessVeh = false) => {
    // todo check types
    if (player.getVariable('isBlockAnimation') || (player.isInAnyVehicle(false) && !accessVeh) || user.isDead())
      return;
    if (RAGE_BETA) return mp.events.call('client:syncAnimation', mp.players.local.remoteId, dict, anim, methods.parseInt(flag), accessVeh)
    mp.events.callRemote('server:playAnimation', dict, anim, methods.parseInt(flag), accessVeh);

    /*
          8 = нормально играть
          9 = цикл
          48 = нормально играть только верхнюю часть тела
          49 = цикл только верхняя часть тела
      */

    /*player.clearTasks();
      //player.clearSecondaryTask();
      mp.game.streaming.requestAnimDict(dict);
      while (!mp.game.streaming.hasAnimDictLoaded(dict))
          mp.game.wait(10);
      player.taskPlayAnim(dict, anim, 8.0, -8, -1, flag, 0, false, false, false);*/
  },

  playArrestAnimation: () => {
    if (
      player.getVariable('isBlockAnimation') ||
      player.isInAnyVehicle(false) ||
      user.isDead() ||
      methods.isBlockKeys()
    )
      return;
    mp.events.callSocket('server:playArrestAnimation');
  },

  playAnimationWithUser: (toId: number, animType: number) => {
    if (player.getVariable('isBlockAnimation') || player.isInAnyVehicle(false) || user.isDead())
      return;
    mp.events.callSocket('server:playAnimationWithUser', toId, animType);
  },

  playPhoneAnimation: () => {
    //if (!player.isUsingScenario("WORLD_HUMAN_STAND_MOBILE"))
    //    user.playScenario("WORLD_HUMAN_STAND_MOBILE");
  },

  setIsLogin: (isLogin: boolean) => {
    _isLogin = isLogin;
    gui.updateChatSettings()
  },

  setVariable: (key: string, value: any) => {
    mp.events.callSocket('server:user:serVariable', key, value);
  },

  setVirtualWorld: (worldId: number) => {
    mp.events.callRemote('server:user:setVirtualWorld', worldId);
  },

  setPlayerModel: (model: string) => {
    mp.events.callRemote('server:user:setPlayerModel', model);
  },

  saveAccount: () => {
    mp.events.callRemote('server:user:saveAccount');
  },

  checkComponent: () => {
    if (user.getGrabMoney()) user.setComponentVariation(5, 45, 0, true)
    else user.setComponentVariation(5, 0, 0, true)
  },

  setComponentVariation: (component: number, drawableId: number, textureId: number, nocheck = false) => {
    component = methods.parseInt(component);
    drawableId = methods.parseInt(drawableId);
    textureId = methods.parseInt(textureId);
    mp.events.callSocket('server:user:setComponentVariation', component, drawableId, textureId, nocheck);
  },

  giveJobMoney: (money: number) => {
    if (user.get('skill_' + user.get('job')) >= 500) money = methods.parseInt(money * 1.5);

    mp.events.callRemote('server:user:addJobMoney', money);
    if (user.get('bank_prefix') < 1) {
      user.addCashMoney(money);
      mp.game.ui.notifications.show('~y~Banka karti icin basvurun');
    } else {
      user.addBankMoney(money);
      user.sendSmsBankOperation(`Fonlarin kredilendirilmesi: ~g~$${money}`);
    }

    coffer.removeMoney(money);

    switch (user.get('job')) {
      case 'mail':
        business.addMoney(115, methods.parseInt(money / 2));
        break;
      case 'mail2':
        business.addMoney(119, methods.parseInt(money / 2));
        break;
      case 'bgstar':
        business.addMoney(116, methods.parseInt(money / 2));
        break;
      case 'sunb':
        business.addMoney(117, methods.parseInt(money / 2));
        break;
      case 'three':
        business.addMoney(118, methods.parseInt(money / 2));
        break;
      case 'photo':
        business.addMoney(92, methods.parseInt(money / 2));
        break;
    }
  },

  giveJobSkill: () => {
    mp.events.callRemote('server:user:giveJobSkill');
  },

  takeTool: () => {
    if (Container.HasLocally(player.id, 'workerTool')) {
      mp.game.ui.notifications.show('~r~İş aletlerini zaten almışsınız.');
      return;
    }
    Container.SetLocally(player.id, 'workerTool', true);
    mp.game.ui.notifications.show('~g~İş aletlerini aldınız.');
  },

  sendSmsBankOperation: (text: string, title = 'Bir hesap ile islem yapma') => {
    switch (user.get('bank_prefix')) {
      case 1111:
        mp.game.ui.notifications.showWithPicture(
          title,
          '~r~Maze~s~ Bank',
          text,
          'CHAR_BANK_MAZE',
          2
        );
        break;
      case 2222:
        mp.game.ui.notifications.showWithPicture(
          title,
          '~g~Fleeca~s~ Bank',
          text,
          'CHAR_BANK_FLEECA',
          2
        );
        break;
      case 3333:
        mp.game.ui.notifications.showWithPicture(
          title,
          '~b~Blaine~s~ Bank',
          text,
          'DIA_CUSTOMER',
          2
        );
        break;
      case 4444:
        mp.game.ui.notifications.showWithPicture(
          title,
          '~o~Pacific~s~ Bank',
          text,
          'WEB_SIXFIGURETEMPS',
          2
        );
        break;
    }
  },

  unEquipAllWeapons: () => {
    return new Promise(async resolve => {
      for (let n = 54; n < 138; n++) {
        for (let id in weapons.hashesMap) {
          let item = weapons.hashesMap[id];
          if (item[0] === items_old.getItemNameHashById(n)) {

            if (
              mp.game.invoke(
                methods.HAS_PED_GOT_WEAPON,
                player.handle,
                mp.game.gameplay.getHashKey('WEAPON_' + item[0].toUpperCase()),
                false
              )
            ) {
              let hash = item[1] / 2;
              let ammoItem = inventory.ammoTypeToAmmo(
                mp.game.invoke(methods.GET_PED_AMMO_TYPE_FROM_WEAPON, player.handle, hash)
              );
              if (ammoItem != -1) {
                inventory.unEquipItem(
                  ammoItem,
                  mp.game.invoke(methods.GET_AMMO_IN_PED_WEAPON, player.handle, hash)
                );
                await methods.sleep(100);
              }
              inventory.unEquipItem(n);
            }
          }
        }
      }
      syncData()
      resolve(true)

    })
  },

  cuff: () => {
    mp.events.callRemote('server:user:cuff');
  },

  unCuff: () => {
    mp.events.callRemote('server:user:unCuff');
  },

  isCuff: () => {
    return player.getVariable('isCuff') === true;
  },

  tie: () => {
    mp.events.callRemote('server:user:tie');
  },

  unTie: () => {
    mp.events.callRemote('server:user:unTie');
  },

  isTie: () => {
    return player.getVariable('isCuff') === true;
  },

  setCacheData: (data: Map<any, any>) => {
    /*if (userData.has('id')) {
          if (data.get('id') != userData.get('id')) {
              methods.saveLog('CheatEngine', `${user.get('rp_name')} (${user.get('id')}) try change ID`);
          }
      }*/
    userData = data;
    user.currentId = data.get('id') + 1000000;
  },

  getCacheData: () => {
    return userData;
  },

  getCache: (item: any) => {
    try {
      if (userData.has(item))
        return userData.get(item);
      return undefined;
    }
    catch (e) {
      methods.debug('Exception: user.get');
      methods.debug(e);
      userData = new Map();
      return undefined;
    }
  },
  getRegStatusName: () => {
    switch (user.get('reg_status')) {
      case 1:
        return 'Gecici';
      case 2:
        return 'Vatandaslik edinme';
      case 3:
        return 'ABD Vatandasligi';
      default:
        return '~r~Hayir';
    }
  },

  updateCharacterFace: (isLocal = false) => {
    try {
      if (!isLocal) mp.events.callRemote('server:user:updateCharacterFace');
      else {
        player.setHeadBlendData(
          user.get('GTAO_SHAPE_THRID_ID'),
          user.get('GTAO_SHAPE_SECOND_ID'),
          0,
          user.get('GTAO_SKIN_THRID_ID'),
          user.get('GTAO_SKIN_SECOND_ID'),
          0,
          user.get('GTAO_SHAPE_MIX'),
          user.get('GTAO_SKIN_MIX'),
          0,
          true
        );

        let features;
        if (typeof user.get('GTAO_FACE_SPECIFICATIONS') == 'string') {
          features = JSON.parse(user.get('GTAO_FACE_SPECIFICATIONS'));
        } else {
          features = user.get('GTAO_FACE_SPECIFICATIONS');
        }

        if (features) {
          features.forEach((item: number, id: number) => {
            player.setFaceFeature(id, item);
          });
        }

        player.setComponentVariation(2, user.get('GTAO_HAIR'), 0, 2);
        player.setHeadOverlay(
          2,
          user.get('GTAO_EYEBROWS'),
          1.0,
          user.get('GTAO_EYEBROWS_COLOR'),
          0
        );

        player.setHairColor(user.get('GTAO_HAIR_COLOR'), user.get('GTAO_HAIR_COLOR2'));
        player.setEyeColor(user.get('GTAO_EYE_COLOR'));
        player.setHeadOverlayColor(2, 1, user.get('GTAO_EYEBROWS_COLOR'), 0);

        player.setHeadOverlay(
          9,
          user.get('GTAO_OVERLAY9'),
          1.0,
          user.get('GTAO_OVERLAY9_COLOR'),
          0
        );

        if (user.getSex() == 0) {
          if (user.get('GTAO_OVERLAY10') != -1)
            player.setHeadOverlay(
              10,
              user.get('GTAO_OVERLAY10'),
              1.0,
              user.get('GTAO_OVERLAY10_COLOR'),
              0
            );
          player.setHeadOverlay(
            1,
            user.get('GTAO_OVERLAY'),
            1.0,
            user.get('GTAO_OVERLAY_COLOR'),
            0
          );
        } else if (user.getSex() == 1) {
          if (user.get('GTAO_OVERLAY4') != -1)
            player.setHeadOverlay(
              4,
              user.get('GTAO_OVERLAY4'),
              1.0,
              user.get('GTAO_OVERLAY4_COLOR'),
              0
            );
          if (user.get('GTAO_OVERLAY5') != -1)
            player.setHeadOverlay(
              5,
              user.get('GTAO_OVERLAY5'),
              1.0,
              user.get('GTAO_OVERLAY5_COLOR'),
              0
            );
          if (user.get('GTAO_OVERLAY8') != -1)
            player.setHeadOverlay(
              8,
              user.get('GTAO_OVERLAY8'),
              1.0,
              user.get('GTAO_OVERLAY8_COLOR'),
              0
            );
        }
      }
    } catch (e) {
      mp.console.logInfo('updateCharacterFace', e);
    }
  },

  updateCharacterCloth: () => {
    mp.events.callRemote('server:user:updateCharacterCloth');
  },

  updateTattoo: () => {
    mp.events.callRemote('server:user:updateTattoo');
  },

  setDecoration: (slot: number, type: number) => {
    // todo check types
    mp.events.callRemote('server:user:setDecoration', slot, type);
  },

  clearDecorations: () => {
    mp.events.callRemote('server:user:clearDecorations');
  },

  addMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:addMoney', money);
  },

  removeMoney: (money: number) => {
    money = methods.parseInt(money);
    mp.events.callRemote('server:user:removeMoney', money);
  },

  setMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:setMoney', money);
  },

  getMoney: () => {
    return user.getCashMoney();
  },

  addBankMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:addBankMoney', money);
  },

  removeBankMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:removeBankMoney', money);
  },

  setBankMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:setBankMoney', money);
  },

  getBankMoney: () => {
    return methods.parseInt(user.get('money_bank'));
  },

  addCashMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:addCashMoney', money);
  },

  removeCashMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:removeCashMoney', money);
  },

  setCashMoney: (money: number) => {
    money = methods.parseInt(money);

    mp.events.callRemote('server:user:setCashMoney', money);
  },

  getCashMoney: () => {
    return methods.parseInt(user.get('money'));
  },

  addGrabMoney: (money: number) => {
    money = methods.parseInt(money);

    user.setGrabMoney(user.getGrabMoney() + money);
  },

  removeGrabMoney: (money: number) => {
    money = methods.parseInt(money);

    user.setGrabMoney(user.getGrabMoney() - money);
  },

  setGrabMoney: (money: number) => {
    money = methods.parseInt(money);
    Container.SetLocally(0, 'GrabMoney', money);

    if (money > 0) user.setComponentVariation(5, 45, 0);
    else user.setComponentVariation(5, 0, 0);

  },

  getGrabMoney: () => {
    return methods.parseInt(Container.GetLocally(0, 'GrabMoney'));
  },

  addDrugLevel: (type: number, level: number) => {
    user.setDrugLevel(type, user.getDrugLevel(type) + level);
  },

  removeDrugLevel: (type: number, level: number) => {
    user.setDrugLevel(type, user.getDrugLevel(type) - level);
  },

  setDrugLevel: (type: number, level: number) => {
    Container.SetLocally(0, 'DrugLevel' + type, level);
  },

  getDrugLevel: (type: number) => {
    return methods.parseInt(Container.GetLocally(0, 'DrugLevel' + String(type)));
  },

  stopAllScreenEffect: () => {
    mp.game.invoke(methods.STOP_ALL_SCREEN_EFFECTS);
  },

  setHeal: (level: number) => {
    mp.events.callRemote('server:user:setHeal', level);
  },

  grabGun: async (shopId: number) => {
    if (user.get('fraction_id2') == 0) {
      mp.game.ui.notifications.show('~r~Resmi olmayan bir kurulusa uye olmak gerekiyor');
      return;
    }

    if (weather.getHour() < 23 && weather.getHour() > 4) {
      mp.game.ui.notifications.show('~r~Sadece 23:00 ile sabah 04.00 arasinda kullanilabilir');
      return;
    }

    if (await Container.Has(shopId, 'isGrabShop')) {
      mp.game.ui.notifications.show('~r~Su anda bir soygun gerceklestiremezsiniz');
      return;
    }

    if (methods.getRandomInt(0, 3) == 1) {
      inventory.takeNewItem(71).then();
      inventory.takeNewItem(27, 140).then();
      mp.game.ui.notifications.show('~g~P99 Buldunuz');
    } else if (methods.getRandomInt(0, 100) == 1) {
      inventory.takeNewItem(103).then();
      inventory.takeNewItem(153, 140).then();
      mp.game.ui.notifications.show('~g~MP5A3 Buldunuz');
    } else {
      inventory.takeNewItem(77).then();
      inventory.takeNewItem(27, 140).then();
      mp.game.ui.notifications.show('~g~Taurus PT92 Buldunuz');
    }
  },

  grab: async (shopId: number) => {
    if (mp.players.local.dimension != 0) return mp.game.ui.notifications.show('~r~Sanal bir boyutta soygun yapamazsiniz');
    if (user.isGos()) return user.notify("~r~Soygun yapamazsin")
    mp.events.callRemote('server:user:grab', shopId);

  },

  setData: (key: any, value: any) => {
    //methods.debug(`${key}:${value}`);
    Container.Set(player.remoteId, key, value);
    try {
      userData.set(key, value);
    } catch (e) {
      methods.debug(e);
    }
  },

  resetData: (key: any) => {
    //methods.debug(`${key}:${value}`);
    Container.Reset(player.remoteId, key);
    try {
      userData.set(key, null);
    } catch (e) {
      methods.debug(e);
    }
  },

  giveWanted: (level: number, reason: string) => {
    mp.events.callRemote('server:user:giveMeWanted', level, reason);
  },

  isDead: (target = mp.players.local) => {
    return target.getHealth() <= 0;
  },

  getVehicle: (target = mp.players.local.vehicle) => {
    return target;
  },

  getPlayerFraction: (): number => { return user.get('fraction_id') },

  getFractionName: (fractionId: number) => {
    return fractionId == 0 ? 'нет' : fractionUtil.getFractionName(fractionId);
  },

  getRankName: (fractionId: number, rank: number) => fractionUtil.getRankName(fractionId, rank),

  isLeader2: () => {
    return user.isLogin() && user.get('rank2') == 11;
  },

  isSubLeader2: () => {
    if (!user.isLogin()) return false;
    return user.get('rank2') >= 9;
  },

  isLeader: () => {
    return user.isLogin() && fractionUtil.isLeader(user.get('fraction_id'), user.get('rank'));
  },

  isSubLeader: () => {
    if (!user.isLogin()) return false;
    return fractionUtil.isSubLeader(user.get('fraction_id'), user.get('rank'))
  },

  isGos: () => {
    return (
      user.isLogin() &&
      (user.isSapd() ||
        user.isFib() ||
        user.isUsmc() ||
        user.isGov() ||
        user.isEms() ||
        user.isSheriff() ||
        user.isAutoschool() ||
        user.isPrison())
    );
  },
  isGang: () => {
    if (!user.isLogin()) return false;
    let itm = fractionUtil.getFraction(user.getPlayerFraction());
    if (!itm) return false
    return !!fractionUtil.getFraction(user.getPlayerFraction()).gang;
  },

  isPolice: () => {
    return (
      user.isLogin() &&
      (user.isSapd() || user.isFib() || user.isUsmc() || user.isSheriff() || user.isPrison())
    );
  },

  isGov: () => {
    return user.isLogin() && user.get('fraction_id') == 1;
  },

  isSapd: () => {
    return user.isLogin() && user.get('fraction_id') == 2;
  },

  isFib: () => {
    return user.isLogin() && user.get('fraction_id') == 3;
  },

  isUsmc: () => {
    return user.isLogin() && user.get('fraction_id') == 4;
  },

  isSheriff: () => {
    return user.isLogin() && user.get('fraction_id') == 7;
  },

  isPrison: () => {
    return user.isLogin() && user.get('fraction_id') == 5;
  },

  isRussianMafia: () => {
    return user.isLogin() && user.get('fraction_id') == 8;
  },

  isCosaNostra: () => {
    return user.isLogin() && user.get('fraction_id') == 9;
  },

  isYakuza: () => {
    return user.isLogin() && user.get('fraction_id') == 10;
  },

  isLaEme: () => {
    return user.isLogin() && user.get('fraction_id') == 11;
  },

  isMafia: () => {
    return (
      user.isLogin() &&
      (user.isRussianMafia() || user.isCosaNostra() || user.isYakuza() || user.isLaEme())
    );
  },

  isEms: () => {
    return user.isLogin() && user.get('fraction_id') == 16;
  },

  isAutoschool: () => {
    return user.isLogin() && user.get('fraction_id') == 17;
  },
  getTargetEntityValidate: () => {
    try {
      if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.getType() != 3 &&
        !targetEntity.entity.getVariable('useless')
      )
        return targetEntity.entity;
      else if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.getType() != 3 &&
        targetEntity.entity.getVariable('useless') &&
        targetEntity.entity.getVariable('user_id')
      )
        return targetEntity.entity;
      else if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.getVariable('isDrop')
      )
        return targetEntity.entity;
      else if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.getVariable('emsType') !== undefined &&
        targetEntity.entity.getVariable('emsType') !== null
      )
        return targetEntity.entity;
      else if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.invType !== undefined &&
        targetEntity.entity.invType !== null
      )
        return targetEntity.entity;
      else if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.getVariable('stockId')
      )
        return targetEntity.entity;
      else if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.getVariable('houseSafe')
      )
        return targetEntity.entity;
      else if (
        targetEntity &&
        targetEntity.entity &&
        targetEntity.entity.getVariable('itemId')
      )
        return targetEntity.entity;
    }
    catch (e) {
      //methods.debug(e);
    }
    return undefined;
  },
  pointingAtRadius: (distance, radius = 0.2) => {
    try {
      const camera = mp.cameras.new("gameplay");
      let position = camera.getCoord();
      let direction = camera.getDirection();
      let farAway = new mp.Vector3((direction.x * distance) + (position.x), (direction.y * distance) + (position.y), (direction.z * distance) + (position.z));
      return mp.raycasting.testCapsule(position, farAway, radius, mp.players.local);
    }
    catch (e) {
    }
    return undefined;
  },
  timerRayCast: async () => {

    try {
      if (!mp.players.local.vehicle) {
        switch (mp.game.invoke(methods.GET_FOLLOW_PED_CAM_VIEW_MODE)) {
          case 4:
            targetEntity = user.pointingAtRadius(3);
            //if (user.getTargetEntityValidate() === undefined)
            //    user.targetEntity = user.pointingAtRadius(2);
            break;
          case 1:
            targetEntity = user.pointingAtRadius(6.8);
            //if (user.getTargetEntityValidate() === undefined)
            //    user.targetEntity = user.pointingAtRadius(6.8);
            break;
          case 2:
            targetEntity = user.pointingAtRadius(9);
            //if (user.getTargetEntityValidate() === undefined)
            //    user.targetEntity = user.pointingAtRadius(9);
            break;
          default:
            targetEntity = user.pointingAtRadius(5);
            //if (user.getTargetEntityValidate() === undefined)
            //    user.targetEntity = user.pointingAtRadius(5);
            break;
        }

        let target = user.getTargetEntityValidate();
        /*if (target && target != targetEntityPrev)
            mp.game.ui.notifications.show(`Нажмите ~g~${bind.getKeyName(user.getCache('s_bind_do'))}~s~ для взаимодействия`);*/

        try {
          if (target && target != targetEntityPrev) {

            if (target.getVariable('useless') === true && target.getVariable('user_id') > 0) {
              methods.debug('DEBUG ROLIK')
              vehicleInfo = methods.getVehicleInfo(target.model);
              vehicleData = await vehicles.getData(target.getVariable('container'));

              let maxSpeed = 450;
              let fuelSpeed = 20;

              let speed = vehicles.getSpeedMax(target.model) / maxSpeed * 100;
              if (speed > 100)
                speed = 100;

              let fuel = vehicleInfo.fuel_min / fuelSpeed * 100;
              if (fuel > 100)
                fuel = 100;

              let priceMore = (vehicleData.get('sell_price') / (vehicleInfo.price) * 100) - 100;
              if (priceMore > 100)
                priceMore = 100;
              if (priceMore < 0)
                priceMore = 0;

              let countSeat = target.getMaxNumberOfPassengers() * 10;
              if (countSeat > 100)
                countSeat = 100;

              mp.game.graphics.pushScaleformMovieFunction(scaleForm, 'SET_VEHICLE_INFOR_AND_STATS');
              mp.game.graphics.pushScaleformMovieFunctionParameterString(vehicleInfo.display_name);
              //mp.game.graphics.pushScaleformMovieFunctionParameterString(`${methods.moneyFormat(vehicleData.get('sell_price'))}`);
              mp.game.graphics.pushScaleformMovieFunctionParameterString('CHAR_FRANKLIN');
              mp.game.graphics.pushScaleformMovieFunctionParameterString('CHAR_FRANKLIN');
              mp.game.graphics.pushScaleformMovieFunctionParameterString('Hiz');
              mp.game.graphics.pushScaleformMovieFunctionParameterString('Tüketim');
              mp.game.graphics.pushScaleformMovieFunctionParameterString('İsaretleme');
              mp.game.graphics.pushScaleformMovieFunctionParameterString('Kapasite');
              mp.game.graphics.pushScaleformMovieFunctionParameterInt(methods.parseInt(speed));
              mp.game.graphics.pushScaleformMovieFunctionParameterInt(methods.parseInt(fuel));
              mp.game.graphics.pushScaleformMovieFunctionParameterInt(methods.parseInt(priceMore));
              mp.game.graphics.pushScaleformMovieFunctionParameterInt(methods.parseInt(countSeat));
              mp.game.graphics.popScaleformMovieFunctionVoid();
            }
            else {
              vehicleInfo = null;
              vehicleData = null;
            }
          }
          else {
            /*vehicleInfo = null;
            vehicleData = null;*/
          }
        }
        catch (e) {
          /*vehicleInfo = null;
          vehicleData = null;*/
        }

        targetEntityPrev = target;
      }
      else
        targetEntity = null;
    }
    catch (e) {

    }
  }
};
mp.events.add('render', () => {
  let entity = user.getTargetEntityValidate();
  try {
    if (user.isLogin() && entity && entity.getAlpha() > 0) {
      // if (user.getCache('s_hud_raycast')) {
      let pos = entity.position;
      //ui.drawText3D(`•`, pos.x, pos.y, pos.z, 1.3);
      if (currentScale >= 0.1)
        pulse = false;
      if (currentScale <= 0)
        pulse = true;
      if (pulse)
        currentScale = currentScale + 0.003;
      else
        currentScale = currentScale - 0.003;
      ui.drawText3D(currentKey, pos.x, pos.y, pos.z, 0.3 + currentScale);
      // }
      // else
      // ui.drawText(`•`, 0.5, 0.5, 0.3, 255, 255, 255, 200, 0, 1, false, true);
    }
  }
  catch (e) { }

  try {
    if (entity && vehicleInfo && vehicleData) {
      let tRot = entity.getRotation(0);
      let offset = entity.getOffsetFromInWorldCoords(3.5, 1, 0);
      mp.game.graphics.drawScaleformMovie3d(scaleForm, offset.x, offset.y, entity.position.z + 6 + (currentScale / 6), 0, 180, tRot.z, 0.0, 1.0, 0.0, 7.0, 5, 7.0, 0);
    }
  }
  catch (e) {

  }
});
// setInterval(() => {
//   if(mp.players.local.getDrawableVariation(4)){
//     mp.players.local.setEnableScuba(true);
//     mp.players.local.setMaxTimeUnderwater(400.0)
//   } else {
//     mp.players.local.setEnableScuba(false);
//     mp.players.local.setMaxTimeUnderwater(15.0)
//   }
// }, 5000)

export { user };
