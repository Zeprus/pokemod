var baseAddr = Module.findBaseAddress('libil2cpp.so');

//public class GameMasterData
//	public int GetPokemonLevelOfCpMultiplier(float cpMultiplier);
var getLevelFromCpm = new NativeFunction(baseAddr.add("0xD61C08"), 'int', ['pointer', 'pointer']);

//public sealed class GetHatchedEggsOutProto
//	public RepeatedField`1<PokemonProto> get_HatchedPokemon();
var GetHatchedEggsOutProto_get_HatchedPokemon = new NativeFunction(baseAddr.add("0x16342E0"), 'pointer', ['pointer']);

//public sealed class RepeatedField`1
//	public int get_Count();
var RepeatedField_get_Count = new NativeFunction(baseAddr.add("0x1E45440"), 'int', ['pointer']);
//	public T get_Item(int index);
var RepeatedField_get_Item = new NativeFunction(baseAddr.add("0x1E461AC"), 'pointer', ['pointer', 'int']);

//class PokemonProto
//	public string GetSpeciesName();
var getSpeciesName = new NativeFunction(baseAddr.add("0x143E8E8"), 'pointer', ['pointer']);
//	private GameMasterData get_gameMasterData();
var PokemonProto_get_gameMasterData = new NativeFunction(baseAddr.add("0x143E4D4"), 'pointer', ['pointer']);
//	public PokemonDisplayProto get_PokemonDisplay();
var PokemonProto_get_PokemonDisplay = new NativeFunction(baseAddr.add("0x1439EDC"), 'pointer', ['pointer']);

//public sealed class PokemonDisplayProto
//public PokemonDisplayProto.Types.Gender get_Gender();
var PokemonDisplayProto_get_Gender = new NativeFunction(baseAddr.add("0x142EC74"), 'int', ['pointer']);
//	public bool get_Shiny();
var PokemonDisplayProto_get_Shiny = new NativeFunction(baseAddr.add("0x142EC84"), 'bool', ['pointer']);


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
 Interceptor.replace(baseAddr.add("0x76B010"), new NativeCallback(function(object, GetHatchedEggsOutProto){
	var pokemonList = GetHatchedEggsOutProto_get_HatchedPokemon(GetHatchedEggsOutProto);
	var count = RepeatedField_get_Count(pokemonList);
	for(var i = 0; i < count; i++){
		var pokemon = RepeatedField_get_Item(pokemonList, i);
		send({ "script": "silent_hatch", "content": getPokemonStats(pokemon) });
	}
 }, 'void', ['pointer', 'pointer']));