/// <reference path="../declaration/client.ts" />

import {Container} from './modules/data';
import { methods } from './modules/methods';

let containerId = 99999;

let coffer = {
  addMoney: (money: number) => {
    mp.events.callSocket('server:coffer:addMoney', money);
  },
  
  removeMoney: (money: number) => {
    mp.events.callSocket('server:coffer:removeMoney', money);
  },
  
  setMoney: (money: number) => {
    mp.events.callSocket('server:coffer:setMoney', money);
  },
  
  getMoney: async () => {
    return methods.parseInt(await Container.Get(containerId, 'cofferMoney'));
  },
  
  getAllData: async () => {
    return await Container.GetAll(containerId);
  },
  
  getNalogBizz: async () => {
    return await Container.Get(containerId, 'cofferNalogBizz');
  },
  
  setNalogBizz: (num: any) => {
    Container.Set(containerId, 'cofferNalogBizz', num);
    methods.notifyWithPictureToAll(
      'Maze Bank',
      'Devlet Haberleri',
      `Isletme vergi orani: ~g~${num}%`,
      'CHAR_BANK_MAZE'
    );
  },
  
  setNalog: (num: any) => {
    Container.Set(containerId, 'cofferNalog', num);
    methods.notifyWithPictureToAll(
      'Maze Bank',
      'Devlet Haberleri',
      `Mevcut vergi orani: ~g~${num}%`,
      'CHAR_BANK_MAZE'
    );
  },
  
  setMoneyBomj: (num: any) => {
    Container.Set(containerId, 'cofferMoneyBomj', num);
    methods.notifyWithPictureToAll(
      'Maze Bank',
      'Devlet Haberleri',
      `El kitabi: ~g~$${num}`,
      'CHAR_BANK_MAZE'
    );
  },
  
  setMoneyOld: (num: any) => {
    Container.Set(containerId, 'cofferMoneyOld', num);
    methods.notifyWithPictureToAll(
      'Maze Bank',
      'Devlet Haberleri',
      `Emeklilik maasi: ~g~$${num}`,
      'CHAR_BANK_MAZE'
    );
  },
};

export { coffer };
