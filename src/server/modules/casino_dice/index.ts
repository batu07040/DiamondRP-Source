import { user } from '../../user';
import { methods } from '../methods';
import * as pokerHelpers from '../casino_threecard_poker/helpers';
import * as pokerData from '../casino_threecard_poker/threeCardPokerData';
import { casino_business_id } from '../casino_roulette';
import { business } from '../../business';
import { levelAccess } from '../../../util/level';

const vdist = (v1: Vector3Mp, v2: Vector3Mp, useZ = true): number => {
  const diffY = v1.y - v2.y;
  const diffX = v1.x - v2.x;

  if (useZ) {
    const diffZ = v1.z - v2.z;
    return Math.sqrt((diffY * diffY) + (diffX * diffX) + (diffZ * diffZ));
  } else {
    return Math.sqrt((diffY * diffY) + (diffX * diffX));
  }
};

const calculateAttachPosition = (position: Vector3Mp, rotation: Vector3Mp, offset: Vector3Mp) => {
  const _rotation = new mp.Vector3(rotation.x / 180 * Math.PI, rotation.y / 180 * Math.PI, rotation.z / 180 * Math.PI);
  const cos_rx = Math.cos(_rotation.x);
  const cos_ry = Math.cos(_rotation.y);
  const cos_rz = Math.cos(_rotation.z);
  const sin_rx = Math.sin(_rotation.x);
  const sin_ry = Math.sin(_rotation.y);
  const sin_rz = Math.sin(_rotation.z);

  return new mp.Vector3(
    position.x + offset.x * cos_ry * cos_rz - offset.x * sin_rx * sin_ry * sin_rz - offset.y * cos_rx * sin_rz + offset.z * sin_ry * cos_rz + offset.z * sin_rx * cos_ry * sin_rz,
    position.y + offset.x * cos_ry * sin_rz + offset.x * sin_rx * sin_ry * cos_rz + offset.y * cos_rx * cos_rz + offset.z * sin_ry * sin_rz - offset.z * sin_rx * cos_ry * cos_rz,
    position.z - offset.x * cos_rx * sin_ry + offset.y * sin_rx + offset.z * cos_rx * cos_ry
  );
};

const enterDealerJob = new mp.Vector3(1088.071, 219.4176, -50.2);



const diceTables: any = [];

const createTable = (position: Vector3Mp, heading: number) => {
  const table: any = {
    position,
    heading,
    currentState: 0,
    currentBet: 0,
    players: new Map(),
    dealer: null,
    dealerPosition: calculateAttachPosition(position, new mp.Vector3(0, 0, heading), new mp.Vector3(0, 1, -0.1)),
    usedSits: new Map()
  };

  methods.createDynamicCheckpoint(table.dealerPosition, 'Tıklayın ~g~Е~s~ krupiye olarak yer almak', (player: PlayerMp) => {});
  methods.createDynamicCheckpoint(position, 'Tıklayın ~g~Е~s~ zar oynamak için', (player: PlayerMp) => {}, 2, 0, [0,0,0,0]);
  diceTables.push(table);

  return table;
};

createTable(new mp.Vector3(1148.837, 269.747, -52.84095), -134.6906604);
createTable(new mp.Vector3(1151.84, 266.747, -52.84095), 45.3093566);
createTable(new mp.Vector3(1144.429, 247.3352, -52.041), 135.3094387);
createTable(new mp.Vector3(1129.406, 262.3578, -52.041), 135.3094387);

const DICE_DATA = [1, 2, 3, 4, 5, 6];
methods.createDynamicCheckpoint(enterDealerJob, "Tıklayın ~g~Е~s~ krupiye olarak iş bulmak için", player => {
  if (player.dealerJobActive) {
    if(player.weaponsAll.length > 0) return player.notify(`~r~Silahı kıyafetten çıkarın`)
    player.dealerJobActive = false;

    if (player.dealerJobTable) {
      player.dealerJobTable.dealer = null;
      player.dealerJobTable = null;
    }

    user.resetCustomization(player);
    player.notify(`Krupiyelik işini bıraktın!`);

    return true;
  }

  if(user.getLevel(player) < levelAccess.diceWork) return player.notify("~r~Şunlara sahip olmak gereklidir "+levelAccess.diceWork+" seviye")

  if(player.weaponsAll.length > 0) return player.notify(`~r~Silahı kıyafetten çıkarın`)
  player.dealerJobActive = true;
  player.notify(`Krupiye olarak iş bulmuşsun!`);
  if(user.getSex(player) == 1) user.applyCustomization(player, {"components":[[0,0,0],[1,0,0],[3,0,0],[4,6,0],[5,0,0],[6,19,3],[7,0,0],[8,24,0],[9,0,0],[10,0,0],[11,28,9]],"props":[[0,-1,-1],[1,-1,-1],[2,-1,-1]]})
  else user.applyCustomization(player, {"components":[[0,0,0],[1,0,0],[3,0,0],[4,10,0],[5,0,0],[6,15,0],[7,36,0],[8,7,0],[9,0,0],[10,0,0],[11,40,0]],"props":[[0,8,0],[1,0,0],[2,2,0]]})

});

