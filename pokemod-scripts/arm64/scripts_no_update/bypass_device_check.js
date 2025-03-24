var baseAddr = new NativePointer(Module.findBaseAddress('libil2cpp.so'));

// Namespace: Niantic.Platform.Ditto.Auth
// internal class AuthManager : IAuthManager // TypeDefIndex: 2280
// protected void HandleEvent(AuthManager.InternalStateEvents evt); // RVA: 0x109A8D8 Offset: 0x109A8D8
Interceptor.attach(baseAddr.add(0x109B920), {
    onEnter: function (args) {
        // protected enum AuthManager.InternalStateEvents // TypeDefIndex: 2284
        //   [...]
        // public const AuthManager.InternalStateEvents ChannelTokenReceived = 7; // 0x0
        // public const AuthManager.InternalStateEvents ChannelDeviceIncompatible = 8; // 0x0
        //   [...]
        if (args[1] == 0x8) {
            args[1] = 0x7   // Works even without Magisk, as long as the APK was patched with the gadget.
                            // Spoofer doesn't work though, obviously, and trying to
                            // spoof via Java.perform() "works without errors" except
                            // nothing loads.
        }
    }
});
