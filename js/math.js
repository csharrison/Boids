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
function magnitude(x,y){
	return distance(x,y,0,0);
}
function dot(x,y,x2,y2){
	return x*x2 + y*y2;
}

function vec_angle(x,y,x2,y2){
	d = dot(x,y,x2,y2);
	sintheta = d / (magnitude(x,y) * magnitude(x2,y2));
	//console.log(Math.asin(sintheta));
	return Math.asin(sintheta);
}