var c=document.getElementById("the_canvas");
var ctx=c.getContext("2d");
ctx.fillStyle="#000000";
ctx.globalAlpha = 0.5;
ctx.globalCompositeOperation = "copy";


max_speed = 4;
max_accel = .5;
dimx = 0;
dimy = 0;
mx = 0;
my = 0;//mouse pos
mousedown = false;
adown = false;
ddown = false;

trails = 40;

boids = [];
block_size = 50;//px
blocks = [];

function resize(){
	dimx = Math.floor(window.innerWidth/block_size)*block_size-200;
	dimy = Math.floor(window.innerHeight/block_size)*block_size;
	c.setAttribute("width",dimx);
	c.setAttribute("height", dimy);
	$("#controls").css({'height':dimy-10});
	blocks = [];
	for(var i = 0; i < dimy/block_size ; i++){
		var row = [];
		for(var j = 0; j < dimx/block_size ; j++){
			row.push([]);
		}
		blocks[i] = row;
	}
}
function get_block(x,y){
	block_x = Math.floor(x/block_size);
	block_y = Math.floor(y/block_size);
	return blocks[block_y][block_x];
}
function set_block(boid, new_block){
	var old_block = boid.block;
	var i = old_block.indexOf(boid);
	if(i != -1){
		old_block.splice(i,1);
		new_block.push(boid);
		boid.block = new_block;
	}else{
		console.log("oops");
	}
}
function mod(x,y){
	return ((x%y) + y)%y;
}
function distance_sqr(x,y,x2,y2){
	return Math.pow(x2-x, 2) + Math.pow(y2 - y, 2);
}
function distance(x,y,x2,y2){
	return Math.sqrt(distance_sqr(x,y,x2,y2));
}
function normalize(x,y){//normalize the vector
	var length = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
	if(length) return [x/length, y/length];
	return [0.0,0.0];
}
function get_averages(neighbors){
	var l = neighbors.length;
	var xavg_prey,yavg_prey,vxavg_prey,vyavg_prey = 0;
	var xavg_pred,yavg_pred,vxavg_pred,vyavg_pred = 0;
	xavg_prey = 0; xavg_pred = 0;
	yavg_prey = 0; yavg_pred = 0;
	vxavg_prey = 0; vxavg_pred = 0;
	vyavg_prey = 0; vyavg_pred = 0;

	var nprey = 0;
	var npred = 0;
	for(var i = 0; i < l ; i++){
		n = neighbors[i];
		if(n.evil){
			xavg_pred += n.x;
			yavg_pred += n.y;
			vxavg_pred += n.vx;
			vyavg_pred += n.vy;
			npred += 1;
		}else{
			xavg_prey += n.x;
			yavg_prey += n.y;
			vxavg_prey += n.vx;
			vyavg_prey += n.vy;
			nprey += 1;
		}
	}
	var ret = [[NaN,NaN,NaN,NaN],[NaN,NaN,NaN,NaN]];
	if(nprey){
		ret[0] = [xavg_prey/nprey, yavg_prey/nprey, vxavg_prey/nprey, vyavg_prey/nprey];
	}
	if(npred){
		ret[1] = [xavg_pred/npred, yavg_pred/npred, vxavg_pred/npred, vyavg_pred/npred];
	}
	return ret;
}

