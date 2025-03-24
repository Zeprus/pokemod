var baseAddr = Module.findBaseAddress('libil2cpp.so');
var unlimIncub;
var eggList= [];
var IncubatorService;
var mapRootState;
var incubatorSelectorGuiService;

//public class PokemonInventoryGuiController
//	private IIncubatorService incubatorService; // 0x94
//  protected override void HandleOpen(); // RVA: 0x948A28 Offset: 0x948A28
Interceptor.attach(baseAddr.add("0x9FAAA4"), {
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        IncubatorService = this.object.add("0x94").readPointer();
        send("Found incubservice");
    }
});

//public class IncubatorService : MonoBehaviour, IIncubatorService // TypeDefIndex: 7696
//	public IPromise`1<UseItemEggIncubatorOutProto> PutEggInIncubator(PokemonProto egg, EggIncubatorProto incubator); // RVA: 0xBD9F60 Offset: 0xBD9F60
var IncubatorService_PutEggInIncubator = new NativeFunction(baseAddr.add("0xCE0838"), 'pointer', ['pointer', 'pointer', 'pointer']);

//public sealed class EggIncubatorProto
//public Item get_Item(); // RVA: 0x1A3550C Offset: 0x1A3550C
Interceptor.attach(baseAddr.add("0x1912D84"), {
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        if(retval == "0x385"){ //0x385 = 901 = ID of unlimited incubator in enum Item
            unlimIncub = this.object;
        }
    }
});
//	public long get_PokemonId(); // RVA: 0x1A3553C Offset: 0x1A3553C
var EggIncubatorProto_get_PokemonId = new NativeFunction(baseAddr.add("0x1912DB4"), 'long', ['pointer']);

//public class EggListAdapter : ListAdapterBase`2<EggListItemView, PokemonProto> // TypeDefIndex: 11065
//	protected override EggListItemView CreateView(int index, PokemonProto pokemon); // RVA: 0xBD4360 Offset: 0xBD4360
Interceptor.attach(baseAddr.add("0xCDA7E8"), {
    onEnter: function(args){
        this.pokemonproto = args[2];
    },
    onLeave: function(retval){
        if(EggListItemView_get_InIncubator(retval) === 0 && !eggList.includes(this.pokemonproto.toString())){
            eggList.push(this.pokemonproto.toString());
        }
    }
});

// public class EggListItemView : MonoBehaviour, IListItemView // TypeDefIndex: 11068
//	public bool get_InIncubator(); // RVA: 0xBD5480 Offset: 0xBD5480
var EggListItemView_get_InIncubator = new NativeFunction(baseAddr.add("0xCDB908"), 'bool', ['pointer']);

function incubate(){
    if(IncubatorService != null && unlimIncub != null){
        if(eggList.length != 0 && EggIncubatorProto_get_PokemonId(unlimIncub) == 0){
            IncubatorService_PutEggInIncubator(IncubatorService, ptr(eggList.shift()), unlimIncub);
        } else {
            send({script: "auto_incubate", content: "Incubation failed: No eggs available or incubator is busy."});
        }
    } else {
        send({script: "auto_incubate", content: "Incubation failed: Initialization error."});
    }
}

//room for inprovement
//If incubator is active need to open pokemoninventory for getting the incubator
//If incubator isn't active need to press incubate button on egg for the incubator
//need to open pokemoninventory for incubationservice