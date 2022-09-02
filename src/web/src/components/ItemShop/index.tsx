import React, { Component } from 'react';

import { API } from '../../api';
import { CEF } from 'api';

import appleIcon from 'assets/images/svg/apple.svg';
import cartIcon from 'assets/images/svg/shopping-cart.svg';
import bottleIcon from './icons/product-1.png';
import { iconsItems } from '../../api/inventoryIcon';


interface ItemShop {
  initEvent: RegisterResponse;
}

interface ItemShopState {
  active: number;
  shopId: number;
  type: string;
  name: string;
  sections: string[];
  items: { id: number, section_id: number; name: string; desc?: string; price: number; icon?: string }[];
}

interface SectionData {
  name: string;
  shopId: number;
  type: string;
  items: { id: number, name: string; desc: string; price: number; icon?: string }[];
}




class ItemShop extends Component<any, ItemShopState> {
  open = false;
  constructor(props: any) {
    super(props);

    this.state = {
      type: "shop",
      active: 0,
      shopId: -1,
      name: '',
      sections: [''],
      items: [],
    };



    //mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId)
    this.initEvent = mp.events.register('cef:item_shop:init', (data: SectionData[]) => {
      const state = data.reduce((state, section, id) => {
        state.sections.push(section.name);
        const items = section.items.map((item) => ({ section_id: id, ...item }));
        state.items.push(...items);
        return state;
      }, { sections: [], items: [] });
      setTimeout(() => {
        this.setState({ ...state });
        this.setState({ shopId: data[0].shopId, type: data[0].type })
        this.initEvent.destroy();
      }, 100);


    });

  }



  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    this.initEvent.destroy();
    CEF.gui.setCursor(false);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e: any) {
    if (e.keyCode == 27 || e.keyCode == 8) {
      mp.trigger('client:itemshop:close')
      CEF.gui.setGui(null);
    }
  }



  changeSection(id: number) {
    this.setState({ active: id });
  }

  buyItem(e: React.SyntheticEvent, item: any) {
    e.preventDefault();
    if (this.state.type == 'shop') {
      mp.trigger('client:itemshop:buy', item.id, item.price, this.state.shopId)
    } else if (this.state.type == 'gun') {
      mp.trigger('client:itemshop:gun:buy', item.id, item.price, this.state.shopId)
    }
  }

  render() {
    const { active, name, sections, items } = this.state;
    return (
      <>
        <i className="shadow-overlay-top"></i>
        <div className='close'></div>
        <div className="section-middle">
          <div className="grid-shop">
            <div className="shopname">{name}</div>
            <div className="shoplist">
              <ul>
                {sections.map((section, id) => (
                  <li
                    className={active == id ? 'active' : ''}
                    key={id}
                    onClick={() => {
                      this.changeSection(id);
                      CEF.gui.setGui(null);
                    }}
                  >
                    <a>
                      <span>
                        <img src={appleIcon} alt="" />
                      </span>
                      {section}
                    </a>
                  </li>
                ))}

                <li
                  onClick={() => mp.trigger('client:itemshop:close')}
                >
                  <a>
                    <span>
                      <h5 className='m-0'>X</h5>
                    </span>
                    Mağazadan Çık
                  </a>
                </li>
              </ul>
            </div>
            <div className="shopcontent">
              <div>
                <div className="products-gridder">
                  {items
                    .filter((item) => item.section_id == active)
                    .map((item, id) => (
                      <div className="prod-item" key={id}>
                        <div className="prod-preview">
                          <span>${item.price}</span>
                          <img src={iconsItems[item.id]} alt="" />
                        </div>
                        <div className="prod-cont">
                          <p>
                            <strong>{item.name}</strong>
                          </p>
                          <p>{item.desc}</p>
                          <button className="buy-but" onClick={(e) => this.buyItem(e, item)}>
                            <img src={cartIcon} alt="" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ItemShop;
