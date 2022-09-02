import { fractionList } from "../../../../../../util/fractions";

export interface ApplicationAppStore {
    name:string;
    descShort:string;
    desc:string;
    icon:string;
    page:string;
    cost?:number;
    installed?:boolean;
    fractions?:number[];
}
export const applicationsList: ApplicationAppStore[] = [
    { installed: true, icon: "gangmap", name: "Bölge haritası", page: "gangmap", descShort: "Haberler ve bilgi", desc: "Haberler ve bilgi", fractions: fractionList.filter(item => item.gang).map(item => {return item.id}) },
    { installed: true, icon: "gangmap", name: "Topraklar", page: "gangcontrol", descShort: "Haberler ve bilgi", desc: "Haberler ve bilgi", fractions: fractionList.filter(item => item.gang).map(item => { return item.id }) },
    { installed: true, icon: "government", name: "Devletin resmi internet sitesi", page: "government", descShort: "Haberler ve bilgi", desc: "Haberler ve bilgi" },
    { installed: true, icon: "radio", name: "Radyo", page: "radio", descShort: "Her yerde en iyi müziği dinleyin", desc: "Her yerde en iyi müziği dinleyin" },
    { installed: true, icon: "cars", name: "Ulaşım", page: "cars", descShort: "Özel araç yönetimi", desc: "Özel araç yönetimi" },
    // { installed: true, icon: "browser", name: "Браузер", page: "browser", descShort: "Доступ к интернет паутине", desc: "Доступ к интернет паутине" },
    { installed: true, icon: "stocks", name: "Depo", page: "chest", descShort: "Kendi deponuzun yönetimi", desc: "Kendi deponuzun yönetimi" },
    { installed: true, icon: "house", name: "Ev", page: "house", descShort: "Kendi evinizin yönetimi", desc: "Kendi evinizin yönetimiм" },
    { installed: true, icon: "appart", name: "Apartman Dairesi", page: "appart", descShort: "Kendi evinizin yönetimi", desc: "Kendi evinizin yönetimi" },
    { installed: true, icon: "condo", name: "Daire", page: "condo", descShort: "Kendi evinizin yönetimi", desc: "Kendi evinizin yönetimi" },
    { installed: true, icon: "mafiacars", name: "Arabalar", page: "mafiacar", descShort: "Kendi evinizin yönetimi", desc: "Kendi evinizin yönetimi", fractions: fractionList.filter(item => item.mafia || item.gang).map(item => { return item.id }) },
    { installed: true, icon: "gangdeliver", name: "Minibüsle teslimat", page: "gangdeliver", descShort: "Kendi evinizin yönetimi", desc: "Kendi evinizin yönetimi", fractions: fractionList.filter(item => item.mafia || item.gang).map(item => { return item.id }) },
    { installed: true, icon: "mafiater", name: "Topraklar", page: "mafiater", descShort: "Kendi evinizin yönetimi", desc: "Kendi evinizin yönetimi", fractions: fractionList.filter(item => item.mafia).map(item => { return item.id }) },
    { installed: true, icon: "appart", name: "İşletme", page: "business", descShort: "Kendi işletmenizin yönetimi", desc: "Kendi işletmenizin yönetimi" },
    // { installed: true, icon: "appstore", name: "AppStore", page: "appstore", descShort: "Установка приложений", desc: "Найдите и установите приложение, которое вам может пригодится" },
]