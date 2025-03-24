var baseAddr = Module.getBaseAddress('libil2cpp.so');

//public class CombatResolveService
//	public CombatType get_CombatType();
//	    public const CombatType SOLO_INVASION = 5;
var CombatResolveService_get_CombatType = new NativeFunction(baseAddr.add("0xAA76B0"), "int", ["pointer"]);


//public class CombatDirector
//private void EndInvasionSession(CombatProto.Types.CombatState endState, CombatPlayerFinishState finishState, int remainingPokemon); 
var CombatDirector_EndInvasionSession = new NativeFunction(baseAddr.add("0x69A650"), "void", ["pointer", "int", "int", "int"]);
//	public void Flush();
var CombatDirector_Flush = new NativeFunction(baseAddr.add("0x69A208"), "void", ["pointer"]);
//public void Initialize(CombatProto combat, string combatLeagueId, IEnumerable`1<ulong> attackingPokemon); // RVA: 0x6996D4 Offset: 0x6996D4
Interceptor.attach(baseAddr.add("0x6996D4"), {
    onEnter: function(args){
        this.object = args[0];
    },
    onLeave: function(retval){
        var combatResolveService = this.object.add("0xAC").readPointer();
        var combatType = CombatResolveService_get_CombatType(combatResolveService);
        if(combatType == 5){
            CombatDirector_EndInvasionSession(this.object, 6, 0, 0);
            CombatDirector_Flush(this.object);
        }
    }
});