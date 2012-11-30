var c=document.getElementById("the_canvas");
var ctx=c.getContext("2d");
ctx.fillStyle="#000000";

max_speed = 5;
dimx = 0;
dimy = 0;
function resize(){
	dimx = window.innerWidth;
	dimy = window.innerHeight;
	c.setAttribute("width",dimx);
	c.setAttribute("height", dimy);
}
window.onresize = resize;
resize();

boids = [];

function mod(x,y){
	return ((x%y) + y)%y;
}
function distance(x,y,x2,y2){
	return Math.sqrt(Math.pow(x2-x, 2) + Math.pow(y2 - y, 2));
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
	var x = boid.x;
	var y = boid.y;
	var vx = boid.vx;
	var vy = boid.vy;
	var evil = boid.evil;

	var i = 0;
	var l = boids.length;
	var too_close = 0;
	var tcx = 0;
	var tcy = 0;
	var neighbors = [];
	var n = 0;
	for(i = 0; i < l ; i++){
		b = boids[i];
		var d = distance(x,y,b.x,b.y)
		if(d < 20){
			tcx += b.x;
			tcy += b.y;
			too_close += 1;
		}if(d < 120) neighbors.push(b);
	}

	if(n != 0){
		vy = vy + (summedvy/n)/6.;
		vx = vx + (summedvx/n)/6.;
		avgx = summedx/n;
		avgy = summedy/n;
		vx += (avgx-x)/30.;
		vy += (avgy-y)/30.;
	}if(too_close !=0){
		vx = vx - (tcx/too_close -x)/3.;
		vy = vy - (tcy/too_close -y)/3.;
	}

	if(distance(vx,vy,0,0) < max_speed){
		boid.vy = vy;
		boid.vx = vx;
	}
	boid.x = mod(x + vx,dimx);
	boid.y = mod(y + vy, dimy);
	if(boid.evil){
		ctx.fillStyle="#FF0000";
	}else{
		ctx.fillStyle="#FFFFFF";
	}
	ctx.fillRect(boid.x,boid.y,5,5);
}

function update2(boid){
	var x = boid.x;
	var y = boid.y;
	var vx = boid.vx;
	var vy = boid.vy;
	var evil = boid.evil;

	var i = 0;
	var l = boids.length;
	var summedx = 0;
	var summedy = 0;
	var summedvx = 0;
	var summedvy = 0;
	var n = 0;
	var too_close = 0;
	var tcx = 0;
	var tcy = 0;
	for(i = 0; i < l ; i++){
		b = boids[i];
		bx = b.x;
		by = b.y;
		var same = (b.evil == evil) ? 1 : 0;
		var d = distance(x,y,bx,by)
		if(d < 20){
			tcx += bx;
			tcy += by;
			too_close += 1;
		}if(d < 120){
			summedx += bx;
			summedy += by;
			summedvx += b.vx;
			summedvy += b.vy;
			n += 1;
		}
	}
	if(n != 0){
		vy = vy + (summedvy/n)/6.;
		vx = vx + (summedvx/n)/6.;
		avgx = summedx/n;
		avgy = summedy/n;
		vx += (avgx-x)/30.;
		vy += (avgy-y)/30.;
	}if(too_close !=0){
		vx = vx - (tcx/too_close -x)/2.;
		vy = vy - (tcy/too_close -y)/2.;
	}

	if(distance(vx,vy,0,0) < max_speed){
		boid.vy = vy;
		boid.vx = vx;
	}
	boid.x = mod(x + vx,dimx);
	boid.y = mod(y + vy, dimy);
	if(boid.evil){
		ctx.fillStyle="#FF0000";
	}else{
		ctx.fillStyle="#FFFFFF";
	}
	ctx.fillRect(boid.x,boid.y,5,5);
}
function clear(boid){
	ctx.clearRect(boid.x-1,boid.y-1,7,7);
}

function new_boid(x,y, evil, vx,vy){
	return {
		"x" : x,
		"y" : y,
		"evil" : evil ? evil : 0,
		"vx" : vx ? vx : 0. ,
		"vy" : vy ? vy : 0.
	};
}

var i = 0;
for(i = 0; i < 500 ; i++){
	x = new_boid(400,400, (Math.ceil(Math.random()-.5)), (Math.random() - .5) * 15,  (Math.random() - .5) * 15);
	x.x = Math.random() * 2000;
	boids.push(x);
}
function run(){
	l = boids.length;
	for(var i = 0; i < l ; i++){
		clear(boids[i]);
	}
	for(var i = 0; i < l ; i++){
		update(boids[i]);
	}
}


setInterval(run, 1);