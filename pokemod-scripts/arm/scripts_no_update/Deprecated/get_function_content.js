var baseAddr = new NativePointer(Module.findBaseAddress('libil2cpp.so'));
//private void AttemptCapture(PokeballThrow throwResults); // RVA: 0xBDEF60 Offset: 0xBDEF60
var targetAddress = baseAddr.add("0xC1BCB8");
var instructionNum = 1;
while(true){
    var instruction = Instruction.parse(targetAddress);
    console.log(
        instruction.toString()
    );
    instructionNum += 1;
    targetAddress = instruction.next;
}