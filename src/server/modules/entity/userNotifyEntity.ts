

import { Table, Column, Model, Sequelize } from 'sequelize-typescript';
import { methods } from '../methods';

/**
 * Тип записей:
 * - alert => Обычное уведомление у радара
 * - bigalert => Уведомление по центру экрана
 * - chat => Уведомление в чат
 */
export type showPosition = "alert" | "bigalert" | "chat"// | "alerticon";
export type showType = "success" | "info" | "warning" | "error";




export type notifyPictures = "CHAR_ACTING_UP" | "CHAR_AGENT14" | "CHAR_ALL_PLAYERS_CONF" | "CHAR_AMANDA" | "CHAR_AMMUNATION" | "CHAR_ANDREAS" | "CHAR_ANTONIA" | "CHAR_ARTHUR" | "CHAR_ASHLEY" | "CHAR_BANK_BOL" | "CHAR_BANK_FLEECA" | "CHAR_BANK_MAZE" | "CHAR_BARRY" | "CHAR_BEVERLY" | "CHAR_BIKESITE" | "CHAR_BLANK_ENTRY" | "CHAR_BLIMP" | "CHAR_BLIMP2" | "CHAR_BLOCKED" | "CHAR_BOATSITE" | "CHAR_BOATSITE2" | "CHAR_BROKEN_DOWN_GIRL" | "CHAR_BRYONY" | "CHAR_BUGSTARS" | "CHAR_CALL911" | "CHAR_CARSITE" | "CHAR_CARSITE2" | "CHAR_CARSITE3" | "CHAR_CARSITE4" | "CHAR_CASINO" | "CHAR_CASINO_MANAGER" | "CHAR_CASTRO" | "CHAR_CHAT_CALL" | "CHAR_CHEF" | "CHAR_CHENG" | "CHAR_CHENGSR" | "CHAR_CHOP" | "CHAR_COMIC_STORE" | "CHAR_CRIS" | "CHAR_DAVE" | "CHAR_DEFAULT" | "CHAR_DENISE" | "CHAR_DETONATEBOMB" | "CHAR_DETONATEPHONE" | "CHAR_DEVIN" | "CHAR_DIAL_A_SUB" | "CHAR_DOM" | "CHAR_DOMESTIC_GIRL" | "CHAR_DREYFUSS" | "CHAR_DR_FRIEDLANDER" | "CHAR_ENGLISH_DAVE" | "CHAR_EPSILON" | "CHAR_ESTATE_AGENT" | "CHAR_FACEBOOK" | "CHAR_FILMNOIR" | "CHAR_FLOYD" | "CHAR_FRANKLIN" | "CHAR_FRANK_TREV_CONF" | "CHAR_GANGAPP" | "CHAR_GAYMILITARY" | "CHAR_HAO" | "CHAR_HITCHER_GIRL" | "CHAR_HUMANDEFAULT" | "CHAR_HUNTER" | "CHAR_JIMMY" | "CHAR_JIMMY_BOSTON" | "CHAR_JOE" | "CHAR_JOSEF" | "CHAR_JOSH" | "CHAR_LAMAR" | "CHAR_LAZLOW" | "CHAR_LAZLOW2" | "CHAR_LESTER" | "CHAR_LESTER_DEATHWISH" | "CHAR_LEST_FRANK_CONF" | "CHAR_LEST_MIKE_CONF" | "CHAR_LIFEINVADER" | "CHAR_LJT" | "CHAR_LS_CUSTOMS" | "CHAR_LS_TOURIST_BOARD" | "CHAR_MALC" | "CHAR_MANUEL" | "CHAR_MARNIE" | "CHAR_MARTIN" | "CHAR_MARY_ANN" | "CHAR_MAUDE" | "CHAR_MECHANIC" | "CHAR_MICHAEL" | "CHAR_MIKE_FRANK_CONF" | "CHAR_MIKE_TREV_CONF" | "CHAR_MILSITE" | "CHAR_MINOTAUR" | "CHAR_MOLLY" | "CHAR_MP_ARMY_CONTACT" | "CHAR_MP_BIKER_BOSS" | "CHAR_MP_BIKER_MECHANIC" | "CHAR_MP_BRUCIE" | "CHAR_MP_DETONATEPHONE" | "CHAR_MP_FAM_BOSS" | "CHAR_MP_FIB_CONTACT" | "CHAR_MP_FM_CONTACT" | "CHAR_MP_GERALD" | "CHAR_MP_JULIO" | "CHAR_MP_MECHANIC" | "CHAR_MP_MERRYWEATHER" | "CHAR_MP_MEX_BOSS" | "CHAR_MP_MEX_DOCKS" | "CHAR_MP_MEX_LT" | "CHAR_MP_MORS_MUTUAL" | "CHAR_MP_PROF_BOSS" | "CHAR_MP_RAY_LAVOY" | "CHAR_MP_ROBERTO" | "CHAR_MP_SNITCH" | "CHAR_MP_STRETCH" | "CHAR_MP_STRIPCLUB_PR" | "CHAR_MRS_THORNHILL" | "CHAR_MULTIPLAYER" | "CHAR_NIGEL" | "CHAR_OMEGA" | "CHAR_ONEIL" | "CHAR_ORTEGA" | "CHAR_OSCAR" | "CHAR_PAIGE" | "CHAR_PATRICIA" | "CHAR_PA_FEMALE" | "CHAR_PA_MALE" | "CHAR_PEGASUS_DELIVERY" | "CHAR_PLANESITE" | "CHAR_PROPERTY_ARMS_TRAFFICKING" | "CHAR_PROPERTY_BAR_AIRPORT" | "CHAR_PROPERTY_BAR_BAYVIEW" | "CHAR_PROPERTY_BAR_CAFE_ROJO" | "CHAR_PROPERTY_BAR_COCKOTOOS" | "CHAR_PROPERTY_BAR_ECLIPSE" | "CHAR_PROPERTY_BAR_FES" | "CHAR_PROPERTY_BAR_HEN_HOUSE" | "CHAR_PROPERTY_BAR_HI_MEN" | "CHAR_PROPERTY_BAR_HOOKIES" | "CHAR_PROPERTY_BAR_IRISH" | "CHAR_PROPERTY_BAR_LES_BIANCO" | "CHAR_PROPERTY_BAR_MIRROR_PARK" | "CHAR_PROPERTY_BAR_PITCHERS" | "CHAR_PROPERTY_BAR_SINGLETONS" | "CHAR_PROPERTY_BAR_TEQUILALA" | "CHAR_PROPERTY_BAR_UNBRANDED" | "CHAR_PROPERTY_CAR_MOD_SHOP" | "CHAR_PROPERTY_CAR_SCRAP_YARD" | "CHAR_PROPERTY_CINEMA_DOWNTOWN" | "CHAR_PROPERTY_CINEMA_MORNINGWOOD" | "CHAR_PROPERTY_CINEMA_VINEWOOD" | "CHAR_PROPERTY_GOLF_CLUB" | "CHAR_PROPERTY_PLANE_SCRAP_YARD" | "CHAR_PROPERTY_SONAR_COLLECTIONS" | "CHAR_PROPERTY_TAXI_LOT" | "CHAR_PROPERTY_TOWING_IMPOUND" | "CHAR_PROPERTY_WEED_SHOP" | "CHAR_RICKIE" | "CHAR_RON" | "CHAR_SAEEDA" | "CHAR_SASQUATCH" | "CHAR_SIMEON" | "CHAR_SOCIAL_CLUB" | "CHAR_SOLOMON" | "CHAR_STEVE" | "CHAR_STEVE_MIKE_CONF" | "CHAR_STEVE_TREV_CONF" | "CHAR_STRETCH" | "CHAR_STRIPPER_CHASTITY" | "CHAR_STRIPPER_CHEETAH" | "CHAR_STRIPPER_FUFU" | "CHAR_STRIPPER_INFERNUS" | "CHAR_STRIPPER_JULIET" | "CHAR_STRIPPER_NIKKI" | "CHAR_STRIPPER_PEACH" | "CHAR_STRIPPER_SAPPHIRE" | "CHAR_TANISHA" | "CHAR_TAOTRANSLATOR" | "CHAR_TAXI" | "CHAR_TAXI_LIZ" | "CHAR_TENNIS_COACH" | "CHAR_TOM" | "CHAR_TONY_PRINCE" | "CHAR_TOW_TONYA" | "CHAR_TRACEY" | "CHAR_TREVOR" | "CHAR_TW" | "CHAR_WADE" | "CHAR_WENDY" | "CHAR_YOUTUBE" | "DIA_ACULT" | "DIA_AGENT14" | "DIA_AH1_JANITOR" | "DIA_AH2_ARCHITECT" | "DIA_ALAN" | "DIA_ANTON" | "DIA_ARMY" | "DIA_AVERY" | "DIA_AVI" | "DIA_AVON" | "DIA_BANKMAN" | "DIA_BANKMANAGER" | "DIA_BAYGOR" | "DIA_BESTMEN" | "DIA_BIKERENTAL" | "DIA_BOGDAN" | "DIA_BRAD" | "DIA_CAMCREW" | "DIA_CAR3_ACTRESS" | "DIA_CAR3_DIRECTOR" | "DIA_CAR3_SAMUEL" | "DIA_CASEY" | "DIA_CLIFFORD" | "DIA_COMJANE" | "DIA_CONSTRUCTION" | "DIA_CUSTOMER" | "DIA_DEALER" | "DIA_DRIVER" | "DIA_EXT1_RETRIEVER" | "DIA_FIB2_MRK" | "DIA_FINGURU" | "DIA_GARDENER" | "DIA_GARDENING" | "DIA_GEORGINA_CHENG" | "DIA_GOON" | "DIA_GRIFF" | "DIA_GROOM" | "DIA_GUIDO" | "DIA_HEIAGENT1" | "DIA_HEIBUSINESS" | "DIA_HEIJETSKI" | "DIA_HILLBILLY" | "DIA_HOOKER" | "DIA_HOSTAGE" | "DIA_HUANG" | "DIA_IMPORAGE" | "DIA_INFORMANT" | "DIA_JANET" | "DIA_JEROME" | "DIA_JESUS" | "DIA_JETPILOT" | "DIA_JOCK" | "DIA_KAREN" | "DIA_KENNETH" | "DIA_LAMAR" | "DIA_LENNY" | "DIA_LOST" | "DIA_LOVEFIST" | "DIA_MADISON" | "DIA_MAID" | "DIA_MANI" | "DIA_MARKFOST" | "DIA_MAXIM" | "DIA_MAXSEC" | "DIA_MELVIN" | "DIA_MET1_STALKER" | "DIA_MIC" | "DIA_MIGRANT" | "DIA_MILITARYBUM" | "DIA_MILTON" | "DIA_MIME" | "DIA_MOVIESTAR" | "DIA_MRSR" | "DIA_NATALIA" | "DIA_OJBB1_TRUCKER" | "DIA_OJBB2_BIKER" | "DIA_OJBB3_XMECH" | "DIA_OJBB4_ACULT" | "DIA_PATRICIA" | "DIA_PILOT" | "DIA_POLICE" | "DIA_POPOV" | "DIA_POPPYMICH" | "DIA_PRINCESS" | "DIA_PRO1_CLERGY" | "DIA_PRO1_HOSTF1" | "DIA_PRO1_MICHAELMASK" | "DIA_PRO1_TREVORMASK" | "DIA_RACER" | "DIA_RE25_LACEY" | "DIA_RE31A_AIRPORT" | "DIA_RE31C_HIPSTER" | "DIA_RE31E_BRIDE" | "DIA_RE44B_PRISONER" | "DIA_ROCCOPELOSI" | "DIA_SAS1_HUNTER" | "DIA_SCIENTIST" | "DIA_SECURITY" | "DIA_SHOP" | "DIA_SP1_ANDY" | "DIA_TANNOY" | "DIA_TAOTRANSLATOR" | "DIA_TARGET" | "DIA_TENNIS" | "DIA_TERRY" | "DIA_THORNTON" | "DIA_TOMEPSILON" | "DIA_TON3_OWNER" | "DIA_TOUR" | "DIA_TOURIST" | "DIA_TYLERDIX" | "DIA_ULP" | "DIA_VICTIM" | "DIA_VINCENT" | "DIA_VIOLET" | "DIA_WILLY" | "DIA_ZOMBIE1" | "HC_N_ARR" | "HC_N_CHE" | "HC_N_CHR" | "HC_N_DAR" | "HC_N_EDD" | "HC_N_FRANKLIN" | "HC_N_GAN" | "HC_N_GET" | "HC_N_GUS" | "HC_N_HUG" | "HC_N_KAR" | "HC_N_KRM" | "HC_N_LESTER" | "HC_N_LIF" | "HC_N_MICHAEL" | "HC_N_NOR" | "HC_N_PAC" | "HC_N_PAI" | "HC_N_RIC" | "HC_N_TAL" | "HC_N_TREVOR" | "WEB_ACCOUNTANTTVSHOW" | "WEB_ALAMOSEATOURISTBOARD" | "WEB_ALDINAPOLI" | "WEB_APPASS" | "WEB_BAHAMAMAMASWEST" | "WEB_BARBEQUESPACEFLIGHT" | "WEB_BENEFACTOR" | "WEB_BILLANTHONY" | "WEB_BILLYBLUE" | "WEB_BITTERSWEETCELLPHONE" | "WEB_BRIANLEATHERDD" | "WEB_BROTHERADRIAN" | "WEB_BRUCESPADE" | "WEB_BRUCIE_K" | "WEB_BUNUELOADDICT5" | "WEB_CASHFORDEADDREAMS" | "WEB_CHADMULLIGAN" | "WEB_CHERENKOVVODKA" | "WEB_CHUMASH_KIKI" | "WEB_CLAYPGJACKSON" | "WEB_CLUCKINBELL" | "WEB_COWBOY_BECKY" | "WEB_CREDITCARDCONSOLIDATIONKINGS" | "WEB_CREVISOUTDOORAPPAREL" | "WEB_CRISFORMAGE" | "WEB_CUNNINGSTUNTACADEMY" | "WEB_DEBBIEBABES85" | "WEB_DEBRA_PUERTODELSOL" | "WEB_DELANCEYMEDUA" | "WEB_DIGIFARM" | "WEB_DOA" | "WEB_DONTELFORD" | "WEB_DRDALEJENKINS" | "WEB_DRUGOBSERVATIONAGENCY" | "WEB_DUDEEATDOG" | "WEB_ECOLASOFTDRINK" | "WEB_ELECTROTOKE" | "WEB_ERIS" | "WEB_FABIENLAROUCHE" | "WEB_FACADECOMPUTERS" | "WEB_FAMEORSHAME" | "WEB_FEARFIRST" | "WEB_FOOTLONG_FREDDIE" | "WEB_FRUIT" | "WEB_FUKUDAD3" | "WEB_GERALDINOK6" | "WEB_GRAPESEEDCHARLIE" | "WEB_HONKERS" | "WEB_HUSHSMUSH" | "WEB_IMPOTENTRAGE" | "WEB_JACKHOWITZER" | "WEB_JACKSONBBJ" | "WEB_JENNRATT73" | "WEB_JILLSTHENEWBLACK" | "WEB_JILLVONCRASTENBURG" | "WEB_JOCKCRANLEY" | "WEB_JOSHBERNSTEINREALTOR" | "WEB_JUNKENERGYDRINK" | "WEB_JUSTICEFORLEONORA" | "WEB_KANKANJILL" | "WEB_KERRYMCINTOSH" | "WEB_KEVMEISTER_YO" | "WEB_KEVTRIMBALT22" | "WEB_KUNGFURAINBOW" | "WEB_LAZLOW" | "WEB_LOGGERLIGHT" | "WEB_LOMBANK" | "WEB_LONNIE_FIG3" | "WEB_LOSSANTOSPOLICEDEPT" | "WEB_LOUISAXOX91" | "WEB_LSMORTICIANPETE" | "WEB_LSPAPACARLOS" | "WEB_MACKINIT2009" | "WEB_MAGENTA" | "WEB_MANDYBROCOLI" | "WEB_MANOLODEORO2" | "WEB_MCCLIP" | "WEB_METV" | "WEB_MISFIREGAMES" | "WEB_MITCHDEXTER" | "WEB_MORGANCHESTER" | "WEB_MOUSKATEAR" | "WEB_NATIONALOFFICEOFSECURITYENFORCEMENT" | "WEB_NOBBLY_HEAD" | "WEB_PAMELADRAKE" | "WEB_PATO_GRANDE26" | "WEB_PFISTERDESIGN" | "WEB_PILLPHARM" | "WEB_PORCUPINEPETE" | "WEB_POUNDERSFOOTBALL" | "WEB_POWCLEANSE" | "WEB_PREMIUMDELUXEMOTORSPORT" | "WEB_PROP116" | "WEB_RAILROAD_PETE47" | "WEB_RECYCLEHUGO17" | "WEB_REDWOODCIGARETTES" | "WEB_REPUBLICANSPACERANGERS" | "WEB_RIGHT4EVA" | "WEB_ROCKFORD_CAPTAIN67" | "WEB_ROCKFORD_PRIVATETENNIS" | "WEB_RUSTYBROWNSDONUTS" | "WEB_SANDYSURESTEVE" | "WEB_SEBASTIANDIXFASHION" | "WEB_SERIOUSCOUGARSHOW" | "WEB_SEXTONDANIELS" | "WEB_SEXXISANDRA_RUGGIRL" | "WEB_SILLYJILLY28" | "WEB_SIXFIGURETEMPS" | "WEB_SORRYCOMMODEBAND" | "WEB_SPRUNK" | "WEB_STABFINO" | "WEB_SUEMURRY" | "WEB_SWALLOWCLOTHING" | "WEB_SWINGERSBASEBALL" | "WEB_TACOBRENDAN" | "WEB_THECRAZE" | "WEB_THOMASSTIGHT_YEAH" | "WEB_TITOTITTYFAN" | "WEB_TOESHOES" | "WEB_TONYMCTONY" | "WEB_USAFRANKIEG" | "WEB_VINEWOODLIONEL67" | "WEB_WHIZWIRELESS" | "WEB_YOURDEADFAMILY" | "WEB_YOURNEWBABYSNAME" | "WEB_YUNGMARLON";



