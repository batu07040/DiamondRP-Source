import Iframe from 'react-iframe'



import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import InputRange from 'react-input-range';
import Loading from '../../../Loading';

interface User {
    name: string;
    id: number;
}

interface TabletChestState {
    users: User[]
    have: boolean;
    loaded: boolean;
    cost: number;
    owner: string;
    adress: string;
    id: number;
    canedit: boolean;
    hasPin: boolean;
}

export default class TabletAppart extends Component<{ test?: boolean }, TabletChestState>{
    ev: RegisterResponse;
    ev2: RegisterResponse;
    constructor(props: any) {
        super(props);
        this.state = this.props.test ? {
            id: 1,
            cost: 100000,
            adress: "gasgasg",
            owner: "gasgasg",
            users: [

            ],
            loaded: true,
            have: true,
            canedit: true,
            hasPin: true,
        } : {
            id: 0,
            cost: 0,
            adress: "",
            owner: "",
            users: [],
            loaded: false,
            have: false,
            canedit: false,
            hasPin: false,
        }
        this.ev = mp.events.register('tablet:appart', (users: User[], id: number, cost: number, adress: string, owner: string, canedit: boolean, hasPin: boolean) => {
            this.setState({ users, id, cost, adress, owner, loaded: true, have: true, canedit, hasPin })
        })
        this.ev2 = mp.events.register('tablet:appartno', () => {
            this.setState({ loaded: true, have: false, hasPin: false })
        })
    }
    digitFormat(number: number) {
        return ("0" + number).slice(-2);
    }
    tmToDate(timestamp: number) {
        let dateTime = new Date(timestamp * 1000);
        return `${this.digitFormat(dateTime.getDate())}/${this.digitFormat(dateTime.getMonth() + 1)}/${dateTime.getFullYear()} ${this.digitFormat(dateTime.getHours())}:${this.digitFormat(dateTime.getMinutes())}`
    }
    componentDidMount() {
        mp.events.triggerServer('tablet:appart:load')
    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy()
        if (this.ev2) this.ev2.destroy()
    }
    numberFormat(currentMoney: number) {
        if (currentMoney == undefined || currentMoney == null) {
            currentMoney = 0;
        }

        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }

    updatePin() {
        let pin = parseInt(document.getElementById('pin1').value)
        if (!document.getElementById('pin1').value.isNumberOnly() || isNaN(pin) || pin < 0 || pin > 99999) return CEF.alert.setAlert("error", `~r~Bir şifre belirleyin 1-99999`)
        mp.events.triggerServer('tablet:appart:updatePin', pin)
    }
    deletePin() {
        mp.events.triggerServer('tablet:appart:deletePin')
    }




    render() {
        if (!this.state.loaded) return <Loading loading="Uygulama yükleniyor" />;
        if (!this.state.have) return <div className="alert alert-danger" role="alert">
            Herhangi bir daire veya eve sahip değilsin.
        </div>;
        return (<div className="container chest-block">
            <div className="row title-gov chest-title">
                Daireler
            </div>
            <div className="row">
                <div className="col-lg-5">
                    <div className="table-chest-left">
                        <img src={require('../menu/icons/appart.png')} />
                        <hr />
                        <div className="chest-block-title">Bilgi</div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Fiyat</b></div>
                            <div className="col-lg-6">{this.numberFormat(this.state.cost)}</div>
                        </div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Mal sahibi</b></div>
                            <div className="col-lg-6">{this.state.owner}</div>
                        </div>
                        {/* <div className="row chest-description">
                            <div className="col-lg-6"><b>Адрес</b></div>
                            <div className="col-lg-6">{this.state.adress}</div>
                        </div> */}
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Numara</b></div>
                            <div className="col-lg-6">No{this.state.id}</div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7">
                    {(this.state.canedit && this.state.hasPin) ? <div className="table-chest-left">
                        <div className="chest-block-title">Giriş Kontrol</div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Pin Kodunu Değiştir</b></div>
                            <div className="col-lg-3"><input id="pin1" type="password" className="form-control" /></div>
                            <div className="col-lg-3"><button onClick={e => {
                                e.preventDefault();
                                this.updatePin()
                            }} className="btn btn-info">Değiştir</button></div>
                        </div>
                        <div className="row chest-description">
                            <button onClick={e => {
                                e.preventDefault();
                                this.deletePin()
                            }} className="btn btn-danger btn-block">Pin Kodunu Kaldır</button>
                        </div>
                    </div> : ''}


                    <div className="table-chest-left">
                        <div className="chest-block-title">Sakinlerin Listesi</div>
                        {this.state.users.map(item => {
                            return <div className="row chest-description">
                                <div className="col-lg-3">#{item.id}</div>
                                <div className="col-lg-9"><b>{item.name}</b></div>
                            </div>
                        })}

                    </div>
                </div>
            </div>
        </div>);
    }

}