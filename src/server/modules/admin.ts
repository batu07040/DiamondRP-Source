/// <reference path="../../declaration/server.ts" />
import deathReasonList from '../config/deathReasonList.json'
import fs from 'fs'
import Discord from 'discord.js'
import { user, workUser } from "../user"
import { menu } from "./menu";
import { vehicles } from "../vehicles";
import { methods } from "../modules/methods";
import { chat, enabledSystem } from "./chat";
import { weather } from '../managers/weather';
import { business } from '../business';
import { baseItems, newChest, oldChestPool } from './chest';
import { spawnParkMenu } from '../managers/parking';
import { enums } from '../enums';
import { vehicleInfo, vehClassName } from './vehicleInfo';
import { autosalon } from '../business/autosalon';
import { dressRoom, garderobPool } from './garderob';
import { fractionGarage } from './fraction.vehicles.spawn';
import { garderobEntity } from './entity/garderob';
import { moneyChestEntity } from './entity/moneyChest';
import { moneyChest, moneyChests } from './moneyChest';
import { weaponChest } from './entity/weaponChest';
import { userEntity } from './entity/user';
import { socketInit } from '../socket';
import { blackListEntity } from './entity/blackList';
import { Op } from 'sequelize';
import { vehicleBoosterEntity } from './entity/vehicleBooster';
import { businessEntity } from './entity/business';
import { coffer } from '../coffer';
import { exec } from 'child_process';
import { restartConf } from '../managers/restart';
import { RAGE_BETA } from '../../util/newrage';
import { fractionUtil } from '../../util/fractions';
import { whitelist } from './whitelist';
import { gangWarsZoneEntity } from './entity/gangWarsZone';
import { baseDzone, reloadGangWarZones } from './gangwar';
import { chest } from '../modules/customchest';
import { inventory, itemsDB } from '../inventory';
import { items } from '../items';
import { inventoryEntity } from './entity/inventory';
import { tempConfigs } from '../../util/tempConfigs';
import { promocodeUsingEntity, promocodeEntity } from './entity/promocodeUsing';
import { clothItem, propItem } from '../../util/inventory';
import { carsEntity } from './entity/carsModel';
import adminsTp from '../config/adminsTp'
import { weaponsUtil } from '../../util/weapons';
import { createTempPromocode, tempPromocodes } from './events';
import { enabledHackTimeout, enableHackTimeout } from '../promisehack';
import { npc } from './npc';
const hook = new Discord.WebhookClient('681570762255237142', 'TU1rOAb3qv7DVkNvWezV9wnlyDzzAG4SO4lHwyEbawDhAlhbnQbVB37ALd_jSt1esTsq');
// const hook = new Discord.WebhookClient('681572841878978576', 'bC_tkr8JSt6ppszrEWhzjkNt-RVm3gJEMs9hNS57OdAHcNDaMTXlV0UPSQMuZsFU_qe3');
let webhookBlock = false
setInterval(() => {
  if (webhookBlock) return;
  let players = mp.players.length
  if (players > 100) {
    let admins = mp.players.toArray().filter((player) => user.isAdmin(player)).length
    if (admins == 0) {
      if (!methods.isTestServer()) {
        hook.send('@here Внимание. На сервере ' + players + ' игроков, но при этом нет администраторов в сети. Просим зайти на сервер');
        webhookBlock = true;
        setTimeout(() => {
          webhookBlock = false;
        }, 15 * 60000);
      }
    }
  }
}, 60000);

setTimeout(() => {
  chat.registerCommand("atest", (player) => {
    mainMenu(player)
  })
}, 1000)

mp.events.add("admin:menu", (player: PlayerMp) => {
  mainMenu(player)
})

let killers: { user: number, time: number, pos: Vector3Mp, target_pos: Vector3Mp, target: number, reason: string }[] = [];
const KILL_SAVE_TIME_MIN = 30;

mp.events.add('playerDeath', (player: PlayerMp, reason: number, killer: PlayerMp) => {
  if (!killer) return;
  if (!user.isLogin(killer)) return;
  if (!user.isLogin(player)) return;
  let srcReason = (deathReasonList as any)[reason.toString()]
  let reasonText = "";
  if (srcReason) {
    reasonText = `${srcReason} ${reason}`
  }
  killers.push({
    user: user.getId(killer),
    target: user.getId(player),
    pos: killer.position,
    target_pos: player.position,
    reason: reasonText,
    time: methods.getTimeStamp()
  })
});

setInterval(() => {
  let time = methods.getTimeStamp()
  killers.map((item, index) => {
    if (item.time + KILL_SAVE_TIME_MIN * 60 < time) killers.splice(index, 1);
  })
}, 120000);

/** Кастомные параметры всяких штук, типа x2 payday и т.д. */
export let customParams = { ...tempConfigs }

let admin_labels: { user: number, label: TextLabelMp }[] = []

export const setCustomParams = (name: string, value: boolean) => {
  // @ts-ignore
  customParams[name] = value
  saveTempConf();
}


function newBiz(player: PlayerMp, param?: { name: string, user_id: number; price: number }) {
  let m = menu.new(player, "Yeni ofis", "Parametreler")
  m.workAnyTime = true;
  m.onclose = () => { gameData(player); }
  if (!param) {
    param = {
      name: "",
      user_id: 0,
      price: 50000,
    }
  }
  m.newItem({
    name: "Unvan",
    more: param.name,
    onpress: () => {
      menu.input(player, "Bir isim giriniz", param.name, 30).then(text => {
        param.name = text
        if (!text) param.name = ''
        newBiz(player, param);
      });
    }
  })
  m.newItem({
    name: "Ид владельца",
    more: param.user_id,
    onpress: () => {
      menu.input(player, "ID girin", param.user_id.toString(), 11).then(text => {
        param.user_id = methods.parseInt(text)
        if (!text) param.user_id = 0
        newBiz(player, param);
      });
    }
  })
  m.newItem({
    name: "Maliyeti",
    more: param.price,
    onpress: () => {
      menu.input(player, "Maliyet girin", param.price.toString(), 11).then(text => {
        param.price = methods.parseInt(text)
        if (!text) param.price = 0
        newBiz(player, param);
      });
    }
  })
  m.newItem({
    name: "~g~Oluştur",
    onpress: () => {
      let target = user.getPlayerById(param.user_id);
      if (!target && param.user_id != 0) return player.notify("~r~Belirtilen kullanıcı çevrimiçi değil")

      businessEntity.create({
        name: param.name,
        price: param.price,
        user_name: target ? user.getRpName(target) : '',
        user_id: target ? param.user_id : 0,
        bank: 0,
        type: 10,
        price_product: 1,
        price_card1: 10,
        price_card2: 10,
        tarif: 0,
        interior: 2,
      }).then(res => {
        business.load(res);
        if (target && param.user_id != 0) {
          user.set(target, "fraction_id2", res);
          user.set(target, "rank2", 11);
        }
        player.notify("~g~Ofis başarıyla kurulmuştur");
        m.close();
      })
    }
  })
  m.open();
}

function customEnable(player: PlayerMp) {
  if (!user.isAdminNow(player) || user.getAdminLevel(player) < 6) return;
  let m = menu.new(player, "Ek parametreler", "Liste")
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }

  // m.newItem({
  //   name: "X2 PayDay Money", more: customParams.paydayx2 ? "~g~Включено" : "Выключено",
  //   desc: "Увеличивает суммарный доход в 2 раза",
  //   onpress: () => {
  //     customParams.paydayx2 = !customParams.paydayx2;
  //     player.notify(customParams.paydayx2 ? "~g~Включено" : "~r~Отключено");
  //     saveTempConf()
  //   }
  // })
  for (let param in tempConfigs) {
    m.newItem({
      name: tempConfigs[param], more: customParams[param] ? "~g~Dahil" : "Kapalı",
      onpress: () => {
        // @ts-ignore
        customParams[param] = !customParams[param];
        player.notify(tempConfigs[param] ? "~g~Dahil" : "~r~Devre dışı bırakıldı");
        saveTempConf()
      }
    })
  }
  m.newItem({
    name: "Oynatılan süreyi temizle",
    desc: "Yukarıdaki nokta için zamanlama",
    onpress: () => {
      user.accept(player, "Emin misiniz?").then(status => {
        if (!status) return customEnable(player);
        userEntity.update({ played_time: 0 }, { where: {} });
        mp.players.forEach(player => {
          player.played_time = 0
        })
        player.notify('~g~Bitti');
      })
    }
  })

  m.open()
}

function timeEdit(player: PlayerMp) {
  if (!user.isAdminNow(player) || user.getAdminLevel(player) < 6) return;
  let m = menu.new(player, "Zaman ayarı", "Liste")
  m.workAnyTime = true;
  m.onclose = () => { gameData(player); }

  m.newItem({
    name: "Saat", more: weather.getHour(),
    desc: "",
    onpress: () => {
      menu.input(player, "Yeni bir değer girin (0-23)", weather.getHour().toString(), 2).then(text => {
        if (!text) return player.notify("~r~İptal")
        let hr = methods.parseInt(text);
        if (isNaN(hr) || hr < 0 || hr > 23) return player.notify("~r~Girilen değer yanlış");
        weather.setHour(hr);
        weather.timeSyncTimer();
        timeEdit(player)
      })
    }
  })

  m.newItem({
    name: "Dakika", more: weather.getMin(),
    desc: "",
    onpress: () => {
      menu.input(player, "Yeni bir değer girin (0-59)", weather.getMin().toString(), 2).then(text => {
        if (!text) return player.notify("~r~İptal")
        let hr = methods.parseInt(text);
        if (isNaN(hr) || hr < 0 || hr > 59) return player.notify("~r~Girilen değer yanlış");
        weather.setMin(hr);
        weather.timeSyncTimer();
        timeEdit(player)
      })
    }
  })

  m.open()
}

