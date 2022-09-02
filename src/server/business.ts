/// <reference path="../declaration/server.ts" />

import { methods } from './modules/methods';
import { user } from './user';
import { coffer } from './coffer';
import { businessEntity } from './modules/entity/business';
import { levelAccess } from '../util/level';
import { menu } from './modules/menu';
import { autosalonPercentEntity } from './modules/entity/autosalonPercent';
import { businessNalog } from '../util/sharedData';
import { autosalon } from './business/autosalon';

let businessData = new Map<number, businessEntity>();

let businessLimit = new Map<number, number>()
const BUSINESS_LIMIT_SUM = 500000;

setTimeout(() => {
  mp.events.register('get:business:data', (player: PlayerMp, id: number) => {
    let data = businessData.get(id);
    let { name, name2, price, money_tax, score_tax, user_name, user_id, bank, type, price_product, price_card1, price_card2, tarif} = data
    return { name: name.replace(/\//gi, '').replace(/\\/gi, ''), name2, price, money_tax, score_tax, user_name, user_id, bank, type, price_product, price_card1, price_card2, tarif };
  });
  methods.createDynamicCheckpoint(business.BusinessMenuPos, "Isletme menusunu acmak icin  ~g~Е~s~ tusuna basın", player => {
    if(player.dimension == 0) return player.notify('~r~Bir hata olustu');
    business.openMenu(player);
  }, 1, -1, [60,255,60,120])
  methods.createDynamicCheckpoint(business.BusinessStreetPos, "Aile menusunu acmak icin ~g~Е~s~ tusuna basın", player => {
    if(player.dimension != 0) return player.notify('~r~Bir hata olustu');
    business.tpMenu(player);
  }, 1, 0, [60,255,60,120])
  methods.createDynamicCheckpoint(business.BusinessGaragePos, "Aile menusunu acmak icin ~g~Е~s~ tusuna basın", player => {
    if(player.dimension != 0) return player.notify('~r~Bir hata olustu');
    business.tpMenu(player);
  }, 1, 0, [60,255,60,120])
  methods.createDynamicCheckpoint(business.BusinessRoofPos, "Aile menusunu acmak icin ~g~Е~s~ tusuna basın", player => {
    if(player.dimension != 0) return player.notify('~r~Bir hata olustu');
    business.tpMenu(player);
  }, 1, 0, [60,255,60,120])
  methods.createDynamicCheckpoint(business.BusinessMotorPos, "Aile menusunu acmak icin ~g~Е~s~ tusuna basın", player => {
    if(player.dimension != 0) return player.notify('~r~Bir hata olustu');
    business.tpMenu(player);
  }, 1, 0, [60,255,60,120])
  methods.createDynamicCheckpoint(business.BusinessOfficePos, "Aile menusunu acmak icin ~g~Е~s~ tusuna basın", player => {
    if(player.dimension == 0) return player.notify('~r~Bir hata olustu');
    business.tpMenu(player);
  }, 1, -1, [60,255,60,120])
}, 1000)




export let business = {
  typeList: [
    'Bankalar',
    'Market 7/24',
    'Giyim Mağazaları',
    'Araç Bayisi',
    'Kiralık Ürünler',
    'Benzin İstasyonu',
    'Kuaförler',
    'Eğlence',
    'Hizmetler',
    'Hukuk Büroları',
    'Ofisler',
    'Silahçı',
    'Dövmeci',
    'Çeşitli',
    ' Lüks Araç bayisi',
  ],
  types: {
    /** Тату салоны */
    Tattoo: 12,
    /** PDM, DownTown CAB, Post OP, GoPostal, Casino */
    Other: 13,
    /** Live Invader офис */
    LifeInvader: 8,
    /** Автосалон */
    Autosalon: 14,
    /** Оружейный магазин */
    GunShop: 11,
    /** Магазин 24/7 */
    Shop24: 1,
    /** Магазин одежды */
    ClothShop: 2,
    /** Аренда байков */
    BikeRent: 4,
    /** Заправки */
    Fuel: 5,
    /** Клуб */
    Club: 7,
    /** Кастомс */
    Tuning: 7,
    /** Офис */
    Office: 10,
    /** Юридическая фирма */
    LawFirm: 9,
    /** Банк */
    Bank: 0,
    /** Барбершоп */
    Hairdresser: 6,
  },
  tpMenu: (player:PlayerMp) => {
    let m = menu.new(player, "", "İş merkezi")
    m.sprite = "arcadius"
    business.typeList.map(function (item, i) {
      let items: businessEntity[] = []
      businessData.forEach(itm => {
        if(itm.type === i) items.push(itm)
      })
      m.newItem({
        name: item,
        more: `Miktar: ${items.length}`,
        onpress: () => {
          let submenu = menu.new(player, "", item)
          submenu.sprite = "arcadius"
          submenu.onclose = () => {business.tpMenu(player);};
          items.map(item => {
            submenu.newItem({
              name: item.name.replace(/\//gi, '').replace(/\\/gi, ''),
              more: `${user.isAdminNow(player, 6) ? `~r~ID: ${item.id}` : ``}`,
              desc: `~b~Sahibi: ~s~${item.user_id == 0 ? 'Devlet' : item.user_name}`,
              onpress: () => {
                user.teleport(player, business.BusinessOfficePos.x, business.BusinessOfficePos.y, business.BusinessOfficePos.z, 183, item.id);
              }
            })
          })
          submenu.open()

        }
      })
    });

    m.newItem({
      name: '~b~Arcadius Motors',
      onpress: () => {
        user.teleport(player, business.BusinessMotorPos.x, business.BusinessMotorPos.y, business.BusinessMotorPos.z, 73, 0);
      }
    })
    m.newItem({
      name: '~g~Sokak',
      onpress: () => {
        user.teleport(player, business.BusinessStreetPos.x, business.BusinessStreetPos.y, business.BusinessStreetPos.z, 250, 0);
      }
    })
    m.newItem({
      name: '~g~Çatı',
      onpress: () => {
        user.teleport(player, business.BusinessRoofPos.x, business.BusinessRoofPos.y, business.BusinessRoofPos.z, 250, 0);
      }
    })
    m.newItem({
      name: '~g~Garaj',
      onpress: () => {
        user.teleport(player, business.BusinessGaragePos.x, business.BusinessGaragePos.y, business.BusinessGaragePos.z, 164, 0);
      }
    })

    m.open();
  },
  openMenu: async (player: PlayerMp) => {
    let id = player.dimension;
    if (!business.exist(id)) return;
    let data = business.getData(id)
    let owner = business.getOwnerInfo(id);

    let priceList = ['Çok düşük', 'Düşük', 'Normal', 'Yüksek', 'Çok yüksek'];
    let bankList = ['Maze Bank (3%)', 'Fleeca Bank (1%)', 'Blaine Bank (1%)', 'Pacific Bank (1%)'];

    let m = menu.new(player, ``, `~b~Sahibi: ~s~${!owner.id ? 'Devlet' : owner.name}`);
    m.sprite = "arcadius"
    
    let type = business.getType(id);
    let tarif = business.getTarif(id);
    let nalog: number;
    if (type == 14) {
      let item = await autosalonPercentEntity.findOne({
        where: {
          business_id: id
        }
      })
      if (!item) return;
      nalog = item.percent;
    } else {
      nalog = coffer.getNalogBizz();
    }




    let nalogOffset = 0;
    if (data.type == 3) nalogOffset += 10;
    // Gunshop
    if (data.type == 11) nalogOffset += businessNalog.GunShop;

    if (data.price_card2 == 3) nalogOffset += 10;
    if (data.price_card2 == 4) nalogOffset += 15;

    if (data.type != 14) {
      nalog = nalog + nalogOffset;
    }


    m.newItem({
      name: "Başlık",
      more: business.getName(id)
    })
    m.newItem({
      name: "~r~Gelir vergisi",
      more: `${nalog}%`
    })


    if(user.isAdminNow(player, 4)){
      m.newItem({
        name: "~b~ID İş Dünyası",
        more: `${id}`
      })
      if (data.user_id != user.getId(player)){
        m.newItem({
          name: "~g~Denge",
          more: `$${methods.numberFormat(methods.parseInt(data.bank))}`
        })
      }
      if(user.isAdminNow(player, 6)){
        m.newItem({
          name: "~y~Bir işletmeyi silme",
          onpress: async () => {
            let status = await user.accept(player, "Emin misin?");
            if(!status) return business.openMenu(player);
            status = await user.accept(player, "Emin misin? x2");
            if (!status) return business.openMenu(player);
            status = await user.accept(player, "Emin misin? x3");
            if (!status) return business.openMenu(player);
            status = await user.accept(player, "Emin misin? x4");
            if (!status) return business.openMenu(player);
            status = await user.accept(player, "Sergei, emin misin?????");
            if (!status) return business.openMenu(player);
            status = await user.accept(player, "Sergei, bu doğru.?????");
            if (!status) return business.openMenu(player);
            status = await user.accept(player, "Sergei, bu doğru.?????");
            if (!status) return business.openMenu(player);
            business.delete(id, player)
          }
        })
      }
    }
    if (data.user_id == user.getId(player)){
      m.newItem({
        name: "~g~Denge",
        more: `$${methods.numberFormat(methods.parseInt(data.bank))}`
      })
      m.newItem({
        name: "~y~Hizmet veren banka",
        type: "list",
        list: bankList,
        listSelected: data.tarif,
        onpress: (itm) => {
          data.tarif = itm.listSelected;
          player.notify('~g~Yeni bir banka ile hizmet sözleşmesi imzaladınız: ~y~' + bankList[data.tarif])
          business.save(data.id);
        }
      })
      m.newItem({
        name: "Parayı yatırın",
        onpress: () => {
          menu.input(player, "Ücretlendirme tutarını girin", "", 8, "int").then(sum => {
            if(sum === null) return;
            if(isNaN(sum) || sum <= 0) return player.notify('~r~Yükleme miktarı doğru değil');
            if(sum > user.getBankMoney(player)) return player.notify('~r~Banka hesabınızda bu işlemi gerçekleştirmek için yeterli para yok')
            user.removeBankMoney(player, sum)
            business.addMoney(id, sum, true);
            business.openMenu(player);
            user.log(player, "BusinessAddMoney", "İşletme hesabını yeniden doldurdu @business"+id+" на сумму "+sum);
          })
        }
      })
      m.newItem({
        name: "Para Çekme",
        onpress: () => {
          menu.input(player, "Para çekme tutarını girin", "", 8, "int").then(money => {
            if (money === null) return;
            if (isNaN(money) || money <= 0) return player.notify('~r~Para çekme tutarı doğru değil');
            if (money > data.bank) return player.notify('~r~İşletme hesabında işlemi gerçekleştirmek için yeterli para bulunmamaktadır')




            if (data.get('type') == 10) {
              business.removeMoney(data.get('id'), money);
              user.addCashMoney(player, money);
              player.notify(`~b~Geri çektiniz  ~s~$${methods.numberFormat(money)} ~b~hesaptan`);
            } else if (data.get('type') == 14) { //? Автосалоны
              let bankTarif = 3;
              if (data.get('tarif') != 0) bankTarif = 1;
              let tocoffer = money * (bankTarif / 100);
              switch (data.get('tarif')) {
                case 0:
                  coffer.addMoney(tocoffer);
                  break;
                case 1:
                  business.addMoney(1, tocoffer);
                  break;
                case 2:
                  business.addMoney(2, tocoffer);
                  break;
                case 3:
                  business.addMoney(108, tocoffer);
                  break;
              }

              business.removeMoney(data.get('id'), money);
              user.addCashMoney(player, methods.parseInt(money - tocoffer));
              player.notify(
                `~b~Geri çekildiniz: ~s~$${methods.numberFormat(
                  money
                )}\n~b~Banka bakiyesi: ~s~$${methods.numberFormat(
                  tocoffer
                )} ~o~${bankTarif}%`
              );
            } else {
              let bankTarif = 3;
              if (data.get('tarif') != 0) bankTarif = 1;

              switch (data.get('tarif')) {
                case 0:
                  coffer.addMoney(money * (bankTarif / 100));
                  break;
                case 1:
                  business.addMoney(1, money * (bankTarif / 100));
                  break;
                case 2:
                  business.addMoney(2, money * (bankTarif / 100));
                  break;
                case 3:
                  business.addMoney(108, money * (bankTarif / 100));
                  break;
              }

              business.removeMoney(data.get('id'), money);
              user.addCashMoney(player, (money * (100 - nalog - bankTarif)) / 100);
              coffer.addMoney((money * nalog) / 100);
              player.notify(
                `~b~Вы сняли ~s~$${methods.numberFormat(
                  (money * (100 - nalog + bankTarif)) / 100
                )} ~b~vergi dahil hesaptan`
              );
              player.notify(
                `~b~${bankTarif}% size hizmet veren bankaya gönderilen tutarın`
              );
            }


            user.log(player, "BusinessRemoveMoney", "İşletme hesabından çekilen @business"+id+" сумму "+money);
          })
        }
      })


      let nameSetProductMenu = '';
      switch (data.type) {
        case 0: {
          m.newItem({
            name: 'Kart satın alma fiyatı',
            onpress: (itm) => {
              menu.input(player, "Yeni fiyatı girin", `${data.price_card1}`, 8, "int").then(cardPrice => {
                if (cardPrice === null) return;
                if (isNaN(cardPrice) || cardPrice <= 0) return player.notify('~r~Fiyat doğru değil');
                if (cardPrice < 1 || cardPrice > 500) {
                  player.notify(`~r~Fiyat 500 $'ın altında veya daha fazla olmalıdır 1$`);
                  return;
                }
                data.price_card1 = cardPrice;
                data.save();
                business.openMenu(player);
                player.notify(`~b~Kart için satın alma fiyatı:~s~ $${cardPrice}`);
              })
            }
          })
          break;
        }
        case 1:
        case 5:
        case 7:
        case 11: {
          if (data.id != 120 && data.id != 124) {
            nameSetProductMenu = 'Tüm ürünler için fiyatlar';
          }
          break;
        }
        case 4: {
          nameSetProductMenu = 'Kira bedeli';     
          break;
        }
        case 9: {
          nameSetProductMenu = 'Gelir üzerinden faiz';
          break;
        }
        case 10: {
          m.newItem({
            name: "İsmi değiştirin",
            onpress: () => {
              menu.input(player, "Bir ad girin", data.name, 15).then(name => {
                if (!name) return;
                data.name = name;
                data.save();
                player.notify('~g~Tutulan unvan');
                business.openMenu(player);
              })
            }
          })
          if (user.getId(player) == data.user_id)
            m.newItem({
              name: "~y~Organizasyon türü",
              onpress: () => {
                let submenu = menu.new(player, "Organizasyon türü")
                submenu.onclose = () => {business.openMenu(player)}
                submenu.newItem({
                  name: "~g~Standart",
                  more: "Цена: ~g~Ücretsiz",
                  onpress: () => {
                    user.accept(player, "Emin misin?").then(status => {
                      if(!status) return business.openMenu(player);
                      business.upgradeType(player, 0, id);
                    })
                  }
                })
                submenu.newItem({
                  name: "~y~OCG",
                  more: "Fiyat: ~g~$1,000,000",
                  onpress: () => {
                    user.accept(player, "Emin misin?").then(status => {
                      if (!status) return business.openMenu(player);
                      business.upgradeType(player, 3, id);
                    })
                  }
                })
                submenu.open();
              }
            })
          break;
        }
        case 14: {
          if (data.id != 179) {
            m.newItem({
              name: "Kiralama fiyatını değiştirin",
              onpress: () => {
                autosalon.changeRentPriceMenu(player, id);
              }
            })
            
          }
          break;
        }
      }

      if (nameSetProductMenu){
        m.newItem({
          name: nameSetProductMenu,
          type: "list",
          list: priceList,
          listSelected: data.price_product - 1,
          onpress: (itm) => {
            data.price_product = itm.listSelected + 1;
            player.notify(`~b~Tüm malların fiyatı aşağıdakilere eşittir: ~s~${data.price_product * 100}%`)
            data.save();
          }
        })
      }


    } else if(data.user_id == 0){
      if (data.price < 999999999){
        m.newItem({
          name: "~g~Satın alma",
          more: `Maliyet: ~g~$${data.price}`,
          onpress: () => {
            if (data.user_id == 0) business.buy(player, id);
            business.openMenu(player);
          }
        })
      }
    }

    if (data.price_card2 == 3 || data.price_card2 == 4) {
      m.newItem({
        name: "~y~Araçların yıkanması",
        onpress: () => {
          if (user.isGosPD(player)) return player.notify(`~r~Kamu çalışanları yakın mercek altında`);
          if (!player.bankgrabmoney) {
            player.bankgrabmoney = 0;
            return player.notify(`~r~У bir çanta dolusu paran yok`);
          }
          const sum = player.bankgrabmoney;
          user.addCashMoney(player, sum / 2);
          player.bankgrabmoney = 0;
          player.notify('~g~Sen akladın: ~s~$' + methods.numberFormat(sum));
          player.notify('~g~Sizin payınız: ~s~$' + methods.numberFormat(sum / 2));
          player.notify('~g~İşletme sahibinin payı: ~s~$' + methods.numberFormat(sum / 2));
          business.addMoney(id, sum / 2, true);
          business.openMenu(player);
          user.log(player, "ClearMoney", "Temizlendi $" + sum + " üzerinden @business" + id)
        }
      })
    }
    m.newItem({
      name: "~r~Kapat",
      onpress: () => {
        menu.close(player);
      }
    })
    m.open();
  },
  BusinessOfficePos: new mp.Vector3(-140.7121, -617.3683, 167.8204),
  BusinessMotorPos: new mp.Vector3(-138.6593, -592.6267, 166.0002),
  BusinessStreetPos: new mp.Vector3(-116.8427, -604.7336, 35.28074),
  BusinessGaragePos: new mp.Vector3(-155.6696, -577.3766, 31.42448),
  BusinessRoofPos: new mp.Vector3(-136.6686, -596.3055, 205.9157),
  BusinessMenuPos: new mp.Vector3(-139.2922, -631.5964, 167.8204),
  delete: (id: number, player?: PlayerMp) => {
    businessData.delete(id)
    businessEntity.destroy({ where: { id } })
    if (player) user.log(player, "AdminJob", "bir işletmeyi sildim " + id)
  },
  load: (item: businessEntity) => {
    if (item.price_card2 == 4) {
      item.price_card2 = 3;
      item.bank += 2500000;
    }
    if (item.type != 10 && item.price_card2 == 3) {
      item.price_card2 = 0;
      item.bank += 500000;
    }

    businessData.set(item.id, item);

  },
  loadAll: function () {
    methods.debug('business.loadAll');
    businessEntity.findAll().then(rows => {
      rows.forEach(function (item) {
        business.load(item)
      });
      methods.debug('All Business Loaded: ' + rows.length);
    })
  },

  exist: (id: number) => {
    return businessData.has(id)
  },

  save: (id: number) => {
    methods.debug('business.save', id);
    let data = business.getData(id)
    if (!data) return;

    if (data.bank < 0) {
      methods.saveLog('businessBugUse', `${data.bank} | ${id}`);
      data.bank = 0;
    }
    
    let priceCard2 = data.price_card2;
    if (priceCard2 >= 10) data.price_card2 = 0;
    const { name, name2, price, money_tax, score_tax, user_name, user_id, bank, type, price_product, price_card1, price_card2, tarif, interior, rp_logo, rp_main_img, rp_color} = data;
    businessEntity.update({ name, name2, price, money_tax, score_tax, user_name, user_id, bank, type, price_product, price_card1, price_card2, tarif, interior, rp_logo, rp_main_img, rp_color }, {where: { id }, limit: 1})
  },


  get: function (id: number, key: string):string|number {
    let data = business.getData(id);
    if (!data) return;
    // @ts-ignore
    return data[key]
  },

  /** Стоимость продукции */
  getPrice: function (id: number) {
    let data = business.getData(id);
    if(!data) return 0;
    return data.price_product;
  },
  /** Стоимость продукции */
  setPrice: function (id: number, value: number) {
    if (typeof value != "number") return;
    let data = business.getData(id);
    if (!data) return;
    data.price_product = value;
    data.save();
  },
  /** Стоимость продукции */
  getPriceCard: function (id: number) {
    let data = business.getData(id);
    if(!data) return 0;
    return data.price_card1;
  },

/** Установить Стоимость карты */
setPriceCard: function (id: number, value: number) {
  if (typeof value != "number") return;
  let data = business.getData(id);
  if (!data) return;
  data.price_card1 = value;
  data.save();
},

  getName: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.name.replace(/\//gi, '').replace(/\\/gi, '');
  },

  getName2: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.name2;
  },

  getFractionType: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.price_card2;
  },

  isGang: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.price_card2 === 3;
  },

  isOpg: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.price_card2 === 4;
  },

  isChvk: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.price_card2 === 5;
  },

  getData: function (id: number) {
    return businessData.get(id);
  },

  getTarif: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.tarif;
  },
  getType: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.type;
  },
  isOffice: function (id: number) {
    let data = business.getData(id);
    if (!data) return null;
    return data.type == 10;
  },

  addMoney: function (id: number, money: number, ignoreLimit = false) {
    if(!ignoreLimit){
      if (!businessLimit.has(id)){
        businessLimit.set(id, 0);
      }
      businessLimit.set(id, businessLimit.get(id)+money);
      if (businessLimit.get(id) + money > BUSINESS_LIMIT_SUM) return;
    }

    business.setMoney(id, business.getMoney(id) + methods.parseInt(money));
  },

  removeMoney: function (id: number, money: number) {
    business.setMoney(id, business.getMoney(id) - methods.parseInt(money));
  },

  setMoney: (id: number, money: number):void => {
    id = methods.parseInt(id);
    let data = business.getData(id);
    if (!data) return null;
    data.bank = money;
    business.save(id);
  },

  getMoney: function (id: number) {
    id = methods.parseInt(id);

    let data = business.getData(id);
    if (!data) return null;
    return data.bank;


  },

  updateOwnerInfo: function (bId: number, userId: number, userName: string):void {
    let data = business.getData(bId);
    if (!data) return null;
    data.user_id = userId;
    data.user_name = userName;
    if (!userId) data.money_tax = 0;
    business.save(bId);
  },

  getOwnerInfo: (bId: number) => {
    let data = business.getData(bId);
    if (!data) return null;
    return {
      id: data.user_id,
      name: data.user_name,
    }
  },

  upgradeType: function (player: PlayerMp, type: number, bId: number) {
    methods.debug('business.upgradeType');
    let biztype = business.getType(bId);
    let data = business.getData(bId)
    if (biztype != 10) return player.notify("~r~İş durumu yalnızca ofiste değiştirilebilir")
    if (type == 0) {
      data.price_card2 = type

      business.save(bId)
      player.notify('~b~İşletmenin durumunu değiştirdiniz');
      business.openMenu(player)
      return;
    } else if (type == 3) {
      if (business.getMoney(bId) < 1000000) {
        player.notify('~r~İş bankasında, aşağıdakilere sahip olmak gerekir $1.000.0000');
        return;
      }
      let fractionId = user.get(player, 'fraction_id2');
      methods.getCountFraction2Users(fractionId, function (count) {
        if (count < 20) {
          player.notify('~r~Organizasyonda 20 veya daha fazla katılımcı olması gereklidir');
          return;
        }

        business.removeMoney(bId, 1000000);
        coffer.addMoney(1000000);
        methods.updatePlayersFractionType(fractionId, type);
        data.price_card2 = type
        player.notify('~b~İşletmenin durumunu değiştirdiniz');
        business.save(bId);
        business.openMenu(player)
      });
    } else if (type == 4) {
      if (business.getMoney(bId) < 5000000) {
        player.notify('~r~İş bankasında, aşağıdakilere sahip olmak gerekir $5.000.000');
        return;
      }
      let fractionId = user.get(player, 'fraction_id2');
      methods.getCountFraction2Users(fractionId, function (count) {
        if (count < 20) {
          player.notify('~r~Organizasyonda 20 veya daha fazla katılımcı olması gereklidir');
          return;
        }
        business.removeMoney(bId, 5000000);
        coffer.addMoney(5000000);
        methods.updatePlayersFractionType(fractionId, type);
        data.price_card2 = type
        player.notify('~b~İşletmenin durumunu değiştirdiniz');
        business.save(bId);
        business.openMenu(player)
      });
    } else if (type == 5) {
      player.notify('~b~Çok yakında ;)');
      return;
    }
  },

  sell: function (player: PlayerMp) {
    methods.debug('business.sell');
    if (!user.isLogin(player)) return;

    if (user.get(player, 'business_id') == 0) {
      player.notify('~r~У İşiniz bitti');
      return;
    }

    let hInfo = business.getData(user.get(player, 'business_id'));
    let nalog = methods.parseInt((hInfo.get('price') * (100 - coffer.get('cofferNalog'))) / 100);

    user.set(player, 'business_id', 0);
    user.set(player, 'fraction_id2', 0);
    user.set(player, 'rank2', 0);

    hInfo.user_id  = 0;
    hInfo.user_name  = '';

    coffer.removeMoney(nalog);
    business.save(hInfo.get('id'));
    user.addMoney(player, nalog);
    user.log(player, "PlayerBuy", `İşletmeyi sattı @business${hInfo.get('id')} за $${nalog}`)
    setTimeout(function () {
      if (!user.isLogin(player)) return;

      user.addHistory(
        player,
        3,
        'İşletmeyi sattı ' +
        hInfo.get('name') +
        ' №' +
        hInfo.get('id') +
        '. Цена: $' +
        methods.numberFormat(nalog)
      );
      player.notify('~g~İşi sattınız');
      player.notify(
        `~g~Vergi:~s~ ${coffer.get('cofferNalog')}%\n~g~Erişim adresi:~s~ $${methods.numberFormat(
          nalog
        )}`
      );
      user.saveAccount(player);
      user.updateClientCache(player);
      business.save(hInfo.get('id'));
    }, 1000);
  },

  buy: function (player: PlayerMp, id: number) {
    methods.debug('business.buy');

    if (!user.isLogin(player)) return;

    if (user.get(player, 'is_gos_blacklist')) {
      player.notify('~r~Kara listedesiniz');
      return;
    }

    let hInfo = business.getData(id);
    if (user.get(player, 'business_id') > 0) {
      player.notify('~r~У Bir mülkünüz var');
      return false;
    }
    if (hInfo.get('price') > user.getBankMoney(player)) {
     player.notify('~r~Paranız yeterli değil.');
      return false;
    }
    if (hInfo.get('user_id') > 0) {
      player.notify('~r~Mülk zaten satın alınmış.');
      return false;
    }

    if (user.getLevel(player) < levelAccess.buyBusiness) {
      player.notify('~r~Satın almak için şunlara sahip olmanız gerekir ' + levelAccess.buyBusiness + " ур.");
      return false;
    }

    if (user.get(player, 'biz_lic') === false) {
      player.notify('~r~У İşletme ruhsatınız yok');
      player.notify('~r~Devlet personelinden satın alabilirsiniz');
      return false;
    }

    if (
      user.get(player, 'fraction_id') == 1 &&
      user.get(player, 'rank') > 7 &&
      hInfo.get('type') != 10
    ) {
      player.notify('~r~Kademe 7 nin üzerindeki kamu çalışanlarının iş satın almasına izin verilmez');
      player.notify('~r~Sadece ofis satın alabilir');
      return false;
    }

    if (
      user.isMafia(player) &&
      hInfo.get('type') == 10
    ) {
      player.notify('~r~Mafyadayken bir ofis satın almak yasaktır');
      return false;
    }

    coffer.addMoney(business.getMoney(hInfo.get('id')));
    business.setMoney(hInfo.get('id'), 0);

    user.set(player, 'business_id', hInfo.get('id'));
    user.set(player, 'fraction_id2', hInfo.get('id'));
    user.set(player, 'rank2', 11);

    hInfo.user_id = user.getId(player);
    hInfo.user_name = user.getRpName(player);
    hInfo.money_tax = 0;
    business.save(hInfo.get('id'));


    business.save(hInfo.get('id'));
    coffer.addMoney(hInfo.get('price'));
    user.removeBankMoney(player, hInfo.get('price'));
    user.log(player, "PlayerBuy", `Satın alındı бизнес @business${hInfo.get('id')} за $${hInfo.get('price')}`)
    setTimeout(function () {
      if (!user.isLogin(player)) return;
      user.addHistory(
        player,
        3,
        'Bir işletme satın aldı ' +
        hInfo.get('name') +
        ' №' +
        hInfo.get('id') +
        '. Fiyat: $' +
        methods.numberFormat(hInfo.get('price'))
      );
      user.saveAccount(player);
      player.notify('~g~Bir işletme satın aldığınız için tebrikler!');
      user.updateClientCache(player);
      business.save(id);
    }, 1000);
    return true;
  },
};
