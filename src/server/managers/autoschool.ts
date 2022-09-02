/// <reference path="../../declaration/server.ts" />

import { methods } from "../modules/methods"
import { menu } from "../modules/menu";
import { user } from "../user";
import { randomArrayEl } from "../../util/methods";
import { vehicles } from "../vehicles";
import { chat, enabledSystem } from "../modules/chat";
import { getParkPosition } from "./parking";
import { npc, npc_dialog } from "../modules/npc";
import { gtaStrToHtml } from "../../util/string";
import { RAGE_BETA } from "../../util/newrage";

export {}
/** Уникальный ID для генератора */
let ids = 1;


let autoschoolPos = new mp.Vector3(-702.40, -1308.85, 4.11)


let licCost:{
  [name:string]:number;
} = {
  "a":300,
  "b":600,
  "c":1000,
  "air":5000,
  "ship":2000,
}
let licVehs:{
  [name:string]:string;
} = {
  "a":"lectro",
  "b":"asea",
  "c":"mule",
  "air":"buzzard2",
  "ship":"dinghy",
}
let licVehsPos:{
  [name:string]:{x:number;y:number;z:number;h:number}[];
} = {
  "a":[{x:-743.7610473632812,y:-1310.8988037109375,z:4.496565818786621,h:228.7469482421875}],
  "b":[{x:-743.7610473632812,y:-1310.8988037109375,z:4.496565818786621,h:228.7469482421875}],
  "c":[{x:-743.7610473632812,y:-1310.8988037109375,z:4.496565818786621,h:228.7469482421875}],
  "air":[{x: -749.308349609375, y: -1432.199462890625, z: 4.902952671051025, h: 169.6073760986328},],
  "ship":[{x: -832.7066650390625, y: -1439.804931640625, z: -1.1218644380569458, h: 86.00557708740234},],
}

/** Очередь на экзамен */
let examWaitList:Map<number, {
  /** Лицензия */
  lic:string;
  /** Получили экзаменатора или нет? */
  status:boolean;
  /** Начали ли мы прохождения экзамена или нет */
  start:boolean;
}> = new Map();
class autoschoolClass {
  /** Позиция */
  theoryMap: Map<number,(status:boolean)=>any>;
  readonly position: Vector3Mp;
  readonly id: number;
  constructor(position:Vector3Mp){
    ids++;
    this.theoryMap = new Map();
    this.id = ids;
    this.position = position;
    methods.createDynamicCheckpoint(this.position, "Lisans merkezi menüsünü açmak için ~g~E~w~ tuşlarına basın", (player) => {
      // console.log("[AUTOSCHOOL] ENTER DYNAMIC CHECK")
      if(!enabledSystem.autoschool) return player.notify("Ruhsat merkezi geçici olarak bakıma alınmıştır. Biraz sonra tekrar kontrol edin")
      this.menu(player)
    }, 2, 0)
    mp.blips.new(77, this.position, {
      dimension: 0,
      name: "Lisans merkezi",
      scale: 0.5,
      color: 25,
      shortRange: true
    })
  }
  menu(player:PlayerMp){
    user.questWorks(player)
    // console.log("[AUTOSCHOOL] OPEN MENU")
    let m = menu.new(player, "Lisanslar", "Mevcut lisanslar");
    let cats = ["a", "b", "c"];
    if(user.get(player, 'fraction_id') == 17){
      m.newItem({
        name: "Sınav için bekliyorum",
        more: [...examWaitList].filter(i => !i[1].start).length,
        onpress: () => {
          this.examsList(player)
        }
      })
    }
    cats.forEach(cat => {
      m.newItem({
        name: "Kategori "+cat.toUpperCase(),
        more: user.get(player, cat+"_lic") ? "~g~Erişim adresi" : "~b~Teslim almak (~g~$"+licCost[cat]+"~b~)",
        onpress: () => {
          if(user.get(player, cat+"_lic")) return player.notify("Bu sertifikaya zaten sahipsiniz");
          this.startExam(player, cat);
        }
      })
    })
    m.newItem({
      name: "Kategori "+("Su ТС"),
      more: user.get(player, "ship_lic") ? "~g~Erişim adresi" : "~b~Teslim almak (~g~$"+licCost["ship"]+"~b~)",
      onpress: () => {
        if(user.get(player, "ship_lic")) return player.notify("У bu lisansa zaten sahipsiniz");
        this.startExam(player, "ship");
      }
    })
    m.newItem({
      name: "Kategori "+("Hava ТС"),
      more: user.get(player, "air_lic") ? "~g~Erişim adresi" : "~b~Teslim almak (~g~$"+licCost["air"]+"~b~)",
      onpress: () => {
        if(user.get(player, "air_lic")) return player.notify("У bu lisansa zaten sahipsiniz");
        this.startExam(player, "air");
      }
    })
    m.open()
  }

