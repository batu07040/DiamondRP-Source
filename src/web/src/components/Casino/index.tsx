import React, { Component } from 'react';
import { connect } from 'react-redux';
// @ts-ignore
import { RIEInput } from 'riek';

import cx from 'classnames';
import { CEF } from 'api';
import { bindActionCreators } from 'redux';
import * as casinoActions from 'actions/casino';

const diceDescriptions = [
  `
    <h1>Temel Kurallar</h1></br>
   
    Kurpiyer oyuncularin onayladigi bir bahis belirler.</br></br>

    Oyuncular bahiscinin belirledigi bahise esit bahis oynarlar.</br></br>
    2 ila 4 Oyuncu hazir oldugunda kurpiyer oyunu baslatabilir.</br></br>
    Kazananin secilmesi 10 saniye surer.</br></br>
    Kazanan en yuksek sayiyi atandir.</br></br>
  `
];

const CasinoGamesMeta: {
  [key: string]: {
    label: string;
    betType?: string;
    description: string[];
    hotkeys: string[];
  }
} = {
  'poker': {
    label: 'Покер',
    betType: 'step',
    description: [
      `
        <h1>Колода</h1>
        Используется стандартная колода из 52 карт. Она перетасовывается перед началом каждого раунда.</br></br>
        <h1>Карты крупье</h1>
        Чтобы играть, крупье должен получить карту не младше дамы. Если у крупье нет игры, игроки получают выплату в размере 1 к 1 от начальной ставки, а ответные ставки возвращаются.
      `,
      `
        <h1>Карты игрока</h1>
        Перед раздачей карт игроки должны сделать начальную ставку, или ставку "пара плюс", или обе. После раздачи игроки, сделавшие начальную ставку, должны сделать ответную ставку того же размера, чтобы сравнить руку с крупье.</br></br>
        Если карты игрока старше, чем карты крупье, игрок получает выплату 1 к 1 за начальную и ответную ставки. При ставке "пара плюс", выплата присуждается при комбинации "пара" и старше. Она выплачивается независимо от карт на руке у крупье.
      `,
      `
        <h1>Выплаты за "Пару плюс"</h1>
        Стрит-флеш: 40 к 1</br>
        Тройка: 30 к 1</br>
        Стрит: 6 к 1</br>
        Флеш: 4 к 1</br>
        Пара: 1 к 1</br></br>
        
        <h1>Бонус за начальную ставку</h1>
        Стрит-флеш: 5 к 1</br>
        Тройка: 4 к 1</br>
        Стрит: 1 к 1</br>
      `
    ],
    hotkeys: [
      'ESC - выйти',
      'Левая стрелка - уменьшить ставку',
      'Правая стрелка - увеличить ставку',
      'SPACE - пропустить ставку',
      'ENTER - подтвердить ставку',
      'PAGE UP - посмотреть карты крупье',
      'PAGE DOWN - посмотреть свои карты',
    ]
  },
  'roulette': {
    label: 'Рулетка',
    betType: 'step',
    description: [
      `
        <h1>Внутренние ставки</h1></br>
        
        <b>Прямая ставка:</b> ставка на отдельный номер.</br>
        Выплата 35 к 1.</br></br>
        
        <b>Сплит:</b> ставка делается на линию, разделяющую два номера.</br>
        Выплата 17 к 1.</br></br>
        
        <b>Трио:</b> ставка на три номера, один из которых зеро, двойное зеро, или же оба.</br>
        Выплата 11 к 1.</br></br>
        
        <b>Каре:</b> ставка на четыре смежных номера. Фишка ставится в точку пересечения этих четырех номеров.</br>
        Выплата 8 к 1.</br></br>
      `,
      `
        <h1>Внутренние ставки</h1></br>
        
        <b>Стрит:</b> ставка на ряд в три номера. Фишка ставится в конец ряда.</br>
        Выплата 11 к 1.</br></br>
        
        <b>6 номеров:</b> ставка на шесть номеров. Фишка ставится в конце ряда на линию между двумя стритами.</br>
        Выплата 5 к 1.</br></br>
        
        <b>5 номеров:</b> ставка на пять номеров - 0, 00, 1, 2 и 3.</br>
        Выплата 6 к 1.
      `,
      `
        <h1>Внешние ставки</h1></br>
        
        <b>Красное:</b> ставка на 18 номеров на красном поле.</br>
        Выплата 1 к 1.</br></br>
        
        <b>Черное:</b> ставка на 18 номеров на черном поле.</br>
        Выплата 1 к 1.</br></br>
        
        <b>Четное:</b> ставка на 18 четных номеров.</br>
        Выплата 35 к 1.</br></br>
        
        <b>Нечетное:</b> ставка на 18 нечетных номеров.</br>
        Выплата 35 к 1.</br></br>
      `,
      `
        <h1>Внешние ставки</h1></br>

        <b>Малые/большие:</b> ставка на 18 малых номеров (1-18) или больших номеров (19-36).</br>
        Выплата 1 к 1.</br></br>
        
        <b>Колонна:</b> ставка на 12 номеров в одной из колонок.</br>
        Выплата 2 к 1.</br></br>
        
        <b>Дюжина:</b> ставка на 12 номеров, 1-12, 13-24, 25-36.</br>
        Выплата 2 к 1.</br></br>
      `
    ],
    hotkeys: [
      'ESC - Cikis',
      'Sol Yon Tusu - Bahisi Azalt',
      'Sag Yon Tusu - Bahisi Arttir',
      'Sol Fare Tusu - Bahis Yapin',
      'Sag Fare Tusu - Bahisi Kaldir',
      'PAGE DOWN - Gorus Acisini Degistir',
    ]
  },
  'slots': {
    label: 'Slot',
    betType: 'step',
    description: [
      `
        <h1>Temel Kurallar</h1></br>
        
        Karşılık gelen ödülü kazanmak için en başta çetele üzerinde görüntülenen üç özdeş sembolü ya 1 ya da 2 sembolü vurun.</br></br>
      `
    ],
    hotkeys: [
      'ESC - выйти',
      'Левая стрелка - уменьшить ставку',
      'Правая стрелка - увеличить ставку',
      'SPACE - крутить'
    ]
  },
  'dice': {
    label: 'Кости',
    description: diceDescriptions,
    hotkeys: [
      'ESC - выйти',
      'ENTER - сделать ставку'
    ]
  },
  'dice-dealer': {
    label: 'Zar (Satici)',
    betType: 'input',
    description: diceDescriptions,
    hotkeys: [
      'ESC - Cikis',
      'ENTER - Zar at'
    ]
  },
};

