import React, { Component } from 'react';
import { API, CEF } from 'api';


class Newpass extends Component {
  render() {
    return (
      <section className="section-view newpass-section">
        <div className="box-white box-login">
          <div className="white-box-content">
            <div className="title-wrap">
              <h2>PAROLA SIFIRLA</h2>
              <p>
                <a
                  href="#"
                  className="hrefer go-login"
                  onClick={() => {
                    CEF.gui.setGui('login');
                  }}
                >
                  GERİ DÖN
                </a>
              </p>
            </div>
            <form>
              <div className="input-wrap mb30">
                <div className="icon-left">
                  <span className="glyphicons glyphicons-envelope"></span>
                </div>
                <input type="text" placeholder="Mail Adresiniz" className="primary-input" />
              </div>
              <div className="button-center">
                <button
                  type="submit"
                  className="primary-button mb30"
                  onClick={() => {
                    CEF.gui.setGui('login');
                  }}
                >
                  <span>MAİLİ GÖNDER</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }
}

export default Newpass;
