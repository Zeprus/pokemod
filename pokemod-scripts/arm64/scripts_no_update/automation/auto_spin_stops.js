var baseAddr = Module.findBaseAddress('libil2cpp.so');
var poiDetailsService;
var fortDetailsOutProto;
var currStop;
var questRpcService;
var interactiveModes = {};
var flagInventoryFull = false;

//public class PoiDetailsService
//	public void .ctor();
Interceptor.attach(baseAddr.add("0xE68540"), {
    onLeave: function(retval){
        poiDetailsService = ptr(retval);
    }
});
//	public IPromise`1<PoiDetails> RequestPokestopDetails(IPoi pokestop);
var PoiDetailsService_RequestPokestopDetails = new NativeFunction(baseAddr.add("0xE68548"), 'pointer', ['pointer', 'pointer']);

//public class MapPokestopInteractive
//	public IPoiItemSpinner get_ItemSpinner();
var MapPokestopInteractive_get_ItemSpinner = new NativeFunction(baseAddr.add("0x91D4C4"), 'pointer', ['pointer']);

//public sealed class FortSearchOutProto
//	public FortSearchOutProto.Types.Result get_Result();
var FortSearchOutProto_get_Result = new NativeFunction(baseAddr.add("0x17FB450"), 'int', ['pointer']);

//public class PoiItemSpinner : BasePoiSpinner, IPoiItemSpinner
//	public override void Initialize(IMapPoi newMapPoi);
var initializePoiSpinner = new NativeFunction(baseAddr.add("0x6F4B80"), 'void', ['pointer', 'pointer']);
//	public override void Cleanup();
var cleanup = new NativeFunction(baseAddr.add("0x6F4C44"), 'void', ['pointer']);
//	private void SendSearchRpc();
var sendSearchRpc = new NativeFunction(baseAddr.add("0x6F4FBC"), 'void', ['pointer']);
//	private void <SendSearchRpc>m__1(FortSearchOutProto response);
Interceptor.attach(baseAddr.add("0x6F58C0"), {
    onEnter: function(args){
        var fortSearchOutProto = args[1];
        var result = FortSearchOutProto_get_Result(fortSearchOutProto);
        switch(result){
            case 1: flagInventoryFull = false;
                    break;
            case 4: flagInventoryFull = true;
                    break;
            default: MapPokestop_RestartCooldown(currStop, 5);
                    break;
        }
    }
});

//public class MapPokestop : MonoBehaviour, IMapPokestop, ICustomInstaller, IMapPoi, IPoi
//	public bool get_IsIncidentActive();
var MapPokestop_get_IsIncidentActive = new NativeFunction(baseAddr.add("0x914210"), 'bool', ['pointer']);
//	public bool get_IsCoolingDown();
var MapPokestop_get_IsCoolingDown = new NativeFunction(baseAddr.add("0x914518"), 'bool', ['pointer']);
//	public MapPokestopInteractive StartInteractiveMode();
var MapPokestop_StartInteractiveMode = new NativeFunction(baseAddr.add("0x9196B8"), 'pointer', ['pointer']);
//	public void CompleteInteractiveMode();
var MapPokestop_CompleteInteractiveMode = new NativeFunction(baseAddr.add("0x9199EC"), 'void', ['pointer']);
//	public bool get_IsPlayerInRange();
var MapPokestop_get_IsPlayerInRange = new NativeFunction(baseAddr.add("0x914250"), 'bool', ['pointer']);
Interceptor.attach(baseAddr.add("0x914250"), {
    onEnter: function(args){
        currStop = args[0];
    },
    onLeave: function(retval){
        if(MapPokestop_get_IsIncidentActive(currStop) == 0 && !flagInventoryFull){
            if(MapPokestop_get_IsCoolingDown(currStop) == 0 && retval == 1){
                var poiItemSpinner = MapPokestopInteractive_get_ItemSpinner(interactiveModes[currStop]);
                PoiDetailsService_RequestPokestopDetails(poiDetailsService, currStop);
                initializePoiSpinner(poiItemSpinner, currStop);
                sendSearchRpc(poiItemSpinner);
                cleanup(poiItemSpinner);
            }
        }
    }
});
//	public void ProximityWakeUp();
Interceptor.attach(baseAddr.add("0x919248"), {
    onLeave: function(retval){
        if(MapPokestop_get_IsIncidentActive(retval) == 0){
            interactiveModes[retval] = MapPokestop_StartInteractiveMode(retval);
        }
    }
});
//	public void ProximityGoToSleep();
Interceptor.attach(baseAddr.add("0x9193A8"), {
    onEnter: function(args){
        MapPokestop_CompleteInteractiveMode(args[0]);
        delete interactiveModes[args[0]];
    }
});
//  private void RestartCooldown(float newCooldownDurationInSeconds);
var MapPokestop_RestartCooldown = new NativeFunction(baseAddr.add("0x91A0F8"), 'void', ['pointer', 'float']);