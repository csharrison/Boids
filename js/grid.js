var Grid = function(){
	this.list = [];
	this.size = 0;
	this.dimx = 0;
	this.dimy = 0;

	this.xl = 0;
	this.yl = 0;
}

Grid.prototype.resize = function(block_size, dimx, dimy){
	this.size = block_size;
	this.dimx = dimx;
	this.dimy = dimy;

	this.list = [];
	for(var i = 0; i < dimy/block_size ; i++){
		var row = [];
		for(var j = 0; j < dimx/block_size ; j++){
			var s = new ListSet();
			row.push(s);
		}
		this.list[i] = row;
	}
	this.xl = this.list[0].length;
	this.yl = this.list.length;
}

Grid.prototype.get = function(screenx, screeny){
	block_x = Math.floor(screenx/this.size);
	block_y = Math.floor(screeny/this.size);
	return this.list[block_y][block_x];
}

Grid.prototype.set = function(elt, old_set, new_set){
	old_set.remove(elt);
	new_set.add(elt);
	elt.block = new_set;
}

Grid.prototype.update = function(elt){
	var block = this.get(elt.x,elt.y);
	if(block != elt.block){
		this.set(elt, elt.block, block);
	}	
}

Grid.prototype.get_neighbors = function(sx,sy, size){
	var stride = Math.max(Math.ceil(size/this.size),1);
	var s,x,y;

	sx = mod(sx, dimx);
	sy = mod(sy, dimy);
	
	x = Math.floor(sx/this.size);
	y = Math.floor(sy/this.size);
	s = this.list[y][x];
	for(var xx = x-stride; xx <= x+stride; xx++){
		for(var yy = y - stride; yy <= y + stride; yy++){
			if (xx != x && yy != y) s = s.union(this.list[mod(yy, this.yl)][mod(xx, this.xl)]);
		}
	}

	return s;
}