  startExam(player:PlayerMp,lic:string){
    // console.log("[AUTOSCHOOL] START EXAM")
    if(player.autoschoolExam) return player.notify("Zaten bir sınava giriyorsunuz"); 
    
    // if(player.autoschoolExamProtect) return player.notify(`~r~Вы можете повторно сдавать экзамен через ${player.autoschoolExamProtect} мин.`);
    if(user.get(player, lic+"_lic")) return player.notify("Bu sertifikaya zaten sahipsiniz");
    let cost = licCost[lic];
    if(user.getMoney(player) < cost) return player.notify("Ödeme yapmak için yeterli paranız yok");
    // player.autoschoolExamProtect = 10;
    // const check = () => {
    //   if(!mp.players.exists(player)) return;
    //   player.autoschoolExam = null;
    //   player.autoschoolExamProtect--;
    //   if(player.autoschoolExamProtect){
    //     setTimeout(() => {
    //       check();
    //     }, 60000)
    //   } else {
    //     player.autoschoolExamProtect = 0;
    //   }
    // }
    // check();
    player.autoschoolExam = this.id
    user.removeCashMoney(player, cost);
    player.notify("Sınav ücreti ödendi")
    let cats = ["a", "b", "c"];
    let needPractice = true;
    cats.map((item) => {
      if(user.get(player, item+"_lic")) needPractice = false;
    })
    if(lic.length == 1 && needPractice) this.starTheory(player, lic);
    else this.starPractice(player, lic);
  }

