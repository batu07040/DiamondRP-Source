let camera: CameraMp = null;
let entity:EntityMp = null;

class Rotator {
	fixheading: number;
	activate: boolean;
	heading: any;
	start(entity: EntityMp) {
		this.fixheading = 0;
		this.activate = true;
		this.set(entity);
	}
	stop() {
		this.activate = false; 
		entity = null;
	}
	set(entity: EntityMp) { 
		entity = entity;
		this.heading = entity.getHeading();
	}

	onMouseMove(dX: number) {
		this.fixheading = dX;
		let mf = this.heading + this.fixheading;
		if (mf > 360) mf -= 360;
		entity.setHeading(mf);
	} 
	pause() { this.heading = entity.getHeading(); }
}

let FUNCTION = new Rotator(); 
let min: number = null;
let currect = null; 
mp.events.add("render", () => {
	if(!FUNCTION.activate) return;
	if (!mp.gui.cursor.visible) return; 
	const x = mp.game.controls.getDisabledControlNormal(2, 239) * 150; 
	if (mp.game.controls.isDisabledControlPressed(2, 238)) {
		if ( min === null) min = x; 
		if (FUNCTION.heading === x - min) return;
		if (x === min) return;
		FUNCTION.onMouseMove(x - min);
		let currFov = camera.getFov();
		if (mp.game.controls.isDisabledControlPressed(2, 241) && currFov > 0) camera.setFov(currFov+1); // up
		else if (mp.game.controls.isDisabledControlPressed(2, 242) && currFov > 0) camera.setFov(currFov-1); // downl
	}else{
		min = null
		FUNCTION.pause();
	}
});

// function drawDebugText(cr, m, sepro) {
// 	let message = `DEBUG TEXT`; 
// 	message += `\nC: ${cr}`;
// 	message += `\nM: ${m}`;
// 	message += `\nS: ${sepro}`;
// 	message += `\nF: ${Rotator.fixheading}`;
// 	message += `\nH: ${Rotator.heading}`;
// 	mp.game.graphics.drawText(message, [0.5, 0.005], {font: 7,color: [255, 255, 255, 185],scale: [0.8, 0.8],outline: true,centre: true});
// } 
export {FUNCTION};