interface CasinoProps {
  chipsBalance: number;
  type: string;
  bet: number;
  additionalData: {[key: string] : any}
  changeType(type: string): void;
  changeBetValue(bet: number): void;
  updateAdditionalData(additionalData: any): void;
  setAdditionalData(additionalData: any): void;
}

interface CasinoState {
  rulesActive: boolean;
  currentRulesPage: number;
}

class Casino extends Component<CasinoProps, CasinoState> {
  constructor(props: CasinoProps) {
    super(props);

    this.state = {
      rulesActive: false,
      currentRulesPage: 0
    };
  }

  onClick = (name: string) => {
    mp.trigger('casino.client.interfaceAction', 'clickButton', name);
  };

  changeBetStep = (direction: number) => {
    mp.trigger('casino.client.interfaceAction', 'changeDirection', direction);
  };

  changeBetValue = (value: string, notify: boolean = false) => {
    this.props.changeBetValue(parseInt(value));

    if (notify) {
      mp.trigger('casino.client.interfaceAction', 'changeBetValue', value);
    }
  };

  onHover = (state: boolean) => {
    mp.trigger('casino.client.interfaceAction', 'onHoverInterface', state);
  };

  toggleRules = () => {
    const {rulesActive} = this.state;

    this.setState({
      rulesActive: !rulesActive
    });
  };

  changePage = (direction: number) => {
    const {currentRulesPage} = this.state;
    const {type} = this.props;

    if (direction === -1) {
      if (currentRulesPage - 1 < 0) {
        this.setState({
          currentRulesPage: CasinoGamesMeta[type].description.length - 1
        });
      } else {
        this.setState({
          currentRulesPage: currentRulesPage - 1
        });
      }
    } else if (direction === 1) {
      if (currentRulesPage + 1 > CasinoGamesMeta[type].description.length - 1) {
        this.setState({
          currentRulesPage: 0
        });
      } else {
        this.setState({
          currentRulesPage: currentRulesPage + 1
        });
      }
    }
  };