  starPractice(player:PlayerMp, lic:string){
    // console.log("[AUTOSCHOOL] START PRACTICE")
    examWaitList.set(player.id, {lic,status:false,start:false});
    player.notify("~g~Müsait bir eğitmen aranıyor, maksimum bekleme süresi 30 saniye");
    this.requestExam(player, lic);
    setTimeout(() => {
      if(!mp.players.exists(player)) return;
      if(examWaitList.get(player.id).start) return;
      player.notify("Şu anda mevcut eğitmen bulunmamaktadır. Sınav otomatik modda gerçekleşecektir")
      this.tehnicalStart(player, lic);
    }, 30000)
    
  }
  requestExam(player:PlayerMp, lic:string){
    if(!mp.players.exists(player)) return;
    // console.log("[AUTOSCHOOL] REQUEST EXAM")
    let getExam = false
    let name = user.getRpName(player);
    mp.players.forEach((target) => {
      if(user.isLogin(target)){
        if(user.get(target, 'fraction_id') == 17){
          if(target.dist(autoschoolPos) < 3000){
            user.accept(target, name+" denetçi̇ye i̇hti̇yaç var, Kategori "+this.getLicName(lic)).then(status => {
              if(!status) return;
              if(getExam) return target.notify("Sınav zaten başka biri tarafından kabul edilmiş")
              if(!mp.players.exists(player)) return target.notify("Bir oyuncu sunucudan ayrıldı")
              getExam = true;
              examWaitList.get(player.id).status = true;
              player.notify(user.getRpName(target)+" sana doğru geliyor, bekle");
            })
          }
        }
      }
    })
  }
  getLicName(type:string){
    if(type == "a") return "A";
    else if(type == "b") return "B";
    else if(type == "c") return "C";
    else if(type == "air") return "Авиа";
    else if(type == "ship") return "Su";
  }
  examsList(player:PlayerMp){
    // console.log("[AUTOSCHOOL] EXAMS LIST")
    let m = menu.new(player, "Sınav", "Liste");
    examWaitList.forEach((data, targetid) => {
      let target = mp.players.at(targetid);
      if(!mp.players.exists(target)){
        examWaitList.delete(targetid)
      } else {
        if(!data.start){
          m.newItem({
            name: user.getRpName(target),
            more: this.getLicName(data.lic),
            onpress: () => {
              if(target.dist(autoschoolPos) > 50){
                target.notify("Sürücü kursuna geri dön, eğitmen seni bekliyor.");
                player.notify(user.getRpName(target)+" sürücü okulundan ayrıldı, onu bekle");
                return;
              }
              if(target.id == player.id) return player.notify("~r~Kendi kendinize sınava giremezsiniz");
              this.tehnicalStart(target, data.lic, player);
            }
          })
        }
      }
    })
    m.open()
  }
  tehnicalStart(player:PlayerMp, lic:string, instructor?:PlayerMp){
    // console.log("[AUTOSCHOOL] TEHNICAL START")
    if(!examWaitList.has(player.id)) return;
    if(examWaitList.get(player.id).start) return;
    examWaitList.get(player.id).start = true;
    let tp:any;
    switch (lic) {
      case "a":
        tp = "bike";
        break;
      case "b":
        tp = "vehicle";
        break;
      case "c":
        tp = "truck";
        break;
      case "air":
        tp = "heli";
        break;    
    }
    let part = getParkPosition(new mp.Vector3(-797, -1304, 4), 100, tp);
    let parkPos = tp ? part : null
    let vehicle = newVeh(player, licVehs[lic], parkPos ? parkPos : randomArrayEl(licVehsPos[lic]))
    user.showLoadDisplay(player);
    if(instructor) user.showLoadDisplay(instructor);
    setTimeout(() => {
      if(!mp.players.exists(player)) return;
      if(instructor && !mp.players.exists(instructor)) return;
      if(!mp.vehicles.exists(vehicle)) return;
      player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
      if (instructor) instructor.putIntoVehicle(vehicle, RAGE_BETA ? 1 : 0);
      user.hideLoadDisplay(player);
      if(instructor) user.hideLoadDisplay(instructor);
      mp.events.callClient(player, "server:autoschool:practice", lic, vehicle.id, instructor ? true : false).then(async (status:boolean) => {
        // console.log("[AUTOSCHOOL] PRACTICE END")
        if(mp.players.exists(instructor) && instructor) status = await user.accept(instructor, "Başarılı bir teslimiyet mi?");
        player.autoschoolExam = null
        if(instructor) user.teleport(instructor, this.position.x, this.position.y, this.position.z);
        if(instructor && status) user.addCashMoney(instructor, lic.length == 1 ? licCost[lic]*0.5 : licCost[lic]*0.1);
        user.teleport(player, this.position.x, this.position.y, this.position.z);
        if(mp.vehicles.exists(vehicle)) 
        vehicle.destroy();
        if(!status) return player.notify("Stajınızı geçemediniz");
        user.set(player, lic+"_lic", 1);
        player.notify("Size bir kategori lisansı verildi "+lic);
        user.updateClientCache(player)
        user.questWorks(player)
        examWaitList.delete(player.id)
      });
    }, 1000)
  }
  starTheory(player: PlayerMp, lic: string){
    // console.log("[AUTOSCHOOL] START THEORY")
    if(schools.theoryMap.has(user.getId(player))) schools.theoryMap.delete(user.getId(player))
    menu.close(player);
    user.setGui(player, 'driving_school');
    this.theoryMap.set(user.getId(player), (status:boolean|number) => {
      if(typeof status == "number" && status == 2){
        user.addCashMoney(player, licCost[lic])
        player.notify("~g~Sınav ücretlerinizi iade ettik")
        player.autoschoolExam = null
        return
      }
      if(!status){
        player.notify('Teoriyi geçemediniz')
        player.autoschoolExam = null
      } else {
        this.starPractice(player, lic);
      }
    });
  }
}

setTimeout(() => {
  mp.events.register('client:autoschool:theory', (player:PlayerMp, status:boolean) => {
    if(!mp.players.exists(player)) return;
    if(!schools.theoryMap.has(user.getId(player))) return;
    schools.theoryMap.get(user.getId(player))(status);
    schools.theoryMap.delete(user.getId(player))
  })
  mp.events.register('client:autoschool:theory:close', (player:PlayerMp) => {
    if(!mp.players.exists(player)) return;
    if(!schools.theoryMap.has(user.getId(player))) return;
    // @ts-ignore
    schools.theoryMap.get(user.getId(player))(2);
    schools.theoryMap.delete(user.getId(player))
  })
}, 1000)





