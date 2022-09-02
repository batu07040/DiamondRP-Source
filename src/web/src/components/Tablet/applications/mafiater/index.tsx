import Iframe from 'react-iframe'



import React, { Component } from 'react';
import { mafiaTerritoriesData } from '../../../../../../util/mafiaData';
import { iconsItems } from '../../../../api/inventoryIcon';
import { getItemNameById } from '../../../../../../util/inventory';
import Loading from '../../../Loading';
import { CEF } from 'api';

interface MafiaTerData {
    mafiaWarownerId?:number;
    mafiaWarownerName?:string;
    mafiaWarmoney?:number;
    access?:boolean;
}

interface TabletCarsState {
    selected?: number;
    items: MafiaTerData[];
    loaded: boolean;
    subleader: boolean;
    leader: boolean;
}



export default class TabletMafiaTer extends Component<{ test?: boolean }, TabletCarsState>{
    ev: RegisterResponse;
    constructor(props: any) {
        super(props);
        this.state = {
            items: [],
            loaded: false,
            subleader: false,
            leader: false,
        }
        this.ev = mp.events.register('tablet:mafia:data', (items: MafiaTerData[], subleader:boolean, leader:boolean) => {
            this.setState({ items, loaded: true, selected: null, subleader,leader})
        })
        mp.events.triggerServer('tablet:mafia:data:load')
    }
    componentWillUnmount(){
        if(this.ev) this.ev.destroy()
    }
    selectTer(id: number) {
        if (this.state.selected === id) this.setState({ selected: null })
        else this.setState({ selected: id })
    }
    getSelectedTer(){
        return mafiaTerritoriesData[this.state.selected]
    }
    getSelectedTerData(){
        return this.state.items[this.state.selected]
    }
    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }

    render() {
        if (!this.state.loaded) return (<><Loading loading="Uygulama yükleniyor" /></>);
        return (<div className="container chest-block">
            <div className="row title-gov chest-title">
                Alan kontrolü
            </div>
            <div className="row">
                <div className="col-lg-4 cars-list" style={{ height: "720px"}}>
                    {mafiaTerritoriesData.map((item, id) => {
                        return <div className="card-car hoverable" style={{
                            boxShadow: this.state.selected == id ? '0 0 20px rgba(0, 0, 0, 1)' : null
                        }} onClick={e => {
                            e.preventDefault();
                            this.selectTer(id)
                        }}>
                            <div className="card-image">
                                <img src={require('./pos'+(id+1)+".png")} />
                            </div>
                                <span className="card-title">{item.name} <label className="grey-text text-lighten-3"></label></span>
                        </div>
                    })}
                </div>
                <div className="col-lg-8">
                    <br />
                    {typeof this.state.selected == "number" ? <>
                    <div className="content">
                        <h2 style={{textAlign: "center"}}>Bilgi</h2><br/>
                            <div className="row">
                                <div className="col-lg-4" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}><b>Gelir</b></div>
                                <div className="col-lg-8" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}>${this.getSelectedTer().cost}</div>
                            </div>
                            <div className="row">
                                <div className="col-lg-4" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}><b>Ünvan</b></div>
                                <div className="col-lg-8" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}>{this.getSelectedTer().name}</div>
                            </div>
                            <div className="row">
                                <div className="col-lg-4" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}><b>Tanım</b></div>
                                <div className="col-lg-8" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}>{this.getSelectedTer().desc}</div>
                            </div>
                            <div className="row">
                                <div className="col-lg-4" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}><b>İzleme</b></div>
                                <div className="col-lg-8" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}>{this.getSelectedTerData().mafiaWarownerName}</div>
                            </div>
                            {this.getSelectedTerData().access ? <div className="row">
                                <div className="col-lg-4" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}><b>Banka</b></div>
                                <div className="col-lg-8" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}>{this.getSelectedTerData().mafiaWarmoney}</div>
                            </div> : ''}
                            
                            {(this.getSelectedTerData().access && this.state.leader) ? <div className="row">
                                <div className="col-sm-4"><input className="form-control" type="number" id="takebank" /></div>
                                <div className="col-sm-8"><button className="btn btn-success btn-lg btn-block" onClick={(e) => {
                                    // @ts-ignore
                                    let sum = parseInt(document.getElementById('takebank').value);
                                    if (isNaN(sum) || sum < 1 || sum > this.getSelectedTerData().mafiaWarmoney) return CEF.alert.setAlert('error', "Miktar doğru değil")
                                    mp.events.triggerServer('server:mafiaWar:takeBank', this.state.selected + 1, sum);
                                }}>Bankadan para çekme</button></div>
                            </div> : ''}
                            <button className="btn btn-info btn-lg btn-block" onClick={(e) => {
                                mp.events.triggerServer('tablet:mafiater:pos', this.state.selected)
                            }}>Navigasyon</button>
                            {this.state.subleader ? <button className="btn btn-danger btn-lg btn-block" onClick={(e) => {
                                mp.events.triggerServer('server:mafiaWar:attack', this.state.selected)
                            }}>Nöbeti başlatın</button> : ""}
                            
                    </div>
                        
                        
                        
                        <hr />
                    </> : <h2 style={{ textAlign: "center" }}>Verilerin görüntüleneceği alanı seçin</h2>}
                </div>
            </div>
        </div>);
    }

}