export const pressE = (player: PlayerMp) => {
  if (player.dealerJobTable) {
    if (player.dealerJobTable.currentState !== 0) {
      player.outputChatBox(`Oyun devam ediyor, bekleyin.`);
      return;
    }

    player.call('casino.dice.client.stopDealer');

    for (const [targetPlayer, targetPlayerInfo] of player.dealerJobTable.players) {
      if (!mp.players.exists(targetPlayer)) {
        player.dealerJobTable.players.delete(targetPlayer);
        player.dealerJobTable.usedSits.delete(targetPlayer);
        continue;
      }

      targetPlayer.call('casino.dice.client.stop');
      targetPlayer.outputChatBox(`Krupiye masanın arkasından çıktı.!`);
      targetPlayer.currentDiceTable = null;

      if (targetPlayerInfo.betActive && player.dealerJobTable.currentState === 0) {
        user.addChips(targetPlayer, player.dealerJobTable.currentBet);
      }
    }

    player.dealerJobTable.currentBet = 0;
    player.dealerJobTable.players.clear();
    player.dealerJobTable.dealer = null;
    player.dealerJobTable = null;
    player.exitCasinoWait = Date.now() + 2000;

    return true;
  }

  if (player.currentDiceTable) {
    if (player.currentDiceTable.currentState !== 0) {
      player.outputChatBox(`Oyun devam ediyor, bekleyin.`);
      return;
    }

    for (const [targetPlayer, targetPlayerInfo] of player.currentDiceTable.players) {
      if (targetPlayer.id == player.id && targetPlayerInfo.betActive && player.currentDiceTable.currentState === 0) {
        user.addChips(targetPlayer, player.currentDiceTable.currentBet);
      }
      continue;
    }

    player.currentDiceTable.players.delete(player);
    player.currentDiceTable.usedSits.delete(player);

    for (const targetPlayer of player.currentDiceTable.players.keys()) {
      if (!mp.players.exists(targetPlayer)) {
        player.currentDiceTable.players.delete(targetPlayer);
        player.currentDiceTable.usedSits.delete(player);
        continue;
      }

      targetPlayer.call('casino.dice.client.removePlayer', [player]);
    }

    if (mp.players.exists(player.currentDiceTable.dealer)) {
      player.currentDiceTable.dealer.call('casino.dice.client.removePlayer', [player]);
    }



    player.currentDiceTable = null;
    player.exitCasinoWait = Date.now() + 2000;
    player.call('casino.dice.client.stop');
    return true;
  }

  if (player.exitCasinoWait && player.exitCasinoWait >= Date.now()) {
    return true;
  }

  for (let i = 0; i < diceTables.length; i++) {
    const table = diceTables[i];

    if (vdist(player.position, table.dealerPosition) <= 1.2) {
      if (!player.dealerJobActive) {
        player.outputChatBox(`Çalışmaya başlamadan önce krupiye olarak bir iş bulmanız gerekir.`);
        return true;
      }

      if (table.dealer) {
        player.outputChatBox(`Bu işyeri dolu.`);
        return true;
      }

      player.dealerJobTable = table;
      table.dealer = player;
      table.currentBet = 0;

      player.call('casino.dice.client.startDealer', [i]);

      return true;
    }

    const sitPositions = [
      calculateAttachPosition(table.position, new mp.Vector3(0, 0, table.heading), new mp.Vector3(-1.3, 0, 0)),
      calculateAttachPosition(table.position, new mp.Vector3(0, 0, table.heading), new mp.Vector3(-0.4877952745, -0.7133464511, 0)),
      calculateAttachPosition(table.position, new mp.Vector3(0, 0, table.heading), new mp.Vector3(0.480708, -0.721220, 0)),
      calculateAttachPosition(table.position, new mp.Vector3(0, 0, table.heading), new mp.Vector3(1.2153543, -0.0042913, 0))
    ];

    const dist = vdist(player.position, table.position);

    const sits = [];

    if (dist <= 2.2) {
      for (let j = 0; j < sitPositions.length; j++) {
        const sitPosition = sitPositions[j];
        const distSit = vdist(player.position, sitPosition);

        if (distSit <= 2) {
          sits.push([j, distSit, i]);
        }
      }
    }

    const sortedSitPositions = sits.sort((a, b) => a[1] - b[1]);

    if (sortedSitPositions.length) {
      const [sortedSitPositionId, _, tableId] = sortedSitPositions[0];

      const table = diceTables[tableId];

      let isSitUsed = false;

      for (const [_, sitIndex] of table.usedSits) {
        if (sitIndex === sortedSitPositionId) {
          player.outputChatBox(`Bu koltuk alındı`);
          isSitUsed = true;
          return true;
        }
      }

      if (isSitUsed) {
        return true;
      }

      if (!table.dealer) {
        player.outputChatBox(`Bu masada krupiye yok!`);
        return true;
      }

      if (table.players.size >= 4) {
        player.outputChatBox('Tüm koltuklar dolu');
        return true;
      }

      player.currentDiceTable = table;

      const sendedPlayers = [];

      for (const [targetPlayer, targetPlayerInfo] of table.players) {
        if (targetPlayerInfo.betActive) {
          sendedPlayers.push(targetPlayer);
        }
      }

      table.players.set(player, {
        betActive: false
      });

      player.call('casino.dice.client.start', [tableId, sortedSitPositionId, table.currentBet, table.currentState, Date.now() - table.endSpinTime, ...sendedPlayers]);

      return true;
    }
  }

  return false;
};

