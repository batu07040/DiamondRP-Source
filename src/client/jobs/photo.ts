/// <reference path="../../declaration/client.ts" />

import { methods } from '../modules/methods';
import { user } from '../user';
import { jobPoint } from '../managers/jobPoint';
import { gui } from '../modules/gui';


let isProcess = false;
let _checkpointId = -1;
let price = 0;

let photo = {
    markers: [[-2147.697, -500.8055, 1.808812], [-1802.926, -979.5959, 0.8247299], [-1529.48, -1170.853, 0.6652265], [-1150.43, -1883.995, 0.8556018], [-951.2028, -984.1022, 0.2137202], [-785.668, -1493.263, 0.5745819], [-113.2224, -1879.044, 0.6524521], [1215.647, -2708.443, 0.6189926], [1109.928, -1220.048, 15.36792], [663.9535, -498.1472, 15.08265], [1100.557, -555.3084, 55.89379], [1264.158, -1045.235, 38.68134], [1098.827, -160.9295, 53.86881], [1928.864, 410.9628, 161.0442], [2837.639, -679.6146, 0.5003721], [29.41303, 871.0053, 196.5249], [-180.1949, 795.683, 196.4767], [-3116.456, 438.9633, 0.9076679], [-3225.826, 1353.027, 0.7466202], [-1500.024, 1574.277, 105.0456], [-1651.97, 2579.359, 0.5195942], [-2090.691, 2612.525, 0.4330854], [-1245.869, 2664.031, 0.4098645], [-415.5812, 2944.076, 13.85313], [297.7439, 3553.998, 30.04643], [-170.1436, 4137.855, 30.58113], [-215.3174, 4327.854, 30.36332], [-870.7251, 4432.679, 15.36371], [-1657.555, 4464.896, 0.3635531], [-1879.15, 4783.202, 0.9304351], [-3194.069, 3262.599, 0.3009984], [-1005.672, 6275.037, 1.211535], [-127.4178, 6736.716, 0.7080706], [146.1358, 7097.081, 0.4930558], [1508.745, 6639.454, 1.264099], [2588.054, 6141.128, 162.1035], [3366.186, 5193.819, 0.1716362], [3842.051, 4489.926, 0.8470399], [2434.03, 4618.897, 29.06884], [2119.215, 4575.23, 30.61998], [2166.003, 3830.607, 30.69661], [1580.655, 3914.799, 30.49529], [1413.794, 4258.563, 30.6244], [706.6923, 4139.002, 30.32208], [-1691.388, -207.5315, 56.70388], [1673.238, -2497.599, 79.63357], [1387.134, -1945.667, 65.68669], [2004.425, -886.1641, 79.07301], [2730.614, -740.934, 20.75201], [1650.889, -64.17523, 164.6689], [2169.16, 128.5417, 228.2811], [1976.624, 905.296, 223.8133], [-2076.867, -126.9384, 36.53727], [-2303.513, 545.1491, 182.4584], [-2236.82, 1044.593, 208.015], [-3130.185, 1343.642, 20.21685], [-2820.715, 2249.65, 29.77978], [-2362.491, 2787.569, 2.682229], [-2270.325, 4322.655, 43.0285], [-1512.462, 4239.353, 65.27418], [-1216.76, 4444.553, 29.99684], [-1133.724, 4660.337, 243.7695], [-274.677, 4686.053, 236.7642], [-483.1308, 5619.704, 64.67578], [72.52802, 7049.892, 15.5201], [821.9828, 6449.445, 31.53106], [1624.15, 6655.603, 23.72502], [202.1006, 5278.594, 610.1451], [1392.455, 5536.185, 466.5204], [1600.266, 5804.852, 415.5432], [1674.373, 5143.856, 150.8606], [3364.964, 5454.675, 17.09648], [3623.534, 4518.104, 38.99737], [2442.344, 4397.227, 34.90043], [1540.602, 4520.084, 59.09164], [167.5663, 4399.423, 78.29996], [-393.0041, 4380.564, 54.61767], [-144.3843, 2916.276, 40.98077], [-1257.691, 2500.003, 29.30817], [-2061.354, 1984.752, 197.8799], [-1339.939, 728.8558, 185.5612], [-315.0531, 1296.85, 345.9303], [-229.5341, 2153.169, 146.8271], [591.9678, 2092.038, 86.7029], [866.6752, 1194.328, 345.6783], [1110.347, 734.1995, 156.8002], [2427.27, 2006.669, 84.59879], [2953.969, 2786.999, 41.49084], [2397.269, 3685.833, 56.83162], [1379.197, 2642.405, 47.51794], [1094.303, 3243.898, 37.71872], [-1623.738, 96.66486, 62.11858], [-1499.166, -739.9906, 26.20651], [-1550.103, -694.4716, 29.21308], [-80.43311, -420.6727, 36.78386], [-1608.822, -643.9052, 31.38339], [-1481.061, 130.019, 55.6546], [-1674.133, -601.9937, 33.72008], [212.2592, -379.3662, 44.40764], [-1817.289, -464.2487, 42.90029], [268.4755, -400.9404, 44.81379], [-1556.303, 118.2675, 56.79749], [-1887.14, -405.7795, 48.03875], [-1569.9, -5.048523, 60.0406], [-1510.645, 1.18523, 56.76347], [-1471.073, 43.35913, 54.01854], [-837.3448, -937.908, 15.98954], [-999.4036, -646.9059, 23.88176], [-1447.015, -13.90357, 54.65688], [-849.4641, -1009.881, 13.41574], [-885.2766, -878.1136, 16.05929], [-1128.506, -1253.044, 6.866948], [-1863.341, 214.3598, 84.29323], [-1134.065, -1239.2, 6.233136], [1049.006, -605.6581, 57.25797], [971.6022, -611.0195, 58.47553], [-1304.935, -952.8572, 9.341719], [-1328.938, -961.0013, 8.179737], [977.6599, -533.1627, 59.84], [-1441.158, -917.528, 11.88954], [-1040.217, -1308.903, 6.020633], [-882.3195, -1208.285, 5.319786], [-970.1645, -1259.546, 5.582035], [-1948.157, 370.0023, 93.61497], [-1145.459, -1280.558, 7.2417], [-1829.874, 282.9827, 86.09788], [-843.1174, 112.1876, 55.17134], [-843.4338, 100.1544, 53.20478], [-1374.987, -1136.972, 4.693842], [-843.9388, 173.9445, 69.80807], [-1697.869, 364.2751, 87.15717], [-838.0018, 186.1826, 72.13165], [-1445.205, -921.1709, 12.45693], [-935.3578, 113.6355, 57.12218], [-956.7496, 105.7805, 56.15186], [-1315.548, -1112.302, 6.956872], [-990.7855, 156.2806, 61.41539], [-1351.03, -1362.751, 4.462386], [-946.5805, 188.8411, 66.63117], [-1325.24, -1394.652, 5.359413], [-918.2573, 184.5136, 68.65635], [-1215.592, 128.7445, 58.68906], [-1298.852, -1438.6, 4.97308], [-1225.961, -1548.186, 4.601189], [-1058.372, 232.0741, 63.91761], [-1264.696, -1570.552, 4.459717], [-1350.352, -1491.232, 4.782222]],

    start: function() {
        if (isProcess) {
            mp.game.ui.notifications.show('~r~Вы уже получили задание');
            return;
        }
        mp.game.ui.notifications.showWithPicture('Life Invader', "323-777-777", 'Скинул координаты точки', "CHAR_LIFEINVADER", 1);
        photo.findRandomPickup();
    },

    findRandomPickup: function() {
        isProcess = true;
        let pickupId = methods.getRandomInt(0, photo.markers.length - 1);
        let pos = new mp.Vector3(photo.markers[pickupId][0], photo.markers[pickupId][1], photo.markers[pickupId][2]);
        price = methods.parseInt(methods.distanceToPos(pos, mp.players.local.position) / 50);
        if (price > 400)
            price = 400;
        _checkpointId = jobPoint.create(pos);
        user.setWaypoint(photo.markers[pickupId][0], photo.markers[pickupId][1]);
    },

    workProcess: function() {
        let pos = mp.players.local.position;
        photo.markers.forEach(function(item) {
            let pPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pPos, pos) < 2) {
                if(mp.players.local.vehicle) return mp.game.ui.notifications.show('~r~Покиньте транспорт');
                isProcess = true;
                methods.disableAllControls(true);
                try {
                    jobPoint.delete();
                }
                catch (e) {
                    methods.debug(e);
                }
                _checkpointId = -1;

                user.playScenario("WORLD_HUMAN_PAPARAZZI");

                setTimeout(function() {
                    isProcess = false;
                    methods.disableAllControls(false);
                    user.stopScenario();
                    user.giveJobMoney(methods.getRandomInt(30, 50) + price);
                    user.giveJobSkill();
                    price = 0;
                }, 30000);
            }
        });
    }

};


mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(gui.isActionGui()) return;
    if (!isProcess) return;
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId)
        photo.workProcess();
});

export { photo };