function vehCatalog(player: PlayerMp) {
  if (!user.isAdminNow(player) || user.getAdminLevel(player) < 5) return;
  let m = menu.new(player, "Araba Kataloğu", "Kategoriler")
  m.workAnyTime = true;
  m.onclose = () => { gameData(player); }

  m.newItem({
    name: "Araba Kataloğu",
    desc: "",
    onpress: () => {
      let submenu = menu.new(player, "Konfigürasyonların listesi");
      submenu.workAnyTime = true;
      submenu.onclose = () => { vehCatalog(player); }
      submenu.newItem({
        name: "Yeni bir tane ekleyin",
        onpress: () => {
          menu.input(player, "Modeli girin").then(model => {
            if (model.length < 2) return player.notify("~r~Bir model tanıtılmalıdır");
            model = methods.model(model)
            if (vehicleInfo.find(model)) return player.notify("~r~Zaten listede olan bir modeli ekleyemezsiniz"), vehCatalog(player)
            menu.input(player, "Bir isim girin").then(name => {
              if (name.length < 2) return player.notify("~r~Bir model tanıtılmalıdır");
              menu.input(player, "Bagaj bölmesi hacmini girin (kg)").then(stock2 => {
                let stock = methods.parseInt(stock2)
                if (isNaN(stock) || stock < 0 || stock > 999990999) return player.notify("~r~Parametre doğru değil");
                stock *= 1000;

                menu.input(player, "Yakıt tüketimini girin (litre)").then(fuel_min2 => {
                  let fuel_min = methods.parseInt(fuel_min2)
                  if (isNaN(fuel_min) || fuel_min < 0 || fuel_min > 999990999) return player.notify("~r~Parametre doğru değil");
                  menu.input(player, "Benzin deposu hacmini girin (Lİtre)").then(fuel_full2 => {
                    let fuel_full = methods.parseInt(fuel_full2)
                    if (isNaN(fuel_full) || fuel_full < 0 || fuel_full > 999990999) return player.notify("~r~Parametre doğru değil");

                    menu.selector(player, "Bir sınıf seçme", ['Commercials',
                      'Compacts',
                      'Coupes',
                      'Industrial',
                      'Motorcycles',
                      'Muscle',
                      'Off-Road',
                      'Sedans',
                      'Sports',
                      'Sports Classics',
                      'Super',
                      'SUVs',
                      'Utility',
                      'Vans']).then((classs: vehClassName) => {
                        if (!classs) return player.notify("~r~Bir sınıf seçilmelidir"), vehCatalog(player);

                        vehicleInfo.create(model, name, classs, stock, fuel_full, fuel_min);
                        player.notify("~g~Başarıyla")
                        vehCatalog(player)
                      })
                  })
                })

              })
            })
          })
        }
      })
      enums.vehicleInfo.forEach((item) => {
        submenu.newItem({
          name: item.display_name,
          desc: `Bagajın ağırlığı.: ${(item.stock / 1000).toFixed(2)} kg, Yakıt tüketimi.: ${item.fuel_min}L, Benzin hacmi.: ${item.fuel_full}л`,
          onpress: () => {
            const id = item.id
            const setting = () => {
              let item = enums.vehicleInfo.find(q => q.id === id);
              if (!item) return;
              let submenu2 = menu.new(player, "Kurulum", item.display_name);
              submenu2.newItem({
                name: "Elektrikli araba",
                more: `${item.fuel_min == 0 && item.class_name != 'Cycles' ? 'Evet' : 'Hayır'}`
              })
              submenu2.newItem({
                name: "Bagaj bölmesinin ağırlığı",
                more: `${(item.stock / 1000).toFixed(2)} kg`,
                onpress: () => {
                  menu.input(player, "Ağırlığı girin (kg)", `${(item.stock / 1000).toFixed(0)}`, 6, "int").then(stockfull => {
                    if (!stockfull) return setting();
                    vehicleInfo.update({ stock: stockfull * 1000 }, id).then(res => {
                      setting();
                    })
                  });
                }
              })
              submenu2.newItem({
                name: "Gaz deposunun kapasitesi",
                more: `${(item.fuel_full)} л`,
                onpress: () => {
                  menu.input(player, "Hacmi girin", `${(item.fuel_full)}`, 6, "int").then(val => {
                    if (!val) return setting();
                    vehicleInfo.update({ fuel_full: val }, id).then(res => {
                      setting();
                    })
                  });
                }
              })
              submenu2.newItem({
                name: "Dakika başına akış hızı",
                more: `${(item.fuel_min)} L`,
                onpress: () => {
                  menu.input(player, "Hacmi girin", `${(item.fuel_min)}`, 6, "int").then(val => {
                    if (!val) return setting();
                    vehicleInfo.update({ fuel_min: val }, id).then(res => {
                      setting();
                    })
                  });
                }
              })
              submenu2.newItem({
                name: "Elektrikli bir otomobil için araç kurulumu",
                onpress: () => {
                  if (item.class_name == 'Cycles') return player.notify(`~r~Bisiklet elektrikli bir araç olamaz)`)
                  vehicleInfo.update({ fuel_full: 1, fuel_min: 0 }, id).then(res => {
                    setting();
                  })
                }
              })

              submenu2.newItem({
                name: '~r~Silme', onpress: () => {
                  user.accept(player, "Kaydı silmek mi?").then(status => {
                    if (!status) return vehCatalog(player);
                    vehicleInfo.remove(item.id).then(() => {
                      player.notify("~g~Kayıt başarıyla silindi")
                      vehCatalog(player)
                    })
                  })
                }
              })
              submenu2.open();
            }
            setting();

          }
        })
      })
      submenu.open();
    }
  })



  m.newItem({
    name: "Araba galerileri",
    desc: "",
    onpress: () => {
      let submenu = menu.new(player, "Sergi salonlarının listesi");
      submenu.workAnyTime = true;
      submenu.onclose = () => { vehCatalog(player); }
      autosalon.list.map((item, index) => {
        submenu.newItem({
          name: item[0],
          onpress: () => {
            let submenu2 = menu.new(player, "Список ТС");
            submenu2.workAnyTime = true;
            submenu2.onclose = () => { vehCatalog(player); }
            submenu2.newItem({
              name: "Yeni bir model ekleyin",
              onpress: () => {
                menu.input(player, "Modeli büyük harfle girin").then(model => {
                  if (!model) return;
                  model = methods.model(model)
                  let hash = mp.joaat(model);
                  if (!vehicleInfo.find(hash)) return player.notify("~r~Bu araç yapılandırma dizininde mevcut değildir. Önce oraya eklemeniz gerekiyor");
                  autosalon.addModel(index, model);
                  player.notify("~g~Araç belirtilen salona başarıyla eklendi");
                })
              }
            })
            autosalon.models[index].map(model => {
              submenu2.newItem({
                name: model,
                onpress: () => {
                  user.accept(player, "Kaydı silmek mi?").then(status => {
                    if (!status) return vehCatalog(player);
                    autosalon.removeModel(index, model);
                    player.notify("~g~Model başarıyla silindi")
                    vehCatalog(player)
                  })
                }
              })
            })
            submenu2.open();
          }
        })
      })
      submenu.open();
    }
  })


  m.newItem({
    name: "Satılık yeni araba",
    desc: "",
    onpress: async () => {
      if (!player.vehicle) return player.notify("~r~Bayiye eklemek istediğiniz araca oturun. Verilerini manuel olarak doldurmamanız için verilerini kopyalayacağız")
      if (!player.vehicle.modelname) return player.notify("~r~Araba bir yönetici tarafından spamlanmalıdır")
      const vInfo = vehicleInfo.find(player.vehicle.model)
      if (!vInfo) {
        player.notify("~r~Bazı nedenlerden dolayı bu aracı yapılandırmalarda bulamadık");
        return vehCatalog(player);
      }
      let cars = await carsEntity.findAll({
        where: {
          [Op.or]: [{ hash: player.vehicle.model }, { hash: methods.hashToDb(player.vehicle.model) }]
        }
      })
      let costHelp = ``;
      if (cars.length > 0) {
        costHelp = ` (Zaten bunun için var ${cars[0].price}$)`
      }
      menu.input(player, "Maliyeti girin" + costHelp, "", 10, "int").then(sums => {
        if (!player.vehicle) return player.notify("~r~Bayiye eklemek istediğiniz araca oturun. Verilerini manuel olarak doldurmamanız için verilerini kopyalayacağız")
        if (!player.vehicle.modelname) return player.notify("~r~Araba bir yönetici tarafından spamlanmalıdır")
        let sum = methods.parseInt(sums);
        if (isNaN(sum) || sum <= 0 || sum > 99999999) return player.notify("~r~Maliyet doğru değil")
        let q: string[] = [];
        for (let i = 1; i < 21; i++) q.push(i.toString());
        menu.selector(player, "Miktar", q).then(scount => {
          if (!player.vehicle) return player.notify("~r~Bayiye eklemek istediğiniz araca oturun. Verilerini manuel olarak doldurmamanız için verilerini kopyalayacağız")
          if (!player.vehicle.modelname) return player.notify("~r~Araba bir yönetici tarafından spamlanmalıdır")
          if (!scount) return;
          let vCount = methods.parseInt(scount);
          if (isNaN(vCount) || vCount < 0 || vCount > 21) return;
          for (let i = 0; i < vCount; i++) {
            let number = vehicles.generateNumber();
            let color = methods.getRandomInt(0, 156);

            let vInfo = methods.getVehicleInfo(player.vehicle.model);
            if (vInfo.display_name == 'Unknown') {
              player.notify("~r~Bu araç için yapılandırma mevcut değil")
              continue;
            }

            carsEntity.create({
              hash: player.vehicle.model,
              name: player.vehicle.modelname,
              class_type: vInfo.class_name,
              full_fuel: vInfo.fuel_full,
              fuel: vInfo.fuel_full,
              fuel_minute: vInfo.fuel_min,
              color1: color,
              color2: color,
              number: number,
              stock_full: vInfo.stock,
              price: sum,
              x: 0,
              y: 0,
              z: 0,
              rot: 0,
            })
          }


          setTimeout(() => {
            autosalon.loadCars();
          }, 5000);
          // setTimeout(() => {
          //   vehicles.loadAll(0, false);
          // }, 5000);

          player.notify('~b~Araba sunucuya eklendi. Adet: ~s~' + vCount);
        })
      })
    }
  })

  m.open()

}


function saveTempConf() {
  fs.writeFile("tempdata.json", JSON.stringify(customParams), function (err) {
    if (err) {
      methods.createFile("tempdata.json");
      saveTempConf()
    }
  });
}

fs.readFile("tempdata.json", "utf8", function (err, data) {
  if (err) return saveTempConf();
  let d = JSON.parse(data)
  for (let param in tempConfigs) {
    // @ts-ignore
    customParams[param] = false
  }
  for (let id in d) {
    // @ts-ignore
    customParams[id] = d[id]
  }
});

let runTestExec = false;

