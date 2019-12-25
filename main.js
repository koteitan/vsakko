// fields--------------------
//entry point--------------------
window.onload = function(){
  initGame(); //use local option
  initDraw();
  initEvent(can);
  window.onresize(); //after loading maps
  setInterval(procAll, 1000/frameRate); //enter gameloop
}
//game-------------------
var ww=[5,5]; //world width
var map;
var pp; //player position
var rp=5; //hit point of replie
var initGame=function(){
  map=new Array(ww[0]);
  for(var x=0;x<ww[0];x++){
    map[x]=new Array(ww[1]);
    for(var y=0;y<ww[1];y++){
      map[x][y]=0;
    }
  }
  pp=[Math.floor((ww[0]-1)/2),Math.floor((ww[1]-1)/2)];
  map[pp[0]][pp[1]]=5;
  rp=5;
  isRequestedDraw = true;
}
//game loop ------------------
var procAll=function(){
  procEvent();
  if(isRequestedDraw){
    procDraw();
    isRequestedDraw = false;
  }
}

window.onresize = function(){ //browser resize
  var wx,wy;
  var agent = navigator.userAgent;
  var wx= [(document.documentElement.clientWidth-10)*0.99, 320].max();
  var wy= [(document.documentElement.clientHeight-200), 20].max();
  if(wx>wy){wx=wy;}else{wy=wx;}
  document.getElementById("outcanvas").width = wx;
  document.getElementById("outcanvas").height= wy;
  sw=[can.width, can.height];
  isRequestedDraw = true;
};
// graphics ------------------------
var ctx;
var can;
var fontsize = 15;
var radius = 15;
var isRequestedDraw = true;
var frameRate = 60; //[fps]
var sw;
//init
var initDraw=function(){
  can = document.getElementById("outcanvas");
  ctx = can.getContext('2d');
  sw=[can.width, can.height];
}
//proc
var procDraw = function(){

  //background
  ctx.fillStyle="white";
  ctx.fillRect(0,0,sw[0],sw[1]);

  //draw grid
  ctx.lineWidth=1;
  ctx.strokeStyle="black";
  ctx.fillStyle="black";
  for(var xi=0;xi<ww[0];xi++){
    for(var yi=0;yi<ww[1];yi++){
      var sx=Math.floor(sw[0]/(ww[0]+2));
      var sy=Math.floor(sw[1]/(ww[1]+2));
      var x=Math.floor(sx*(xi+1));
      var y=Math.floor(sy*(yi+1));
      ctx.beginPath();
      ctx.strokeRect(x,y,sx,sy);
      ctx.stroke();
    }
  }

  //draw text
  var strrp=String(rp);
  var rpr = 0.7; //size ratio of replie
  for(var xi=0;xi<ww[0];xi++){
    for(var yi=0;yi<ww[1];yi++){
      var isplayer = xi==pp[0] && yi==pp[1];
      var rpx;
      if(map[xi][yi]!=0){
        var strmap=String(map[xi][yi]);
        var sx=Math.floor(sw[0]/(ww[0]+2));
        var sy=Math.floor(sw[1]/(ww[1]+2));
        var fy=Math.floor(sw[1]/(ww[1]+2)/2);
        ctx.font = String(fy)+'px Segoe UI';
        var fx=ctx.measureText(strmap).width;
        var rpx = isplayer? ctx.measureText(strrp).width/2:0;
        var rx=fx>sx?sx/fx:1;
        var ry=fy>sy?sy/fy:1;
        var r=[rx,ry].min();
        fx*=r;
        fy*=r;
        rpx*=r;
        //parent
        ctx.fillStyle= isplayer?'red':'black';
        ctx.strokeStyle= isplayer?'red':'black';
        ctx.font = String(fy)+'px Segoe UI';
        var x=Math.floor(sx*(xi+1.5)-fx/2);
        var y=Math.floor(sy*(yi+1.5)+fy/2);
        ctx.fillText(strmap,x,y);
        if(isplayer){
          //replie
          ctx.fillStyle='blue';
          ctx.strokeStyle='blue';
          var x=Math.floor(sx*(xi+1.5)+fx/2);
          var y=Math.floor(sy*(yi+1.5)+fy/2-fy*0.5);
          ctx.font = String(fy*rpr)+'px Segoe UI';
          ctx.fillText(strrp,x,y);
        }
      }
    }
  }
}
//event---------------------
var downpos=[-1,-1];// start of drag
var movpos =[-1,-1];// while drag
var handleMouseDown = function(){
  movpos[0] = downpos[0];
  movpos[1] = downpos[1];
}
var handleMouseDragging = function(){
  isRequestedDraw = true;
}
var handleMouseUp = function(){
  isRequestedDraw = true;
}
var handleMouseWheel = function(){
  isRequestedDraw = true;
}

