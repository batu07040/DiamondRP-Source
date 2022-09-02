import { _MAP_iconURL } from "../config";
import { _disabledBlips } from "./init";

// divide by 2 since we want to make icons 32x32 images
var customImageWidth = 64 / 2; // 64 =  sheetWidth / 16
var customImageHeight = 64 / 2; // 64 = sheetHeight / 16

export type MarkerTypeInterface = { scaledSize?: google.maps.Size, name?:string, icon: string, size: google.maps.Size, origin: google.maps.Point, anchor: google.maps.Point }

export var MarkerTypes: { [id: number]: MarkerTypeInterface} = {
    0: {
        icon: "blank.png",
        size: new google.maps.Size(0, 0),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 0)
    },
    999: {
        icon: "debug.png",
        size: new google.maps.Size(23, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11.5, 32)
    },
    // Apparently players have an icon of "6" so, might as well make normal that
    6: {
        icon: "normal.png",
        size: new google.maps.Size(22, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 32)
    }
    // Custom markers are generated and added below
};


// FUCK ME, GTA HAS A LOT OF FUCKING BLIPS
var types:{[name:string]:{id?:number,x?:number,y?:number}} = {
    Standard: {id: 1, x: 0, y: 0},
    Jet: {id: 16},
    Lift: {id: 36},
    RaceFinish : {id: 38},
    Safehouse : {id: 40},
    PoliceHelicopter: {id: 43},
    ChatBubble : {id: 47},
    Garage2 : {id: 50},
    Drugs : {},
    Store : {},
    PoliceCar : {id: 56},
    PoliceStation : {id: 60, x : 12, y: 0},
    Hospital : {},
    Helicopter : {id: 64},
    StrangersAndFreaks : {},

    ArmoredTruck : { x : 0, y:1 },
    TowTruck : {id: 68},
    Barber : {id: 71},
    LosSantosCustoms : {},
    Clothes : {},
    TattooParlor : {id: 75},
    Simeon : {},
    Lester : {},
    Michael : {},
    Trevor : {},
    Rampage : {id: 84, x : 11},
    VinewoodTours : {},
    Lamar : {},
    Franklin : {id: 88},
    Chinese : {},

    Airport : {x : 0, y: 2},
    Bar : {id: 93},
    BaseJump : {},
    CarWash : {id: 100, x: 4},
    ComedyClub : {id: 102},
    Dart : {},
    Fib : {id: 106, x: 9},
    Bank : {id: 108, x: 11}, // These are generally "banks". Original: DollarSign
    Golf : {},
    AmmuNation : {},
    Exile : {id: 112},

    ShootingRange : {id: 119, x: 1, y: 3},
    Solomon : {},
    StripClub : {},
    Tennis : {},
    Triathlon : {id: 126, x: 7},
    OffRoadRaceFinish : {},
    Key : {id: 134, x: 10},
    MovieTheater : {},
    Music : {},
    Marijuana : {id: 140, x:14 },
    Hunting : {},

    ArmsTraffickingGround : {id: 147, y: 4, x: 0},
    Nigel : {id: 149},
    AssaultRifle : {},
    Bat : {},
    Grenade : {},
    Health : {},
    Knife : {},
    Molotov : {},
    Pistol : {},
    Rpg : {},
    Shotgun : {},
    Smg : {},
    Sniper : {},
    PointOfInterest: {id: 162},
    GtaOPassive : {},
    GtaOUsingMenu : {},

    Minigun : {id: 173, x:0, y: 5},
    GrenadeLauncher : {},
    Armor : {},
    Castle : {},
    Camera : {id: 184, x: 7},
    Handcuffs : {id: 188, x: 11},
    Yoga : {id: 197},
    Cab : {},
    Shrink: {id: 205},
    Epsilon : {},

    PersonalVehicleCar : {id: 225, x: 5, y: 6},
    PersonalVehicleBike : {},
    Custody : {id: 237, x:10},
    ArmsTraffickingAir : {id: 251},
    Fairground : {id: 266, x: 15},

    PropertyManagement : {x: 0, y: 7},
    Altruist : {id: 269},
    Chop : {id: 273, x: 3},
    Hooker : {id: 279, x: 7},
    Friend : {},
    GtaOMission: {id: 304, x: 14},
    GtaOSurvival : {},

    CrateDrop : { x:0, y:8},
    PlaneDrop : {},
    Sub : {},
    Race : {},
    Deathmatch : {},
    ArmWrestling : {},
    AmmuNationShootingRange : {id: 313},
    RaceAir : {},
    RaceCar : {},
    RaceSea : {},
    GarbageTruck : {id: 318, x:11},
    SafehouseForSale : {id: 350, x:14},
    Package : {},

    MartinMadrazo: {x:0, y: 9},
    Boost: {id: 354},
    Devin : {},
    Marina : {},
    Garage : {},
    GolfFlag : {},
    Hangar : {},
    Helipad : {},
    JerryCan : {},
    Masks : {},
    HeistSetup : {},
    PickupSpawn : {id: 365},
    BoilerSuit : {},
    Completed : {},
    Rockets : {},
    GarageForSale : {},

    HelipadForSale : {x: 0, y: 10},
    MarinaForSale : {},
    HangarForSale : {},
    Business : {id: 374},
    BusinessForSale : {},
    RaceBike : {},
    Parachute : {},
    TeamDeathmatch : {},
    RaceFoot : {},
    VehicleDeathmatch : {},
    Barry : {},
    Dom : {},
    MaryAnn : {},
    Cletus : {},
    Josh : {},
    Minute : {},

    Omega:  {x:0, y:11},
    Tonya : {},
    Paparazzo : {},
    Abigail : {id: 400},
    Blimp : {},
    Repair : {},
    Testosterone : {},
    Dinghy : {},
    Fanatic : {},
    CaptureBriefcase : {id: 408},
    LastTeamStanding : {},
    Boat : {},
    CaptureHouse : {},
    JerryCan2 : {id: 415,  x: 14},
    CaptureAmericanFlag : {id: 419},

    CaptureFlag : {x:0, y: 12},
    Tank : {},
    GunCar : {id: 426, x: 3},
    Speedboat : {},
    Heist : {},
    Stopwatch : {id: 430},
    DollarSignCircled : {},
    Crosshair2 : {},
    DollarSignSquared : {id: 434}
};

