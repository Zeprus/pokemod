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
var PokemonProto_get_PokemonDisplay = new NativeFunction(baseAddr.add("0x1579794"), 'pointer', ['pointer']);
//	public string GetSpeciesName();
var getSpeciesName = new NativeFunction(baseAddr.add("0x157E3C0"), 'pointer', ['pointer']);

//public sealed class PokemonDisplayProto
//	public PokemonDisplayProto.Types.Gender get_Gender();
var PokemonDisplayProto_get_Gender = new NativeFunction(baseAddr.add("0x1A09CFC"), 'int', ['pointer']);

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
    CPMULT = PokemonProtoObject.add("0x60").readPointer(); /*Mod.NoTranslate*/
    LVL = getLevelFromCpm(gameMasterData, CPMULT);
	CP = PokemonProtoObject.add("0x14").readInt(); /*Mod.NoTranslate*/
	HEIGHT = PokemonProtoObject.add("0x4C").readFloat().toFixed(2); /*Mod.NoTranslate*/
	WEIGHT = PokemonProtoObject.add("0x50").readFloat().toFixed(2); /*Mod.NoTranslate*/
    ATK = PokemonProtoObject.add("0x54").readInt(); /*Mod.NoTranslate*/
    DEF = PokemonProtoObject.add("0x58").readInt(); /*Mod.NoTranslate*/
    HP = PokemonProtoObject.add("0x5C").readInt(); /*Mod.NoTranslate*/
    NAME = getSpeciesName(PokemonProtoObject).add("0xC").readUtf16String(); /*Mod.NoTranslate*/
    IV = Math.round((100 * (ATK + DEF + HP) / 45) * 10) / 10 + "%";
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

//class EncounterState
//public bool get_IsEncounteredPokemonShiny();
var getIsShiny = baseAddr.add("0xB52420");
Interceptor.attach(getIsShiny, {
	onLeave: function (retval) {
		SHINY = (retval == 0x0 ? false : true); /*Mod.NoTranslate*/
		pokemonObject = statTemplate();
		send({ "script": "get_encounter_stats", "content": pokemonObject });
	}
});