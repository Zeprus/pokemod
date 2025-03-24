var baseAddr = Module.findBaseAddress('libil2cpp.so');
//public class EncounterGuiController : GuiController, IEncounterGuiController, IInitializer`1<IEncounterPokemon>, IGuiController, IHideable, IScoped
//  public void set_ButtonsVisible(bool value);
var showButtons = baseAddr.add("0xB433DC");
Interceptor.attach(showButtons, {
    onEnter: function(args){
        args[1] = ptr("1");
    }
});