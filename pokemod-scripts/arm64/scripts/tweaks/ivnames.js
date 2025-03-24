var baseAddr = Module.findBaseAddress('libil2cpp.so');

function allocString(string){
	var stringLength = string.length * 2;
	var location = Memory.alloc(stringLength + 4);
	location.writeInt(string.length);
	location.add(0x4).writeUtf16String(string); /*Mod.NoTranslate*/
	return(location.sub(0x10)); /*Mod.NoTranslate*/
}

//public class Text : MaskableGraphic, ILayoutElement // TypeDefIndex: 3125
//	public virtual void set_text(string value); // RVA: 0x24FB4A4 Offset: 0x24FB4A4
var Text_set_text = new NativeFunction(baseAddr.add("0x2C8AF54"), "void", ["pointer", "pointer"]);

//private sealed class PokemonInventoryListLine.<PokemonProtoToRecyclerBinding>c__AnonStorey4 // TypeDefIndex: 11275
//	internal PokemonProto proto;
//	internal void <>m__C(Text t); //Nickname
Interceptor.attach(baseAddr.add("0x13A41E8"), {
    onEnter: function(args){
        this.text = args[1];
        this.object = args[0];
    },
    onLeave: function(retval){
        var pokemonProto = this.object.add("0x18").readPointer(); /*Mod.NoTranslate*/
        if(pokemonProto != "0x0"){ /*Mod.NoTranslate*/
            var ATK = pokemonProto.add("0x64").readInt(); /*Mod.NoTranslate*/
            var DEF = pokemonProto.add("0x68").readInt(); /*Mod.NoTranslate*/
            var HP = pokemonProto.add("0x6C").readInt(); /*Mod.NoTranslate*/
            var IV = Math.round((100 * (ATK + DEF + HP) / 45) * 10) / 10 + "%";
            var nickname = allocString(ATK + "/" +  DEF + "/" + HP + " " + IV);
            Text_set_text(this.text, nickname);
        }
    }
});