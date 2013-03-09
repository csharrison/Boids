var Set = function(lst){
	this.list = lst || [];
}

Set.prototype.add = function(elt){
	this.list.push(elt);
}

Set.prototype.length = function(){ return this.list.length; }

Set.prototype.remove = function(elt){
	var i = this.list.indexOf(elt);
	this.list.splice(i,1);
}
Set.prototype.get = function(i){
	return this.list[i];
}
Set.prototype.keys = function(){
	return Object.keys(this.list);
}
Set.prototype.union = function(set){
	return new Set(this.list.concat(set.list));
}