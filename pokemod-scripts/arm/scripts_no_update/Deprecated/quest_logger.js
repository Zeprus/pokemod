var baseAddr = Module.findBaseAddress('libil2cpp.so');
var poiDetailsService;
var fortDetailsOutProto;
var currStop;
var questRpcService;
var interactiveModes = {};
var i18n;

//public class QuestRpcService : MonoBehaviour, IQuestRpcService
//	public void .ctor();
Interceptor.attach(baseAddr.add("0x9A2258"), {
    onLeave: function(retval){
        questRpcService = ptr(retval);
    }
});
//	public IPromise`1<RemoveQuestOutProto> RemoveQuest(string questId);
var QuestRpcService_RemoveQuest = new NativeFunction(baseAddr.add("0x9A2A7C"), 'pointer', ['pointer', 'pointer']);

//public class I18n : MonoBehaviour, II18n
//	public void .ctor();
Interceptor.attach(baseAddr.add("0xAF6D40"), {
    onLeave: function(retval){
        i18n = ptr(retval);
    }
});

//public class PoiDetailsService : MonoBehaviour, IPoiDetailsService
//	public void .ctor();
Interceptor.attach(baseAddr.add("0xDFA298"), {
    onLeave: function(retval){
        poiDetailsService = ptr(retval);
    }
});
//	public IPromise`1<PoiDetails> RequestPokestopDetails(IPoi pokestop);
var PoiDetailsService_RequestPokestopDetails = new NativeFunction(baseAddr.add("0xDFA2A0"), 'pointer', ['pointer', 'pointer']);
//private sealed class PoiDetailsService.<RequestPokestopDetails>c__AnonStorey0
//	internal void <>m__0(FortDetailsOutProto response);
Interceptor.attach(baseAddr.add("0xDFC758"), {
    onEnter: function(args){
        fortDetailsOutProto = args[1];
    }
});

//public sealed class FortDetailsOutProto : IMessage`1<FortDetailsOutProto>, IMessage, IEquatable`1<FortDetailsOutProto>, IDeepCloneable`1<FortDetailsOutProto>
//	public double Latitude; // 0x30
//	public double Longitude; // 0x38

//public class MapPokestopInteractive : MapPokestopMode
//	public IPoiItemSpinner get_ItemSpinner();
var MapPokestopInteractive_get_ItemSpinner = new NativeFunction(baseAddr.add("0x96D084"), 'pointer', ['pointer']);

//public class PoiItemSpinner : poiItemSpinner, IPoiItemSpinner
//	public override void Initialize(IMapPoi newMapPoi);
var initializePoiSpinner = new NativeFunction(baseAddr.add("0x6B3F30"), 'void', ['pointer', 'pointer']);
//	public override void Cleanup();
var cleanup = new NativeFunction(baseAddr.add("0x6B3FF4"), 'void', ['pointer']);
//	private void SendSearchRpc();
var sendSearchRpc = new NativeFunction(baseAddr.add("0x6B4364"), 'void', ['pointer']);

//public sealed class FortSearchOutProto : IMessage`1<FortSearchOutProto>, IMessage, IEquatable`1<FortSearchOutProto>, IDeepCloneable`1<FortSearchOutProto>
//	private FortSearchOutProto.Types.Result result_; // 0x8
//	public ClientQuestProto get_ChallengeQuest();
var FortSearchOutProto_get_ChallengeQuest = new NativeFunction(baseAddr.add("0x16071E0"), 'pointer', ['pointer']);

//public sealed class ClientQuestProto : IMessage`1<ClientQuestProto>, IMessage, IEquatable`1<ClientQuestProto>, IDeepCloneable`1<ClientQuestProto>
//	public QuestProto get_Quest();
var ClientQuestProto_get_Quest = new NativeFunction(baseAddr.add("0x161C250"), 'pointer', ['pointer']);

//public static class ClientQuestProtoExt
//	public static string GetDescription(ClientQuestProto proto, II18n ii18n);
var ClientQuestProtoExt_GetDescription = new NativeFunction(baseAddr.add("0xC364F0"), 'pointer', ['pointer', 'pointer', 'pointer']);

//public sealed class QuestProto : IMessage`1<QuestProto>, IMessage, IEquatable`1<QuestProto>, IDeepCloneable`1<QuestProto>
//	public string get_QuestId();
var QuestProto_get_QuestId = new NativeFunction(baseAddr.add("0x1589C04"), 'pointer', ['pointer']);

//public class PoiDetailsService : MonoBehaviour, IPoiDetailsService
//	public void .ctor();
Interceptor.attach(baseAddr.add("0xDFA298"), {
    onLeave: function(retval){
        poiDetailsService = ptr(retval);
    }
});
//	public IPromise`1<PoiDetails> RequestPokestopDetails(IPoi pokestop);
var PoiDetailsService_RequestPokestopDetails = new NativeFunction(baseAddr.add("0xDFA2A0"), 'pointer', ['pointer', 'pointer']);

