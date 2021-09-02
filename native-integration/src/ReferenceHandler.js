const handleFrameBinding = function(camera){
    if (!window)
        return console.error(`Not in a browser environment...`)
    window.Camera = window.Camera || new (camera.default || camera)();
}

module.exports = {
    handleFrameBinding
}