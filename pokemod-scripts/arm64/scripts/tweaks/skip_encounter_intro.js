var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class EncounterState : GameState, IEncounterState // TypeDefIndex: 6809
//	public void ApproachComplete(); // RVA: 0xB0BA0C Offset: 0xB0BA0C
var EncounterState_ApproachComplete = new NativeFunction(baseAddr.add("0x148DDB4"), "void", ["pointer"]);
//	private void BeginEncounterApproach(); // RVA: 0xB31E6C Offset: 0xB31E6C
Interceptor.replace(baseAddr.add("0x14AEF54"), new NativeCallback(function(object){
    EncounterState_ApproachComplete(object);
}, "void", ["pointer"]));

//public class EncounterParkCameraController : MonoBehaviour, IEncounterCameraController, ICameraController // TypeDefIndex: 6668
//	private float tweenDurationSeconds;
//	private float introDurationSeconds;

//public class EncounterInteractionState : GameState, IEncounterInteractionState, ICustomInstaller // TypeDefIndex: 6683
//	private EncounterParkCameraController parkCameraController;
//	private void InitializeState();
Interceptor.attach(baseAddr.add("0x1499144"), {
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        var camera = this.object.add("0xD8").readPointer(); /*Mod.NoTranslate*/
        camera.add("0x1C").writeFloat(0); /*Mod.NoTranslate*/
        camera.add("0x30").writeFloat(0); /*Mod.NoTranslate*/
    }
});
