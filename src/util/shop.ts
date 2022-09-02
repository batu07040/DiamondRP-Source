import { itemCosts, weaponCost } from "./sharedData";

export type ShowItem = [number, number];
export type ShowItemElectro = [number, number, number?, string?];
/**
 * ID Предмета, Стоимость
 */
export const shopList: ShowItem[] = [
    [275, 700],
    [280, itemCosts.Bag],
    [284, itemCosts.BagSmall],
    [6, 120],
    [251, 500],
    [59, 350],
    // [279, 10000],
]
/**
 * ID Предмета, Стоимость
 */
export const shopListElectro: ShowItemElectro[] = [
    [8, 200, 8, 'IFruit'],
    [20008, 1500, 8, 'IFruit X'],
    [10008, 600, 8, 'Invader'],
    [2820000, 2500, 282],
    [7, 350],
    [59, 350],
    [47, 1099],
]


//Silah Adı - ID - Fiyat - Lisans Gerekli Olup Olmadığı - Silah,Mermi Adeti
export type gunItem = [string, number, number, boolean, number];
export const gunShopList: gunItem[] = [
    ["P99", 71, weaponCost.P99, true, 1],
    ["Taurus PT92", 77, weaponCost.Taurus, true, 1],
    ["Av Tüfeği", 87, weaponCost.Obrez, true, 1],
    ["Pompalı", 90, weaponCost.BenelliM3, true, 1],
    ["Mühimmat Kutusu 5.56mm", 30, weaponCost.box556, false, 260],
    ["Mühimmat Kutusu 7.62mm", 29, weaponCost.box556, false, 130],
    ["Mühimmat Kutusu 9mm (Tabanca)", 27, weaponCost.box9pistol, false, 140],
    ["Mühimmat Kutusu 9mm (SMG)", 153, weaponCost.box9smg, false, 140],
    ["Mühimmat Kutusu 12.7mm", 146, weaponCost.box127, false, 60],
    ["Mühimmat Kutusu 18.5mm", 28, weaponCost.box185, false, 60],

]
