import Iframe from 'react-iframe'



import React, { Component } from 'react';
import { mafiaCarsConf, MafiaCar } from '../../../../../../util/mafiaData';
import { iconsItems } from '../../../../api/inventoryIcon';
import { getItemNameById } from '../../../../../../util/inventory';
import { fractionUtil } from '../../../../../../util/fractions';
import { gangDeliverCost, gangDeliverReward } from '../../../../../../util/gang.deliver';

interface Car {
    model: string;
    name: string;
    slot: number;
    plate: string;
    cost: number;
    costDeliver: number;
    fuelMax: number;
    fuelPer: number;
    bag: number;
    autopilot: boolean;
}

interface TabletCarsState {
    selected?: number;
    gang?:boolean;
    mafia?:boolean;
}

export default class TabletGangDeliver extends Component<{ test?: boolean, fractionid:number }, TabletCarsState>{
    constructor(props: any) {
        super(props);
        let fractiondata = fractionUtil.getFraction(this.props.fractionid)
        this.state = {
            mafia: !!fractiondata.mafia, gang: !!fractiondata.gang
        }
    }
    selectCar(id: number) {
        if (this.state.selected === id) this.setState({ selected: null })
        else this.setState({ selected: id })
    }
    getSelectedCar(){
        return mafiaCarsConf[this.state.selected]
    }
    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }

    render() {
        return (<div className="container chest-block">
            <div className="row title-gov chest-title">
                Minibüs taşımacılığı
            </div>
            <div className="row">
                <div className="col-md-6">
                    Bu uygulama aracılığıyla çeşitli minibüsler için teslimat siparişleri alabilirsiniz. Görev basit: minibüse ulaşmak ve polislere yakalanmadan teslim etmek. Teslimattan önce, sizden aşağıdaki tutarda bir depozito alınacaktır ${this.numberFormat(gangDeliverCost)}, ve teslimattan sonra size ${this.numberFormat(gangDeliverReward)}. Teslimatta zaman sınırı yoktur, önemli olan oraya güvenli bir şekilde ulaştırmaktır.
                </div>
                <div className="col-md-6">
                    <button className="btn btn-success btn-block btn-lg" onClick={(e) => {
                        e.preventDefault()
                        mp.events.triggerServer('tablet:gangcar:order')
                    }}>Teslimat için sipariş alın</button>
                </div>
                
            </div>
        </div>);
    }

}