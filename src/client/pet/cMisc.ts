/// <reference path="../../declaration/client.ts" />

function isInRangeOfPoint(pos1, pos2, range)
{
    return (
        Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        ) <= range
    );
}
export {isInRangeOfPoint} ;

function getRandom(min:any, max:any) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export {getRandom};