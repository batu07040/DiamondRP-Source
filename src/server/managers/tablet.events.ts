import { user } from "../user"
import { dispatcher } from "./dispatcher";
import { methods } from "../modules/methods";
import { chat } from "../modules/chat";
import { userEntity } from "../modules/entity/user";
import { inventory } from "../inventory";
import { recLists, fractionUtil } from "../../util/fractions";
import { coffer } from "../coffer";
import { cofferDonateEntity } from "../modules/entity/coffer";
import { rpNewsEntity } from "../modules/entity/rpNews";
import { vehicles } from "../vehicles";
import { stock } from "../stock";
import { houses } from "../houses";
import { menu } from "../modules/menu";
import { apartments } from "../apartments";
import { condo } from "../condo";
import { mafiaCarsConf, mafiaTerritoriesData, containerMafiaTerritoryId } from "../../util/mafiaData";
import { mafiaCarsCdtimer, mafiaCarsUnlockCdtimer } from "../../util/sharedData";
import { enums } from "../enums";
import { randomArrayEl } from "../../util/methods";
import { Container } from "../modules/data";
import { items } from "../items";
import { business } from "../business";

const priceDeliverVehMultipler = 3
const healDocsCost = 2000;

let givedLic: Map<string, boolean> = new Map();
let marfiaCarsCDMap: Map<string, boolean> = new Map();
setTimeout(() => {
  mp.events.register('tablet:mafiacars:order', (player: PlayerMp, id: number) => {
    if (!user.isLogin(player)) return;
    if (!user.isMafia(player) && !user.isGang(player)) return;
    let order = mafiaCarsConf[id];
    if (!order) return player.notify('~r~Sipariş hatası');
    if (order.type != "all") {
      if (order.type == "gang" && !user.isGang(player)) return player.notify('~r~Bu minibüsü sipariş edemezsiniz')
      if (order.type == "mafia" && !user.isMafia(player)) return player.notify('~r~Bu minibüsü sipariş edemezsiniz')
    }
    const idmp = `${user.getPlayerFraction(player)}_${id}`;
    if (marfiaCarsCDMap.has(idmp)) return player.notify('~r~Bu minibüs yakın zamanda sipariş edilmiştir. Tekrar sipariş vermeden önce bekleyin');
    if (user.getPlayerFractionRank(player) < order.rank) return player.notify("~r~Şu adresten temin edilebilir с " + order.rank + " ранга")
    if (user.getBankMoney(player) < order.cost) return player.notify('~r~Kartınızda bu minibüsü ödemek için yeterli kredi yok')

    user.removeBankMoney(player, order.cost)
    let posdata = randomArrayEl(enums.mafiaVehPos)
    let pos = new mp.Vector3(posdata[0], posdata[1], posdata[2]);
    let numberPlate = vehicles.generateNumber();

    player.notify('~b~TC bir dakika içinde noktaya teslim edilecektir\n~b~Sayı: ~s~' + numberPlate + "\n~b~Model: ~s~" + order.model);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    setTimeout(async function () {
      let veh = vehicles.spawnCar(pos, posdata[3], order.model, numberPlate);
      let chest = await inventory.createItem(inventory.types.BagTransfer, 1, 8, methods.convertNumberToHash(veh.numberPlate), 1);
      order.items.map(([itemidstring, count]) => {
        let itemid = methods.parseInt(itemidstring);
        inventory.createManyItem(itemid, 0, inventory.types.BagTransfer, chest.id, count);
      })
      setTimeout(function () {
        if (mp.players.exists(player)) player.notify(`~r~Polisler emri duymuş, acele edin.`)
        dispatcher.sendPos('Kod 2', `Şüpheli bir minibüs ihbarı var..\nMarka: ~y~${order.model}~s~\nSayılar: ~y~${numberPlate}`, pos, true);
      }, 120000);
    }, 60000);

    marfiaCarsCDMap.set(idmp, true)
    setTimeout(() => {
      marfiaCarsCDMap.delete(idmp)
    }, id == 6 ? mafiaCarsUnlockCdtimer : mafiaCarsCdtimer)
  })
  mp.events.register('server:user:healDocs', (player: PlayerMp, id: number) => {
    let remotePlayer = user.getPlayerById(id)
    if (!remotePlayer) return player.notify(`~r~Hasta tespit edilemedi`);
    if (player.dist(remotePlayer.position) > 5) return player.notify("~r~Çok uzakta")
    if (user.get(remotePlayer, "med_time") <= 0) return player.notify("~r~Hastanın taburcu edilmesine gerek yoktur");
    let healCost = user.get(remotePlayer, "med_lic") ? healDocsCost / 2 : healDocsCost;
    if (user.getLevel(remotePlayer) == 1) healCost = 300;
    player.notify('~g~Talep gönderildi');
    user.accept(remotePlayer, "Şunlar için tedavi alın $" + healCost).then(status => {
      if (!mp.players.exists(player)) return;
      if (!mp.players.exists(remotePlayer)) return;
      if (!status) {
        player.notify('~r~Отказ')
        remotePlayer.notify('~r~Отказ')
        return;
      }
      if (user.getCashMoney(remotePlayer) < healCost) return remotePlayer.notify(`~r~Ödeme yapmak için yeterli paranız yok`)
      user.fullHeal(remotePlayer)
      user.removeCashMoney(remotePlayer, healCost);
      user.addCashMoney(player, healCost == 300 ? healCost * 0.7 : healCost * 0.2);
      coffer.addMoney(healCost * 0.8);
      player.notify(`~g~Başarıyla`)
      remotePlayer.notify(`~g~Başarıyla`)
    })
  })
  mp.events.register('tablet:license', async (player: PlayerMp, id: number, give: boolean, selected: number) => {
    if (!user.isLogin(player)) return;
    let item = recLists[selected];
    if (!item) return player.notify("~r~Yanlış parametre seçildi");
    const licLabel = item.name
    const licName = item.param
    const cost = item.cost
    const rank = user.getPlayerFractionRank(player)
    const fraction = user.getPlayerFraction(player)
    if (!fraction) return player.notify("~r~Bir fraksiyonun üyesi değilsiniz");
    if (!rank) return player.notify("~r~Bir fraksiyonun üyesi değilsiniz");
    if (!item.fractions.includes(fraction)) return player.notify("~r~Bunu seçemezsin. Bu başka bir grup için");
    if (item.rank > rank) return player.notify("~r~Bunu seçemezsiniz. Rütbeniz yeterince yüksek değil");
    if (user.getId(player) == id && give) return player.notify("~r~Kendinize ruhsat veremezsiniz");
    let target = user.getPlayerById(id);
    if (give) {
      if (!target) return player.notify("~r~Oyuncu tespit edilmedi");
      if (methods.distanceToPos(target.position, player.position) > 3) return player.notify("~r~Oyuncu çok uzakta");
      if (user.get(target, 'is_gos_blacklist')) return player.notify('~r~Bu kişi kara listeye alındı');
      if (givedLic.has(id + "_" + licName)) return player.notify("~r~Adam çoktan [" + licLabel + "]\sınırlama: Günün OOC'unda 1");
      if (user.get(target, licName)) return player.notify("~r~Adamın zaten [" + licLabel + "]");
      let status = await user.accept(target, `Kontrol et [${licLabel}]`, `${cost ? `Kontrol et (Fiyat: $${cost})` : 'Kontrol et'}`)
      if (!mp.players.exists(player)) return;
      if (!mp.players.exists(target)) return;
      if (status) {
        if (cost && user.getMoney(target) < cost) return player.notify(`~r~Oyuncunun ödeme yapmak için yeterli parası yok`), target.notify(`~r~Ödeme yapmak için yeterli paranız yok`);
        if (cost) {
          user.removeCashMoney(target, cost);
          coffer.addMoney(cost * 0.85);
          user.addCashMoney(player, cost * 0.15);
        }
        user.set(target, licName, true)
        player.notify('~g~' + licLabel + ' tarafından yayınlandı')
        target.notify('~g~' + licLabel + ' tarafından yayınlandı')
        user.addHistory(target, 4, 'Erişim adresi ' + licLabel + '. Tarafından yayınlandı: ' + user.getRpName(player));
        user.updateClientCache(target);
        chat.sendFractionMessage(player, user.getPlayerFraction(player), `Tarafından yayınlandı ${user.getId(target)} ${licLabel}`)
      }
    } else {
      let data = !target ? await user.getUserDataFromDB(id) : null
      if (target) {
        if (!user.get(target, licName)) return player.notify("~r~Bir kişi kayıp [" + licLabel + "]");
        user.set(target, licName, false)
        user.updateClientCache(target)
        target.notify('~r~Yakalandınız ' + licLabel)
      } else {
        // @ts-ignore
        if (!data[licName]) return player.notify("~r~Bir kişi kayıp [" + licLabel + "]");
        // @ts-ignore
        data[licName] = 0
        data.save();
      }
      chat.sendFractionMessage(player, user.getPlayerFraction(player), `Ele geçirilen ${id} ${licLabel}`)
      player.notify('~g~Başarıyla');
      tablet.openFractionMenu(player)
    }
  });
  mp.events.register('dispatch:sendcode', (player: PlayerMp, local: boolean, code: number, desc: string) => {
    if (!user.isLogin(player)) return;
    if (!user.getPlayerFraction(player)) return;
    if (player.spamProtect) return player.notify(`~r~Kodu çok sık göndermeyin`);
    player.spamProtect = true;
    setTimeout(() => {
      player.spamProtect = false;
    }, 5000)
    if (local) {
      dispatcher.sendLocalPos(
        `Kod: ${code}`,
        `${user.getRpName(player)} - ${desc}`,
        player.position,
        user.getPlayerFraction(player),
        true
      );
    } else {
      dispatcher.sendPos(
        `Kod: ${code}`,
        `${user.getRpName(player)} - ${desc}`,
        player.position,
        true
      );
    }
    tablet.openFractionMenu(player)
  });
  mp.events.register('fraction:alert', (player: PlayerMp, text: string, title: string, news: boolean) => {
    if (!user.isLogin(player)) return;
    if (!user.getPlayerFraction(player)) return;
    if (text.length < 2) return player.notify(`~r~Minimum uzunluk - 2 karakter`)
    if (player.spamProtect) return player.notify(`~r~Çok sık göndermeyin`);
    player.spamProtect = true;
    setTimeout(() => {
      player.spamProtect = false;
    }, 5000)
    let functarget = !news ? methods.notifyWithPictureToFraction : methods.notifyWithPictureToAll
    switch (user.getPlayerFraction(player)) {
      case 1:
        functarget(!news ? `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]` : title, !news ? '' : 'Hükümet Haberleri', text, 'CHAR_BANK_MAZE', !news ? user.getPlayerFraction(player) : 0);
        break;
      case 2:
        functarget(!news ? `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]` : title, !news ? '' : 'Haberler LSPD', text, 'WEB_LOSSANTOSPOLICEDEPT', !news ? user.getPlayerFraction(player) : 0);
        break;
      case 3:
        functarget(!news ? `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]` : title, !news ? '' : 'Haberler FIB', text, 'DIA_TANNOY', !news ? user.getPlayerFraction(player) : 0);
        break;
      case 4:
        functarget(!news ? `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]` : title, !news ? '' : 'Haberler USMC', text, 'DIA_ARMY', !news ? user.getPlayerFraction(player) : 0);
        break;
      case 5:
        functarget(!news ? `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]` : title, !news ? '' : 'Haberler SDBP', text, 'DIA_POLICE', !news ? user.getPlayerFraction(player) : 0);
        break;
      case 7:
        functarget(!news ? `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]` : title, !news ? '' : 'Haberler SHERIFF', text, 'DIA_POLICE', !news ? user.getPlayerFraction(player) : 0);
        break;
      case 16:
        functarget(!news ? `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]` : title, !news ? '' : 'Haberler EMS', text, 'CHAR_CALL911', !news ? user.getPlayerFraction(player) : 0);
        break;
      default:
        if (news) return;
        methods.notifyWithPictureToFraction(`${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'tag')}]`, '', text, 'CHAR_ARTHUR', user.getPlayerFraction(player));
        break;
    }
    tablet.openFractionMenu(player)
  })
  mp.events.register('dispatch:gopos', (player: PlayerMp, id: number, x: number, y: number) => {
    if (!user.getPlayerFraction(player)) return;
    player.notify(`~g~Navigatörde ayarlanan hedef`)
    user.setWaypoint(player, x, y);
    dispatcher.data.map((item) => {
      item.map(q => {
        if (q.id == id && !q.accept) {
          if (q.authorid) {
            let target = user.getPlayerById(q.authorid);
            if (target) {
              target.notifyWithPicture(`Sevkiyat Görevlisi`, `Arayın #${q.id}`, `Arayın [${q.title}] bir personel tarafından alındı ${user.getRpName(player)}`, 'CHAR_CHAT_CALL', 2)
            }
          }
          q.accept = `${user.getRpName(player)} [${user.getId(player)}]`
          methods.notifyWithPictureToFraction(`${user.getRpName(player)}`, `Arayın #${q.id}`, `Arayın [${q.title}] kabul edildi`, 'CHAR_CHAT_CALL', user.getPlayerFraction(player));
        }
      })
    })
  })
  mp.events.register('fraction:setRank', (player: PlayerMp, id: number, rank: number) => {
    if (!user.isLogin(player)) return;
    if (!user.getPlayerFraction(player)) return;
    if (user.getId(player) == id && !user.isAdminNow(player, 4)) return player.notify(`~r~Kendinize bir rütbe atayamazsınız`)
    user.getUserDataFromDB(id).then(async targetdata => {
      if (!targetdata) return player.notify("~r~Bu kimliğe sahip üye yok");
      let target = user.getPlayerById(id);
      if (targetdata.fraction_id != user.getPlayerFraction(player)) return player.notify(`~r~Bir vatandaş aşağıdakilere taraf değildir ${user.getFractionName(user.getPlayerFraction(player))}`);
      if (!user.isSubLeader(player)) return player.notify(`~r~Sadece lider ve yardımcısı rütbe atayabilir`);
      if (user.getPlayerFractionRank(player) <= rank && !user.isAdminNow(player, 4)) return player.notify(`~r~Bu rütbeyi atayamazsınız`)
      if (targetdata.rank >= user.getPlayerFractionRank(player) && !user.isAdminNow(player, 4)) return player.notify(`~r~Belirli bir kişiye rütbe atayamazsınız`)
      user.loginterract(player, targetdata.id, "SetRank", "Fraksiyonun rütbesini verdi " + user.getFractionName(targetdata.fraction_id) + ", yeni rütbe: " + rank + ", önceki rütbe " + targetdata.rank)
      if (target) user.set(target, "rank", rank);
      else {
        targetdata.rank = rank
        await targetdata.save();
      }
      if (user.isGos(player)) {
        user.addHistory(
          id,
          0,
          'Gönderi Yayınlandı #' + rank + '. Yayınlayan: ' + user.getRpName(player)
        );
      }
      player.notify(`~g~Rütbe Başarıyla atanmış`)
      if (target) user.saveAccount(target), target.notify('Size yeni bir rütbe atandı: ' + user.getRankName(user.getPlayerFraction(target), user.getPlayerFractionRank(target))), user.updateClientCache(target);
      tablet.openFractionMenu(player)
    })
  })
  mp.events.register('fraction:uninvite', (player: PlayerMp, id: number, blacklist: boolean, blacklistReason?: string) => {
    if (!user.isLogin(player)) return;
    if (!user.getPlayerFraction(player)) return;
    if (user.getId(player) == id && !user.isAdminNow(player, 4)) return player.notify(`~r~Kendinizi kovamazsınız`);
    if (blacklist && !user.isAdminNow(player, 4) && !user.isGos(player)) return player.notify(`~r~Kara liste ile işten çıkaramazsınız`);
    if (!user.isAdminNow(player, 4) && !user.isSubLeader(player)) return player.notify(`~r~Bir üyeyi görevden alamazsınız`);
    user.getUserDataFromDB(id).then(async targetdata => {
      if (targetdata.fraction_id != user.getPlayerFraction(player)) return player.notify(`~r~Bu üye artık fraksiyonunuzun bir üyesi değil`)
      let target = user.getPlayerById(id);
      let rank = target ? user.getPlayerFractionRank(target) : targetdata.rank
      if (rank >= user.getPlayerFractionRank(player) && !user.isAdminNow(player, 4)) return player.notify(`~r~Bu üyeyi görevden alamazsınız`);
      if (target) {
        target.notify(`~r~Sen kovuldun ${user.getPlayerFractionName(target)}${blacklist ? ` Kara listeye alma ile, sebep: ${blacklistReason}` : ''}`)
        user.set(target, 'fraction_id', 0)
        user.set(target, 'rank', 0)
        user.resetCustomization(target);
        if (blacklist) user.set(target, 'is_gos_blacklist', 1), user.set(target, 'gos_blacklist_reason', blacklistReason)
        user.updateClientCache(target)
      }
      inventory.deleteHealItemsFromPlayer(targetdata.id)
      user.loginterract(player, id, "UnInvite", "Gruptan çıkarıldı " + targetdata.fraction_id + " rütbesinde " + targetdata.rank)
      targetdata.fraction_id = 0;
      targetdata.rank = 0;
      if (blacklist) targetdata.is_gos_blacklist = 1;
      if (blacklist) targetdata.gos_blacklist_reason = blacklistReason;
      targetdata.save();
      player.notify(`~g~Başarıyla`)

    });
  })
  mp.events.register('server:user:inviteFraction', async (player: PlayerMp, id: number) => {
    if (!user.isLogin(player)) return;
    if (!user.isSubLeader(player) && !user.isAdminNow(player, 4)) return player.notify(`~r~Oyuncu alamazsınız`)
    let remotePlayer = user.getPlayerById(id);
    if (remotePlayer) {
      if (user.get(remotePlayer, 'fraction_id') > 0) {
        player.notify('~r~Oyuncu zaten bir kuruluşun üyesidir');
        return;
      }
      if (user.get(remotePlayer, 'job')) {
        player.notify('~r~Oyuncu işe alınırsa, önce istifa etmelidir');
        return;
      }


      if (await user.countWarns(remotePlayer) > 0) {
        return player.notify("~r~Bu oyuncunun bir uyarısı var")
      }

      if (user.isGos(player) && user.get(remotePlayer, 'is_gos_blacklist')) {
        player.outputChatBox(`!{${chat.clRed}} Oyuncu devlet kurumları tarafından kara listeye alındı`);
        player.outputChatBox(
          `!{${chat.clRed}} Sebebi: !{${chat.clWhite}} ${user.get(
            remotePlayer,
            'gos_blacklist_reason'
          )}`
        );
        return;
      }

      if (player.dist(remotePlayer.position) > 5) {
        return player.notify("~r~Çok uzakta")
      }
      if (user.isGos(player) && user.get(remotePlayer, "business_id")) {
        let is_office = business.isOffice(user.get(remotePlayer, 'business_id'))
        if (is_office) return player.notify("~r~Bir oyuncunun ofisi var")
      }
      player.notify("~g~Talep gönderildi")
      user.accept(remotePlayer, "Bir kuruluşa mı katılmak istiyorsunuz?").then(res => {
        if (!res) {
          player.notify('~r~Oyuncu teklifi reddetti');
          return;
        }
        if (user.isGos(player)) {
          user.addHistory(
            remotePlayer,
            0,
            'kabul edildi organizasyona ' +
            methods.getFractionName(user.get(player, 'fraction_id')) +
            '. Tarafından kabul edildi: ' +
            user.getRpName(player)
          );
        }
        user.loginterract(player, remotePlayer, "Invite", "Kuruluşa kabul edildi")

        user.set(remotePlayer, 'fraction_id', user.get(player, 'fraction_id'));
        user.set(remotePlayer, 'rank', 1);
        user.saveAccount(remotePlayer);
        user.updateClientCache(remotePlayer);
        tablet.openFractionMenu(player)
        remotePlayer.notify(
          'Bir kuruluşa kabul edildiniz ~g~' + methods.getFractionName(user.get(player, 'fraction_id'))
        );
        player.notify('Bir kuruluşa katıldınız ~g~' + user.getRpName(remotePlayer));

        methods.saveLog(
          'inviteFraction',
          'kabul edildi organizasyona ' +
          methods.getFractionName(user.get(player, 'fraction_id')) +
          '. Tarafından kabul edildi: ' +
          user.getRpName(player)
        );
      });
    }
  });
  mp.events.add('tablet:openfraction', (player: PlayerMp) => {
    tablet.openFractionMenu(player)
  })
  mp.events.register('tablet:fraction:load', (player: PlayerMp) => {
    tablet.openFractionMenu(player)
  })
  mp.events.register('tablet:gov:load', (player: PlayerMp) => {
    tablet.openGovMenu(player)
  })
  mp.events.register('tablet:gov:setParam', (player: PlayerMp, type: "nalog" | "biz" | "bomj" | "old", value: number) => {
    if (!user.isLogin(player)) return;
    const canEdit = user.isAdminNow(player, 6) || (user.getPlayerFraction(player) == 1 && user.isLeader(player))
    if (!canEdit) return player.notify('~r~Erişiminiz yok');
    if (type == "nalog") {
      if (value < 1 || value > 99) return player.notify(`~r~Değer doğru değil`)
      coffer.setNalog(value);
    } else if (type == "biz") {
      if (value < 1 || value > 99) return player.notify(`~r~Değer doğru değil`)
      coffer.setNalogBizz(value);
    } else if (type == "bomj") {
      if (value < 1 || value > 9999) return player.notify(`~r~Değer doğru değil`)
      coffer.setPosob(value);
    } else if (type == "old") {
      if (value < 1 || value > 9999) return player.notify(`~r~Değer doğru değil`)
      coffer.setMoneyOld(value);
    }
    player.notify('~g~Зbaşlık Başarıyla kurmak')
    tablet.openGovMenu(player);
  })
  mp.events.register('tablet:gov:takeMoney', (player: PlayerMp, value: number) => {
    if (!user.isLogin(player)) return;
    const canEdit = user.isAdminNow(player, 6) || (user.getPlayerFraction(player) == 1 && user.isLeader(player))
    if (!canEdit) return player.notify('~r~Erişiminiz yok');
    if (!user.get(player, 'bank_number')) return player.notify('~r~Para çekmek için aktif bir banka hesabınız yok');
    if (value < 1 || value > (user.isAdminNow(player, 6) ? 99999999999 : 1000000)) return player.notify(`~r~Değer doğru değil`)
    if (coffer.getMoney() < value) return player.notify(`~r~Hükümetin bütçesi bu miktardan daha azdır`)
    player.notify('~g~Operasyon Başarıyla gerçekleştirildi')
    coffer.removeMoney(value);
    user.addBankMoney(player, value);
    methods.saveLog('TakeCoffer', `${user.get(player, 'rp_name')} (${user.get(player, 'id')}) take $${value}`);
    tablet.openGovMenu(player);
  })
  mp.events.register('tablet:gov:putMoney', (player: PlayerMp, value: number) => {
    if (!user.isLogin(player)) return;
    if (!user.get(player, 'bank_number')) return player.notify('~r~Para çekmek için aktif bir banka hesabınız yok');
    if (value < 1 || value > (user.isAdminNow(player, 6) ? 99999999999 : 1000000)) return player.notify(`~r~Değer doğru değil`)
    if (user.getBankMoney(player) < value) return player.notify(`~r~Banka hesabınızda yeterli paranız yok`)
    player.notify('~g~Operasyon Başarıyla gerçekleştirildi')
    coffer.addMoney(value);
    user.removeBankMoney(player, value);
    methods.saveLog('TakeCoffer', `${user.get(player, 'rp_name')} (${user.get(player, 'id')}) take $${value}`);
    tablet.openGovMenu(player);
  })
  mp.events.add('tablet:main', (player: PlayerMp) => {
    tablet.open(player)
  })
  mp.events.register('tablet:vehicles:load', (player) => {
    tablet.openVehMenu(player);
  });
  mp.events.register('tablet:cars:find', (player, id) => {
    if (!user.isLogin(player)) return;
    vehicles.findBySlot(player, id);
  });
  // mp.events.register('dostavka', (player: PlayerMp, sec) => {
  //   player.call('dostamkaTimer', [sec])
  // });

  mp.events.register('tablet:cars:deliver', (player: PlayerMp, id) => {
    if (!user.isLogin(player)) return;
    if (player.spamProtect) return player.notify(`~r~Çok sık itmeyin`);
    player.spamProtect = true;
    setTimeout(() => {
      player.spamProtect = false;
    }, 5000)
    if (player.dimension != 0) return player.notify(`~r~Kapalı alanda sipariş edemezsiniz`)
    let containerId = user.get(player, 'car_id' + id);
    let price = vehicles.get(containerId, 'price')
    if (!price) return player.notify(`~r~Siparişi verilemedi`)
    if (player.deliverVehWait) return player.notify(`~r~ЗHer 10 dakikada bir araç siparişi verebilirsiniz`)
    let respPrice = price / 100;
    if (respPrice < 100) respPrice = 100;
    if (respPrice > 3000) respPrice = 3000;
    respPrice = methods.parseInt(respPrice * priceDeliverVehMultipler);

    if (player.inGreenZone) return player.notify(`~r~Yeşil bölgede bir TC sipariş edemezsiniz`);
    // if(player.interrior) return player.notify(`~r~Нельзя заказывать ТС в помещении или близко ко входу в помещение`);
    if (player.vehicle) return player.notify(`~r~CU'dayken bir CU sipariş edemezsiniz`);
    if (user.getBankMoney(player) < respPrice) return player.notify(`~r~У вас недостаточно средств на банковском балансе`);
    let statusresp = vehicles.respBySlot(player, id, true);
    if (statusresp) {
      player.deliverVehWait = true;
      setTimeout(() => {
        if (mp.players.exists(player)) player.deliverVehWait = false;
      }, 10 * 1000 * 60)
      player.notifyWithPicture(
        'Доставка транспорта',
        'Механик',
        'Скоро твой транспорт будет доставлен',
        'CHAR_MECHANIC',
        2
      );
      user.removeBankMoney(player, respPrice);
      player.call('dostavkaTimer', [60])
    }

  });
  mp.events.register('tablet:cars:resp', (player, id) => {
    if (!user.isLogin(player)) return;
    if (player.spamProtect) return player.notify(`~r~Не нажимайте так часто`);
    player.spamProtect = true;
    setTimeout(() => {
      player.spamProtect = false;
    }, 5000)
    vehicles.respBySlot(player, id);
  });
  mp.events.register('tablet:chests:load', (player) => {
    if (!user.isLogin(player)) return;
    tablet.openChestMenu(player);
  });
  mp.events.register('tablet:house:load', (player) => {
    if (!user.isLogin(player)) return;
    tablet.openHouseMenu(player);
  });
  mp.events.register('tablet:appart:load', (player) => {
    if (!user.isLogin(player)) return;
    tablet.openAppartMenu(player);
  });
  mp.events.register('tablet:business:load', (player) => {
    if (!user.isLogin(player)) return;
    tablet.openBusinessMenu(player);
  });
  mp.events.register('tablet:condo:load', (player) => {
    if (!user.isLogin(player)) return;
    tablet.openCondoMenu(player);
  });
  mp.events.register('tablet:chests:updatePin', (player, type: string, pin: number) => {
    if (!user.isLogin(player)) return;
    let stockid = user.get(player, 'stock_id')
    if (!stockid) return mp.events.triggerBrowser(player, 'tablet:chestsno')
    if (type === "pin1") stock.updatePin1(stockid, pin)
    else if (type === "pin2") stock.updatePin2(stockid, pin)
    else if (type === "pin3") stock.updatePin3(stockid, pin)
    player.notify('~g~Пинкод обновлён')
    tablet.openChestMenu(player);
  });

  mp.events.register('tablet:chests:setWayPoint', (player) => {
    if (!user.isLogin(player)) return;
    let stockid = user.get(player, 'stock_id')
    if (!stockid) return mp.events.triggerBrowser(player, 'tablet:chestsno')

    let _stockData = stock.getData(stockid);
    if (!_stockData) return;

    user.setWaypoint(player, _stockData.get("x"), _stockData.get("y"));
  });

  mp.events.register('tablet:house:updatePin', (player, pin: number) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'id_house')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:houseno')
    if (isNaN(pin) || pin < 0 || pin > 99999) return player.notify(`~r~Geçersiz pin kodu girildi. Pin kodu 0 ile 99999 arasına olmalıdır.`)
    if (!houses.getPin(houseid)) return player.notify(`~r~Пинкод не установлен.`)
    if (!(houses.get(houseid, 'id_user') == user.getId(player) || user.isAdminNow(player, 6))) return player.notify(`~r~Pin kodunu değiştirme yetkiniz yok.`)
    houses.updatePin(houseid, pin)
    player.notify('~g~Evinizin parolası güncellendi.')
    tablet.openHouseMenu(player);
  });


  mp.events.register('tablet:house:setWayPoint', (player) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'id_house')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:houseno')
    let _houseData = houses.getHouseData(houseid)
    if (!_houseData) return;

    user.setWaypoint(player, _houseData.get("x"), _houseData.get("y"));
  });

  mp.events.register('tablet:appart:updatePin', (player, pin: number) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'apartment_id')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:appartno')
    if (isNaN(pin) || pin < 0 || pin > 99999) return player.notify(`~r~Пинкод указан не верно`)
    if (!apartments.getPin(houseid)) return player.notify(`~r~Пинкод не установлен.`)
    if (!(apartments.getOwnerId(houseid) == user.getId(player) || user.isAdminNow(player, 6))) return player.notify(`~r~Pin kodunu değiştirme yetkiniz yok.`)
    apartments.updatePin(houseid, pin)
    player.notify('~g~Пинкод обновлён')
    tablet.openAppartMenu(player);
  });
  mp.events.register('tablet:appart:deletePin', (player) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'apartment_id')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:appartno')
    if (!apartments.getPin(houseid)) return player.notify(`~r~Пинкод не установлен.`)
    if (!(apartments.getOwnerId(houseid) == user.getId(player) || user.isAdminNow(player, 6))) return player.notify(`~r~Pin kodunu değiştirme yetkiniz yok.`)
    apartments.updatePin(houseid, 0)
    player.notify('~g~Пинкод Başarıyla снят')
    tablet.openAppartMenu(player);
  });
  mp.events.register('tablet:condo:updatePin', (player, pin: number) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'condo_id')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:condono')
    if (isNaN(pin) || pin < 0 || pin > 99999) return player.notify(`~r~Пинкод указан не верно`)
    if (!condo.getPin(houseid)) return player.notify(`~r~Пинкод не установлен.`)
    if (!(condo.getOwnerId(houseid) == user.getId(player) || user.isAdminNow(player, 6))) return player.notify(`~r~Pin kodunu değiştirme yetkiniz yok.`)
    condo.updatePin(houseid, pin)
    player.notify('~g~Пинкод обновлён')
    tablet.openCondoMenu(player);
  });
  mp.events.register('tablet:condo:deletePin', (player) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'condo_id')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:condono')
    if (!condo.getPin(houseid)) return player.notify(`~r~Пинкод не установлен.`)
    if (!(condo.getOwnerId(houseid) == user.getId(player) || user.isAdminNow(player, 6))) return player.notify(`~r~Pin kodunu değiştirme yetkiniz yok.`)
    condo.updatePin(houseid, 0)
    player.notify('~g~Пинкод Başarıyla снят')
    tablet.openCondoMenu(player);
  });
  mp.events.register('tablet:house:deletePin', (player) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'id_house')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:houseno')
    if (!houses.getPin(houseid)) return player.notify(`~r~Пинкод не установлен.`)
    if (!(houses.get(houseid, 'id_user') == user.getId(player) || user.isAdminNow(player, 6))) return player.notify(`~r~Pin kodunu değiştirme yetkiniz yok.`)
    houses.updatePin(houseid, 0)
    player.notify('~g~Пинкод Başarıyla снят')
    tablet.openHouseMenu(player);
  });
  mp.events.register('tablet:house:unleave', async (player, id: number) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'id_house')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:houseno')
    if (!(houses.get(houseid, 'id_user') == user.getId(player) || user.isAdminNow(player, 6))) return player.notify(`~r~У вас нет доступа к выселению`)
    if (user.getId(player) == id) return player.notify(`~r~Вы не можете выселить себя`)
    if (houses.get(houseid, 'id_user') == id) return player.notify(`~r~Нельзя выселить владельца дома`)
    let target = user.getPlayerById(id);
    player.notify('~g~Başarıyla')
    if (target) return user.set(target, 'id_house', 0), user.updateClientCache(target), await user.saveAccount(target), tablet.openHouseMenu(player);
    user.getUserDataFromDB(id).then(itemq => {
      if (itemq) {
        itemq.id_house = 0;
        itemq.save();
        tablet.openHouseMenu(player);
      }
    })
  });
  mp.events.register('tablet:mafia:data:load', (player: PlayerMp) => {
    tablet.openMafiaTer(player)
  })
  mp.events.register('tablet:mafiater:pos', (player: PlayerMp, id: number) => {
    let q = mafiaTerritoriesData[id]
    if (q) user.setWaypoint(player, q.pos[0], q.pos[1]), player.notify('~g~Точка установлена')
    else player.notify('~r~Ошибка')
  })
  mp.events.register('tablet:gpshelp:list:load', (player: PlayerMp) => {
    tablet.trackingData(player)
  });
  mp.events.register('tablet:gos:trackingid', (player: PlayerMp, id: number) => {
    let target = user.getPlayerById(id);
    if (!target) return target.notify("~r~Цель покинула сервер")
    const trackingname = `tracking_${id}`
    if (!player.trackingList) player.trackingList = []
    if (player.trackingList.includes(trackingname)) {
      player.trackingList.splice(player.trackingList.indexOf(trackingname), 1)
      user.removeLocalBlip(player, trackingname);
      player.notify('Отслеживание отключено');
    } else {
      player.trackingList.push(trackingname)
      player.notify('Отслеживание включено');
      target.notify(`~g~Ваш маяк отслеживается сотрудником ${user.getRpName(player)} [${user.get(player, 'tag')}]`)
    }
    tablet.trackingData(player)
  })
  mp.events.register('tablet:gos:tracking', (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    if (!user.isGos(player)) return;
    const fraction = user.getPlayerFraction(player)
    const trackingname = `tracking_${user.getId(player)}`
    if (player.tracking) {
      player.tracking = false;
      player.notify('~g~Отслеживание отключено')
      let targets = mp.players.toArray().filter(item => item.trackingList && item.trackingList.includes(trackingname));
      targets.map(target => {
        user.removeLocalBlip(target, trackingname);
        target.trackingList.splice(target.trackingList.indexOf(trackingname), 1)
      })
    } else {
      player.tracking = true;
      player.notify('~g~Отслеживание включено');
      dispatcher.sendLocalPos(
        `GPS Маяк`,
        `${user.getRpName(player)} [${user.get(player, 'tag')}] - Активировал GPS маяк`,
        player.position,
        user.getPlayerFraction(player),
        true
      );

      let q = setInterval(() => {
        if (!mp.players.exists(player) || !player.tracking) {
          clearInterval(q);
          let targets = mp.players.toArray().filter(item => item.trackingList && item.trackingList.includes(trackingname));
          targets.map(target => {
            user.removeLocalBlip(target, trackingname);
            target.trackingList.splice(target.trackingList.indexOf(trackingname), 1)
          })
        } else {
          let targets = mp.players.toArray().filter(item => user.getPlayerFraction(item) == fraction && item.trackingList && item.trackingList.includes(trackingname));
          targets.map(target => {
            user.drawLocalBlip(target, trackingname, player.position, `${user.getRpName(player)} [${user.get(player, 'tag')}]`, player.vehicle ? 380 : 280, 1, false);
          })
        }
      }, 10000)
    }
    tablet.trackingData(player)
    player.trackingBlock = true;
    setTimeout(() => {
      player.trackingBlock = false
    }, 60000)
  })

  mp.events.register('tablet:business:updateBiz', (player, mat: number) => {
    if (!user.isLogin(player)) return;
    let businessid = user.get(player, 'business_id')
    if (!businessid) return mp.events.triggerBrowser(player, 'tablet:businessno')
    if (isNaN(mat) || mat < 0 || mat > 500) return player.notify(`~r~Сумма указана не верно`)
    if (!business.getPrice(businessid)) return player.notify(`~r~Сумма не указана.`)
    if (!(business.getOwnerInfo(businessid) || user.isAdminNow(player, 6))) return player.notify(`~r~У вас нет доступа к установке суммы`)
    business.setPriceCard(businessid, mat)
    player.notify('~g~Сумма обновлёна')
    tablet.openBusinessMenu(player);
  });

  mp.events.addRemoteCounted('playerDeathDone', (player) => {
    if (user.isLogin(player)) {
      if (!player.tracking) return;
      const trackingname = `tracking_${user.getId(player)}`
      player.tracking = false;
      player.notify('~g~Отслеживание отключено')
      let targets = mp.players.toArray().filter(item => item.trackingList && item.trackingList.includes(trackingname));
      targets.map(target => {
        user.removeLocalBlip(target, trackingname);
        target.trackingList.splice(target.trackingList.indexOf(trackingname), 1)
      })

      if (!player.trackingBlock) {
        player.trackingBlock = true;
        setTimeout(() => {
          player.trackingBlock = false
        }, 60000)
      }
    }
  });
  mp.events.add('tablet:unequip', (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    if (!user.get(player, 'tablet_equip')) return player.notify('~r~У вас нет экипированного планшета');
    user.set(player, 'tablet_equip', 0)
    user.updateClientCache(player);
    user.takeNewItem(player, 282, 1)
    inventory.updateInventory(player)
    player.notify(`~g~Вы сняли планшет с экипировки`)
  })
}, 1000)

