import { giftpos } from "../../util/pickup.gift";
import { user } from "../user";
import { methods } from "../modules/methods";

export const PICKUP_10 = 5000
export const PICKUP_30 = 15000
export const PICKUP_50 = 30000

mp.events.add('holidayPickups:server', (player:PlayerMp, index:number) => {
  if (player.shootingPickups.indexOf(index) > -1) return;
  player.shootingPickups.push(index);
  player.notify("~g~Bir koleksiyon parçası buldunuz");
  if (player.shootingPickups.length == 10) user.addCashMoney(player, PICKUP_10), player.notify("~g~On ürün için bir ödül aldınız");
  if (player.shootingPickups.length == 30) user.addCashMoney(player, PICKUP_30), player.notify("~g~Toplam 30 madde için ödül aldınız");
  if (player.shootingPickups.length == 50) user.addCashMoney(player, PICKUP_50), player.notify("~g~Ödül olarak 50 ürün aldınız");
});


mp.events.add('playerJoin', (player:PlayerMp) => {
  // player.call('3vv', [(!methods.isTestServer() || player.socialClub == "Grand72rus") ? JSON.stringify(giftpos) : "[]"]);
  player.call('3vv', ["[]"]);
});