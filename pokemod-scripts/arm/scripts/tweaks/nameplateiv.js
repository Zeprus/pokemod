var baseAddr = Module.findBaseAddress('libil2cpp.so');
var namePlateHP;
var namePlateATK;
var namePlateDEF;
var namePlateCP;
var namePlateIV;
var namePlateLVL;
var namePlateCPMULT;

//class PokemonProto

function getPokemonStats(PokemonProtoObject) {
	if(PokemonProtoObject == "0x0"){ /*Mod.NoTranslate*/
		return;
	};
	var gameMasterData = PokemonProto_get_gameMasterData(PokemonProtoObject);
    namePlateCPMULT = PokemonProtoObject.add("0x60").readPointer(); /*Mod.NoTranslate*/
    namePlateLVL = getLevelFromCpm(gameMasterData, namePlateCPMULT);
    namePlateATK = PokemonProtoObject.add("0x54").readInt(); /*Mod.NoTranslate*/
    namePlateDEF = PokemonProtoObject.add("0x58").readInt(); /*Mod.NoTranslate*/
    namePlateHP = PokemonProtoObject.add("0x5C").readInt(); /*Mod.NoTranslate*/
    namePlateIV = Math.round((100 * (namePlateATK + namePlateDEF + namePlateHP) / 45) * 10) / 10 + "%";
}

//public class GameMasterData
//	public int GetPokemonLevelOfCpMultiplier(float cpMultiplier);
var getLevelFromCpm = new NativeFunction(baseAddr.add("0xBB746C"), 'int', ['pointer', 'pointer']);

//class PokemonProto
//	private GameMasterData get_gameMasterData();
var PokemonProto_get_gameMasterData = new NativeFunction(baseAddr.add("0x157DFAC"), 'pointer', ['pointer']);
//public sealed class EncounterOutProto
//public WildPokemonProto get_Pokemon();
var getWildPokemon = baseAddr.add("0x1A32040");
//class WildPokemonProto
//public PokemonProto get_Pokemon();
var getPokemonWild = new NativeFunction(baseAddr.add("0x11C1D34"), 'pointer', ['pointer']);
Interceptor.attach(getWildPokemon, {
	onLeave: function (retval) {
		if(retval == "0x0"){ /*Mod.NoTranslate*/
			return;
		};
		var nativeRet = getPokemonWild(retval);
		getPokemonStats(nativeRet);
	}
});
//public sealed class RaidEncounterProto
//public PokemonProto get_Pokemon();
var getRaidPokemon = baseAddr.add("0x199AE04");
Interceptor.attach(getRaidPokemon, {
	onLeave: function (retval) {
		getPokemonStats(retval);
	}
});


//public class PhotobombingMapPokemon
//public PokemonProto get_Pokemon();
var getPhotobombPokemon = baseAddr.add("0x7B39D4");
Interceptor.attach(getPhotobombPokemon, {
	onLeave: function(retval){
		getPokemonStats(retval);
	}
});	

//public sealed class IncenseEncounterOutProto
//public PokemonProto get_Pokemon();
var getIncensePokemon = baseAddr.add("0x1B2EF80");
Interceptor.attach(getIncensePokemon, {
	onLeave: function(retval){
		getPokemonStats(retval);
	}
});

//public sealed class QuestPokemonEncounterProto
//public PokemonProto get_Pokemon();
var getQuestPokemon = baseAddr.add("0x198AA0C");
Interceptor.attach(getQuestPokemon, {
	onLeave: function(retval){
			getPokemonStats(retval);
	}
});

//public sealed class DiskEncounterOutProto
//public PokemonProto get_Pokemon();
var getDiskPokemon = baseAddr.add("0x1A2A418");
Interceptor.attach(getDiskPokemon, {
	onLeave: function(retval){
			getPokemonStats(retval);
	}
});

//public sealed class InvasionEncounterOutProto
//	public PokemonProto get_EncounterPokemon();
var getShadowPokemon = baseAddr.add("0x1B33FEC");
Interceptor.attach(getShadowPokemon, {
	onLeave: function(retval){
			getPokemonStats(retval);
	}
});

//public class Text : MaskableGraphic, ILayoutElement // TypeDefIndex: 3125
//	public virtual void set_text(string value); // RVA: 0x24FB4A4 Offset: 0x24FB4A4
var Text_set_text = new NativeFunction(baseAddr.add("0x2659574"), "void", ["pointer", "pointer"]);

//public class EncounterNameplate : MonoBehaviour // TypeDefIndex: 6783
//  private Text nameText; // 0x18
//	public void SetPokemonUI(IMapPokemon mapPokemon, GameplayWeatherProto.Types.WeatherCondition weatherCondition);
Interceptor.attach(baseAddr.add("0xB4462C"), {
    onEnter: function(args){
        this.object = args[0];
        this.mapPokemon = args[1];
    },
    onLeave: function(retval){
		var nameText = this.object.add("0x18").readPointer(); /*Mod.NoTranslate*/
		var nickname = Memory.allocUtf16String(namePlateIV + "	LVL " + namePlateLVL + "\n" + namePlateATK + "/" +  namePlateDEF + "/" + namePlateHP).sub("0xC"); /*Mod.NoTranslate*/
		Text_set_text(nameText, nickname);
    }
});