var nameToId:{[name:string]:number} = {};

var blipCss = `.blip {
    background: url("${_MAP_iconURL}blips_texturesheet.png");
    background-size: ${1024/2}px ${1024/2}px;
    display: inline-block;
    width: ${customImageWidth}px;
    height: ${customImageHeight}px;
}`;

function generateBlipControls(){
    for(var blipName in types){
        $("#blip-control-container").append(`<a data-blip-number="${nameToId[blipName]}" id="blip_${blipName}_link" class="blip-button-a list-group-item d-inline-block collapsed blip-enabled" href="#"><span class="blip blip-${blipName}"></span></a>`);

      
    }

    // Events
    $(".blip-button-a").on("click", function(e){
        var ele = $(e.currentTarget);
        var blipId = ele.data("blipNumber").toString();

        // Toggle blip
        if(_disabledBlips.includes(blipId)){
            // Already disabled, enable it
            _disabledBlips.splice(_disabledBlips.indexOf(blipId), 1);
            ele.removeClass("blip-disabled").addClass("blip-enabled");
        }else{
            // Enabled, disable it
            _disabledBlips.push(blipId);
            ele.removeClass("blip-enabled").addClass("blip-disabled");
        }

    });

}

function generateBlipShit(){
    var currentX = 0, currentY = 0, currentId = 0;

    var previousLeft = 0, previousTop = 0;
    var linePadding = 0;

    for(var blipName in types){
        var blip = types[blipName];

        if(typeof(blip.id) != 'undefined'){
            currentId = blip.id;
        }else{
            currentId ++;
        }

        if(typeof(blip.x) != 'undefined'){
            currentX = blip.x;
        }else{
            currentX ++;
        }

        if(typeof(blip.y) != 'undefined'){
            currentY = blip.y;
        }

        MarkerTypes[currentId] = {
            name: blipName.replace(/([A-Z0-9])/g, ' $1').trim(),
            icon: "blips_texturesheet.png",
            size: new google.maps.Size( customImageWidth, customImageHeight ),
            anchor: new google.maps.Point( customImageWidth/2, customImageHeight ),
            scaledSize: new google.maps.Size( 1024/2,1024/2 ),
            origin: new google.maps.Point( customImageWidth * currentX , customImageHeight * currentY ),
        };

        nameToId[blipName] = currentId;

        // CSS GENERATOR FOR BLIP ICONS IN HTML
        // Just add the class "blip blip-<NAME>" to the element for blip icons
        // e.g. <span class="blip blip-Standard"> for a Standard blip
        var left = (currentX * customImageWidth) + linePadding; // 0 = padding between images
        var top = (currentY * customImageHeight) + linePadding; // 0 = padding

        // For styling spans and shit
        blipCss += `.blip-${blipName} { background-position: -${left}px -${top}px }
`;
    }

    $("head").append(`<style>${blipCss}</style>`);
    setTimeout(generateBlipControls, 50);
}

setTimeout(generateBlipShit, 50);
