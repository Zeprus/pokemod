var baseAddr = Module.findBaseAddress('libil2cpp.so');
var HEIGHT;
var WEIGHT;
var HP;
var ATK;
var DEF;
var CP;
var IV;
var GENDER;
var LVL;
var CPMULT;

function statTemplate() {
    return {
        "CP": CP,
        'ATK': ATK,
        'DEF': DEF,
        'HP': HP,
		'IV': IV,
		'GENDER': GENDER,
		'WEIGHT': WEIGHT,
		'HEIGHT': HEIGHT
    };
}

//class PokemonProto
//	public string GetSpeciesName();
var getSpeciesName = new NativeFunction(baseAddr.add("0x1A009FC"), 'pointer', ['pointer']);

function getPokemonStats(PokemonProtoObject) {
    if(PokemonProtoObject == "0x0"){ /*Mod.NoTranslate*/
		return;
	};
    CPMULT = PokemonProtoObject.add("0x70").readPointer(); /*Mod.NoTranslate*/
	CP = PokemonProtoObject.add("0x1C").readInt(); /*Mod.NoTranslate*/
	HEIGHT = PokemonProtoObject.add("0x5C").readFloat().toFixed(2); /*Mod.NoTranslate*/
	WEIGHT = PokemonProtoObject.add("0x60").readFloat().toFixed(2); /*Mod.NoTranslate*/
    ATK = PokemonProtoObject.add("0x64").readInt(); /*Mod.NoTranslate*/
    DEF = PokemonProtoObject.add("0x68").readInt(); /*Mod.NoTranslate*/
    HP = PokemonProtoObject.add("0x6C").readInt(); /*Mod.NoTranslate*/
    IV = Math.round((100 * (ATK + DEF + HP) / 45) * 10) / 10 + "%";
}

//public class PokemonInventoryGuiController : LegacyGuiController, IPokemonInventoryGuiController, IGuiController, IHideable, IScoped
//	private void PokemonSelected(IList`1<PokemonProto> list, PokemonProto selection, PokemonListLineItemView view, int positionInLine);
Interceptor.attach(baseAddr.add("0x1392178"), {
    onEnter: function(args){
        if(args[2].add("0x40").readPointer() == "0x1"){ /*Mod.NoTranslate*/
            return;
        }
        getPokemonStats(args[2]);
        send({"script":"get_inventory_stats", "content": statTemplate()})
    }
});