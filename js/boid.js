var id = 0;
var Boid = function(dict){
	this.grid = dict.grid || [];
	this.x = dict.x || 0;
	this.y = dict.y || 0;

	this.vx = dict.vx || Math.random();
	this.vy = dict.vy || Math.random();

	this.ax = 0;
	this.ay = 0;

	this.color = dict.color || "rgb(200,200,200)";

	this.mass = dict.mass || 5;
	this.width = dict.width || 3;
	this.length = dict.length || 6;

	this.block = dict.block;

	this.max_speed = dict.max_speed || 3;
	this.max_accel = dict.max_accel || 1;

	this.searching = true;//randomly turn to find someone (no neighbors)
	this.search_time = 0;
	
	var block = this.grid.get(this.x,this.y);
	this.block = block;

	this.id = id;
	id += 1;
}

Boid.prototype.draw = function(){
	ctx.save();
	var x = this.x;
	var y = this.y;
	var width = this.width;
	var length = this.length;
	ctx.translate(this.x, this.y);

	var rotationState = Math.atan2(this.vy,this.vx);
	ctx.rotate(rotationState);

	ctx.fillStyle = this.color;
	ctx.fillRect(0-(length/2), 0-(width/2), length , width);
	if(display_neighborhoods){
		ctx.fillStyle = "rgba(100,100,100,.1)";
		ctx.beginPath();
		ctx.arc(0, 0, neighborhood_size/2, (2 * Math.PI)*(-2/5),  (2* Math.PI) * (2/5), false);
		ctx.fill();
	}
	
	ctx.restore();
}
Boid.prototype.lateral_line = function(boid){

}
Boid.prototype.vision = function(boid){

}

Boid.prototype.update = function(dimx, dimy){
	var x = this.x;
	var y = this.y;

	var avgx = 0;
	var avgy = 0;
	var avgvx = 0;
	var avgvy = 0;
	var attractn = 0;
	var orientn = 0;
	var too = 0;
	var tavgx = 0;
	var tavgy = 0;
	
	var neighbors = this.grid.get_neighbors(x,y, neighborhood_size);

	attract_d = neighborhood_size;
	orient_d = attract_d/2;

	for(var i = 0; i < neighbors.length() ; i++){
		var b = neighbors.get(i);
		if(b.id == this.id){ continue };

		var d = distance(x,y, b.x,b.y);
		if(d < rep_dist){
			tavgx += b.x;
			tavgy += b.y;
			too++;
		}
		else if (d < orient_d){

			var ratio = 1;
			avgvx += b.vx * ratio;
			avgvy += b.vy * ratio;
			orientn += ratio;
		}
		else if(d < attract_d){
			//if(vec_angle(this.vx,this.vy,(b.x-x),(b.y-y)) < -(Math.PI/2)*(3/4) ){
				//continue;
			//}
			var ratio = 1/(Math.pow(d,2));

			avgx += b.x * ratio;
			avgy += b.y * ratio;
			attractn += ratio;
		}

	}

	var ax = 0;
	var ay = 0;
	if(attractn){ 
		avgx /=attractn; avgy /= attractn; 
		ax += (avgx - x) / 100. ;
		ay += (avgy - y) / 100. ;
	}
	if(orientn){
		avgvx /= orientn; avgvy /= orientn; 
		ax += (avgvx/orientn) / 3. ;
		ay += (avgvy/orientn) / 3. ;
	}
	if(too){
		tavgx /=too;
		tavgy /= too;
		ax -= (tavgx - x) * .8 ;
		ay -= (tavgy - y) * .8 ;
	}
	if(distance(mx,my,x,y) < 100 &&0){
		ax += (mx - x)/10;
		ay += (my - y)/10;
	}


	if(magnitude(ax,ay) > this.max_accel){
		var accel = normalize(ax,ay);
		ax = accel[0] * this.max_accel;
		ay = accel[1] * this.max_accel;
	}

	this.vx += ax;
	this.vy += ay;
	if(magnitude(this.vx,this.vy) > this.max_speed){
		var vel = normalize(this.vx,this.vy);
		this.vx = vel[0] * this.max_speed;
		this.vy = vel[1] * this.max_speed;
	}


	this.x = mod(this.x + this.vx, dimx);
	this.y = mod(this.y + this.vy, dimy);
	this.grid.update(this);
}