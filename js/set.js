/*
note: js is kind of stupid. this requires all your objects you put into the Set to have unique ids, use a function that just increments a global id every time you construct another object 
*/

var Set = function(){
	this.obj = [];//{};
}

Set.prototype.add = function(elt){
	this.obj[elt.id] = elt;
}

Set.prototype.remove = function(elt){
	delete this.obj[elt.id];
}
Set.prototype.get = function(key){
	return this.obj[key];
}

Set.prototype.keys = function(){
	return Object.keys(this.obj);
}

var ListSet = function(lst){
	this.list = lst || [];
}

ListSet.prototype.add = function(elt){
	this.list.push(elt);
}

ListSet.prototype.remove = function(elt){
	var i = this.list.indexOf(elt);
	this.list.splice(i,1);
}
ListSet.prototype.get = function(i){
	return this.list[i];
}
ListSet.prototype.keys = function(){
	return Object.keys(this.list);
}
ListSet.prototype.union = function(set){
	return new ListSet(this.list.concat(set.list));
}