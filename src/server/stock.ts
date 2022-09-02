/// <reference path="../declaration/server.ts" />

import { Container } from './modules/data';
import { methods } from './modules/methods';
import { user } from './user';
import { coffer } from './coffer';
import { stocksEntity, logStockEntity } from './modules/entity/stockEntity';

let hPos = new Map();

export let stock = {
    pcPos: new mp.Vector3(1088.792, -3101.406, -39.96338),
    stockPos: new mp.Vector3(1095.231, -3098.371, -39.99991),
    exitPos: new mp.Vector3(1104.422, -3099.484, -39.99992),
    loadAll: function () {
        methods.debug('stock.loadAll');

        // methods.createStaticCheckpointV(stock.pcPos, "Нажмите ~g~Е~s~ чтобы открыть меню");
        methods.createStaticCheckpointV(stock.stockPos, "Menüyü açmak için ~g~Е~s~ tuşuna basınız.");
        methods.createStaticCheckpointV(stock.exitPos, "Menüyü açmak için ~g~Е~s~ tuşuna basınız.");
        stocksEntity.findAll().then(rows => {
            rows.forEach(function (item) {

                Container.Set(400000 + methods.parseInt(item.id), 'id', item.id);
                Container.Set(400000 + methods.parseInt(item.id), 'address', item.address);
                Container.Set(400000 + methods.parseInt(item.id), 'price', item.price);
                Container.Set(400000 + methods.parseInt(item.id), 'user_id', item.user_id);
                Container.Set(400000 + methods.parseInt(item.id), 'user_name', item.user_name);
                Container.Set(400000 + methods.parseInt(item.id), 'pin1', item.pin1);
                Container.Set(400000 + methods.parseInt(item.id), 'pin2', item.pin2);
                Container.Set(400000 + methods.parseInt(item.id), 'pin3', item.pin3);
                Container.Set(400000 + methods.parseInt(item.id), 'x', item.x);
                Container.Set(400000 + methods.parseInt(item.id), 'y', item.y);
                Container.Set(400000 + methods.parseInt(item.id), 'z', item.z);

                let pos = new mp.Vector3(parseFloat(item.x), parseFloat(item.y), parseFloat(item.z));
                methods.createStaticCheckpointV(pos, "Menüyü açmak için ~g~Е~s~ tuşuna basınız.");
                hPos.set(item.id, pos);
            });
            methods.debug('All Stock Loaded: ' + rows.length);
        })
    },

    getData: function (id: number) {
        return Container.GetAll(400000 + methods.parseInt(id));
    },

    get: function (id: number, key: any) {
        return Container.Get(400000 + methods.parseInt(id), key);
    },

    getAll: function () {
        // methods.debug('stock.getAll');
        return hPos;
    },

    updateOwnerInfo: function (id: number, userId: number, userName: string) {
        methods.debug('stock.updateOwnerInfo');
        id = methods.parseInt(id);
        userId = methods.parseInt(userId);

        Container.Set(400000 + id, "user_name", userName);
        Container.Set(400000 + id, "user_id", userId);




        if (userId == 0) {
            stocksEntity.update({
                pin1: 0,
                pin2: 0,
                pin3: 0,
                money_tax: 0,
                user_name: userName,
                user_id: userId,
            }, { where: { id: id } })

            Container.Set(400000 + id, "pin1", 0);
            Container.Set(400000 + id, "pin2", 0);
            Container.Set(400000 + id, "pin3", 0);
        } else {
            stocksEntity.update({
                money_tax: 0,
                user_name: userName,
                user_id: userId,
            }, { where: { id: id } })
        }
    },

    updatePin1: function (id: number, pin: number) {
        methods.debug('stock.updatePin1');
        id = methods.parseInt(id);
        pin = methods.parseInt(pin);
        Container.Set(400000 + id, 'pin1', pin);
        stocksEntity.update({
            pin1: pin,
        }, { where: { id: id } })
    },

    updatePin2: function (id: number, pin: number) {
        methods.debug('stock.updatePin2');
        id = methods.parseInt(id);
        pin = methods.parseInt(pin);
        Container.Set(400000 + id, 'pin2', pin);
        stocksEntity.update({
            pin2: pin,
        }, { where: { id: id } })
    },

    getPin1: function (id: number): number {
        return Container.Get(400000 + id, 'pin1');
    },

    getPin2: function (id: number): number {
        return Container.Get(400000 + id, 'pin2');
    },

    getPin3: function (id: number): number {
        return Container.Get(400000 + id, 'pin3');
    },

    updatePin3: function (id: number, pin: number) {
        methods.debug('stock.updatePin3');
        id = methods.parseInt(id);
        pin = methods.parseInt(pin);
        Container.Set(400000 + id, 'pin3', pin);
        stocksEntity.update({
            pin3: pin,
        }, { where: { id: id } })
    },

    sell: function (player: PlayerMp) {
        methods.debug('stock.sell');
        if (!user.isLogin(player))
            return;

        if (user.get(player, 'stock_id') == 0) {
            player.notify('~r~Bir depoya sahip değilsin.');
            return;
        }

        let hInfo = stock.getData(user.get(player, 'stock_id'));
        let nalog = methods.parseInt(hInfo.get('price') * (100 - coffer.get('cofferNalog')) / 100);

        user.set(player, 'stock_id', 0);

        stock.updateOwnerInfo(hInfo.get('id'), 0, '');

        coffer.removeMoney(nalog);
        user.addMoney(player, nalog);

        user.log(player, "PlayerBuy", `Depoyu sattı ${hInfo.get('address')} @stock${hInfo.get('id')} за $${nalog}`)

        setTimeout(function () {
            if (!user.isLogin(player))
                return;
            user.addHistory(player, 3, 'Depoyu sattı ' + hInfo.get('address') + ' №' + hInfo.get('id') + '. Fiyat: $' + methods.numberFormat(nalog));
            player.notify('~g~Depo satış işlemi tamamlandı.');
            player.notify(`~g~Vergi:~s~ ${coffer.get('cofferNalog')}%\n~g~Fiyat:~s~ $${methods.numberFormat(nalog)}`);
            user.saveAccount(player);
        }, 1000);
    },

    buy: function (player: PlayerMp, id: number) {
        methods.debug('stock.buy');

        if (!user.isLogin(player))
            return;

        let hInfo = stock.getData(id);
        if (user.get(player, 'stock_id') > 0) {
            player.notify('~r~Zaten bir depoya sahipsiniz.');
            return false;
        }
        if (hInfo.get('price') > user.getMoney(player)) {
            player.notify('~r~Paranız yeterli değil.');
            return false;
        }
        if (hInfo.get('user_id') > 0) {
            player.notify('~r~Mülk zaten satın alınmış.');
            return false;
        }

        user.set(player, 'stock_id', id);

        stock.updateOwnerInfo(id, user.get(player, 'id'), user.get(player, 'rp_name'));

        coffer.addMoney(hInfo.get('price'));
        user.removeMoney(player, hInfo.get('price'));

        user.log(player, "PlayerBuy", `Bir depo satın aldı. Adres: (${hInfo.get('address')} @stock${hInfo.get('id')}) Fiyat: $${hInfo.get('price')}`)

        setTimeout(function () {
            if (!user.isLogin(player))
                return;
            user.addHistory(player, 3, 'Bir depo satın aldı . Adres: ' + hInfo.get('address') + ' №' + hInfo.get('id') + '. Fiyat: $' + methods.numberFormat(hInfo.get('price')));
            user.saveAccount(player);
            player.notify('~g~Tebrikler. Artık bir depoya sahipsin.');
        }, 500);
        return true;
    },

    addLog: function (name: string, text: string, stockId: number) {
        methods.debug('stock.addLog');
        logStockEntity.create({
            name, do: text, stock_id: stockId, timestamp: methods.getTimeStamp()
        })
    },
    getLog: function (stockId: number, limit = 10): Promise<{ name: string; do: string; stock_id: number; id: number; timestamp: number; }[]> {
        return new Promise((resolve, reject) => {
            methods.debug('stock.getLogs', stockId);
            logStockEntity.findAll({
                where: { stock_id: stockId },
                order: [["id", "DESC"]],
                limit
            }).then(data => {
                resolve(data)
            });
        })
    }
};