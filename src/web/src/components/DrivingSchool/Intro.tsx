import React, { Component } from 'react';
import { CEF } from 'api';
import art from './imgs/autoschool-art.png';
import close from './imgs/close.svg';

interface IntroProps {
  go(): void;
}

class Intro extends Component<IntroProps, any> {
  componentWillMount() {
    document.addEventListener('keydown', this.close.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.close.bind(this));
  }

  close(e: any) {
    if (e.keyCode == 27) {
      mp.events.triggerServer('client:autoschool:theory', false);
      CEF.gui.setGui(null);
    }
  }

  render() {
    return (
      <section className="section-view autoschool-section">
        <div className="box-white box-autoschool posrev">
          <i className="close" style={{ marginRight: 10 }}>
            <img src={close} onClick={() => [CEF.gui.setGui(null), mp.events.triggerServer('client:autoschool:theory:close')]} />
          </i>
          <i className="autoschool-art">
            <img src={art} alt="" />
          </i>
          <div className="autoschool-header">
            <div className="title-wrap m0">
              <h2>
                Surucu kursuna hosgeldin
              </h2>
              <p>
               Surucu belgesi alabilmek icin
                <br />
                bu adimlari izlemeniz gerekiyor:
              </p>
            </div>
          </div>
          <div className="white-box-content schoolauto">
            <ul className="list-line mb30">
              <li>Yazili kurallara hakim olun.</li>
              <li>Yazili kurallardan olusan bir sinava girin.</li>
              <li>Surus testini gecin</li>
            </ul>
            <ul className="list-circle mb30">
              <li>
                Yazili sinavda 14 soru mevcuttur.
                <br />
                En az 12 soruyu dogru cevaplamalisiniz.
              </li>
              <li>
                Pratik kismi gecmek icin belirli rotada,
                <br />
               surucu kursunun araci ile surus yapmalisin.
              </li>
              {/* <li>
                После успешной сдачи,
                <br />с вашего счета спишется оплата за экзамен.
              </li> */}
            </ul>
            <button className="primary-button go-quiz" onClick={this.props.go}>
              <span>Sinavi Gec</span>
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default Intro;
