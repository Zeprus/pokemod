var baseAddr = new NativePointer(Module.findBaseAddress('libil2cpp.so'));
if(!baseAddr){exit();}
var scanned = false;
var pokemonObject;
var lat;
var lng;
var timeout;

//executes native function
function executeNativeGet(functionPointer, objectPointer, returnTypeString) {
    var nativeFunction = new NativeFunction(functionPointer, returnTypeString, ['pointer']);
    var value = nativeFunction(objectPointer);
    return value;
}

//array buffer to string
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

//gets string from NativePointer -- null terminated
function getStringFromPointer(pointer) {
    var byteArrayBuffer;
    var nameStarted = false;
    var nameEnded = false;
    var size = 2;
    var trueName = "";
    while (!nameEnded) {
        byteArrayBuffer = pointer.readByteArray(size);
        var name = ab2str(byteArrayBuffer);
        if (name.charAt(name.length - 1).toString().match(/[0-9a-zA-Z,. -]/)) {
            nameStarted = true;
            trueName += name.charAt(name.length - 1);
        } else if (nameStarted) {
            nameEnded = true;
        }
        size += 2;
    }
    return trueName;
}

//class PokemonProto
//public int get_Cp(); // RVA: 0x16C908C Offset: 0x16C908C
var getCp = baseAddr.add("0x145AE1C");
//public int get_IndividualAttack(); // RVA: 0x16C925C Offset: 0x16C925C
var getAtk = baseAddr.add("0x145AFEC");
//public int get_IndividualDefense(); // RVA: 0x16C926C Offset: 0x16C926C
var getDef = baseAddr.add("0x145AFFC");
//public int get_IndividualStamina(); // RVA: 0x16C927C Offset: 0x16C927C
var getHp = baseAddr.add("0x145B00C");
//public string GetSpeciesName(); // RVA: 0x16CD6D4 Offset: 0x16CD6D4
var getName = baseAddr.add("0x145F370");
//logs stats from any PokemonProto object
function getPokemonStats(PokemonProtoObject, lured) {
	var ATK = executeNativeGet(getAtk, PokemonProtoObject, 'int');
	var DEF = executeNativeGet(getDef, PokemonProtoObject, 'int');
    var HP = executeNativeGet(getHp, PokemonProtoObject, 'int');
    //	public ulong get_Id(); // RVA: 0x145ADF4 Offset: 0x145ADF4
    var get_PokemonId = new NativeFunction(baseAddr.add("0x145ADF4"), 'int', ['pointer']);
    var ID = get_PokemonId(PokemonProtoObject);
    var pokemon = {
        'ID': ID,
        'name': getStringFromPointer(executeNativeGet(getName, PokemonProtoObject, 'pointer')),
        'CP': executeNativeGet(getCp, PokemonProtoObject, 'int'),
        'ATK': ATK,
        'DEF': DEF,
		'HP': HP,
        'IV': Math.round( (100*(ATK+DEF+HP)/45) * 10) / 10 + '%',
        'lured': lured,
        'lat': lat,
        'lng': lng,
        'timeoutms': timeout
    }
    return pokemon;
}

//public sealed class EncounterOutProto : IMessage`1<EncounterOutProto>, IMessage, IEquatable`1<EncounterOutProto>, IDeepCloneable`1<EncounterOutProto> // TypeDefIndex: 8260
//public WildPokemonProto get_Pokemon(); // RVA: 0x19EF368 Offset: 0x19EF368
var getWildPokemon = baseAddr.add("0x19E2228");

//class WildPokemonProto
//private double latitude_; // 0x18
//	private double longitude_; // 0x20
//	private int timeTillHiddenMs_; // 0x30
//  public PokemonProto get_Pokemon(); // RVA: 0x137D178 Offset: 0x137D178
var getPokemonWild = baseAddr.add("0x1794A54");
Interceptor.attach(getWildPokemon, {
	onLeave: function (retval) {
        lat = retval.add("0x18").readDouble();
        lng = retval.add("0x20").readDouble();
        timeout = retval.add("0x30").readInt();
		var nativeRet = executeNativeGet(getPokemonWild, retval, 'pointer');
		if (!scanned) {
			pokemonObject = getPokemonStats(nativeRet, false);
			send({"script":"feed_get_pokemon_proto_info", "content": pokemonObject});
			scanned = true;
		}
	}
});

//public sealed class DiskEncounterOutProto : IMessage`1<DiskEncounterOutProto>, IMessage, IEquatable`1<DiskEncounterOutProto>, IDeepCloneable`1<DiskEncounterOutProto> // TypeDefIndex: 8290
//public PokemonProto get_Pokemon(); // RVA: 0x19E76C4 Offset: 0x19E76C4
// var getDiskPokemon = baseAddr.add("0x19E78CC");
// Interceptor.attach(getDiskPokemon, {
// 	onLeave: function(retval){
// 		if (!scanned) {
//             lat = "unknown";
//             lng = "unknown";
// 			pokemonObject = getPokemonStats(retval, true);
// 			send({"script": "feed_get_pokemon_proto_info", "content": pokemonObject});
// 			scanned = true;
// 		}
// 	}
// });

//class EncounterState
//public void EncounterStateComplete(EncounterResult result); // RVA: 0xBCCA08 Offset: 0xBCCA08
var encounterStateComplete = baseAddr.add("0xBF2CE4");
Interceptor.attach(encounterStateComplete, {
	onLeave: function(retval){
		scanned = false;
	}
});