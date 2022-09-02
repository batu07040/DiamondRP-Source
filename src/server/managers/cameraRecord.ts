/// <reference path="../../declaration/server.ts" />

import { methods } from "../modules/methods"
import { menu } from "../modules/menu";
import { user } from "../user";
import { randomArrayEl } from "../../util/methods";
import { vehicles } from "../vehicles";
import { chat } from "../modules/chat";

chat.registerCommand('camera', (player) => {
  if (!user.isAdminNow(player)) return player.notify("Sadece yöneticiler tarafından kullanılabilir");
  cameraManager(player)
})
type cameraSettingsMode = "Normal" | "Araç İzle" | "Oyuncu İzle";
export interface cameraSettings {
  pos1: Vector3Mp;
  pos2: Vector3Mp;
  rot1: Vector3Mp;
  rot2: Vector3Mp;
  mode: cameraSettingsMode;
  target: number;
  fov: number;
  duration: number;
}

function cameraManager(player: PlayerMp, settings?: cameraSettings) {
  if (!settings && !player.cameraManagerSettings) settings = {
    pos1: null,
    pos2: null,
    rot1: null,
    rot2: null,
    mode: "Normal",
    target: null,
    fov: 50,
    duration: 5
  }; else if (player.cameraManagerSettings && !settings) settings = player.cameraManagerSettings
  player.cameraManagerSettings = settings
  let m = menu.new(player, "Kamera", "Ayarlar");
  let mods: cameraSettingsMode[] = ["Normal", "Araç İzle", "Oyuncu İzle"];
  if (mods.indexOf(settings.mode) == -1) settings.mode = "Normal";
  m.exitProtect = true;
  m.newItem({
    name: "Çalışma modu",
    type: "list",
    list: mods,
    listSelected: mods.indexOf(settings.mode),
    onchange: (value, item) => {
      player.notify("Kamera modu şu şekilde değiştirildi: " + item.listSelectedName)
      settings.mode = <cameraSettingsMode>item.listSelectedName;
      if (settings.target) {
        settings.target = null;
        player.notify("Gözetimin hedefi düşürüldü")
      }
      cameraManager(player, settings)
    }
  })
  m.newItem({
    name: "~r~Ayarları sıfırla",
    onpress: () => {
      user.accept(player, "Ayarları sıfırla?").then(status => {
        if (!status) return cameraManager(player, settings);
        settings = null
        player.cameraManagerSettings = null
        player.notify("Ayarlar sıfırlandı")
        cameraManager(player, settings)
      })
    }
  })
  m.newItem({
    name: "~b~İlk oda"
  })
  m.newItem({
    name: "Pozisyon",
    desc: "Şu anda bulunduğunuz yeri koordine edin",
    more: settings.pos1 ? "~g~Yüklendi" : "~r~Belirlenmemiş",
    onpress: () => {
      if (settings.pos1) {
        user.accept(player, "Sıfırlama noktası?").then(status => {
          if (!status) return cameraManager(player, settings);
          settings.pos1 = null
          player.notify("Kamera konumu sıfırlama")
          cameraManager(player, settings)
        })
      } else {
        settings.pos1 = new mp.Vector3(player.position.x, player.position.y, player.position.z)
        player.notify("Kamera konum ayarı")
        cameraManager(player, settings)
      }
    }
  })
  m.newItem({
    name: "Hedef",
    more: settings.rot1 ? "~g~Yüklendi" : "~r~Belirlenmemiş",
    onpress: () => {
      if (settings.rot1) {
        user.accept(player, "Sıfırlama noktası?").then(status => {
          if (!status) return cameraManager(player, settings);
          settings.rot1 = null
          player.notify("Kamera konumu sıfırlama")
          cameraManager(player, settings)
        })
      } else {
        mp.events.callClient(player, "camera:rotationCamera").then((pos) => {
          //console.log(pos)
          settings.rot1 = new mp.Vector3(pos.x, pos.y, pos.z)
          player.notify("Kamera konum ayarı")
          cameraManager(player, settings)
        })
      }
    }
  })
  m.newItem({
    name: "~b~Uç odası"
  })


  m.newItem({
    name: "Pozisyon",
    desc: "Koordinat, şimdi neredesin",
    more: settings.pos2 ? "~g~Yüklendi" : "~r~Belirlenmemiş",
    onpress: () => {
      if (settings.pos2) {
        user.accept(player, "Sıfırlama noktası?").then(status => {
          if (!status) return cameraManager(player, settings);
          settings.pos2 = null
          player.notify("Kamera konumu sıfırlama")
          cameraManager(player, settings)
        })
      } else {
        settings.pos2 = new mp.Vector3(player.position.x, player.position.y, player.position.z)
        player.notify("Kamera konum ayarı")
        cameraManager(player, settings)
      }
    }
  })
  m.newItem({
    name: "Hedef",
    more: settings.rot2 ? "~g~Yüklendi" : "~r~Не Yüklendi",
    onpress: () => {
      if (settings.rot2) {
        user.accept(player, "Kamera ayarlarını sıfırlamak istediğine emin misin?").then(status => {
          if (!status) return cameraManager(player, settings);
          settings.rot2 = null
          player.notify("Kamera konumu sıfırlandı.")
          cameraManager(player, settings)
        })
      } else {
        mp.events.callClient(player, "camera:rotationCamera").then((pos) => {
          //console.log(pos)
          settings.rot2 = new mp.Vector3(pos.x, pos.y, pos.z)
          player.notify("Kamera konumu ayarlandı.")
          cameraManager(player, settings)
        })
      }
    }
  })
  m.newItem({
    name: "Gözetimin amacı",
    more: settings.target ? "~g~Ayarlandı" : "~r~Ayarlanması Gerekiyor",
    onpress: () => {
      if (settings.mode == "Araç İzle") {
        menu.input(player, "Araç Plakası Girin").then(plate => {
          let veh = vehicles.findVehicleByNumber(plate);
          if (!veh) return player.notify("Araç tespit edilemedi.");
          settings.target = veh.id;
          cameraManager(player, settings)
        })
      } else if (settings.mode == "Oyuncu İzle") {
        menu.input(player, "Oyuncu ID Girin").then(ids => {
          let target = user.getPlayerById(methods.parseInt(ids));
          if (!target) return player.notify("Oyuncu tespit edilemedi.");
          settings.target = target.id;
          cameraManager(player, settings)
        })
      } else {
        settings.target = null;
        player.notify("Geçeriz bir seçim yaptınız. İzleme ayarlarınız sıfırlandı.")
        cameraManager(player, settings)
      }
    }
  })
  m.newItem({
    name: "Fov",
    more: settings.fov,
    onpress: () => {
      menu.input(player, "Fov girin").then(ids => {
        settings.fov = methods.parseInt(ids);
        cameraManager(player, settings)
      })
    }
  })
  m.newItem({
    name: "Süre",
    more: settings.duration,
    desc: "Saniyeler içinde",
    onpress: () => {
      menu.input(player, "Süreyi saniye cinsinden girin").then(ids => {
        settings.duration = methods.parseInt(ids);
        cameraManager(player, settings)
      })
    }
  })
  m.newItem({
    name: "Kamera Açın",
    onpress: () => {
      if (!settings.pos1 && !settings.pos2) return player.notify("Lütfen kamera ayarlarını düzgün yapın.");
      m.close();
      mp.events.callClient(player, "camera:start", settings).then(() => {
        cameraManager(player, settings)
      });
    }
  })
  m.open();
}