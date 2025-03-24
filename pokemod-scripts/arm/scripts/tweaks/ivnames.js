var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class Text : MaskableGraphic, ILayoutElement // TypeDefIndex: 3125
//	public virtual void set_text(string value); // RVA: 0x24FB4A4 Offset: 0x24FB4A4
var Text_set_text = new NativeFunction(baseAddr.add("0x2659574"), "void", ["pointer", "pointer"]);

//private sealed class PokemonInventoryListLine.<PokemonProtoToRecyclerBinding>c__AnonStorey4 // TypeDefIndex: 11275
//	internal PokemonProto proto; // 0xC
//	internal void <>m__C(Text t); //Nickname
Interceptor.attach(baseAddr.add("0x9FB86C"), {
    onEnter: function(args){
        this.text = args[1];
        this.object = args[0];
    },
    onLeave: function(retval){
        var pokemonProto = this.object.add("0xC").readPointer(); /*Mod.NoTranslate*/
        if(pokemonProto != "0x0"){ /*Mod.NoTranslate*/
            var ATK = pokemonProto.add("0x54").readInt(); /*Mod.NoTranslate*/
            var DEF = pokemonProto.add("0x58").readInt(); /*Mod.NoTranslate*/
            var HP = pokemonProto.add("0x5C").readInt(); /*Mod.NoTranslate*/
            var IV = Math.round((100 * (ATK + DEF + HP) / 45) * 10) / 10 + "%";
            var nickname = Memory.allocUtf16String(ATK + "/" +  DEF + "/" + HP + " " + IV).sub("0xC"); /*Mod.NoTranslate*/
            Text_set_text(this.text, nickname);
        }
    }
});