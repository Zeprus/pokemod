var baseAddr = Module.findBaseAddress('libil2cpp.so');
var pokemonObject;
var HEIGHT;
var WEIGHT;
var HP;
var ATK;
var DEF;
var CP;
var IV;
var NAME;
var GENDER;
var LVL;
var SHINY;
var CPMULT;

function statTemplate() {
    return {
        'NAME': NAME,
        "CP": CP,
        'ATK': ATK,
        'DEF': DEF,
        'HP': HP,
		'IV': IV,
		'SHINY': SHINY,
        'LVL': LVL,
		'GENDER': GENDER,
		'WEIGHT': WEIGHT,
		'HEIGHT': HEIGHT
    };
}

//class PokemonProto
//	public PokemonDisplayProto get_PokemonDisplay();
var PokemonProto_get_PokemonDisplay = new NativeFunction(baseAddr.add("0x19FC6DC"), 'pointer', ['pointer']);
//	public string GetSpeciesName();
var getSpeciesName = new NativeFunction(baseAddr.add("0x1A009FC"), 'pointer', ['pointer']);

//public sealed class PokemonDisplayProto
//	public PokemonDisplayProto.Types.Gender get_Gender();
var PokemonDisplayProto_get_Gender = new NativeFunction(baseAddr.add("0x19F2788"), 'int', ['pointer']);

function getPokemonStats(PokemonProtoObject) {
	if(PokemonProtoObject == "0x0"){ /*Mod.NoTranslate*/
		return;
	};
	var displayProto = PokemonProto_get_PokemonDisplay(PokemonProtoObject);
	var gameMasterData = PokemonProto_get_gameMasterData(PokemonProtoObject);
    switch (PokemonDisplayProto_get_Gender(displayProto)) {
        //public enum PokemonDisplayProto.Types.Gender
        case 1: GENDER = "male";
            break;
        case 2: GENDER = "female";
            break;
        case 3: GENDER = "genderless";
            break;
        default: GENDER = "unset";
    }
    CPMULT = PokemonProtoObject.add(0x70).readFloat(); /*Mod.NoTranslate*/
    LVL = getLevelFromCpm(gameMasterData, CPMULT);
	CP = PokemonProtoObject.add(0x1C).readInt(); /*Mod.NoTranslate*/
	HEIGHT = PokemonProtoObject.add(0x5C).readFloat().toFixed(2); /*Mod.NoTranslate*/
	WEIGHT = PokemonProtoObject.add(0x60).readFloat().toFixed(2); /*Mod.NoTranslate*/
    ATK = PokemonProtoObject.add(0x64).readInt(); /*Mod.NoTranslate*/
    DEF = PokemonProtoObject.add(0x68).readInt(); /*Mod.NoTranslate*/
    HP = PokemonProtoObject.add(0x6C).readInt(); /*Mod.NoTranslate*/
    NAME = getSpeciesName(PokemonProtoObject).add("0x14").readUtf16String(); /*Mod.NoTranslate*/
    IV = Math.round((100 * (ATK + DEF + HP) / 45) * 10) / 10 + "%";
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
		if(retval == 0x0){ /*Mod.NoTranslate*/
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

//class EncounterState
//public bool get_IsEncounteredPokemonShiny();
var getIsShiny = baseAddr.add("0x14A14C4");
Interceptor.attach(getIsShiny, {
	onLeave: function (retval) {
		SHINY = (retval == 0x0 ? false : true); /*Mod.NoTranslate*/
		pokemonObject = statTemplate();
		send({ "script": "get_encounter_stats", "content": pokemonObject });
	}
});