function update(boid){
	var dead = false;
	var x = boid.x;
	var y = boid.y;
	var vx = boid.vx;
	var vy = boid.vy;
	var evil = boid.evil;

	var i = 0;
	var l = boids.length;
	var h = 3
	var too_close = 0;
	var tcx = 0;
	var tcy = 0;
	var neighbors = [];
	var n = 0;
	for(i = x-block_size; i <= x+block_size ; i+=block_size){
		for(var j = y-block_size*2; j <= y+block_size*2 ; j+=block_size){
			var neighbor_bs = get_block(mod(i,dimx),mod(j,dimy));
			for(var n = 0; n<neighbor_bs.length;n++){
				b = neighbor_bs[n];
				if(b === boid) continue;
				var d = distance(x,y,b.x,b.y)
				if(d < 10){
					tcx += b.x;
					tcy += b.y;
					too_close += 1;
					if(d < 5 && evil === 0 && b.evil === 1){
						//dead = true;
					}
				}if(d < 70) neighbors.push(b);
			}
		}
	}
	var xaccel = 0;
	var yaccel = 0;
	if(too_close > 0){
		xaccel -= (tcx/too_close -x)/1.5;
		yaccel -= (tcy/too_close -y)/1.5;
	}
	var ret = get_averages(neighbors);
	var prey = ret[0];
	var pred = ret[1];

	if(! isNaN(prey[0])){//prey
		prey = ret[0];
		if(evil){
			xaccel += 2*((prey[0] - x)/30. + (prey[2])/6.);
			yaccel += 2*((prey[1] - y)/30. + (prey[3])/6.);
		}else{
			xaccel += ((prey[0] - x)/30. + (prey[2])/6.);
			yaccel += ((prey[1] - y)/30. + (prey[3])/6.);
		}

	}
	if(! isNaN(pred[0])){
		pred = ret[1];
		if(evil){
			xaccel += (pred[0] - x)/30. + (pred[2])/6.;
			yaccel += (pred[1] - y)/30. + (pred[3])/6.;
		}else{//run from predators
			var vxavg = pred[2]/6.;
			var vyavg = pred[3]/6.;
			if(distance_sqr(x - vyavg, y + vxavg, pred[0],pred[1]) > distance_sqr(x + vyavg, y - vxavg, pred[0], pred[1])) {
				yaccel += (pred[0] - x)/30 * 0. + (pred[2])/6.;
				xaccel -= (pred[1] - y)/30. * 0. + (pred[3])/6.;
			}else{
				yaccel -= (pred[0] - x)/30 * 0. + (pred[2])/6.;
				xaccel += (pred[1] - y)/30. * 0. + (pred[3])/6.;
			}
		}
	}
	accel = normalize(xaccel,yaccel);
	
	xaccel = accel[0]*max_accel;
	yaccel = accel[1]*max_accel;
	if(mousedown){
		xaccel *= -1; yaccel *=-1;
	}

	vel = normalize(vx + xaccel, vy + yaccel);
	boid.vx = vel[0]*max_speed;
	boid.vy = vel[1]*max_speed;

	boid.x = mod(x + vx,dimx);
	boid.y = mod(y + vy, dimy);

	var new_block = get_block(boid.x,boid.y);
	if(new_block != boid.block){
		set_block(boid, new_block);
	}

	if(boid.evil) ctx.fillStyle="#FF0000";
	else ctx.fillStyle="#00FF00";

	ctx.fillRect(boid.x,boid.y,3,3);
	return dead;
}

function clear(boid){
	//ctx.clearRect(boid.x-1,boid.y-1,5,5);
	//ctx.fillStyle = boid.evil ? "rgba(100,0,0,.5)" : "rgba(100,100,100,.1)";
	//ctx.fillRect(boid.x,boid.y,2,2);
}

function new_boid(x,y, evil, vx,vy){
	var xx = mod(x,dimx);
	var yy = mod(y,dimy);
	var block = get_block(xx,yy);
	var b = {
		"x" : xx,
		"y" : yy,
		"evil" : evil ? evil : 0,
		"vx" : vx ? vx : 0. ,
		"vy" : vy ? vy : 0.,
		"block" : block
	};
	block.push(b);
	return b;
}

function run(){
	var opa = String((trails)*.005);
	ctx.fillStyle = "rgba(0,0,0,"+opa+")";
	ctx.fillRect(0,0,dimx,dimy);

	l = boids.length;
	//for(var i = 0; i < l ; i++){
	//	clear(boids[i]);
	//}
	dead = [];
	for(var i = 0; i < l ; i++){
		if(update(boids[i])){//returns whether or not you died
			dead.push(boids[i]);
		}
	}
	for(var d = 0; d < dead.length; d++){
		var i = boids.indexOf(dead[d]);
		var boid = boids[i];

		var block = boid.block;
		block.splice(block.indexOf(boid),1)
		boids.splice(i,1);
	}
	if(ddown || adown){
		var evil = ddown ? 0 : 1;
		x = new_boid(
			mx,
			my, 
			evil, 
			(Math.random() - .5) * 10,  
			(Math.random() - .5) * 10);
		//x.evil = 0;
		boids.push(x);
	}
}

function pause(){
	if(interval){
		interval = clearInterval(interval);
	}else{
		interval = setInterval(run, 10);
	}
}
function setup(){
	window.onresize = resize;
	resize();

	var i = 0;
	for(i = 0; i < 500 ; i++){
		x = new_boid(
			Math.random() * 3000,
			Math.random() * 3000, 
			(Math.ceil(Math.random()-.8)), 
			(Math.random() - .5) * 10,  
			(Math.random() - .5) * 10);
		//x.evil = 1;
		boids.push(x);
	}

	$("canvas").mousemove(function(e){
	      mx = e.pageX;
	      my = e.pageY;
   	}).mousedown(function(e){
   		mousedown = true;
   	}).mouseup(function(e){
   		mousedown = false;
   	});
   	$(document).keydown(function(e){
   		var w = String.fromCharCode(e.which);
   		if(w === "A") adown = true;
   		else if (w === "D") ddown = true;
   		else if (w === "P") pause();
   	}).keyup(function(e){
   		var w = String.fromCharCode(e.which);
   		if(w === "A") adown = false;
   		else if (w === "D") ddown = false;
   	});

   	$("#trails").change(function(){
   		trails = parseInt($("#trails").attr('value'));
   	});
   	$("#clear").click(function(){
   		for(var i = 0; i < boids.length; i++){
   			var block = boids[i].block;
   			block.splice(0, block.length);
   		}
   		boids = [];
   	});

	//run();
	interval = setInterval(run, 30);
}