function mainMenu(player: PlayerMp) {
  if (!methods.isTestServer() && !user.isAdmin(player)) return player.notify('~r~Bu menüye erişemezsiniz');
  let m = menu.new(player, "", "Eylemler");
  m.sprite = "admin"
  m.workAnyTime = true;
  if (RAGE_BETA) {
    m.newItem({
      name: "~r~Hızlı geçiş",
      onpress: () => {
        player.notify("Komut gönderildi")
        player.kickSilent("Reconnect")
      }
    })
  }
  m.newItem({
    name: "Aracın hızını ölçme",
    onpress: () => {
      player.call('carCompare')
    }
  })
  m.newItem({
    name: "Işınlanma noktaları",
    onpress: () => {
      menu.selector(player, "Bir nokta seçin", adminsTp.map(itm => { return itm[0] as string }), true).then(id => {
        if (typeof id != "number") return;
        user.teleportVeh(player, adminsTp[id][1], adminsTp[id][2], adminsTp[id][3]);
      })
    }
  })
  if (methods.isTestServer()) {
    m.newItem({
      name: "~g~====== TEST BÖLÜMÜ ======",
      onpress: () => {
        let submenu = menu.new(player, "Test cihazının fonksiyonları")
        submenu.workAnyTime = true;
        submenu.onclose = () => { mainMenu(player) }
        submenu.newItem({
          name: "Etiket başına TP",
          onpress: () => {
            user.teleportWaypoint(player);
          }
        })
        submenu.newItem({
          name: "Araç yarat",
          onpress: () => {
            menu.input(player, "Aracın adını girin").then(model => {
              if (!model) return;
              let vehicle = vehicles.spawnCar(player.position, player.heading, model);
              vehicle.dimension = player.dimension;
              player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
            })
          }
        })
        submenu.newItem({
          name: "Oyuncu seviyesi",
          more: 'Güncel: ' + user.getLevel(player),
          onpress: () => {
            menu.input(player, "Seviyeyi girin", user.getLevel(player).toString(), 3, "int").then(lvl => {
              if (!lvl) return mainMenu(player);
              if (isNaN(lvl) || lvl < 0 || lvl > 99) return player.notify("~r~Oyuncunun seviyesi doğru değil")
              user.setLevel(player, lvl)
              player.notify('~g~Seviye ayarı');
              return mainMenu(player)
            })
          }
        })
        submenu.newItem({
          name: "1000000$ alın",
          onpress: () => {
            user.addCashMoney(player, 1000000)
            user.addBankMoney(player, 1000000)
            player.notify('~g~Hazır')
          }
        })
        submenu.newItem({
          name: "Canlandırmak",
          onpress: () => {
            user.healProtect(player)
            player.spawn(player.position);
            player.health = 100;
          }
        })
        submenu.newItem({
          name: "100% Armor",
          onpress: () => {
            player.armour = 100;
          }
        })
        submenu.newItem({
          name: "Silah vermek",
          onpress: () => {
            menu.selector(player, "Bir silah seçin", weaponsUtil.hashesMap.map(([name, hashhalh]) => name), true).then(async ids => {
              if (typeof ids !== "number") return mainMenu(player)
              let weapon = weaponsUtil.hashesMap[ids];
              let ammo = await menu.input(player, "Mermi sayısı", "100", 10, "int");
              if (!ammo || ammo < 1) return player.notify(`~r~Mermi sayısı yanlış belirtildi`), mainMenu(player)
              user.giveWeaponByHash(player, mp.joaat("WEAPON_" + weapon[0].toUpperCase()), ammo)
              player.notify('~g~Silahlar verildi');
              return mainMenu(player)
            });
          }
        })
        submenu.newItem({
          name: "Görev dışı bir işlem yayınlayın",
          more: user.getPlayerFractionName(player),
          onpress: () => {
            menu.selectFraction(player).then(fract => {
              if (fract == null) return;
              user.set(player, "fraction_id", fract);
              user.set(player, "rank", 1);
              user.updateClientCache(player);
              player.notify("~g~Kesir belirlendi")
              user.saveAccount(player)
              return mainMenu(player)
            })
          }
        })
        if (user.getPlayerFraction(player)) {
          submenu.newItem({
            name: "Fraksiyon dışı rütbe",
            more: `${user.getRankName(user.getPlayerFraction(player), user.getPlayerFractionRank(player))} [${user.getPlayerFractionRank(player)}]`,
            onpress: () => {
              if (!user.getPlayerFraction(player)) return mainMenu(player);
              let fractionranks = fractionUtil.getFractionRanks(user.getPlayerFraction(player));
              menu.selector(player, "Bir rütbe seçin", ["~r~İptal", ...fractionranks], true).then(rank => {
                if (!rank) return mainMenu(player)
                user.set(player, 'rank', rank);
                player.notify(`~g~Başarılı`);
                user.updateClientCache(player);
                user.saveAccount(player)
                return mainMenu(player)
              })
            }
          })
        }
        if (RAGE_BETA && user.isAdminNow(player, 6)) {
          submenu.newItem({
            name: "NPC",
            onpress: () => {
              let submenu2 = menu.new(player, "NPC", "Eylemler")
              submenu2.onclose = () => { mainMenu(player); }
              submenu2.newItem({
                name: "Spawn NPC",
                type: "list",
                list: ["Dinamik", "Statik"],
                onpress: (item) => {
                  if (item.listSelected == 0) {
                    npc.createPed(player.position, player.heading, 'ig_fbisuit_01')
                  }
                  if (item.listSelected == 1) {
                    npc.createPed(player.position, player.heading, 'ig_fbisuit_01', true)
                  }
                }
              })
              submenu2.newItem({
                name: "Sürücüyü en yakın araca götürün",
                onpress: (item) => {
                  let veh = user.getNearestVehicle(player, 5);
                  if (!veh) return player.notify("Araç algılanmadı");
                  let ped = npc.createPed(player.position, player.heading, 'ig_fbisuit_01')
                  setTimeout(() => {
                    npc.putIntoVehicle(ped, veh, -1, 5000, 2.0, 1)
                  }, 1000)
                }
              })
              submenu2.newItem({
                name: "Taksi şoförü oluştur",
                onpress: (item) => {
                  let veh = vehicles.spawnCar(player.position, 0, 'taxi', "TEST")
                  if (!veh) return player.notify("Araç algılanmadı");
                  let dynamicPed = mp.peds.new(mp.joaat('player_zero'), player.position, { dynamic: true });
                  dynamicPed.controller = player;
                  vehicles.setFuelFull(veh)
                  vehicles.engineStatus(player, veh, true);
                  setTimeout(() => {
                    dynamicPed.putIntoVehicle(veh, -1, 5000, 1.0, 1)
                    player.putIntoVehicle(veh, 2)
                    setTimeout(() => {
                      dynamicPed.driveWaypoint(2568.86, 6177.29, 163.86)
                    }, 10000)
                  }, 15000)
                }
              })
              submenu2.newItem({
                name: "En yakın pediyatristi kaldırın",
                onpress: (item) => {
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Pediyatristi tespit edilmedi");
                  ped.destroy();
                }
              })
              submenu2.newItem({
                name: "Pedalı navigasyon noktasında sürmek için almak",
                onpress: (item) => {
                  if (!player.waypoint) return player.notify('~r~Navigasyon noktasını bulamadık.');
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Pediyatristi tespit edilmedi");
                  npc.driveWaypoint(ped, player.waypoint.x, player.waypoint.y, 0)
                }
              })
              submenu2.newItem({
                name: "Pedal hareketini durdurun",
                onpress: () => {
                  if (!player.waypoint) return player.notify('~r~Navigasyon noktasını bulamadık.');
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Pedal algılanmadı");
                  npc.clearTask(ped)
                }
              })
              submenu2.newItem({
                name: "Pedal hareketini hemen durdurun",
                onpress: () => {
                  if (!player.waypoint) return player.notify('~r~Navigasyon noktasını bulamadık');
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Pedal algılanmadı");
                  npc.clearTask(ped, true);
                }
              })
              submenu2.open();
            }
          })

        }
        submenu.newItem({
          name: "Hava durumunu değiştirin",
          onpress: (item) => {
            weather.nextRandomWeather();
            player.notify('~g~Bitti')
          }
        })
        submenu.open();
      }
    })

  }
  if (user.isAdmin(player)) {
    m.newItem({
      name: "Bir şikayete yanıt verin",
      onpress: () => {
        menu.input(player, "ID Girin").then((ids) => {
          if (!ids) return;
          let id = methods.parseInt(ids);
          let target = user.getPlayerById(id);
          if (!target) return player.notify("Oyuncu tespit edilmedi");
          menu.input(player, "Cevap girin").then(text => {
            if (!text) return player.notify("~r~İptal")
            player.notify("~g~Yanıt gönderildi");
            mp.events.call("server:sendAnswerReport", player, id, text);
          })
        })
      }
    })
    if (!user.isAdminNow(player)) {
      m.newItem({
        name: "~g~Açmak ~y~Yönetici modu",
        onpress: () => {
          player.setVariable('enableAdmin', true);
          player.notify("~r~Yönetici modu etkin");
          user.log(player, "AdminJob", "Yönetici açıldı")
          mainMenu(player)
        }
      })
      if (user.getAdminLevel(player) >= 5) {
        if (!player.getVariable('enableAdminHidden')) {
          m.newItem({
            name: "~g~Gizliliği etkinleştir ~y~Yönetici modu",
            desc: "+5 Level yöneticisi dışında hiç kimse yöneticinizin açık olduğunu göremez",
            onpress: () => {
              player.setVariable('enableAdminHidden', true);
              setTimeout(() => {
                if (!mp.players.exists(player)) return;
                player.setVariable('enableAdmin', true);
                mainMenu(player)
              }, 500)
              player.notify("~r~Yönetici modu gizli modda etkinleştirildi");
              user.log(player, "AdminJob", "Включил админку в скрытном режиме")
            }
          })
        }
      }
    } else {
      if (user.getAdminLevel(player) >= 5) {
        if (!player.getVariable('enableAdminHidden')) {
          m.newItem({
            name: "~g~Gizliliği etkinleştir ~y~Yönetici modu",
            desc: "+5 Level yöneticisi dışında hiç kimse yöneticinizin açık olduğunu göremez",
            onpress: () => {
              player.setVariable('enableAdminHidden', true);
              player.notify("~r~Yönetici modu gizli moda geçirildi");
              user.log(player, "AdminJob", "Yöneticiyi gizli moda geçirdi")
              mainMenu(player)
            }
          })
        } else {
          m.newItem({
            name: "~r~Gizli modu kapatın ~y~Yönetici modu",
            desc: "Yönetici kalacaktır, ancak gizli mod kaybolacaktır",
            onpress: () => {
              player.setVariable('enableAdminHidden', false);
              player.notify("~r~Yönetici modu etkin");
              user.log(player, "AdminJob", "Yönetici modunu açık bırakarak gizli yönetici modunu kapattı")
              mainMenu(player)
            }
          })
        }
      }
      m.newItem({
        name: "Yakınınızdaki bir yarıçapta bulunan oyuncuları iyileştirin",
        onpress: () => {
          user.accept(player, "Emin misin?").then(status => {
            mainMenu(player)
            if (!status) return;
            mp.players.toArray().filter(target => target.dist(player.position) < 50).map(target => {
              user.fullHeal(target, false);
            })
            user.log(player, "AdminJob", "Yarıçap içindeki tüm oyuncuları iyileştirdi")
          })
        }
      })
      if (user.isAdminNow(player, 5)) {
        m.newItem({
          name: "Işınlanmaya kilitlen",
          more: player.teleportBlock ? "~g~Aktif" : "~r~Aktif değil",
          onpress: () => {
            player.teleportBlock = !player.teleportBlock;
            player.notify('~g~Durum değişti');
            mainMenu(player)
          }
        })
      }
      m.newItem({
        name: "~r~Yarıçap içindeki arabayı kaldırın",
        onpress: () => {
          user.accept(player, "Emin misin?").then(status => {
            if (!status) return mainMenu(player);
            menu.input(player, "Mesafeyi girin", "10", 3, "int").then((dist) => {
              if (!dist) return mainMenu(player);
              if (isNaN(dist) || dist < 0) return player.notify(`~r~Yarıçap doğru değil`)
              if (dist > 50) return player.notify(`~r~Belirtilen yarıçap çok büyük`)
              mp.vehicles.toArray().filter(veh => veh.dimension == player.dimension && player.dist(veh.position) < dist).map(veh => {
                veh.destroy();
              })
              player.notify('~g~Başarıyla')
              user.log(player, "AdminJob", "Yarıçap içindeki tüm arabalar kaldırıldı " + dist + "m")
            });
          })
        }
      })

      m.newItem({
        name: "Yeni hile karşıtı bildirimi",
        more: player.registerAnticheat ? "~g~Dahil" : "~r~Devre dışı bırakıldı",
        onpress: () => {
          player.registerAnticheat = !player.registerAnticheat;
          player.notify('~g~Durum değişti')
          mainMenu(player);
        }
      })
      m.newItem({
        name: "Kayıtların bildirilmesi",
        more: player.registerAlert ? "~g~Dahil" : "~r~Devre dışı bırakıldı",
        onpress: () => {
          player.registerAlert = !player.registerAlert;
          player.notify('~g~Durum değişti')
          mainMenu(player);
        }
      })
      if (user.isCuff(player)) {
        m.newItem({
          name: "Kelepçeleri çıkar.",
          onpress: () => {
            user.unCuff(player)
            mainMenu(player)
          }
        })
      }
      m.newItem({
        name: "Bir oyuncu üzerindeki eylemler",
        onpress: () => {
          menu.input(player, "ID Girin").then((ids) => {
            if (!ids) return;
            let id = methods.parseInt(ids);
            user.checkIdUser(id).then(async fnd => {
              if (fnd == -1) return player.notify("Oyuncu tespit edilmedi");
              let target = user.getPlayerById(id);
              let name = target ? user.getRpName(target) : (await userEntity.findOne({ where: { id: id } })).rp_name;
              workUser(player, id, name, fnd);
            })
          })
        }
      })
      m.newItem({
        name: "Ulaşım",
        onpress: () => vehMenu(player)
      })
      m.newItem({
        name: "Davetsiz misafir",
        more: player.alpha == 0 ? "~g~Dahil" : "~r~Kapalı",
        onpress: () => {
          player.alpha = player.alpha == 0 ? 255 : 0
          player.notify("Davetsiz misafir " + player.alpha ? "~g~" : "~r~Kapalı");
        }
      })
      m.newItem({
        name: "GodMode",
        onpress: () => {
          player.call("godmode:switch");
          user.log(player, "AdminJob", "GodMode geçildi")
        }
      })
      m.newItem({
        name: "Duyuru",
        onpress: () => {
          menu.input(player, "Başlık girin").then(title => {
            if (!title) return;
            menu.input(player, "Metin girin").then(text => {
              if (!text) return;
              methods.saveLog('AdminNotify', `${user.getRpName(player)} - ${title} | ${text}`);
              methods.notifyWithPictureToAll(title, 'Yönetim', text, 'CHAR_ACTING_UP');
              user.log(player, "AdminJob", "Bir ilan verdin. " + title + "\n" + text)
            })
          })
        }
      })
      m.newItem({
        name: "ID Yükleme",
        desc: "Varsayılan olarak 15",
        onpress: () => {
          menu.input(player, "Yeni bir mesafe girin").then((ids) => {
            player.call("client:distId", [ids]);
            player.notify("Parametre değiştirildi");
          })
        }
      })
      m.newItem({
        name: "Yakınlarda katiller aranıyor",
        desc: "Varsayılan olarak 30",
        onpress: () => {
          menu.input(player, "Mesafeyi girin", "30", 3, "int").then((dist) => {
            if (!dist) return;
            let list = [...killers.filter(itm => methods.distanceToPos(player.position, itm.pos) <= dist || methods.distanceToPos(player.position, itm.target_pos) <= dist)].reverse()
            let submenu = menu.new(player, "Cinayetlerin listesi", "Yarıçap: " + dist + " | Zaman: " + KILL_SAVE_TIME_MIN + " Dakika");
            submenu.onclose = () => { mainMenu(player) };
            list.map(itm => {
              submenu.newItem({
                name: `[${itm.user}] (${itm.reason})`,
                more: `Hedef: ${itm.target}`,
                onpress: () => {
                  workUser(player, itm.user)
                }
              })
            })

            submenu.open()
          })
        }
      })
      if (user.isAdmin(player, 4)) {
        m.newItem({
          name: "Dünyada çizilmiş metin",
          desc: "Harita üzerinde tabela oluşturma",
          onpress: () => {
            const q = () => {
              let submenu = menu.new(player, "Oluşturulan tabloların listesi");
              submenu.onclose = () => { mainMenu(player) }
              submenu.newItem({
                name: `~g~Pozisyonuma ekle`,
                onpress: () => {
                  menu.input(player, "Metin girin", "", 120).then(value => {
                    if (!value) return q();
                    admin_labels.push({
                      user: user.getId(player), label: mp.labels.new(value, player.position, {
                        dimension: player.dimension,
                        drawDistance: 10,
                        los: true
                      })
                    })
                    player.notify('~g~İsim levhası oluşturuldu');
                    q();
                  })
                }
              })
              admin_labels.map((item, index) => {
                if (!mp.labels.exists(item.label)) return admin_labels.splice(index, 1);
                submenu.newItem({
                  name: `${item.label.text} [USER: ${item.user}]`,
                  more: `${methods.distanceToPos(player.position, item.label.position).toFixed(0)}m`,
                  desc: 'Ölçme: ' + item.label.dimension,
                  onpress: () => {
                    let submenu3 = menu.new(player, "Eylemler");
                    submenu3.newItem({
                      name: "Işınlanma",
                      onpress: () => {
                        if (!mp.labels.exists(item.label)) {
                          admin_labels.splice(index, 1);
                          player.notify('~r~Tabela gitmiş');
                          q();
                          return;
                        }
                        user.teleportVeh(player, item.label.position.x, item.label.position.y, item.label.position.z);
                      }
                    })
                    submenu3.newItem({
                      name: "~r~Удалить",
                      onpress: () => {
                        if (!mp.labels.exists(item.label)) {
                          admin_labels.splice(index, 1);
                          player.notify('~r~Tabela gitmiş');
                          q();
                          return;
                        }
                        user.accept(player, "Вы уверены?").then(status => {
                          if (!status) return q();
                          if (!mp.labels.exists(item.label)) {
                            admin_labels.splice(index, 1);
                            player.notify('~r~Tabela gitmiş');
                            q();
                            return;
                          }
                          item.label.destroy();
                          admin_labels.splice(index, 1);
                          player.notify('~r~Tabela kaldırılmıştır');
                          q();
                        })
                      }
                    })
                    submenu3.open();
                  }
                })
              })
              submenu.open();
            }
            q();
          }
        })
      }
      m.newItem({
        name: "Veri hata ayıklama",
        onpress: () => debugData(player)
      })
      m.newItem({
        name: "~o~Oyun verileri",
        onpress: () => gameData(player)
      })
      if (user.getAdminLevel(player) == 6) {
        m.newItem({
          name: "~r~Herkese bir Ödeme Günü yayınlayın",
          onpress: () => {
            user.accept(player, "Emin misin?").then(status => {
              mainMenu(player)
              if (!status) return;
              player.notify(`~g~Ödeme herkese verilebilir`)
              mp.players.forEach(nplayer => {
                user.payDay(nplayer);
              })
              user.log(player, "AdminJob", "Herkese ödeme dağıtıldı")
            })
          }
        })
        m.newItem({
          name: "~o~Promosyon kodları",
          onpress: () => {
            let submenu = menu.new(player, "Promosyon kodları")
            submenu.newItem({
              name: "~o~Promosyon kodu istatistikleri (Medya)",
              onpress: () => {
                menu.input(player, "Promosyon kodunu girin").then(promo => {
                  if (!promo) return;
                  userEntity.count({ where: { promocode: promo } }).then(count => {
                    player.notify("Aktivasyon sayısı: " + count)
                    submenu.open();
                  })
                })
              }
            })
            submenu.newItem({
              name: "~o~Promosyon kodu (Normal) istatistikler",
              onpress: () => {
                menu.input(player, "Promosyon kodunu girin").then(promo => {
                  if (!promo) return;
                  promocodeUsingEntity.count({ where: { promocode_name: promo } }).then(count => {
                    player.notify("Aktivasyon sayısı: " + count)
                    submenu.open();
                  })
                })
              }
            })

            submenu.newItem({
              name: "~g~Bir etkinlik promosyon kodu oluşturun",
              onpress: () => {
                let submenu2 = menu.new(player, "Ayarlar");
                let range = 1;
                let los = true;
                let sum = 1000;
                submenu2.newItem({
                  name: "Çekim mesafesi",
                  type: "range",
                  rangeselect: [1, 100],
                  onchange: (val) => {
                    range = val + 1;
                  }
                })
                submenu2.newItem({
                  name: "Duvarın arkasını görebiliyor musun?",
                  type: "list",
                  list: ["~g~Göremiyorum.", "~g~Bakın"],
                  onchange: (val) => {
                    los = !!val;
                  }
                })
                submenu2.newItem({
                  name: "Tutar bin olarak",
                  type: "range",
                  rangeselect: [1, 100],
                  onchange: (val) => {
                    sum = (val + 1) * 1000;
                  }
                })
                submenu2.newItem({
                  name: "~g~Koşmak",
                  onpress: () => {
                    createTempPromocode(player, sum, range, los)
                    player.notify('Etkinlik promosyon kodu oluşturuldu')
                    mainMenu(player);
                  }
                })
                submenu2.newItem({
                  name: "~r~İptal",
                  onpress: () => {
                    mainMenu(player)
                  }
                })
                submenu2.open();
              }
            })
            submenu.newItem({
              name: "Promosyonel etkinlik kodlarının listesi",
              onpress: () => {
                let submenu2 = menu.new(player, "Etkinlik promosyon kodları", "Liste");
                tempPromocodes.forEach((item, code) => {
                  submenu2.newItem({
                    name: code,
                    more: `$${methods.numberFormat(item.sum)} | ${player.dist(item.label.position).toFixed(0)}m`,
                    onpress: () => {
                      let submenuit = menu.new(player, "Eylemler", `${code} $${methods.numberFormat(item.sum)}`);
                      submenuit.newItem({
                        name: "Işınlanma",
                        onpress: () => {
                          if (!mp.labels.exists(item.label) || !tempPromocodes.has(code)) return player.notify(`~r~Promosyon kodu artık mevcut değil`), mainMenu(player);
                          user.teleport(player, item.label.position.x, item.label.position.y, item.label.position.z, null, item.label.dimension)
                        }
                      })
                      submenuit.newItem({
                        name: "~r~Silme",
                        onpress: () => {
                          if (!mp.labels.exists(item.label) || !tempPromocodes.has(code)) return player.notify(`~r~Promosyon kodu artık mevcut değil`), mainMenu(player);
                          item.label.destroy();
                          tempPromocodes.delete(code);
                          player.notify('~g~Promosyon kodu kaldırıldı');
                          mainMenu(player);
                        }
                      })

                      submenuit.open();
                    }
                  })
                })
                submenu2.open();
              }
            })

            submenu.newItem({
              name: "~g~Oluştur",
              onpress: () => {
                menu.input(player, "Promosyon kodu adını girin").then(promo => {
                  if (!promo) return submenu.open();

                  promocodeEntity.count({ where: { code: promo } }).then(count => {
                    if (count > 0) return player.notify("~r~Bu promosyon kodu zaten oluşturulmuş ve aktiftir");
                    promocodeUsingEntity.count({ where: { promocode_name: promo } }).then(count2 => {
                      if (count2 > 0) return player.notify("~r~Bu promosyon kodu zaten başka biri tarafından girilmiş");
                      menu.input(player, "Bonus miktarını girin", "", 6, "int").then(sum => {
                        if (isNaN(sum) || sum <= 0) return player.notify("~r~Girilen miktar yanlış")
                        promocodeEntity.create({
                          code: promo,
                          bonus: sum
                        }).then(() => {
                          player.notify('~g~Promosyon kodu oluşturuldu')
                          mainMenu(player);
                        })
                      });
                    })
                  })
                })
              }
            })
            submenu.newItem({
              name: "~b~Promosyon kod listesi",
              onpress: () => {
                const l = () => {
                  promocodeEntity.findAll().then(list => {
                    let submenu2 = menu.new(player, "Promosyon kod listesi")
                    submenu2.onclose = () => { mainMenu(player); }
                    list.map(item => {
                      submenu2.newItem({
                        name: item.code,
                        more: item.bonus + "$",
                        onpress: () => {
                          let submenu3 = menu.new(player, "Eylem")
                          submenu3.newItem({
                            name: "Aktivasyon sayısı",
                            onpress: () => {
                              promocodeUsingEntity.count({ where: { promocode_name: item.code } }).then(count => {
                                player.notify("Aktivasyon sayısı: " + count)
                              })
                            }
                          })
                          submenu3.newItem({
                            name: "~r~Promosyon kodunu sil",
                            onpress: () => {
                              user.accept(player, "Emin misin?").then(status => {
                                if (!status) return submenu3.open();
                                promocodeEntity.destroy({ where: { id: item.id } }).then(() => {
                                  player.notify('~g~Promosyon kodu kaldırıldı')
                                  l();
                                })
                              })
                            }
                          })
                          submenu3.open();
                        }
                      })
                    })
                    submenu2.open();
                  })
                }
                l();
              }
            })
            submenu.open();
          }
        })

      }
      if (user.getAdminLevel(player) >= 5) {
        m.newItem({
          name: "~r~Bir oyuncuyu Kara Listeye alın",
          desc: "",
          onpress: () => {
            menu.input(player, "Hesap ID Sini girin", "", 11, "int").then(ids => {
              if (!ids) return;
              let id = methods.parseInt(ids);
              if (isNaN(id) || id < 0) return player.notify("~r~ID doğru değil");
              user.checkIdUser(id).then(rank => {
                if (rank == -1) return player.notify("~r~ID tespit edilmedi");
                if (rank == 6) return player.notify("~r~Bu kişiyi Kara Liste'ye koyamazsınız");
                userEntity.findOne({ where: { id: id } }).then(usr => {
                  const lic = usr.lic;
                  const guid = usr.name;
                  const rgscId = usr.rgscid;
                  blackListEntity.findOne({ where: { lic, guid } }).then(q => {
                    if (q) return player.notify("~r~Kullanıcı zaten KaraListe'de")
                    menu.input(player, "Sebebini girin", "", 150, "textarea").then(reason => {
                      if (!reason) return player.notify("~r~Bir neden girilmelidir");
                      user.accept(player, "Emin misin?").then(status => {
                        if (!status) return;
                        const target = user.getPlayerById(id);
                        blackListEntity.create({
                          lic: usr.lic,
                          reason: `${reason} [Ödünç ${user.getRpName(player)} (${user.getId(player)})]`,
                          guid: usr.name,
                          rgscId: target ? target.clientSocial : rgscId ? rgscId : 0
                        }).then(() => {
                          player.notify("~g~Kullanıcı KaraListe'de")
                          methods.saveLog("addBlackList", user.getId(player) + " kara listeye alındı " + id + " " + guid + " " + lic)
                          user.log(player, "AdminJob", "kara liste'ye alındı @user" + id + " " + guid + " " + lic)
                        })

                      })
                    })
                  })
                });
              })
            });
          }
        })
        m.newItem({
          name: "~y~Bir oyuncuyu Kara Liste'ten kaldırma",
          desc: "",
          onpress: () => {
            menu.input(player, "Hesap ID girin", "", 11, "int").then(ids => {
              if (!ids) return;
              let id = methods.parseInt(ids);
              if (isNaN(id) || id < 0) return player.notify("~r~ID doğru değil");
              userEntity.findOne({ where: { id: id } }).then(usr => {
                if (!usr) return player.notify("~r~Oyuncu tespit edilmedi");
                const lic = usr.lic;
                const guid = usr.name;
                blackListEntity.findOne({
                  where: {
                    [Op.or]: [{ lic }, { guid }]
                  }
                }).then((itm) => {
                  if (!itm) return player.notify("~r~Kullanıcı kara Liste'te bulunamadı")
                  itm.destroy();
                  user.log(player, "AdminJob", "Kara Liste'den çıkarıldı @user" + id + " " + guid + " " + lic)
                  return player.notify("~r~Kullanıcı Kara Liste'den çıkarıldı")
                })
              });
            });
          }
        })
      }
      if (methods.isTestServer() && user.isAdminNow(player, 6)) {
        m.newItem({
          name: "~g~Sosyal'i erişime açın",
          desc: "",
          onpress: () => {
            menu.input(player, "Sosyal Giriş", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (whitelist.list.includes(social)) return player.notify("~r~Çoktan eklendi")
              else whitelist.new(player, social), player.notify("~g~Başarıyla eklendi")
            });
          }
        })
        m.newItem({
          name: "~r~Sosyal'i erişimden kaldırın",
          desc: "",
          onpress: () => {
            menu.input(player, "Sosyal Giriş", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (!whitelist.list.includes(social)) return player.notify("~r~Sosyal girilmemiştir")
              else whitelist.remove(social), player.notify("~g~Başarıyla kaldırıldı")
            });
          }
        })
      } else if (user.isAdmin(player, 5)) {
        m.newItem({
          name: "~g~Sosyal Kara Listeyi Beyaz Listeye Alma",
          desc: "Bu Sosyal özelliğe sahip bir oyuncu her zaman",
          onpress: () => {
            menu.input(player, "Sosyal Medya'ya Girin", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (whitelist.list.includes(social)) return player.notify("~r~Çoktan eklendi")
              else whitelist.new(player, social), player.notify("~g~Başarıyla eklendi")
            });
          }
        })
        m.newItem({
          name: "~r~Sosyal'i Kara Listeden Çıkarın",
          desc: "",
          onpress: () => {
            menu.input(player, "Sosyal Medya'ya Girin", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (!whitelist.list.includes(social)) return player.notify("~r~Sosyal girilmemiştir")
              else whitelist.remove(social), player.notify("~g~Başarıyla kaldırıldı")
            });
          }
        })
      }
      if (user.getAdminLevel(player) == 6) {
        m.newItem({
          name: "Socket.IO",
          onpress: () => {
            let submenu = menu.new(player, "Sistemi açma");
            submenu.workAnyTime = true;
            submenu.onclose = () => { mainMenu(player) }
            submenu.newItem({
              name: "Rastgele oyuncuların üçte birini dahil edin",
              onpress: () => {
                user.accept(player, "Emin misin?").then(status => {
                  if (!status) return;
                  user.accept(player, "Bundan emin misiniz?").then(status2 => {
                    if (!status2) return;
                    let count = 0;

                    mp.players.forEach((target) => {
                      if (user.isLogin(target) && target.socket) {
                        count++
                      }
                    })
                    if (mp.players.length / 3 <= count) return player.notify("~r~Socket.IO zaten oyuncuların üçte birine dahil edildi")
                    mp.players.forEach((target) => {
                      if (user.isLogin(target) && !target.socket) {
                        socketInit(target)
                      }
                    })

                  })
                })
              }
            })
            submenu.newItem({
              name: "Tümünü dahil et",
              onpress: () => {
                user.accept(player, "Emin misin?").then(status => {
                  if (!status) return;
                  user.accept(player, "Bundan emin misiniz?").then(status2 => {
                    if (!status2) return;
                    mp.players.forEach((target) => {
                      if (user.isLogin(target) && !target.socket) {
                        socketInit(target)
                      }
                    })
                  })
                })
              }
            })
            submenu.newItem({
              name: "Включить админам",
              onpress: () => {
                user.accept(player, "Вы уверены?").then(status => {
                  if (!status) return;
                  user.accept(player, "Bundan emin misiniz?").then(status2 => {
                    if (!status2) return;
                    mp.players.forEach((target) => {
                      if (user.isAdminNow(target) && !target.socket) {
                        socketInit(target)
                      }
                    })
                  })
                })

              }
            })
            submenu.newItem({
              name: "Bir oyuncuyu ID'ye göre etkinleştirin",
              onpress: () => {
                menu.input(player, "Oyuncu ID girin", "", 5, "int").then((id) => {
                  let target = user.getPlayerById(id);
                  if (!target) return player.notify("~r~Oyuncu tespit edilmedi");
                  if (target.socket) return player.notify("~r~Socket.IO bu oynatıcıda zaten etkin");
                  socketInit(target);
                })
              }
            })
            submenu.open()
          }
        })
        m.newItem({
          name: "~b~Fonksiyonların yapılandırılması",
          more: "X2 ve daha fazlası",
          onpress: () => {
            customEnable(player)
          }
        })
        if (["XanderWP", "StrafeElite"].includes(player.socialClub))
          m.newItem({
            name: "~g~Hesap şifresi değişikliği",
            desc: "Yeni bir parola girin ve veritabanında üzerine yazın",
            onpress: () => {
              menu.input(player, "Hesap ID girin", "", 11, "int").then(ids => {
                if (!ids) return;
                let id = methods.parseInt(ids);
                if (isNaN(id) || id < 0) return player.notify("~r~ID Doğru değil");
                user.checkIdUser(id).then(rank => {
                  if (rank == -1) return player.notify("~r~ID Tespit edilmedi");
                  if (rank == 6 && id != user.getId(player)) return player.notify("~r~Bu hesabın parolasını değiştiremezsiniz");
                  menu.input(player, "Yeni bir hesap şifresi girin", "", 150, "textarea").then(passwd => {
                    if (!passwd) return;
                    let pass = methods.sha256(String(passwd.replace(/"/g, "'")
                      .replace(/^\s\s*/, '')
                      .replace(/\s\s*$/, '')))
                    menu.input(player, "Gerekirse şifreyi kopyalayın", pass, 150, "textarea").then(() => {
                      user.accept(player, "Şifrenizi mi değiştirdiniz?").then(status => {
                        if (status) {
                          userEntity.update({
                            password: pass
                          }, {
                            where: {
                              id: id
                            }, limit: 1
                          }).then(() => {
                            player.notify("~g~Veritabanında parolanın üzerine yazıldı")
                            user.log(player, "AdminJob", "için şifreyi yeniden yazdı @user" + id)
                          })
                        }
                      })
                    });
                  });
                })
              });
            }
          })
        m.newItem({
          name: "~b~Sistemlerin açılması",
          onpress: () => {
            systemEnable(player)
          }
        })

        m.newItem({
          name: "~r~Proje montajı",
          desc: "Otomatik yeniden başlatmada kaynak montajını etkinleştir",
          more: restartConf.status ? 'Dahil' : "Kapalı",
          onpress: () => {
            restartConf.set(!restartConf.status)
            player.notify('Parametre ' + (restartConf.status ? 'Dahil' : "Kapalı"))
            mainMenu(player)
          }
        })
        if (methods.isTestServer()) {
          m.newItem({
            name: "~r~Bir güncelleme dökülüyor",
            desc: "Ne yapacağınızı ve nasıl yapacağınızı seçin",
            onpress: () => {
              let submenu = menu.new(player, "Bir eylem seçin");
              submenu.onclose = () => { mainMenu(player) }
              let selectedStatus = {
                gitpull: 0,
                npmi: 0,
                client: 0,
                server: 0,
                web: 0,
                reboot: 0
              };
              submenu.newItem({
                name: "Depodan indirin",
                type: "list",
                list: ["Uyum sağlamada başarısızlık", "Koşmak"],
                onchange: (value) => selectedStatus.gitpull = value
              })
              submenu.newItem({
                name: "NPM modüllerinin kurulumunu gerçekleştirin",
                type: "list",
                list: ["Uyum sağlamada başarısızlık", "Koşmak"],
                onchange: (value) => selectedStatus.npmi = value
              })
              submenu.newItem({
                name: "Müşteri yapısını yürütme",
                type: "list",
                list: ["Uyum sağlamada başarısızlık", "Koşmak"],
                onchange: (value) => selectedStatus.client = value
              })
              submenu.newItem({
                name: "Bir sunucu derlemesi gerçekleştirin",
                type: "list",
                list: ["Uyum sağlamada başarısızlık", "Koşmak"],
                onchange: (value) => selectedStatus.server = value
              })
              submenu.newItem({
                name: "Bir arayüz derlemesini yürütme",
                type: "list",
                list: ["Uyum sağlamada başarısızlık", "Koşmak"],
                onchange: (value) => selectedStatus.web = value
              })
              submenu.newItem({
                name: "Tüm adımları tamamladıktan sonra sunucuyu yeniden başlatın",
                type: "list",
                list: ["Uyum sağlamada başarısızlık", "Koşmak"],
                onchange: (value) => selectedStatus.reboot = value
              })

              submenu.newItem({
                name: "Seçilen eylemleri gerçekleştirin",
                onpress: () => {
                  user.accept(player, "Emin misin?").then(status => {
                    if (!status) return mainMenu(player);
                    if (runTestExec) return player.notify("~r~Komut zaten devam ediyor")
                    let commands: string[] = [];
                    commands.push('cd /ragemp');
                    if (selectedStatus.gitpull) commands.push('git pull');
                    if (selectedStatus.npmi) commands.push('npm i');
                    if (selectedStatus.client) commands.push('npm run build:client');
                    if (selectedStatus.server) commands.push('npm run build:server');
                    if (selectedStatus.web) commands.push('npm run build:web');
                    if (selectedStatus.reboot) commands.push('pm2 restart ragemp');
                    commands.push('chmod +x ./server');
                    runTestExec = true;
                    player.notify(`~g~Yürütme için gönderilen komut`)
                    if (selectedStatus.reboot) player.notify(`Komut yürütüldükten sonra sunucu yeniden başlatılacaktır`);
                    else player.notify("Sonuçlar size bildirilecektir");
                    exec(`${commands.join(' && ')}`, () => {
                      if (mp.players.exists(player)) player.notify(`~g~Komut başarıyla yürütüldü`)
                      runTestExec = false;
                    });
                    mainMenu(player)
                  })
                }
              })

              submenu.open()
            }
          })
        }
      }
      if (user.isAdminNow(player, 5)) {
        m.newItem({
          name: "~r~Sunucu yeniden başlatma",
          desc: "Zamanlayıcı ile sunucu yeniden başlatma",
          onpress: () => {
            rebootServer(player)
          }
        })
      }

      m.newItem({
        name: "~r~Kapatın ~y~Yönetici modu",
        onpress: () => {
          player.setVariable('enableAdmin', false);
          player.notify("~r~Yönetici modu devre dışı");
          user.log(player, "AdminJob", "Yönetim ofisi kapatıldı")
          mainMenu(player)
        }
      })
    }
  }


  m.open();
}







