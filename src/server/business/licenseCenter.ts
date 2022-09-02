/// <reference path="../../declaration/server.ts" />


import { methods } from '../modules/methods';
import { pickups } from '../modules/pickups';
import { coffer } from '../coffer';
import { user } from '../user';



export let licenseCenter = {
  checkPosForOpenMenu: function (player:PlayerMp) {
    //   methods.debug('licenseCenter.checkPosForOpenMenu');
      let playerPos = player.position;
      if(methods.distanceToPos(playerPos, pickups.LicBuyPos) < 2.0){
          player.call('client:menuList:showLicBuyMenu');
      }
  },
  
  buy: function(player:PlayerMp, type:any, price:number)
  {
      methods.debug('licenseCenter.buy');
      if (!user.isLogin(player))
          return;
  
      if (price < 1)
          return;
  
      try {
          if (user.get(player, 'reg_status') == 0)
          {
              player.notify('~r~Kaydınız yok');
              player.notify('~r~(M - GPS - Önemli yerler - Hükümet binası)');
              return;
          }
  
          if (!user.get(player, type))
          {
              if (user.getMoney(player) < price)
              {
                  player.notify("~r~Yeterli paranız yok");
                  return;
              }
              user.set(player, type, true);
              user.removeMoney(player, price);
              coffer.addMoney(price);
  
              player.notify("~g~Lisans alımınız için tebrikler");
              return;
          }
          player.notify("~r~Bu lisansa zaten sahipsiniz");
      }
      catch (e) {
          methods.debug('Exception: licenseCenter.buy');
          methods.debug(e);
      }
  }
};
