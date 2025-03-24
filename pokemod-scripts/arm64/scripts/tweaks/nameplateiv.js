var baseAddr = Module.findBaseAddress('libil2cpp.so');
var namePlateHP;
var namePlateATK;
var namePlateDEF;
var namePlateCP;
var namePlateIV;
var namePlateLVL;
var namePlateNAME;
var namePlateCPMULT;

function allocString(string){
	var stringLength = string.length * 2;
	var location = Memory.alloc(stringLength + 4);
	location.writeInt(string.length);
	location.add(0x4).writeUtf16String(string);
	return(location.sub(0x10));
}

//class PokemonProto
//	public string GetSpeciesName();
var getSpeciesName = new NativeFunction(baseAddr.add("0x1A009FC"), 'pointer', ['pointer']);

function getPokemonStats(PokemonProtoObject) {
	if(PokemonProtoObject == "0x0"){ /*Mod.NoTranslate*/
		return;
	};
	var gameMasterData = PokemonProto_get_gameMasterData(PokemonProtoObject);
	namePlateCPMULT = PokemonProtoObject.add("0x70").readFloat(); /*Mod.NoTranslate*/
    namePlateLVL = getLevelFromCpm(gameMasterData, CPMULT);
    namePlateATK = PokemonProtoObject.add("0x64").readInt(); /*Mod.NoTranslate*/
    namePlateDEF = PokemonProtoObject.add("0x68").readInt(); /*Mod.NoTranslate*/
    namePlateHP = PokemonProtoObject.add("0x6C").readInt(); /*Mod.NoTranslate*/
    namePlateNAME = getSpeciesName(PokemonProtoObject).add("0x14").readUtf16String(); /*Mod.NoTranslate*/
    namePlateIV = Math.round((100 * (ATK + DEF + HP) / 45) * 10) / 10 + "%";
}

//public class GameMasterData
//	public int GetPokemonLevelOfCpMultiplier(float cpMultiplier);
var getLevelFromCpm = new NativeFunction(baseAddr.add("0x14F70EC"), 'int', ['pointer', 'float']);

//class PokemonProto
//	private GameMasterData get_gameMasterData();
var PokemonProto_get_gameMasterData = new NativeFunction(baseAddr.add("0x1A00638"), 'pointer', ['pointer']);
//public sealed class EncounterOutProto
//public WildPokemonProto get_Pokemon();
var getWildPokemon = baseAddr.add("0x21D9AD4");
//class WildPokemonProto
//public PokemonProto get_Pokemon();
var getPokemonWild = new NativeFunction(baseAddr.add("0x180E150"), 'pointer', ['pointer']);
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
var getRaidPokemon = baseAddr.add("0x203408C");
Interceptor.attach(getRaidPokemon, {
	onLeave: function (retval) {
		getPokemonStats(retval);
	}
});


//public class PhotobombingMapPokemon
//public PokemonProto get_Pokemon();
var getPhotobombPokemon = baseAddr.add("0x1561F20");
Interceptor.attach(getPhotobombPokemon, {
	onLeave: function(retval){
		getPokemonStats(retval);
	}
});	

//public sealed class IncenseEncounterOutProto
//public PokemonProto get_Pokemon();
var getIncensePokemon = baseAddr.add("0x2292350");
Interceptor.attach(getIncensePokemon, {
	onLeave: function(retval){
		getPokemonStats(retval);
	}
});

//public sealed class QuestPokemonEncounterProto
//public PokemonProto get_Pokemon();
var getQuestPokemon = baseAddr.add("0x2158AFC");
Interceptor.attach(getQuestPokemon, {
	onLeave: function(retval){
			getPokemonStats(retval);
	}
});

//public sealed class DiskEncounterOutProto
//public PokemonProto get_Pokemon();
var getDiskPokemon = baseAddr.add("0x21D2F80");
Interceptor.attach(getDiskPokemon, {
	onLeave: function(retval){
			getPokemonStats(retval);
	}
});

//public sealed class InvasionEncounterOutProto
//	public PokemonProto get_EncounterPokemon();
var getShadowPokemon = baseAddr.add("0x2296A24");
Interceptor.attach(getShadowPokemon, {
	onLeave: function(retval){
			getPokemonStats(retval);
	}
});

//public class Text : MaskableGraphic, ILayoutElement // TypeDefIndex: 3125
//	public virtual void set_text(string value); // RVA: 0x24FB4A4 Offset: 0x24FB4A4
var Text_set_text = new NativeFunction(baseAddr.add("0x2C8AF54"), "void", ["pointer", "pointer"]);

//public class EncounterNameplate : MonoBehaviour // TypeDefIndex: 6783
//  private Text nameText; // 0x18
//	public void SetPokemonUI(IMapPokemon mapPokemon, GameplayWeatherProto.Types.WeatherCondition weatherCondition);
Interceptor.attach(baseAddr.add("0x14952BC"), {
    onEnter: function(args){
        this.object = args[0];
        this.mapPokemon = args[1];
    },
    onLeave: function(retval){
		var nameText = this.object.add("0x30").readPointer(); /*Mod.NoTranslate*/
		var nickname = allocString(namePlateIV + "	LVL " + namePlateLVL + "\n" + namePlateATK + "/" +  namePlateDEF + "/" + namePlateHP);
		Text_set_text(nameText, nickname);
    }
});