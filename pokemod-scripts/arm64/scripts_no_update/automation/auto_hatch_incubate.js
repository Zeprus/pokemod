var baseAddr = Module.findBaseAddress('libil2cpp.so');
var unlimIncub;
var eggList = [];
var IncubatorService;
var mapRootState;
var incubatorSelectorGuiService;

/*
*
*   INCUBATION BLOCK START!
*
*/

//public class PokemonInventoryGuiController
//  private IIncubatorService incubatorService; // 0x8C
//  protected override void HandleOpen();
Interceptor.attach(baseAddr.add("0x9AE1E8"), {
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        IncubatorService = this.object.add("0x8C").readPointer();
    }
});

//public class IncubatorService
//	public IPromise`1<UseItemEggIncubatorOutProto> PutEggInIncubator(PokemonProto egg, EggIncubatorProto incubator);
var IncubatorService_PutEggInIncubator = new NativeFunction(baseAddr.add("0xAB6620"), 'pointer', ['pointer', 'pointer', 'pointer']);

//public sealed class EggIncubatorProto
//public Item get_Item();
Interceptor.attach(baseAddr.add("0x19730B0"), {
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        if(retval == "0x385"){ //0x385 = 901 = ID of unlimited incubator in enum Item
            unlimIncub = this.object;
        }
    }
});
//	public long get_PokemonId();
var EggIncubatorProto_get_PokemonId = new NativeFunction(baseAddr.add("0x19730E0"), 'long', ['pointer']);

//public class EggListAdapter
//	protected override EggListItemView CreateView(int index, PokemonProto pokemon);
Interceptor.attach(baseAddr.add("0xAB075C"), {
    onEnter: function(args){
        this.pokemonproto = args[2];
    },
    onLeave: function(retval){
        if(EggListItemView_get_InIncubator(retval) === 0 && !eggList.includes(this.pokemonproto.toString())){
            eggList.push(this.pokemonproto.toString());
        }
    }
});

// public class EggListItemView
//	public bool get_InIncubator();
var EggListItemView_get_InIncubator = new NativeFunction(baseAddr.add("0xAB187C"), 'bool', ['pointer']);

function incubate(){
    if(IncubatorService != null && unlimIncub != null){
        if(eggList.length != 0){
            var thing = ptr(eggList.shift());
            IncubatorService_PutEggInIncubator(IncubatorService, thing, unlimIncub);
        } else {
            send({script: "auto_hatch_incubate", content: "Incubation failed: No eggs available or incubator is busy."});
        }
    } else {
        send({script: "auto_hatch_incubate", content: "Incubation failed: Initialization error."});
    }
}

//room for inprovement
//If incubator is active need to open pokemoninventory for getting the incubator
//If incubator isn't active need to press incubate button on egg for the incubator
//need to open pokemoninventory for incubationservice

/*
*
*   HATCH BLOCK START!
*
*/

//public class GameMasterData
//	public int GetPokemonLevelOfCpMultiplier(float cpMultiplier);
var getLevelFromCpm = new NativeFunction(baseAddr.add("0xD26AC0"), 'int', ['pointer', 'pointer']);

//public sealed class GetHatchedEggsOutProto
//	public RepeatedField`1<PokemonProto> get_HatchedPokemon();
var GetHatchedEggsOutProto_get_HatchedPokemon = new NativeFunction(baseAddr.add("0x16188CC"), 'pointer', ['pointer']);

//public sealed class RepeatedField`1
//	public int get_Count();
var RepeatedField_get_Count = new NativeFunction(baseAddr.add("0x1E7B7F4"), 'int', ['pointer']);
//	public T get_Item(int index);
var RepeatedField_get_Item = new NativeFunction(baseAddr.add("0x1E7C560"), 'pointer', ['pointer', 'int']);

//class PokemonProto
//	public string GetSpeciesName();
var getSpeciesName = new NativeFunction(baseAddr.add("0x1918EE8"), 'pointer', ['pointer']);
//	private GameMasterData get_gameMasterData();
var PokemonProto_get_gameMasterData = new NativeFunction(baseAddr.add("0x1918AD4"), 'pointer', ['pointer']);
//	public PokemonDisplayProto get_PokemonDisplay();
var PokemonProto_get_PokemonDisplay = new NativeFunction(baseAddr.add("0x1914710"), 'pointer', ['pointer']);

//public sealed class PokemonDisplayProto
//public PokemonDisplayProto.Types.Gender get_Gender();
var PokemonDisplayProto_get_Gender = new NativeFunction(baseAddr.add("0x19097E8"), 'int', ['pointer']);
//	public bool get_Shiny();
var PokemonDisplayProto_get_Shiny = new NativeFunction(baseAddr.add("0x19097F8"), 'bool', ['pointer']);


function getPokemonStats(PokemonProtoObject) {
	var gameMasterData = PokemonProto_get_gameMasterData(PokemonProtoObject);
	var displayProto = PokemonProto_get_PokemonDisplay(PokemonProtoObject);
	var GENDER;
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
	var SHINY = PokemonDisplayProto_get_Shiny(displayProto);
	var CPMULT = PokemonProtoObject.add("0x60").readPointer();
    var LVL = getLevelFromCpm(gameMasterData, CPMULT);
	var CP = PokemonProtoObject.add("0x14").readInt();
    var ATK = PokemonProtoObject.add("0x54").readInt();
    var DEF = PokemonProtoObject.add("0x58").readInt();
    var HP = PokemonProtoObject.add("0x5C").readInt();
    var NAME = getSpeciesName(PokemonProtoObject).add("0xC").readUtf16String();
	var IV = Math.round((100 * (ATK + DEF + HP) / 45) * 10) / 10 + "%";
	return {
		'NAME': NAME,
		'SHINY': SHINY,
        "CP": CP,
        'ATK': ATK,
        'DEF': DEF,
        'HP': HP,
		'IV': IV,
        'LVL': LVL,
		'GENDER': GENDER
    };
}

//public class PlayerService
//  private void HandleEggHatchSideChannelResponse(GetHatchedEggsOutProto eggSettings);
 Interceptor.replace(baseAddr.add("0xB5B6C0"), new NativeCallback(function(object, GetHatchedEggsOutProto){
	var pokemonList = GetHatchedEggsOutProto_get_HatchedPokemon(GetHatchedEggsOutProto);
	var count = RepeatedField_get_Count(pokemonList);
	for(var i = 0; i < count; i++){
		var pokemon = RepeatedField_get_Item(pokemonList, i);
        send({ "script": "auto_hatch_incubate", "content": getPokemonStats(pokemon) });
        incubate();
	}
 }, 'void', ['pointer', 'pointer']));

 //	public void ClickPokedex(); // RVA: 0x774F1C Offset: 0x774F1C
Interceptor.replace(baseAddr.add("0x774F1C"), new NativeCallback(function(object){
    incubate();
}, 'void', ['pointer']));