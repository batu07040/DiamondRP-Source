import { Container } from './modules/data';
import UIMenu from './modules/menu';
import { methods } from './modules/methods';
import { timer } from './modules/timer';
import { weather } from './managers/weather';
import { dispatcher } from './managers/dispatcher';
import { jail } from './managers/jail';
import { ui } from './modules/ui';
import { user } from './user';
import { inventory } from './inventory';
import { enums } from './enums';
import { items_old } from './items_old';
let items = items_old;
import { houses } from './houses';
import { stock } from './stock';
import { chat } from './chat';
import { business } from './business';
import { condo } from './condo';
import { coffer } from './coffer';
import { vehicles } from './vehicles';
//import voice from './voice';
//import clothes from './cloth';
import { builder } from './jobs/builder';
import { weapons } from './weapons';
import { cleaner } from './jobs/cleaner';
import { roadWorker } from './jobs/roadWorker';
import { mainer } from './jobs/mainer';
import { licenseCenter } from './business/licenseCenter';
import { bugstars } from './jobs/bugstars';
import { sunBleach } from './jobs/sunBleach';
import { waterPower } from './jobs/waterPower';
import { gardener } from './jobs/gardener';
import { photo } from './jobs/photo';
import { bus } from './jobs/bus';
import { mail } from './jobs/mail';
import { cloth } from './business/cloth';

import { burgershot } from './jobs/burgetshot';
import { gr6 } from './jobs/gr6';
import { taxi } from './jobs/taxi';
import { trucker } from './jobs/trucker';
import { phone } from './phone';
import { noClipSwitch } from './fly';
import { chests } from './modules/chests';
import { businessNalog, weaponCost, PillBoxCost, itemCosts } from '../util/sharedData';
import { inGreenZone } from './modules/savezone';
import { levelAccess } from '../util/level';
import { gui } from './modules/gui';
import { restartVoice } from './ragevoice';
import { healProtection } from './modules/ach';
import { WEAPON_LEVEL_MIN } from '../util/weapons';
import { clothItem, propItem, getItemNameById } from '../util/inventory';
import { MenuItemClient, MenuClass } from './managers/menu';
import { walkstylesList } from '../util/walkstyles';
import { gunShopList, shopList, shopListElectro } from '../util/shop';

let passProtect = 0;
let passProtectMax = 5;

let healCd = false

setInterval(() => {
  if (passProtect > 0) passProtect--;
}, 10000)

let walkieState = false;

mp.events.add('setTag', (tag: string) => {
  tag = methods.removeQuotes(tag);
  if (tag == '') mp.game.ui.notifications.show(`~y~Etiketi sildin`);
  else mp.game.ui.notifications.show(`~y~Bir etiket belirlediniz - ~s~${tag}`);
  user.set('tag', tag);
  user.setData('tag', tag);
  user.saveAccount();
  mp.events.callSocket('tablet:openfraction')
})

mp.events.add("client:itemshop:buy", (itemId, itemPrice, shopId) => {
  if (itemPrice < 1) return;
  mp.events.callRemote('server:shop:buy', itemId, itemPrice, shopId);
})

mp.events.add("client:itemshop:gun:buy", (itemId, itemPrice, shopId) => {
  if (itemPrice < 1) return;
  mp.events.callRemote('server:gun:buy', itemId, itemPrice, shopId);
})

mp.events.add("client:itemshop:close", () => {
  gui.setGui(null);
  setTimeout(() => {
    mp.gui.cursor.show(false, false);
  }, 100);
});

mp.events.add('showVehicleAutopilotMenu', () => menuList.showVehicleAutopilotMenu())
mp.events.add('showVehicleDoMenu', () => menuList.showVehicleDoMenu())


let skin: { [name: string]: any } = {};
let test = false;
mp.events.add("server:test", () => {
  test = true;
})
mp.events.add("report", () => {
  report()
})
async function report() {
  if (reportWait) return mp.game.ui.notifications.show('~r~60 Saniye bekleyin');
  let text = await UIMenu.Menu.GetUserInput('Sikeyetinizi aciklayin', '', 300);
  if (text != '') {
    mp.events.callRemote('server:sendReport', text);
    reportWait = true;
    setTimeout(() => {
      reportWait = false
    }, 60000)
  }
}

mp.events.add("godmode:switch", () => {
  mp.players.local.setInvincible(!user.godmode)
  user.godmode = !user.godmode;
  mp.game.ui.notifications.show("GodMode " + user.godmode ? "~g~Dahil" : "~r~Dahil");
})

//mp.events.add("playerExitColshape", () => UIMenu.Menu.HideMenu());

let reportWait = false;
let helperWait = false;

mp.events.add('client:user:openCustomization', (x, y, z, rot, cacheData) => {
  try {
    user.updateCharacterFace();
    user.updateCharacterCloth();
    let cam = mp.cameras.new(
      'customization',
      new mp.Vector3(8.243752, 527.4373, 171.6173),
      new mp.Vector3(0, 0, 0),
      20
    );
    cam.pointAtCoord(9.66692, 528.34783, 171.2);
    cam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, false, false);
    //menuList.showCharacterCustomMenu(x, y, z, rot, cam, cacheData);

    setTimeout(function () {
      user.hideLoadDisplay();
    }, 1000);
  } catch (e) {
    methods.debug('openCustomization', e);
  }
});


