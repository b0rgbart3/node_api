var Loader = function (resource_type) {
    this.type = resource_type;
    
}

Loader.prototype.load = function() {
    console.log('Loading resource of type: ' + this.resource_type + '.');
}

module.exports = Loader;

