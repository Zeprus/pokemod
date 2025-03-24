var baseAddr = Module.findBaseAddress('libil2cpp.so');
var gymData;
var raidInfo;
var raidPokemon;
var i18n;

//public class MapGym : MonoBehaviour, IMapGym, IMapPoi, IPoi
//	public PokemonFortProto get_GymData();
var MapGym_get_GymData = new NativeFunction(baseAddr.add("0x88DD94"), 'pointer', ['pointer']);
//	private void OnTap(object sender, EventArgs e);
Interceptor.attach(baseAddr.add("0x893D68"), {
    onEnter: function(args){
        i18n = args[0].add("0x94").readPointer(); /*Mod.NoTranslate*/
        gymData = MapGym_get_GymData(args[0]);
        raidInfo = PokemonFortProto_get_RaidInfo(gymData);
        if(raidInfo != "0x0"){ /*Mod.NoTranslate*/
            raidPokemon = RaidInfoProto_get_RaidPokemon(raidInfo);
            var move1_ = raidPokemon.add("0x20").readInt(); /*Mod.NoTranslate*/
            var move2_ = raidPokemon.add("0x24").readInt(); /*Mod.NoTranslate*/
            var pokemonid = raidPokemon.add("0x10").readInt(); /*Mod.NoTranslate*/
            var move1_name = I18n_PokemonMoveName(i18n, move1_).add("0xC").readUtf16String(-1); /*Mod.NoTranslate*/
            var move2_name = I18n_PokemonMoveName(i18n, move2_).add("0xC").readUtf16String(-1); /*Mod.NoTranslate*/
            var pokemonid_name = I18n_PokemonName(i18n, pokemonid).add("0xC").readUtf16String(-1); /*Mod.NoTranslate*/
            send({"script": "get_raid_stats", "content": {"Name": pokemonid_name, "Fastmove": move1_name, "Chargemove": move2_name}});
        }
    }
});

//public sealed class PokemonFortProto : IMessage`1<PokemonFortProto>, IMessage, IEquatable`1<PokemonFortProto>, IDeepCloneable`1<PokemonFortProto>
//	public RaidInfoProto get_RaidInfo();
var PokemonFortProto_get_RaidInfo = new NativeFunction(baseAddr.add("0x1A0E358"), 'pointer', ['pointer']);

//public sealed class RaidInfoProto : IMessage`1<RaidInfoProto>, IMessage, IEquatable`1<RaidInfoProto>, IDeepCloneable`1<RaidInfoProto>
//	public PokemonProto get_RaidPokemon();
var RaidInfoProto_get_RaidPokemon = new NativeFunction(baseAddr.add("0x199C570"), 'pointer', ['pointer']);

//public sealed class PokemonProto : IMessage`1<PokemonProto>, IMessage, IEquatable`1<PokemonProto>, IDeepCloneable`1<PokemonProto>
//	private int pokemonId_; // 0x10
//  private int move1_; // 0x20
//	private int move2_; // 0x24

//public class I18n : MonoBehaviour, II18n
//	public string PokemonMoveName(HoloPokemonMove move);
var I18n_PokemonMoveName = new NativeFunction(baseAddr.add("0xCE08A8"), 'pointer', ['pointer', 'int']);
//	public string PokemonName(HoloPokemonId pokemon);
var I18n_PokemonName = new NativeFunction(baseAddr.add("0xCE04A8"), 'pointer', ['pointer', 'int']);