//public class MapPokestopInteractive : MapPokestopMode
//	public IPoiItemSpinner get_ItemSpinner();
var MapPokestopInteractive_get_ItemSpinner = new NativeFunction(baseAddr.add("0x96D084"), 'pointer', ['pointer']);

//public class PoiItemSpinner : poiItemSpinner, IPoiItemSpinner
//	public override void Initialize(IMapPoi newMapPoi);
var initializePoiSpinner = new NativeFunction(baseAddr.add("0x6B3F30"), 'void', ['pointer', 'pointer']);
//	public override void Cleanup();
var cleanup = new NativeFunction(baseAddr.add("0x6B3FF4"), 'void', ['pointer']);
//	private void SendSearchRpc();
var sendSearchRpc = new NativeFunction(baseAddr.add("0x6B4364"), 'void', ['pointer']);
//	private void <SendSearchRpc>m__1(FortSearchOutProto response);
Interceptor.attach(baseAddr.add("0x6B4C60"), {
    onEnter: function(args){
        if(args[1].add("0x8").readInt() == 1){
            var clientQuestProto = FortSearchOutProto_get_ChallengeQuest(args[1]);
            var lat = fortDetailsOutProto.add("0x30").readDouble().toFixed(6);
            var lng = fortDetailsOutProto.add("0x38").readDouble().toFixed(6);
            if(clientQuestProto != "0x0"){
                var description = ClientQuestProtoExt_GetDescription(ptr("0x0"), clientQuestProto, i18n).add("0xC").readUtf16String();   
                var quest = ClientQuestProto_get_Quest(clientQuestProto);
                var questId = QuestProto_get_QuestId(quest);
                send({"script": "quest_logger", "content": lat + ", " + lng + ", " + description});
                QuestRpcService_RemoveQuest(questRpcService, questId);
            } else {
                //send({"script": "quest_logger", "content": "Quest already received or Questinventory full."});
            }
        } else {
            var error;
            switch(args[1].add("0x8").readInt()){
                case 0: error = "NO_RESULT_SET";
                    break;
                case 2: error = "OUT_OF_RANGE"
                    break;
                case 3: error = "IN_COOLDOWN_PERIOD";
                    //send({"script": "quest_logger", "content": "Cannot spin: " + error});
                    break;
                case 4: error = "INVENTORY_FULL";
                    //send({"script": "quest_logger", "content": "Cannot spin: " + error});
                    break;
                case 5: error = "EXCEEDED_DAILY_LIMIT";
                    //send({"script": "quest_logger", "content": "Cannot spin: " + error});
                    break;
                case 6: error = "POI_INACCESSIBLE";
            }
            //send({"script": "quest_logger", "content": "Cannot spin: " + error});
        }
    }
});

//public class MapPokestop : MonoBehaviour, IMapPokestop, ICustomInstaller, IMapPoi, IPoi
//	public bool get_IsIncidentActive();
var MapPokestop_get_IsIncidentActive = new NativeFunction(baseAddr.add("0x963F74"), 'bool', ['pointer']);
//	public bool get_IsCoolingDown();
var MapPokestop_get_IsCoolingDown = new NativeFunction(baseAddr.add("0x96427C"), 'bool', ['pointer']);
//	public MapPokestopInteractive StartInteractiveMode();
var MapPokestop_StartInteractiveMode = new NativeFunction(baseAddr.add("0x969278"), 'pointer', ['pointer']);
//	public void CompleteInteractiveMode();
var MapPokestop_CompleteInteractiveMode = new NativeFunction(baseAddr.add("0x9695AC"), 'void', ['pointer']);
//	public bool get_IsPlayerInRange();
var MapPokestop_get_IsPlayerInRange = new NativeFunction(baseAddr.add("0x963FB4"), 'bool', ['pointer']);
Interceptor.attach(baseAddr.add("0x963FB4"), {
    onEnter: function(args){
        currStop = args[0];
    },
    onLeave: function(retval){
        if(MapPokestop_get_IsIncidentActive(currStop) == 0 && retval == 1){
            var poiItemSpinner = MapPokestopInteractive_get_ItemSpinner(interactiveModes[currStop]);
            if(MapPokestop_get_IsCoolingDown(currStop) == 0 && retval == 1){
                PoiDetailsService_RequestPokestopDetails(poiDetailsService, currStop);
                initializePoiSpinner(poiItemSpinner, currStop);
                sendSearchRpc(poiItemSpinner);
                cleanup(poiItemSpinner);
            }
        }
    }
});
//	public void ProximityWakeUp();
Interceptor.attach(baseAddr.add("0x968FAC"), {
    onLeave: function(retval){
        if(MapPokestop_get_IsIncidentActive(retval) == 0){
            interactiveModes[retval] = MapPokestop_StartInteractiveMode(retval);
        }
    }
});
//	public void ProximityGoToSleep();
Interceptor.attach(baseAddr.add("0x9690CC"), {
    onEnter: function(args){
        MapPokestop_CompleteInteractiveMode(args[0]);
        delete interactiveModes[args[0]];
    }
});