function newVeh(player:PlayerMp, car:string, spawn:{x:number;y:number;z:number;h:number;}){
  // console.log("[AUTOSCHOOL] NEW VEHICLE")
  let carConf = methods.getVehicleInfo(car);
  let vehicle = mp.vehicles.new(car, new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5), {
    locked: false,
    engine: true,
    heading: spawn.h
  })
  vehicle.setVariable('fuel', carConf.fuel_full);
  vehicle.position = new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5);
  vehicle.numberPlate = user.getId(player).toString()+" EX";
  vehicle.setColorRGB(255, 255, 255, 255, 255, 255);
  vehicles.setFuelFull(vehicle)
  vehicles.lockStatus(player, vehicle, false);
  vehicles.engineStatus(player, vehicle, true);
  setTimeout(() => {
    if(!mp.vehicles.exists(vehicle)) return;
    vehicle.position = new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5);
    setTimeout(() => {
      if (!mp.vehicles.exists(vehicle)) return;
      vehicle.position = new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5);
      vehicle.repair();
    }, 200)
  }, 200)
  return vehicle
}

chat.registerCommand("pointcatch", (player) => {
  if(!user.isAdminNow(player)) return;
  let points:{
    x:number;
    y:number;
    z:number;
    h:number;
  }[] = [];
  let m = menu.new(player, "İnşa etmek");
  m.newItem({
    name: "Yeni",
    onpress: () => {
      player.notify("Puan sayısı: "+points.push(player.vehicle ? {
        ...player.vehicle.position,
        h:player.vehicle.heading
      } : {
        ...player.position,
        h:player.heading
      }))
    }
  })
  m.newItem({
    name: "Kaydet",
    onpress: () => {
      methods.saveLog("pointCatch", JSON.stringify(points));
    }
  })
  m.open();
})
let schools = new autoschoolClass(autoschoolPos);


