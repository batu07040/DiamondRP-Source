import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import Loading from '../../../Loading';
import DOMPurify from 'dompurify'
interface GovData {
    block?:string;
    money: number;
    cofferMoneyBomj: number;
    cofferNalogBizz: number;
    cofferMoneyOld: number;
    cofferNalog: number;
    canEdit: boolean;
    loaded: boolean;
    donators: [string, number][];
    news: { title: string, text: string, author: string, time: string }[]
}

function b64DecodeUnicode(str:string) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

export default class TabletGov extends Component<{ test?: boolean }, GovData>{
    ev: RegisterResponse;
    sum: React.RefObject<HTMLInputElement>;
    constructor(props: any) {
        super(props);
        this.ev = mp.events.register("tablet:gov:data", (
            money: number, 
            cofferMoneyBomj: number, 
            cofferNalogBizz: number, 
            cofferMoneyOld: number, 
            cofferNalog: number, 
            canEdit: boolean, 
            donators: [string, number][], 
            news: {
                title: string;
                text: string;
                author: string;
                time: string;
            }[]
            ) => {
            this.setState({ 
                money, 
                cofferMoneyBomj, 
                cofferNalogBizz, 
                cofferMoneyOld, 
                donators, 
                cofferNalog, 
                canEdit, 
                news, 
                loaded: true 
            })
        })
        this.sum = createRef()
        if (this.props.test) {
            this.state = {
                news: [], donators: [], money: 1000000, cofferMoneyBomj: 10, cofferNalogBizz: 10, cofferMoneyOld: 10, cofferNalog: 10, canEdit: true, loaded: true
            }
            for (let q = 0; q < 15; q++) this.state.donators.push(["UserName_" + q, (q + 1) * 10000])
        } else {
            this.state = { news: [], donators: [], money: 0, cofferMoneyBomj: 0, cofferNalogBizz: 0, cofferMoneyOld: 0, cofferNalog: 0, canEdit: false, loaded: false }
        }
        
        
    }
    componentDidMount(){
        mp.events.triggerServer('tablet:gov:load')
    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy();
    }

    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }

    setParam(type:string){
        const param = parseInt(this.sum.current.value)
        if (isNaN(param) || param < 0) return CEF.alert.setAlert('error', "Parametre doğru belirtilmemiş");
        mp.events.triggerServer('tablet:gov:setParam', type, param)
    }

    putMoney(){
        const sum = parseInt(this.sum.current.value)
        if(isNaN(sum) || sum < 0) return CEF.alert.setAlert('error', "Miktar doğru değil");
        mp.events.triggerServer('tablet:gov:putMoney', sum)
    }

    takeMoney() {
        const sum = parseInt(this.sum.current.value)
        if (isNaN(sum) || sum < 0) return CEF.alert.setAlert('error', "Miktar doğru değil");
        mp.events.triggerServer('tablet:gov:takeMoney', sum)
    }

    render() {
        if (!this.state.loaded) return <Loading loading="Uygulama yükleniyor" />;
        return (<>
            <div className="row">
                <div className="content">
                    <div className="col-sm-8 title-gov"><img src={require('../menu/icons/government.png')} alt="" /> Devlet yönetimi</div>
                </div>
            </div>
            <br />
            <div className="row">
                <div className="content" style={{ marginLeft: "20px" }}>
                    <div className="col-md-3"><div className="nalog-item">Vergi oranı <p>{this.state.cofferNalog}%</p></div></div>
                    <div className="col-md-3"><div className="nalog-item">İşletmeler üzerine bahisler <p>{this.state.cofferNalogBizz}%</p></div></div>
                    <div className="col-md-3"><div className="nalog-item">El Kitabı <p>${this.numberFormat(this.state.cofferMoneyBomj)}</p></div></div>
                    <div className="col-md-3"><div className="nalog-item">Emeklilik maaşı <p>${this.numberFormat(this.state.cofferMoneyOld)}</p></div></div>
                </div>
            </div>
            <br />
            <div className="row">
                {/* <div className="content"> */}
                <div className="col-xs-5">
                    <div className="tablet-gov1in2 tablet-gov1in22">
                        <h2>Devlet bütçesi</h2>
                        <div className="tablet-gov-money">${this.numberFormat(this.state.money)}</div>
                        {this.state.canEdit ? <>
                        <br/>
                        <button className="btn btn-success btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'put') this.setState({ block: null })
                            else this.setState({ block: 'put' })
                        }}>Devlet kasasına koyun</button>
                        <button className="btn btn-danger btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'take') this.setState({ block: null })
                            else this.setState({ block: 'take' })
                        }}>Devlet kasasından para çekme</button>
                        </>: ''}
                    </div>
                    <div className="tablet-gov1in2 tablet-gov1in22">
                        <h2>En İyi 15 Bağış</h2>
                        <br />
                        {this.state.donators.sort((a, b) => {
                            return b[1] - a[1]
                        }).map((item, id) => {
                            return <div className="row gov-donator">
                                <div className="col-sm-2">#{(id + 1)}</div>
                                <div className="col-sm-5">{item[0]}</div>
                                <div className="col-sm-5"><span>${this.numberFormat(item[1])}</span></div>
                            </div>
                        })}
                    </div>
                </div>
                <div className="col-xs-7">
                    {this.state.canEdit ? <><div className="tablet-gov1in2">
                        <h2>Yönetim</h2>
                        <br />
                        <button className="btn btn-warning btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'nalog') this.setState({ block: null })
                            else this.setState({ block: 'nalog' })
                        }}>Vergi oranını değiştirin</button>
                        <button className="btn btn-warning btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'biz') this.setState({ block: null })
                            else this.setState({ block: 'biz' })
                        }}>İşletmeler üzerindeki vergi oranını değiştirin</button>
                        <button className="btn btn-info btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'bomj') this.setState({ block: null })
                            else this.setState({ block: 'bomj' })
                        }}>İşsizlik ödeneğinizin miktarını değiştirin</button>
                        <button className="btn btn-info btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'old') this.setState({ block: null })
                            else this.setState({ block: 'old' })
                        }}>Emekli maaşı ödemelerinin miktarının değiştirilmesi</button>
                        {this.state.block == 'nalog' ? <>
                            <h3>Vergi oranını değiştirin</h3>
                            <input type="text" defaultValue={this.state.cofferNalog.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Tutarı girin"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('nalog')
                            }}>Kapat</button>
                        </> : ''}
                        {this.state.block == 'biz' ? <>
                            <h3>İşletmeler üzerindeki vergi oranını değiştirin</h3>
                            <input type="text" defaultValue={this.state.cofferNalogBizz.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Tutarı girin"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('biz')
                            }}>Kapat</button>
                        </> : ''}
                        {this.state.block == 'bomj' ? <>
                            <h3>İşsizlik ödeneğinizin miktarını değiştirin</h3>
                            <input type="text" defaultValue={this.state.cofferMoneyBomj.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Tutarı girin"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('bomj')
                            }}>Kapat</button>
                        </> : ''}
                        {this.state.block == 'old' ? <>
                            <h3>Emekli maaşı ödemelerinin miktarının değiştirilmesi</h3>
                            <input type="text" defaultValue={this.state.cofferMoneyOld.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Tutarı girin"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('old')
                            }}>Kapat</button>
                        </> : ''}
                        {this.state.block == 'take' ? <>
                        <h3>Devlet kasasından para çekme</h3>
                            <input type="text" ref={this.sum} className="primary-input wide mb10" placeholder="Tutarı girin"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.takeMoney()
                            }}>Kapat</button>
                        </> : ''}
                        {this.state.block == 'put' ? <>
                        <h3>Devlet kasasına yatır.</h3>
                            <input type="text" ref={this.sum} className="primary-input wide mb10" placeholder="Tutarı girin"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.putMoney()
                            }}>Kapat</button>
                        </> : ''}
                    </div><br /></> : ''}
                    
                    <div className="tablet-gov1in2">
                        <h2>Resmi Haberler</h2>
                        <br />
                        {this.state.news.map(item => {
                            return <div className="gov-new-item">
                                <div className="row">
                                        <div className="title">{item.title}</div>
                                        <div><span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(b64DecodeUnicode(item.text).replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;quot;/gi, '"')) }} /></div>
                                </div>

                                <p>Yazar: {item.author}</p>
                                <small>(( Tarih: {item.time} ))</small>
                            </div>
                        })}
                    </div>
                </div>

                {/* </div> */}
            </div>
            <br />
        </>);
    }

}