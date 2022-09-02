import { methods } from "../modules/methods";
import { menu } from "../modules/menu";
import { user } from "../user";
import { chat } from "../modules/chat";
import { shootingRecordsEntity } from "../modules/entity/shooting";
const POSITION = new mp.Vector3(-1754.93, 2926.23, 31.81)
const WEAPON_COST = 4000;
const AMMO_COST = 1000;
const WEAPON_COST_P = 2000;
const AMMO_COST_P = 750;

/** Ранг военного, который необходим чтобы выдавать разрешение на стрельбище */
const RANK_CAN_GIVE_ACCESS = 6;

let listTopString = ""
function updateTop3(player?:PlayerMp){
    shootingRecordsEntity.findAll({
        order: [
            ['count', 'ASC']
        ],
        limit: 5
    }).then(items => {
        if (player && !mp.players.exists(player)) return;
        let data: string[] = []
        items.map(res => {
            data.push(`${res.username} [${res.user}] -> ${(res.count / 1000).toFixed(2)}сек.`)
        })
        if (player) return player.call('updateshoottop3', [data])
        if (JSON.stringify(data) == listTopString) return;
        listTopString = JSON.stringify(data);
        mp.players.call('updateshoottop3', [data])
    })
    
}

mp.events.add("playerQuit", (player: PlayerMp) => {
    if (!player.startShootingEvent) return;
    player.dimension = 0;
    player.startShootingEvent = false;
});

mp.events.add('playerDeath', async function (player:PlayerMp) {
    if (!player.startShootingEvent) return;
    setTimeout(() => {
        player.spawn(new mp.Vector3(-1749.08, 2920.04, 31.81))
        player.dimension = 0;
        player.startShootingEvent = false;
    }, 1000)
});

mp.events.add("playerJoin", (player: PlayerMp) => {
    updateTop3(player)
})

const blip = mp.blips.new(119, POSITION, {
    dimension: 0,
    name: "Atış poligonu",
    scale: 0.7,
    color: 2,
    shortRange: true
})

