var baseAddr = new NativePointer(Module.findBaseAddress('libil2cpp.so'));
//public sealed class PokemonSettingsProto : IMessage`1<PokemonSettingsProto>, IMessage, IEquatable`1<PokemonSettingsProto>, IDeepCloneable`1<PokemonSettingsProto> // TypeDefIndex: 8425
//public PokemonSettingsProto.Types.BuddySize get_BuddySize(); // RVA: 0x150F5EC Offset: 0x150F5EC
Interceptor.attach(baseAddr.add("0x14BDAA0"), {
    onEnter: function(args){

    },
    onLeave: function(retval){
        retval.replace(ptr("0x1"));
    }
});
/**DEPRECATED */