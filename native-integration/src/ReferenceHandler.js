
const handleFrameBinding = function(camera){
    if (!window)
        return console.error(`Not in a browser environment...`);

    let currentWindow = window;
    if (!!currentWindow.Native)
        return console.log(`Native APIs already loaded`);

    const bindToWindow = function(){
        window.Native = {};
        window.Native.Camera = new (camera.default || camera)();
    }

    let parentWindow = currentWindow.parent;

    while(parentWindow !== currentWindow && !parentWindow.Native){
        console.log(parentWindow, currentWindow);
        currentWindow = parentWindow;
        parentWindow = currentWindow.parent;
    }

    if (!parentWindow || !parentWindow.Native)
        return bindToWindow();

    window.Native = parentWindow.Native;
}

module.exports = {
    handleFrameBinding
}