export const tablet = {
  trackingData: (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    if (!user.isGos(player)) return;
    if (!player.trackingList) player.trackingList = []
    const fraction = user.getPlayerFraction(player)
    let targets = mp.players.toArray().filter(item => user.getPlayerFraction(item) == fraction && item.tracking);
    let q: [string, number, boolean][] = []
    targets.map(item => {
      q.push([`${user.getRpName(item)} [${user.get(item, 'tag')}]`, user.getId(item), player.trackingList.includes(`tracking_${user.getId(item)}`)])
    })
    mp.events.triggerBrowser(player, 'tablet:gpshelp:list', q)
  },
  openMafiaTer: async (player: PlayerMp) => {
    if (!user.isLogin(player)) return;

    let items: {
      mafiaWarownerId?: number;
      mafiaWarownerName?: string;
      mafiaWarmoney?: number;
      access?: boolean;
    }[] = [];
    for (let id in mafiaTerritoriesData) {
      let data1 = await Container.GetAll(containerMafiaTerritoryId + (parseInt(id) + 1));
      items.push({
        mafiaWarownerId: data1.get('mafiaWarownerId'),
        mafiaWarownerName: data1.get('mafiaWarownerId') ? user.getFractionName(data1.get('mafiaWarownerId')) : "Никто",
        mafiaWarmoney: data1.get('mafiaWarmoney'),
        access: data1.get('mafiaWarownerId') == user.getPlayerFraction(player)
      })
    }
    mp.events.triggerBrowser(player, 'tablet:mafia:data', items, user.isSubLeader(player), user.isLeader(player))
  },
  openCondoMenu: async (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'condo_id')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:condono')
    let users: {
      name: string;
      id: number;
    }[] = []
    const usersq = (await userEntity.findAll({ where: { condo_id: houseid } })).map(item => {
      users.push({
        name: item.rp_name,
        id: item.id
      })
    });
    mp.events.triggerBrowser(player, 'tablet:condo', users, houseid, condo.get(houseid, 'price'), condo.get(houseid, 'address'), `${user.getRpName(player)} [${user.getId(player)}]`, (condo.getOwnerId(houseid) == user.getId(player) || user.isAdminNow(player, 6)), !!condo.getPin(houseid))

  },
  openAppartMenu: async (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'apartment_id')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:appartno')
    let users: {
      name: string;
      id: number;
    }[] = []
    const usersq = (await userEntity.findAll({ where: { apartment_id: houseid } })).map(item => {
      users.push({
        name: item.rp_name,
        id: item.id
      })
    });
    mp.events.triggerBrowser(player, 'tablet:appart', users, houseid, apartments.get(houseid, 'price'), apartments.get(houseid, 'address'), `${user.getRpName(player)} [${user.getId(player)}]`, (apartments.getOwnerId(houseid) == user.getId(player) || user.isAdminNow(player, 6)), !!apartments.getPin(houseid))

  },
  openHouseMenu: async (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    let houseid = user.get(player, 'id_house')
    if (!houseid) return mp.events.triggerBrowser(player, 'tablet:houseno')
    if (!houses.get(houseid, 'price')) return mp.events.triggerBrowser(player, 'tablet:houseno')
    let users: {
      name: string;
      id: number;
    }[] = []
    const usersq = (await userEntity.findAll({ where: { id_house: houseid } })).map(item => {
      users.push({
        name: item.rp_name,
        id: item.id
      })
    });
    let owner = users.find(item => item.id == houses.get(houseid, 'id_user'))
    mp.events.triggerBrowser(player, 'tablet:house', users, houseid, houses.get(houseid, 'price'), houses.get(houseid, 'address'), owner ? `${owner.name} [${owner.id}]` : "Государство", (houses.get(houseid, 'id_user') == user.getId(player) || user.isAdminNow(player, 6)), !!houses.get(houseid, 'pin'))

  },
  openChestMenu: async (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    let stockid = user.get(player, 'stock_id')
    if (!stockid) return mp.events.triggerBrowser(player, 'tablet:chestsno')
    const logs = await stock.getLog(stockid, 20)
    mp.events.triggerBrowser(player, 'tablet:chests', logs, stockid, stock.get(stockid, 'price'), stock.get(stockid, 'address'), `${user.getRpName(player)} [${user.getId(player)}]`)

  },
  openVehMenu: (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    let carsids: [number, number][] = []
    let carsdata: {
      model: string;
      name: string;
      slot: number;
      plate: string;
      cost: number;
      costDeliver: number;
      fuelMax: number;
      fuelPer: number;
      bag: number;
      autopilot: boolean;
    }[] = []
    for (let id = 1; id < 9; id++) {
      let carid = user.get(player, `car_id${id}`)
      if (carid) carsids.push([id, carid])
    }
    for (let idq in carsids) {
      let [slot, id] = carsids[idq];
      if (vehicles.getData(id)) {
        if (vehicles.get(id, 'id_user') != user.getId(player)) {
          user.set(player, 'car_id' + slot, 0);
          user.updateClientCache(player)
        } else {
          let plate = vehicles.get(id, 'number')
          let model = vehicles.get(id, 'name')
          let vInfo = methods.getVehicleInfo(model)
          let name = vInfo.display_name != "Unknown" ? vInfo.display_name : model;
          let price = vehicles.get(id, 'price')
          let respPrice = price / 100;
          if (respPrice < 100) respPrice = 100;
          if (respPrice > 3000) respPrice = 3000;
          respPrice = methods.parseInt(respPrice * priceDeliverVehMultipler);
          carsdata.push({
            bag: inventory.maxAmount(8, plate),
            slot,
            plate,
            cost: price,
            costDeliver: respPrice,
            fuelMax: vInfo.fuel_full,
            fuelPer: vInfo.fuel_min,
            model,
            name,
            autopilot: (vInfo.fuel_min == 0)
          })
        }
      } else {
        user.set(player, 'car_id' + slot, 0);
        user.updateClientCache(player)
      }
    }
    mp.events.triggerBrowser(player, 'tablet:vehicles', carsdata)

  },
  openGovMenu: async (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    const canEdit = user.isAdminNow(player, 6) || (user.getPlayerFraction(player) == 1 && user.isLeader(player))
    let money = coffer.getMoney()
    let cofferMoneyBomj = coffer.getPosob()
    let cofferNalog = coffer.getNalog()
    let cofferNalogBizz = coffer.getNalogBizz()
    let cofferMoneyOld = coffer.getMoneyOld()
    let alldonators = await cofferDonateEntity.findAll()
    let donators: [string, number][] = []
    alldonators.forEach(item => {
      let fnd = donators.find(itm => itm[0] == item.name)
      if (fnd) fnd[1] += item.sum;
      else donators.push([item.name, item.sum])
    });
    donators.sort((a, b) => {
      return b[1] - a[1];
    })
    let news: {
      title: string;
      text: string;
      author: string;
      time: string;
    }[] = []
    let q = (await rpNewsEntity.findAll({
      where: {
        fraction: 1
      },
      limit: 4,
      order: [['id', 'DESC']]
    })).map(item => {
      news.push({
        title: item.title,
        text: Buffer.from(item.text).toString('base64'),
        author: item.author_name,
        time: item.date + " " + item.time
      })
    })
    // news = []
    donators.splice(15, 99999999999999)
    mp.events.triggerBrowser(player, 'tablet:gov:data',
      money,
      cofferMoneyBomj,
      cofferNalogBizz,
      cofferMoneyOld,
      cofferNalog,
      canEdit,
      donators,
      news
    )
  },
  openFractionMenu: async (player: PlayerMp) => {
    let users = user.getPlayerFraction(player) ? await userEntity.findAll({
      where: {
        fraction_id: user.getPlayerFraction(player)
      },
      order: [
        ['is_online', 'DESC'],
        ['rank', 'DESC'],
      ],
      // attributes: ["id", "rank", 'fraction_id', "rp_name", "last_login", "is_online"]
    }) : [];
    let res = users.map(usr => {
      return { id: usr.id, rank: usr.rank, rp_name: filter(usr.rp_name), last_login: usr.last_login, is_online: usr.is_online, tag: usr.tag ? filter(usr.tag) : "" };
    })
    let q = [...dispatcher.data[user.getPlayerFraction(player)]].slice(-15)
    let dispatchq: any[] = []
    q.map(item => {
      dispatchq.push({
        ...item, accept: item.accept ? filter(item.accept) : null, desc: filter(item.desc), title: filter(item.title),
        dist: ((item.withCoord && item.posX && item.posY) ? player.dist(new mp.Vector3(item.posX, item.posY, player.position.z)) : 0)
      })
    })
    // console.log(dispatchq)
    mp.events.triggerBrowser(player, "tablet:fraction", user.getPlayerFraction(player), user.getPlayerFractionRank(player), user.isSubLeader(player), [], res, dispatchq, filter(user.get(player, 'tag')), player.tracking)
  },
  open: async (player: PlayerMp, id: number = 0) => {
    inventory.closeInventory(player)
    menu.close(player)
    if (user.get(player, 'jail_time') > 0) return player.notify(`~r~Планшетом нельзя пользоватся в тюрьме`)
    if (!user.get(player, 'tablet_equip')) return player.notify('~r~У вас нет экипированного планшета');
    user.setGui(player, 'tablet');
    let data = fractionUtil.getFraction(user.getPlayerFraction(player))
    mp.events.triggerBrowser(player, 'tablet:data', data ? data.name : null, data ? data.icon : '', user.getPlayerFraction(player))
  },
  equipItem: async (player: PlayerMp, id: number) => {
    let item = inventory.getById(id);
    if (!item) return;
    if (item.owner_type != 1 || item.owner_id != user.getId(player)) return;
    if (user.get(player, 'tablet_equip')) return player.notify('~r~У вас уже есть экипированный планшет');
    user.set(player, 'tablet_equip', 1);
    user.updateClientCache(player)
    inventory.deleteItem(id);
    player.notify('~g~Планшет экипирован');
    inventory.updateInventory(player);
  },
  openBusinessMenu: async (player: PlayerMp) => {
    if (!user.isLogin(player)) return;
    let businessid = user.get(player, 'business_id')
    if (!businessid) return mp.events.triggerBrowser(player, 'tablet:businessno')
    let users: {
      name: string;
      id: number;
    }[] = []
    const usersq = (await userEntity.findAll({ where: { business_id: businessid } })).map(item => {
      users.push({
        name: item.rp_name,
        id: item.id
      })
    });
    mp.events.triggerBrowser(player, 'tablet:business', users, businessid, business.get(businessid, 'price'), business.get(businessid, 'name'), `${user.getRpName(player)} [${user.getId(player)}]`, (business.getOwnerInfo(businessid) == user.getId(player) || user.isAdminNow(player, 6)), !!business.getPrice(businessid), business.getPriceCard(businessid))

  }
}

function filter(str: string) {
  if (!str) return str;
  if (typeof str !== "string") str = String(str);
  return methods.filter(str).replace(/'/gi, '').replace(/"/gi, '')
}