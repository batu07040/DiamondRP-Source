import React, { Component, createRef } from 'react';
export default class HelpMe extends Component<{ tracking: boolean }, { list: [string, number, boolean][] }>{
  id: React.RefObject<HTMLInputElement>;
  reason: React.RefObject<HTMLTextAreaElement>;
  ev: RegisterResponse;
  constructor(props: any) {
    super(props);
    this.state = {list: []}
    this.ev = mp.events.register('tablet:gpshelp:list', (list:[string,number,boolean][]) => {
      this.setState({list});
    })
    mp.events.triggerServer('tablet:gpshelp:list:load')
  }
  send() {
    mp.events.triggerServer('tablet:gos:tracking')
  }
  track(id:number) {
    mp.events.triggerServer('tablet:gos:trackingid', id)
  }
  render() {
    return (
      <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
        <h2 className="mini-title">İzlemeyi etkinleştirme</h2>
        <h3>Etkinleştirildiğinde, coğrafi konumunuz diğer üyelere yayınlanır</h3>
        <div className="button-center">
          {this.props.tracking ? <button className="btn btn-danger btn-lg btn-block" onClick={(e) => {
            e.preventDefault();
            this.send()
          }}>Kapat</button> : <button className="btn btn-success btn-lg btn-block" onClick={(e) => {
            e.preventDefault();
            this.send()
          }}>Aç</button>}
        </div>
        <br/>
        {this.state.list.map(item => {
          return <div className="row">
            <div className="col-sm-8">{item[0]}</div>
            <div className="col-sm-4"><button className="btn btn-info btn-lg btn-block" onClick={(e) => {
              e.preventDefault();
              this.track(item[1])
            }}>{item[2] ? 'Kapat' : 'Aç'}</button></div>
          </div>
        })}
      </div>
    )
  }
}