let restartTimer = 0;
let restartReason = "";

export const isRestarting = () => {
  return restartTimer > 0
}

export function restartProtocol(time: number, reason: string) {
  restartTimer = time;
  restartReason = reason;
  let int: any = setInterval(() => {
    if (restartTimer == 0) return clearInterval(int);
    restartTimer--;
    if (restartTimer == 0) {
      mp.players.forEach(function (p) {
        if (mp.players.exists(p)) p.lastSave = null;
      });
      methods.saveAll();
      setTimeout(() => {
        mp.players.forEach(function (p) {
          if (mp.players.exists(p)) user.kick(p, 'Sunucu yeniden başlatma: ' + restartReason);
        });
        setTimeout(() => {
          methods.restartServer();
        }, 10000);
      }, 5000);
      return;
    }
    mp.players.forEach(player => {
      if (user.isLogin(player)) {
        player.notify(`~r~Sunucu şu yolla yeniden başlatılır ${restartTimer} Dakika\n${(restartTimer % 5 == 0) ? `Nedeni - ${restartReason}` : ''}`);
      }
    })
  }, 60000)
}

function rebootServer(player: PlayerMp) {
  if (!user.isAdminNow(player) || user.getAdminLevel(player) < 5) return;
  let m = menu.new(player, "Sunucu yeniden başlatma", "Liste")
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  let min: string[] = [];
  for (let q = 0; q < 120; q++) min.push(q.toString() + " Dakika");
  m.newItem({
    name: "Dakika sayısı",
    type: "list",
    list: min,
    onpress: (item) => {
      if (restartTimer) return player.notify("Yeniden başlatma çoktan başladı")
      if (!item.listSelected) return;
      user.accept(player, "Emin misin?").then(status => {
        if (status) {
          user.accept(player, "Bundan emin misiniz?").then(status2 => {
            if (status2) {
              menu.input(player, "Sebebini belirtin", "", 150, "textarea").then(reason => {
                if (reason) {
                  player.notify("Nedeni: " + reason)
                  user.accept(player, "Hazır mısın?").then(status3 => {
                    if (status3) {
                      restartProtocol((item.listSelected + 1), reason)
                      user.log(player, "AdminJob", "Sunucu yeniden başlatma prosedürü başlatıldı. Zaman: " + (item.listSelected + 1) + " Nedeni: " + reason)
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
  m.newItem({
    name: "~r~İptal",
    onpress: () => mainMenu(player)
  })
  m.open()
}

function systemEnable(player: PlayerMp) {
  if (!user.isAdminNow(player) || user.getAdminLevel(player) < 6) return;
  let m = menu.new(player, "Sistemlerin açılması", "Liste")
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  for (let name in enabledSystem) {
    m.newItem({
      name,
      more: enabledSystem[name] ? "~g~Dahil" : "Kapalı",
      onpress: () => {
        enabledSystem[name] = !enabledSystem[name];
        if (enabledSystem[name]) player.notify("~g~Dahil")
        else player.notify("~r~Devre dışı bırakıldı")
      }
    })
  }
  m.open()
}

async function gangwarzone(player: PlayerMp, zone?: gangWarsZoneEntity) {
  let m = menu.new(player, "Savaş bölgesini kurma", "Liste")
  m.workAnyTime = true;
  m.onclose = () => { gameData(player); }
  if (!zone) zone = (await gangWarsZoneEntity.findAll()).find(item => methods.distanceToPos2D(player.position, item.position) <= item.position.d)
  if (zone) {
    m.newItem({
      name: "~b~Mevcut bölge",
      more: zone.name,
      onpress: () => {
        let submenu = menu.new(player, zone.name, "Eylemler")
        submenu.workAnyTime = true;
        submenu.onclose = () => { gangwarzone(player, zone); }
        submenu.newItem({
          name: "Bölge başına teknik destek",
          onpress: () => {
            user.teleport(player, zone.position.x, zone.position.y, zone.position.z)
          }
        })
        submenu.newItem({
          name: "Etiket",
          onpress: () => {
            user.setWaypoint(player, zone.position.x, zone.position.y)
            player.notify('~g~Etiket ayarlandı')
          }
        })
        submenu.newItem({
          name: "~r~Silme",
          onpress: () => {
            user.accept(player, "Silmek mi?").then(status => {
              if (!status) return submenu.open();
              zone.destroy().then(() => {
                reloadGangWarZones()
                player.notify(`~g~Bölge kaldırıldı`);
                gangwarzone(player, zone);
              });
            })
          }
        })
        submenu.newItem({
          name: "~b~Yeniden Adlandır",
          onpress: async () => {
            let name = await menu.input(player, "Başlık", zone.name);
            if (!name) return gangwarzone(player, zone);
            zone.name = name;
            zone.save().then(() => {
              player.notify('~g~Bölge korunur')
              gangwarzone(player, zone);
              reloadGangWarZones()
            });
          }
        })
        submenu.newItem({
          name: "Sahibini belirtin",
          more: zone.owner ? fractionUtil.getFractionName(zone.owner) : "Hiç kimse",
          onpress: async () => {
            menu.selectFraction(player).then(id => {
              if (!id) return gangwarzone(player, zone);
              zone.owner = id;
              zone.save().then(() => {
                player.notify('~g~Bölge korunur')
                gangwarzone(player, zone);
                reloadGangWarZones()
              });
            })
          }
        })
        submenu.newItem({
          name: "Cevap bu mu?",
          more: zone.resp ? '~g~Evet' : '~b~Hayır',
          onpress: async () => {
            user.accept(player, "Durum değişikliği mi?").then(id => {
              if (!id) return gangwarzone(player, zone);
              zone.resp = zone.resp ? 0 : 1;
              zone.save().then(() => {
                player.notify('~g~Bölge korunur')
                gangwarzone(player, zone);
                reloadGangWarZones()
              });
            })
          }
        })
        submenu.open()
      }
    })
    m.newItem({
      name: "Yeni alan",
      type: "list",
      list: ["Yukarıda", "Sağ üstte", "Sağ tarafta", "Sağ alt", "Aşağıdan", "Sol alttan", "Soldan", "Sol üst"],
      onpress: async (item) => {
        let name = await menu.input(player, "Başlık");
        if (!name) return gangwarzone(player, zone);
        let newcoord = { ...zone.position };
        if (item.listSelected == 0 || item.listSelected == 1 || item.listSelected == 7)
          newcoord.y += (zone.position.d + 1);
        else if (item.listSelected == 3 || item.listSelected == 4 || item.listSelected == 5)
          newcoord.y -= (zone.position.d + 1);

        if (item.listSelected == 1 || item.listSelected == 2 || item.listSelected == 3)
          newcoord.x += (zone.position.d + 1);
        else if (item.listSelected == 5 || item.listSelected == 6 || item.listSelected == 7)
          newcoord.x -= (zone.position.d + 1);

        let newcoordq = {
          x: newcoord.x,
          y: newcoord.y,
          z: newcoord.z,
          d: newcoord.d,
        }
        let zoneExist = (await gangWarsZoneEntity.findAll()).find(item => methods.distanceToPos2D(newcoord, item.position) <= item.position.d);
        if (zoneExist) {
          player.notify(`~r~Yakınlarda zaten bir alan var ${zoneExist.name}, ve oluşturmaya çalıştığımız yeni bölge ile çakışıyor.`)
          gangwarzone(player, zone)
          return;
        }
        gangWarsZoneEntity.create({
          owner: 0,
          name,
          position: newcoordq
        }).then(() => {
          reloadGangWarZones()
          player.notify('~g~Bölge kurulur');
          gangwarzone(player, zone)
        })
      }
    })
  } else {
    m.newItem({
      name: "Koordinatlarımdaki yeni bölge",
      onpress: async () => {
        let name = await menu.input(player, "Başlık");
        if (!name) return gangwarzone(player, zone);
        let newcoord = { ...player.position, d: baseDzone };
        let newcoordq = {
          x: newcoord.x,
          y: newcoord.y,
          z: newcoord.z,
          d: newcoord.d,
        }
        let zoneExist = (await gangWarsZoneEntity.findAll()).find(item => methods.distanceToPos2D(newcoord, item.position) <= item.position.d);
        if (zoneExist) {
          player.notify(`~r~Yakınlarda zaten bir alan var ${zoneExist.name}, ve oluşturmaya çalıştığımız yeni bölge ile çakışıyor.`)
          gangwarzone(player, zone)
          return;
        }
        gangWarsZoneEntity.create({
          owner: 0,
          name,
          position: newcoordq
        }).then(() => {
          reloadGangWarZones()
          player.notify('~g~Bölge kurulur');
          gangwarzone(player, zone)
        })
      }
    })
  }
  let list = await gangWarsZoneEntity.findAll();
  m.newItem({
    name: "Bölgelerin listesi",
    more: `x${list.length}`,
    onpress: async () => {
      let submenu = menu.new(player, "Bölgelerin listesi")
      submenu.onclose = () => { gangwarzone(player, zone); }
      submenu.workAnyTime = true;
      list.map(item => {
        submenu.newItem({
          name: item.name,
          more: `В: ${item.owner ? fractionUtil.getFractionName(item.owner) : "Hiç kimse"} | Р: ${item.resp == 1 ? 'Evet' : 'Hayır'}`,
          onpress: () => {
            gangwarzone(player, item);
          }
        })
      })
      submenu.open()
    }
  })
  m.open();
}


function gameData(player: PlayerMp) {
  if (!user.isAdminNow(player)) return;

  let m = menu.new(player, "Oyun verileri", "Liste")
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  if (user.getAdminLevel(player) >= 5) {
    m.newItem({
      name: "~b~Envantere uzaktan erişim",
      onpress: () => {
        menu.selector(player, "Bir kategori seçin", ["Oyuncu", "Plakaya göre araba", "Makine (ID envanteri)"], true).then(cat => {
          if (typeof cat != "number") return gameData(player);
          menu.input(player, "Girin " + (cat == 0 ? "ID Kimliği" : "Araç ruhsat plakası")).then(ids => {
            if (!ids) return gameData(player);
            let id = cat == 0 ? methods.parseInt(ids) : cat == 1 ? methods.convertNumberToHash(ids) : methods.parseInt(ids);
            menu.close(player);
            inventory.openInventory(player, cat == 0 ? 1 : 8, id)
          })
        })
      }
    })
  }
  m.newItem({
    name: "~b~Park noktalarının kurulması",
    onpress: () => {
      spawnParkMenu(player)
    }
  })
  m.newItem({
    name: "~y~Araba hızlarının ayarlanması",
    onpress: () => {
      vehicleSpeed(player)
    }
  })
  if (user.getAdminLevel(player) >= 6) {
    m.newItem({
      name: "~y~Çeteler için bir savaş alanı kurmak",
      onpress: () => {
        gangwarzone(player)
      }
    })
    m.newItem({
      name: "~r~Hazine Editörü",
      onpress: () => {
        const ms = () => {

          let submenu = menu.new(player, "Hazine Bakanlığı")
          submenu.workAnyTime = true;
          submenu.onclose = () => { gameData(player) }
          submenu.newItem({
            name: "Denge",
            more: coffer.getMoney() + "$"
          })
          submenu.newItem({
            name: "Fonları yatırın",
            onpress: () => {
              menu.input(player, "Tutarı girin", "", 6, "int").then(sum => {
                if (sum == null) return ms();
                if (sum <= 0) {
                  player.notify(`~r~Tutar 0'dan büyük olmalıdır`)
                  return ms();
                }
                coffer.addMoney(sum);
                user.log(player, "AdminJob", "Положил в казну " + sum)
                player.notify("~g~Bitti")
                ms();
              })
            }
          })
          submenu.newItem({
            name: "Para Çekme",
            onpress: () => {
              menu.input(player, "Tutarı girin", "", 6, "int").then(sum => {
                if (sum == null) return ms();
                if (sum <= 0) {
                  player.notify(`~r~Tutar 0'dan büyük olmalıdır`)
                  return ms();
                }
                user.log(player, "AdminJob", "Kanepeden aldım. " + sum)
                coffer.removeMoney(sum);
                player.notify("~g~Bitti")
                ms();
              })
            }
          })

          submenu.newItem({
            name: "Сумма пособия",
            more: coffer.getPosob(),
            onpress: () => {
              menu.input(player, "Tutarı girin", coffer.getPosob().toString(), 8, "int").then(sum => {
                if (sum == null) return ms();
                if (sum <= 0) {
                  player.notify(`~r~Tutar 0'dan büyük olmalıdır`)
                  return ms();
                }
                user.log(player, "AdminJob", "Ödenek miktarını ayarlayın " + sum)
                coffer.setPosob(sum);
                player.notify("~g~Bitti")
                ms();
              })
            }
          })
          submenu.newItem({
            name: "Emekli maaşı miktarı",
            more: coffer.getMoneyOld(),
            onpress: () => {
              menu.input(player, "Tutarı girin", coffer.getMoneyOld().toString(), 8, "int").then(sum => {
                if (sum == null) return ms();
                if (sum <= 0) {
                  player.notify(`~r~Tutar 0'dan büyük olmalıdır`)
                  return ms();
                }
                user.log(player, "AdminJob", "Emekli maaşı miktarını ayarlayın " + sum)
                coffer.setMoneyOld(sum);
                player.notify("~g~Bitti")
                ms();
              })
            }
          })
          submenu.newItem({
            name: "Vergi",
            more: coffer.getNalog() + "%",
            onpress: () => {
              menu.input(player, "Tutarı girin", coffer.getNalog().toString(), 6, "int").then(sum => {
                if (sum == null) return ms();
                if (sum <= 0 || sum >= 100) {
                  player.notify(`~r~Tutar 0'dan büyük ve 100'den küçük olmalıdır`)
                  return ms();
                }
                user.log(player, "AdminJob", "Vergi yüzdesini ayarlayın" + sum)
                coffer.setNalog(sum);
                player.notify("~g~Bitti")
                ms();
              })
            }
          })

          submenu.open();
        }
        ms();
      }
    })
    m.newItem({
      name: "~r~Sunucu üzerinde zaman yönetimi",
      onpress: () => {
        timeEdit(player)
      }
    })

    if (user.isAdminNow(player, 6)) {
      m.newItem({
        name: "~b~Tüm öğeleri item_id'ye göre say",
        onpress: () => {

          menu.input(player, "ID girin", "", 6, "int").then(async id => {
            if (typeof id != "number") return gameData(player);
            let itemscount: number = 0;
            itemsDB.forEach(item => {
              if (item.item_id == id) {
                itemscount++
              }
            })
            player.notify('Miktar ' + items.getItemNameById(id) + ' -> ' + itemscount)
          })
        }
      })
      m.newItem({
        name: "~r~Tüm öğeleri item_id'ye göre kaldır",
        onpress: () => {
          user.accept(player, "Bunu yapmak istediğine emin misin?").then(status => {
            if (!status) return gameData(player);
            menu.input(player, "ID girin", "", 6, "int").then(async id => {
              if (typeof id != "number") return gameData(player);
              let itemname = items.getItemNameById(id);
              let check = await user.accept(player, "(1/5) Silmek istediğinizden emin misiniz? " + itemname + '?');
              if (!check) return gameData(player);
              check = await user.accept(player, "(2/5) Silmek istediğinizden emin misiniz? " + itemname + '?');
              if (!check) return gameData(player);
              check = await user.accept(player, "(3/5) Silmek istediğinizden emin misiniz? " + itemname + '?');
              if (!check) return gameData(player);
              check = await user.accept(player, "(4/5) Silmek istediğinizden emin misiniz? " + itemname + '?');
              if (!check) return gameData(player);
              check = await user.accept(player, "(5/5) Silmek istediğinizden emin misiniz? " + itemname + '?');
              if (!check) return gameData(player);
              let itemidsList: number[] = [];
              itemsDB.forEach(item => {
                if (item.item_id == id) {
                  itemidsList.push(item.id);
                  itemsDB.delete(item.id);
                }
              })
              inventory.allInventoryBlocksDataClear()
              inventoryEntity.destroy({
                where: {
                  id: { [Op.in]: itemidsList }
                }
              })
            })
          })
        }
      })
    }
    m.newItem({
      name: "~b~İşletmeler",
      onpress: () => {

        let submenu = menu.new(player, "İşletmeler")
        submenu.workAnyTime = true;
        submenu.onclose = () => { gameData(player) }
        submenu.newItem({
          name: "~b~Ofis ekle",
          onpress: () => {
            newBiz(player)
          }
        })

        submenu.newItem({
          name: "~b~İş akışını değiştirin",
          onpress: () => {
            menu.input(player, "İşletme ID Girin", "", 5, "int").then(id => {
              let biz = business.get(id, 'price_card2');
              if (biz == null) {
                player.notify("~r~ID doğru değil");
                submenu.open();
                return;
              }
              menu.selector(player, "Pompalamayı seçin", ["Standart" + ((biz == 0) ? " ~g~Seçilmiş" : ""), "ОПГ" + ((biz == 3) ? " ~g~Seçildi" : ""), "ОПГ" + ((biz == 4) ? " ~g~Seçildi" : "")], true).then(status => {
                if (typeof status !== "number") {
                  player.notify("~r~İptal");
                  submenu.open();
                  return;
                }
                let selected = 0;
                if (status == 1) selected = 3;
                if (status == 2) selected = 4;
                let d = business.getData(id);
                d.price_card2 = selected
                d.save();
                player.notify("~r~Durum başarıyla değiştirildi");
                user.log(player, "AdminJob", "İş akışını değiştirdi @business" + id + " üzerinde " + selected)
                submenu.open();
              })
            })
          }
        })

        submenu.newItem({
          name: "~r~Bir işletmeyi silme",
          onpress: () => {
            menu.input(player, "İşletme ID girin", "", 30, "int").then(id => {
              if (!id) return;
              businessEntity.count({ where: { id } }).then(count => {
                if (count == 0) return player.notify("~r~Bu işletme mevcut değil");
                user.accept(player, "Emin misin?", business.getName(id)).then(async accept => {
                  if (!accept) return gameData(player);
                  accept = await user.accept(player, "Bundan emin misiniz?");
                  if (!accept) return gameData(player);
                  accept = await user.accept(player, "Emin misin?");
                  if (!accept) return gameData(player);
                  accept = await user.accept(player, "Kesinlikle emin misin?");
                  if (!accept) return gameData(player);
                  player.notify("~g~İş kaldırıldı")

                  business.delete(id, player)
                  gameData(player);
                })
              })
            })
          }
        })

        submenu.open();
      }
    })


    m.newItem({
      name: "Depolar",
      onpress: () => {
        let submenu = menu.new(player, "Depolar")
        submenu.workAnyTime = true;
        submenu.onclose = () => { gameData(player) }
        submenu.newItem({
          name: "~b~Tesis dışı bir kuruluş için bir depo ekleyin",
          onpress: () => {
            user.accept(player, "Durduğunuz yeri ekleyin?").then(status => {
              if (!status) return gameData(player);
              menu.input(player, "Bir ad girin, örneğin (Ordu Cephaneliği)", "", 30).then(name => {
                if (!name) return gameData(player);
                menu.selectFraction(player).then(fra => {
                  if (!fractionUtil.getFraction(fra)) return player.notify(`~r~İptal`), gameData(player)
                  const fraction = methods.parseInt(fra);
                  chest.create(player, name, fraction)
                  gameData(player)
                });
              });
            })
          }
        })
        submenu.newItem({
          name: "~r~Depoyu benim koordinatlarıma taşıyın",
          onpress: () => {
            let submenu = menu.new(player, "Bir depo seçin", "Liste")
            submenu.onclose = () => { gameData(player) };
            chest.pool.map(item => {
              submenu.newItem({
                name: item.id + " | " + item.name,
                more: item.settings.fraction + " | " + player.dist(item.position).toFixed(1) + "m.",
                onpress: () => {
                  user.accept(player, "Emin misin?").then(status => {
                    if (!status) return gameData(player)
                    item.position = new mp.Vector3(player.position.x, player.position.y, player.position.z - 1);
                    item.dimension = player.dimension;
                    item.save();
                    player.notify('~g~Deponun yeri değiştirildi');
                    return gameData(player);
                  })
                }
              })
            })
            submenu.open()
          }
        })
        submenu.newItem({
          name: "~r~Eski GOS depolarının yeni depolara taşınması",
          onpress: () => {
            user.accept(player, "Emin misin?").then(status => {
              if (!status) return gameData(player);
              let targetChests = [...oldChestPool].filter(([_, item]) => fractionUtil.getFraction(item.fraction).gos).map(item => { return item[1] })
              if (targetChests.length == 0) return player.notify("~r~Eski depolar yok"), gameData(player);
              targetChests.forEach(item => {
                chest.create(player, item.name, item.fraction).then(q => {
                  q.settings.weight = item.maxWeight;
                  q.settings.locked = false;
                  q.settings.accessList = []
                  setTimeout(() => {
                    q.position = item.pos
                    q.dimension = item.dimension
                    q.save();
                  }, 1000)
                  const whatInside = [...item.items]
                  q.settings.accessList = whatInside.map(qw => {
                    return {
                      id: methods.parseInt(qw.model),
                      rank: qw.rank,
                      timer: qw.personLimit
                    }
                  });
                  setTimeout(async () => {
                    for (let ida in whatInside) {
                      let qw = whatInside[ida];
                      inventory.createManyItem(methods.parseInt(qw.model), 0, inventory.types.StockFraction, q.id, qw.amount)
                      if (mp.players.exists(player)) player.notify(`~g~Öğelerin aktarılması ${q.name} Tamamlandı`)
                    }
                  }, 5000)
                  player.notify(`~g~Depo ${q.name} yeniden gönderildi`)
                  item.delete()
                })
              })
              player.notify(`~g~Eşyaların transferi kısa süre içinde gerçekleşecektir`)
            })
          }
        })
        submenu.newItem({
          name: "~r~Eski MAFYA depolarını yenilerine taşıyın",
          onpress: () => {
            user.accept(player, "Emin misin?").then(status => {
              if (!status) return gameData(player);
              let targetChests = [...oldChestPool].filter(([_, item]) => fractionUtil.getFraction(item.fraction).mafia).map(item => { return item[1] })
              if (targetChests.length == 0) return player.notify("~r~Eski depolar yok"), gameData(player);
              targetChests.forEach(item => {
                chest.create(player, item.name, item.fraction).then(q => {
                  q.settings.weight = item.maxWeight;
                  q.settings.locked = false;
                  q.settings.accessList = []
                  setTimeout(() => {
                    q.position = item.pos
                    q.dimension = item.dimension
                    q.save();
                  }, 1000)
                  const whatInside = [...item.items]
                  q.settings.accessList = whatInside.map(qw => {
                    return {
                      id: methods.parseInt(qw.model),
                      rank: qw.rank,
                      timer: qw.personLimit
                    }
                  });
                  setTimeout(async () => {
                    for (let ida in whatInside) {
                      let qw = whatInside[ida];
                      inventory.createManyItem(methods.parseInt(qw.model), 0, inventory.types.StockFraction, q.id, qw.amount)
                      if (mp.players.exists(player)) player.notify(`~g~Öğelerin aktarılması${q.name} Tamamlandı`)
                    }
                  }, 5000)
                  player.notify(`~g~Depo ${q.name} yeniden gönderildi`)
                  item.delete()
                })
              })
              player.notify(`~g~Eşyaların transferi kısa süre içinde gerçekleşecektir`)
            })
          }
        })
        submenu.newItem({
          name: "~r~Eski ÇETE depolarını yenilerine taşı",
          onpress: () => {
            user.accept(player, "Emin misin?").then(status => {
              if (!status) return gameData(player);
              let targetChests = [...oldChestPool].filter(([_, item]) => fractionUtil.getFraction(item.fraction).gang).map(item => { return item[1] })
              if (targetChests.length == 0) return player.notify("~r~Eski depo yok"), gameData(player);
              targetChests.forEach(item => {
                chest.create(player, item.name, item.fraction).then(q => {
                  q.settings.weight = item.maxWeight;
                  q.settings.locked = false;
                  q.settings.accessList = []
                  setTimeout(() => {
                    q.position = item.pos
                    q.dimension = item.dimension
                    q.save();
                  }, 1000)
                  const whatInside = [...item.items]
                  q.settings.accessList = whatInside.map(qw => {
                    return {
                      id: methods.parseInt(qw.model),
                      rank: qw.rank,
                      timer: qw.personLimit
                    }
                  });
                  setTimeout(async () => {
                    for (let ida in whatInside) {
                      let qw = whatInside[ida];
                      inventory.createManyItem(methods.parseInt(qw.model), 0, inventory.types.StockFraction, q.id, qw.amount)
                      if (mp.players.exists(player)) player.notify(`~g~Eşyaları taşıma ${q.name} Tamamlandı`)
                    }
                  }, 5000)
                  player.notify(`~g~Depo ${q.name} yeniden gönderildi`)
                  item.delete()
                })
              })
              player.notify(`~g~Eşyaların transferi kısa süre içinde gerçekleşecektir`)
            })
          }
        })

        submenu.open();
      }
    })


    m.newItem({
      name: "Tuvalet",
      onpress: () => {
        let submenu = menu.new(player, "Tuvalet")
        submenu.workAnyTime = true;
        submenu.onclose = () => { gameData(player) }
        submenu.newItem({
          name: "~b~Tesis dışı organizasyon için bir gardırop ekleyin",
          onpress: () => {
            user.accept(player, "Durduğunuz yeri ekleyin?").then(status => {
              if (!status) return gameData(player);
              menu.selectFraction(player).then(fra => {
                const fraction = methods.parseInt(fra);
                if (isNaN(fraction) || fraction < 1 || fraction > 50) return player.notify("~r~Fraksiyon kimliği doğru değil"), gameData(player);
                garderobEntity.create({
                  dresses: [],
                  fraction,
                  position: new mp.Vector3(player.position.x, player.position.y, player.position.z - 1),
                  dimension: player.dimension
                }).then(item => {
                  new dressRoom(item.id, fraction, item.position, item.dresses, item.dimension)
                  player.notify("~g~Yeni dolap eklendi");
                  gameData(player);
                })
              });
            })
          }
        })
        submenu.newItem({
          name: "~r~Dolabı koordinatlarıma taşıyın",
          onpress: () => {
            let submenu = menu.new(player, "Dolabınızı seçin", "Liste")
            submenu.onclose = () => { gameData(player) };
            garderobPool.forEach(item => {
              submenu.newItem({
                name: item.id + " | " + fractionUtil.getFractionName(item.fraction),
                more: player.dist(item.position).toFixed(1) + "m.",
                onpress: () => {
                  user.accept(player, "Emin misin??").then(status => {
                    if (!status) return gameData(player)
                    item.position = new mp.Vector3(player.position.x, player.position.y, player.position.z - 1);
                    item.dimension = player.dimension;
                    item.save();
                    player.notify('~g~Kasa taşındı.');
                    return gameData(player);
                  })
                }
              })
            })
            submenu.open()
          }
        })

        submenu.open();
      }
    })


    m.newItem({
      name: "Otoparklar",
      onpress: () => {
        let submenu = menu.new(player, "Otoparklar")
        submenu.workAnyTime = true;
        submenu.onclose = () => { gameData(player) }
        submenu.newItem({
          name: "~b~Tesis dışı organizasyon için garaj ekleyin",
          onpress: () => {
            user.accept(player, "Durduğunuz yeri ekleyin?").then(status => {
              if (!status) return gameData(player);
              menu.selectFraction(player).then(fra => {
                const fraction = methods.parseInt(fra);
                if (isNaN(fraction) || fraction < 1 || fraction > 50) return player.notify("~r~Fraksiyon kimliği doğru değil"), gameData(player);
                menu.input(player, "Önek (Büyük İngilizce A'dan normal sayıya)", "", 4).then(prefix => {
                  if (!prefix) return;
                  fractionGarage.createNew(fraction, new mp.Vector3(player.position.x, player.position.y, player.position.z - 1), prefix, player.dimension).then(garage => {
                    player.notify("~g~Garaj eklendi");
                    gameData(player);
                  })
                });
              });
            })
          }
        })
        submenu.newItem({
          name: "~b~Arabayı saha dışı bir organizasyon için garaja ekleyin",
          onpress: () => {
            if (!player.vehicle) return player.notify("~r~Eklemek istediğiniz araca oturun.")
            if (!player.vehicle.modelname) return player.notify("~r~Bu araç eklenemez. Aracı yönetici masasından kurtarmanız gerekiyor");
            const list: string[] = [];
            const listgarages: fractionGarage[] = [];
            fractionGarage.list().forEach(function (item) {
              list.push(item.fraction + " / " + methods.getFractionName(item.fraction) + " / " + methods.parseInt(methods.distanceToPos(player.position, item.position)) + "m");
              listgarages.push(item);
            })
            menu.selector(player, "Bir garaj seçin", list, true).then(s => {
              if (!player.vehicle) return player.notify("~r~Eklemek istediğiniz araca oturun.")
              const garage = listgarages[s];
              if (typeof s != "number") return;
              const listamount: string[] = [];
              for (let i = 0; i < 101; i++) listamount.push(i.toString());
              menu.selector(player, "sayısını belirtin", listamount, true).then(async s2 => {
                if (!s2) return;
                const amount = s2;
                let rank = 0;
                const vehicle = player.vehicle;
                if (!vehicle) return player.notify("~r~Araçtan ayrıldınız");
                if (garage.getVehicle(vehicle.modelname)) rank = garage.getVehicle(vehicle.modelname).rank;
                else {
                  const listranks: string[] = [];
                  for (let i = 0; i < 15; i++) listranks.push(i.toString());
                  let ranks = await menu.selector(player, "Bir rütbe seçin", listranks, true);
                  if (!ranks) return;
                  rank = ranks;
                }
                if (!player.vehicle) return player.notify("~r~Eklemek istediğiniz araca oturun.")
                const color1 = vehicle.getColor(0)
                const color2 = vehicle.getColor(1)
                garage.addVehicle(vehicle.modelname, vehicle.position, vehicle.rotation.z, vehicle.livery, rank, color1, color2, amount)
                player.notify("~g~Araba eklendi");
                gameData(player);
              })
            })
          }
        })

        submenu.open();
      }
    })


    m.newItem({
      name: "Paranın bulunduğu kasa",
      onpress: () => {
        let submenu = menu.new(player, "Paranın bulunduğu kasa")
        submenu.workAnyTime = true;
        submenu.onclose = () => { gameData(player) }
        submenu.newItem({
          name: "~b~Tesis dışı bir organizasyon için içinde para bulunan bir kasa ekleyin",
          onpress: () => {
            user.accept(player, "Bulunduğunuz yeri ekleyin?").then(status => {
              if (!status) return gameData(player);
              menu.selectFraction(player).then(fra => {
                const fraction = methods.parseInt(fra);
                if (isNaN(fraction) || fraction < 1 || fraction > 50) return player.notify("~r~Fraksiyon kimliği doğru değil4"), gameData(player);
                moneyChestEntity.create({
                  money: 0,
                  fraction,
                  position: new mp.Vector3(player.position.x, player.position.y, player.position.z - 1),
                  dimension: player.dimension
                }).then(item => {
                  new moneyChest(item.id, item.position, 0, fraction, [], player.dimension)
                  player.notify("~g~Yeni kasa eklendi");
                  gameData(player);
                })
              });
            })
          }
        })
        submenu.newItem({
          name: "~r~Kasayı koordinatlarıma taşıyın",
          onpress: () => {
            let submenu = menu.new(player, "Güvenli bir yer seçin", "Liste")
            submenu.onclose = () => { gameData(player) };
            moneyChests.forEach(item => {
              submenu.newItem({
                name: item.id + " | " + fractionUtil.getFractionName(item.fraction),
                more: player.dist(item.position).toFixed(1) + "m.",
                onpress: () => {
                  user.accept(player, "Emin misin?").then(status => {
                    if (!status) return gameData(player)
                    item.position = new mp.Vector3(player.position.x, player.position.y, player.position.z - 1);
                    item.dimension = player.dimension;
                    item.save();
                    player.notify('~g~Kasa taşındı.');
                    return gameData(player);
                  })
                }
              })
            })
            submenu.open()
          }
        })

        submenu.open();
      }
    })

  }
  if (user.getAdminLevel(player) >= 5) {
    m.newItem({
      name: "~r~Araba kataloğu",
      onpress: () => {
        vehCatalog(player)
      }
    })
  }

  m.open()
}


async function vehicleSpeed(player: PlayerMp) {
  if (!user.isAdminNow(player, 6)) return player.notify('~r~Sadece yönetim tarafından kullanılabilir');
  let m = menu.new(player, 'Hız ayarı', 'Liste');
  m.workAnyTime = true;

  m.newItem({
    name: 'Bir seçenek oluşturun',
    onpress: () => {
      if (!player.vehicle) return player.notify("~r~Yönetici arayüzü üzerinden spam göndererek istediğiniz araba'ye oturun");
      const vehicle = player.vehicle
      const name = vehicle.modelname;
      if (!name) return player.notify("~r~Yönetici arayüzü üzerinden spam göndererek istediğiniz araba'ya oturun");
      vehicle.blockboost = true;

      let msub = menu.new(player, 'Hız ayarı', 'Liste');
      msub.workAnyTime = true;
      msub.onclose = () => {
        if (mp.vehicles.exists(vehicle))
          vehicle.blockboost = false;
      }
      msub.newItem({
        name: "Model",
        more: name
      })
      let list: string[] = [];
      let listq: number[] = [];
      for (let q = 0; q < 60; q++) list.push("x" + ((q / 10).toFixed(1))), listq.push(q)
      let boost = 10;
      vehicle.setVariable("boost", methods.parseFloat(boost / 10))
      msub.newItem({
        name: "Hız çarpanı",
        type: "list",
        list,
        listSelected: listq.indexOf(boost),
        onchange: (value) => {
          if (player.vehicle != vehicle) return player.notify("~r~Ayarı başlattığınız araba'dan ayrıldınız");
          boost = listq[value]
          vehicle.setVariable("boost", methods.parseFloat(boost / 10))
        }
      })
      msub.newItem({
        name: "Kaydet",
        onpress: () => {
          if (!user.isAdminNow(player, 6)) return player.notify('~r~Yalnızca 6. seviye bir yönetici kaydedebilir');
          if (player.vehicle != vehicle) return player.notify("~r~Ayarı başlattığınız araba'dan ayrıldınız");
          vehicleBoosterEntity.findOne({ where: { model: name } }).then(val => {
            if (!val) {
              vehicleBoosterEntity.create({
                model: name,
                speed: methods.parseFloat(boost / 10)
              }).then(() => {
                player.notify(`~r~Yeni giriş oluşturuldu`);
                vehicles.reloadBoostList()
              })
              return
            }
            vehicleBoosterEntity.update({
              model: name,
              speed: methods.parseFloat(boost / 10)
            }, { where: { id: val.id } }).then(() => {
              player.notify(`~r~Giriş düzenlendi`);
              vehicles.reloadBoostList()
            })
          })
        }
      })
      msub.open();

    }
  });

  let listitems = await vehicleBoosterEntity.findAll()

  listitems.forEach(items => {
    m.newItem({
      name: items.model,
      more: "x" + items.speed,
      onpress: () => {
        if (!user.isAdminNow(player, 6)) return player.notify('~r~Yalnızca 6. seviye bir yönetici silebilir');
        user.accept(player, "Silmek mi?").then(status => {
          if (!status) return vehicleSpeed(player)
          items.destroy().then(() => {
            const hash = mp.joaat(items.model)
            mp.vehicles.forEach(veh => {
              if (veh.model == hash) veh.setVariable('boost', 0.0);
            })
            player.notify("~g~Kayıt silindi")
            vehicles.reloadBoostList()
          })
        })
      }
    })
  })

  m.open();
}


function debugData(player: PlayerMp) {
  if (!user.isAdminNow(player)) return;
  let m = menu.new(player, "Ayarlama için veriler", "Liste")
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  if (user.isAdminNow(player, 6)) {
    m.newItem({
      name: "~r~Sunucu hata ayıklama",
      more: methods.debugEnable ? "~r~Dahil olan" : "~g~Devre dışı bırakıldı",
      desc: "Yalnızca geliştirici tarafından talep edildiğinde dahil edin",
      onpress: () => {
        methods.debugEnable = !methods.debugEnable;
        player.notify(`Sunucu hata ayıklama ${methods.debugEnable ? "~r~Dahil olan" : "~g~Devre dışı bırakıldı"}`);
        debugData(player);
      }
    })
    m.newItem({
      name: "~r~Sıralı hata ayıklama",
      more: methods.sequelizeEnable ? "~r~Dahil olan" : "~g~Devre dışı bırakıldı",
      desc: "Yalnızca geliştirici tarafından talep edildiğinde dahil edin",
      onpress: () => {
        methods.sequelizeEnable = !methods.sequelizeEnable;
        player.notify(`Sıralı hata ayıklamayı etkinleştirin ${methods.debugEnable ? "~r~Dahil olan" : "~g~Devre dışı bırakıldı"}`);
        debugData(player);
      }
    })
    m.newItem({
      name: "~r~Aralıklı hack",
      more: enabledHackTimeout() ? "~g~Dahil olan" : "~r~Devre dışı bırakıldı",
      desc: "Yalnızca geliştirici tarafından talep edildiğinde dokunun",
      onpress: () => {
        enableHackTimeout()
        debugData(player);
      }
    })
  }
  // m.newItem({
  //   name: "~b~Генератор зоны",
  //   type: "list",
  //   list: ["3 стороны", "4 стороны", "5 стороны", "6 сторон", "7 сторон", "8 сторон", "9 сторон"],
  //   desc: "Включать исключительно по требованию разработчика",
  //   onpress: (item) => {
  //     methods.debugEnable = !methods.debugEnable;
  //     player.notify(`Серверная отладка ${methods.debugEnable ? "~r~Включена" : "~g~Отключена"}`);
  //     debugData(player);
  //   }
  // })
  m.newItem({
    name: "Hata ayıklamayı etkinleştir",
    onpress: () => {
      menu.input(player, "Hata ayıklamayı etkinleştirdiğimiz oyuncunun oyuncu ID", user.getId(player).toString(), 20).then(uids => {
        if (!uids) return;
        const id = methods.parseInt(uids);
        if (isNaN(id) || id < 0) return player.notify("~r~ID doğru değil")
        let target = user.getPlayerById(id);
        if (!target) return player.notify("~r~Oyuncu tespit edilmedi")
        target.call('server:test', [RAGE_BETA]);
      });
    }
  })

  m.newItem({
    name: "Oynatma",
    type: "list",
    list: ["Animasyon", "Senaryo", "Dur"],
    onpress: (item) => {
      if (item.listSelected == 0) {
        menu.input(player, "Kategori", "", 300).then(dict => {
          if (!dict) return;
          menu.input(player, "Başlık", "", 300).then(anim => {
            if (!anim) return;
            let q = ["Tüm vücut", "Tüm vücut döngüsü", "Üst", "Döngünün tepesi"];
            let q1 = [8, 9, 48, 49];
            menu.selector(player, "Bayrak", q).then(res => {
              debugData(player);
              if (!res) user.stopAnimation(player)
              player.notify("Animasyon oynatın<br/>Kategori: " + dict + "<br/>Başlık: " + anim + "<br/>Bayrak: " + res + "(" + q1[q.indexOf(res)] + ")");
              user.playAnimation(player, dict, anim, (q1[q.indexOf(res)] as any))
            })
          });
        });
      } else if (item.listSelected == 1) {
        menu.input(player, "Kategori", "", 300).then(dict => {
          if (!dict) return;
          debugData(player);
          if (!dict) user.stopAnimation(player)
          player.notify("Oynatma senaryosu<br/>Kategori: " + dict);
          user.playScenario(player, dict);
        });
      } else {
        user.stopAnimation(player)
        user.stopScenario(player)
      }
    }
  })
  m.newItem({
    name: "Koordinatlar",
    type: "list",
    list: ["Nesne", "Virgülle ayrılmış"],
    onpress: (item) => {
      if (item.listSelected == 0) {
        let crd = player.vehicle ? `x:${player.vehicle.position.x.toFixed(2)},y:${player.vehicle.position.y.toFixed(2)},z:${player.vehicle.position.z.toFixed(2)},h:${player.vehicle.rotation.z.toFixed(2)}` : `x:${player.position.x.toFixed(2)},y:${player.position.y.toFixed(2)},z:${player.position.z.toFixed(2)},h:${player.heading.toFixed(2)}`;
        menu.input(player, "Verileri kopyalayın", crd, 300, "textarea");
      } else {
        let crd = player.vehicle ? `${player.vehicle.position.x.toFixed(2)}, ${player.vehicle.position.y.toFixed(2)}, ${player.vehicle.position.z.toFixed(2)}, ${player.vehicle.rotation.z.toFixed(2)}` : `${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)}, ${player.position.z.toFixed(2)}, ${player.heading.toFixed(2)}`;
        menu.input(player, "Verileri kopyalayın", crd, 300, "textarea");
      }
    }
  })
  m.newItem({
    name: "Rulet",
    onpress: () => {
      player.call('server:rullet');
      user.accept(player, "Yaklaştın mı?").then(() => {
        player.call('server:rullet:stop');
        debugData(player);
      })
    }
  })
  m.newItem({
    name: "Tasarımcı",
    type: "list",
    list: ["Özelleştirme", "Giyim", "Şapkalar, gözlükler vs."],
    onpress: (item) => {
      if (item.listSelected == 0) {
        user.generateCustomizationSettings(player, true);
      } else if (item.listSelected == 1) {
        dressConfig(player)
      } else {
        propConfig(player)
      }
    }
  })

  m.newItem({
    name: "Mevcut iç mekan",
    onpress: () => {
      mp.events.callClient(player, "admin:debug:interrior").then(intid => {

        menu.input(player, "Şu anki int.", intid);
      })
    }
  })
  m.newItem({
    name: "Model karması",
    onpress: () => {
      menu.input(player, "Model giriniz", "", 50, "text").then(model => {
        model = methods.model(model)
        menu.input(player, "Model karması", mp.joaat(model).toString(), 50, "text");
      });
    }
  })
  m.newItem({
    name: "Modelin geçerliliğinin kontrol edilmesi",
    onpress: () => {
      menu.input(player, "Model giriniz", "", 50, "text").then(model => {
        model = methods.model(model)
        user.checkModel(player, model).then(status => {
          player.notify(status ? "~g~Model geçerlidir" : "~r~Model geçerli değil")
        })
      });
    }
  })
  m.open()
}

function dressConfig(player: PlayerMp) {
  if (!user.isAdminNow(player)) return;
  let m = menu.new(player, "Giyim Tasarımcısı", "Kurulum");
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  m.newItem({
    name: "Bölüm seçiniz",
    type: "list",
    list: ["Gövde", "Ayaklar", "Ayakkabılar", "Aksesuarlar"],
    onpress: (qsss) => {
      let dressSectorId = 0;
      if (qsss.listSelectedName == "Ayaklar") dressSectorId = 4;
      if (qsss.listSelectedName == "Ayakkabılar") dressSectorId = 6;
      if (qsss.listSelectedName == "Aksesuarlar") dressSectorId = 7;
      if (qsss.listSelectedName == "Торс") dressSectorId = 11;
      // if (qsss.listSelectedName == "Маска") dressSectorId = 1;
      let config = [0, dressSectorId, 0, 0, -1, -1, -1, -1, 100, "Başlık", -1, 30] as clothItem
      user.emptyDressAndProps(player);
      const red = () => {

      }
      const upd = () => {
        let submenu = menu.new(player, "Kurulum " + qsss.listSelectedName)
        submenu.onclose = () => { user.resetCustomization(player); dressConfig(player) }

        submenu.newItem({
          name: "Temel varyasyon",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[2],
          onchange: (itm) => {
            config[2] = itm
            player.setClothes(dressSectorId, config[2], config[3], 2)
            // user.setComponentVariation(player, dressSectorId, config[2], config[3]);
          }
        })
        submenu.newItem({
          name: "Ana renk",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[3],
          onchange: (itm) => {
            config[3] = itm
            user.setComponentVariation(player, dressSectorId, config[2], config[3]);
          }
        })

        if (dressSectorId == 11) {
          if (config[4] == -1) config[4] = 0;
          if (config[5] == -1) config[5] = 0;

          if (config[6] == -1) config[6] = 240;
          if (config[7] != 240) config[7]++;

          submenu.newItem({
            name: "Gövde varyasyonu",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[4],
            onchange: (itm) => {
              config[4] = itm
              user.setComponentVariation(player, 3, config[4], config[5]);
            }
          })
          submenu.newItem({
            name: "Gövde rengi",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[5],
            onchange: (itm) => {
              config[5] = itm
              user.setComponentVariation(player, 3, config[4], config[5]);
            }
          })
          submenu.newItem({
            name: "Paraşüt varyasyonu",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[6],
            onchange: (itm) => {
              config[6] = itm
              user.setComponentVariation(player, 8, config[6], config[7]);
            }
          })
          submenu.newItem({
            name: "Paraşüt rengi",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[7],
            onchange: (itm) => {
              config[7] = itm
              user.setComponentVariation(player, 8, config[6], config[7]);
            }
          })

        }

        submenu.newItem({
          name: "Kopyalama ayarları",
          onpress: () => {
            menu.input(player, "Bu yapılandırmayı geliştiriciye iletin", JSON.stringify(config), 200).then(() => {
              upd();
            })

          }
        })
        submenu.newItem({
          name: "Başlık",
          desc: config[9],
          onpress: () => {
            menu.input(player, "Giysinin adını girin", config[9], 40).then(name => {
              if (name) {
                config[9] = name
              }
              upd();
            })
          }
        })
        submenu.newItem({
          name: "Maliyet",
          more: config[8].toFixed(0) as string + "$",
          onpress: () => {
            menu.input(player, "Maliyet girin", config[8].toFixed(0), 6, "int").then(cost => {
              if (cost) {
                if (isNaN(cost) || cost < 1 || cost > 100000000) return player.notify("~r~Maliyet doğru değil");
                config[8] = cost
              }
              upd();
            })
          }
        })
        submenu.newItem({
          name: "Isıya dayanıklılık",
          more: `${config[10]}`,
          onpress: () => {
            menu.input(player, "Bir değer girin", `${config[10]}`, 6).then(val => {
              if (val) {
                let cost = methods.parseInt(val);
                if (isNaN(cost)) return player.notify("~r~Değer doğru değil");
                if (cost > 0) cost *= -1;
                config[10] = cost
              }
              upd();
            })
          }
        })

        submenu.newItem({
          name: "Mağaza tipi",
          type: "list",
          list: ["Discount store", "Suburban", "Ponsonbys", "Ammunation", "Binco"],
          listSelected: config[0],
          onchange: (itm) => {
            config[0] = itm
          }
        })


        submenu.open()
      }
      upd();
    }
  })
  m.open()
}

function propConfig(player: PlayerMp) {
  if (!user.isAdminNow(player)) return;
  let m = menu.new(player, "Dekor yapımcısı", "Kurulum");
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  m.newItem({
    name: "Bölüm seçiniz",
    type: "list",
    list: ["Şapkalar", "Gözlükler", "Küpeler", "Sol el", "Sağ el"],
    onpress: (qsss) => {
      let dressSectorId = 0;
      if (qsss.listSelectedName == "Şapkalar") dressSectorId = 0;
      if (qsss.listSelectedName == "Gözlükler") dressSectorId = 1;
      if (qsss.listSelectedName == "Küpeler") dressSectorId = 2;
      if (qsss.listSelectedName == "Sol el") dressSectorId = 6;
      if (qsss.listSelectedName == "Sağ el") dressSectorId = 7;
      // if (qsss.listSelectedName == "Маска") dressSectorId = 1;
      let config = [0, dressSectorId, 0, 0, 10, "Başlık"] as propItem
      user.emptyDressAndProps(player);
      const red = () => {

      }
      const upd = () => {
        let submenu = menu.new(player, "Kurulum " + qsss.listSelectedName)
        submenu.onclose = () => { user.resetCustomization(player); propConfig(player) }

        submenu.newItem({
          name: "Varyasyon",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[2],
          onchange: (itm) => {
            config[2] = itm
            user.setProp(player, dressSectorId, config[2], config[3])
          }
        })
        submenu.newItem({
          name: "Renk",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[3],
          onchange: (itm) => {
            config[3] = itm
            user.setProp(player, dressSectorId, config[2], config[3])
          }
        })

        submenu.newItem({
          name: "Kopyalama ayarları",
          onpress: () => {
            menu.input(player, "Bu yapılandırmayı geliştiriciye iletin", JSON.stringify(config), 200).then(() => {
              upd();
            })
          }
        })

        submenu.newItem({
          name: "Başlık",
          desc: config[5],
          onpress: () => {
            menu.input(player, "Bileşenin adını girin", config[5], 40).then(name => {
              if (name) {
                config[5] = name
              }
              upd();
            })
          }
        })
        submenu.newItem({
          name: "Maliyet",
          more: config[4].toFixed(0) as string + "$",
          onpress: () => {
            menu.input(player, "Maliyet girin", config[4].toFixed(0), 6, "int").then(cost => {
              if (cost) {
                if (isNaN(cost) || cost < 1 || cost > 100000000) return player.notify("~r~Maliyet doğru değil");
                config[4] = cost
              }
              upd();
            })
          }
        })

        submenu.newItem({
          name: "Mağaza tipi",
          type: "list",
          list: ["Discount store", "Suburban", "Ponsonbys", "Ammunation", "Binco"],
          listSelected: config[0],
          onchange: (itm) => {
            config[0] = itm
          }
        })


        submenu.open()
      }
      upd();
    }
  })
  m.open()
}


function vehMenu(player: PlayerMp) {
  if (!user.isAdminNow(player)) return;
  let m = menu.new(player, "Nakliye", "Eylemler");
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  m.newItem({
    name: "İçinde bulunduğum araba'nın envanterini temizle",
    onpress: () => {
      user.accept(player, "Emin misin?").then(status => {
        const veh = player.vehicle;
        if (!veh) return player.notify('~r~Araba da değilsiniz');
        if (!veh.admin) return player.notify('~r~Araba bir yönetici tarafından spamlanmalıdır');
        mainMenu(player)
        if (!status) return;
        inventory.getItemListData(8, veh.numberPlate).map(item => {
          inventory.deleteItem(item.id)
        })
        user.log(player, "AdminJob", "Yönetici makinesinin envanteri temizlendi " + veh.modelname + " sayı " + veh.numberPlate + ` @inventorytype8 @inventoryid${methods.convertNumberToHash(veh.numberPlate)}`)
      })
    }
  })
  m.newItem({
    name: "Araba'yı kapsayan",
    onpress: () => {
      menu.input(player, "Aracın adını girin").then(model => {
        if (!model) return;
        let vehicle = vehicles.spawnCar(player.position, player.heading, model);
        vehicle.dimension = player.dimension;
        vehicle.admin = true;
        player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
      })
    }
  })
  m.newItem({
    name: "Aracı park edin", onpress: () => {
      if (!player.vehicle) return player.notify('~r~Nakliye işinde olmalısınız');
      if (!player.vehicle.getVariable('container')) return player.notify(`~r~Bu araba bir oyuncuya ait değildir`)
      const pos = player.vehicle.position;
      vehicles.park(player.vehicle.getVariable('container'), pos.x, pos.y, pos.z, player.vehicle.heading);
      player.notify('~b~Aracınızı park ettiniz');
      user.log(player, "AdminJob", `Bir oyuncu numarasının araba'sı park edildi ${player.vehicle.getVariable('container')} X koordinatlarına: ${pos.x.toFixed(0)}, Y: ${pos.y.toFixed(0)}, Z: ${pos.z.toFixed(0)}`)
    }
  })
  if (player.vehicle) {
    m.newItem({
      name: "Aracı tamir ettirin",
      onpress: () => {
        if (player.vehicle) {
          player.vehicle.repair();
        }
      }
    })
    if (typeof player.vehicle.getVariable('fuel') == "number") {
      const vehInfo = methods.getVehicleInfo(player.vehicle.model);
      if (vehInfo.fuel_full > 1) {
        m.newItem({
          name: "Yakıt",
          more: player.vehicle.getVariable('fuel') + 'л. / ' + vehInfo.fuel_full,
          onpress: () => {
            if (player.vehicle) {
              menu.input(player, "Yakıt miktarını girin", player.vehicle.getVariable('fuel').toString()).then(fuel => {
                if (!fuel) return;
                if (!player.vehicle) return;
                const sfuel = methods.parseInt(fuel);
                if (isNaN(sfuel) || sfuel < 0 || sfuel > 100) return player.notify("~r~Sayı doğru değil")
                player.vehicle.setVariable('fuel', sfuel);
                player.notify("~g~Başarıyla");
              });
            }
          }
        })
      }
    }
  }
  m.newItem({ name: "En yakın araçtan sorumlu", onpress: () => mp.events.call("server:respawnNearstVehicle", player) })
  m.newItem({ name: "En yakın aracı sil", onpress: () => mp.events.call("server:deleteNearstVehicle", player) })
  m.newItem({ name: "En yakın aracı ters çevirin", onpress: () => mp.events.call("server:flipNearstVehicle", player) })
  m.newItem({
    name: "En yakın aracı aç/Kapat", onpress: () => {
      let veh = user.getNearestVehicle(player)
      if (!veh) return player.notify("~r~Araç algılanmadı");
      vehicles.lockStatus(player, veh)
    }
  })
  // m.newItem({
  //   name: "Цвет ТС",
  //   onpress: () => {
  //     menu.input(player, "Введите название ТС").then(model => {
  //       if(!model) return;
  //       let vehicle = vehicles.spawnCar(player.position, player.heading, model);
  //       vehicle.dimension = player.dimension;
  //       player.putIntoVehicle(vehicle, -1);
  //     })
  //   }
  // })
  m.open()
}
export const userPropertyEdit = async (player: PlayerMp, id: number) => {
  if (!user.isAdminNow(player, 6)) return;
  let target = user.getPlayerById(id);
  if (!target) {
    return player.notify("~r~Oyuncu çevrimiçi bulunamadı")
  }
  let nick = user.getRpName(target);
  let m = menu.new(player, "Mülkiyet [" + id + "]", "Liste");
  m.workAnyTime = true;

  let data: { [x: string]: any } = {}

  data.business_id = user.get(target, 'business_id');
  data.cars = [];
  for (let id = 1; id < 9; id++) if (user.get(target, 'car_id' + id) > 0) {
    if (vehicles.getBySlot(target, id)) data.cars.push(user.get(target, 'car_id' + id))
  }
  data.apart = user.get(target, 'apartment_id');
  data.house = user.get(target, 'id_house');
  data.condo = user.get(target, 'condo_id');
  data.stock = user.get(target, 'stock_id');


  if (data.business_id) {

    let owner = business.getOwnerInfo(data.business_id);
    if (owner.id != id) {
      m.newItem({
        name: "İş: #" + data.business_id,
        desc: "Sahibi: " + owner.id,
        onpress: () => {
          menu.selector(player, "Eylem", ["Mülkiyet değişikliği", "Tazminat ödeyerek oyuncudan çıkarın"]).then(res => {
            if (!res) return userPropertyEdit(player, id);
            if (res == "Mülkiyet değişikliği") {
              business.updateOwnerInfo(data.business_id, id, nick)
            } else {
              user.addMoney(player, business.getPrice(data.business_id) * 1.1);
              user.set(target, 'business_id', 0)
            }
            userPropertyEdit(player, id);
          })
        }
      })
    }
  }
  if (data.cars) {
    data.cars.forEach(async (car: number) => {
      let owner = await vehicles.getOwner(car);
      if (owner.id != id) {
        let price = await vehicles.getPrice(car)
        m.newItem({
          name: "Araba: #" + car,
          desc: "Sahibi: " + owner.id,
          onpress: () => {
            menu.selector(player, "Eylem", ["Mülkiyet değişikliği", "Tazminat ödeyerek oyuncudan çıkarın"]).then(res => {
              if (!res) return userPropertyEdit(player, id);
              if (res == "Mülkiyet değişikliği") {
                vehicles.updateOwnerInfo(data.business_id, id, nick)
              } else {
                user.addMoney(player, price);
                for (let ids = 1; ids < 9; ids++) if (user.get(player, 'car_id' + ids) == car) {
                  user.set(player, 'car_id' + ids, 0)
                }
              }
              userPropertyEdit(player, id);
            })
          }
        })
      }
    })
  }
  m.open()
}
