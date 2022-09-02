import { methods } from '../modules/methods';
import { user } from '../user';
import { exec } from 'child_process';

export const restartConf = {
	status: false,
	set: (value:boolean) =>{
		restartConf.status = value;
	}
}
setTimeout(() => {
	setInterval(() => {
		let dateTime = new Date();
		if (dateTime.getHours() == 4 && dateTime.getMinutes() == 50)
			methods.notifyToAll('Sunucu 15 dakika sonra yeniden başlatılır');
		if (dateTime.getHours() == 4 && dateTime.getMinutes() == 59)
			methods.notifyToAll('Sunucu 5 dakika içinde yeniden başlatılır');
		if (dateTime.getHours() == 5 && dateTime.getMinutes() == 2){
			methods.saveAll()
			if (restartConf.status){
				exec("npm run production");
			}
		} 
		if (dateTime.getHours() == 5 && dateTime.getMinutes() == 3) {
			mp.players.forEach(function(p) {
				if (mp.players.exists(p)) user.kick(p, 'Yeniden Başlat');
			});
			setTimeout(() => {
				methods.restartServer();
			}, 2000);
		}
	}, 60000);
}, 60000 * 60 * 5);
