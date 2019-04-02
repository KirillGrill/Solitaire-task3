/*
    prototype inheritance (bulky syntax)
*/
function parent() {
	console.log('parent constructor');
}

function child() {
	parent.apply(this, arguments);
	console.log('child constructor');
}

parent.prototype = {
	method: function() {
		console.log('parent method');
	}
}

child.prototype = Object.create(parent.prototype);

child.prototype.method = function() {
	parent.prototype.method.apply(this, arguments);
	console.log('child method');
}

var a = new child();

/*
    class inheritance (Can't skip parents` constructor)
*/
(function(){

    class parent {
        constructor() {
            console.log('parent constructor');
        }

        method() {
            console.log('parent method');
        }
    }

    class child extends parent {
        constructor() {
            super(...arguments);
            console.log('child constructor');
        }

        method() {
            super.method(...arguments);
            console.log('child method');
        }
    }

    var a = new child();
    a.method();
    console.log(a);
})()

/*
    Copying inheritance (No constructors, flat structure)
*/
var parent = {
    method: function() {
        console.log('parent method');
    }
}

var child = {
    method: function() {
        parent.method.apply(this, arguments);
        console.log('child method');
    },

    prop: 3
}

var a = Object.assign({}, parent, child);

a.method();

/*
    Mixed inheritance (extra nesting, less readability)
*/
function parent() {
    this.method = function() {
        console.log('parent method');
    }
}

function child() {
    var PARENT = {};
    
    parent.apply(PARENT, arguments);
    Object.assign(this, PARENT);

    this.method = function() {
        PARENT.method.apply(this, arguments);
        console.log('child method');
    }
}

var a = new child();

a.method();