npc_dialog.new("Antonio", "Eğitmen", new mp.Vector3(-705.78, -1303.13, 5.11), 60.42, "ig_tomepsilon", (player) => {
  npc_dialog.open(player, `Merhaba. Neyle ilgilendiğinizi seçin`, ["San andreas trafik kuralları", "Trafik prosedürleri", "Genel kurallar", "Sürüşe başlama, manevra", "Trafik ışıkları ve gösterge işaretleri", "Sollama kuralları", "Yol işaretleri", "Dış ışıkların ve sesli sinyallerin kullanımı", "Hiçbir şey, teşekkürler"]).then(res => {
    let text = "";
    if(res == 0) text = `Karayolu trafik kuralları, yol kullanıcılarının sorumluluklarını düzenleyen kurallardır (araç sürücüleri, yolcuları, yayalar vb.), yol güvenliğini sağlamak için araçlara yönelik teknik gerekliliklerin yanı sıra.`;
    if(res == 1) text = `-  Araç trafiği sağdan akıyor.
    -  Tüm yol kullanıcıları, yol düzenleyicileri ve diğer kişiler karayolu trafik mevzuatının gerekliliklerine uymalı, trafikte dikkatli ve tedbirli olmalı ve tehlike ve zararı önlemek için trafiğin düzgün bir şekilde akmasını sağlamalıdır.
    `
    if(res == 2) text = `- Sadece 16 yaşından itibaren araba veya motosiklet kullanmak için eğitim alabilirsiniz.
    - Hareket etmeden, şerit değiştirmeden, dönmeden ve durmadan önce, sürücü yön gösterge ışığını kullanarak uygun yönü işaret etmekle yükümlüdür
    -  Mavi yanıp sönen ışığı ve özel bir ses sinyali olan bir araç yaklaştığında, sürücüler aracın engellenmeden geçmesine izin vermek için yol vermekle yükümlüdür. 
    - Araç sağ tekerleklerle dengesiz ve ıslak yol kenarına sürülürse, sağ ve sol tekerlekler arasındaki kavrama farkı nedeniyle savrulma riski vardır. Hız değiştirmeden, yani fren yapmak zorunda kalmadan, direksiyon simidini yumuşak bir şekilde çevirerek aracı tekrar yola yönlendirmeniz tavsiye edilir. Bu durumda fren yapmak aracın kaymasına neden olabilir.`;
    if(res == 3) text = `- Hareket etmeden, şerit değiştirmeden, dönmeden ve durmadan önce, sürücü yön gösterge ışığını kullanarak uygun yönü işaret etmekle yükümlüdür
    - Şerit değiştirirken, sürücü yön değiştirmeden karşı yönde seyreden araçlara yol vermelidir. Aynı anda şerit değiştirirken, sürücü sağdaki bir araca yol vermelidir
    - Bitişik bir alandan bir yola çıkarken, sürücü yolda seyreden araçlara ve yayalara ve bir yoldan çıkarken yollarını kestiği yayalara ve bisikletlilere yol vermelidir`
    if(res == 4) text = `Dairesel trafik ışığı sinyalleri aşağıdaki anlamlara sahiptir:
    - YEŞİL SİNYAL harekete izin verir;
    - Yanıp sönen YEŞİL ışık trafiğe izin verir ve bir yasaklama ışığının etkinleştirilmek üzere olduğunu bildirir
    - SARI yanıp sönen ışık trafiğe izin verir ve düzenlenmemiş bir kavşağı veya yaya geçidini bildirir, tehlikeye karşı uyarır;
    - Kırmızı ışık, yanıp sönme dahil, sürüşü yasaklar.`
    if(res == 5) text = `Sollamadan önce, sürücü aşağıdakilerden emin olmalıdır:
    - aynı şeritte öndeki aracın sürücüsü sola dönme (şerit değiştirme) niyetini belirtmemişse;
    - karşıdan gelen trafik şeridinin sollama için yeterli mesafede açık olması;
    -  aracınızın kimse tarafından sollanmaması.
    - Sollanan aracın sürücüsünün hızını artırarak veya diğer eylemlerle sollamayı engellemesi yasaktır.`
    if(res == 6) text = `Beyaz ve sarı çizgiler - Düz veya kesikli, tek veya çift olabilir. Şeritleri ve trafik akışını ayırmak için kullanılırlar.
    Sarı çizgiler - ters yönde seyreden araçların şeritlerini ayırır. Tek bir sarı çizgi de otoyoldaki kaldırımın sağ kenarını ayırabilir.
    Beyaz çizgiler - aynı yönde seyreden araçların şeritlerini ayırır. Tek bir sarı çizgi de otoyoldaki kaldırımın sağ kenarını ayırabilir.
    - Kesikli tek sarı çizgi - Öndeki bir aracı sollamadığınız sürece çizginin sağında kalın. Kesikli sarı çizgiyi yalnızca öndeki araçları güvenli bir şekilde sollamak için ve yol işaretinin gerektirmesi halinde bir kavşaktan geçerken geçebilirsiniz.
    - Kesikli çift sarı çizgi - Kesikli sarı çizginin sağındaki düz sarı çizgi, bu bölümde karşı şeritte sollamanın yasak olduğu anlamına gelir (kavşaklarda güvenli bir şekilde sola dönmek, şerit yön okunuz "sadece düz ileri" şeklinde bir yol işaretlemesi gerektiriyorsa kavşaklarda düz ileri gitmek hariç). Kesikli sarı çizgi düz sarı çizginin sağındaysa, öndeki aracı sollayabilir ve şeridinize geçebilirsiniz (düz sarı çizgiyi geçseniz bile).
    - Çift sarı çizgi - Yolun bu bölümünde sollama yapmak yasaktır. İlgili yol işaretinin izin vermesi halinde güvenli bir yaya geçidi dışında çift sarı çizgiyi geçmek yasaktır.
    - Kesikli beyaz çizgi - Tek yöndeki trafik şeritlerini ayırmak için kullanılır.
    - Kesikli beyaz çizgiyi geçmek güvenli bir manevra ise izin verilir.`
    if(res == 7) text = `-  Geceleri ve düşük görüş koşullarında, yol aydınlatmasından bağımsız olarak ve tünellerde hareket halindeki bir araçta aşağıdaki ışıklar yakılmalıdır:
    tüm motorlu araçlarda, sürüş veya kısa huzmeli farlar, bisikletlerde, farlar veya fenerler, atlı araçlarda, fenerler (varsa);
    - Uzun far kısa fara çevrilmelidir:
    Yerleşim alanlarında, yol aydınlatılmışsa;
    Karşıdan gelen trafikte, araçtan 150 metreden az olmayan bir mesafede veya karşıdan gelen aracın sürücüsü farları periyodik olarak değiştirerek buna ihtiyaç olduğunu belirtiyorsa daha uzak bir mesafede;
    diğer durumlarda hem karşıdan gelen hem de geçen araçların sürücülerinin gözlerinin kamaşmasını önlemek için.`
    if(!text) return npc_dialog.close(player);
    npc_dialog.open(player, gtaStrToHtml(text), ["Bilgi için teşekkür ederiz"])
  });
})

mp.events.add("playerJoin", (player:PlayerMp) => {
  player.autoschoolExam = null;
})