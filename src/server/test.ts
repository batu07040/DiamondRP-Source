import { menu } from "./modules/menu"
import { user } from "./user";
import { methods } from "./modules/methods";
import { socketInit } from "./socket";

mp.events.addRemoteCounted("server:user:testSetting", (player) => {
  let m = menu.new(player, "Deneysel/işlevsel olmayan", "Liste");
  if(!player.socket){
    m.newItem({
      name: "Socket.IO Veri iletimi",
      desc: "Protokol aracılıgıyla veri aktarımını etkinlestirin Socket",
      onpress: async () => {
        if(!user.isAdminNow(player)){
          let pass = await menu.input(player, "Yönetici tarafından verilen parolayı girin");
          if(!pass) return;
          if(pass != methods.sha256("SOCKET"+user.getId(player).toString()).slice(0, 5)) return player.notify("~r~Sifre dogru degil");
        }
        if(player.socket) return player.notify("~r~Socket.IO zaten açık");
        socketInit(player);
      }
    })
  }
  if(user.isAdminNow(player)){
    m.newItem({
      name: "Bir oyuncu icin parola olusturma",
      more: "Socket.IO",
      desc: "Etkinlestirmek icin bu parola gereklidir SocketIO",
      onpress: () => {
        menu.input(player, "Girin ID").then(ids => {
          if(!ids) return;
          menu.input(player, "Sifreyi kopyalayın ve oyuncuya gonderin", methods.sha256("SOCKET"+ids).slice(0, 5))
        })
      }
    })
    m.newItem({
      name: "Kayıt testi",
      onpress: () => { player.call('regtest')}
    })
    m.newItem({
      name: "PC testi",
      onpress: () => user.testPC(player)
    })
  }
  m.newItem({
    name: "Baglantı testi",
    more: "Ping",
    onpress: () => user.testNet(player)
  })

  m.open()
})