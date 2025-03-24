var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class PokemonInfoPanel : MonoBehaviour // TypeDefIndex: 11185
//	private void TryUpgradePokemon();
var PokemonInfoPanel_TryUpgradePokemon = new NativeFunction(baseAddr.add("0x1168C88"), "void", ["pointer"]);
Interceptor.attach(baseAddr.add("0x1168C88"), {
    onEnter: function(args){
        /*
        private float upgradeStartDelayTime; // 0x18C
	    private float upgradeCpDelayTime; // 0x194
	    private float upgradeCpTweenTime; // 0x198
	    private float upgradeStaminaDelayTime; // 0x19C
	    private float upgradeStaminaTweenTime; // 0x1A0
	    private float upgradeModelSpinTime; // 0x1A4
	    private float afterUpgradeDelayTime; // 0x1A8
        */
        args[0].add("0x310").writeFloat(0); /*Mod.NoTranslate*/
        args[0].add("0x318").writeFloat(0); /*Mod.NoTranslate*/
        args[0].add("0x31C").writeFloat(0); /*Mod.NoTranslate*/
        args[0].add("0x320").writeFloat(0); /*Mod.NoTranslate*/
        args[0].add("0x324").writeFloat(0); /*Mod.NoTranslate*/
        args[0].add("0x328").writeFloat(0); /*Mod.NoTranslate*/
        args[0].add("0x32C").writeFloat(0); /*Mod.NoTranslate*/
    }
});
//	private IEnumerator`1<ISchedule> ProcessUpgrade(PokemonProto prevPokemon, PokemonProto newPokemon); // RVA: 0x9E3AA4 Offset: 0x9E3AA4
Interceptor.attach(baseAddr.add("0x1169AB4"),{
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        PokemonInfoPanel_TryUpgradePokemon(this.object);
    }
});