let updateSex = function (idx?: number) {
  if (idx != undefined) user.setPlayerModel(idx == 0 ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
  else user.setPlayerModel(user.getSex() == 0 ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
  setTimeout(function () {
    user.updateCharacterFace(true);
  }, 100);
  //user.updateCache().then();
};


let menuList = {
  customIsShow: false,
  customX: 0,
  customY: 0,
  customZ: 0,
  customRot: 0,
  customCam: <CameraMp>null,
  customData: new Map(),

  showCondoBuyMenu: async function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Adres: ~s~${h.get('address')} ${h.get('id')}`
    );

    let buyHouseItem = menu.AddMenuItem(
      `Icin bir daire satin alin ~g~$${methods.numberFormat(h.get('price'))}`
    );
    let enterHouseItem = menu.AddMenuItem('~g~Daireyi gör');

    if (user.get('job') == 'mail' || user.get('job') == 'mail2') {
      if (!(await Container.Has(h.get('id'), 'isMail2')))
        menu.AddMenuItem('~g~Mektuplari birak').doName = h.get('id');
      else menu.AddMenuItem('~o~Evin bakimi zaten yapilmistir');
    }

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item == enterHouseItem) {
        condo.enter(h.get('id'), h.get('int_x'), h.get('int_y'), h.get('int_z'));
      } else if (item == buyHouseItem) {
        condo.buy(h.get('id'));
      }

      if (item.doName) mail.sendMail2(parseInt(item.doName));
    });
  },

  showCondoInMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Adres: ~s~${h.get('address')} ${h.get('id')}`
    );

    let setPinItem: MenuItemClient = null;
    let resetPinItem: MenuItemClient = null;
    if (h.get('id_user') == user.getCacheData().get('id') && h.get('pin') > 0)
      setPinItem = menu.AddMenuItem('~y~Pin kodunu degistirin');

    let exitHouseItem = menu.AddMenuItem('~g~Daireden cikin');
    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == exitHouseItem) {
        condo.exit(h.get('x'), h.get('y'), h.get('z'));
      }
      if (item == setPinItem) {
        let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Sifre', '', 5));
        if (pass < 1) {
          mp.game.ui.notifications.show('~r~Parola sifirdan buyuk olmalidir');
          return false;
        }
        mp.game.ui.notifications.show('~g~Yeni sifre: ~s~' + pass);
        condo.updatePin(h.get('id'), pass);
      }
      if (item == resetPinItem) {
        mp.game.ui.notifications.show('~g~Sifre sifirlama');
        condo.updatePin(h.get('id'), 0);
      }
    });
  },

  showCondoOutMenu: async function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      ``,
      `~b~Adres: ~s~${h.get('address')} ${h.get('id')}`, false, false, false, 'house', 'house'
    );
    let infoItem = menu.AddMenuItem(`~b~Mulk sahibi:~s~ ${h.get('name_user')}`);
    let enterHouseItem = menu.AddMenuItem('~g~Giris yap');

    if (user.get('job') == 'mail' || user.get('job') == 'mail2') {
      if (!(await Container.Has(h.get('id'), 'isMail2')))
        menu.AddMenuItem('~g~Mektuplari birak').doName = h.get('id');
      else menu.AddMenuItem('~o~Evin bakimi zaten yapildi');
    }

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == enterHouseItem) {
        if (h.get('pin') > 0 && user.get('id') != h.get('id_user')) {
          if (passProtect >= passProtectMax) return user.notify("~r~Sifreyi girmeden once bekleyiniz.");
          passProtect++;
          let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Pin kodunu giriniz', '', 10, 'password'));
          if (pass == h.get('pin'))
            condo.enter(h.get('id'), h.get('int_x'), h.get('int_y'), h.get('int_z'));
          else mp.game.ui.notifications.show('~r~Yanlis pin kodu girdiniz!');
        } else condo.enter(h.get('id'), h.get('int_x'), h.get('int_y'), h.get('int_z'));
      }

      if (item.doName) mail.sendMail2(parseInt(item.doName));
    });
  },

  showStockBuyMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Adres: ~s~${h.get('address')} ${h.get('id')}`
    );

    let buyHouseItem = menu.AddMenuItem(
      `Bir depo satin alin~g~$${methods.numberFormat(h.get('price'))}`
    );
    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item == buyHouseItem) {
        stock.buy(h.get('id'));
      }
    });
  },

  showStockOutMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Adres: ~s~${h.get('address')} ${h.get('id')}`
    );
    let infoItem = menu.AddMenuItem(`~b~Sahibi:~s~ ${h.get('user_name')}`);
    let enterHouseItem = menu.AddMenuItem('~g~Giris yap');
    let closeItem = menu.AddMenuItem('~r~Oturumu sonlandir');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == enterHouseItem) {
        if (user.get('id') != h.get('user_id')) {
          if (passProtect >= passProtectMax) return user.notify("~r~Parolayi girmeden once bekleyiniz.");
          passProtect++;
          let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Pin kodunu giriniz', '', 10, 'password'));
          if (pass == h.get('pin1')) stock.enter(h.get('id'));
          else {
            stock.addLog(user.get('rp_name'), `Yanlis pin kodu girdiniz (${pass})`, h.get('id'));
            mp.game.ui.notifications.show('~r~Yanlis pin kodu girdiniz!');
          }
        } else stock.enter(h.get('id'));
      }
    });
  },

  showStockInMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Adet: ~s~${h.get('address')} ${h.get('id')}`
    );

    let exitHouseItem = menu.AddMenuItem('~g~Giris');
    let closeItem = menu.AddMenuItem('~r~Cikis');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == exitHouseItem) {
        stock.exit(h.get('x'), h.get('y'), h.get('z'));
      }
    });
  },

  showApartmentListMenu: function (countFloor: number, buildId: number) {
    //TODO TELEPORT BLACKOUT

    let menu = UIMenu.Menu.Create(``, `~b~Apartman menusu`, false, false, false, 'house', 'house');

    let exitItem = null;
    if (mp.players.local.dimension != 0) exitItem = menu.AddMenuItem(`~g~Cadde`);

    for (let i = 1; i <= countFloor; i++) menu.AddMenuItem(`Kat numarasi${i}`).floor = i;

    if (buildId == 32) {
      let roofItem = menu.AddMenuItem(`~g~Cati`);
      roofItem.x = 387.8792;
      roofItem.y = -60.072224;
      roofItem.z = 121.5355;
    }

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (index == 0 && mp.players.local.dimension != 0) {
        mp.events.callRemote('server:apartments:exit', buildId);
        return;
      } else if (item.x) {
        user.teleport(item.x, item.y, item.z);
        user.setVirtualWorld(0);
        return;
      }
      mp.events.callRemote('server:events:floorList', item.floor, buildId);
    });
  },

  showApartmentInfoMenu: function (data: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      ``,
      `~b~Sahibi: ~s~${data.get('user_id') == 0 ? 'Devlet' : data.get('user_name')}`, false, false, false, 'house', 'house'
    );

    let exitItem = menu.AddMenuItem(`~g~Gitmek`);
    let buyItem: MenuItemClient = null;

    if (data.get('user_id') == 0)
      buyItem = menu.AddMenuItem(
        `~g~Satin al`,
        `Fiyat: ~g~$${methods.numberFormat(data.get('price'))}`
      );

    if (data.get('pin') != 0 && data.get('user_id') == user.get('id'))
      menu.AddMenuItem(`~y~Pin kodunu degistir`).doName = 'changePin';

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == exitItem)
        mp.events.callRemote('server:events:showApartmentListMenu', data.get('build_id'));
      else if (item == buyItem) mp.events.callRemote('server:apartments:buy', data.get('id'));
      else if (item.doName == 'changePin') {
        let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Pin kodu', '', 5));
        if (pass == 0) {
          mp.game.ui.notifications.show('~r~Sadece sayi kabul edilebilir');
          return;
        }
        mp.game.ui.notifications.show('~g~Yeni pin kodunuz: ~s~' + pass);
        mp.events.callRemote('server:apartments:updatePin', data.get('id'), pass);
      } else if (item.doName == 'resetPin') {
        mp.game.ui.notifications.show('~g~Sifre sifirlama');
        mp.events.callRemote('server:apartments:updatePin', data.get('id'), 0);
      }
    });
  },

  showApartmentFloorListMenu: function (data: [number, string][]) {
    let menu = UIMenu.Menu.Create(``, `~b~Dairelerin listesi`, false, false, false, 'house', 'house');

    data.forEach(function (item, i, arr) {
      let ownerName = item[1] == '' ? 'Devlet' : item[1];
      menu.AddMenuItem(`Daire numarasi${item[0]}`, `~b~Sahibi: ~s~${ownerName}`).apartId =
        item[0];
    });
    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;

      let pin = methods.parseInt(
        await Container.Get(-100000 + methods.parseInt(item.apartId), 'pin')
      );

      // !todo -> if (pin != 0 && item[1] != '') {
      if (pin != 0) {
        if (passProtect >= passProtectMax) return user.notify("~r~Parolayi girmeden once bekleyin");
        passProtect++;
        let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Pin kodunu giriniz', '', 10, 'password'));
        if (pass == pin)
          mp.events.callRemote('server:apartments:enter', methods.parseInt(item.apartId));
        else {
          mp.game.ui.notifications.show('~r~Yanlis pin kodu girdin');
        }
      } else mp.events.callRemote('server:apartments:enter', methods.parseInt(item.apartId));
    });
  },




  showVehicleMenu: async function (data: Map<string, any>) {
    if (!mp.players.local.vehicle) return;
    let vInfo = methods.getVehicleInfo(mp.players.local.vehicle.model);

    let ownerName = 'Devlet';
    if (data.get('id_user') > 0) ownerName = data.get('user_name');
    if (data.get('fraction_id') > 0) ownerName = methods.getFractionName(data.get('fraction_id'));
    // !todo -> if (data.has('job') > 0) ownerName = methods.getCompanyName(data.get('job'));
    if (data.get('job') > 0) ownerName = methods.getCompanyName(data.get('job'));

    let menu = UIMenu.Menu.Create(`Nakliye`, `~b~Sahibi: ~s~${ownerName}`);

    if (data.get('job') != 'bgstar' && data.get('job') != 'sunb' && data.get('job') != 'water') {
      switch (user.get('job')) {
        case 'trucker1':
          if (vInfo.class_name == 'Vans') {
            menu.AddMenuItem('~g~Siparis listesi').doName = 'trucker:getList';
            menu.AddMenuItem('~b~Telsiz frekansi:~s~ ').SetRightLabel('266.001');
            if (trucker.isProcess())
              menu.AddMenuItem('~r~Zamanindan once tamamlayin', 'Ceza ~r~$500').doName =
                'trucker:stop';
          }
          break;
        case 'trucker2':
          if (
            vInfo.display_name == 'Benson' ||
            vInfo.display_name == 'Mule' ||
            vInfo.display_name == 'Mule2' ||
            vInfo.display_name == 'Mule3'

          ) {
            menu.AddMenuItem('~g~Siparis listesi').doName = 'trucker:getList';
            menu.AddMenuItem('~b~Telsiz frekansi:~s~ ').SetRightLabel('266.002');
            if (trucker.isProcess())
              menu.AddMenuItem('~r~Zamanindan once tamamlayin', 'Ceza ~r~$500').doName =
                'trucker:stop';
          }
          break;
        case 'trucker3':
          if (
            vInfo.display_name == 'Pounder' ||
            vInfo.display_name == 'Pounder2'
          ) {
            menu.AddMenuItem('~g~Siparis listesi').doName = 'trucker:getList';
            menu.AddMenuItem('~b~Telsiz frekansi:~s~ ').SetRightLabel('266.003');
            if (trucker.isProcess())
              menu.AddMenuItem('~r~Zamanindan once tamamlayin', 'Ceza ~r~$500').doName =
                'trucker:stop';
          }
          break;
      }
    }

    if (user.get('job') == data.get('job')) {
      menu.AddMenuItem('~g~Acik~s~ / ~r~Kapali~s~').eventName =
        'server:vehicle:lockStatus';
      switch (data.get('job')) {
        case 'bshot':
          menu.AddMenuItem('~g~Isi bitir').doName = 'bshot:find';
          menu.AddMenuItem('~g~Siparisi teslim alin').doName = 'takeTool';
          menu.AddMenuItem('~b~Referans').sendChatMessage =
            'Bu is sizi sunucunun yonetimine ve dinamiklerine alistirmaya yarar, tadini cikarin!';
          break;
        case 'bgstar':
          menu.AddMenuItem('~g~Isi bitir').doName = 'bugstar:find';
          menu.AddMenuItem('~g~Aletleri al').doName = 'takeTool';
          menu.AddMenuItem('~b~Referans').sendChatMessage =
            'Bu is sizi sunucunun yonetimine ve dinamiklerine alistirmaya yarar, tadini cikarin!';
          break;
        case 'sunb':
          menu.AddMenuItem('~g~Isi bitir').doName = 'sunb:find';
          menu.AddMenuItem('~g~Aletleri al').doName = 'takeTool';
          menu.AddMenuItem('~b~Referans').sendChatMessage =
            'Bu is sizi sunucunun yonetimine ve dinamiklerine alistirmaya yarar, tadini cikarin!';
          break;
        case 'water':
          menu.AddMenuItem('~g~Isi bitir').doName = 'water:find';
          menu.AddMenuItem('~b~Referans').sendChatMessage =
            'Bu is sizi sunucunun yonetimine ve dinamiklerine alistirmaya yarar, tadini cikarin!';
          break;
        case 'photo':
          menu.AddMenuItem('~g~Isi bitir').doName = 'photo:find';
          menu.AddMenuItem('~b~Referans').sendChatMessage =
            'Birim sefinizden gorev alin ve yerine getirin.';
          break;
        case 'three':
          menu.AddMenuItem('~g~Isi bitir').doName = 'three:find';
          menu.AddMenuItem('~b~Referans').sendChatMessage =
            'Birim sefinizden gorev alin ve yerine getirin.';
          break;
        case 'bus1':
          menu.AddMenuItem('~g~Motoru ac').doName = 'bus:start1';
          menu.AddMenuItem('~y~Yolculugu tamamla', 'Motor planlanandan once kapatildi').doName =
            'bus:stop';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Motoru acin ve kazanmaya devam edin!';
          break;
        case 'bus2':
          menu.AddMenuItem('~g~Motoru ac').doName = 'bus:start2';
          menu.AddMenuItem('~y~Yolculugu tamamla', 'Motor planlanandan once kapatildi').doName =
            'bus:stop';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Motoru acin ve kazanmaya devam edin!';
          break;
        case 'bus3':
          menu.AddMenuItem('~g~Motoru ac').doName = 'bus:start3';
          menu.AddMenuItem('~y~Yolculugu tamamla', 'Motor planlanandan once kapatildi').doName =
            'bus:stop';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Motoru acin ve kazanmaya devam edin!';
          break;
        case 'gr6':
          menu.AddMenuItem('~g~Koleksiyoncu menusu').doName = 'gr6:menuVeh';
          break;
        case 'mail':
        case 'mail2':
          menu.AddMenuItem('~g~Postalari nakliyeden alma').doName = 'mail:take';
          menu.AddMenuItem('~b~Referans').sendChatMessage =
            'Postayi nakil aracindan alin, ardindan bir konut binasina gidin ve E tusuna basin ve teslim edin';
          break;
        case 'taxi1':
        case 'taxi2':
          menu.AddMenuItem('~g~Taksi filosu kontrol odasi').doName = 'taxi:dispatch';
          menu.AddMenuItem('~g~Isi tamamlamak').doName = 'taxi:start';
          break;
      }
    }

    if (data.get('job') == 'gr6') {
      menu.AddMenuItem('~y~Nakliye soygunu').doName = 'gr6:grab';
    }



    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      } else if (item.sendChatMessage) mp.gui.chat.push(`${item.sendChatMessage}`);
      else if (item.doName == 'chests:grab') chests.grab();
      else if (item.doName == 'taxi:dispatch') menuList.showDispatchTaxiMenu();
      else if (item.doName == 'mail:take') mail.takeMail();
      else if (item.doName == 'taxi:start') taxi.start();
      else if (item.doName == 'bus:start1') bus.start(1);
      else if (item.doName == 'bus:start2') bus.start(2);
      else if (item.doName == 'bus:start3') bus.start(3);
      else if (item.doName == 'bus:stop') bus.stop();
      else if (item.doName == 'three:find') gardener.start();
      else if (item.doName == 'gr6:grab') gr6.grab();
      else if (item.doName == 'gr6:menuVeh') mp.events.callRemote('gr6:menuVeh');
      else if (item.doName == 'gr6:getHelp') {
        dispatcher.send(`KOD 0`, `${user.get('rp_name')} - Paraya cevirme destek gerektirir`);
        mp.game.ui.notifications.show('~b~Meydan okuma gonderildi');
      } else if (item.doName == 'photo:find') photo.start();
      else if (item.doName == 'bshot:find') burgershot.findHouse();
      else if (item.doName == 'bugstar:find') bugstars.findHouse();
      else if (item.doName == 'sunb:find') sunBleach.findHouse();
      else if (item.doName == 'water:find') waterPower.findHouse();
      else if (item.doName == 'trucker:getList') mp.events.callRemote('server:trucker:showMenu');
      else if (item.doName == 'trucker:stop') trucker.stop();
      else if (item.doName == 'takeTool') user.takeTool();
      else if (item.doName == 'showVehicleAutopilotMenu') menuList.showVehicleAutopilotMenu();
      else if (item.eventName == 'server:vehicle:neonStatus') mp.events.callRemote(item.eventName);
      else if (item.eventName == 'server:vehicle:lockStatus') {
        if (data.get('fraction_id') > 0) {
          if (data.get('fraction_id') == user.get('fraction_id'))
            mp.events.callRemote(item.eventName);
          else mp.game.ui.notifications.show('~r~Aracın anahtarları sende değil.');
        } else mp.events.callRemote(item.eventName);
      } else if (item.eventName == 'server:vehicle:engineStatus') {
        user.engineVehicle();
      } else if (item.doName == 'showVehicleDoMenu') {
        menuList.showVehicleDoMenu();
      } else if (item.eventName == 'server:vehicleFreeze') {
        if (methods.getCurrentSpeed() > 4) {
          mp.game.ui.notifications.show("~r~Hız saatte 5km'den az olmalıdır.");
          return;
        }
        mp.events.callSocket('server:vehicleFreeze')

        let isFreeze = !mp.players.local.vehicle.getVariable('freezePosition');

        if (isFreeze === true) mp.game.ui.notifications.show('~g~Bir capa ayarladiniz');
        else mp.game.ui.notifications.show('~y~Capayi kaldirdiniz');
      } else if (item.eventName == 'server:vehicle:park') {
        if (!mp.players.local.vehicle) return mp.game.ui.notifications.show('~r~Aracın içinde olmalısınız.');
        if (mp.players.local.vehicle.getSpeed() > 1) return mp.game.ui.notifications.show('~r~Araç haraket halinde olmamalıdır.');
        if (inGreenZone()) return mp.game.ui.notifications.show('~r~Yesil alana park edemezsiniz');
        UIMenu.Menu.HideMenu();
        mp.events.callSocket(item.eventName);
      } else if (item.eventName == 'server:autosalon:unrent') {
        UIMenu.Menu.HideMenu();
        mp.events.callSocket(item.eventName);
      } else if (item.eventName == 'server:vehicle:setNeonColor') {
        UIMenu.Menu.HideMenu();
        mp.game.ui.notifications.show('Renk girin ~r~R~g~G~b~B');
        let r = <number>await <any>UIMenu.Menu.GetUserInput('R', '', 3);
        let g = <number>await <any>UIMenu.Menu.GetUserInput('G', '', 3);
        let b = <number>await <any>UIMenu.Menu.GetUserInput('B', '', 3);
        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;
        mp.events.callRemote(
          item.eventName,
          methods.parseInt(r),
          methods.parseInt(g),
          methods.parseInt(b)
        );
      } else if (item.eventName) {
        UIMenu.Menu.HideMenu();
        mp.events.callRemote(item.eventName);
      }
    });
  },

  showVehicleAutopilotMenu: function () {
    let vInfo = methods.getVehicleInfo(mp.players.local.vehicle.model);
    if (vInfo.fuel_min != 0) return;
    let menu = UIMenu.Menu.Create(`Nakliye`, `~b~Otopilot menusu`);

    menu.AddMenuItem('~g~Acma').doName = 'enable';
    menu.AddMenuItem('~y~Kapama').doName = 'disable';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      if (item.doName == 'enable') {
        let vInfo = methods.getVehicleInfo(mp.players.local.vehicle.model);
        if (vInfo.fuel_min != 0) return;
        vehicles.enableAutopilot();
      } else if (item.doName == 'disable') {
        vehicles.disableAutopilot();
      }
    });
  },

  showVehicleDoMenu: function () {
    try {
      let menu = UIMenu.Menu.Create(`Nakliye`, `~b~Uygulamak icin Enter tusuna basin`);

      let listEn = ['Kapali', 'Acik'];

      let actualData = mp.players.local.vehicle.getVariable('vehicleSyncData');

      let listItem = menu.AddMenuItemList(
        'Alarm',
        listEn,
        'Donus sinyalleri su anda acik [ ? ]'
      );
      listItem.doName = 'twoIndicator';
      listItem.Index =
        actualData.IndicatorRightToggle === true && actualData.IndicatorLeftToggle === true ? 1 : 0;

      listItem = menu.AddMenuItemList('Ic aydinlatma', listEn, 'Gunduz gorus mesafesi cok zayif');
      listItem.doName = 'light';
      listItem.Index = actualData.InteriorLight === true ? 1 : 0;

      /*if (methods.getVehicleInfo(mp.players.local.vehicle.model).display_name == 'Taxi') {
              listItem = menu.AddMenuItemList("Свет на шашке", listEn);
              listItem.doName = 'lightTaxi';
              listItem.Index = actualData.TaxiLight === true ? 1 : 0;
          }*/

      let closeItem = menu.AddMenuItem('~r~Kapat');

      let listIndex = 0;
      menu.ListChange.on((item, index) => {
        listIndex = index;
      });

      menu.ItemSelect.on((item, index) => {
        if (item == closeItem) UIMenu.Menu.HideMenu();

        if (item.doName == 'light') {
          vehicles.setInteriorLightState(listIndex == 1);
        }
        if (item.doName == 'lightTaxi') {
          vehicles.setTaxiLightState(listIndex == 1);
        }
        if (item.doName == 'twoIndicator') {
          vehicles.setIndicatorLeftState(listIndex == 1);
          vehicles.setIndicatorRightState(listIndex == 1);
        }
      });
    } catch (e) {
      methods.debug(e);
    }
  },


  showMainMenu: function () {
    let menu = UIMenu.Menu.Create(`Menu`, `~b~Yardim menusu`);

    menu.AddMenuItem('Karakter').SetIcon('man').doName = 'showPlayerMenu';
    menu.AddMenuItem('Nakliye').SetIcon('hatchback').eventName = 'onKeyPress:2';
    menu.AddMenuItem('Oyuncularin listesi').SetIcon('teamwork').eventName = 'server:users:list';

    if (user.get('fraction_id2') > 0)
      menu.AddMenuItem('Neof organizasyon').SetIcon('Item_45').doName = 'showFraction2Menu';

    menu.AddMenuItem('Yardim').SetIcon('help').doName = 'showHelpMenu';
    menu.AddMenuItem('GPS').SetIcon('map').doName = 'showGpsMenu';
    menu.AddMenuItem('Ayarlar').SetIcon('settings').doName = 'showSettingsMenu';

    menu.AddMenuItem('~y~Bir soru sorun').SetIcon('ask').eventName = 'server:sendAsk';
    if (user.get('helper_level') > 0)
      menu.AddMenuItem('~y~Sorulari cevaplayin').SetIcon('ask').eventName = 'server:sendAnswerAsk';
    menu.AddMenuItem('~r~Sikayet (/report)').SetIcon('report').eventName = 'server:sendReport';
    if (user.get('admin_level') > 0)
      menu.AddMenuItem('~r~Sikayetleri cevaplayin').SetIcon('report').eventName = 'server:sendAnswerReport';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName != undefined) {
        if (item.eventName == 'server:sendAsk') {
          if (helperWait) return mp.game.ui.notifications.show('~r~60 Saniye bekleyin');;
          let text = await UIMenu.Menu.GetUserInput('Bir soru sorun', '', 300);
          if (text != '') {
            mp.events.callRemote('server:sendAsk', text);
            helperWait = true;
            setTimeout(() => {
              helperWait = false
            }, 60000)
          }
        } else if (item.eventName == 'server:sendAnswerAsk') {
          let id = await UIMenu.Menu.GetUserInput('ID', '', 5);
          let text = await UIMenu.Menu.GetUserInput('Yanitla', '', 300);
          if (text != '') mp.events.callRemote('server:sendAnswerAsk', methods.parseInt(id), text);
        } else if (item.eventName == 'server:sendReport') {
          report();
        } else if (item.eventName == 'server:sendAnswerReport') {
          let id = await UIMenu.Menu.GetUserInput('ID', '', 5);
          let text = await UIMenu.Menu.GetUserInput('Yanitla', '', 300);
          if (text != '') mp.events.callRemote('server:sendAnswerReport', methods.parseInt(id), text);
        } else mp.events.callRemote(item.eventName);
      } else if (item.doName == 'showSettingsMenu') menuList.showSettingsMenu();
      else if (item.doName == 'showHelpMenu') menuList.showHelpMenu();
      else if (item.doName == 'showGpsMenu') menuList.showGpsMenu();
      else if (item.doName == 'showPlayerMenu') menuList.showPlayerMenu();
      else if (item.doName == 'showFraction2Menu') menuList.showFraction2Menu();
    });
  },

  showFraction2Menu: async function () {
    let frType = await Container.Get(mp.players.local.remoteId, 'fractionType');

    let menu = UIMenu.Menu.Create(`Organizasyon`, `~b~Menu organizasyonu`);
    menu.AddMenuItem('Organizasyon uyelerine yazin').doName = 'sendFractionMessage';

    if (user.isLeader2() || user.isSubLeader2())
      menu.AddMenuItem('~g~Organizasyona katilin').doName = 'showFraction2MemberInviteMenu';

    if (frType == 3 || frType == 4) {
      if (user.get('rank2') > 9)
        menu.AddMenuItem('Mafya ile temasa gecmek').doName = 'sendMafiaMessage';
    }

    menu.AddMenuItem('Etiket ayarla').doName = 'setTag';
    menu.AddMenuItem('Uyelerin listesi').eventName = 'server:showMember2ListMenu';

    if (frType == 3 || frType == 4) menu.AddMenuItem('~y~Kara para aklamak').doName = 'clearMoney';
    // if (frType == 3) menu.AddMenuItem('~y~Список территорий').doName = 'gangList';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'sendFractionMessage') {
        let text = await UIMenu.Menu.GetUserInput('Metin', '', 55);
        if (text == '') return;
        methods.notifyWithPictureToFraction2(
          user.get('rp_name'),
          `Organizasyon`,
          text,
          'CHAR_DEFAULT',
          user.get('fraction_id2')
        );
      } else if (item.doName == 'sendMafiaMessage') {
        if (user.get('phone_code') == 0) {
          mp.game.ui.notifications.show(`~r~Telefonun yok`);
          return;
        }
        let text = await UIMenu.Menu.GetUserInput('Metin', '', 55);
        if (text == '') return;
        let phone = user.get('phone_code') + '-' + user.get('phone');
        methods.notifyWithPictureToFraction(phone, `Iletisim`, text, 'CHAR_DEFAULT', 8);
        methods.notifyWithPictureToFraction(phone, `Iletisim`, text, 'CHAR_DEFAULT', 9);
        methods.notifyWithPictureToFraction(phone, `Iletisim`, text, 'CHAR_DEFAULT', 10);
        methods.notifyWithPictureToFraction(phone, `Iletisim`, text, 'CHAR_DEFAULT', 11);
        mp.game.ui.notifications.show(`~y~Mesaj gonderilmistir`);
      } else if (item.doName == 'showFraction2MemberInviteMenu') menuList.showPlayerInvite2Menu();
      else if (item.eventName == 'server:showMember2ListMenu') mp.events.callRemote(item.eventName);
      else if (item.doName == 'setTag') {
        let tag = await UIMenu.Menu.GetUserInput('Etiket', '', 16);
        tag = methods.removeQuotes(tag);
        if (tag == '') mp.game.ui.notifications.show(`~y~Etiketi sildin`);
        else mp.game.ui.notifications.show(`~y~Etiket olusturdun - ~s~${tag}`);
        user.set('tag', tag);
        user.setData('tag', tag);
        user.saveAccount();
      } else if (item.doName == 'clearMoney') {
        user.setWaypoint(-139, -631);
        mp.game.ui.notifications.show(`~y~Arcadius ofislerine git ve para akla`);
      }
      // else if (item.doName == 'gangList') {
      //   menuList.showGangZoneListMenu();
      // }
    });
  },

  showAdminMenu: function () {
    let menu = UIMenu.Menu.Create(``, `~b~Yonetici menusu`, false, false, false, 'admin', 'admin', true);
    menu.AddMenuItem('~b~Yonetici menusu ~s~(~g~Beta_v2~s~)').doName = 'adminNewMenu';
    if (user.isAdmin() && mp.players.local.getVariable('enableAdmin') === true) {
      menu.AddMenuItem('Araba yarat').doName = 'spawnVeh';
      menu.AddMenuItem('Araba rengi').doName = 'colorVeh';
      menu.AddMenuItem('Giyim').doName = 'cloth';
      menu.AddMenuItem('Noclip (Eski)').doName = 'noclipOld';
      menu.AddMenuItem('~b~Ek oyuncu detaylari').doName = 'switchHpAp';
      menu.AddMenuItem('~b~Ek araba verileri').doName = 'advancedData';
      menu.AddMenuItem('Bildirim').doName = 'notify';
      menu.AddMenuItem('Hapisaneye gir').doName = 'jail';
      menu.AddMenuItem('Bir oyuncuyu at').doName = 'kick';
      menu.AddMenuItem('Bir oyuncuya isinlan').doName = 'tptoid';
      menu.AddMenuItem('Bir oyuncuyu kendinize cekin').doName = 'tptome';
      // menu.AddMenuItem('Инвиз ON').doName = 'invisibleON';
      // menu.AddMenuItem('Инвиз OFF').doName = 'invisibleOFF';
      menu.AddMenuItem('Godmode Acik/Kapali').doName = 'godmode';
      menu.AddMenuItem('Isarete isinlan').doName = 'teleportToWaypoint';
      menu.AddMenuItem('Arabayi tamir et').doName = 'fixvehicle';
      menu.AddMenuItem('En yakin araci resp. edin').doName = 'respvehicle';
      menu.AddMenuItem('En yakin araci silin').doName = 'deletevehicle';
      menu.AddMenuItem('En yakin araci cevirin').doName = 'flipVehicle';
      menu.AddMenuItem('Kimlik degistirin (ID)').eventName = 'server:user:changeIdadmin';
      menu.AddMenuItem('Kimlik yukle (ID)', 'Varsayilan 15').eventName = 'client:distId';
      menu.AddMenuItem('Ilk yardim saglayin').eventName = 'server:user:healFirstAdmin';
      menu.AddMenuItem('Defibrilator').eventName = 'server:user:adrenaline';

      if (user.isAdmin(5)) {
        menu.AddMenuItem('Kordinatlar').doName = 'server:user:getPlayerPos';
        // menu.AddMenuItem('Новый ТС').doName = 'newVehicle';
        menu.AddMenuItem('Giyim').doName = 'debug';
      }
      menu.AddMenuItem('~y~Yonetici modunu kapat').doName = 'disableAdmin';
      /*if (user.isAdmin(2)) {
        menu.AddMenuItem(
          '~r~Сбросить таймер',
          'Так блять, кто нажмет без спроса, тому пиздец'
        ).doName = 'dropTimer';
      }*/
    } else {
      menu.AddMenuItem('~y~Yonetici modunu acin').doName = 'enableAdmin';
    }

    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {

      if (item.doName == 'adminNewMenu') mp.events.callRemote('admin:menu')
      if (item.doName == 'switchHpAp') user.showhpap = !user.showhpap;
      if (item.doName == 'advancedData') {
        user.adminAdvancedData = !user.adminAdvancedData
        mp.game.ui.notifications.show('AdvancedData: ' + (user.adminAdvancedData ? "~g~Acik" : "~r~Kapat"));
      }
      if (item.doName == 'noclipOld') noClipSwitch();
      if (item.doName == 'enableAdmin') user.setVariable('enableAdmin', true), UIMenu.Menu.HideMenu();
      if (item.doName == 'disableAdmin') {
        user.setVariable('enableAdmin', false)
        if (user.godmode) mp.players.local.setInvincible(false), user.godmode = false;
        UIMenu.Menu.HideMenu();
      };
      if (item.eventName == 'server:user:changeIdadmin') {
        UIMenu.Menu.HideMenu();
        let id = await UIMenu.Menu.GetUserInput('Yeni kimlik (ID)', '', 10);
        mp.events.callRemote(item.eventName, methods.parseInt(id));
      } else if (item.eventName == 'client:distId') {
        UIMenu.Menu.HideMenu();
        let id = await UIMenu.Menu.GetUserInput('Mesafe', '', 10);
        mp.events.call(item.eventName, methods.parseInt(id));
      }
      // if (item.doName == 'newVehicle') {
      //   let vPrice = await UIMenu.Menu.GetUserInput('Цена', '', 10);
      //   let vCount = await UIMenu.Menu.GetUserInput('Кол-во', '', 4);
      //   if (vPrice == '') return;
      //   if (vCount == '') return;
      //   mp.events.callRemote('server:admin:newVehicle', vPrice, vCount);
      // }
      if (item.doName == 'spawnVeh') {
        UIMenu.Menu.HideMenu();
        let vName = await UIMenu.Menu.GetUserInput('Arac adi', '', 16);
        if (vName == '') return;

        let sayi = await UIMenu.Menu.GetUserInput('Arac sayisi', "1", 16);
        if (sayi == '') return;

        methods.saveLog('AdminSpawnVehicle', `${user.get('rp_name')} - ${vName}`);
        for (let i = 0; i < Number(sayi); i++) {
          mp.events.callRemote('server:admin:spawnVeh', vName);
        }
      }
      if (item.doName == 'colorVeh') {
        menuList.showAdminColorVehMenu();
      }
      if (item.doName == 'dropTimer') {
        mp.events.callRemote('server:gangWar:dropTimer');
      }
      if (item.doName == 'cloth') {
        menuList.showAdminClothMenu();
      }
      if (item.doName == 'godmode') {
        user.godmode = !user.godmode;
        mp.game.ui.notifications.show('GodMode: ' + (user.godmode ? "~g~Acik" : "~r~Kapali"));
        mp.players.local.setInvincible(user.godmode);
      }
      if (item.doName == 'debug') {
        menuList.showAdminDebugMenu();
      }
      if (item.doName == 'teleportToWaypoint') user.tpToWaypoint();
      if (item.doName == 'notify') {
        UIMenu.Menu.HideMenu();
        let title = await UIMenu.Menu.GetUserInput('Unvan', '', 20);
        if (title == '') return;
        let text = await UIMenu.Menu.GetUserInput('Haber metni', '', 55);
        if (text == '') return;
        methods.saveLog('AdminNotify', `${user.get('rp_name')} - ${title} | ${text}`);
        methods.notifyWithPictureToAll(title, 'Yonetim', text, 'CHAR_ACTING_UP');
      }
      if (item.doName == 'kick') {
        UIMenu.Menu.HideMenu();
        let id = await UIMenu.Menu.GetUserInput('Oyuncu kimliği (ID)', '', 10);
        let reason = await UIMenu.Menu.GetUserInput('Sebep', '', 100);
        methods.saveLog('AdminKick', `${user.get('rp_name')} - ${id} | ${reason}`);
        mp.events.callRemote('server:user:kickByAdmin', methods.parseInt(id), reason);
      }
      if (item.doName == 'jail') {
        UIMenu.Menu.HideMenu();
        let id = parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimliği (ID)', '', 10));
        let min = parseInt(await UIMenu.Menu.GetUserInput('Dakika', '', 10));
        let reason = await UIMenu.Menu.GetUserInput('Sebep', '', 100);
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`Kimlik yanlis (ID)`);
        if (isNaN(min) || min < 0) return mp.game.ui.notifications.show(`Saat dogru degil`);
        methods.saveLog('AdminJail', `${user.get('rp_name')} - ${id} | ${min}m | ${reason}`);
        mp.events.callRemote(
          'server:user:jailByAdmin',
          methods.parseInt(id),
          reason,
          methods.parseInt(min)
        );
      }
      if (item.doName == 'tptoid') {
        let id = parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimligi (ID)', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`Kimlik dogru degil (ID)`);
        mp.events.callRemote('server:user:tpTo', id);
      }
      if (item.doName == 'tptome') {
        let id = parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimliği (ID)', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`Kimlik dogru degil (ID)`);
        mp.events.callRemote('server:user:tpToMe', id);
      }
      if (item.doName == 'invisibleON') {
        mp.events.callRemote('server:user:setAlpha', 0);
        /*let visibleState = mp.players.local.isVisible();
              mp.players.local.setVisible(!visibleState, !visibleState);*/
        mp.game.ui.notifications.show(`~q~Gorunmezlik: Acik`);
      }
      if (item.doName == 'invisibleOFF') {
        mp.events.callRemote('server:user:setAlpha', 255);
        mp.game.ui.notifications.show(`~q~Gorunmezlik: Kapali`);
      }
      if (item.doName == 'fixvehicle') {
        mp.events.callRemote('server:user:fixNearestVehicle');
      }
      if (item.doName == 'respvehicle') {
        mp.events.callRemote('server:respawnNearstVehicle');
      }
      if (item.doName == 'deletevehicle') {
        mp.events.callRemote('server:deleteNearstVehicle');
      }
      if (item.doName == 'flipVehicle') {
        mp.events.callRemote('server:flipNearstVehicle');
      }
      if (item.doName == 'server:user:getPlayerPos') {
        mp.events.callRemote('server:user:getPlayerPos');
      }
      if (item.eventName == 'server:user:adrenaline') {
        UIMenu.Menu.HideMenu();
        let id = parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimliği (ID)', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`Kimlik dogru degil (ID)`);
        methods.saveLog('AdminHealPlayer', `${user.get('rp_name')} | Adrenaline to id: ${id}`);
        mp.events.callRemote('server:user:adrenaline', methods.parseInt(id));
      }
      if (item.eventName == 'server:user:healFirstAdmin') {
        UIMenu.Menu.HideMenu();
        let id = parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimliği (ID)', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`Kimlik dogru degil (ID)`);
        methods.saveLog('AdminHealPlayer', `${user.get('rp_name')} | Heal to id: ${id}`);
        mp.events.callRemote('server:user:healFirstAdmin', methods.parseInt(id));
      }
    });
  },

  showAdminColorVehMenu: function () {
    let menu = UIMenu.Menu.Create(`Admin`, `~b~Arac rengi`);

    let color1 = 0;
    let color2 = 0;

    let list = [];
    for (let j = 0; j < 156; j++) list.push(j + '');

    let list1Item = menu.AddMenuItemList('Renk 1', list);
    let list2Item = menu.AddMenuItemList('Renk 2', list);
    let list3Item: MenuItemClient;
    if (mp.players.local.vehicle.getLiveryCount() > 1) {
      let list2 = [];
      for (let j = 0; j < mp.players.local.vehicle.getLiveryCount(); j++) list2.push(j + '');
      list3Item = menu.AddMenuItemList('Livery', list2);
    }
    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ListChange.on((item, index) => {
      if (list3Item == item) {
        mp.events.callRemote('server:vehicle:setLivery', index);
        return;
      }
      if (list1Item == item) color1 = index;
      if (list2Item == item) color2 = index;
      mp.events.callRemote('server:vehicle:setColor', color1, color2);
    });

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showAdminClothMenu: function () {
    let menu = UIMenu.Menu.Create(`Admin`, `~b~Giyim`);

    let list = [];
    for (let j = 0; j < 500; j++) list.push(j + '');

    let listColor = [];
    for (let j = 0; j < 100; j++) listColor.push(j + '');

    let id = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let idColor = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    let id1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let idColor1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 12; i++) {
      let list1Item = menu.AddMenuItemList('Yuva ' + i, list);
      list1Item.slotId = i;
      list1Item._type = 0;

      let list2Item = menu.AddMenuItemList('Renk ' + i, list);
      list2Item.slotId = i;
      list2Item._type = 1;

      menu.AddMenuItem(' ');
    }

    for (let i = 0; i < 8; i++) {
      let list1Item = menu.AddMenuItemList('Pslot ' + i, list);
      list1Item.slotId = i;
      list1Item._type = 2;

      let list2Item = menu.AddMenuItemList('P renk ' + i, list);
      list2Item.slotId = i;
      list2Item._type = 3;

      menu.AddMenuItem(' ');
    }
    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ListChange.on((item, index) => {
      switch (item._type) {
        case 0:
          id[item.slotId] = index;
          user.setComponentVariation(item.slotId, id[item.slotId], idColor[item.slotId]);
          break;
        case 1:
          idColor[item.slotId] = index;
          user.setComponentVariation(item.slotId, id[item.slotId], idColor[item.slotId]);
          break;
        case 2:
          id1[item.slotId] = index;
          user.setProp(item.slotId, id1[item.slotId], idColor1[item.slotId]);
          break;
        case 3:
          idColor1[item.slotId] = index;
          user.setProp(item.slotId, id1[item.slotId], idColor1[item.slotId]);
          break;
      }
    });

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showAdminDebugMenu: function () {
    try {
      menuList.showUsmcArsenalMenu()
    } catch (e) {
      methods.debug('Exception: menuList.debug');
      methods.debug(e);
    }
  },


  showSapdClearMenu: function () {
    if (user.get('rank') < 4) {
      mp.game.ui.notifications.show('~r~4. Dereceden itibaren kullanilabilir');
      return;
    }

    let menu = UIMenu.Menu.Create(`PC`, `~b~Aramayi temizle`);
    menu.AddMenuItem('Aramayi temizle').eventName = 'server:user:giveWanted';
    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:user:giveWanted') {
        let id = await UIMenu.Menu.GetUserInput('Oyuncu kimliği (ID)', '', 10);
        mp.events.callRemote('server:user:giveWanted', methods.parseInt(id), 0, 'clear');
      }
    });
  },

  showHouseSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Ev', '~b~Ev satin almak yok.' + houseId);

    menu.AddMenuItem('Icin satin alin ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Reddet', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:houses:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showCarSellToPlayerMenu: function (houseId: number, name: string, sum: number, userId: number, slot: any) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Nakliye', '~b~Satin al ' + name);

    menu.AddMenuItem('Ulasim icin ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Reddet', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:car:sellToPlayer:accept', sum, userId, slot);
    });
  },

  showCondoSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Düz', '~b~Daire no. Satin al.' + houseId);

    menu.AddMenuItem('Sunun icin satin alin ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Reddet', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:condo:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showApartSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Apartman', '~b~Daire no. satin alin.' + houseId);

    menu.AddMenuItem('Sunun icin satin alin ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Reddet', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:apartments:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showStockSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Depo', '~b~Depo no. satin alin' + houseId);

    menu.AddMenuItem('Sunun icin satin alin ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Reddet', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:stock:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showBusinessSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Isletme', '~b~Is satin alin' + houseId);

    menu.AddMenuItem('Sunun icin satin alin ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Reddet', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:business:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showUsmcArsenalMenu: function () {
    let menu = UIMenu.Menu.Create(
      `USMC`,
      `~b~Dolap`,
      false,
      false,
      false,
      'shopui_title_gr_gunmod',
      'shopui_title_gr_gunmod'
    );


    let list = [
      'Civil',
      'Regular #1',
      'Regular #2',
      'Regular #3',
      'Tactical #1',
      'Tactical #2',
      'Pilot #1',
      'Pilot #2',
      'Officer',
      'Special #1',
      'Special #2',
      // 'Diving',
    ];
    menu.AddMenuItemList('Form', list);
    menu.AddMenuItem('~r~Kapat');

    menu.ListChange.on((item, index) => {
      mp.events.callRemote('server:uniform:usmc', index);
    });

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showSapdArrestMenu: function () {
    let menu = UIMenu.Menu.Create(`PC`, `~b~Tutuklama`);
    menu.AddMenuItem('Tutuklama').eventName = 'server:user:arrest';
    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:user:arrest') {
        let id = await UIMenu.Menu.GetUserInput('Oyuncu kimligi (ID)', '', 10);
        mp.events.callRemote('server:user:arrest', methods.parseInt(id));
      }
    });
  },

  showMember2ListMenu: function (data: [number, string][]) {
    let menu = UIMenu.Menu.Create(`Organizasyon`, `~b~Uye listesi`);

    data.forEach(function (item) {
      let nick = item[0].toString().substr(8);
      if ((user.isLeader2() || user.isSubLeader2()) && user.get('rp_name') != nick)
        menu.AddMenuItem(`${item[0]}`, `${item[1]}`).eventParam = nick;
      else menu.AddMenuItem(`${item[0]}`, `${item[1]}`);
    });

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventParam) menuList.showMember2DoMenu(item.eventParam);
    });
  },

  showMember2DoMenu: function (name: string) {
    let menu = UIMenu.Menu.Create(`Organizasyon`, `~b~` + name);

    menu.AddMenuItem(`Bir rutbe verin`).eventName = 'server:giveRank2';
    menu.AddMenuItem(`~r~Yangın`).eventName = 'server:uninvite2';

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:giveRank2') {
        let rank = methods.parseInt(await UIMenu.Menu.GetUserInput('Rutbe', '', 2));
        if (isNaN(rank) || rank < 1 || rank > 10) {
          mp.game.ui.notifications.show('~r~Sayi 0 dan yuksek 11 in altinda olmalidir');
          return;
        }

        mp.events.callRemote(item.eventName, name, rank);
      } else if (item.eventName == 'server:uninvite2') {
        mp.events.callRemote(item.eventName, name);
      }
    });
  },


  showDispatchTaxiMenu: function () {
    let menu = UIMenu.Menu.Create(`Sevkiyat gorevlisi`, `~b~Tikla ~g~Enter~b~ Meydan okumayi kabul et`);

    dispatcher.getItemTaxiList().forEach(function (item, idx) {
      let mItem = menu.AddMenuItem(
        `[${item.time}] ${item.title}`,
        `~b~[№${item.id}] Bolge: ~s~${item.street1}`
      );

      mItem.taxiId = item.id;
      mItem.taxiCount = item.count;
      mItem.taxiPrice = item.price;
      mItem.title = item.title;
      mItem.desc = item.desc;
      mItem.street1 = item.street1;
      mItem.posX = item.x;
      mItem.posY = item.y;
    });

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (closeItem == item) return;

      if (await Container.Has(item.taxiId, 'acceptTaxi')) {
        mp.game.ui.notifications.show('~r~Bu siparis zaten kabul edildi');
        return;
      }

      if (item.title.split('-').length == 2)
        mp.events.callRemote('server:user:sendTaxiAccept', item.title, item.taxiId);
      user.setWaypoint(item.posX, item.posY);
    });
  },

  showPlayerMenu: function () {
    if (user.get('jail_time') > 0) {
      mp.game.ui.notifications.show('~r~Hapishanede kullanamazsin');
      return;
    }

    let menu = UIMenu.Menu.Create(``, `~b~Karakter menunuz`);
    menu.spriteName = "profile";

    // menu.AddMenuItem('Инвентарь').doName = 'inventory';
    menu.AddMenuItem('Eylemler').SetIcon('hand').doName = 'showPlayerDoMenu';
    menu.AddMenuItem('Belgeler').SetIcon('Item_53').doName = 'showPlayerDoсMenu';
    if (user.get('phone_code') > 0) menu.AddMenuItem('Telefon').SetIcon('Item_8').doName = 'showPhoneMenu';
    if (user.get('is_buy_walkietalkie'))
      menu.AddMenuItem('Telsiz').SetIcon('Item_47').doName = 'showWalkietalkieMenu';

    if (
      user.get('job') == 'lawyer1' ||
      user.get('job') == 'lawyer2' ||
      user.get('job') == 'lawyer3'
    ) {
      menu.AddMenuItem(
        '~y~Tasinma anlasması teklif edin',
        'Sadece avukatlara aciktir'
      ).eventName = 'server:houses:lawyer:tryaddUser';
    }

    menu.AddMenuItem('Istatistikler').SetIcon('statistic').doName = 'showPlayerStatsMenu';
    menu.AddMenuItem('Ilk 20').SetIcon('top').doName = 'top';
    menu.AddMenuItem('Vip durumu').SetIcon('vip').doName = 'vipMenu';
    menu.AddMenuItem('Animasyonlar').SetIcon('anims').doName = 'showAnimationTypeListMenu';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'top') mp.events.callRemote('users:top')
      else if (item.doName == 'vipMenu') menuList.showPlayerVipMenu();
      else if (item.doName == 'showPlayerStatsMenu') menuList.showPlayerStatsMenu();
      else if (item.doName == 'showAnimationTypeListMenu') menuList.showAnimationTypeListMenu();
      // else if (item.doName == 'inventory')
      //   inventory.getItemList(inventory.types.Player, user.get('id'));
      else if (item.doName == 'showPlayerDoMenu') menuList.showPlayerDoMenu();
      else if (item.doName == 'showPlayerDoсMenu') menuList.showPlayerDoсMenu();
      else if (item.doName == 'showPhoneMenu') menuList.showPlayerPhoneMenu();
      else if (item.doName == 'showWalkietalkieMenu') menuList.showPlayerWalkietalkieMenu();
      else if (item.eventName == 'server:houses:lawyer:tryaddUser') {
        UIMenu.Menu.HideMenu();
        let id1 = await UIMenu.Menu.GetUserInput('Sahip kimligi (ID)', '', 10);
        let id2 = await UIMenu.Menu.GetUserInput('Yerlesim kimligi (ID)', '', 10);
        mp.events.callRemote(item.eventName, id1, id2);
      }
    });
  },

  showPlayerWalkietalkieMenu: function () {
    UIMenu.Menu.HideMenu();

    // mp.game.ui.notifications.show('~b~Рация временно не работает');
    // return;

    let menu = UIMenu.Menu.Create(`Telsiz`, `~b~Telsiz menusu`);

    // let list = ['Левый', 'Оба', 'Правый'];

    // let listBalItem = menu.AddMenuItemList(
    //   'Наушники',
    //   list,
    //   'Нажмите ~g~Enter~s~ чтобы применить'
    // );
    // listBalItem.doName = 'balance';
    // listBalItem.Index = methods.parseInt(user.get('s_radio_bal')) + 1;

    let listVoiceVol = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

    let listVoiceItem = menu.AddMenuItemList(
      'Ses seviyesi',
      listVoiceVol,
      'Tıkla ~g~Enter~s~ Uygulamak icin'
    );
    listVoiceItem.doName = 'vol';
    listVoiceItem.Index = methods.parseInt(user.get('s_radio_vol') * 10);

    menu.AddMenuItem('Frekans degistirme').doName = 'frequency';
    menu.AddMenuItem('Referans').doName = 'about';

    /*menu.AddMenuItem(UiMenu, "Справка").Activated += (uimenu, item) =>
      {
          HideMenu();
          UI.ShowToolTip("~b~Справка\n~s~Говорить на кнопку ~INPUT_VEH_PUSHBIKE_SPRINT~.\nДоп клавиши зажимать не надо!");
      };*/

    let backButton = menu.AddMenuItem('~g~Geri');
    let closeButton = menu.AddMenuItem('~r~Kapat');

    let radioVol = 1;
    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'vol') {
        radioVol = index / 10;

        if (radioVol == 0.0) radioVol = 0.001;

        user.setData('s_radio_vol', radioVol);
        // voice.setSettings('radioVolume', radioVol);
        mp.game.ui.notifications.show('~b~Bir deger belirlediniz: ~s~' + radioVol * 100 + '%');
      }
    });

    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'balance') {
        user.setData('s_radio_bal', index - 1.0);
        // voice.setSettings('radioBalance', index - 1.0);
        mp.game.ui.notifications.show('~g~Kulaklik takilmistir');
      }
    });

    menu.ItemSelect.on(async (item, index) => {
      if (item == closeButton) UIMenu.Menu.HideMenu();
      else if (item == backButton) {
        menuList.showPlayerMenu();
      } else if (item.doName == 'frequency') {
        let num = parseInt(await UIMenu.Menu.GetUserInput('Bir yere kadar', '', 4));
        num = methods.parseInt(num);
        if (num > 3520 || num < 30) {
          mp.game.ui.notifications.show('~r~Deger 30 ile 3520 arasında olmalidir');
          return;
        }
        if (num > 2000 && num < 3000 && !user.isGos()) {
          mp.game.ui.notifications.show('~r~2000 İle 3000 arasindaki frekansler devlet kurumlarına tahsis edilmistir');
          return;
        }
        let num2 = parseInt(await UIMenu.Menu.GetUserInput('Noktadan sonra', '', 3));
        num2 = methods.parseInt(num2);
        if (num2 < 0) {
          mp.game.ui.notifications.show('~r~Deger 0 sayisindan buyuk olmalidir');
          return;
        }
        let walkie_num = num + '.' + num2;
        user.set('walkietalkie_num', walkie_num);
        user.setData('walkietalkie_num', walkie_num);
        mp.events.callRemote('voice.server.changeRadioFrequency', walkie_num);
        mp.game.ui.notifications.show('~g~Deger seti: ~s~' + walkie_num);
      } else if (item.doName == 'about') {
        mp.gui.chat.push(`!{03A9F4}Telsiz sadece CAPS LOCK tusu ile calismaktadir!`);
      }
    });
  },

  showPlayerDoMenu: function () {
    let menu = UIMenu.Menu.Create(`Eylem`, `~b~Eylem menusu`);

    menu.AddMenuItem('Parayi teslim et').doName = 'giveMoney';
    menu.AddMenuItem('Tanışma istegi gonder').doName = 'dating';
    //menu.AddMenuItem("Вырубить").doName = '';
    menu.AddMenuItem('Kelepceleri cikar').doName = 'unCuff';
    menu.AddMenuItem('En yakin arabaya surukle').doName = 'inCar';
    menu.AddMenuItem('Yol gosterin').eventName = 'server:taskFollow';
    menu.AddMenuItem('Maskeyi cikar').eventName = 'server:taskRemoveMask';
    menu.AddMenuItem('Aractan disari cek').eventName = 'server:removeFromCar';
    // menu.AddMenuItem('Обыск игрока').doName = 'search';
    // menu.AddMenuItem('Изъять экипированное оружие').doName = 'removeAllWeaponsNearst';

    // menu.AddMenuItem(
    //   '~y~Посмотреть жетон',
    //   'Показывает жетон сотрудника ПД / Шерифов'
    // ).doName = 'seeGosDoc';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'giveMoney') menuList.showPlayerGiveMoneyMenu();
      else if (item.doName == 'dating') menuList.showPlayerDatingMenu();
      else if (item.doName == 'unCuff') mp.events.callRemote('server:unCuffNearst');
      // else if (item.doName == 'search') mp.events.callRemote('server:getInvNearst');
      // else if (item.doName == 'removeAllWeaponsNearst')
      //   mp.events.callRemote('server:removeAllWeaponsNearst');
      else if (item.doName == 'inCar') mp.events.callRemote('server:inCarNearst');
      else if (item.doName == 'seeGosDoc') menuList.showPlayerSeeDocMenu();
      else if (item.eventName == 'server:taskFollow') mp.events.callRemote(item.eventName);
      else if (item.eventName == 'server:taskRemoveMask') mp.events.callRemote(item.eventName);
      else if (item.eventName == 'server:removeFromCar') mp.events.callRemote(item.eventName);
    });
  },

  showPlayerDoсMenu: function () {
    let menu = UIMenu.Menu.Create(`Belgeler`, `~b~Belge menusu`);

    if (user.isGos()) menu.AddMenuItem('Kimligini goster').doName = 'showGosDoc';

    menu.AddMenuItem('Pasaportunuzu gosterin').doName = 'showCardId';
    menu.AddMenuItem('Lisanslari gosterin').doName = 'showLic';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName) menuList.showPlayerShowDocMenu(item.doName);
    });
  },

  showPlayerSeeDocMenu: function () {
    let menu = UIMenu.Menu.Create(`Eylem`, `~b~Rozeti goruntule`);

    mp.players.forEachInRange(mp.players.local.position, 5, function (p) {
      if (p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        //TODO
        chat.sendMeCommand('Yanindaki adama bakar');
        mp.events.callRemote('server:user:seeGosDoc', item.remoteId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerShowDocMenu: function (eventName: string) {
    let menu = UIMenu.Menu.Create(`Eylem`, `~b~Belgeleri goster`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        //TODO
        chat.sendMeCommand('Belge gosterildi');
        mp.events.callRemote('server:user:' + eventName, item.remoteId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerGiveMoneyMenu: function () {
    let menu = UIMenu.Menu.Create(`Eylem`, `~b~Parayi teslim et`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p && mp.players.exists(p) && p != mp.players.local && p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.remoteId >= 0) {
          let money = methods.parseInt(await UIMenu.Menu.GetUserInput('Miktar', '', 9));
          if (money < 1) {
            mp.game.ui.notifications.show('~r~1$ daha az para veremezsiniz');
            return;
          }
          mp.events.callRemote('server:user:giveMoneyToPlayerId', item.remoteId, money);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerDatingMenu: function () {
    let menu = UIMenu.Menu.Create(`Eylem`, `~b~Arkadaslik`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p && mp.players.exists(p) && p != mp.players.local && p.getAlpha() > 0 && !user.isDead(p))
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.remoteId >= 0) {
          let rpName = user.get('rp_name');
          //let name = await UIMenu.Menu.GetUserInput('Kendini nasil tanitacaksin?', rpName[0], 30);
          if (rpName == '') return;
          mp.events.callRemote('server:user:askDatingToPlayerId', item.remoteId, rpName);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerDatingAskMenu: function (playerId: number, name: string) {
    let player = mp.players.atRemoteId(playerId);

    if (mp.players.exists(player)) {
      let menu = UIMenu.Menu.Create(
        `Arkadaslik`,
        `~b~${player.getVariable('id')} Tanismak istiyor`
      );

      menu.AddMenuItem('~g~Tanismayi kabul et').doName = 'yes';
      menu.AddMenuItem('~r~Reddet');

      menu.AddMenuItem('~r~Kapat');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item.doName) {
          let rpName = user.get('rp_name');
          /* let nameAnswer = await UIMenu.Menu.GetUserInput('Kendini nasil tanitacaksin?', rpName[0], 30);
           if (nameAnswer == '') return;
           nameAnswer = nameAnswer.replace(/[^a-zA-Z\s]/gi, '');
           if (nameAnswer == '' || nameAnswer == ' ') {
             mp.game.ui.notifications.show('~r~Sadece Ingilizce harfler mevcuttur');
             return;
           }*/
          mp.events.callRemote('server:user:askDatingToPlayerIdYes', playerId, name, rpName);
          user.playAnimationWithUser(player.getVariable('id'), 0);
        }
      });
    }
  },


  showPlayerInvite2Menu: function () {
    let menu = UIMenu.Menu.Create(`Eylem`, `~b~Organizasyona katilin`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p && mp.players.exists(p) && p != mp.players.local && p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.remoteId >= 0) mp.events.callRemote('server:user:inviteFraction2', item.remoteId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerStatsMenu: function () {
    let menu = UIMenu.Menu.Create(`Karakter`, `~b~${user.get('rp_name')}`);

    menu.AddMenuItem('~b~Isim:~s~').SetRightLabel(`${user.get('rp_name')}`);
    menu.AddMenuItem('~b~Seviye:~s~').SetRightLabel(`${user.getLevel()} (${user.getExp()} / ${user.getMaxExp()})`);
    menu.AddMenuItem(((user.warns >= 2) ? "~r~" : "~b~") + 'Uyari:~s~').SetRightLabel(`[${user.warns}/3]`);
    menu.AddMenuItem('~b~Yas:~s~').SetRightLabel(`${user.get('age')}`);
    menu.AddMenuItem('~b~Oynama suresi:~s~').SetRightLabel(`${user.online_time} минут`);
    menu.AddMenuItem('~b~Bugun oynandi:~s~').SetRightLabel(`${user.online_today}/24 часов`);

    menu.AddMenuItem('~b~Organizasyon:~s~').SetRightLabel(
      `${user.get('fraction_id') > 0
        ? methods.getFractionName(user.get('fraction_id'))
        : methods.getJobName(user.get('job'))
      }`
    );
    menu.AddMenuItem('~b~Kayit islemleri:~s~').SetRightLabel(`${user.getRegStatusName()}`);
    if (user.get('reg_time') > 0)
      menu.AddMenuItem('~b~Kayit suresi:~s~').SetRightLabel(
        `${(user.get('reg_time') / 31.0).toFixed(2)} мес.`
      );
    if (user.get('bank_prefix') > 0)
      menu.AddMenuItem('~b~Kart numarasi:~s~').SetRightLabel(
        `${user.get('bank_prefix')}-${user.get('bank_number')}`
      );
    if (user.get('phone_code') > 0)
      menu.AddMenuItem('~b~Telefon numarasi:~s~').SetRightLabel(
        `${user.get('phone_code')}-${user.get('phone')}`
      );

    menu.AddMenuItem('~b~Araniyor..:~s~').SetRightLabel(
      `${user.get('wanted_level') > 0 ? '~r~Aranan' : '~g~Kapat'}`
    );
    menu.AddMenuItem('~b~Devlet kuruluslarinin acil durumlari:~s~').SetRightLabel(
      `${user.get('is_gos_blacklist') ? '~r~Evet' : '~g~Hayir'}`
    );
    menu.AddMenuItem('~b~Marihuana tarifi:~s~').SetRightLabel(
      `${user.get('allow_marg') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~"A" Kategori lisansi:~s~').SetRightLabel(
      `${user.get('a_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~"B" Kategori lisansi:~s~').SetRightLabel(
      `${user.get('b_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~"C" Kategori lisansi:~s~').SetRightLabel(
      `${user.get('c_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Hava araclari lisansi:~s~').SetRightLabel(
      `${user.get('air_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Su tasimaciligi lisansi:~s~').SetRightLabel(
      `${user.get('ship_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Silah lisansi:~s~').SetRightLabel(
      `${user.get('gun_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Taksi surucu lisansi:~s~').SetRightLabel(
      `${user.get('taxi_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Avukatlik lisansi:~s~').SetRightLabel(
      `${user.get('law_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Isletme lisansi:~s~').SetRightLabel(
      `${user.get('biz_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Balikcilik lisansi:~s~').SetRightLabel(
      `${user.get('fish_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );
    menu.AddMenuItem('~b~Saglik sigortasi:~s~').SetRightLabel(
      `${user.get('med_lic') ? 'Kontrol et' : '~r~Kapat'}`
    );

    menu.AddMenuItem('~b~Dayaniklilik:~s~').SetRightLabel(`${user.get('mp0_stamina') + 1}%`);
    menu.AddMenuItem('~b~Kuvvet:~s~').SetRightLabel(`${user.get('mp0_strength') + 1}%`);
    menu.AddMenuItem('~b~Akciger hacmi:~s~').SetRightLabel(
      `${user.get('mp0_lung_capacity') + 1}%`
    );
    menu.AddMenuItem('~b~Surucu becerisi:~s~').SetRightLabel(
      `${user.get('mp0_wheelie_ability') + 1}%`
    );
    menu.AddMenuItem('~b~Pilotluk becerisi:~s~').SetRightLabel(
      `${user.get('mp0_flying_ability') + 1}%`
    );
    menu.AddMenuItem('~b~Atis becerisi:~s~').SetRightLabel(
      `${user.get('mp0_shooting_ability') + 1}%`
    );
    menu.AddMenuItem('~b~Soforluk becerisi:~s~').SetRightLabel(
      `${(user.get('skill_taxi') / 4).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Postaci becerisi:~s~', 'Operasyon sonrasi sirket').SetRightLabel(
      `${(user.get('skill_mail') / 10).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Postaci becerisi:~s~', 'Orgonizasyon GoPostali').SetRightLabel(
      `${(user.get('skill_mail2') / 10).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Fotografcinin becerisi:~s~').SetRightLabel(
      `${(user.get('skill_photo') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Daire temizleyicisinin becerileri:~s~').SetRightLabel(
      `${(user.get('skill_sunb') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Bomba imha uzmaninin becerisi:~s~').SetRightLabel(
      `${(user.get('skill_bgstar') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Bir yemek dagitimcisisin:~s~').SetRightLabel(
      `${(user.get('skill_bshot') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Mekatronik becerisi:~s~').SetRightLabel(
      `${(user.get('skill_water') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Bahcivan becerisi:~s~').SetRightLabel(
      `${(user.get('skill_three') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Koleksiyoncunun becerisi:~s~').SetRightLabel(
      `${(user.get('skill_gr6') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Otobus soforu becerisi #1:~s~').SetRightLabel(
      `${(user.get('skill_bus1') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Otobus soforu becerisi #2:~s~').SetRightLabel(
      `${(user.get('skill_bus2') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Otobus soforu becerisi #3:~s~').SetRightLabel(
      `${(user.get('skill_bus3') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Kamyoncu becerisi:~s~').SetRightLabel(
      `${(user.get('skill_trucker') / 15).toFixed(2)}%`
    );

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'showPlayerStatsMenu') menuList.showPlayerStatsMenu();
      else if (item.doName == 'showAnimationTypeListMenu') menuList.showAnimationTypeListMenu();
    });
  },

  showPlayerVipMenu: function () {
    let menu = UIMenu.Menu.Create(`Vip durumu`, `~b~Bilgi edinmek`);
    let data = user.getVipData();
    if (data) {
      menu.AddMenuItem('~b~Baslik:~s~').SetRightLabel(`${data.name}`);
      menu.AddMenuItem('~b~Su tarihe kadar gecerlidir:~s~').SetRightLabel(`${methods.unixTimeStampToDateTime(user.get('vip_time'))}`);
      menu.AddMenuItem('~b~Maliyet:~s~').SetRightLabel(`${methods.numberFormat(data.cost)} Coins / karisiklik.`);
      menu.AddMenuItem('~b~Web sitesi uzerinden vergi odeme:~s~').SetRightLabel(`${data.sitepay ? "~g~Evet" : "~r~Hayir"}`);
      menu.AddMenuItem('~b~Araba yuvalarinin ucretsiz degisimi:~s~').SetRightLabel(`${data.changeslots ? "~g~Evet" : "~r~Jayir"}`);
      menu.AddMenuItem('~b~Tecrube bonusu:~s~').SetRightLabel(`${data.expbonus > 0 ? "+" + data.expbonus + " EXP" : "~r~Hayir"}`);
      menu.AddMenuItem('~b~Maas ikramiyesi:~s~').SetRightLabel(`+$${methods.numberFormat(data.moneybonus)}`);
      menu.AddMenuItem('~b~Bonus parasi:~s~').SetRightLabel(`${data.givecoin > 0 ? "+" + data.givecoin + " Coins" : "~r~Hayir"}`);
      menu.AddMenuItem('~b~AFK durabilme yetenegi:~s~').SetRightLabel(`${data.afkminutes} Min.`);
      menu.AddMenuItem('~b~Fraksiyondan ayrilma ~g~/vipuninvite~b~:~s~').SetRightLabel(`${data.vipuninvite ? "~g~Evet" : "~r~Hayir"}`);
      menu.AddMenuItem('~b~Karakter becerileri icin bonus:~s~').SetRightLabel(`${data.skillpersbonus > 0 ? "+" + (100 / data.skillpersbonus) + "%" : "~r~Hayir"}`);
      menu.AddMenuItem('~b~Is becerilerine bonus:~s~').SetRightLabel(`${data.skilljobbonus > 0 ? "+" + (100 / data.skilljobbonus) + "%" : "~r~Hayir"}`);
    } else {
      menu.AddMenuItem('~r~Bilgi bulunmamaktadir');
      menu.AddMenuItem('~b~Web sitesinden Vip alabilirsiniz');
      menu.AddMenuItem('~b~https://gta-5.ru/trade');
    }

  },

  showMenu: function (title: string, desc: string, menuData: Map<any, any>) {
    let menu = UIMenu.Menu.Create(title.toString(), `~b~${desc}`);

    /*for (let [key, value] of menuData)
          menu.AddMenuItem(`~b~${key}: ~s~`).SetRightLabel(value.toString());*/

    menuData.forEach(function (val, key, map) {
      menu.AddMenuItem(`~b~${key}: ~s~`).SetRightLabel(val.toString());
    });

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
    });
  },

  showTruckerOffersMenu: function (menuData: any[]) {
    let menu = UIMenu.Menu.Create('Yuk tasima', `~b~Siparis listesi`);

    //mp.game.pathfind.calculateTravelDistanceBetweenPoints(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, 0, 0, 0)
    menuData.forEach((item) => {
      let x = 0;
      let y = 0;
      let z = 0;
      let tx = 0;
      let ty = 0;
      let tz = 0;
      // if (item.length == 10) {
      x = item[3];
      y = item[4];
      z = item[5];
      tx = item[6];
      ty = item[7];
      tz = item[8];
      // } else {
      //   x = item[7];
      //   y = item[8];
      //   z = item[9];
      //   tx = item[11];
      //   ty = item[12];
      //   tz = item[13];
      // }
      let dist = mp.game.pathfind.calculateTravelDistanceBetweenPoints(x, y, z, tx, ty, tz);
      if (dist > 10000)
        dist = methods.parseInt(
          methods.distanceToPos(new mp.Vector3(x, y, z), new mp.Vector3(tx, ty, tz))
        );
      if (item[0]) {
        let menuItem = menu.AddMenuItem(
          `~b~№${item[0]}.~s~ ${item[1]}`,
          `~y~Mesafe: ~s~${dist}m\n~y~Yukleme yeri: ~s~${mp.game.ui.getLabelText(
            mp.game.zone.getNameOfZone(x, y, z)
          )}`
        );
        menuItem.SetRightLabel(`~g~$${methods.numberFormat(item[item.length - 1])}`);
        menuItem.offerId = item;
      }
    });
    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.offerId) menuList.showTruckerOfferInfoMenu(item.offerId);
      //mp.events.callRemote('server:tucker:acceptOffer', item.offerId);
    });
  },

  showTruckerOfferInfoMenu: function (item: any[]) {
    //id, name, company, x, y, z, px, py, pz, price
    //id, name, company, trName, cl1, cl2, liv, x, y, z, rot, px, py, pz, price

    //methods.debug(item);

    let x = 0;
    let y = 0;
    let z = 0;
    let tx = 0;
    let ty = 0;
    let tz = 0;
    // if (item.length == 10) {
    x = item[3];
    y = item[4];
    z = item[5];
    tx = item[6];
    ty = item[7];
    tz = item[8];
    // //  } else {
    //     x = item[7];
    //     y = item[8];
    //     z = item[9];
    //     tx = item[11];
    //     ty = item[12];
    //     tz = item[13];
    //   }

    let menu = UIMenu.Menu.Create(`Yuk tasima`, `~b~Siparis bilgisi`);

    let dist = mp.game.pathfind.calculateTravelDistanceBetweenPoints(x, y, z, tx, ty, tz);

    if (dist > 10000)
      dist = methods.parseInt(
        methods.distanceToPos(new mp.Vector3(x, y, z), new mp.Vector3(tx, ty, tz))
      );

    menu.AddMenuItem('~y~Siparis numarasi:~s~').SetRightLabel(item[0]);
    menu.AddMenuItem('~y~Kargo:~s~').SetRightLabel(item[1]);
    menu.AddMenuItem('~y~Sirket:~s~').SetRightLabel(item[2]);
    menu.AddMenuItem('~y~Maliyet~s~').SetRightLabel(
      `$${methods.numberFormat(item[item.length - 1])}`
    );
    menu.AddMenuItem('~y~Yukleme yeri:~s~').SetRightLabel(
      `${mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(x, y, z))}`
    );
    menu.AddMenuItem('~y~Bosaltma yeri:~s~').SetRightLabel(
      `${mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(tx, ty, tz))}`
    );
    menu.AddMenuItem('~y~Mesafe:~s~').SetRightLabel(`${dist}m`);
    menu.AddMenuItem('~g~Siparis al').accept = item[0];

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.accept) mp.events.callRemote('server:tucker:acceptOffer', item.accept);
    });
  },

  showLawyerOffersMenu: function (price: number, id: number, rpName: string) {
    let menu = UIMenu.Menu.Create('Avukat', `~b~${rpName}`);

    menu.AddMenuItem('~g~Kabul ediyorum', `Fiyat: ~g~$${methods.numberFormat(price)}`).eventName =
      'server:user:lawyer:accept';
    menu.AddMenuItem('~r~Reddetmek');

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName) mp.events.callRemote(item.eventName, id);
    });
  },

  showLawyerHouseOffersMenu: function (buyerId: number, id: number) {
    let menu = UIMenu.Menu.Create('Avukat', `~b~Teslimiyet`);

    menu.AddMenuItem('~g~Kabul ediyorum', `Fiyat: ~g~$10,000`).eventName =
      'server:houses:lawyer:addUser';
    menu.AddMenuItem('~r~Reddetmek');

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName) mp.events.callRemote(item.eventName, id, buyerId);
    });
  },

  showGpsMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Ana menu`);

    menu.AddMenuItem('Onemli yerler');
    menu.AddMenuItem('Isler');
    menu.AddMenuItem('Magzalar ve daha fazlasi');
    menu.AddMenuItem('Sirketler');
    menu.AddMenuItem('Ilginc mekanlar');
    menu.AddMenuItem('Esyalarim');
    menu.AddMenuItem('~y~Etiketi kaldirin');

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      if (index == 0) menuList.showGpsImportantMenu();
      else if (index == 1) menuList.showGpsJobMenu();
      else if (index == 2) menuList.showGpsOtherMenu();
      else if (index == 3) menuList.showGpsCompMenu();
      else if (index == 4) menuList.showGpsInterestingMenu();
      else if (index == 5) mp.events.callRemote('my:gps')
      else if (index == 6) user.removeWaypoint();
    });
  },

  showGpsImportantMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Onemli yerler`);

    let menuItem = menu.AddMenuItem('Kumarhane');
    menuItem.gpsX = 935.53;
    menuItem.gpsY = 46.44;

    menuItem = menu.AddMenuItem('Yarislar ve duellolar');
    menuItem.gpsX = -247.4;
    menuItem.gpsY = -2032.4;

    menuItem = menu.AddMenuItem('Atis poligonu');
    menuItem.gpsX = -1653.26;
    menuItem.gpsY = -3113.55;

    menuItem = menu.AddMenuItem('Müzayede');
    menuItem.gpsX = 478.74;
    menuItem.gpsY = -107.67;

    menuItem = menu.AddMenuItem(
      'Devlet Binasi',
      'Kayit yaptirma\nIstihdam\nDiger konular'
    );
    menuItem.gpsX = -546;
    menuItem.gpsY = -202;

    menuItem = menu.AddMenuItem('Lisans merkezi');
    menuItem.gpsX = -716;
    menuItem.gpsY = -1296;

    menuItem = menu.AddMenuItem(
      'Devlet bankasi "~r~Maze Bank~s~"',
      'Mulkunuzu satmak\nHesap islemleri'
    );
    menuItem.gpsX = -75;
    menuItem.gpsY = -826;

    menuItem = menu.AddMenuItem('Ozel banka "~o~Pacific Standard~s~"');
    menuItem.gpsX = 235.0;
    menuItem.gpsY = 216.0;

    //TODO GPS EVENT
    menuItem = menu.AddMenuItem('En yakin olani bulun "~g~Fleeca"~s~ Banka');
    menuItem.gpsEvent = 'server:gps:findFleeca';

    menuItem = menu.AddMenuItem('Ozel banka "~b~Blaine County~s~"');
    menuItem.gpsX = -111;
    menuItem.gpsY = 6467;

    menuItem = menu.AddMenuItem('Is merkezi"~b~Arcadius~s~"');
    menuItem.gpsX = -139;
    menuItem.gpsY = -631;

    menuItem = menu.AddMenuItem('Polis karakolu');
    menuItem.gpsX = 437;
    menuItem.gpsY = -982;

    menuItem = menu.AddMenuItem('Serif Departmani Paletto');
    menuItem.gpsX = -448;
    menuItem.gpsY = 6012;

    menuItem = menu.AddMenuItem('Serif Departmani Sandy');
    menuItem.gpsX = 1853;
    menuItem.gpsY = 3686;

    menuItem = menu.AddMenuItem('Los Santos Hastanesi');
    menuItem.gpsX = 354.65;
    menuItem.gpsY = -595.92;

    menuItem = menu.AddMenuItem('Federal hapishane');
    menuItem.gpsX = 1830;
    menuItem.gpsY = 2603;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsJobMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Isler`);

    let menuItem = menu.AddMenuItem('Insaatci', 'Yeni baslayanlar icin');
    menuItem.gpsX = -142;
    menuItem.gpsY = -936;

    menuItem = menu.AddMenuItem('Cam yikama', 'Yeni baslayanlar icin');
    menuItem.gpsX = -1539;
    menuItem.gpsY = -448;

    menuItem = menu.AddMenuItem('Yol calismalari', 'Yeni baslayanlar icin');
    menuItem.gpsX = 53;
    menuItem.gpsY = -723;

    menuItem = menu.AddMenuItem('Tas ocagi', 'Yeni baslayanlar icin');
    menuItem.gpsX = 2947;
    menuItem.gpsY = 2745;

    /*menuItem = menu.AddMenuItem("Свалка металлолома");
      menuItem.gpsX = -428;
      menuItem.gpsY = -1728;
  
      menuItem = menu.AddMenuItem("Стоянка мусоровозов");
      menuItem.gpsX = 1569;
      menuItem.gpsY = -2130;*/

    menuItem = menu.AddMenuItem('Bahcivanin sehpasi');
    menuItem.gpsX = -1146;
    menuItem.gpsY = -745;

    menuItem = menu.AddMenuItem('Otobus terminali');
    menuItem.gpsX = -675;
    menuItem.gpsY = -2166;

    menuItem = menu.AddMenuItem('Operasyon sonrasi');
    menuItem.gpsX = -416;
    menuItem.gpsY = -2855;

    menuItem = menu.AddMenuItem('GoPostal');
    menuItem.gpsX = 74;
    menuItem.gpsY = 120;

    menuItem = menu.AddMenuItem('Bugstarsta bir ilaclama gorevlisi');
    menuItem.gpsX = 151;
    menuItem.gpsY = -3083;

    menuItem = menu.AddMenuItem('BurgerShotta yemek dagıtım elemani');
    menuItem.gpsX = -1178;
    menuItem.gpsY = -891;

    menuItem = menu.AddMenuItem('Sunset Bleachde apartman temizleyicisi');
    menuItem.gpsX = -1194;
    menuItem.gpsY = -1480;

    menuItem = menu.AddMenuItem('Su ve Enerji alaninda mekatronik');
    menuItem.gpsX = 633;
    menuItem.gpsY = 125;

    menuItem = menu.AddMenuItem("O'Connorda bahcivan");
    menuItem.gpsX = -1146;
    menuItem.gpsY = -745;

    menuItem = menu.AddMenuItem('Life Invaderda fotografci');
    menuItem.gpsX = -1041;
    menuItem.gpsY = -241;

    // menuItem = menu.AddMenuItem('Учёный в Humane Labs');
    // menuItem.gpsX = 3616;
    // menuItem.gpsY = 3730;

    menuItem = menu.AddMenuItem('Downtown Cab. da taksi soforu');
    menuItem.gpsX = 895;
    menuItem.gpsY = -179;

    menuItem = menu.AddMenuItem('Ekspres araca servisi taksi soforu');
    menuItem.gpsX = 896;
    menuItem.gpsY = -1035;

    menuItem = menu.AddMenuItem('Gruppe6 da toplayici');
    menuItem.gpsX = 478;
    menuItem.gpsY = -1091;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsOtherMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Magzalar ve daha fazlasi`);

    let menuItem = menu.AddMenuItem('Aile eczanesi');
    menuItem.gpsX = 318;
    menuItem.gpsY = -1078;

    menuItem = menu.AddMenuItem('Elektronik alısveris #1');
    menuItem.gpsX = -658;
    menuItem.gpsY = -857;

    menuItem = menu.AddMenuItem('Elektronik alısveris #2');
    menuItem.gpsX = 1133;
    menuItem.gpsY = -472;

    //TODO GPS EVENT
    menuItem = menu.AddMenuItem('En yakin giyim magzasini bulun');
    menuItem.gpsEvent = 'server:gps:findCloth';

    menuItem = menu.AddMenuItem('En yakin magzayi bulun 24/7');
    menuItem.gpsEvent = 'server:gps:find247';

    menuItem = menu.AddMenuItem('En yakin benzin istasyonu bulun');
    menuItem.gpsEvent = 'server:gps:findFuel';

    //? ---
    menuItem = menu.AddMenuItem('Ekonomik araba showroomu');
    menuItem.gpsEvent = 'server:gps:findAutosalon1';

    menuItem = menu.AddMenuItem('OtoSalon konfor showroomu');
    menuItem.gpsEvent = 'server:gps:findAutosalon2';

    menuItem = menu.AddMenuItem('Elite OtoSalon showroomu');
    menuItem.gpsEvent = 'server:gps:findAutosalon3';

    menuItem = menu.AddMenuItem('Motosiklet showroomu');
    menuItem.gpsEvent = 'server:gps:findAutosalon4';

    menuItem = menu.AddMenuItem('Tekne arac showroomu');
    menuItem.gpsEvent = 'server:gps:findAutosalon5';

    menuItem = menu.AddMenuItem('Hava tasitlari showroomu');
    menuItem.gpsEvent = 'server:gps:findAutosalon6';

    menuItem = menu.AddMenuItem('Arac teknolojisi showroomu');
    menuItem.gpsEvent = 'server:gps:findAutosalon7';
    //? --

    menuItem = menu.AddMenuItem('Yakininizda bir bisiklet veya motosiklet kiralama merkezi bulun');
    menuItem.gpsEvent = 'server:gps:findRent';

    menuItem = menu.AddMenuItem('En yakin bari bulun');
    menuItem.gpsEvent = 'server:gps:findBar';

    menuItem = menu.AddMenuItem('En yakin silah dukkanini bulun');
    menuItem.gpsEvent = 'server:gps:findGunShop';

    /*menuItem = menu.AddMenuItem("Найти ближайший тату салон");
      menuItem.gpsEvent = 'server:gps:findTattooShop';*/

    menuItem = menu.AddMenuItem('En yakin berber dukkanini bulun');
    menuItem.gpsEvent = 'server:gps:findBarberShop';

    menuItem = menu.AddMenuItem('Bir atolye bulun');
    menuItem.gpsEvent = 'server:gps:findLsc';

    menuItem = menu.AddMenuItem('Meslekler icin alısveris yapin');
    menuItem.gpsX = -1337;
    menuItem.gpsY = -1277;

    menuItem = menu.AddMenuItem('Basimevi');
    menuItem.gpsX = -1234;
    menuItem.gpsY = -1477;

    menuItem = menu.AddMenuItem('Arac yikama');
    menuItem.gpsX = -700;
    menuItem.gpsY = -932;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsCompMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Sirketler`);

    let menuItem = menu.AddMenuItem('Post Op');
    menuItem.gpsX = -416;
    menuItem.gpsY = -2855;

    menuItem = menu.AddMenuItem('GoPostal');
    menuItem.gpsX = 74;
    menuItem.gpsY = 120;

    menuItem = menu.AddMenuItem('Bugstars');
    menuItem.gpsX = 151;
    menuItem.gpsY = -3083;

    menuItem = menu.AddMenuItem('BurgerShot');
    menuItem.gpsX = -1178;
    menuItem.gpsY = -891;

    menuItem = menu.AddMenuItem('Sunset Bleach');
    menuItem.gpsX = -1194;
    menuItem.gpsY = -1480;

    menuItem = menu.AddMenuItem('Water & Power');
    menuItem.gpsX = 633;
    menuItem.gpsY = 125;

    menuItem = menu.AddMenuItem("O'Connor");
    menuItem.gpsX = -1146;
    menuItem.gpsY = -745;

    menuItem = menu.AddMenuItem('Humane Labs');
    menuItem.gpsX = 3616;
    menuItem.gpsY = 3730;

    menuItem = menu.AddMenuItem('Life Invader');
    menuItem.gpsX = -1041;
    menuItem.gpsY = -241;

    menuItem = menu.AddMenuItem('Downtown Cab Co.');
    menuItem.gpsX = 895;
    menuItem.gpsY = -179;

    menuItem = menu.AddMenuItem('Express Car Service');
    menuItem.gpsX = 896;
    menuItem.gpsY = -1035;

    menuItem = menu.AddMenuItem('Gruppe6');
    menuItem.gpsX = 478;
    menuItem.gpsY = -1091;

    menuItem = menu.AddMenuItem('Bilgeco');
    menuItem.gpsX = 858;
    menuItem.gpsY = -3203;

    menuItem = menu.AddMenuItem('Jetsam');
    menuItem.gpsX = 114;
    menuItem.gpsY = -2569;

    menuItem = menu.AddMenuItem('Lando-Corp');
    menuItem.gpsX = 671;
    menuItem.gpsY = -2667;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsInterestingMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Ilginc yerler`);

    let menuItem = menu.AddMenuItem('Life Invader');
    menuItem.gpsX = -1041;
    menuItem.gpsY = -241;

    menuItem = menu.AddMenuItem('Uluslararasi havalimani');
    menuItem.gpsX = -1037;
    menuItem.gpsY = -2737;

    menuItem = menu.AddMenuItem('Spor salonu');
    menuItem.gpsX = -1204;
    menuItem.gpsY = -1564;

    menuItem = menu.AddMenuItem('Los santos meydani');
    menuItem.gpsX = 161;
    menuItem.gpsY = -993;

    menuItem = menu.AddMenuItem('Mega Moll alısveris merkezi');
    menuItem.gpsX = 46;
    menuItem.gpsY = -1753;

    menuItem = menu.AddMenuItem('Striptiz kulubu');
    menuItem.gpsX = 105;
    menuItem.gpsY = -1291;

    menuItem = menu.AddMenuItem('Tekila bar"');
    menuItem.gpsX = -562;
    menuItem.gpsY = 286;

    menuItem = menu.AddMenuItem('Sari jack bar"');
    menuItem.gpsX = 1986;
    menuItem.gpsY = 3054;

    menuItem = menu.AddMenuItem('Motorcu kulubu');
    menuItem.gpsX = 988;
    menuItem.gpsY = -96;

    menuItem = menu.AddMenuItem('Komedi kulubu');
    menuItem.gpsX = -450;
    menuItem.gpsY = 280;

    menuItem = menu.AddMenuItem('Plaj');
    menuItem.gpsX = -1581;
    menuItem.gpsY = -1162;

    menuItem = menu.AddMenuItem('Gozlemevi');
    menuItem.gpsX = -411;
    menuItem.gpsY = 1173;

    menuItem = menu.AddMenuItem('Vinewood yazilari');
    menuItem.gpsX = 716;
    menuItem.gpsY = 1203;

    menuItem = menu.AddMenuItem('Sahne-1');
    menuItem.gpsX = 226;
    menuItem.gpsY = 1173;

    menuItem = menu.AddMenuItem('Sahne-2');
    menuItem.gpsX = 689;
    menuItem.gpsY = 602;

    menuItem = menu.AddMenuItem('Rockford Hills Kütüphanesi');
    menuItem.gpsX = -615;
    menuItem.gpsY = -146;

    menuItem = menu.AddMenuItem('Gold kulubu');
    menuItem.gpsX = -1375;
    menuItem.gpsY = 55;

    menuItem = menu.AddMenuItem('Pacifix Bluffs Muzesi');
    menuItem.gpsX = -2291;
    menuItem.gpsY = 367;

    menuItem = menu.AddMenuItem('San Andreas Universitesi');
    menuItem.gpsX = -1636;
    menuItem.gpsY = 180;

    menuItem = menu.AddMenuItem('Rockford Hills Kilisesi');
    menuItem.gpsX = -766;
    menuItem.gpsY = -23;

    menuItem = menu.AddMenuItem('Kucuk Sioux Kilisesi');
    menuItem.gpsX = -759;
    menuItem.gpsY = -709;

    menuItem = menu.AddMenuItem('Guney Los Santos Kilisesi');
    menuItem.gpsX = 20;
    menuItem.gpsY = -1505;

    menuItem = menu.AddMenuItem('Mirror Park');
    menuItem.gpsX = 1080;
    menuItem.gpsY = -693;

    menuItem = menu.AddMenuItem('Los Santos Casino');
    menuItem.gpsX = 928;
    menuItem.gpsY = 44;

    menuItem = menu.AddMenuItem('Yaris Pisti');
    menuItem.gpsX = 1138;
    menuItem.gpsY = 106;

    menuItem = menu.AddMenuItem('Vinewood yazazilari');
    menuItem.gpsX = 719;
    menuItem.gpsY = 1198;

    menuItem = menu.AddMenuItem('Oryantal Tiyatro');
    menuItem.gpsX = 301;
    menuItem.gpsY = 203;

    menuItem = menu.AddMenuItem('Weazel News');
    menuItem.gpsX = -598;
    menuItem.gpsY = -929;

    menuItem = menu.AddMenuItem('Kucuk Seul Parki');
    menuItem.gpsX = -880;
    menuItem.gpsY = -809;

    menuItem = menu.AddMenuItem('Cottage Park');
    menuItem.gpsX = -940;
    menuItem.gpsY = 303;

    menuItem = menu.AddMenuItem('Galileo Gozlemevi');
    menuItem.gpsX = -429;
    menuItem.gpsY = 1109;

    menuItem = menu.AddMenuItem('Belediye Sarayi');
    menuItem.gpsX = 236;
    menuItem.gpsY = -409;

    menuItem = menu.AddMenuItem('Dime Tiyatrosu');
    menuItem.gpsX = 393;
    menuItem.gpsY = -711;

    menuItem = menu.AddMenuItem('Adliye Sarayi');
    menuItem.gpsX = 322;
    menuItem.gpsY = -1625;

    menuItem = menu.AddMenuItem('Valdez Tiyatrosu');
    menuItem.gpsX = -721;
    menuItem.gpsY = -684;

    menuItem = menu.AddMenuItem('Richards Majestic');
    menuItem.gpsX = -1052;
    menuItem.gpsY = -478;

    menuItem = menu.AddMenuItem('Belediye Binasi Del Perro');
    menuItem.gpsX = -1285;
    menuItem.gpsY = -567;

    menuItem = menu.AddMenuItem('Belediye Binasi RockFord-Hills');
    menuItem.gpsX = -545;
    menuItem.gpsY = -203;

    menuItem = menu.AddMenuItem('Pierce Del Perro');
    menuItem.gpsX = -1604;
    menuItem.gpsY = -1048;

    menuItem = menu.AddMenuItem('Pierce Vespucci');
    menuItem.gpsX = -3265;
    menuItem.gpsY = 947;

    menuItem = menu.AddMenuItem('Uzum Bagi');
    menuItem.gpsX = -1887;
    menuItem.gpsY = 2051;

    menuItem = menu.AddMenuItem('Sandy Shores Kilisesi');
    menuItem.gpsX = -324;
    menuItem.gpsY = 2817;

    menuItem = menu.AddMenuItem('Del Perro Kilisesi');
    menuItem.gpsX = -1681;
    menuItem.gpsY = -290;

    menuItem = menu.AddMenuItem('Rebel Radyo');
    menuItem.gpsX = 732;
    menuItem.gpsY = 2523;

    menuItem = menu.AddMenuItem('Sandy Shores Havaalani');
    menuItem.gpsX = 1722;
    menuItem.gpsY = 3255;

    menuItem = menu.AddMenuItem('Alamo Si Golu');
    menuItem.gpsX = 1578;
    menuItem.gpsY = 3835;

    menuItem = menu.AddMenuItem('Grapevine Havaalanı');
    menuItem.gpsX = 2138;
    menuItem.gpsY = 4812;

    menuItem = menu.AddMenuItem('Sandy Shores Doga Koruma Alani');
    menuItem.gpsX = -1638;
    menuItem.gpsY = 4725;

    menuItem = menu.AddMenuItem('Paletto Bay Kereste Fabrikasi');
    menuItem.gpsX = -565;
    menuItem.gpsY = 5325;

    menuItem = menu.AddMenuItem('Paletto Bay Kilisesi');
    menuItem.gpsX = -329;
    menuItem.gpsY = 6150;

    menuItem = menu.AddMenuItem('Paletto Korfezi İskelesi');
    menuItem.gpsX = -213;
    menuItem.gpsY = 6572;

    menuItem = menu.AddMenuItem('Chilliade Dagi');
    menuItem.gpsX = 501;
    menuItem.gpsY = 5603;

    menuItem = menu.AddMenuItem('Gordo Dagi');
    menuItem.gpsX = 2877;
    menuItem.gpsY = 5910;

    menuItem = menu.AddMenuItem('Taş Ocagi');
    menuItem.gpsX = 2906;
    menuItem.gpsY = 2803;

    menuItem = menu.AddMenuItem('Enerji santrali');
    menuItem.gpsX = 2661;
    menuItem.gpsY = 1641;

    menuItem = menu.AddMenuItem('Baraj');
    menuItem.gpsX = 1662;
    menuItem.gpsY = -13;

    menuItem = menu.AddMenuItem('Giyim fabrikasi');
    menuItem.gpsX = 718;
    menuItem.gpsY = -975;

    menuItem = menu.AddMenuItem('Dökümhane');
    menuItem.gpsX = 1083;
    menuItem.gpsY = -1974;

    menuItem = menu.AddMenuItem('Mezbaha');
    menuItem.gpsX = 961;
    menuItem.gpsY = -2185;

    menuItem = menu.AddMenuItem('Maze Bank Arena');
    menuItem.gpsX = -254;
    menuItem.gpsY = -2026;

    menuItem = menu.AddMenuItem('Atik geri donusum tesisi');
    menuItem.gpsX = -609;
    menuItem.gpsY = -1609;

    menuItem = menu.AddMenuItem('Cimento fabrikasi');
    menuItem.gpsX = 266;
    menuItem.gpsY = 2849;

    menuItem = menu.AddMenuItem('Hurda metal geri donusum merkezi');
    menuItem.gpsX = 2340;
    menuItem.gpsY = 3136;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showFuelMenu: function (shopId: number, isShop: boolean, price: number) {
    if (!isShop) return mp.events.callRemote('server:azs:openAzs');
    let menu = UIMenu.Menu.Create(`Yakit ikmali`, ` `);

    menu.AddMenuItem('Yakit ikmali menusu').doName = 'showFuelMenu'

    if (isShop) menu.AddMenuItem('Market').doName = 'showShopMenu';


    let closeItem = menu.AddMenuItem('~r~Kapat');

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex = 0;

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;
    });

    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName && item.doName == "showFuelMenu") mp.events.callRemote('server:azs:openAzs');
      else if (item.price > 0) mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId);
      else if (item.doName) menuList.showShopMenu(shopId, price);
    });
  },

  showHelpMenu: function () {
    phone.showFaqBrowser();
  },

  chatSettings: () => {
    let menu = UIMenu.Menu.Create(`Menu`, `~b~Sohbet ayarlari`);


    let fontChat: string[] = []
    for (let id = 0; id < 50; id++) fontChat.push((id + 1) + "px")
    let heightChat: string[] = []
    for (let id = 0; id < 50; id++) heightChat.push((id + 1) + "vh")

    menu.AddMenuItem('Sohbeti temizle', 'Tiklayin ~g~Enter~s~ Basvurmak icin').doName =
      'clearChat';

    let heightChatItem = menu.AddMenuItemList(
      'Sohbet yuksekligi',
      heightChat
    );
    heightChatItem.doName = 'heightChat';
    heightChatItem.Index = mp.storage.data.heightChat ? mp.storage.data.heightChat : 0;
    let fontChatItem = menu.AddMenuItemList(
      'Yazi tipi boyutu',
      fontChat
    );
    fontChatItem.doName = 'fontChat';
    fontChatItem.Index = mp.storage.data.fontChat ? mp.storage.data.fontChat : 0;

    let closeItem = menu.AddMenuItem('~r~Geri');
    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'heightChat') {
        mp.storage.data.heightChat = index + 1;
        gui.updateChatSettings()
      }
      if (item.doName == 'fontChat') {
        mp.storage.data.fontChat = index + 1;
        gui.updateChatSettings()
      }
    });
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) menuList.showSettingsMenu();

      if (item.doName == 'clearChat') {
        user.clearChat();
      }
    });
  },

  showSettingsMenu: function () {
    let menu = UIMenu.Menu.Create(`Menu`, `~b~Ayarlar`);

    let listVoiceType = ['Fisildayan', 'Tamamdir', 'Bagir'];
    let listVoice3d = ['Acik', 'Kapali'];
    let listVoiceVol = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
    let listRadioVol: string[] = [];
    for (let q = 0; q < 101; q++) listRadioVol.push(q + '%')

    //menu.AddMenuItem("Показывать интерфейс (~g~Вкл~s~/~r~Выкл~s~)", "Нажмите ~g~Enter~s~ чтобы применить").doName = 'showHud';
    if (methods.parseInt(user.get("exp_age")) > 0) {
      menu.AddMenuItem(
        '~r~Karakterin yasini',
        'Tiklayin ~g~Enter~s~ Belirtmek icin'
      ).doName = 'setAge';
    }
    menu.AddMenuItem(
      'HUD Göster (~g~Acik~s~/~r~Kapali~s~)',
      'Tiklayin ~g~Enter~s~ Basvurmak icin'
    ).doName = 'showRadar';
    menu.AddMenuItem(
      'Oyuncu kimliklerini goster (~g~Evet~s~/~r~Hayir~s~)',
      'Tiklayin ~g~Enter~s~ Basvurmak icin'
    ).doName = 'showId';
    //menu.AddMenuItemList("Тип голосового чата", listVoiceType, "Нажмите ~g~Enter~s~ чтобы применить").doName = '';
    //menu.AddMenuItemList("Объем голосового чата", listVoice3d, "Нажмите ~g~Enter~s~ чтобы применить").doName = '';

    menu.AddMenuItem('Deneysel fonksiyonlar').eventName = 'server:user:testSetting';

    let listVoiceItem = menu.AddMenuItemList(
      'Sesli sohbetin ses seviyesi',
      listVoiceVol,
      'Tiklayin ~g~Enter~s~ Basvurmak icin'
    );
    listVoiceItem.doName = 'vol';
    listVoiceItem.Index = methods.parseInt(user.get('s_voice_vol') * 10);
    let listRadioItem = menu.AddMenuItemList(
      'Radyo istasyonu ses seviyesi',
      listRadioVol,
      'Tiklayin ~g~Enter~s~ Basvurmak icin'
    );
    listRadioItem.doName = 'volRadio';
    listRadioItem.Index = user.audioRadioVolume;

    menu.AddMenuItem(
      '~y~Sesli sohbeti yeniden yukle',
      'Tıklayin ~g~Enter~s~ Basvurmak icin'
    ).doName = 'restartVoice';

    menu.AddMenuItem('Sohbet ayarlari', 'Tiklayin ~g~Enter~s~ Basvurmak icin').doName =
      'setchat';
    menu.AddMenuItem(
      '~y~Ozellestirmeyi duzeltin',
      '~r~Donanimli silahlariniz kaybolacak!'
    ).doName = 'fixCustom';
    menu.AddMenuItem(
      '~y~Ek desen yuklemesi icin Acik/Kapali',
      '~r~FPS Uzerinde hafif bir etkisi olabilir'
    ).doName = 'loadAllModels';
    //menu.AddMenuItem("~y~Вкл. / Выкл. доп. прогрузку ТС", "~r~Возможно слегка может повлиять на ФПС").doName = 'loadAllVeh';
    menu.AddMenuItem('~b~Promosyon', 'Tiklayin ~g~Enter~s~ Basvurmak icin').doName =
      'enterPromocode';
    if (user.get('job') != '')
      menu.AddMenuItem('~b~Ilk 20 aktif calısan').eventName =
        'server:user:showJobSkillTopMenu';
    menu.AddMenuItem('~r~Sunucu oturumunu kapatin', 'Tiklayin ~g~Enter~s~ Basvurmak icin').doName =
      'exit';


    let voiceVol = 1;
    let radioVol = 1;
    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'vol') {
        voiceVol = index / 10;

        user.setData('s_voice_vol', voiceVol);
        // voice.setSettings('voiceVolume', voiceVol);
        mp.game.ui.notifications.show('~b~Bir deger belirlediniz: ~s~' + voiceVol * 100 + '%');
      }
      if (item.doName == 'volRadio') {
        user.audioRadioVolume = index;
        mp.game.ui.notifications.show('~b~Bir deger belirlediniz: ~s~' + index + '%', 500);
        phone.updateRadioVolume();
      }
    });

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();

      if (item.doName == 'vol') {
        user.setData('s_voice_vol', voiceVol);
        // voice.setSettings('voiceVolume', voiceVol);
        mp.game.ui.notifications.show('~b~Bir deger belirlediniz: ~s~' + (voiceVol * 100) + '%');
      }
      if (item.doName == 'setchat') {
        menuList.chatSettings()
      }
      if (item.doName == 'loadAllVeh') {
        timer.allVehiclesLoader();
      }
      if (item.doName == 'loadAllModels') {
        timer.allModelLoader();
      }
      if (item.doName == 'showId') {
        mp.events.call('client:showId');
      }
      if (item.doName == 'showHud') {
        ui.showOrHideHud();
      }
      if (item.doName == 'setAge') {
        mp.events.callRemote("setAge")
      }
      if (item.doName == 'showRadar') {
        ui.showOrHideRadar();
      }
      if (item.doName == 'restartVoice') {
        restartVoice()
      }
      if (item.doName == 'exit') {
        user.kick('Sunucudan cikis yap');
      }
      if (item.doName == 'enterPromocode') {
        let promocode = await UIMenu.Menu.GetUserInput('Promosyon kodunu girin', '', 20);
        if (promocode == '') return;
        mp.events.callRemote('server:activatePromocode', promocode);
      }
      if (item.doName == 'fixCustom') {
        UIMenu.Menu.HideMenu();
        if (user.get('jail_time') > 0) return;
        user.updateCharacterFace();
        user.updateCharacterCloth();
      }
      if (item.eventName) {
        UIMenu.Menu.HideMenu();
        mp.events.callRemote(item.eventName);
      }
    });
  },

  showJobBuilderMenu: function () {
    let menu = UIMenu.Menu.Create('Ustabasi', '~b~Menu ogesini secin');
    let startEndItem = menu.AddMenuItem('~g~Baslangıc/~r~Bitis~s~ Hafta ici');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) builder.startOrEnd();
    });
  },

  showJobCleanerMenu: function () {
    let menu = UIMenu.Menu.Create('Ustabasi', '~b~Menu ogesini secin');
    let startEndItem = menu.AddMenuItem('~g~Baslangıc/~r~Bitis~s~ Hafta ici');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) cleaner.startOrEnd();
    });
  },

  showJobRoadWorkerMenu: function () {
    let menu = UIMenu.Menu.Create('Ustabasi', '~b~Menu ogesini secin');
    let startEndItem = menu.AddMenuItem('~g~Baslangıc/~r~Bitis~s~ Hafta ici');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) roadWorker.startOrEnd();
    });
  },

  showJobMainerMenu: function () {
    let menu = UIMenu.Menu.Create('Ustabasi', '~b~Menu ogesini secin');
    let startEndItem = menu.AddMenuItem('~g~Baslangıc/~r~Bitis~s~ Hafta ici');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) mainer.startOrEnd();
    });
  },

  walkstyleMenu: function () {
    let menu = new MenuClass("Yuruyusler", "Kategori listesi");
    if (mp.players.local.getVariable('walkstyle')) {
      menu.newItem({
        name: "Yuruyusu sifirlayin",
        onpress: () => {
          user.setVariable('walkstyle', null);
          user.notify('~g~Yuruyus tarzini biraktin')
          menuList.walkstyleMenu()
        }
      })
    }
    for (let cat in walkstylesList) {
      let data = (walkstylesList as any)[cat] as [string, string][];
      menu.newItem({
        name: cat,
        more: `x${data.length}`,
        onpress: () => {
          let submenu = new MenuClass(cat, "Yuruyuslerin listesi");
          data.map(item => {
            let style = (user.isMale() ? "move_m@" : "move_f@") + item[1]
            submenu.newItem({
              name: item[0],
              more: style == mp.players.local.getVariable('walkstyle') ? "~g~Secilmis" : "Seciniz",
              onpress: () => {
                user.setVariable('walkstyle', (user.isMale() ? "move_m@" : "move_f@") + item[1]);
                user.notify('~g~Yuruyus tarzınızı degistirdiniz')
              }
            })
          })
          submenu.open()
        }
      })
    }

    menu.open();

  },

  showAnimationTypeListMenu: function () {
    let menu = UIMenu.Menu.Create(`Animasyonlar`, `~b~Animasyon menusu`);

    let walkStyle = menu.AddMenuItem('Yuruyusler');
    let animActionItem = menu.AddMenuItem('Aksiyon animasyonlari');
    let animPoseItem = menu.AddMenuItem('Poz verme animasyonlari');
    let animPositiveItem = menu.AddMenuItem('Pozitif duygular');
    let animNegativeItem = menu.AddMenuItem('Olumsuz duygular');
    let animDanceItem = menu.AddMenuItem('Dans etmek');
    let animOtherItem = menu.AddMenuItem('Animasyonlarin geri kalani');
    let animSyncItem = menu.AddMenuItem('Etkilesim');
    let animStopItem = menu.AddMenuItem('~y~Animasyonu durdurun');

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      else if (item == walkStyle) menuList.walkstyleMenu();
      else if (item == animStopItem) user.stopAllAnimation();
      else if (item == animOtherItem) menuList.showAnimationOtherListMenu();
      else if (item == animSyncItem) menuList.showAnimationSyncListMenu();
      else if (item == animActionItem)
        menuList.showAnimationListMenu('Aksiyon animasyonlari', enums.animActions);
      else if (item == animDanceItem) menuList.showAnimationListMenu('Dans etmek', enums.animDance);
      else if (item == animNegativeItem)
        menuList.showAnimationListMenu('Olumsuz duygular', enums.animNegative);
      else if (item == animPositiveItem)
        menuList.showAnimationListMenu('Pozitif duygular', enums.animPositive);
      else if (item == animPoseItem)
        menuList.showAnimationListMenu('Poz verme animasyonlari', enums.animPose);
    });
  },

  showAnimationListMenu: function (subtitle: string, array: any[][]) {
    let menu = UIMenu.Menu.Create(`Animasyonlar`, `~b~${subtitle}`);

    array.forEach(function (item, i, arr) {
      let menuItem = menu.AddMenuItem(`${item[0]}`);
      menuItem.anim1 = item[1];
      menuItem.anim2 = item[2];
      menuItem.animFlag = item[3];
    });

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }

      /*
          .addMenuItem("Сидеть-1", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@generic@base", "base", true)
          .addMenuItem("Сидеть-2", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@elbows_on_knees@base", "base", true)
          .addMenuItem("Сидеть-3", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@left_elbow_on_knee@base", "base", true)
          .addMenuItem("Сидеть-4", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@right_foot_out@base", "base", true)
          * */

      let plPos = mp.players.local.position;

      if (
        item.anim1 == 'amb@prop_human_seat_chair@male@generic@base' ||
        item.anim1 == 'amb@prop_human_seat_chair@male@right_foot_out@base' ||
        item.anim1 == 'amb@prop_human_seat_chair@male@left_elbow_on_knee@base' ||
        item.anim1 == 'amb@prop_human_seat_chair@male@elbows_on_knees@base'
      ) {
        mp.players.local.freezePosition(true);
        mp.players.local.setCollision(false, false);
        if (!Container.HasLocally(0, 'hasSeat'))
          mp.players.local.position = new mp.Vector3(plPos.x, plPos.y, plPos.z - 0.95);
        Container.SetLocally(0, 'hasSeat', true);
      } else if (Container.HasLocally(0, 'hasSeat')) {
        mp.players.local.freezePosition(false);
        mp.players.local.setCollision(true, true);
        mp.players.local.position = new mp.Vector3(plPos.x, plPos.y, plPos.z + 0.95);
        Container.ResetLocally(0, 'hasSeat');
      }

      mp.game.ui.notifications.show('~b~Tiklayin ~s~F10~b~ Animasyonu iptal etmek icin');
      user.playAnimation(item.anim1, item.anim2, item.animFlag);
    });
  },

  showAnimationOtherListMenu: function () {
    let menu = UIMenu.Menu.Create(`Animasyonlar`, `~b~Animasyonlarin geri kalani`);

    /*enums.scenarios.forEach(function (item, i, arr) {
          let menuItem = menu.AddMenuItem(`${item[0]}`);
          menuItem.scenario = item[1];
      });*/

    enums.animRemain.forEach(function (item, i, arr) {
      let menuItem = menu.AddMenuItem(`${item[0]}`);
      menuItem.anim1 = item[1];
      menuItem.anim2 = item[2];
      menuItem.animFlag = item[3];
    });

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      mp.game.ui.notifications.show('~b~Tiklayin ~s~F10~b~ Animasyonu iptal etmek icin');
      if (item.scenario != undefined) user.playScenario(item.scenario);
      else user.playAnimation(item.anim1, item.anim2, item.animFlag);
    });
  },

  showAnimationSyncListMenu: function () {
    let menu = UIMenu.Menu.Create(`Animasyonlar`, `~b~Etkilesim`);

    menu.AddMenuItem(`Alay etmek 1`).animId = 0;
    menu.AddMenuItem(`ПAlay etmek 2`).animId = 2;
    menu.AddMenuItem(`Beş dakika ver`).animId = 1;
    menu.AddMenuItem(`Opmek`).animId = 3;
    //menu.AddMenuItem(`Минет`).animId = 4;
    //menu.AddMenuItem(`Секс`).animId = 5;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }

      let playerId = methods.parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimligi (ID)', '', 9));
      if (playerId < 0) {
        mp.game.ui.notifications.show('~r~Igarkoa sifirdan kucuk olamaz');
        return;
      }
      user.playAnimationWithUser(playerId, item.animId);
    });
  },



  showMazeOfficeTeleportMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `~b~Maze Bank Asansor`, false, false, false, 'maze_bank', 'maze_bank');

    let BankMazeLiftOfficePos = new mp.Vector3(-77.77799, -829.6542, 242.7859);
    let BankMazeLiftStreetPos = new mp.Vector3(-66.66476, -802.0474, 43.22729);
    let BankMazeLiftRoofPos = new mp.Vector3(-67.13605, -821.9, 320.2874);
    let BankMazeLiftGaragePos = new mp.Vector3(-84.9765, -818.7122, 35.02804);

    menu.AddMenuItem('Garaj').teleportPos = BankMazeLiftGaragePos;
    menu.AddMenuItem('Ofis').teleportPos = BankMazeLiftOfficePos;
    menu.AddMenuItem('Sokak').teleportPos = BankMazeLiftStreetPos;
    menu.AddMenuItem('Cati').teleportPos = BankMazeLiftRoofPos;

    let closeItem = menu.AddMenuItem('~r~Kapali');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      user.teleportv(item.teleportPos);
    });
  },

  showFibOfficeTeleportMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(`Fib`, `~b~Asansör`);

    let FibLift0StationPos = new mp.Vector3(122.9873, -741.1865, 32.13323);
    let FibLift1StationPos = new mp.Vector3(136.2213, -761.6816, 44.75201);
    let FibLift2StationPos = new mp.Vector3(136.2213, -761.6816, 241.152);
    let FibLift3StationPos = new mp.Vector3(114.9807, -741.8279, 257.1521);
    let FibLift4StationPos = new mp.Vector3(141.4099, -735.3376, 261.8516);

    menu.AddMenuItem('Garaj').teleportPos = FibLift0StationPos;
    menu.AddMenuItem('1 Kat').teleportPos = FibLift1StationPos;
    menu.AddMenuItem('49 Kat').teleportPos = FibLift2StationPos;
    menu.AddMenuItem('52 Kat').teleportPos = FibLift3StationPos;
    menu.AddMenuItem('Cati').teleportPos = FibLift4StationPos;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      user.teleportv(item.teleportPos);
    });
  },

  showGovOfficeTeleportMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(`Hukumet`, `~b~Asansor`);

    let MeriaUpPos = new mp.Vector3(-1395.997, -479.8439, 71.04215);
    let MeriaDownPos = new mp.Vector3(-1379.659, -499.748, 32.15739);
    let MeriaRoofPos = new mp.Vector3(-1369, -471.5994, 83.44699);
    let MeriaGarPos = new mp.Vector3(-1360.679, -471.8841, 30.59572);

    menu.AddMenuItem('Garaj').teleportPos = MeriaGarPos;
    menu.AddMenuItem('Ofis').teleportPos = MeriaUpPos;
    menu.AddMenuItem('Sokak').teleportPos = MeriaDownPos;
    menu.AddMenuItem('Cati').teleportPos = MeriaRoofPos;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      user.teleportv(item.teleportPos);
    });
  },

  showMeriaMainMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `Hukumet sekreteri`, false, false, false, 'suemurry_background_left', 'suemurry_background_left');

    menu.AddMenuItem('Taksi ehliyeti', 'Fiyat: ~g~$500').doName = 'getTaxiLic';
    menu.AddMenuItem('Kayit olun', '6 Aylik kayit').doName =
      'getRegister';
    menu.AddMenuItem('Isgucu degisimi').doName = 'showMeriaJobListMenu';
    menu.AddMenuItem('Yardim icin basvurun').doName = 'getPosob';
    menu.AddMenuItem('Emekli maasi icin basvurun').doName = 'getMoneyOld';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.doName == 'showMeriaJobListMenu') menuList.showMeriaJobListMenu();
      if (item.doName == 'getTaxiLic') {
        if (user.get('reg_status') == 0) {
          mp.game.ui.notifications.show('~r~Kaydiniz yok');
          return;
        }
        if (user.getLevel() < levelAccess.taxiLic) {
          mp.game.ui.notifications.show('~r~Basarmak zorundasiniz ' + levelAccess.taxiLic + ' Seviye');
          return;
        }
        licenseCenter.buy('taxi_lic', 500);
      }
      if (item.doName == 'getRegister') {
        if (user.get('reg_status') > 1) {
          mp.game.ui.notifications.show('~r~Kayit olmanıza gerek yok');
          return;
        }
        user.setData('reg_status', 1);
        user.setData('reg_time', 186);
        mp.game.ui.notifications.show('~g~ ~s~6 Ay boyunca kayit aldiniz');
      }
      if (item.doName == 'getPosob') {
        if (
          user.get('job') == '' &&
          ((user.get('fraction_id') > 7 && user.get('fraction_id') < 15) ||
            user.get('fraction_id') == 0)
        ) {
          mp.game.ui.notifications.show('~g~Bir odenek cektiniz');
          user.setData('posob', true);
          return;
        }
        user.setData('posob', false);
        mp.game.ui.notifications.show('~r~Odeneginiz reddedildi');
      }
      if (item.doName == 'getMoneyOld') {
        if (user.getLevel() >= levelAccess.oldmoney) {
          mp.game.ui.notifications.show('~g~Emekli maasinizi cektiniz');
          user.setData('is_old_money', true);
          return;
        }
        user.setData('is_old_money', false);
        mp.game.ui.notifications.show('~r~Emekli maasi su adresten temin edilebilir ' + levelAccess.oldmoney + ' Seviye');
      }
    });
  },


  showMeriaJobListMenu: function () {
    let menu = UIMenu.Menu.Create(`Sekreter`, `~b~Isgucu degisimi`);

    menu.AddMenuItem('Apartman temizleyicisi', 'Sirket: ~y~Sunset Bleach').jobName = 'sunb';
    menu.AddMenuItem('Imha edici', 'Sirket: ~y~Bugstars').jobName = 'bgstar';
    menu.AddMenuItem('Yemek dagitimcisi', 'Sirket: ~y~BurgerShot').jobName = 'bshot';
    menu.AddMenuItem('Mekatronik', 'Sirket: ~y~Water & Power').jobName = 'water';

    menu.AddMenuItem('Bahcivan', "Sirket: ~y~O'Connor").jobName = 'three';
    menu.AddMenuItem('Fotografci', 'Sirket: ~y~LifeInvader').jobName = 'photo';

    menu.AddMenuItem('Postaci (PostOp)', 'Sirket: ~y~PostOp').jobName = 'mail';
    menu.AddMenuItem('Postaci (GoPostal)', 'Sirket: ~y~GoPost').jobName = 'mail2';

    menu.AddMenuItem('Taksi Soforu (DT Cab Co.)', 'Sirket: ~y~DownTown Cab Co.').jobName =
      'taxi1';
    menu.AddMenuItem('Taksi Soforu (Express C.S.)', 'Sirket: ~y~Express C.S.').jobName = 'taxi2';
    menu.AddMenuItem('Otobus soforu-1', 'Sehir otobusu').jobName = 'bus1';
    menu.AddMenuItem('Otobus soforu-2', 'Transfer otobusu').jobName = 'bus2';
    menu.AddMenuItem('Otobus soforu-3', 'Bir servis otobusu').jobName = 'bus3';
    if (!user.isGos() && !user.isGang()) {
      menu.AddMenuItem('Koleksiyoncu', 'Sirket: ~y~Gruppe6').jobName = 'gr6';
      menu.AddMenuItem('Yuk tasimaciligi').doName = 'showTruckerMenu';
    }
    menu.AddMenuItem('Avukat').doName = 'showLawerMenu';
    //menu.AddMenuItem("Учёный - Гидролог", "Компания: ~y~Humane Labs").jobName = 'sground';
    //menu.AddMenuItem("Учёный - Биолог", "Компания: ~y~Humane Labs").jobName = 'swater';
    menu.AddMenuItem('~y~Isini birak').doName = 'uninvite';
    menu.AddMenuItem('~y~Resmi olmayan bir kurulustan ayrilmak', 'Resmi olmayan bir kurulustan ayrilmak').doName =
      'uninviteFraction';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      else if (item.doName == 'uninvite') {
        user.setData('job', '');
        mp.game.ui.notifications.show('~y~Isinizden istifa ettiniz');
      }
      else if (item.doName == 'uninviteFraction') {
        if (!user.isLeader2()) {
          user.setData('fraction_id2', 0);
          user.setData('rank2', 0);
          mp.game.ui.notifications.show('~y~Kurulustan istifa ettiniz');
        }
      } else {
        if (user.isGos()) return mp.game.ui.notifications.show('~y~Is bulamazsiniz');
      }
      if (item.doName == 'showTruckerMenu') {
        menuList.showMeriaJobTruckerListMenu();
      }
      if (item.doName == 'showLawerMenu') {
        menuList.showMeriaJobLawerListMenu();
      }
      if (item.jobName) {
        if (user.get('reg_status') == 0) {
          mp.game.ui.notifications.show('~r~Kaydiniz yok');
          return;
        }
        if (!user.get('b_lic')) {
          mp.game.ui.notifications.show('~r~B kategorisi ehliyetiniz yok');
          return;
        }
        if (
          user.getLevel() < 2 &&
          (item.jobName == 'three' || item.jobName == 'photo')
        ) {
          mp.game.ui.notifications.show('~r~Seviye 2 den itibaren mevcuttur');
          return;
        }
        if (
          user.getLevel() < 2 &&
          (item.jobName == 'mail1' || item.jobName == 'mail2')
        ) {
          mp.game.ui.notifications.show('~r~Seviye 2 den itibaren mevcuttur');
          return;
        }
        if (
          user.getLevel() < 2 &&
          (item.jobName == 'bus1' || item.jobName == 'bus2' || item.jobName == 'bus3')
        ) {
          mp.game.ui.notifications.show('~r~Seviye 2 den itibaren mevcuttur');
          return;
        }
        if (!user.get('gun_lic') && item.jobName == 'gr6') {
          mp.game.ui.notifications.show('~r~Silah ruhsatiniz yok');
          return;
        }
        if (!user.get('c_lic') && item.jobName == 'gr6') {
          mp.game.ui.notifications.show('~r~C kategorisi ruhsatiniz yok');
          return;
        }
        if (user.getLevel() < levelAccess.gr6 && item.jobName == 'gr6') {
          mp.game.ui.notifications.show('~r~Basarmak zorundasiniz ' + levelAccess.gr6 + ' Seviye');
          return;
        }
        if (!user.get('taxi_lic') && (item.jobName == 'taxi1' || item.jobName == 'taxi2')) {
          mp.game.ui.notifications.show('~r~Taksi ehliyetiniz yok');
          return;
        }

        if (user.getLevel() < levelAccess.swater && (item.jobName == 'swater' || item.jobName == 'sground')) {
          mp.game.ui.notifications.show('~r~Bir seviyeye sahip olmalisiniz ' + levelAccess.swater);
          return;
        }

        if (user.isGos()) {
          mp.game.ui.notifications.show('~r~Bir devlet fraksiyonunda olmaziz gerekmez');
          return;
        }

        user.setData('posob', false);
        user.setData('job', item.jobName);
        mp.game.ui.notifications.show('~g~İşle alındınız. Artık bu işte çalışabilirsiniz.');
        user.saveAccount();
      }
    });
  },

  showMeriaJobTruckerListMenu: function () {
    let menu = UIMenu.Menu.Create(`Sekreter`, `~b~Yuk tasimaciligi`);

    menu.AddMenuItem('Minibuslerde', 'Sirketler: ~y~PostOp~s~ | ~y~GoPostal').jobName =
      'trucker1';
    menu.AddMenuItem(
      'Komyonlar',
      'Sikayetler: ~y~Bilgeco~s~ | ~y~Jetsam~s~ | ~y~Lando-Corp'
    ).jobName = 'trucker2';
    menu.AddMenuItem(
      'Kamyonlar',
      'Sikayetler: ~y~Bilgeco~s~ | ~y~Jetsam~s~ | ~y~Lando-Corp'
    ).jobName = 'trucker3';
    menu.AddMenuItem('~y~Isini bırak').doName = 'uninvite';
    menu.AddMenuItem('~y~Resmi olmayan bir kurulustan ayrilmak', 'Resmi olmayan bir kurulustan ayrilmak').doName =
      'uninviteFraction';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      else if (item.doName == 'uninvite') {
        user.setData('job', '');
        mp.game.ui.notifications.show('~y~Isinizden istifa ettiniz');
      }
      else if (item.doName == 'uninviteFraction') {
        if (!user.isLeader2()) {
          user.setData('fraction_id2', 0);
          user.setData('rank2', 0);
          mp.game.ui.notifications.show('~y~Kurulustan iftifa ettiniz');
        }
      } else {
        if (user.isGos()) return mp.game.ui.notifications.show('~y~Is bulamazsiniz');
      }
      if (item.jobName) {
        if (user.get('reg_status') == 0) {
          mp.game.ui.notifications.show('~r~Kaydiniz yok');
          return;
        }
        if (!user.get('b_lic')) {
          mp.game.ui.notifications.show('~r~B kategorisi ehliyetiniz yok');
          return;
        }
        if (!user.get('c_lic')) {
          mp.game.ui.notifications.show('~r~C kategorisi ehliyetiniz yok');
          return;
        }
        if (user.getLevel() < levelAccess.truckerjob) {
          mp.game.ui.notifications.show('~r~Bir seviyeye ulasmalisiniz: ' + levelAccess.truckerjob);
          return;
        }
        if (user.get('skill_trucker') < 500 && item.jobName == 'trucker2') {
          mp.game.ui.notifications.show('~r~Kamyon sofornun becerisi en az %33 olmalidir');
          return;
        }
        if (user.get('skill_trucker') < 1000 && item.jobName == 'trucker3') {
          mp.game.ui.notifications.show('~r~Kamyon soforunun becerisi en az %66 olmalidir');
          return;
        }
        user.setData('posob', false);
        user.setData('job', item.jobName);
        mp.game.ui.notifications.show('~g~Bir isin var');
        user.saveAccount();
      }
    });
  },

  showMeriaJobLawerListMenu: async function () {
    let pricent1 = (await business.getPrice(58)) * 10;
    let pricent2 = (await business.getPrice(58)) * 10;
    let pricent3 = (await business.getPrice(58)) * 10;

    let menu = UIMenu.Menu.Create(`Sekreter`, `~b~Bir sirket secin`);

    menu.AddMenuItem(
      'Slaughter, Slaughter & Slaughter',
      `Faiz orani: ~y~${pricent1}%`
    ).jobName = 'lawyer1';
    menu.AddMenuItem('Bullhead', `Faiz orani: ~y~${pricent2}%`).jobName = 'lawyer2';
    menu.AddMenuItem('Pearson Specter', `Faiz orani: ~y~${pricent3}%`).jobName =
      'lawyer3';

    menu.AddMenuItem('~y~Isten ayril').doName = 'uninvite';
    menu.AddMenuItem('~y~Resmi olmayan bir kurulustan ayrilmak', 'Resmi olmayan bir kurulustan ayrilmak').doName =
      'uninviteFraction';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.doName == 'uninvite') {
        user.setData('job', '');
        mp.game.ui.notifications.show('~y~Isten istifa ettiniz');
      }
      if (item.doName == 'uninviteFraction') {
        if (!user.isLeader2()) {
          user.setData('fraction_id2', 0);
          user.setData('rank2', 0);
          mp.game.ui.notifications.show('~y~Kurulustan ayrildiniz');
        }
      }
      if (item.jobName) {
        if (user.get('reg_status') != 3) {
          mp.game.ui.notifications.show('~r~TR Vatandasliginiz yok');
          return;
        }
        if (!user.get('law_lic')) {
          mp.game.ui.notifications.show('~r~Avukatlik lisansiniz yok');
          return;
        }
        if (user.getLevel() < levelAccess.companyWork) {
          mp.game.ui.notifications.show('~r~Minumum seviye ' + levelAccess.companyWork);
          return;
        }
        user.setData('posob', false);
        user.setData('job', item.jobName);
        mp.game.ui.notifications.show('~g~İşle alındınız. Artık bu işte çalışabilirsiniz.');
        user.saveAccount();
      }
    });
  },

  showMazeOfficeMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `~b~Devlet bankasi ofisi "~r~Maze~b~"`, false, false, false, 'maze_bank', 'maze_bank');

    menu.AddMenuItem('Mulk', 'Mulkunuz ile ilgili islemler').doName =
      'showMazeBankOfficeSellHvbMenu';
    if (user.get('id_house') > 0)
      menu.AddMenuItem('Konutlar', 'Kiracilarinizla olan islemler').doName =
        'showMazeBankHousePeopleMenu';
    menu.AddMenuItem('Vergi dairesi').doName = 'showMazeBankOfficeTaxMenu';
    menu.AddMenuItem('Banka').doName = 'showBankMenu';

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.doName == 'showBankMenu') menuList.showBankMenu(0, 10);
      if (item.doName == 'showMazeBankOfficeSellHvbMenu')
        menuList.showMazeBankOfficeSellHvbMenu(await coffer.getAllData());
      if (item.doName == 'showMazeBankOfficeTaxMenu') menuList.showMazeBankOfficeTaxMenu();
      if (item.doName == 'showMazeBankHousePeopleMenu') menuList.showMazeBankHousePeopleMenu();
    });
  },

  showMazeBankOfficeSellHvbMenu: function (cofferData: Map<string, any>) {
    //TODO BLACKOUT

    user.updateCache().then(function () {
      let menu = UIMenu.Menu.Create(
        `Maze`,
        `~b~Guncel vergi orani: ~s~${cofferData.get('cofferNalog')}%`
      );

      if (user.get('id_house') > 0) {
        menu.AddMenuItem('Evi satin', 'Evi vergisiyle beraber devlete satmak').eventName =
          'server:houses:sell';
        menu.AddMenuItem('~y~Evi oyuncuya satmak').eventNameSell = 'server:houses:sellToPlayer';
      }
      if (user.get('condo_id') > 0) {
        menu.AddMenuItem(
          'Dairenizi satin',
          'Daireyi vergisiyle beraber devlete satmak'
        ).eventName = 'server:condo:sell';
        menu.AddMenuItem('~y~Daireyi oyuncuya satmak').eventNameSell =
          'server:condo:sellToPlayer';
      }
      if (user.get('apartment_id') > 0) {
        menu.AddMenuItem(
          'Dairenizi satin',
          'Daireyi vergisiyle beraber devlete satmak'
        ).eventName = 'server:apartments:sell';
        menu.AddMenuItem('~y~Daireyi oyuncuya satmak').eventNameSell =
          'server:apartments:sellToPlayer';
      }
      if (user.get('business_id') > 0) {
        menu.AddMenuItem(
          'Isletmeyi satin',
          'Isletmeyi vergisiyle devlete satmak'
        ).eventName = 'server:business:sell';
        menu.AddMenuItem('~y~Isletmeyi oyuncuya sat').eventNameSell =
          'server:business:sellToPlayer';
      }
      if (user.get('stock_id') > 0) {
        menu.AddMenuItem(
          'Depoyu satin',
          'Depoyu vergisiyle devlete satmak'
        ).eventName = 'server:stock:sell';
        menu.AddMenuItem('~y~Depoyu oyuncuya sat').eventNameSell =
          'server:stock:sellToPlayer';
      }

      //TODO в идеале вывести марку и номер транспорта, не только слот.
      if (user.get('car_id1') > 0) {
        menu.AddMenuItem(
          '#1 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car1:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car1:sellToPlayer';
      }
      if (user.get('car_id2') > 0) {
        menu.AddMenuItem(
          '#2 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car2:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car2:sellToPlayer';
      }
      if (user.get('car_id3') > 0) {
        menu.AddMenuItem(
          '#3 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car3:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car3:sellToPlayer';
      }
      if (user.get('car_id4') > 0) {
        menu.AddMenuItem(
          '#4 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car4:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car4:sellToPlayer';
      }
      if (user.get('car_id5') > 0) {
        menu.AddMenuItem(
          '#5 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car5:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car5:sellToPlayer';
      }
      if (user.get('car_id6') > 0) {
        menu.AddMenuItem(
          '#6 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car6:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car6:sellToPlayer';
      }
      if (user.get('car_id7') > 0) {
        menu.AddMenuItem(
          '#7 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car7:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car7:sellToPlayer';
      }
      if (user.get('car_id8') > 0) {
        menu.AddMenuItem(
          '#8 Araci sat',
          'Araci devlete sat.\nVergi: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car8:sell';
        menu.AddMenuItem('~y~Araci oyuncuya satmak').eventNameSell = 'server:car8:sellToPlayer';
      }

      let closeItem = menu.AddMenuItem('~r~Kapat');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item == closeItem) return;

        if (item.eventName) {
          menuList.showMazeAcceptSellMenu(item.eventName);
        }
        if (item.eventNameSell) {
          if (Container.HasLocally(mp.players.local.remoteId, 'isSellTimeout')) {
            mp.game.ui.notifications.show('~r~Zaman asimi 1 dakika');
            //return;
          }

          let playerId = methods.parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimligi (ID)', '', 9));
          if (playerId < 0) {
            mp.game.ui.notifications.show('~r~Igricoa kimligi sifirdan kucuk olamaz');
            return;
          }
          let sum = methods.parseInt(await UIMenu.Menu.GetUserInput('Miktar', '', 9));
          if (sum < 0) {
            mp.game.ui.notifications.show('~r~Tutar sifirdan az olamaz');
            return;
          }

          if (item.eventNameSell == 'server:car1:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 1);
          else if (item.eventNameSell == 'server:car2:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 2);
          else if (item.eventNameSell == 'server:car3:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 3);
          else if (item.eventNameSell == 'server:car4:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 4);
          else if (item.eventNameSell == 'server:car5:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 5);
          else if (item.eventNameSell == 'server:car6:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 6);
          else if (item.eventNameSell == 'server:car7:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 7);
          else if (item.eventNameSell == 'server:car8:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 8);
          else mp.events.callRemote(item.eventNameSell, playerId, sum);

          Container.SetLocally(mp.players.local.remoteId, 'isSellTimeout', true);

          setTimeout(function () {
            Container.ResetLocally(mp.players.local.remoteId, 'isSellTimeout');
          }, 1000 * 60);
        }
      });
    });
  },

  showMazeBankHousePeopleMenu: function () {
    //TODO BLACKOUT

    user.updateCache().then(function () {
      let menu = UIMenu.Menu.Create(`Maze`, `~b~Konutlar`);

      if (user.get('id_house') > 0) {
        menu.AddMenuItem(
          'Bir oyuncıyı eve tasiyin',
          'Maliyet ~g~$50.000\n~s~Avukat araciligi ile ~g~$10.000'
        ).eventName = 'server:houses:addUser';
        menu.AddMenuItem('Kiracilarin listesi').eventName = 'server:houses:userList';
        menu.AddMenuItem('~y~Tahliye', 'Maliyet ~g~$1.000').eventName =
          'server:houses:removeMe';
      }

      let closeItem = menu.AddMenuItem('~r~Kapat');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item == closeItem) return;

        if (item.eventName == 'server:houses:addUser') {
          let playerId = methods.parseInt(await UIMenu.Menu.GetUserInput('Oyuncu kimligi (ID)', '', 9));
          if (playerId < 0) {
            mp.game.ui.notifications.show('~r~Oyuncu kimligi sifirdan kucuk olamaz');
            return;
          }
          mp.events.callRemote(item.eventName, playerId);
        } else if (item.eventName) {
          mp.events.callRemote(item.eventName);
        }
      });
    });
  },

  showMazeBankHousePeopleListMenu: function (data: [number, string][]) {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(`Konut`, `~b~Kiracilarin listesi`);

    data.forEach(function (item) {
      let userId = methods.parseInt(item[0]);
      if (userId == user.get('id')) menu.AddMenuItem(`${item[1]} (${item[0]})`);
      else menu.AddMenuItem(`${item[1]} (${item[0]})`).eventParam = userId;
    });

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventParam) menuList.showMazeBankHousePeopleListDoMenu(item.eventParam);
    });
  },

  showMazeBankHousePeopleListDoMenu: function (id: number) {
    let menu = UIMenu.Menu.Create(`Konut`, `~b~` + id);

    menu.AddMenuItem(`~r~Bedelini oduyerek tahliye edin $1.000`).eventName = 'server:house:removeId';

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:house:removeId') {
        mp.events.callRemote(item.eventName, id);
      }
    });
  },

  showMazeAcceptSellMenu: function (eventName: string) {
    let menu = UIMenu.Menu.Create(`Maze`, `~b~Satmak istedigine emin misin?`);

    menu.AddMenuItem('~y~Sat').eventName = eventName;
    let closeItem = menu.AddMenuItem('~r~Iptal');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.eventName) mp.events.callRemote(item.eventName);
    });
  },

  showMazeBankOfficeTaxMenu: function () {
    //TODO BLACKOUT

    user.updateCache().then(function () {
      let menu = UIMenu.Menu.Create(`Maze`, `~b~Vergi dairesi`);

      // menu.AddMenuItem('Оплатить налог по номеру счёта').eventName = 'server:tax:payTax';

      if (user.get('id_house') > 0) {
        let menuItem = menu.AddMenuItem('Ev vergisi');
        menuItem.itemId = user.get('id_house');
        menuItem._type = 0;
      }
      if (user.get('condo_id') > 0) {
        let menuItem = menu.AddMenuItem('Налог за квартиру');
        menuItem.itemId = user.get('condo_id');
        menuItem._type = 5;
      }
      if (user.get('apartment_id') > 0) {
        let menuItem = menu.AddMenuItem('Sabit vergi');
        menuItem.itemId = user.get('apartment_id');
        menuItem._type = 3;
      }
      if (user.get('business_id') > 0) {
        let menuItem = menu.AddMenuItem('Isletme vergisi');
        menuItem.itemId = user.get('business_id');
        menuItem._type = 2;
      }
      if (user.get('stock_id') > 0) {
        let menuItem = menu.AddMenuItem('Depo vergisi');
        menuItem.itemId = user.get('stock_id');
        menuItem._type = 4;
      }

      for (let i = 1; i < 9; i++) {
        if (user.get('car_id' + i) > 0) {
          let menuItem = menu.AddMenuItem('Arac vergisi' + i);
          menuItem.itemId = user.get('car_id' + i);
          menuItem._type = 1;
        }
      }

      let closeItem = menu.AddMenuItem('~r~Kapat');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item == closeItem) return;

        // if (item.eventName) {
        //   let number = methods.parseInt(await UIMenu.Menu.GetUserInput('Счёт', '', 10));
        //   if (number == 0) return;
        //   let sum = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма', '', 9));
        //   if (sum == 0) return;
        //   return mp.events.callRemote(item.eventName, 1, number, sum);
        // }
        if (item.itemId) {
          menuList.showMazeBankOfficeTaxInfoMenu(item._type, item.itemId);
        }
      });
    });
  },

  showMazeBankOfficeTaxInfoMenu: async function (type: number, id: number) {
    //TODO BLACKOUT

    let tax = 0;
    let taxLimit = 0;
    let taxDay = 0;
    let score = 0;
    let name = '';

    if (type == 0) {
      let item: {
        price: number,
        money_tax: number,
        score_tax: number,
        address: string,
        id: number,
      } = await mp.events.callServer('house:getData', id);
      taxDay = methods.parseInt((item.price * 0.0001 + 10) / 7);
      tax = item.money_tax;
      taxLimit = methods.parseInt(item.price * 0.0001 + 10) * 21;
      score = item.score_tax;

      name = item.address + ' №' + item.id;
    } else if (type == 1) {
      let item = await vehicles.getData(id);
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = methods.getVehicleInfo(item.get('hash')).display_name + ' (' + item.get('number') + ')';
    } else if (type == 2) {
      let item = await business.getData(id);
      taxDay = methods.parseInt((item.price * 0.0001 + 10) / 7);
      tax = item.money_tax;
      taxLimit = methods.parseInt(item.price * 0.0001 + 10) * 21;
      score = item.score_tax;

      name = item.name;
    } else if (type == 3) {
      let item = await Container.GetAll(-100000 + methods.parseInt(id));
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = 'Daire numarasi' + item.get('id');
    } else if (type == 4) {
      let item = await stock.getData(id);
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = 'Depo numarasi' + item.get('id');
    } else if (type == 5) {
      let item = await condo.getData(id);
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = item.get('address') + ' №' + item.get('id');
    }

    methods.debug(name, tax, taxLimit, taxDay, score);

    let menu = UIMenu.Menu.Create(`Maze`, `~b~` + name);

    menu.AddMenuItem(`~b~Hesap:~s~ ${score}`, 'Mulklerinizin benzersiz hesabi');
    menu.AddMenuItem(
      `~b~Borcunuz:~s~ ~r~${tax == 0 ? '~g~Mevcut degil' : `$${tax}`}`,
      `Mevcut borcunuz ~r~$${taxLimit}~s~ Limitine ulastiginda mulkunuze el konulacak`
    );
    menu.AddMenuItem(`~b~Gunluk vergi:~s~ $${taxDay}`, 'Bireysel vergi orani');
    menu.AddMenuItem(
      `~b~Izin verilen limit:~s~ $${taxLimit}`,
      'Varliklar sifirlanmadan once izin verilen limit'
    );

    menu.AddMenuItem('Nakit odeme').payTaxType = 0;
    menu.AddMenuItem('Kart ile odeme').payTaxType = 1;

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.payTaxType >= 0) {
        let sum = methods.parseInt(await UIMenu.Menu.GetUserInput('Miktar', '', 9));
        if (sum == 0) return;

        if (item.payTaxType == 0 && user.getCashMoney() < sum) {
          mp.game.ui.notifications.show('~r~Elinizde bu miktarda para yok');
          return;
        }
        if (item.payTaxType == 1 && user.getBankMoney() < sum) {
          mp.game.ui.notifications.show('~r~Bankada bu miktarda limitiniz yok');
          return;
        }

        mp.events.callRemote('server:tax:payTax', item.payTaxType, score, sum);
      }
    });
  },

  showBankMenu: function (bankId: number, priceCard: number) {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `~b~Tiklayin "~g~Enter~b~", Ogeyi secmek icin`);
    switch (bankId) {
      case 1:
        menu.spriteName = "fleeca";
        break;
      case 2:
        menu.spriteName = "blane";
        break;
      case 108:
        menu.spriteName = "pacific";
        break;
      case 0:
        menu.spriteName = "maze";
        break;
      default:
        menu.title = 'Banka'
        break;
    }
    if (
      (bankId == 0 && user.get('bank_prefix') == 1111) ||
      (bankId == 1 && user.get('bank_prefix') == 2222) ||
      (bankId == 2 && user.get('bank_prefix') == 3333) ||
      (bankId == 108 && user.get('bank_prefix') == 4444)
    ) {
      menu.AddMenuItem('Para cekme').eventName = 'server:bank:withdraw';
      menu.AddMenuItem('Para yatir').eventName = 'server:bank:deposit';
      menu.AddMenuItem('Bakiye').SetRightLabel(
        '~g~$' + methods.numberFormat(user.get('money_bank'))
      );
      menu.AddMenuItem('Kart numarasi').SetRightLabel(
        user.get('bank_prefix') + '-' + user.get('bank_number')
      );
      menu.AddMenuItem('Havale / EFT', 'Transfer sirasinda miktarin %1').eventName =
        'server:bank:transferMoney';
      if (
        user.get('bank_prefix') == 2222 ||
        user.get('bank_prefix') == 3333 ||
        user.get('bank_prefix') == 4444
      )
        menu.AddMenuItem('~b~Kart numarasini degistir', 'Fiyat: ~g~$100,000').eventName =
          'server:bank:changeCardNumber';
      menu.AddMenuItem('~r~Hesabini kapat').eventName = 'server:bank:closeCard';
    } else {
      menu.AddMenuItem('Kredi karti icin basvurun', 'Fiyat: ~g~$' + priceCard).eventName =
        'server:bank:openCard';
    }

    let closeItem = menu.AddMenuItem('~r~Kapat');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:bank:withdraw') {
        let mStr = await UIMenu.Menu.GetUserInput('Para cekme tutari', '', 9);
        if (mStr == '') return;
        let money = methods.parseInt(mStr);
        mp.events.callRemote(item.eventName, money, 0);
      } else if (item.eventName == 'server:bank:deposit') {
        let mStr = await UIMenu.Menu.GetUserInput('Katki tutari', '', 9);
        if (mStr == '') return;
        let money = methods.parseInt(mStr);
        mp.events.callRemote(item.eventName, money, 0);
      } else if (item.eventName == 'server:bank:transferMoney') {
        let bankPrefix = methods.parseInt(await UIMenu.Menu.GetUserInput('Kart oneki', '', 4));
        let bankNumber = methods.parseInt(await UIMenu.Menu.GetUserInput('Kart numarasi', '', 9));
        let money = methods.parseInt(await UIMenu.Menu.GetUserInput('Transfer miktari', '', 9));
        mp.events.callRemote(item.eventName, bankPrefix, bankNumber, money);
      } else if (item.eventName == 'server:bank:changeCardNumber') {
        let bankNumber = methods.parseInt(
          await UIMenu.Menu.GetUserInput('Istenilen kart numarasi', '', 9)
        );
        mp.events.callRemote(item.eventName, bankNumber);
      } else if (item.eventName == 'server:bank:closeCard') {
        mp.events.callRemote(item.eventName);
      } else if (item.eventName == 'server:bank:openCard') {
        mp.events.callRemote(item.eventName, bankId, priceCard);
      }
    });
  },

  showAtmMenu: function () {
    mp.events.callRemote('atm:open');
    gui.setGui('atm');
  },

  showRentVehMailMenu: function () {
    let menu = UIMenu.Menu.Create(`Mail`, `~b~Tiklayin "~g~Enter~b~", Kiralamak icin`);

    menu.AddMenuItem('Posta tasimaciligi', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('Yuk tasimaciligi', 'Fiyat: ~g~$900').doName = 'takeVehicle1';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.get('job') != 'mail' && user.get('job') != 'mail2') {
          mp.game.ui.notifications.show('~r~Bir posta sirketi icin calismiyorsunuz');
          return;
        }

        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);

        if (user.get('job') == 'mail') business.addMoney(115, 100);
        if (user.get('job') == 'mail2') business.addMoney(119, 100);

        switch (user.get('job')) {
          case 'mail':
            vehicles.spawnJobCar(-416.051, -2855.117, 5.903267, 29.43917, 444171386, 'mail');
            break;
          case 'mail2':
            vehicles.spawnJobCar(74.63538, 120.9179, 79.095, 159.2784, -233098306, 'mail2');
            break;
        }
      }
      if (item.doName == 'takeVehicle1') {
        if (
          user.get('job') != 'trucker1' &&
          user.get('job') != 'trucker2' &&
          user.get('job') != 'trucker3'
        ) {
          mp.game.ui.notifications.show('~r~Yuk tasimaciliginda calismiyorsunuz');
          return;
        }

        if (user.getCashMoney() < 900) {
          mp.game.ui.notifications.show('~r~Cebinizde $900 yok');
          return;
        }
        user.removeCashMoney(900);

        if (
          methods.distanceToPos(
            new mp.Vector3(-416.051, -2855.117, 5.903267),
            mp.players.local.position
          ) < 100
        ) {
          vehicles.spawnJobCar(-416.051, -2855.117, 5.903267, 29.43917, 'burrito3', 'trucker11');
          business.addMoney(115, 900);
        }
        if (
          methods.distanceToPos(
            new mp.Vector3(74.63538, 120.9179, 79.095),
            mp.players.local.position
          ) < 50
        ) {
          vehicles.spawnJobCar(74.63538, 120.9179, 79.095, 159.2784, 'pony', 'trucker12');
          business.addMoney(119, 900);
        }
      }
    });
  },

  showRentVehTruckerMenu: function (id: number) {
    let menu = UIMenu.Menu.Create(`Yuk tasimaciligi`, `~b~Tiklayin "~g~Enter~b~", Kiralamak icin`);

    menu.AddMenuItem('~g~==========[Kamyonlar]===========');

    let price = 4000;
    let vItem = menu.AddMenuItem('Mule', 'Fiyat: ~g~$' + price);
    vItem.price = price;
    switch (methods.getRandomInt(0, 3)) {
      case 0:
        vItem.name = 'Mule3';
        break;
      case 1:
        vItem.name = 'Mule2';
        break;
      default:
        vItem.name = 'Mule';
        break;
    }
    vItem.doName = 'takeVehicle';

    price = 3500;
    vItem = menu.AddMenuItem('Benson', 'Fiyat: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Benson';
    vItem.doName = 'takeVehicle';

    // price = 3000;
    // vItem = menu.AddMenuItem('Pounder', 'Цена: ~g~$' + price);
    // vItem.price = price;
    // vItem.name = 'Pounder';
    // vItem.doName = 'takeVehicle';

    menu.AddMenuItem('~g~==========[Uzun mesafe]===========');

    price = 8000;
    vItem = menu.AddMenuItem('Pounder', 'Fiyat: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Pounder';
    vItem.doName = 'takeVehicle1';

    price = 9000;
    vItem = menu.AddMenuItem('Pounder2', 'Fiyat: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Pounder2';
    vItem.doName = 'takeVehicle1';

    // price = 10000;
    // vItem = menu.AddMenuItem('Phantom', 'Цена: ~g~$' + price);
    // vItem.price = price;
    // vItem.name = 'Phantom';
    // vItem.doName = 'takeVehicle1';

    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.get('job') != 'trucker2') {
          mp.game.ui.notifications.show('~r~Kamyonculukta olmalisin');
          return;
        }

        if (user.get('skill_trucker') < 500) {
          mp.game.ui.notifications.show('~r~Bir kamyon soforunun becerisi en az %33 olmalidir');
          return;
        }

        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~Elinizde yok $' + item.price);
          return;
        }
        user.removeCashMoney(item.price);

        switch (id) {
          case 1:
            business.addMoney(159, item.price);
            vehicles.spawnJobCar(
              834.4056396484375,
              -3210.1337890625,
              4.876688003540039,
              39.51744079589844,
              item.name.toLowerCase(),
              'trucker21'
            );
            break;
          case 2:
            business.addMoney(161, item.price);
            vehicles.spawnJobCar(
              120.0014877319336,
              -2581.646240234375,
              4.986051082611084,
              178.07183837890625,
              item.name.toLowerCase(),
              'trucker22'
            );
            break;
          case 3:
            business.addMoney(160, item.price);
            vehicles.spawnJobCar(
              665.429443359375,
              -2672.387939453125,
              5.05723237991333,
              89.58071899414062,
              item.name.toLowerCase(),
              'trucker23'
            );
            break;
        }
      }
      if (item.doName == 'takeVehicle1') {
        if (user.get('job') != 'trucker3') {
          mp.game.ui.notifications.show('~r~Kamyonculukta calismalisin');
          return;
        }

        if (user.get('skill_trucker') < 1000) {
          mp.game.ui.notifications.show('~r~Kamyon soforunun becerisi en az %66 olmalidir');
          return;
        }

        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~Cebinizde $ yok' + item.price);
          return;
        }
        user.removeCashMoney(item.price);

        switch (id) {
          case 1:
            business.addMoney(159, item.price);
            vehicles.spawnJobCar(
              834.4056396484375,
              -3210.1337890625,
              4.876688003540039,
              39.51744079589844,
              item.name.toLowerCase(),
              'trucker31'
            );
            break;
          case 2:
            business.addMoney(161, item.price);
            vehicles.spawnJobCar(
              120.0014877319336,
              -2581.646240234375,
              4.986051082611084,
              178.07183837890625,
              item.name.toLowerCase(),
              'trucker32'
            );
            break;
          case 3:
            business.addMoney(160, item.price);
            vehicles.spawnJobCar(
              665.429443359375,
              -2672.387939453125,
              5.05723237991333,
              89.58071899414062,
              item.name.toLowerCase(),
              'trucker33'
            );
            break;
        }
      }
    });
  },

  showRentVehBusMenu: function () {
    if (user.get('job') != 'bus1' && user.get('job') != 'bus2' && user.get('job') != 'bus3') {
      mp.game.ui.notifications.show('~r~Sen bir otobus sirketi icin calismiyorsun');
      return;
    }

    let menu = UIMenu.Menu.Create(`Otobus`, `~b~Tiklayin"~g~Enter~b~", Kiralik`);

    menu.AddMenuItem('Arac kiralama', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);
        coffer.addMoney(100);

        switch (user.get('job')) {
          case 'bus1':
            vehicles.spawnJobCar(-733.1366, -2149.65356, 6.821907, -174.20549, -713569950, 'bus1');
            break;
          case 'bus2':
            vehicles.spawnJobCar(-728.104, -2154.26245, 6.82229853, -174.645248, 1283517198, 'bus2');
            break;
          case 'bus3':
            vehicles.spawnJobCar(-723.1534, -2158.188, 6.821994, -174.612122, -2072933068, 'bus3');
            break;
        }
      }
    });
  },

  showRentVehTaxi1Menu: function () {
    if (user.get('job') != 'taxi1') {
      mp.game.ui.notifications.show('~r~Taksi soforu olarak calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`Taksi`, `~b~Tıkla "~g~Enter~b~", Kiralamak icin`);

    let itemPrice = 100;
    let menuItem = menu.AddMenuItem(
      'Stanier (Ekonomi)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -956048545;
    menuItem.skill = 0;

    itemPrice = 250;
    menuItem = menu.AddMenuItem(
      'Oracle2 (Konfor)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -511601230;
    menuItem.skill = 100;

    itemPrice = 500;
    menuItem = menu.AddMenuItem(
      'Schafter4 (Konfor +)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = 1489967196;
    menuItem.skill = 200;

    itemPrice = 1000;
    menuItem = menu.AddMenuItem(
      'Revolter (Is dunyasi)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -410205223;
    menuItem.skill = 300;

    itemPrice = 3000;
    menuItem = menu.AddMenuItem('SC1 (Spor)', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1352136073;
    menuItem.skill = 400;

    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.price > 0) {
        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~Cebinde hic paran yok $' + item.price);
          return;
        }
        if (user.get('skill_taxi') < item.skill) {
          mp.game.ui.notifications.show(
            `~r~Bir taksi soforunun becerilere ihtiyaciniz bulunmaktadir ~s~${item.skill / 4}% ~r~Kiralik`
          );
          return;
        }
        user.removeCashMoney(item.price);
        business.addMoney(114, item.price);

        vehicles.spawnJobCar(906.6081, -186.1309, 74.62754, 63.30142, item.hash, 'taxi1');
      }
    });
  },

  showRentVehTaxi2Menu: function () {
    if (user.get('job') != 'taxi2') {
      mp.game.ui.notifications.show('~r~Taksi soforu olarak calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`Taksi`, `~b~Tikla "~g~Enter~b~", Kiralamak icin`);

    let itemPrice = 100;
    let menuItem = menu.AddMenuItem(
      'Primo (Ekonomi)',
      `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -1150599089;
    menuItem.skill = 0;

    itemPrice = 250;
    menuItem = menu.AddMenuItem(
      'Oracle2 (Konfor)',
      `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -511601230;
    menuItem.skill = 100;

    itemPrice = 500;
    menuItem = menu.AddMenuItem(
      'Schafter4 (Konfor plus)',
      `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = 1489967196;
    menuItem.skill = 200;

    itemPrice = 1000;
    menuItem = menu.AddMenuItem(
      'Revolter (Luks)',
      `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -410205223;
    menuItem.skill = 300;

    itemPrice = 3000;
    menuItem = menu.AddMenuItem('SC1 (Sport)', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1352136073;
    menuItem.skill = 400;

    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.price > 0) {
        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~Hic paran yok' + item.price);
          return;
        }
        if (user.get('skill_taxi') < item.skill) {
          mp.game.ui.notifications.show(
            `~r~Taksi soforunun becerisine ihtiyac vardir ~s~${item.skill / 4}% ~r~Kirala`
          );
          return;
        }
        user.removeCashMoney(item.price);
        business.addMoney(147, item.price);

        vehicles.spawnJobCar(891.8828, -1024.4975, 33.9666, 272.55, item.hash, 'taxi2');
      }
    });
  },


  showRentVehBugstarMenu: function () {
    if (user.get('job') != 'bgstar') {
      mp.game.ui.notifications.show('~r~BugStars icin calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`Bugstars`, `~b~Tikla "~g~Enter~b~", Kirala`);

    menu.AddMenuItem('Arac kiralama', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(116, 100);
        vehicles.spawnJobCar(151.1033, -3083.113, 5.711528, 177.4191, -907477130, 'bgstar');
      }
    });
  },

  showRentVehBshotMenu: function () {
    if (user.get('job') != 'bshot') {
      mp.game.ui.notifications.show('~r~BugStars icin calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`BurgerShot`, `~b~Tikla "~g~Enter~b~", Kirala`);

    menu.AddMenuItem('Arac kiralama', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(116, 100);
        vehicles.spawnJobCar(-1163.2613, -891.0358, 14.142, 123.2237, 1039032026, 'bshot');
      }
    });
  },

  showRentVehWaterPowerMenu: function () {
    if (user.get('job') != 'water') {
      mp.game.ui.notifications.show('~r~Water & Power icin calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`W&P`, `~b~Tikla "~g~Enter~b~", Kirala`);

    menu.AddMenuItem('Arac kiralama', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);
        coffer.addMoney(100);
        vehicles.spawnJobCar(633.9341, 125.0401, 92.60691, 69.48256, -1346687836, 'water');
      }
    });
  },

  showRentVehSunsetBleachMenu: function () {
    if (user.get('job') != 'sunb') {
      mp.game.ui.notifications.show('~r~Sunset Bleach icin calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`Sunset`, `~b~Tikla "~g~Enter~b~", Kirala`);

    menu.AddMenuItem('Arac kirala', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(117, 100);
        vehicles.spawnJobCar(-1194.017, -1480.142, 4.167116, 124.8127, -119658072, 'sunb');
      }
    });
  },

  showRentVehGardenerMenu: function () {
    if (user.get('job') != 'three') {
      mp.game.ui.notifications.show('~r~OConnor icin calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`Sunset`, `~b~Tikla "~g~Enter~b~", Kirala`);

    menu.AddMenuItem('Arac kirala', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(118, 100);
        vehicles.spawnJobCar(-1146.226, -745.6683, 19, 107.6955, 2132890591, 'three');
      }
    });
  },

  showRentVehPhotoMenu: function () {
    if (user.get('job') != 'photo') {
      mp.game.ui.notifications.show('~r~Life Invader icin calismiyorsunuz');
      return;
    }

    let menu = UIMenu.Menu.Create(`Sunset`, `~b~Tikla "~g~Enter~b~", Kirala`);

    menu.AddMenuItem('Arac kirala', 'Fiyat: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Kapat');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~Cebinizde $100 yok');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(92, 100);
        vehicles.spawnJobCar(-1051.927, -249.231, 37.56403, 205.1753, -2064372143, 'photo');
      }
    });
  },

  showInvVehBagMenu: function (veh: VehicleMp) {
    try {
      if (veh.isDead()) {
        mp.game.ui.notifications.show('~r~Imha edilen araclar');
      } else if (veh.getDoorLockStatus() !== 1) {
        mp.game.ui.notifications.show('~r~Nakliye kapali');
      } else if (mp.players.local.isInAnyVehicle(false)) {
        mp.game.ui.notifications.show('~r~Bagaja yakin olmalisin');
      } else if (methods.getVehicleInfo(veh.model).stock == 0) {
        mp.game.ui.notifications.show('~r~Bu aracta bagaj yok');
      } else {
        inventory.getItemList(
          inventory.types.Vehicle,
          veh.getNumberPlateText());
      }
    } catch (e) {
      methods.debug(e);
      mp.game.ui.notifications.show('~r~Bagaja yakin olmalisin');
    }
  },


  showPlayerPhoneSmsMenu: function (data: any[], phone: any) {
    let smsList =
      '<li class="collection-item green-text" act="newsms" tabindex="0">Kisa mesaj yaz</li>';
    let id = 0;

    let phoneOwner = `${user.get('phone_code')}-${user.get('phone')}`;

    data.forEach((property) => {
      //menu.AddMenuItemList(UiMenu, $"{(phone != property[0].toString() ? $"~g~Входящее: ~s~{property[0]}" : $"~r~Исходящее: ~s~{tempData2[i]}" )}", list, $"~b~Время:~s~ {tempData3[i]}").OnListSelected += async (uimenu, idx) =>
      let phoneNumber =
        phone != property[1][0].toString() ? `${property[1][0]}` : `${property[1][1]}`;

      let phoneInOrOut = phone != property[1][0].toString() ? 'Gelen' : 'Giden';
      smsList += `<li class=\"collection-item\" act=\"smsinfo\" param1=\"${property[0]
        }\" tabindex=\"${++id}\">${phoneNumber}<br><label>${property[1][2]
        } / ${phoneInOrOut}</label></li>`;
    });

    smsList += `<li class=\"collection-item green-text\" act=\"tomain\" tabindex=\"${++id}\">Geri</li>`;
    //<li class="collection-item" tabindex="2">555-11111111 <a class="secondary-content"><i class="material-icons phone-sms-ico phone-sms-ico-out">chat_bubble</i></a></li>
    mp.events.call('client:phone:addSmsList', smsList);
  },

  showPlayerPhoneSmsInfoMenu: function (id: number, numberFrom: string, numberTo: string, text: string, dateTime: any) {
    let isNumberFromOwner = numberFrom == user.get('phone_code') + '-' + user.get('phone');
    let smsItem = `<div class=\"hide\" id=\"data-sms-text\">Numara: ${numberFrom}\n${text}</div>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"0\">Gonderen: <label>${numberFrom}</label></li>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"1\">Alici: <label>${numberTo}</label></li>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"2\">Saat: <label>${dateTime}</label></li>`;
    smsItem += `<li class=\"collection-item\" act=\"sms-read\" tabindex=\"3\">Oku</li>`;
    if (isNumberFromOwner)
      smsItem += `<li class=\"collection-item\" act=\"newsmswithnum\" param1=\"${numberTo}\" tabindex=\"4\">Bir tane daha yaz</li>`;
    else
      smsItem += `<li class=\"collection-item\" act=\"newsmswithnum\" param1=\"${numberFrom}\" tabindex=\"4\">Yanitla</li>`;

    smsItem += `<li class=\"collection-item\" act=\"callwithnum\" param1=\"${numberFrom}\" tabindex=\"4\">Ara</li>`;
    smsItem += `<li class=\"collection-item red-text\" act=\"sms-del\" param1=\"${id}\" tabindex=\"5\">Sil</li>`;
    smsItem += `<li class=\"collection-item green-text\" act=\"tomain\" tabindex=\"6\">Geri</li>`;
    mp.events.call('client:phone:showSmsItem', smsItem);
  },

  showPlayerPhoneContInfoMenu: function (id: number, title: string, number: number) {
    let smsItem = `<li class=\"collection-item\" tabindex=\"0\">${title}</li>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"1\"><label>${number}</label></li>`;
    smsItem += `<li class=\"collection-item\" act=\"newsmswithnum\" param1=\"${number}\" tabindex=\"4\">Yaz</li>`;
    smsItem += `<li class=\"collection-item\" act=\"callwithnum\" param1=\"${number}\" tabindex=\"4\">Ara</li>`;
    smsItem += `<li class=\"collection-item\" act=\"cont-ren\" param1=\"${id}\" tabindex=\"4\">Yeniden adlandir</li>`;
    smsItem += `<li class=\"collection-item red-text\" act=\"cont-del\" param1=\"${id}\" tabindex=\"5\">Sil</li>`;
    smsItem += '<li class="collection-item green-text" act="tomain" tabindex="6">Sil</li>';
    mp.events.call('client:phone:showContItem', smsItem);
  },

  showPlayerPhoneBookMenu: function (data: any[]) {
    let smsList =
      '<li class="collection-item green-text" act="newcont" tabindex="0">Yeni kisi</li>';
    smsList +=
      '<li class="collection-item" act="911-1" tabindex="1">Polis<br><label>911-1</label></li>';
    smsList +=
      '<li class="collection-item" act="911-2" tabindex="2">Ambulans<br><label>911-2</label></li>';
    // smsList +=
    //   '<li class="collection-item" act="911-3" tabindex="3">Пожарные<br><label>911-3</label></li>';

    /*if (User.IsCartel() && user.get("rank") > 4)
      {
          smsList += "<li class=\"collection-item\" act=\"misterk1\" tabindex=\"1\">Мистер К<br><label>Продажа человека</label></li>";
          smsList += "<li class=\"collection-item\" act=\"misterk2\" tabindex=\"1\">Мистер К<br><label>Снять розыск</label></li>";
      }
      Заглушечка
      */

    // Еще не доделано
    let id = 0;
    data.forEach((property) => {
      smsList =
        smsList +
        `<li class=\"collection-item\" act=\"continfo\" param1=\"${property[0]
        }\" tabindex=\"${++id}\">${property[1][0]}<br><label>${property[1][1]}</label></li>`;
    });
    smsList += `<li class=\"collection-item green-text\" act=\"tomain\" tabindex=\"${++id}\">Geri</li>`;
    mp.events.call('client:phone:addContList', smsList);
    return;
  },

  showPlayerPhoneMenu: function () {
    if (gui.isActionGui()) return;
    /*if (await Ctos.IsBlackout())
      {
          Notification.SendWithTime("~r~Связь во время блекаута не работает");
          return;
      }
  
      if (User.GetNetwork() < 1)
      {
          Notification.SendWithTime("~r~Нет связи");
          return;
      }
  
      if (User.GetPlayerVirtualWorld() > 50000)
      {
          Notification.SendWithTime("~r~Нет связи");
          return;
      }*/

    if (user.get('jail_time') > 0) {
      mp.game.ui.notifications.show('~r~Hapishanede telefon kullanamazsın.');
      return;
    }

    UIMenu.Menu.HideMenu();

    user.playPhoneAnimation();
    mp.events.call('client:phone:show');
  },

  showInvMenu: function () {
    if (gui.currentGui != null && gui.currentGui != "inventory") return;
    UIMenu.Menu.HideMenu();

    if (user.get('jail_time') > 0) {
      mp.game.ui.notifications.show('~r~Hapishanede kullanamazsin');
      return;
    }
    // inventory.getItemList(inventory.types.Player, user.get('id'));
    mp.events.callRemote("inventory:open");
  },

  showShopMaskMenu: function (shopId: number) {
    try {
      methods.debug('Execute: menuList.showShopMaskMenu');

      let menu = UIMenu.Menu.Create('', '~b~Maske icin alisveris yapin', false, false, false, 'shopui_title_movie_masks', 'shopui_title_movie_masks');

      let maskIdx = 1;
      for (let i = 1; i < 160; i++) {
        let id = i;

        if (id == 32 || id == 35 || id == 37 || id == 47 || id == 48 || id == 52 || id == 53)
          continue;
        if (id == 141 || id == 138 || id == 135 || id == 134 || id == 133 || id == 132 || id == 131)
          continue;
        if (
          id == 130 ||
          id == 129 ||
          id == 128 ||
          id == 127 ||
          id == 125 ||
          id == 124 ||
          id == 123 ||
          id == 122 ||
          id == 119 ||
          id == 118 ||
          id == 116 ||
          id == 115 ||
          id == 114 ||
          id == 113 ||
          id == 66 ||
          id == 95 ||
          id == 96 ||
          id == 97 ||
          id == 102 ||
          id == 103 ||
          id == 105 ||
          id == 106 ||
          id == 107 ||
          id == 108 ||
          id == 110 ||
          id == 111 ||
          id == 112
        )
          continue;

        let list = [];
        for (let j = 0; j <= 20; j++) {
          if (mp.players.local.isComponentVariationValid(1, id, j)) list.push(j + '');
        }

        menu.AddMenuItemList('Maske #' + maskIdx, list, `Fiyat: ~g~$500`).maskId = id;
        maskIdx++;
      }

      menu.AddMenuItem('~r~Kapat').doName = 'closeButton';

      menu.MenuClose.on(() => {
        try {
          user.updateCharacterCloth();
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex = 0;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;
        cloth.changeMask(item.maskId, index);
      });

      menu.ItemSelect.on(async (item, index) => {
        try {
          if (currentListChangeItem == item) {
            cloth.buyMask(500, item.maskId, currentListChangeItemIndex, shopId);
          }
          if (item.doName == 'closeButton') {
            UIMenu.Menu.HideMenu();
            user.updateCharacterCloth();
          }
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.ItemSelect');
          methods.debug(e);
        }
      });
    } catch (e) {
      methods.debug('Exception: menuList.showShopMaskMenu');
      methods.debug(e);
    }
  },

  showShopClothMenu: function (shopId: number, type: number, menuType: number) {
    try {
      methods.debug('Execute: menuList.showShopClothMenu');

      if (menuType == 11) inventory.unEquipItem(265, 0, 1, 0, false);

      let title1 = 'commonmenu';
      let title2 = 'interaction_bgd';

      switch (type) {
        case 0:
          title1 = 'shopui_title_lowendfashion';
          title2 = 'shopui_title_lowendfashion';
          break;
        case 1:
          title1 = 'shopui_title_midfashion';
          title2 = 'shopui_title_midfashion';
          break;
        case 2:
          title1 = 'shopui_title_highendfashion';
          title2 = 'shopui_title_highendfashion';
          break;
        case 3:
          title1 = 'shopui_title_gunclub';
          title2 = 'shopui_title_gunclub';
          break;
        case 5:
          title1 = 'shopui_title_lowendfashion2';
          title2 = 'shopui_title_lowendfashion2';
          break;
      }

      let menu = UIMenu.Menu.Create(
        title1 != 'commonmenu' ? ' ' : 'Vangelico',
        '~b~Magaza',
        true,
        false,
        false,
        title1,
        title2
      );

      /*if (menuType == 5) {
              menu.AddMenuItem("Бейсбольная бита", "Цена: ~g~$100").doName = "baseballBat";
              menu.AddMenuItem("Бейсбольный мяч", "Цена: ~g~$10").doName = "baseballBall";
          }*/

      if (menuType == 0) {
        menu.AddMenuItem('Sapkalar').doName = 'head';
        menu.AddMenuItem('Gozlukler').doName = 'glasses';
        menu.AddMenuItem('Kupeler').doName = 'earring';
        menu.AddMenuItem('Sol el').doName = 'leftHand';
        menu.AddMenuItem('Sag el').doName = 'rightHand';
        menu.AddMenuItem('~y~Cikar').doName = 'grab';
      } else if (menuType == 1) {
        menu.AddMenuItem('Sapkalar').doName = 'head';
        menu.AddMenuItem('Gozlukler').doName = 'glasses';
        menu.AddMenuItem('Govde').doName = 'body';
        menu.AddMenuItem('Ayaklar').doName = 'legs';
        menu.AddMenuItem('Ayakkabilar').doName = 'shoes';
      } else {
        if (menuType == 7) {
          menu.AddMenuItem('~y~Kapat').doName = 'takeOff';
        }
        let skin = JSON.parse(user.get('skin'));
        let cloth = skin.SEX == 1 ? enums.get('clothF') as clothItem[] : enums.get('clothM') as clothItem[];
        for (let i = 0; i < cloth.length; i++) {
          let id = i;

          if (cloth[id][1] != menuType) continue;
          if (cloth[id][0] != type) continue;

          let list = [];
          for (let j = 0; j <= cloth[i][3] + 1; j++) {
            list.push(j + '');
          }

          let menuListItem = menu.AddMenuItemList(
            cloth[i][9].toString(),
            list,
            `Fiyat: ~g~$${methods.numberFormat(cloth[i][8])} ${cloth[i][10] > -99 ? `\n~s~Isiya dayanikli ~g~${cloth[i][10]}°` : ''
            }`
          );

          menuListItem.id1 = cloth[id][1];
          menuListItem.id2 = cloth[id][2];
          menuListItem.id4 = cloth[id][4];
          menuListItem.id5 = cloth[id][5];
          menuListItem.id6 = cloth[id][6];
          menuListItem.id7 = cloth[id][7];
          menuListItem.id8 = cloth[id][8];
        }
      }

      if (type == 5 && WEAPON_LEVEL_MIN <= user.getLevel()) {
        let menuItem = menu.AddMenuItem('Pay', `Fiyat: ~g~$350`);
        menuItem.price = 350;
        menuItem.itemId = 55;
      }

      menu.AddMenuItem('~r~Kapat').doName = 'closeButton';

      menu.MenuClose.on(() => {
        try {
          user.updateCharacterCloth();
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex = 0;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;
        cloth.change(item.id1, item.id2, index, item.id4, item.id5, item.id6, item.id7);
      });

      menu.ItemSelect.on((item, index) => {
        //if(!UIMenu.Menu.getMenuDistance(5)) return;
        try {
          if (item == currentListChangeItem) {
            cloth.buy(
              item.id8,
              item.id1,
              item.id2,
              currentListChangeItemIndex,
              item.id4,
              item.id5,
              item.id6,
              item.id7,
              shopId
            );
          }
          else if (item.doName == 'grab') {
            UIMenu.Menu.HideMenu();
            user.grab(shopId);
          }
          else if (item.doName == 'takeOff') {
            UIMenu.Menu.HideMenu();
            cloth.buy(10, menuType, 0, 0, -1, -1, -1, -1, shopId, true);
          }
          else if (item.doName == 'closeButton') {
            UIMenu.Menu.HideMenu();
            user.updateCharacterCloth();
          }
          else if (item.price > 0)
            mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId);
          else if (item.doName == 'head') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 0);
          }
          else if (item.doName == 'glasses') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 1);
          }
          else if (item.doName == 'earring') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 2);
          }
          else if (item.doName == 'leftHand') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 6);
          }
          else if (item.doName == 'rightHand') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 7);
          }
          else if (item.doName == 'head') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 0);
          }
          else if (item.doName == 'glasses') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 1);
          }
          else if (item.doName == 'body') {
            UIMenu.Menu.HideMenu();
            menuList.showShopClothMenu(shopId, 3, 11);
          }
          else if (item.doName == 'legs') {
            UIMenu.Menu.HideMenu();
            menuList.showShopClothMenu(shopId, 3, 4);
          }
          else if (item.doName == 'shoes') {
            UIMenu.Menu.HideMenu();
            menuList.showShopClothMenu(shopId, 3, 6);
          }
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.ItemSelect');
          methods.debug(e);
        }
      });
    } catch (e) {
      methods.debug('Exception: menuList.showShopClothMenu');
      methods.debug(e);
    }
  },

  showShopPropMenu: function (shopId: number, type: number, menuType: number) {
    let title1 = 'commonmenu';
    let title2 = 'interaction_bgd';

    switch (type) {
      case 0:
        title1 = 'shopui_title_lowendfashion';
        title2 = 'shopui_title_lowendfashion';
        break;
      case 1:
        title1 = 'shopui_title_midfashion';
        title2 = 'shopui_title_midfashion';
        break;
      case 2:
        title1 = 'shopui_title_highendfashion';
        title2 = 'shopui_title_highendfashion';
        break;
      case 3:
        title1 = 'shopui_title_gunclub';
        title2 = 'shopui_title_gunclub';
        break;
      case 5:
        title1 = 'shopui_title_lowendfashion2';
        title2 = 'shopui_title_lowendfashion2';
        break;
    }

    let menu = UIMenu.Menu.Create(
      title1 != 'commonmenu' ? ' ' : 'Vangelico',
      '~b~Magaza',
      true,
      false,
      false,
      title1,
      title2
    );

    menu.AddMenuItem('~y~Kapat').doName = 'takeOff';
    let q = user.get('skin');
    let skin = JSON.parse(user.get('skin'));
    let clothList = skin.SEX == 1 ? enums.get('propF') as propItem[] : enums.get('propM') as propItem[];

    for (let i = 0; i < clothList.length; i++) {
      let id = i;

      if (clothList[id][1] != menuType) continue;
      if (clothList[id][0] != type) continue;

      let list = [];
      for (let j = 0; j <= clothList[i][3] + 1; j++) {
        list.push(j + '');
      }

      let menuListItem = menu.AddMenuItemList(
        clothList[i][5].toString(),
        list,
        `Fiyat: ~g~$${methods.numberFormat(clothList[i][4])}`
      );

      menuListItem.id1 = clothList[id][1];
      menuListItem.id2 = clothList[id][2];
      menuListItem.id4 = clothList[id][4];
    }

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';

    menu.MenuClose.on(() => {
      user.updateCharacterCloth();
    });

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex = 0;

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;
      cloth.changeProp(item.id1, item.id2, index);
    });

    menu.ItemSelect.on((item, index) => {
      try {
        if (item == currentListChangeItem) {
          cloth.buyProp(item.id4, item.id1, item.id2, currentListChangeItemIndex, shopId);
        }
        if (item.doName == 'closeButton') {
          UIMenu.Menu.HideMenu();
          user.updateCharacterCloth();
        }
        if (item.doName == 'takeOff') {
          UIMenu.Menu.HideMenu();
          cloth.buyProp(0, menuType, -1, -1, shopId, true);
        }
      } catch (e) {
        methods.debug('Exception: menuList.showShopPropMenu menu.ItemSelect');
        methods.debug(e);
      }
    });
  },

  showBarberShopMenu: function (shopId: number) {
    let title1 = 'commonmenu';
    let title2 = 'interaction_bgd';

    switch (shopId) {
      case 109:
        title1 = 'shopui_title_barber';
        title2 = 'shopui_title_barber';
        break;
      case 110:
        title1 = 'shopui_title_barber2';
        title2 = 'shopui_title_barber2';
        break;
      case 111:
        title1 = 'shopui_title_barber3';
        title2 = 'shopui_title_barber3';
        break;
      case 48:
        title1 = 'shopui_title_barber4';
        title2 = 'shopui_title_barber4';
        break;
      case 112:
        title1 = 'shopui_title_highendsalon';
        title2 = 'shopui_title_highendsalon';
        break;
    }

    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Gorunumu degistirmek sag/sol',
      false,
      false,
      false,
      title1,
      title2
    );

    let list = [];

    if (user.getSex() == 1) {
      for (let j = 0; j < 77; j++) {
        list.push(j + '');
      }
    } else {
      for (let j = 0; j < 72; j++) {
        list.push(j + '');
      }
    }

    let menuListItem = menu.AddMenuItemList('Sac modeli', list, `Fiyat: ~g~$400`);
    menuListItem.doName = 'GTAO_HAIR';
    menuListItem.price = 400;

    list = [];
    for (let j = 0; j < 64; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Sac rengi', list, `Fiyat: ~g~$160`);
    menuListItem.doName = 'GTAO_HAIR_COLOR';
    menuListItem.price = 160;

    list = [];
    for (let j = 0; j < 64; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Sac beyazlatma', list, `Fiyat: ~g~$160`);
    menuListItem.doName = 'GTAO_HAIR_COLOR2';
    menuListItem.price = 160;

    list = [];
    for (let j = 0; j < 32; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Goz rengi', list, `Fiyat: ~g~$120`);
    menuListItem.doName = 'GTAO_EYE_COLOR';
    menuListItem.price = 120;

    list = [];
    for (let j = 0; j < 30; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Kas', list, `Fiyat: ~g~$70`);
    menuListItem.doName = 'GTAO_EYEBROWS';
    menuListItem.price = 70;

    list = [];
    for (let j = 0; j < 64; j++) {
      list.push(j + '');
    }
    /*menuListItem = menu.AddMenuItemList('Цвет бровей', list, `Цена: ~g~$50`);
      menuListItem.doName = 'GTAO_EYEBROWS_COLOR';
      menuListItem.price = 50;*/

    list = ['~r~Hayir'];
    for (let j = 0; j < 10; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Ciller', list, `Fiyat: ~g~$250`);
    menuListItem.doName = 'GTAO_OVERLAY9';
    menuListItem.price = 250;

    list = [];
    for (let j = 0; j < 5; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Cillerin rengi', list, `Fiyat: ~g~$50`);
    menuListItem.doName = 'GTAO_OVERLAY9_COLOR';
    menuListItem.price = 50;

    if (user.getSex() == 0) {
      list = ['~r~Hayir'];
      for (let j = 0; j < 30; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Sakal', list, `Fiyat: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 64; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Sakalin rengi', list, `Fiyat: ~g~$120`);
      menuListItem.doName = 'GTAO_OVERLAY_COLOR';
      menuListItem.price = 120;

      list = ['~r~Hayir'];
      for (let j = 0; j < mp.game.ped.getNumHeadOverlayValues(10) + 1; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Gogus kili', list, `Fiyat: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY10';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 64; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Gogus kili', list, `Fiyat: ~g~$120`);
      menuListItem.doName = 'GTAO_OVERLAY10_COLOR';
      menuListItem.price = 120;
    } else {
      list = ['~r~Hayir'];
      for (let j = 0; j < mp.game.ped.getNumHeadOverlayValues(8) + 1; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Ruj', list, `Fiyat: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY8';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 60; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Ruj rengi', list, `Fiyat: ~g~$110`);
      menuListItem.doName = 'GTAO_OVERLAY8_COLOR';
      menuListItem.price = 110;

      list = ['~r~Hayir '];
      for (let j = 0; j < 7; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Allik', list, `Fiyat: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY5';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 60; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Allik rengi', list, `Fiyat: ~g~$110`);
      menuListItem.doName = 'GTAO_OVERLAY5_COLOR';
      menuListItem.price = 110;

      list = ['~r~Hayir'];
      for (let j = 0; j < mp.game.ped.getNumHeadOverlayValues(8) + 1; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Makyaj', list, `Fiyat: ~g~$300`);
      menuListItem.doName = 'GTAO_OVERLAY4';
      menuListItem.price = 300;

      list = [];
      for (let j = 0; j < 10; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Makyaj rengi', list, `Fiyat: ~g~$150`);
      menuListItem.doName = 'GTAO_OVERLAY4_COLOR';
      menuListItem.price = 150;
    }

    menu.AddMenuItem('~y~Cikar').doName = 'grab';
    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';

    menu.MenuClose.on(() => {
      user.updateCharacterFace();
      user.updateCharacterCloth();
    });

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex = 0;

    let skin = {
      GTAO_HAIR: methods.parseInt(user.get('GTAO_HAIR')),
      GTAO_HAIR_COLOR: methods.parseInt(user.get('GTAO_HAIR_COLOR')),
      GTAO_HAIR_COLOR2: methods.parseInt(user.get('GTAO_HAIR_COLOR2')),
      GTAO_EYE_COLOR: methods.parseInt(user.get('GTAO_EYE_COLOR')),
      GTAO_EYEBROWS_COLOR: methods.parseInt(user.get('GTAO_EYEBROWS_COLOR')),
      GTAO_OVERLAY9: methods.parseInt(user.get('GTAO_OVERLAY9')),
      GTAO_OVERLAY9_COLOR: methods.parseInt(user.get('GTAO_OVERLAY9_COLOR')),
      GTAO_OVERLAY: methods.parseInt(user.get('GTAO_OVERLAY')),
      GTAO_OVERLAY_COLOR: methods.parseInt(user.get('GTAO_OVERLAY_COLOR')),
      GTAO_OVERLAY4: methods.parseInt(user.get('GTAO_OVERLAY4')),
      GTAO_OVERLAY4_COLOR: methods.parseInt(user.get('GTAO_OVERLAY4_COLOR')),
      GTAO_OVERLAY5: methods.parseInt(user.get('GTAO_OVERLAY5')),
      GTAO_OVERLAY5_COLOR: methods.parseInt(user.get('GTAO_OVERLAY5_COLOR')),
      GTAO_OVERLAY8: methods.parseInt(user.get('GTAO_OVERLAY8')),
      GTAO_OVERLAY8_COLOR: methods.parseInt(user.get('GTAO_OVERLAY8_COLOR')),
      GTAO_OVERLAY10: methods.parseInt(user.get('GTAO_OVERLAY10')),
      GTAO_OVERLAY10_COLOR: methods.parseInt(user.get('GTAO_OVERLAY10_COLOR')),
      GTAO_EYEBROWS: methods.parseInt(user.get('GTAO_EYEBROWS')),
    };


    setTimeout(function () {
      user.updateCharacterFace();
      user.updateCharacterCloth();
    }, 500);

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;

      switch (item.doName) {
        case 'GTAO_HAIR':
          if (index == 23 || index == 24) skin.GTAO_HAIR = 1;
          else skin.GTAO_HAIR = index;
          mp.players.local.setComponentVariation(2, skin.GTAO_HAIR, 0, 2);
          mp.players.local.setHairColor(skin.GTAO_HAIR_COLOR, skin.GTAO_HAIR_COLOR2);
          break;

        case 'GTAO_HAIR_COLOR':
          skin.GTAO_HAIR_COLOR = index;
          mp.players.local.setHairColor(skin.GTAO_HAIR_COLOR, skin.GTAO_HAIR_COLOR2);
          break;

        case 'GTAO_HAIR_COLOR2':
          skin.GTAO_HAIR_COLOR2 = index;
          mp.players.local.setHairColor(skin.GTAO_HAIR_COLOR, skin.GTAO_HAIR_COLOR2);
          break;

        case 'GTAO_EYE_COLOR':
          skin.GTAO_EYE_COLOR = index;
          mp.players.local.setEyeColor(skin.GTAO_EYE_COLOR);
          break;

        case 'GTAO_EYEBROWS':
          skin.GTAO_EYEBROWS = index;
          mp.players.local.setHeadOverlay(2, skin.GTAO_EYEBROWS, 1.0, skin.GTAO_EYEBROWS_COLOR, 0);
          break;

        case 'GTAO_EYEBROWS_COLOR':
          skin.GTAO_EYEBROWS_COLOR = index;
          mp.players.local.setHeadOverlay(2, skin.GTAO_EYEBROWS, 1.0, skin.GTAO_EYEBROWS_COLOR, 0);
          break;

        case 'GTAO_OVERLAY9':
          skin.GTAO_OVERLAY9 = index - 1;
          mp.players.local.setHeadOverlay(9, skin.GTAO_OVERLAY9, 1.0, skin.GTAO_OVERLAY9_COLOR, 0);
          break;

        case 'GTAO_OVERLAY9_COLOR':
          skin.GTAO_OVERLAY9_COLOR = index;
          mp.players.local.setHeadOverlay(9, skin.GTAO_OVERLAY9, 1.0, skin.GTAO_OVERLAY9_COLOR, 0);
          break;

        case 'GTAO_OVERLAY':
          skin.GTAO_OVERLAY = index - 1;
          mp.players.local.setHeadOverlay(1, skin.GTAO_OVERLAY, 1.0, skin.GTAO_OVERLAY_COLOR, 0);
          break;

        case 'GTAO_OVERLAY_COLOR':
          skin.GTAO_OVERLAY_COLOR = index;
          mp.players.local.setHeadOverlay(1, skin.GTAO_OVERLAY, 1.0, skin.GTAO_OVERLAY_COLOR, 0);
          break;

        case 'GTAO_OVERLAY4':
          skin.GTAO_OVERLAY4 = index - 1;
          mp.players.local.setHeadOverlay(4, skin.GTAO_OVERLAY4, 1.0, skin.GTAO_OVERLAY4_COLOR, 0);
          break;

        case 'GTAO_OVERLAY4_COLOR':
          skin.GTAO_OVERLAY4_COLOR = index;
          mp.players.local.setHeadOverlay(4, skin.GTAO_OVERLAY4, 1.0, skin.GTAO_OVERLAY4_COLOR, 0);
          break;

        case 'GTAO_OVERLAY5':
          skin.GTAO_OVERLAY5 = index - 1;
          mp.players.local.setHeadOverlay(5, skin.GTAO_OVERLAY5, 1.0, skin.GTAO_OVERLAY5_COLOR, 0);
          break;

        case 'GTAO_OVERLAY5_COLOR':
          skin.GTAO_OVERLAY5_COLOR = index;
          mp.players.local.setHeadOverlay(5, skin.GTAO_OVERLAY5, 1.0, skin.GTAO_OVERLAY5_COLOR, 0);
          break;

        case 'GTAO_OVERLAY8':
          skin.GTAO_OVERLAY8 = index - 1;
          mp.players.local.setHeadOverlay(8, skin.GTAO_OVERLAY8, 1.0, skin.GTAO_OVERLAY8_COLOR, 0);
          break;

        case 'GTAO_OVERLAY8_COLOR':
          skin.GTAO_OVERLAY8_COLOR = index;
          mp.players.local.setHeadOverlay(8, skin.GTAO_OVERLAY8, 1.0, skin.GTAO_OVERLAY8_COLOR, 0);
          break;

        case 'GTAO_OVERLAY10':
          skin.GTAO_OVERLAY10 = index - 1;
          mp.players.local.setHeadOverlay(10, skin.GTAO_OVERLAY10, 1.0, skin.GTAO_OVERLAY10_COLOR, 0);
          break;

        case 'GTAO_OVERLAY10_COLOR':
          skin.GTAO_OVERLAY10_COLOR = index;
          mp.players.local.setHeadOverlay(10, skin.GTAO_OVERLAY10, 1.0, skin.GTAO_OVERLAY10_COLOR, 0);
          break;
      }
    });

    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      try {
        UIMenu.Menu.HideMenu();
        if (item == currentListChangeItem) {
          switch (item.doName) {
            case 'GTAO_OVERLAY':
            case 'GTAO_OVERLAY4':
            case 'GTAO_OVERLAY5':
            case 'GTAO_OVERLAY8':
            case 'GTAO_OVERLAY9':
            case 'GTAO_OVERLAY10':
              currentListChangeItemIndex = currentListChangeItemIndex - 1;
              break;
          }

          if (user.getMoney() < item.price) {
            mp.game.ui.notifications.show('~r~Yeterince paraniz yok');
            return;
          }

          if (item.price < 1) return;

          user.removeMoney(item.price);
          business.addMoney(shopId, item.price);
          user.setData(item.doName, currentListChangeItemIndex);
          mp.game.ui.notifications.show('~g~Bir bedel karsiliginde gorunusu degistirdiniz: ~s~$' + item.price);
          user.saveAccount();
          user.updateCharacterFace();
          user.updateCharacterCloth();
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
        if (item.doName == 'closeButton') {
          user.updateCharacterFace();
          user.updateCharacterCloth();
        }
      } catch (e) {
        methods.debug('Exception: menuList.showBarberShopMenu menu.ItemSelect');
        methods.debug(e);
      }
    });
  },


  showPrintShopMenu: function () {
    UIMenu.Menu.HideMenu();

    if (user.get('torso') == 15) {
      mp.game.ui.notifications.show('~r~Bir giyim magzasindan tisort satin almaniz gerekiyor');
      mp.game.ui.notifications.show('~r~Bir baski etiketi hizmetini kullanmadan once');
      return;
    }

    let menu = UIMenu.Menu.Create('Magaza', '~b~Baski atolyesi');
    //TODO BLACKOUT

    let list: MenuItemClient[] = [];

    let printList = enums.get('printList') as any;

    for (let i = 0; i < printList.length; i++) {
      let price = 1000;
      if (user.getSex() == 1 && printList[i][2] != '') {
        let menuListItem = menu.AddMenuItem(
          'Baski #' + i,
          `Fiyat: ~g~$${methods.numberFormat(price)}`
        );
        menuListItem.doName = 'show';
        menuListItem.price = price;
        menuListItem.tatto1 = printList[i][0];
        menuListItem.tatto2 = printList[i][2];

        list.push(menuListItem);
      } else if (user.getSex() == 0 && printList[i][1] != '') {
        let menuListItem = menu.AddMenuItem(
          'Baski #' + i,
          `Fiyat: ~g~$${methods.numberFormat(price)}`
        );
        menuListItem.doName = 'show';
        menuListItem.price = price;
        menuListItem.tatto1 = printList[i][0];
        menuListItem.tatto2 = printList[i][1];

        list.push(menuListItem);
      }
    }

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';

    menu.IndexChange.on((index) => {
      if (index >= list.length) return;
      user.clearDecorations();
      //if(list[index])user.setDecoration(list[index].tatto1, list[index].tatto2);
      user.setDecoration(list[index].tatto1, list[index].tatto2);
    });

    menu.MenuClose.on(() => {
      user.updateTattoo();
    });

    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'show')
        mp.events.callRemote('server:print:buy', item.tatto1, item.tatto2, item.price);
    });
  },

  showTattooShopApplyMenu: function (title1: string, title2: string, shopId: number) {
    UIMenu.Menu.HideMenu();
    let menu = UIMenu.Menu.Create(' ', '~b~Dovme salonu', false, false, false, title1, title2);
    //TODO BLACKOUT

    menu.AddMenuItem('~g~Satin al').zone = 'ZONE_HEAD';
    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showRentBikeMenu: function (shopId: number, price = 1) {
    if (typeof price !== "number" || price == 0) price = 1;
    UIMenu.Menu.HideMenu();
    let menu = UIMenu.Menu.Create('', '~b~Kira', false, false, false, 'rent', 'rent');
    //TODO BLACKOUT

    let itemPrice = 3 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 3;
    let menuItem = menu.AddMenuItem('Cruiser').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 448402357;

    itemPrice = 5 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 5;
    menuItem = menu.AddMenuItem('Bmx').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1131912276;

    itemPrice = 10 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 10;
    menuItem = menu.AddMenuItem('Fixter').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -836512833;

    itemPrice = 10 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 10;
    menuItem = menu.AddMenuItem('Scorcher').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -186537451;

    itemPrice = 30 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 20;
    menuItem = menu.AddMenuItem('TriBike').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1127861609;

    itemPrice = 30 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 20;
    menuItem = menu.AddMenuItem('TriBike2').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -1233807380;

    itemPrice = 30 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 20;
    menuItem = menu.AddMenuItem('TriBike3').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -400295096;

    itemPrice = 60 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 40;
    menuItem = menu.AddMenuItem('Faggio').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -1842748181;

    itemPrice = 55 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 35;
    menuItem = menu.AddMenuItem('Faggio2').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 55628203;

    itemPrice = 50 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 30;
    menuItem = menu.AddMenuItem('Faggio3').SetRightLabel(`Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -1289178744;

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) mp.events.callRemote('server:rent:buy', item.hash, item.price, shopId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },


  showAptekaShopMenu: function (shopId: number) {
    let menu = UIMenu.Menu.Create('', '~b~Magaza', false, false, false, 'm3', 'm3');
    //TODO BLACKOUT
    let menuItem = menu.AddMenuItem('Saglik sigortasi', `Fiyat: ~g~$20,000`);
    menuItem.doName = 'medLic';

    menuItem = menu.AddMenuItem(
      'Ilk yardim cantasi',
      `Fiyat: ~g~$${PillBoxCost.healer2}~s~ Saglik sigortasi ile\n Fiyat: ~g~$${PillBoxCost.healer1}`
    );
    menuItem.price = PillBoxCost.healer2;
    menuItem.itemId = 215;

    menuItem = menu.AddMenuItem(
      'Antipohmelin (x10)',
      `Fiyat: ~g~$${PillBoxCost.antipohmelin2x10}~s~ Saglik sigortasi ile\n Fiyat: ~g~$${PillBoxCost.antipohmelin1x10}`
    );
    menuItem.price = PillBoxCost.antipohmelin2x10;
    menuItem.itemId = 221;

    /*menuItem = menu.AddMenuItem("Адреналин", `Цена: ~g~$200~s~ с мед. страховкой\nЦена: ~g~$1000`);
      menuItem.price = 200;
      menuItem.itemId = 31;*/

    menuItem = menu.AddMenuItem('Tibbi marihuana (10гр)', `Fiyat: ~g~$${PillBoxCost.marih2x10}~s~ Saglik sigortasi ile\n Fiyat: ~g~$${PillBoxCost.marih1x10}`);
    menuItem.price = PillBoxCost.marih2x10;
    menuItem.itemId = 155;

    menu.AddMenuItem('~y~Cikar').doName = 'grab';

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) {
          if (item.itemId == 31 && !user.get('med_lic')) item.price = 1000;
          if (item.itemId == 215 && !user.get('med_lic')) item.price = PillBoxCost.healer1;
          if (item.itemId == 221 && !user.get('med_lic')) item.price = PillBoxCost.antipohmelin1x10;
          if (item.itemId == 155 && !user.get('med_lic')) item.price = PillBoxCost.marih1x10;
          mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId, businessNalog.PillBox);
        }
        if (item.doName == 'medLic') {
          if (user.get('med_lic')) {
            mp.game.ui.notifications.show('~r~Saglik sigortaniz mevcut');
            return;
          }
          if (user.getMoney() < 20000) {
            mp.game.ui.notifications.show('~r~Yeterli paraniz yok');
            return;
          }

          user.setData('med_lic', true);
          user.removeMoney(20000);
          business.addMoney(shopId, 20000);
          mp.game.ui.notifications.show('~g~Saglik sigortasi satin aldiniz');
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showElectroShopMenu: function (shopId: number) {
    let menu = UIMenu.Menu.Create('', '~b~Magaza', false, false, false, shopId == 92 ? 'lifeinvader' : 'digital', shopId == 92 ? 'lifeinvader' : 'digital');
    //TODO BLACKOUT

    shopListElectro.map(itm => {
      let itemPrice = itm[1];
      let menuItem = menu.AddMenuItem(getItemNameById((itm[2] ? itm[2] : itm[0])) + (itm[3] ? (' ' + itm[3]) : ''));
      menuItem.SetRightLabel(`$${methods.numberFormat(itemPrice)}`);
      menuItem.icon = "Item_" + (itm[2] ? itm[2] : itm[0]);
      menuItem.price = itemPrice;
      menuItem.itemId = itm[0];
    })


    let menuItem: MenuItemClient;

    menuItem = menu.AddMenuItem('Ev icin pin kodu', `Fiyat: ~g~$20,000`);
    menuItem.doName = 'housePin';
    menuItem.icon = "Item_44"

    menuItem = menu.AddMenuItem('Daire icin pin kodlu kapi', `Fiyat: ~g~$10,000`);
    menuItem.doName = 'condoPin';
    menuItem.icon = "Item_43"

    menuItem = menu.AddMenuItem('Daire icin pin kodu', `Fiyat: ~g~$20,000`);
    menuItem.doName = 'apartPin';
    menuItem.icon = "Item_42"

    menu.AddMenuItem('~y~Cikis').doName = 'grab';

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId);
        if (item.doName == 'housePin') {
          if (user.get('id_house') == 0) {
            mp.game.ui.notifications.show('~r~Bir evin yok');
            return;
          }
          let pin: any = await UIMenu.Menu.GetUserInput('Pin kodu', '', 5);
          if (!pin.isNumberOnly()) return mp.game.ui.notifications.show('~r~Pin kodu yanlizca rakam icermelidir');
          pin = methods.parseInt(pin);
          if (pin == 0) {
            mp.game.ui.notifications.show('~r~Pin kpdu sifir olmamalidir');
            return;
          }
          mp.events.callRemote('server:housePin:buy', pin, shopId);
        }
        if (item.doName == 'apartPin') {
          if (user.get('apartment_id') == 0) {
            mp.game.ui.notifications.show('~r~Bir dairen yok');
            return;
          }
          let pin: any = await UIMenu.Menu.GetUserInput('Pin kodu', '', 5);
          if (!pin.isNumberOnly()) return mp.game.ui.notifications.show('~r~Pin kodu yanlizca rakam icermelidir');
          pin = methods.parseInt(pin);
          if (pin == 0) {
            mp.game.ui.notifications.show('~r~Pin kodu sifir olmamalidir');
            return;
          }
          mp.events.callRemote('server:apartPin:buy', pin, shopId);
        }
        if (item.doName == 'condoPin') {
          if (user.get('condo_id') == 0) {
            mp.game.ui.notifications.show('~r~Bir daireniz yok');
            return;
          }
          let pin: any = await UIMenu.Menu.GetUserInput('Pin kodu', '', 5);
          if (!pin.isNumberOnly()) return mp.game.ui.notifications.show('~r~in kodu yanlizca rakam icermelidir');
          pin = methods.parseInt(pin);
          if (pin == 0) {
            mp.game.ui.notifications.show('~r~Pin kodu sifir olmamalidir');
            return;
          }
          mp.events.callRemote('server:condoPin:buy', pin, shopId);
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showInvaderShopMenu: function (shopId = 92) {
    return menuList.showElectroShopMenu(shopId);
  },

  showGunShopMenu: function (shopId: number, price = 1) {
    if (WEAPON_LEVEL_MIN > user.getLevel()) return mp.game.ui.notifications.show('~r~Silah satin almak icin bir seviye gereklidir ' + WEAPON_LEVEL_MIN);
    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Silah magazasi',
      false,
      false,
      false,
      'shopui_title_gunclub',
      'shopui_title_gunclub'
    );
    //TODO BLACKOUT

    menu.AddMenuItem('~g~Marketi Aç').doName = 'openShop';
    menu.AddMenuItem('~y~Soygun Yap').doName = 'grab';
    //menu.AddMenuItem("~y~Продать оружие \"Сайга\"", 'По цене: ~g~$12.000~s~ за штуку').doName = 'server:shop:sellGun';
    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {
        if (item.armor) {
          if (item.price > user.getCashMoney()) {
            mp.game.ui.notifications.show('~r~Yeterli paraniz yok');
            return;
          }
          mp.players.local.setArmour(item.armor);
          mp.game.ui.notifications.show('~b~Kursun gecirmez yelek aldiniz');
          user.removeCashMoney(item.price);
          business.addMoney(shopId, item.price);
        } else if (item.price > 0) {
          if (item.checkLic && !user.get('gun_lic')) {
            mp.game.ui.notifications.show('~r~Silah ruhsatiniz yok');
            return;
          }
          mp.events.callRemote(
            'server:gun:buy',
            item.itemId,
            item.price,
            item.countItems ? item.countItems : 1,
            shopId
          );
        } else if (item.doName == 'grab') {
          if (methods.getRandomInt(0, 30) == 1) user.grabGun(shopId).then();
          else user.grab(shopId);
        } else if (item.doName == 'openShop') {
          let data: any = [{
            name: "Silah Mağazası",
            type: "gun",
            shopId,
            items: []
          }];

          data.shopId = shopId;
          gunShopList.map(itm => {
            let itemPrice = itm[2] * price;
            if (itemPrice <= 0) return;
            let itemName = getItemNameById(itm[1]);
            let itemId = itm[1];
            data[0].items = [...data[0].items, { id: itemId, name: itemName, desc: "", price: itemPrice }]
          });

          gui.setGui("itemshop");
          mp.events.triggerBrowser('cef:item_shop:init', data);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showShopMenu: function (shopId: any, price = 1) {
    if (typeof price != "number") price = 1;

    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Magaza 24/7',
      false,
      false,
      false,
      'shopui_title_conveniencestore',
      'shopui_title_conveniencestore'
    );
    menu.AddMenuItem('~g~Marketi Ac').doName = 'openShop';
    menu.AddMenuItem(
      '~y~Çiğ Balık Sat',
      '(Şirket %10 Kar Payı Alır)'
    ).doName = 'server:shop:sellFish';
    menu.AddMenuItem('~y~Soygun Yap').doName = 'grab';
    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {

        if (item.doName == 'server:shop:sellFish') {
          if (!Container.HasLocally(0, 'sellFish')) {
            Container.SetLocally(0, 'sellFish', true);
            mp.events.callRemote('server:shop:sellFish', shopId);
            setTimeout(function () {
              Container.ResetLocally(0, 'sellFish');
            }, 20000);
          } else {
            mp.game.ui.notifications.show('~r~Bu kadar sik balik satamazsin');
          }
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
        if (item.doName == 'openShop') {
          let data: any = [{
            name: "7/24 Alışveriş",
            shopId,
            type: "shop",
            items: []
          }];
          data.shopId = shopId;
          shopList.map(itm => {
            let itemPrice = itm[1] * price;
            if (itemPrice <= 0) return;
            let itemName = getItemNameById(itm[0]);
            let itemId = itm[0];
            data[0].items = [...data[0].items, { id: itemId, name: itemName, desc: "", price: itemPrice }]
          });

          gui.setGui("itemshop");
          mp.events.triggerBrowser('cef:item_shop:init', data);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showBarMenu: function (shopId: number, price = 1) {
    let menu = UIMenu.Menu.Create('Icecek', '~b~Icecek menusu');
    //TODO BLACKOUT

    let itemPrice = 1 * price;
    let menuItem = menu.AddMenuItem('Su', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Su';

    itemPrice = 2 * price;
    menuItem = menu.AddMenuItem('Limonata', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Limonata';

    itemPrice = 4 * price;
    menuItem = menu.AddMenuItem('Kola', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Kola';

    itemPrice = 5 * price;
    menuItem = menu.AddMenuItem('Efes Bira', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Efes Bira';
    menuItem.drunkLevel = 10;

    itemPrice = 10 * price;
    menuItem = menu.AddMenuItem('Absolut Votka', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Absolut Votka';
    menuItem.drunkLevel = 20;

    itemPrice = 12 * price;
    menuItem = menu.AddMenuItem('Olmeca Tekila', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Olmeca Tekila';
    menuItem.drunkLevel = 25;

    itemPrice = 14 * price;
    menuItem = menu.AddMenuItem('Cin', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Cin';
    menuItem.drunkLevel = 30;

    itemPrice = 25 * price;
    menuItem = menu.AddMenuItem('Jack Daniels Viski', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'Jack Daniels Viski';
    menuItem.drunkLevel = 40;

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) {
          if (user.getMoney() < item.price) {
            mp.game.ui.notifications.show('~r~Yeterince paraniz yok');
            return;
          }

          business.addMoney(shopId, item.price);
          user.removeMoney(item.price);
          healProtection()
          if (mp.players.local.health < 90) mp.players.local.health += 10;

          if (item.drunkLevel) user.addDrugLevel(99, item.drunkLevel);

          chat.sendMeCommand(`Ictiniz ${item.label}`);
          user.playAnimation('mp_player_intdrink', 'loop_bottle', 48);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showBarFreeMenu: function (price = 1, business_id = 0) {
    let menu = UIMenu.Menu.Create('Icecek', '~b~Icecek menusu');
    //TODO BLACKOUT

    let itemPrice = 1 * price;
    let menuItem = menu.AddMenuItem('Su', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Su';

    itemPrice = 2 * price;
    menuItem = menu.AddMenuItem('Limonata', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Limonata';

    itemPrice = 4 * price;
    menuItem = menu.AddMenuItem('Kola', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Kola';

    itemPrice = 5 * price;
    menuItem = menu.AddMenuItem('Efes Bira', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Efes Bira';
    menuItem.drunkLevel = 10;

    itemPrice = 10 * price;
    menuItem = menu.AddMenuItem('Absolut Votka', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Absolut Votka';
    menuItem.drunkLevel = 20;

    itemPrice = 12 * price;
    menuItem = menu.AddMenuItem('Olmeca Tekila', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Olmeca Tekila';
    menuItem.drunkLevel = 20;

    itemPrice = 14 * price;
    menuItem = menu.AddMenuItem('Cin', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Cin';
    menuItem.drunkLevel = 20;

    itemPrice = 25 * price;
    menuItem = menu.AddMenuItem('Jack Daniels Viski', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'Jack Daniels Viski';
    menuItem.drunkLevel = 20;

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) {
          healProtection()
          if (mp.players.local.health < 90) mp.players.local.health += 10;

          if (item.drunkLevel) user.addDrugLevel(99, item.drunkLevel);
          user.removeCashMoney(item.price);
          if (business_id != 0) {
            business.addMoney(business_id, item.price)
          }
          chat.sendMeCommand(`Ictiniz ${item.label}`);
          user.playAnimation('mp_player_intdrink', 'loop_bottle', 48);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showLscMenu: function (shopId: number, price = 1, idx: number, vListTun: any, vListColor: any) {
    //TODO BLACKOUT

    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Sanayi',
      false,
      false,
      false,
      lscBanner1,
      lscBanner2
    );

    let itemPrice = 400 * price;
    let menuItem = menu.AddMenuItem('Bakim onarim', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.doName = 'repair';

    menuItem = menu.AddMenuItem('Ayar');
    menuItem.doName = 'setTunning';

    // menuItem = menu.AddMenuItem('ЧИП Тюнинг');
    // menuItem.doName = 'setSTunning';

    // itemPrice = 40000;
    // menuItem = menu.AddMenuItem(
    //   'Сменить номер',
    //   `Цена: ~g~$${methods.numberFormat(itemPrice)}\n~s~Менее 4 символов от ~g~$100.000`
    // );
    // menuItem.price = itemPrice;
    // menuItem.doName = 'setNumber';

    itemPrice = 150000;
    menuItem = menu.AddMenuItem('Neon', `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.doName = 'setNeon';
    let acceptNeon = false;

    menuItem = menu.AddMenuItem('Renk');
    menuItem.doName = 'setColor';

    menuItem = menu.AddMenuItem('~y~Calinti bir aracin satisi');
    menuItem.doName = 'sellCar';

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      try {
        if (item.doName == 'setNeon' && !acceptNeon) {
          acceptNeon = true;
          user.notify('~g~Satin alimi tamamlamak icin tekrar basiniz');
          return;
        }
        UIMenu.Menu.HideMenu();
        if (
          item.doName == 'setNeon' ||
          // item.doName == 'setSTunning' ||
          item.doName == 'setTunning' ||
          // item.doName == 'setNumber' ||
          item.doName == 'repair' ||
          item.doName == 'sellCar'
        )
          menuList.showLscVehicleListMenu(shopId, idx, vListTun, vListColor, item.doName, item.price);
        else if (item.doName == 'setColor')
          menuList.showLscVehicleColorListMenu(shopId, idx, vListTun, vListColor, item.doName, price);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showLscVehicleListMenu: function (shopId: number, idx: number, vListTun: string[], vListColor: any, action: any, price = 1) {
    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Sanayi',
      false,
      false,
      false,
      lscBanner1,
      lscBanner2
    );

    vListTun.forEach(function (item) {
      menu.AddMenuItem(
        '~b~Araç numarasi:~s~ ' + item,
        'Tikla ~g~Enter~s~ Uygulamak icin'
      ).number = item.toString();
    });

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.number) {
        if (action == 'sellCar') {
          mp.events.callRemote('server:sellVeh', item.number);
        } else if (action == 'setTunning') {
          mp.events.callRemote(
            'server:lsc:showLscVehicleTunningMenu',
            shopId,
            idx,
            item.number,
            price
          );
          // } else if (action == 'setSTunning') {
          //   mp.events.callRemote(
          //     'server:lsc:showLscVehicleSTunningMenu',
          //     shopId,
          //     idx,
          //     item.number,
          //     price
          //   );
        } else {
          let number = '';
          if (action == 'setNumber') number = await UIMenu.Menu.GetUserInput('Sayi', '', 8);
          mp.events.callRemote(
            'server:lsc:buy',
            item.number,
            price,
            shopId,
            action,
            number.toUpperCase()
          );
        }
      }
    });
  },

  showLscVehicleColorListMenu: function (
    shopId: number,
    idx: number,
    vListTun: string[],
    vListColor: string[],
    action: any,
    price = 1
  ) {
    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let menu = UIMenu.Menu.Create(' ', '~b~Yeniden boya', false, false, false, lscBanner1, lscBanner2);

    vListColor.forEach(function (item) {
      menu.AddMenuItem(
        '~b~Arac numarasi:~s~ ' + item,
        'Tikla ~g~Enter~s~ Yeniden boyamak icin'
      ).number = item.toString();
    });

    menu.AddMenuItem('~r~Kapat').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.number) menuList.showLscVehicleColorMenu(shopId, idx, item.number, price);
    });
  },

  showLscVehicleColorMenu: function (shopId: number, idx: number, vehNumber: string, price = 1) {
    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let camPos = new mp.Vector3(
      enums.lscCamColorPos[idx][0],
      enums.lscCamColorPos[idx][1],
      enums.lscCamColorPos[idx][2]
    );

    let cam = mp.cameras.new('lscColor', camPos, new mp.Vector3(0, 0, 0), 90);
    cam.pointAtCoord(
      enums.lscCarColorPos[idx][0],
      enums.lscCarColorPos[idx][1],
      enums.lscCarColorPos[idx][2]
    );
    cam.setActive(true);
    mp.game.cam.renderScriptCams(true, true, 500, false, false);

    let menu = UIMenu.Menu.Create(' ', '~b~Boyama', false, false, false, lscBanner1, lscBanner2);

    let list = [];
    for (let i = 0; i < 156; i++) list.push(i + '');
    let color1Item = menu.AddMenuItemList('Renk-1', list, 'Fiyat: ~g~$' + 500 * price);

    list = [];
    for (let i = 0; i < 156; i++) list.push(i + '');
    let color2Item = menu.AddMenuItemList('Renk-2', list, 'Fiyat: ~g~$' + 300 * price);

    let closeItem = menu.AddMenuItem('~r~Kapat');

    menu.MenuClose.on(() => {
      try {
        cam.destroy(true);
        mp.game.cam.renderScriptCams(false, true, 500, true, true);
        mp.events.callRemote('server:lsc:resetMod', vehNumber);
      } catch (e) {
        methods.debug('Exception: menuList.showLscVehicleColorMenu menu.MenuClose');
        methods.debug(e);
      }
    });

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex: number = null;

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;

      if (item == color1Item) mp.events.callRemote('server:lsc:showColor1', vehNumber, index);
      if (item == color2Item) mp.events.callRemote('server:lsc:showColor2', vehNumber, index);
    });
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      if (item == color1Item)
        mp.events.callRemote(
          'server:lsc:buyColor1',
          vehNumber,
          currentListChangeItemIndex,
          500 * price,
          shopId
        );
      else if (item == color2Item)
        mp.events.callRemote(
          'server:lsc:buyColor2',
          vehNumber,
          currentListChangeItemIndex,
          300 * price,
          shopId
        );
    });
  },

  showLscVehicleSTunningMenu: async function (shopId: number, idx: number, vehNumber: string, vehId: number, price = 1) {
    mp.game.ui.notifications.show('~b~Buton ~s~[ ~b~,~s~ ]~b~ Kamerayi dondurmek icin');
    mp.game.ui.notifications.show('~b~Buton ~s~+ ~b~,~s~ -~b~ Kameradan uzaklas');
    mp.game.ui.notifications.show('~b~Buton ~s~K ~b~ Tum kapilari acar ve kapatir');

    enums.lscCamRot = enums.lscCamRot - 0.2;
    let pos = new mp.Vector3(
      enums.lscCam.getRange * Math.sin(enums.lscCamRot) + enums.lscCam.getPointAtCoords.x,
      enums.lscCam.getRange * Math.cos(enums.lscCamRot) + enums.lscCam.getPointAtCoords.y,
      enums.lscCam.getPointAtCoords.z
    );
    enums.lscCam.setCoord(pos.x, pos.y, pos.z + 1.7);

    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    try {
      let veh = mp.vehicles.atRemoteId(vehId);
      /*for (let i = 0; i < enums.lscClassPrice.length; i++) {
              if (vehInfo.class_name == enums.lscClassPrice[i][0])
                  price = enums.lscClassPrice[i][1];
          }*/

      let car = await vehicles.getData(veh.getVariable('container'));
      let upgrade = null;
      if (car.has('upgrade')) upgrade = JSON.parse(car.get('upgrade'));

      if (veh.getVariable('price') >= 8000 && veh.getVariable('price') < 15000) price = 1.2;
      else if (veh.getVariable('price') >= 15000 && veh.getVariable('price') < 30000) price = 1.4;
      else if (veh.getVariable('price') >= 30000 && veh.getVariable('price') < 45000) price = 1.6;
      else if (veh.getVariable('price') >= 45000 && veh.getVariable('price') < 60000) price = 1.8;
      else if (veh.getVariable('price') >= 60000 && veh.getVariable('price') < 75000) price = 2;
      else if (veh.getVariable('price') >= 90000 && veh.getVariable('price') < 105000) price = 2.2;
      else if (veh.getVariable('price') >= 105000 && veh.getVariable('price') < 120000) price = 2.4;
      else if (veh.getVariable('price') >= 120000 && veh.getVariable('price') < 135000) price = 2.6;
      else if (veh.getVariable('price') >= 135000 && veh.getVariable('price') < 150000) price = 2.8;
      else if (veh.getVariable('price') >= 150000 && veh.getVariable('price') < 200000) price = 3;
      else if (veh.getVariable('price') >= 200000 && veh.getVariable('price') < 240000) price = 3.3;
      else if (veh.getVariable('price') >= 240000 && veh.getVariable('price') < 280000) price = 3.6;
      else if (veh.getVariable('price') >= 280000 && veh.getVariable('price') < 320000) price = 4;
      else if (veh.getVariable('price') >= 320000 && veh.getVariable('price') < 380000) price = 4.4;
      else if (veh.getVariable('price') >= 380000 && veh.getVariable('price') < 500000) price = 5;
      else if (veh.getVariable('price') >= 500000 && veh.getVariable('price') < 600000) price = 5.5;
      else if (veh.getVariable('price') >= 600000 && veh.getVariable('price') < 700000) price = 6;
      else if (veh.getVariable('price') >= 700000 && veh.getVariable('price') < 800000) price = 6.5;
      else if (veh.getVariable('price') >= 800000) price = 7;

      let camPos = new mp.Vector3(
        enums.lscCamPos[idx][0],
        enums.lscCamPos[idx][1],
        enums.lscCamPos[idx][2] + 0.7
      );
      let carPos = new mp.Vector3(enums.lscCarPos[idx][0], enums.lscCarPos[idx][1], veh.position.z);

      veh.freezePosition(true);

      enums.lscCam = mp.cameras.new(
        'lscTun',
        new mp.Vector3(
          3.4 * Math.sin(enums.lscCamRot) + carPos.x,
          3.4 * Math.cos(enums.lscCamRot) + carPos.y,
          carPos.z + 0.7
        ),
        new mp.Vector3(0, 0, 0),
        90
      );
      enums.lscCam.pointAtCoord(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.setActive(true);
      enums.lscCam.getPointAtCoords = new mp.Vector3(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.getRange = 3.4;
      enums.lscCam.vehId = vehId;
      veh.allDoorsOpen = true;
      for (let i = 0; i < 8; i++) veh.setDoorOpen(i, false, true);
      mp.game.cam.renderScriptCams(true, true, 500, false, false);

      let menu = UIMenu.Menu.Create(
        ' ',
        '~b~Standart ayarlar ucretsizdir',
        false,
        false,
        false,
        lscBanner1,
        lscBanner2
      );

      let globalList: string[][] = [];
      let modId = 0;
      let list2 = ['Standart', 'Arka taraf', 'Kapsamli', 'On taraf'];
      globalList.push(list2);
      let q = <number>enums.lscSNames[modId][1];
      let itemPrice = methods.parseInt(q * price);
      let listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          switch (upgrade[modId + 100].toString()) {
            case '0':
              listItem.Index = 3;
              break;
            case '0.5':
              listItem.Index = 2;
              break;
            case '1':
              listItem.Index = 1;
              break;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 1;
      list2 = ['Standart'];
      for (let i = 1; i <= 15; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      let qw = <number>enums.lscSNames[modId][1];
      itemPrice = methods.parseInt(qw * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            methods.debug(upgrade[modId + 100], list2[i], i);
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 2;
      list2 = ['Standart'];
      for (let i = 1; i <= 11; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      let qe = <number>enums.lscSNames[modId][1];
      itemPrice = methods.parseInt(qe * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            methods.debug(upgrade[modId + 100], list2[i], i);
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 3;
      list2 = ['Standart'];
      for (let i = 1; i <= 20; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      let qa = <number>enums.lscSNames[modId][1]
      itemPrice = methods.parseInt(qa * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 4;
      list2 = ['Standart'];
      for (let i = 1; i <= 10; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 5;
      list2 = ['Standart'];
      for (let i = 1; i <= 8; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 6;
      list2 = ['Standart'];
      for (let i = 5; i <= 16; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 7;
      list2 = ['Standart'];
      for (let i = 10; i <= 30; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 8;
      list2 = ['Standart'];
      for (let i = 14; i <= 30; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      let closeItem = menu.AddMenuItem('~r~Kapat');

      menu.MenuClose.on(() => {
        try {
          enums.lscCam.destroy(true);
          mp.game.cam.renderScriptCams(false, true, 500, true, true);
          enums.lscCam = null;
          mp.events.callRemote('server:lsc:resetMod', vehNumber);
          veh.freezePosition(false);

          veh.allDoorsOpen = false;
          for (let i = 0; i < 8; i++) veh.setDoorShut(i, true);
        } catch (e) {
          methods.debug('Exception: menuList.showLscVehicleTunningMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex: number = null;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;

        mp.game.ui.notifications.show('~b~Buton ~s~[ ~b~и~s~ ]~b~ Kamerayi dondurmek icin');
        mp.game.ui.notifications.show('~b~Buton ~s~+ ~b~и~s~ -~b~ Kameradan uzaklasmak icin');
        mp.game.ui.notifications.show('~b~Buton ~s~K ~b~ Tum kapilari acar ve kapatir');
      });
      menu.ItemSelect.on((item, index) => {
        if (item == closeItem) UIMenu.Menu.HideMenu();
        if (index == currentListChangeItemIndex) {
          if (currentListChangeItemIndex == 0) {
            mp.game.ui.notifications.show('~y~Islemleri onaylamak icin');
            mp.game.ui.notifications.show('~y~Tamir et');
            mp.events.callRemote('server:lsc:resetSTun', vehNumber, item.sType);
          } else {
            if (item.sType == 0)
              mp.events.callRemote(
                'server:lsc:buySTun',
                vehNumber,
                item.sType,
                currentListChangeItemIndex,
                item.price,
                shopId
              );
            else
              mp.events.callRemote(
                'server:lsc:buySTun',
                vehNumber,
                item.sType,
                globalList[item.sType][currentListChangeItemIndex],
                item.price,
                shopId
              );
          }
        }
      });
    } catch (e) {
      methods.debug(e);
    }
  },

  showLscVehicleTunningMenu: function (shopId: number, idx: number, vehNumber: string, vehId: number, price = 1) {
    mp.game.ui.notifications.show('~b~Buton ~s~[ ~b~и~s~ ]~b~ Kamerayi dondurmek icin');
    mp.game.ui.notifications.show('~b~Buton ~s~+ ~b~и~s~ -~b~ Kameradan uzaklasmak icin');
    mp.game.ui.notifications.show('~b~Buton ~s~K ~b~ Tum kapilari acar ve kapatir');

    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    try {
      let veh = mp.vehicles.atRemoteId(vehId);
      let vehInfo = methods.getVehicleInfo(veh.model);
      /*for (let i = 0; i < enums.lscClassPrice.length; i++) {
              if (vehInfo.class_name == enums.lscClassPrice[i][0])
                  price = enums.lscClassPrice[i][1];
          }*/

      if (veh.getVariable('price') >= 8000 && veh.getVariable('price') < 15000) price = 1.2;
      else if (veh.getVariable('price') >= 15000 && veh.getVariable('price') < 30000) price = 1.4;
      else if (veh.getVariable('price') >= 30000 && veh.getVariable('price') < 45000) price = 1.6;
      else if (veh.getVariable('price') >= 45000 && veh.getVariable('price') < 60000) price = 1.8;
      else if (veh.getVariable('price') >= 60000 && veh.getVariable('price') < 75000) price = 2;
      else if (veh.getVariable('price') >= 90000 && veh.getVariable('price') < 105000) price = 2.2;
      else if (veh.getVariable('price') >= 105000 && veh.getVariable('price') < 120000) price = 2.4;
      else if (veh.getVariable('price') >= 120000 && veh.getVariable('price') < 135000) price = 2.6;
      else if (veh.getVariable('price') >= 135000 && veh.getVariable('price') < 150000) price = 2.8;
      else if (veh.getVariable('price') >= 150000 && veh.getVariable('price') < 200000) price = 3;
      else if (veh.getVariable('price') >= 200000 && veh.getVariable('price') < 240000) price = 3.3;
      else if (veh.getVariable('price') >= 240000 && veh.getVariable('price') < 280000) price = 3.6;
      else if (veh.getVariable('price') >= 280000 && veh.getVariable('price') < 320000) price = 4;
      else if (veh.getVariable('price') >= 320000 && veh.getVariable('price') < 380000) price = 4.4;
      else if (veh.getVariable('price') >= 380000 && veh.getVariable('price') < 500000) price = 5;
      else if (veh.getVariable('price') >= 500000 && veh.getVariable('price') < 600000) price = 5.5;
      else if (veh.getVariable('price') >= 600000 && veh.getVariable('price') < 700000) price = 6;
      else if (veh.getVariable('price') >= 700000 && veh.getVariable('price') < 800000) price = 6.5;
      else if (veh.getVariable('price') >= 800000) price = 7;

      let camPos = new mp.Vector3(
        enums.lscCamPos[idx][0],
        enums.lscCamPos[idx][1],
        enums.lscCamPos[idx][2] + 0.7
      );
      let carPos = new mp.Vector3(enums.lscCarPos[idx][0], enums.lscCarPos[idx][1], veh.position.z);

      veh.freezePosition(true);

      enums.lscCam = mp.cameras.new(
        'lscTun',
        new mp.Vector3(
          3.4 * Math.sin(enums.lscCamRot) + carPos.x,
          3.4 * Math.cos(enums.lscCamRot) + carPos.y,
          carPos.z + 0.7
        ),
        new mp.Vector3(0, 0, 0),
        90
      );
      enums.lscCam.pointAtCoord(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.setActive(true);
      enums.lscCam.getPointAtCoords = new mp.Vector3(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.getRange = 3.4;
      enums.lscCam.vehId = vehId;
      mp.game.cam.renderScriptCams(true, true, 500, false, false);

      let menu = UIMenu.Menu.Create(' ', '~b~Ayar', false, false, false, lscBanner1, lscBanner2);

      let itemPrice: number;
      let listItem: MenuItemClient;
      let list2: string[] = [];

      let modId = 11;
      if (veh.getNumMods(modId)) {
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('Level ' + i);
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `1 Seviye fiyati: ~g~$${methods.numberFormat(itemPrice)}\n~s~Sirayla yapmaniza gerek yok`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      modId = 12;
      if (veh.getNumMods(modId)) {
        list2 = [];
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('Level ' + i);
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `1 Seviye fiyati: ~g~$${methods.numberFormat(itemPrice)}\n~s~Sirayla yapmaniza gerek yok`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }
      modId = 13;
      if (veh.getNumMods(modId)) {
        list2 = [];
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('Level ' + i);
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `1 Seviye fiyati: ~g~$${methods.numberFormat(
            itemPrice
          )}\n~s~Sirayla yapmaniza gerek yok`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      modId = 14;
      if (veh.getNumMods(modId)) {
        list2 = [];
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('' + i);
        itemPrice = methods.parseInt(enums.lscNames[modId][1]);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      list2 = [
        'Spor Arac',
        'Eski Arac',
        'Lowrider Arac',
        'Caprazlama?',
        'Suv Araclar',
        'Ozel ürünler',
        'Motor',
        'Essiz',
      ];
      listItem = menu.AddMenuItemList(
        `Tekerlek tipi`,
        list2,
        `Fiyat: ~g~Ucretsiz\n~s~Tıkla ~g~Enter~s~ Uygulamak icin`
      );
      listItem.Index = veh.getWheelType();
      listItem.modType = 78;
      listItem.price = 0;

      for (let i = 0; i < 100; i++) {
        try {
          if (i == 11) continue;
          if (i == 12) continue;
          if (i == 13) continue;
          if (i == 14) continue;
          if (i == 46) continue;
          if (veh.getNumMods(i) == 0) continue;

          if (i == 1 || i == 10) {
            if (
              vehInfo.display_name == 'Havok' ||
              vehInfo.display_name == 'Microlight' ||
              vehInfo.display_name == 'Seasparrow' ||
              vehInfo.display_name == 'Revolter' ||
              vehInfo.display_name == 'Viseris' ||
              vehInfo.display_name == 'Savestra' ||
              vehInfo.display_name == 'Deluxo' ||
              vehInfo.display_name == 'Comet4'
            )
              continue;
          }

          if (veh.getNumMods(i) > 0 && enums.lscNames[i][1] > 0) {
            let list = [];
            for (let j = 0; j <= veh.getNumMods(i); j++) list.push(j + '');

            let itemPrice = methods.parseInt((<number>enums.lscNames[i][1]) * price);
            let listItem = menu.AddMenuItemList(
              `${enums.lscNames[i][0]}`,
              list,
              `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
            );
            listItem.Index = veh.getMod(i);
            listItem.modType = i;
            listItem.price = itemPrice;
          }
        } catch (e) {
          methods.debug(e);
        }
      }

      list2 = ['~b~Ayarla', '~r~Cikis'];
      modId = 22;
      itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.Index = veh.getMod(modId);
      listItem.modType = modId;
      listItem.price = itemPrice;

      modId = 18;
      list2 = ['~b~Ayarla', '~r~Cikis'];
      itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.Index = veh.getMod(modId);
      listItem.modType = modId;
      listItem.price = itemPrice;

      modId = 69;
      list2 = [];
      for (let i = 0; i < 6; i++) list2.push(i + '');
      itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscNames[modId][0]}`,
        list2,
        `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.Index = veh.getWindowTint();
      listItem.modType = modId;
      listItem.price = itemPrice;

      if (veh.getLiveryCount() > 0) {
        modId = 77;
        list2 = [];
        for (let i = 0; i <= veh.getLiveryCount(); i++) list2.push(i + '');
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `Fiyat: ~g~$${methods.numberFormat(itemPrice)}`
        );
        listItem.Index = veh.getLivery();
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      let closeItem = menu.AddMenuItem('~r~Kapat');

      menu.MenuClose.on(() => {
        try {
          enums.lscCam.destroy(true);
          mp.game.cam.renderScriptCams(false, true, 500, true, true);
          enums.lscCam = null;
          mp.events.callRemote('server:lsc:resetMod', vehNumber);
          veh.freezePosition(false);

          veh.allDoorsOpen = false;
          for (let i = 0; i < 8; i++) veh.setDoorShut(i, true);
        } catch (e) {
          methods.debug('Exception: menuList.showLscVehicleTunningMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex: number = null;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;
        mp.game.ui.notifications.show('~b~Buton ~s~[ ~b~и~s~ ]~b~ Kamerayi dondurmak icin');
        mp.game.ui.notifications.show('~b~Buton ~s~+ ~b~и~s~ -~b~ Kameradan uzaklasmak icin');
        mp.game.ui.notifications.show('~b~Buton ~s~K ~b~ Tum kapilari acar ve kapatir');

        if (item.modType == 22) currentListChangeItemIndex = currentListChangeItemIndex - 1;

        mp.events.callRemote(
          'server:lsc:checkTun',
          vehNumber,
          item.modType,
          currentListChangeItemIndex
        );
      });
      menu.ItemSelect.on((item, index) => {
        if (item == closeItem) UIMenu.Menu.HideMenu();
        if (item == currentListChangeItem) {
          if (item.modType == 22) currentListChangeItemIndex = currentListChangeItemIndex - 1;

          if (item.modType == 11 || item.modType == 12 || item.modType == 13)
            mp.events.callRemote(
              'server:lsc:buyTun',
              vehNumber,
              item.modType,
              currentListChangeItemIndex,
              item.price * currentListChangeItemIndex,
              shopId
            );
          else
            mp.events.callRemote(
              'server:lsc:buyTun',
              vehNumber,
              item.modType,
              currentListChangeItemIndex,
              item.price,
              shopId
            );

          if (item.modType == 78) {
            UIMenu.Menu.HideMenu();
            veh.setWheelType(currentListChangeItemIndex);
            mp.game.ui.notifications.show('~b~Tekerlek tipi guncellendi');
            setTimeout(function () {
              menuList.showLscVehicleTunningMenu(shopId, idx, vehNumber, vehId, price);
            }, 500);
          }
        }
      });
    } catch (e) {
      methods.debug(e);
    }
  },

  currentMenu: function () {
    return UIMenu.Menu.GetCurrentMenu();
  }

};

export { menuList };


setInterval(() => {
  if (!user.get('walkietalkie_num')) return;
  if (user.isGos()) return;
  if (user.get('walkietalkie_num').indexOf('.') == -1) return;
  const freq = methods.parseInt(user.get('walkietalkie_num').split('.')[0]);
  if (!isNaN(freq) && freq > 2000 && freq < 3000) {
    mp.game.ui.notifications.show('~r~Belirtilen telsiz frekansini kullanamazsiniz');
    user.set('walkietalkie_num', "0.0");
    user.setData('walkietalkie_num', "0.0");
    mp.events.callRemote('voice.server.changeRadioFrequency', "0.0");
    return;
  }
}, 10000)