mp.events.add('playerQuit', (player) => {
  if (player.dealerJobTable) {
    const table = player.dealerJobTable;

    for (const [targetPlayer, targetPlayerInfo] of table.players) {
      if (!mp.players.exists(targetPlayer)) {
        table.players.delete(targetPlayer);
        table.usedSits.delete(targetPlayer);
        continue;
      }

      targetPlayer.call('casino.dice.client.stop');
      targetPlayer.outputChatBox(`Krupiye masanın arkasından çıktı.!`);
      targetPlayer.currentDiceTable = null;

      if (targetPlayerInfo.betActive && table.currentState === 0) {
        user.addChips(targetPlayer, table.currentBet);
      }
    }

    table.currentBet = 0;
    table.players.clear();
    table.dealer = null;
  }

  if (player.currentDiceTable) {
    const table = player.currentDiceTable;

    table.players.delete(player);
    table.usedSits.delete(player);

    for (const targetPlayer of table.players.keys()) {
      if (!mp.players.exists(targetPlayer)) {
        table.players.delete(targetPlayer);
        table.usedSits.delete(targetPlayer);
        continue;
      }

      targetPlayer.call('casino.dice.client.removePlayer', [player]);
    }

    if (mp.players.exists(table.dealer)) {
      table.dealer.call('casino.dice.client.removePlayer', [player]);
    }
  }
});

mp.events.add('casino.dice.server.changeBet', (player, changedBet) => {
  if (!player.dealerJobTable) {
    player.call('casino.dice.client.changeBet.response', [false]);
    return;
  }

  if (changedBet <= 0) {
    player.call('casino.dice.client.changeBet.response', [false]);
    player.outputChatBox(`Bahis miktarı 0 olamaz`);
    return;
  }

  const table = player.dealerJobTable;

  let isAnySetBets = false;

  for (const [targetPlayer, playerInfo] of table.players) {
    if (playerInfo.betActive) {
      isAnySetBets = true;
      return;
    }
  }

  if (isAnySetBets) {
    player.call('casino.dice.client.changeBet.response', [false]);
    return;
  }

  table.currentBet = changedBet;

  for (const targetPlayer of table.players.keys()) {
    if (!mp.players.exists(targetPlayer)) {
      table.players.delete(targetPlayer);
      table.usedSits.delete(targetPlayer);
      continue;
    }

    targetPlayer.call('casino.dice.client.changeBet', [changedBet]);
  }

  player.call('casino.dice.client.changeBet.response', [true]);
});

