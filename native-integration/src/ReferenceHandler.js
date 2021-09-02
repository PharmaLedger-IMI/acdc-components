const handleFrameBinding = function(camera){
    window.Camera = new (camera.default || camera)();
}

module.exports = {
    handleFrameBinding
}