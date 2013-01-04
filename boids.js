

max_speed = 4;
max_accel = 1;
dimx = 0;
dimy = 0;

mousedown = false;

trails = 40;

boids = [];
block_size = 50.;//px
grid = new Grid();
paused = false;
function resize(){
	dimx = Math.floor(window.innerWidth/block_size)*block_size-200;
	dimy = Math.floor(window.innerHeight/block_size)*block_size;
	c.setAttribute("width",dimx);
	c.setAttribute("height", dimy);
	$("#controls").css({'height':dimy-10});

	grid.resize(block_size, dimx, dimy);
}

wd = sd = ad = dd = nd = false;
var you;

function run(){
	if(! paused){
		var opa = String((trails)*.005);
		ctx.fillStyle = "rgba(0,0,0,"+opa+")";
		ctx.fillRect(0,0,dimx,dimy);

		l = boids.length;
		for(var i = 0; i < l ; i++){
			boids[i].update(dimx,dimy);
			boids[i].draw();
		}
	}
	if(nd){
		x = new Boid({
			'x' : mx,
			'y' : my,
			'vx' : (Math.random() - .5) * 4,
			'vy' : (Math.random() - .5) * 4,
			'grid' : grid
		})
		boids.push(x);	
		x.draw();
	}

	dx = mx - you.x;
	dy = my - you.y;
	you.ax = dx;
	you.ay = dy;
	you.move();
	you.draw();
}
function setup(){
	window.onresize = resize;
	resize();

	you = new Boid({
		'x' : dimx/2,
		'y' : dimy/2,
		'grid' : grid,
		'color' : 'rgb(250,0,0)'
	});


	var i = 0;
	var num = 30;
	for(i = 0; i < num ; i++){
		var r = 100;
		var theta = (Math.PI * 2 * i)/num;
		for(var j = 0; j < 3; j++){
			var xpos = (dimx/2)+Math.cos(theta)*(r + j*20);//Math.random() * dimx;
			var ypos = (dimy/2)+Math.sin(theta)*(r + j*20);//Math.random() * dimy;

			var vx = -Math.cos(theta)*10;
			var vy = Math.sin(theta)*10;
			x = new Boid({
				'x' : xpos,
				'y' : ypos,
				'vx' : vy,
				'vy' : vx,
				'grid' : grid,
				'block' : grid.get(xpos,ypos)
			});
			grid.get(xpos,ypos).add(x);
			boids.push(x);
		}
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
   		if(w === "W") wd = true;
   		else if (w === "S") sd = true;
		else if (w === "A") ad = true;
   		else if (w === "D") dd = true;

   		else if (w === "N") nd = true;

   		else if (w === "P") paused = !paused;
   	}).keyup(function(e){
   		var w = String.fromCharCode(e.which);
   		if (w === "S") sd = false;
		else if (w === "A") ad = false;
   		else if (w === "D") dd = false;

   		else if (w === "N") nd = false;
   	});

   	$("#trails").change(function(){
   		trails = parseInt($("#trails").attr('value'));
   	});
   	$("#rep_dist").change(function(){
   		rep_dist = parseInt($("#rep_dist").attr("value"));
   	});
   	$("#attract_dist").change(function(){
   		neighborhood_size = parseInt($("#attract_dist").attr("value"));
   		console.log(neighborhood_size);
   	});
   	$("#block_size").change(function(){
   		block_size = parseInt($("#block_size").attr("value"));
   		resize();
   	});
   	$("#max_speed").change(function(){
   		max_speed = parseInt($("#max_speed").attr("value"))/100.;
   	});
   	$("#max_accel").change(function(){
   		max_accel = parseInt($("#max_accel").attr("value"))/100.;
   	});
   	$("#interval_length").change(function(){
   		interval_length = parseInt($("#interval_length").attr("value"));
   		clearInterval(interval);
   		interval = setInterval(run, interval_length);
   	});

   	$("#clear").click(function(){
   		for(var i = 0; i < boids.length; i++){
   			var block = boids[i].block;
   			block.remove(boids[i]);
   		}
   		boids = [];
   	});
   	$("#neighborhood").click(function(){
   		display_neighborhoods = !display_neighborhoods;
   		$("#neighborhood").attr('value', (display_neighborhoods? "hide" : "show"));
   	});

	//run();
	interval = setInterval(run, interval_length);
}