mp.events.add('casino.dice.server.spin', (player) => {
  if (!player.dealerJobTable) {
    player.call('casino.dice.client.spin.response', [false]);
    return true;
  }

  const table = player.dealerJobTable;

  const activePlayers = [];

  for (const [player, playerInfo] of table.players) {
    if (playerInfo.betActive) {
      activePlayers.push(player);
    }
  }

  if (activePlayers.length < 2) {
    player.call('casino.dice.client.spin.response', [false]);
    player.outputChatBox(`Oyunu başlatmak için çok az katılımcı!`);
    return;
  }

  table.currentState = 1;

  for (const targetPlayer of table.players.keys()) {
    if (!mp.players.exists(targetPlayer)) {
      table.players.delete(targetPlayer);
      table.usedSits.delete(targetPlayer);
      continue;
    }

    targetPlayer.call('casino.dice.client.spin');
  }

  player.call('casino.dice.client.spin.response', [true]);

  table.endSpinTime = Date.now() + 10000;

  setTimeout(() => {
    try {
      let betsBalance = 0;

      const usedScores = new Set();

      const players: {playerInstance: PlayerMp; score: number;}[] = [];

      for (const [targetPlayer, targetPlayerInfo] of table.players) {
        if (!mp.players.exists(targetPlayer)) {
          table.players.delete(targetPlayer);
          table.usedSits.delete(targetPlayer);
          continue;
        }

        if (targetPlayerInfo.betActive) {
          betsBalance += table.currentBet;

          let score = Math.floor(Math.random() * 21) + 1;

          while(usedScores.has(score)) {
            score = Math.floor(Math.random() * 21) + 1;
          }

          usedScores.add(score);

          players.push({
            playerInstance: targetPlayer,
            score
          });
        }

        targetPlayerInfo.betActive = false;

        targetPlayer.call('casino.dice.client.clear');
      }

      const [winner, ...otherPlayers] = players.sort((a, b) => b.score - a.score);
      const dealerSalary = Math.floor(betsBalance * 1 / 100);
      const remainderBalance = Math.floor(betsBalance * 90 / 100);

      const dealerMoney = Math.floor(dealerSalary * 100);
      user.addMoney(player, dealerMoney);
      user.log(player, "Casino", `bayi geliri ${dealerMoney}$`)
      player.notify(`~g~Sende var. 1% kazanan tekliften: ${dealerSalary}`);

      business.addMoney(casino_business_id, Math.floor((betsBalance * 100) * 2 / 100));

      for (let i = 0; i < players.length; i++) {
        const {playerInstance, score} = players[i];

        if (winner.playerInstance === playerInstance) {
          playerInstance.notify(`~g~Potun %90'ını kazandınız (%2 krupiye): ${remainderBalance}. Dışarı ${score}.`);
          user.addChips(playerInstance, remainderBalance);
          user.log(playerInstance, "Casino", ` zarların %90'ını kazandı : ${remainderBalance}. Dışarı ${score}.`)
        } else {
          playerInstance.notify(`~r~Bahsi kaybettin. Bırakıldı ${score}.`);
        }
      }

      if (mp.players.exists(player)) {
        player.call('casino.dice.client.clear');
      }

      table.currentBet = 0;
      table.currentState = 0;
    } catch (e) {
      console.error(e);
    }
  }, 10000);
});

mp.events.add('casino.dice.server.setBet', (player) => {
  if (!player.currentDiceTable) {
    player.call('casino.dice.client.setBet.response', [false]);
    return;
  }

  const table = player.currentDiceTable;

  if (table.currentBet <= 0) {
    player.call('casino.dice.client.setBet.response', [false]);
    return;
  }

  if (table.currentState !== 0) {
    player.call('casino.dice.client.setBet.response', [false]);
    return;
  }

  if (player.chipsBalance - table.currentBet < 0) {
    player.call('casino.dice.client.setBet.response', [false]);
    return;
  }

  const playerInfo = table.players.get(player);

  if (playerInfo.betActive) {
    player.call('casino.dice.client.setBet.response', [false]);
    return;
  }

  user.removeChips(player, table.currentBet);
  playerInfo.betActive = true;

  if (table.dealer && mp.players.exists(table.dealer)) {
    table.dealer.call('casino.dice.client.addPlayer', [player]);
  }

  for (const targetPlayer of table.players.keys()) {
    if (!mp.players.exists(targetPlayer)) {
      table.players.delete(targetPlayer);
      table.usedSits.delete(targetPlayer);
      continue;
    }

    targetPlayer.call('casino.dice.client.addPlayer', [player]);
  }

  player.call('casino.dice.client.setBet.response', [true]);
});