setTimeout(() => {
    methods.createEnterCheckpoint(new mp.Vector3(-1744.65, 2941.65, 35.54), async player => {
        if (player.dimension == 0) return player.notify(`~r~Menzile girmeden önce testi rafın yakınında başlatmanız gerekir. Bu olmadan hedefler görünmeyecektir`)
        if(player.startShootingEvent) return player.notify(`~r~Testi sadece bitiş çizgisinde tamamlayabilirsiniz`)
        player.startShootingEvent = true;
        player.notify('~g~Zaman tükeniyor')
        const start = new Date().getTime();
        const status:boolean = await mp.events.callClient(player, 'shootingRangeWait');
        const end = new Date().getTime();
        player.startShootingEvent = false;
        player.dimension = 0;
        user.teleport(player, -1749.08, 2920.04, 31.81)
        if (!status) return player.notify(`~r~Testi geçemediniz`)
        
        let res = end - start;
        shootingRecordsEntity.findOne({where: {user: user.getId(player)}}).then(result => {
            if(!result){
                shootingRecordsEntity.create({
                    user: user.getId(player),
                    username: user.getRpName(player),
                    count: res
                }).then(() => {
                    updateTop3()
                })
                player.notify(`~g~İyi iş çıkardınız. ${(res / 1000).toFixed(2)}sn`)
            } else {
                if (result.count > res){
                    player.notify(`~g~İyi iş çıkardınız. ${(res / 1000).toFixed(2)}sn. Bu bir rekor. Önceki en iyi skorunuz: ${(result.count / 1000).toFixed(2)}sn.`)
                    result.count = res;
                    result.username = user.getRpName(player);
                    result.save().then(() => {
                        updateTop3()
                    });
                } else {
                    player.notify(`~g~İyi iş çıkardınız. ${(res / 1000).toFixed(2)}sn. En iyi skorunuz: ${(result.count / 1000).toFixed(2)}sn.`)
                }
            }
        })
    }, 1.5, -1)
    
    methods.createDynamicCheckpoint(POSITION, "Menüyü açmak için ~g~E~s~ tuşlarına basın", player => {
        let m = menu.new(player, "", "Atış poligonu")
        m.sprite = "shopui_title_gr_gunmod"
        m.newItem({
            name: "~b~Liderlik Tablosu",
            onpress: () => {
                shootingRecordsEntity.findAll({
                    order: [
                        ['count', 'ASC']
                    ],
                    limit: 50
                }).then(items => {
                    let submenu = menu.new(player, "İlk 50 lider");
                    shootingRecordsEntity.findOne({
                        where: {user: user.getId(player)}
                    }).then(me => {
                        if (me){
                            submenu.newItem({
                                name: `Sizin sonucunuz: ~b~${me.username} [${me.user}]`,
                                more: `${(me.count / 1000).toFixed(2)}сек.`
                            }) 
                        }
                        items.map(res => {
                            submenu.newItem({
                                name: `${res.username} [${res.user}]`,
                                more: `${(res.count / 1000).toFixed(2)}сек.`
                            })
                        })
                        submenu.open();
                    })
                })
            }
        })
        if(user.isUsmc(player) && user.isLeader(player)){
            m.newItem({
                name: "~r~Kayıt tablosunu temizleyin",
                onpress: () => {
                    user.accept(player, "Emin misin?").then(status => {
                        if(!status) return;
                        shootingRecordsEntity.destroy({where: {}}).then((cnt) => {
                            if(cnt == 0) return player.notify(`~r~Tablo zaten sıfırlanmış durumda`);
                            updateTop3()
                            player.notify(`~g~Tablo başarıyla sıfırlandı`);
                        })
                    })
                }
            })
        }
        if ((user.isUsmc(player) && user.getPlayerFractionRank(player) >= RANK_CAN_GIVE_ACCESS) || user.isAdminNow(player, 4)){
            m.newItem({
                name: "~b~Atış poligonu için izin belgesi düzenlemek",
                desc: "İzin 1 saat için verilmiştir",
                onpress: () => {
                    menu.selectNearestPlayers(player, 5).then(target => {
                        if (!target) return;
                        if(user.isUsmc(target)) return player.notify(`~r~Askeri bir kişinin atış poligonunu ziyaret etmek için özel bir izne ihtiyacı yoktur`);
                        if (target.shootingRangeAccess) return player.notify(`~r~Bir vatandaşın atış poligonunu ziyaret etmek için halihazırda geçici bir özel izni vardır`);
                        if (!user.get(target, "gun_lic")) return player.notify(`~r~Bir vatandaşın silah ruhsatı yoktur. Böyle bir kişiye ruhsat verilmemelidir`);
                        target.shootingRangeAccess = true;
                        target.notify(`~g~Atış poligonuna girmeniz için size geçici bir izin verildi`);
                        setTimeout(() => {
                            if(!mp.players.exists(target)) return;
                            target.notify(`~r~Atış poligonunu ziyaret etmek için verilen geçici iznin süresi doldu`)
                        }, 60 * 60000)
                    })
                }
            })
        }
        if(player.dimension == 0){
            m.newItem({
                name: "Testi başlatın",
                onpress: () => {
                    if (!user.get(player, "gun_lic")) return player.notify(`~r~Sadece silah ruhsatı olanlar katılabilir`)
                    if (!user.isUsmc(player) && !player.shootingRangeAccess) return player.notify(`~r~Atış poligonuna gitmek için izniniz yok`)
                    if(player.weaponsAll.length == 0) return player.notify(`~r~Başlamadan önce silahlarınızı kuşanmalısınız`)
                    if(player.vehicle) return player.notify(`~r~Nakliye sırasında değil`)
                    player.dimension = player.id + 1;
                    user.teleport(player, -1749.64, 2944.54, 32.81, 235.56)
                    player.notify('~g~Başlangıç noktasına ilerleyin ve başlayın.')
                    m.close()
                }
            })
        } else {
            m.newItem({
                name: "Testi tamamlayın",
                onpress: () => {
                    if (player.startShootingEvent) player.call('shootingRangeClose')
                    else player.dimension = 0;
                }
            })
        }
        m.newItem({
            name: "MP5 ve mühimmat",
            more: (WEAPON_COST + AMMO_COST)+"$",
            onpress: () => {
                if(!user.get(player, "gun_lic")) return player.notify(`~r~Sadece silah ruhsatı olanlar katılabilir`)
                if (!user.isUsmc(player) && !player.shootingRangeAccess) return player.notify(`~r~Atış poligonuna gitmek için izniniz yok`)
                if(player.weaponsAll.find(item => item.item == 103)){
                    if (user.getCashMoney(player) < AMMO_COST) return player.notify("Mühimmat almak için yeterli paranız yok")
                    user.removeMoney(player, AMMO_COST)
                    player.notify("Bir paket mühimmat aldınız.")
                } else {
                    if (user.getCashMoney(player) < (WEAPON_COST + AMMO_COST)) return player.notify("Silah ve mühimmat için yeterli paranız yok")
                    user.removeMoney(player, WEAPON_COST + AMMO_COST)
                    player.notify("Bir MP5 ve bir paket mühimmat aldınız.")
                }
                user.giveWeaponByHash(player, mp.joaat('WEAPON_SMG'), 200);
                m.close()
            }
        })
        m.newItem({
            name: "Silah ve mühimmat",
            more: (WEAPON_COST_P + AMMO_COST_P)+"$",
            onpress: () => {
                if(!user.get(player, "gun_lic")) return player.notify(`~r~Sadece silah ruhsatı olanlar katılabilir`)
                if (!user.isUsmc(player) && !player.shootingRangeAccess) return player.notify(`~r~Atış poligonuna gitmek için izniniz yok`)
                if(player.weaponsAll.find(item => item.item == 77)){
                    if (user.getCashMoney(player) < AMMO_COST_P) return player.notify("Mühimmat almak için yeterli paranız yok")
                    user.removeMoney(player, AMMO_COST_P)
                    player.notify("Bir paket mühimmat aldınız.")
                } else {
                    if (user.getCashMoney(player) < (WEAPON_COST_P + AMMO_COST_P)) return player.notify("Silah ve mühimmat için yeterli paranız yok")
                    user.removeMoney(player, WEAPON_COST_P + AMMO_COST_P)
                    player.notify("Bir silah ve bir paket mühimmat aldınız.")
                }
                user.giveWeaponByHash(player, mp.joaat('WEAPON_PISTOL'), 100);
                m.close()
            }
        })
        m.open()
    }, 2, -1)
}, 1000)

