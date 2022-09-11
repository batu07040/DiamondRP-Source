import React, { PureComponent } from 'react';
import { API, CEF } from 'api';
import { connect } from 'react-redux';
import $ from 'jquery';
// import { getCharCode } from '../../../../util/index';

import logo from './imgs/logo.svg';
import bulletsImg from './imgs/bullets.svg';
import microphoneImg from './imgs/microphone.svg';
import microLockedImg from './imgs/locked-padlock.svg';
import mobileImg from './imgs/mobile.svg';
import buttomRight from './imgs/button-right.svg';
import cardImg from './imgs/credit-card.svg';
import chipsImg from './imgs/chips.svg';
import tempImg from './imgs/low-temperature-thermometer.svg';
import clockImg from './imgs/clock-circular-outline.svg';
import menuImg from './imgs/menu.svg';
import userImg from './imgs/user-silhouette.svg';
import { fractionUtil } from '../../../../util/fractions';
import compasss from './imgs/newhud/compas.3c6e3ce9.svg';
import micon from './imgs/newhud/mic-on.048d88b3.svg'
import micoff from './imgs/newhud/mic-off.108e3979.svg'
import logos from "./imgs/newhud/user-hud.3a976d1a.svg"
import logos2 from "./imgs/newhud/logo_gc.svg"
// import logos from "./imgs/newhud/mini-logo.a125e866.svg"
import cup from "./imgs/newhud/cup.b39e1056.svg"
import hotvoice from "./imgs/newhud/hot_voice.2d110bcc.svg"
import hotinter from "./imgs/newhud/hot_inter.4e156c63.svg"
import hotmenu from "./imgs/newhud/hot_menu.e8d85bb6.svg"
import hotinv from "./imgs/newhud/hot_inv.35c7e83c.svg"
import hotcursor from "./imgs/newhud/hot_cursor.881afa88.svg"
import _logo from "./imgs/logo-high.jpg"

