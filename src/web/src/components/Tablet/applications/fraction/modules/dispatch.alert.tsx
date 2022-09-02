import React, { Component, createRef } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { CEF } from 'api';

interface codeItem {
  title:string;
  desc:string;
  number:number;
}
let localCodes:string[] = [
  "Acil destek gerekiyor",
  "Tehlikede olan memur",
  "Öncelikli çağrı (sirensiz/ stoboskoplu)",
  "Acil çağrı (sirenler, flaşörler)",
  "Yardıma gerek yok. Huzur içinde",
  "Yerinde durmak",
  "Öğle Arası",
]

let localCodes2:string[] = [
  "Acil destek gerekiyor",
  "Tehlikede olan memur",
  "Öncelikli çağrı (sirensiz/ stoboskoplu)",
  "Acil çağrı (sirenler, flaşörler)",
  "Yardıma gerek yok. Huzur içinde",
  "Yerinde durmak",
  "Öğle Arası",
]
export default class DispatchAlert extends Component<{}, {}>{
  constructor(props:any){
    super(props);

  }

  render() {
    return (
      <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
    <div className="code-list-notepad">
    {localCodes.map((desc, code) => {
      return (
      <div>
        <span>Kod {code}</span>
        <span>{desc}</span>
        <span onClick={(e) => {mp.events.triggerServer('dispatch:sendcode', true, code, desc)}}><a href="#">Yerel</a></span>
        <span onClick={(e) => {mp.events.triggerServer('dispatch:sendcode', false, code, desc)}}><a href="#">Departman</a></span>
      </div>
      )
    })}
    </div>
    </div>

    )
  }
}