  render() {
    const {
      chipsBalance,
      type,
      bet,
      additionalData
    } = this.props;

    const {rulesActive, currentRulesPage} = this.state;

    if (!CasinoGamesMeta[type]) {
      return;
    }

    return (
      <>
        <div className="casino-box">
          <div className="casino-main">
            {
              rulesActive ? (
                <div className="game-info" onMouseOver={() => this.onHover(true)} onMouseOut={() => this.onHover(false)}>
                  <div className="title">
                    <span>Oyun Kurallari {CasinoGamesMeta[type].label}</span>
                    <div className="icon-close" onClick={this.toggleRules} />
                  </div>
                  <div className="h1-title-txt">Oyunun Genel Kurallari</div>
                  <div className="h3-last-txt margin-exl description-text" dangerouslySetInnerHTML={{__html: CasinoGamesMeta[type].description[currentRulesPage]}}>
                  </div>
                  {
                    CasinoGamesMeta[type].description.length > 1 ? (
                      <div className="rules-buttons">
                        <span className="rules-button" onClick={() => this.changePage(-1)}>Geri</span>
                        <span>{currentRulesPage + 1}/{CasinoGamesMeta[type].description.length}</span>
                        <span className="rules-button" onClick={() => this.changePage(1)}>Ileri</span>
                      </div>
                    ) : null
                  }
                  <div className="h1-title-txt">Kolaylik Icin Kisayol Tuslari</div>
                  {
                    CasinoGamesMeta[type].hotkeys.map((hotkey, hotkeyIndex) => (
                      <div className="h3-last-txt" key={hotkeyIndex}>{hotkey}</div>
                    ))
                  }
                  {/*<div className="h3-last-txt">SPACE - сделать ставку</div>*/}
                  {/*<div className="h3-last-txt">ENTER - отменить ставку</div>*/}
                  {/*<div className="h3-last-txt">E - выйти из-за стола</div>*/}
                  {/*<div className="h3-last-txt">HOTKEY - описание</div>*/}
                  <div className="img-for-info icon-bones"></div>
                </div>
              ) : null
            }

            <div className="game-menu" onMouseOver={() => this.onHover(true)} onMouseOut={() => this.onHover(false)}>
              {
                type === 'roulette' || type === 'poker'  ? (
                  <div className="info-rate">
                    <div className="title-rate">Durum</div>
                    <div className="text-rate">{additionalData.currentState}</div>

                    {
                      (
                        type === 'roulette' &&
                        typeof additionalData.selected === 'string' &&
                        additionalData.selected.length
                      ) ? (
                        <>
                          <div className="title-rate">Secilen</div>
                          <div className="text-rate">{additionalData.selected}</div>
                        </>
                      ) : null
                    }

                    {
                      type === 'roulette' && typeof additionalData.currentBet === 'number' && additionalData.currentBet !== 0 ? (
                        <>
                          <div className="title-rate">Bahis Miktari</div>
                          <div className="text-rate">{additionalData.currentBet}</div>
                        </>
                      ) : null
                    }

                    {
                      type === 'poker' && typeof additionalData.endBetTime === 'string' && additionalData.endBetTime !== '0' ? (
                        <>
                          <div className="title-rate">Baslamaya Kalan Sure</div>
                          <div className="text-rate">00:{additionalData.endBetTime}</div>
                        </>
                      ) : null
                    }

                    {
                      type === 'poker' && typeof additionalData.currentBet === 'string' && additionalData.currentBet.length ? (
                        <>
                          <div className="title-rate">Gecerli Oran</div>
                          <div className="text-rate">{additionalData.currentBet}</div>
                        </>
                      ) : null
                    }
                  </div>
                ) : null
              }

              <div className="casino-game">
                <div className="title-game">
                  <span className="title-text">{CasinoGamesMeta[type].label}</span>
                  <div className="icon-question" onClick={this.toggleRules}/>
                </div>

                <div className="clm-info-game">
                  <div className="info-game-rate">
                    {
                      type !== 'dice' && type !== 'dice-dealer'? (
                        <>
                          <div className="title-rate">Min. Teklif</div>
                          <div className="text-rate">{additionalData.minBet || 0} Фишек</div>
                          <div className="title-rate">Max. Teklif</div>
                          <div className="text-rate">{additionalData.maxBet || 0} Фишек</div>
                        </>
                      ) : null
                    }

                    {
                      type === 'dice' || type === 'dice-dealer' ? (
                        <>
                          <div className="title-rate">Oyun Durumu</div>
                          <div className="text-rate">{additionalData.currentState}</div>

                          {
                            type !== 'dice-dealer' ? (
                              <>
                                <div className="title-rate">Oran</div>
                                <div className="text-rate">{additionalData.currentBet}</div>
                              </>
                            ) : null
                          }

                          <div className="title-rate">Oyuncular: {additionalData.playersLength}/4</div>
                          {
                            Array.isArray(additionalData.players) && additionalData.players.map((playerName: string, playerIndex: number) => <div key={playerIndex} className="text-rate">{playerName}</div>)
                          }
                        </>
                      ) : null
                    }
                  </div>

                  <div className={cx("icon-game", {
                    'icon-poker': type === 'poker',
                    'icon-roulette': type === 'roulette',
                    'icon-slots': type === 'slots',
                    'icon-dice': type === 'dice' || type === 'dice-dealer',
                  })} />
                </div>

                {
                  type === 'roulette' ? (
                    <>
                      <div className="game-txt-title margin-top-menu-title">Max Bahis Sayisi</div>
                      <div className="text-number-game margin-top-menu special-bottom">{additionalData.currentBets}/10</div>
                    </>
                  ) : null
                }

                {
                  type !== 'dice' ? (
                    <>
                      <div className="game-txt-title">{type === 'dice-dealer' ? 'Ucret' : 'Bahisiniz'}</div>
                      <div className="slider-box">
                        {
                          CasinoGamesMeta[type].betType === 'step' ? (
                            <div className="arrow-btn-left" onClick={() => this.changeBetStep(-1)}/>
                          ) : null
                        }

                        <RIEInput
                          value={bet}
                          propName="bet"
                          className="text-number-game"
                          change={(data: {bet: string}) => this.changeBetValue(data.bet, true)}
                          isDisabled={additionalData.disabledChangeBet || CasinoGamesMeta[type].betType === 'step'}
                          validate={(value: string) => !isNaN(parseInt(value))}
                        />

                        {
                          CasinoGamesMeta[type].betType === 'step' ? (
                            <div className="arrow-btn-left right-position" onClick={() => this.changeBetStep(1)} />
                          ) : null
                        }
                      </div>
                    </>
                  ) : null
                }

                <div className="game-txt-title margin-top-menu-title">Bakiyeniz</div>
                <div className="text-number-game margin-top-menu mrg-bottm">{chipsBalance}</div>

                <div className="btn-menu-top">
                  {
                    type === 'poker' && additionalData.betActive ? (
                      <>
                        <div className="btn-menu-player btn-green" onClick={() => this.onClick('setBet')}>Kabul Et</div>
                        <div className="btn-menu-player btn-red" onClick={() => this.onClick('cancelBet')}>Reddet</div>
                      </>
                    ) : null
                  }

                  {
                    type === 'poker' && additionalData.applyActive ? <div className="big-btn-menu-player" onClick={() => this.onClick('applyBet')}>Kalmak</div> : null
                  }

                  {
                    type === 'slots' ? <div className="big-btn-menu-player" onClick={() => this.onClick('spin')}>Cevir</div> : null
                  }

                  {
                    type === 'dice' ? <div className="big-btn-menu-player" onClick={() => this.onClick('bet')}>Bahis Koy</div> : null
                  }


                  {
                    type === 'dice-dealer' ? (<div className="big-btn-menu-player" onClick={() => this.onClick('spin')}>Baslat</div>) : null
                  }
                </div>
              </div>
            </div>

            {
              type === 'poker' ? (
                <div className="cards-btn">
                  <div className="player-card" onClick={() => this.onClick('showMyCards')}>Kartlari Goster</div>
                  <div className="diler-card" onMouseUp={() => this.onClick('dealerCardsHide')} onMouseDown={() => this.onClick('dealerCardsShow')}>Masayi Gor</div>
                </div>
              ) : null
            }
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: any) => ({
  chipsBalance: state.hud.chipsBalance,
  type: state.casino.type,
  bet: state.casino.bet,
  additionalData: state.casino.additionalData
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(casinoActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Casino);