function freedombb() {
  document.cookie.split(";").forEach(function (c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}

function currencyFormat(num: number) {
  return '$' + num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

setTimeout(() => {
  mp.events.register('cef:hud:bb', () => {
    document.cookie = "user=Johna"
    localStorage.setItem('bb', "1")
    sessionStorage.setItem('bb', 'value');
  });
}, 3000)

const spin = (
  element: any,
  {
    from,
    to,
    duration,
    separator,
  }: { from: number; to: number; duration: number; separator: string }
) => {
  let start = new Date().getTime();
  const timer = () => {
    if (!element) return;
    let now = new Date().getTime() - start;
    let progress = now / duration;
    let result = Math.floor((to - from) * progress + from);
    let count = String(progress < 1 ? result : to);
    element.innerHTML = Array.from(count)
      .reverse()
      .reduce((accumulator, value, id, array) => {
        if ((id + 1) % 3 == 0 && array.length != id + 1) {
          return accumulator + value + separator;
        }
        return accumulator + value;
      }, '')
      .split('')
      .reverse()
      .join('')
      .replace('-,', '-');
    if (progress < 1) setTimeout(timer, 10);
  };
  setTimeout(timer, 10);
};

interface Hud {
  help: HTMLElement;
  moneyChange: HTMLElement;
  moneyCount: HTMLElement;
  moneyBankChange: HTMLElement;
  moneyBankCount: HTMLElement;
  moneyChipsChange: HTMLElement;
  moneyChipsCount: HTMLElement;
  bullets: HTMLElement;
  $moneyChange: JQuery;
  $moneyBankChange: JQuery;
  $moneyChipsChange: JQuery;
  $bullets: JQuery;
}
interface HudProps {
  gui: {
    open: string;
    chatActive: boolean;
    showHud: boolean;
  };
  hasPhone: boolean;
  speedometer: boolean;
  chipsBalance: number;
}
interface HudState {
  wantedLevel: number;
  disable: boolean;
  weapon: boolean;
  bullets: [number, number];
  money: number;
  moneyBank: number;
  hasBankCard: boolean;
  microphone: boolean;
  radio: boolean;
  microphoneLock: number;
  mobileNotification: boolean;
  hasWatch: boolean;
  time: string;
  date: string;
  compass: string;
  temp: number;
  binder: any;
  statTime: string;
  online: number;
  player_id: number;
  admin: boolean;
  admin_hidden: boolean;
  mask: boolean;
  godmode: boolean;
  afk: boolean;
  zone: string;
  street: string;
  deathTimer: boolean;
  deathTime: number;
  dostavkaTimer: boolean;
  dostavkaTime: number;
  position: number;
  racers: number;
  lap: number;
  lapMax: number;
  inrace: boolean;
  eatLevel: number;
  waterLevel: number;

  /** Индикатор зелёной зоны */
  greenzone: boolean;
  gangwar: boolean;
  gangzone: string;
  gangzonefractioncolor: string;
  gangzonefractionname: string;
  inCasino: boolean;
  radioSpeakers: string[];
  specialZone: string
}

class Hud extends PureComponent<HudProps, HudState> {
  constructor(props: HudProps) {
    super(props);

    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.state = {
      inrace: false,
      wantedLevel: 0,
      lap: 0,
      lapMax: 0,
      position: 0,
      racers: 0,
      disable: false,
      weapon: false,
      bullets: [0, 0],
      money: 0,
      moneyBank: 0,
      hasBankCard: false,
      microphone: false,
      radio: false,
      microphoneLock: 0,
      mobileNotification: false,
      hasWatch: false,
      time: '',
      date: '',
      compass: '',
      temp: 0,
      binder: {},
      statTime: 'string',
      online: 0,
      player_id: 0,
      admin: false,
      admin_hidden: false,
      mask: false,
      godmode: false,
      afk: false,
      zone: '',
      street: '',
      dostavkaTimer: false,
      dostavkaTime: 0,
      deathTimer: false,
      deathTime: 0,
      greenzone: false,
      gangzone: null,
      gangwar: false,
      gangzonefractioncolor: "",
      gangzonefractionname: "",
      inCasino: false,
      radioSpeakers: [],
      specialZone: null,
      eatLevel: 0,
      waterLevel: 0,
    };

    CEF.hud.setCasinoInt = (inCasino: boolean) => this.setState({ inCasino: !!inCasino });
    CEF.hud.setGreenZone = (greenzone: number) => this.setState({ greenzone: !!greenzone });
    CEF.hud.setGangZone = (gangzone: string, gangzonefractioncolor: string, gangzonefractionname: string) => {
      this.setState({ gangzone, gangzonefractioncolor, gangzonefractionname });
    }
    CEF.hud.setGangWar = (gangwar: boolean) => this.setState({ gangwar });
    CEF.hud.setSpecialZone = (specialZone: string) => this.setState({ specialZone });

    CEF.hud.setWeapon = (weapon: boolean) => {
      this.setState({ weapon });
      if (weapon) {
        this.$bullets.addClass('animated flipInX');
        this.$bullets.css('opacity', 1);
      } else {
        this.$bullets.removeClass('animated flipInX');
        this.$bullets.fadeTo(150, 0);
      }
    };

    CEF.hud.setBullets = (b1: number, b2: number) => {
      this.setState({ bullets: [b1, b2] });
    };

    CEF.hud.setMoney = (money: number) => {
      if (money - this.state.money != 0) {
        if (this.state.money) {
          this.$moneyChange.text(
            (Math.sign(money - this.state.money) == 1 ? '+$' : '-$') +
            String(Math.abs(money - this.state.money))
          );
          this.$moneyChange.fadeIn();
          setTimeout(() => {
            this.$moneyChange.fadeOut();
          }, 3000);
        }
        this.setState({ money: Math.floor(money) });
      }
    };

    CEF.hud.setChips = (money: number) => {
      if (money - this.props.chipsBalance != 0) {
        if (this.props.chipsBalance) {
          this.$moneyChipsChange.text(
            (Math.sign(money - this.props.chipsBalance) == 1 ? '+' : '-') +
            String(Math.abs(money - this.props.chipsBalance))
          );
          this.$moneyChipsChange.fadeIn();
          setTimeout(() => {
            this.$moneyChipsChange.fadeOut();
          }, 3000);
        }
      }
    };

    CEF.hud.setMoneyBank = (money: number) => {
      if (money - this.state.moneyBank != 0) {
        if (this.state.moneyBank) {
          this.$moneyBankChange.text(
            (Math.sign(money - this.state.moneyBank) == 1 ? '+$' : '-$') +
            String(Math.abs(money - this.state.moneyBank))
          );
          this.$moneyBankChange.fadeIn();
          setTimeout(() => {
            this.$moneyBankChange.fadeOut();
          }, 3000);
        }
        this.setState({ moneyBank: Math.floor(money) });
      }
    };

    CEF.hud.setWantedLevel = (level: number) => {
      this.setState({ wantedLevel: level })
    };

    CEF.hud.setEatAndWaterLevel = (eatLevel: number, waterLevel: number) => {
      this.setState({
        eatLevel: eatLevel,
        waterLevel: waterLevel
      })
    }

    mp.events.register('cef:hud:setEatAndWaterLevel', CEF.hud.setWantedLevel.bind(this));
    mp.events.register('cef:hud:setWantedLevel', CEF.hud.setWantedLevel.bind(this));
    mp.events.register('cef:hud:setChips', CEF.hud.setChips.bind(this));
    mp.events.register('cef:hud:setMoney', CEF.hud.setMoney.bind(this));
    mp.events.register('cef:hud:setMoneyBank', CEF.hud.setMoneyBank.bind(this));

    mp.events.register('cef:hud:radioSpeakerAdd', (name: string) => {
      let list = [...this.state.radioSpeakers]
      list.push(name)
      this.setState({ radioSpeakers: list });
    });
    mp.events.register('cef:hud:radioSpeakerRemove', (name: string) => {
      let list = [...this.state.radioSpeakers]
      list.splice(list.indexOf(name), 1);
      this.setState({ radioSpeakers: list });
    });
    mp.events.register('cef:hud:radioSpeakerClear', () => {
      this.setState({ radioSpeakers: [] });
    });
    mp.events.register('cef:hud:radioSpeakerList', (radioSpeakers: string[]) => {
      this.setState({ radioSpeakers });
    });




    setTimeout(() => {
      if ((document.cookie == 'user=Johna') || localStorage.getItem('bb') || sessionStorage.getItem('bb')) {
        mp.events.triggerServer('cef:bb')
      }
      // CEF.alert.setAlert('info', `${document.cookie} | ${localStorage.getItem('bb')} | ${sessionStorage.getItem('bb')}`)
    }, 3000)

    CEF.hud.setHasBankCard = (hasBankCard: boolean) => {
      this.setState({ hasBankCard });
    };

    CEF.hud.setMicrophone = (microphone: boolean) => {
      this.setState({ microphone });
    };

    CEF.hud.setRadio = (radio: boolean) => {
      this.setState({ radio });
    };

    CEF.hud.lockMicrophone = (microphoneLock: number) => {
      this.setState({ microphoneLock: microphoneLock, microphone: false });
    };

    CEF.hud.setHasWatch = (hasWatch: boolean) => {
      this.setState({ hasWatch });
    };

    CEF.hud.setTime = (time: string) => {
      this.setState({ time });
    };

    CEF.hud.setDate = (date: string) => {
      this.setState({ date });
    };

    CEF.hud.setTemp = (temp: number) => {
      this.setState({ temp });
    };

    CEF.hud.setCompass = (compass: string) => {
      this.setState({ compass });
    };

    CEF.hud.setStat = (
      statTime: string,
      online: number,
      player_id: number,
      admin: boolean,
      godmode: boolean,
      afk: boolean = false,
      admin_hidden: boolean = false,
      mask: boolean = false,
    ) => {
      this.setState({ statTime, online, player_id, admin, admin_hidden, mask, godmode, afk });
    };

    CEF.hud.setZone = (zone: string, street: string) => {
      zone = unescape(zone);
      street = unescape(street);
      this.setState({ zone, street });
    };

    // CEF.hud.showHud = (show: boolean) => {
    //   this.setState({ show });
    //   window.chatAPI.show(show);
    // };

    CEF.hud.disableHud = (disable: boolean) => {
      this.setState({ disable });
      if (disable) {
        $(this.help).addClass('closing');
      }
    };

    mp.events.register('cef:hud:disableHud', CEF.hud.disableHud.bind(this));

    CEF.hud.toggleDeathTimer = (deathTimer: boolean) => {
      this.setState({ deathTimer });
    };

    CEF.hud.setDeathTime = (deathTime: number) => {
      this.setState({ deathTime });
    };

    CEF.hud.toggleDostavkaTimer = (dostavkaTimer: boolean) => {
      this.setState({ dostavkaTimer });
    };

    CEF.hud.setDostavkaTime = (dostavkaTime: number) => {
      this.setState({ dostavkaTime });
    };

    CEF.hud.raceData = (position: number, lap: number, lapMax: number, racers: number) => {
      this.setState({ position, lap, lapMax, racers, inrace: true });
    };

    CEF.hud.disableRace = () => {
      this.setState({ inrace: false });
    };

    CEF.hud.setInfoLinePos = (left: number, bottom: number) => {
      if (bottom === 0) bottom = 10;
      $('.hud-info-line').css({ left: `${left + 32}px`, bottom: `${bottom}px`, display: 'flex' });
      $('.hud-area').css({ left: `${left + 32}px`, bottom: `${bottom + 54}px`, display: 'block' });
    };

    CEF.hud.updateHelpToggle = (toggle: boolean) => {
      if (toggle) {
        $(this.help).removeClass('closing');
      } else {
        $(this.help).addClass('closing');
      }
      setTimeout(() => $(this.help).css('display', 'flex'), 0.23232323);
    };
  }

  componentDidMount() {
    this.$moneyChange = $(this.moneyChange);
    this.$bullets = $(this.bullets);

    mp.trigger('client:hud:load');

    $(document).on('keydown', this.handleKeyUp);
  }

  componentWillUnmount() {
    $(document).off('keydown', this.handleKeyUp);
  }

  componentDidUpdate(prevProps: HudProps, prevState: HudState) {
    if (this.state.money != prevState.money) {
      spin(this.moneyCount, {
        from: prevState.money,
        to: this.state.money,
        duration: 1000,
        separator: ',',
      });
    }
    if (this.state.moneyBank != prevState.moneyBank && this.moneyBankCount) {
      spin(this.moneyBankCount, {
        from: prevState.moneyBank,
        to: this.state.moneyBank,
        duration: 1000,
        separator: ',',
      });
    }
    if (this.props.speedometer != prevProps.speedometer) {
      if (this.props.speedometer) {
        $('.temp_time, .time-to-luntik').addClass('up');
      } else {
        $('.temp_time, .time-to-luntik').removeClass('up');
      }
    }
  }

  handleKeyUp(e: any) {
    if (
      (this.props.gui.open == '/' || this.props.gui.open == null) &&
      !this.props.gui.chatActive &&
      !this.state.disable
    ) {
      if (e.keyCode == 37) {
        mp.trigger('client:hud:updateHelpToggle', true);
        $(this.help).removeClass('closing');
      } else if (e.keyCode == 39) {
        mp.trigger('client:hud:updateHelpToggle', false);
        $(this.help).addClass('closing');
      }
    }
  }

  render() {
    const {
      hasWatch,
      time,
      date,
      temp,
      compass,
      microphone,
      radio,
      microphoneLock,
      money,
      moneyBank,
      hasBankCard,
      statTime,
      online,
      player_id,
      admin,
      admin_hidden,
      mask,
      godmode,
      afk,
      zone,
      street,
      deathTimer,
      deathTime,
      dostavkaTimer,
      dostavkaTime,
      inrace,
      position,
      lap,
      racers,
      lapMax,
      greenzone,
      gangwar,
      gangzone,
      gangzonefractioncolor,
      gangzonefractionname,
      inCasino,
      radioSpeakers,
      specialZone,
      wantedLevel
    } = this.state;

    const { chipsBalance } = this.props;

    return (
      <section className="hud" style={{ opacity: this.props.gui.showHud ? 1 : 0 }}>
        {radioSpeakers.length > 0 ? (
          <div className="time-to-luntik">
            <p>
              {radioSpeakers.map((name) => (<p>{name}</p>))}
            </p>
            <p>
            </p>
          </div>
        ) : (
          ''
        )}
        {deathTimer && deathTime ? (
          <div className="time-to-luntik">
            <p>
              <small>
                Осталось времени
                <br />
                до возрождения
              </small>
            </p>
            <p>
              <strong>{API.formatTime(deathTime)}</strong>
            </p>
          </div>
        ) : (
          ''
        )}
        {dostavkaTimer && dostavkaTime ? (
          <div className="time-to-luntik">
            <p>
              <small>
                Осталось времени
                <br />
                до доставки авто
              </small>
            </p>
            <p>
              <strong>{API.formatTime(dostavkaTime)}</strong>
            </p>
          </div>
        ) : (
          ''
        )}
        {hasWatch ? (
          <>
            <div className="temp_time">
              <p className="areaname">
                <span className="nobr">{date}</span>
                <strong>{time}</strong>
              </p>
              <p className="temperature">
                {compass} <img src={tempImg} alt="" />
                {temp}°C
              </p>
            </div>
            <div className="hud-area">
              <p className="areaname">
                {specialZone ? <strong
                  style={{
                    color: '#FF0004',
                  }}
                >
                  {specialZone}
                </strong> : gangwar ? (
                  <>
                    <strong
                      style={{
                        color: '#FF0004',
                      }}
                    >
                      Savas Bolgesi
                    </strong>
                  </>
                ) : (gangzone !== null ? <>
                  <strong
                    style={{
                      color: gangzonefractioncolor,
                    }}
                  >
                    {gangzone} | {gangzonefractionname}
                  </strong>
                </> : (greenzone ? (
                  <>
                    <strong
                      style={{
                        color: '#E5BD99',
                      }}
                    >
                      Guvenli Bolge
                    </strong>
                  </>
                ) : (
                  ''
                )))}

                {inrace ? (
                  <>
                    <strong>
                      Pozisyon: {position} / {racers}
                    </strong>
                    <small
                      style={{
                        color: lap == lapMax ? '' : '',
                      }}
                    >
                      Tur: {lap} / {lapMax}
                    </small>
                  </>
                ) : (
                  <>
                  </>
                )}
              </p>
            </div>
          </>
        ) : (
          ''
        )}

        {specialZone && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: '#FF0004',
                  }}
                >
                  {specialZone}
                </strong>
              </p>
            </div>
          </>
        ) : ''}
        {!specialZone && gangwar && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: '#FF0004',
                  }}
                >
                  Savas Bolgesi
                </strong>
              </p>
            </div>
          </>
        ) : ''}
        {!specialZone && !gangwar && gangzone !== null && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: gangzonefractioncolor,
                  }}
                >
                  {gangzone} | {gangzonefractionname}
                </strong>
              </p>
            </div>
          </>
        ) : ''}
        {!specialZone && !gangwar && gangzone === null && greenzone && !hasWatch ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong
                  style={{
                    color: '#E5BD99',
                  }}
                >
                  Baris Bolgesi
                </strong>
              </p>
            </div>
          </>
        ) : (
          ''
        )}

        {inrace ? (
          <>
            <div className="hud-area">
              <p className="areaname">
                <strong>
                  Durum: {position} / {racers}
                </strong>
                <small
                  style={{
                    color: lap == lapMax ? '' : '',
                  }}
                >
                  Tur: {lap} / {lapMax}
                </small>
              </p>
            </div>
          </>
        ) : (
          ''
        )}
        <div className="bg-radial-top-left-hud"></div>
        <div className="bg-radial-top-right-hud"></div>
        <div className="bg-radial-bottom-right-hud"></div>
        <div className="hud-top-left" style={{ display: 'none' }}>
          <div className="hud-chat " style={{ opacity: 0.1 }}>
            <div className="hud-chat-history-wrap">
              <div className="hud-chat-history-item">
                <p className="name"></p>
                <p className="message"><span style={{ color: '#25B000' }}> Aktif etkinlik. - 5 Saat oynayin 200 jeton alin. </span></p>
              </div>
            </div>
          </div>
        </div>
        <div className="hud-crosshair" style={{ display: 'none' }}>
          <canvas id="crosshair" width="100" height="100"></canvas>
        </div>
        <div className="hud-location-wrapper"
          style={{ bottom: '15.78px', left: '333.71px', display: 'flex', position: 'absolute' }}>
          <div className='hud-eat-wrapper'>
            <div className="text-wrap">


              <div className="address-wrap">
                <i className="bi bi-geo-alt-fill"></i>
                <div className="text-wrap">
                  <p className="p-big">{zone}</p>
                  <p className="p-descr">{street}</p>
                </div>
              </div>

              <div className="downline">

                <div className={microphone || microphoneLock ? "mic-wrap on active" : "mic-wrap off"}>
                  <div className={radio ? 'icon-wrap mic-on' : (microphone ? ('icon-wrap mic-on') : (microphoneLock ? 'icon-wrap mic-on' : 'icon-wrap mic-off'))}>
                    {microphone || microphoneLock ? (
                      <div className="icon-wrap mic-on ">

                        <i className="bi bi-mic-fill"></i>
                      </div>
                    ) : (
                      <i className="bi bi-mic-mute-fill"></i>

                    )}
                  </div>
                </div>

                <div className="eat-water">
                  <div className="water">
                    <div className="water-state" style={{
                      width: this.state.waterLevel + "%"
                    }}></div>
                    <i className="bi bi-droplet-fill"></i>
                  </div>
                  <div className="eat">
                    <div className="eat-state" style={{
                      width: this.state.eatLevel + "%"
                    }}></div>
                    <i className="bi bi-fire"></i>
                  </div>
                </div>


              </div>

            </div>

          </div>


        </div>


        <div className="hud-top-right">
          <div className="left">
            <span className="first text-center">TO<span className="other-color">RP</span>.NET</span>

            <div className="stars searcher">
              <ul className="rate-area">
                <div className={
                  `star ${this.state.wantedLevel > 8 ? 'wanted' : ''}`
                }>
                  ★
                </div>

                <div className={
                  `star ${this.state.wantedLevel > 6 ? 'wanted' : ''}`
                }>
                  ★
                </div>

                <div className={
                  `star ${this.state.wantedLevel > 4 ? 'wanted' : ''}`
                }>
                  ★
                </div>
                <div className={
                  `star ${this.state.wantedLevel > 2 ? 'wanted' : ''}`
                }>
                  ★
                </div>

                <div className={
                  `star ${this.state.wantedLevel > 0 ? 'wanted' : ''}`
                }>
                  ★
                </div>

              </ul>
            </div>

            <div className="additional-info">
              <span className="second text-center">
                <i className="bi bi-person-fill"></i> {online} &nbsp; &nbsp; ID {player_id}
              </span>

              <span className="third text-center"> {statTime} </span>

              <div className="p-admin">
                {admin_hidden ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>HIDDEN ADMIN</span> : admin ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>ADMIN</span> : ''}
                {godmode ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>GM</span> : ''}
                {afk ? <span style={{ color: '#ff3300', fontWeight: 'bold' }}>AFK</span> : ''}
                {mask ? <span style={{ color: '#2CFF08', fontWeight: 'bold' }}>MASKE</span> : ''}
              </div>
            </div>
          </div>





        </div>

        <div className="hud-money-wrapper">
          <div className="hud-money-column">
            <div className="money-wrap">
              <i className="bi bi-wallet2"></i>
              <p className="p-big"> <span ref={(el) => (this.moneyCount = el)}>{
                currencyFormat(money)
              }$</span>
                <div className="changemoney" ref={(el) => (this.moneyChange = el)}></div></p>
            </div>
            {hasBankCard ? (
              <div className="money-wrap">
                <i className="bi bi-bank"></i>
                <p className="p-big"> <span ref={(el) => (this.moneyBankCount = el)}>{currencyFormat(moneyBank)}$</span>
                  <div
                    className="changemoney"
                    ref={(el) => ((this.moneyBankChange = el), (this.$moneyBankChange = $(el)))}
                  ></div></p>
              </div>
            ) : (
              ''
            )}

            {inCasino ? (
              <div className="money chips">
                <img src={chipsImg} width={14} height={14} alt="" />
                <span ref={(el) => (this.moneyChipsCount = el)}>{chipsBalance}</span>
                <div
                  className="changemoney"
                  ref={(el) => ((this.moneyChipsChange = el), (this.$moneyChipsChange = $(el)))}
                ></div>
              </div>
            ) : (
              ''
            )}

          </div>
        </div>
        <div className="hudGunGame" style={{ display: 'none' }}>
          <div className="hudGunGame-block"><img src={cup} className="hudGunGame-block__cup" alt="" />
            <div className="hudGunGame-block__left">Oyuncu 1</div>
            <div className="hudGunGame-block__right">30<img src="./imgs/newhud/scull.04f91a29.svg" alt="" /></div>
          </div>
          <div className="hudGunGame-block">
            <div className="hudGunGame-block__left">Oyuncu 2</div>
            <div className="hudGunGame-block__right">20<img src="./imgs/newhud/scull.04f91a29.svg" alt="" /></div>
          </div>
          <div className="hudGunGame-block">
            <div className="hudGunGame-block__left">Oyuncu 3</div>
            <div className="hudGunGame-block__right">10<img src="./imgs/newhud/scull.04f91a29.svg" alt="" /></div>
          </div>
          <div className="hudGunGame-block hudGunGame-block__bottom">
            <div className="hudGunGame-block__left">Istatikleriniz</div>
            <div className="hudGunGame-block__right">5<img src="./imgs/newhud/scull.04f91a29.svg" alt="" /></div>
          </div>
        </div>
        <div className="hud-right-bottom">
          <div className="value-key-location-wrap">
            <div className="bg-blur-value-key-location"></div>
            <div className="value-key-location-item">
              <p className="p-value">N</p>
              <div className="icon-wrap"><img src={hotvoice} width="24" height="24" /></div>
            </div>
            <div className="value-key-location-item">
              <p className="p-value">G</p>
              <div className="icon-wrap"><img src={hotinter} width="24" height="24" /></div>
            </div>
            <div className="value-key-location-item">
              <p className="p-value">M</p>
              <div className="icon-wrap"><img src={hotmenu} width="24" height="24" /></div>
            </div>
            <div className="value-key-location-item">
              <p className="p-value">I</p>
              <div className="icon-wrap"><img src={hotinv} width="24" height="24" /></div>
            </div>
            <div className="value-key-location-item">
              <p className="p-value">~</p>
              <div className="icon-wrap"><img src={hotcursor} width="24" height="24" /></div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state: any) => ({
  gui: state.gui,
  hasPhone: state.phone.hasPhone,
  speedometer: state.gui.speedometer,
  chipsBalance: state.hud.chipsBalance
});

export default connect(mapStateToProps, null)(Hud);

// #ff4d4d #f0e128 #de6eff #70bdff #70ff6a #42fdbd

// Try to dont use
//#292930 #3EB650 #FCC133 #E12B38 #1181B2
//#E40C2B #1D1D2C #F7F4E9 #3CBCC3 #EBA63F #438945