@Table({ modelName: "pAFk3qiAgG1_users_notify" })
export class userNotifyEntity extends Model<userNotifyEntity> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;
  @Column({
    type: Sequelize.INTEGER(5),
    allowNull: false
  })
  user: number;
  /** Сообщение */
  @Column({
    type: Sequelize.TEXT,
    allowNull: false,
  })
  message: string;
  /** Заголовок */
  @Column({
    type: Sequelize.STRING(120),
    allowNull: true,
  })
  title: string;
  /** Иконка, если необходима */
  @Column({
    type: Sequelize.STRING(120),
    allowNull: true,
  })
  icon?: notifyPictures;
  /** Тип */
  @Column({
    type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: "alert"
  })
  position: showPosition;
  /** Стиль */
  @Column({
    type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: "info"
  })
  type: showType;
  /** Администратор */
  @Column({
    type: Sequelize.INTEGER(11),
    defaultValue: () => {
      return methods.getTimeStamp()
    },
    allowNull: false
  })
  timestamp: number;
  /** Статус просмотра игроком данного варна */
  @Column({
    type: Sequelize.INTEGER(1),
    defaultValue: '0',
    get(this: userNotifyEntity): boolean {
      return this.getDataValue('notified') == 1
    },
    set(this: userNotifyEntity, value: boolean) {
      this.setDataValue('notified', value ? 1 : 0);
    }
  })
  notified: boolean;
}

