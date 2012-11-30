var c=document.getElementById("the_canvas");
var ctx=c.getContext("2d");
ctx.fillStyle="#000000";

max_speed = 5;
dimx = 0;
dimy = 0;
boids = [];

function resize(){
	dimx = window.innerWidth;
	dimy = window.innerHeight;
	c.setAttribute("width",dimx);
	c.setAttribute("height", dimy);
}
function mod(x,y){
	return ((x%y) + y)%y;
}
function distance(x,y,x2,y2){
	return Math.sqrt(Math.pow(x2-x, 2) + Math.pow(y2 - y, 2));
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
		if(d < 10){
			tcx += b.x;
			tcy += b.y;
			too_close += 1;
		}if(d < 70) neighbors.push(b);
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

	if(prey[0] != NaN){//prey
		prey = ret[0];
		if(evil){
			xaccel += (prey[0] - x)/30. + (prey[2])/6.;
			yaccel += (prey[1] - y)/30. + (prey[3])/6.;
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
		}else{
			xaccel -= (pred[0] - x)/30. + (pred[2])/6.;
			yaccel -= (pred[1] - y)/30. + (pred[3])/6.;
		}
	}
	accel = normalize(xaccel,yaccel);
	xaccel = accel[0];
	yaccel = accel[1];

	vel = normalize(vx + xaccel, vy + yaccel);
	boid.vx = vel[0]*max_speed;
	boid.vy = vel[1]*max_speed;

	boid.x = mod(x + vx,dimx);
	boid.y = mod(y + vy, dimy);

	if(boid.evil) ctx.fillStyle="#FF0000";
	else ctx.fillStyle="#FFFFFF";

	ctx.fillRect(boid.x,boid.y,3,3);
}

function clear(boid){
	ctx.clearRect(boid.x-1,boid.y-1,5,5);
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

function run(){
	l = boids.length;
	for(var i = 0; i < l ; i++){
		clear(boids[i]);
	}
	for(var i = 0; i < l ; i++){
		update(boids[i]);
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
		x = new_boid(400,400, (Math.ceil(Math.random()-.7)), (Math.random() - .5) * 10,  (Math.random() - .5) * 10);
		x.x = Math.random() * 2000;
		x.y = Math.random() * 2000;
		//x.evil = 0;
		boids.push(x);
	}
	interval = setInterval(run, 10);
}