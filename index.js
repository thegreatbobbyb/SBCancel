const DELAY = 180; // SBCancel delay in ms
// Stuff
const SB_1 = 181100;
const SB_2 = 181101;
const BLOCK = 20200;

module.exports = function SbCancel(mod) {
    let enabled = true;
    let w;
    let loc;
	let hooks = [];
	let lancer = false;
    
    mod.command.add('sbcancel', () => {
        enabled = !enabled;
        mod.command.message(`SBCancel is now ${enabled ? 'en' : 'dis'}abled.`);
		(lancer && enabled) ? load() : unload();
    })

    function dispatchInjectedSBCancel() {
        mod.toServer('C_PRESS_SKILL', 4, {
            skill: {reserved: 0, npc: false, type: 1, huntingZoneId: 0, id: BLOCK},
            press: true,
            loc: loc,
            w: w
        })
        setTimeout(function(){
            mod.toServer('C_PRESS_SKILL', 4, {
                skill: {reserved: 0, npc: false, type: 1, huntingZoneId: 0, id: BLOCK},
                press: false,
                loc: loc,
                w: w
            })
        }, 10)
        setTimeout(function(){
            mod.toServer('C_START_SKILL', 7, {
                skill: {reserved: 0, npc: false, type: 1, huntingZoneId: 0, id: SB_2},
                w: w,
                loc: loc,
                dest: {x: 0, y: 0, z: 0},
                unk: true,
                moving: false,
                continue: false,
                target: 0n,
                unk2: false
            })
        }, 20)
    }
	
	mod.hook('S_LOGIN', 13, (event) => {
		lancer = ((event.templateId - 10101) % 100) == 1;
        (lancer && enabled) ? load() : unload();
    });
	
	function hook(){ hooks.push(mod.hook(...arguments)); }
	
	function unload(){
		if(hooks.length){
			for (let h of hooks)
				mod.unhook(h);
			hooks = [];
		}
	}    
    
	function load(){
		if(!hooks.length){
			hook('C_START_SKILL', 7, {order: -999999}, (event) => {
				if(event.skill.id == SB_1){
					w = event.w;
					loc = event.loc;
					setTimeout(function(){
						dispatchInjectedSBCancel()
					}, DELAY)
				}
			})
		}
	}
}