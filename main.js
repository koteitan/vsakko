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
var size=9;
var ww=[size,size,2]; //world width
var map;
var pp; //player position
var rp; //hit point of replie
var movstack;//motion stack
var movstacki;//motion stack index

//init
var initGame=function(){
  map=new Array(ww[0]);
  for(var x=0;x<ww[0];x++){
    map[x]=new Array(ww[1]);
    for(var y=0;y<ww[1];y++){
      map[x][y]=[-1,-1];
    }
  }
  pp=[Math.floor((ww[0]-1)/2),Math.floor((ww[1]-1)/2)];
  map[pp[0]][pp[1]][0]=2;
  map[pp[0]][pp[1]][1]=2;
  rp                  =2;
  movstack=new Array(ww[0]*ww[1]*2);
  movstacki=0;
  movstack[movstacki]=pp; //save now
  isdraw = true;
  isope = true;
  isdrawreplie=false;
  reqretry=false;
}

//move
var moveGame=function(dir){
  if(!isope) return;

  var pp1=add(dir,pp);

  //check wall
  if(pp1[0]<0 || pp1[1]<0 || pp1[0]>=ww[0] || pp1[1]>=ww[1])return;
  //check zero
  if(map[pp1[0]][pp1[1]][0]!=-1)return;

  //move
  if(map[pp1[0]][pp1[1]][0]==-1){
    map[pp1[0]][pp1[1]][0]=map[pp[0]][pp[1]][0];
    map[pp1[0]][pp1[1]][1]=map[pp[0]][pp[1]][1];
  }else{
    map[pp1[0]][pp1[1]][0]=[map[pp1[0]][pp1[1]][0], map[pp[0]][pp[1]][0]].max();
    map[pp1[0]][pp1[1]][1]=[map[pp1[0]][pp1[1]][1], map[pp[0]][pp[1]][1]].max();
  }
  map[pp [0]][pp [1]][1]--;
  rp--;
  pp=pp1.clone();

  //save motion
  movstacki++;
  movstacki%=movstack.length;
  movstack[movstacki]=pp1.clone();

  //check zeros
  if(map[pp[0]][pp[1]][1]==0){
    setTimeout(moveEater, 50);
    isope = false;
    return;
  }

  //check replie HP
  if(rp==0){
    isope = false;
    setTimeout(feedReplie, 100);
  }else{
    isope = true;
  }
  isdraw = true;
}

// feed replie
var feedReplie=function(){
  map[pp[0]][pp[1]][1]--; //reduce middo
  rp++;
  if(map[pp[0]][pp[1]][1]==0){
    setTimeout(moveEater, 50);
    isope = false;
  }else{
    isope = true;
  }
  isdraw = true;
}
// move zero eater
var moveEater=function(){
  if(map[pp[0]][pp[1]][1]==0){ // middo is still zero
    if(map[pp[0]][pp[1]][0]==0){ // parent is zero too
      //eat zeros
      map[pp[0]][pp[1]][0]=-1;
      map[pp[0]][pp[1]][1]=-1;
      rp++;//recover
      //undo motion
      movstacki--;
      movstacki+=movstack.length;
      movstacki%=movstack.length;
      pp = movstack[movstacki].clone();
      setTimeout(moveEater,50);
    }else{ // middo is nonzero
      map[pp[0]][pp[1]][0]--; // reduce parent
      map[pp[0]][pp[1]][1]=rp; // replie is copied into middo
      isope = true;
    }
  }else{
    //sanity
    if(map[pp[0]][pp[1]][0]==-1){
      gameover();
    }
    isope = true;
  }
  isdraw = true;
}
//game loop ------------------
var procAll=function(){
  procEvent();
  if(isdraw){
    procDraw();
    isdraw = false;
  }
}
var reqretry=false;
var isdrawreplie=false;
var gameover=function(){
  isdrawreplie=true;
  isdraw=true;
  reqretry=true;
  isdrawreplie=true;
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
  isdraw = true;
};
// graphics ------------------------
var ctx;
var can;
var fontsize = 15;
var radius = 15;
var isdraw = true;
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
      if(map[xi][yi][0]!=-1||isdrawreplie){
        var strmap0=String(map[xi][yi][0]);
        var strmap1=String(map[xi][yi][1]);
        var sx=Math.floor(sw[0]/(ww[0]+2));
        var sy=Math.floor(sw[1]/(ww[1]+2));
        var fy=Math.floor(sw[1]/(ww[1]+2)/2);
        ctx.font = String(fy)+'px Segoe UI';
        var fx=[    ctx.measureText(strmap0).width,
                    ctx.measureText(strmap1).width*rpr,
          isplayer? ctx.measureText(strrp  ).width*rpr*rpr:0];
        var rx=fx.sum()>sx?sx/fx.sum():1;
        var ry=fy      >sy?sy/fy      :1;
        var r=[rx,ry].min();
        fx =mulkv(r,fx);
        fy =      r*fy;
        rpx=      r*rpx;
        //parent
        ctx.fillStyle  = isplayer?'red':'black';
        ctx.strokeStyle= isplayer?'red':'black';
        ctx.font = String(fy)+'px Segoe UI';
        var x=Math.floor(sx*(xi+1.5)-fx.sum()/2);
        var y=Math.floor(sy*(yi+1.5)+fy/2);
        if(map[xi][yi][0]!=-1) ctx.fillText(strmap0,x,y);
        //middo
        ctx.fillStyle  = 'green';
        ctx.strokeStyle= 'green';
        ctx.font = String(fy*rpr)+'px Segoe UI';
        var x=Math.floor(sx*(xi+1.5)-fx.sum()/2+fx[0]);
        var y=Math.floor(sy*(yi+1.5)+fy/2-fy*0.5);
        if(map[xi][yi][0]!=-1) ctx.fillText(strmap1,x,y);
        if(isplayer){
          //replie
          ctx.fillStyle='blue';
          ctx.strokeStyle='blue';
          var x=Math.floor(sx*(xi+1.5)-fx.sum()/2+fx[0]+fx[1]);
          var y=Math.floor(sy*(yi+1.5)+fy/2-fy);
          ctx.font = String(fy*rpr)*rpr+'px Segoe UI';
          ctx.fillText(strrp,x,y);
        }
      }
    }
  }
}
//event---------------------
var isope = false;
var handleMouseDown = function(){
  if(reqretry){
    //return
    setTimeout(initGame,10);
  }
}
var handleMouseDragging = function(){
}
var handleMouseUp = function(){
  var dir = sub(mouseUpPos, mouseDownPos);
  var absdir = [Math.abs (dir[0]), Math.abs (dir[1])];
  var sgndir = [Math.sign(dir[0]), Math.sign(dir[1])];
  var eraseindex = absdir[0]>absdir[1]?1:0;
  sgndir[eraseindex] = 0;
  if(absdir.max()>10)
    moveGame(sgndir);
}
var handleMouseWheel = function(){
}
var handleKeyDown = function(e){
  if(reqretry){
    setTimeout(initGame,10);
    return;
  }
  var k = e.key;
  var key2dir = [
    //x, y
    ["ArrowLeft" ,[-1, 0]],
    ["ArrowRight",[+1, 0]],
    ["ArrowUp"   ,[ 0,-1]],
    ["ArrowDown" ,[ 0,+1]],
    ["a"         ,[-1, 0]],
    ["d"         ,[+1, 0]],
    ["w"         ,[ 0,-1]],
    ["s"         ,[ 0,+1]],
    ["x"         ,[ 0,+1]]
  ];
  for(var i=0;i<key2dir.length;i++){
    if(k==key2dir[i][0]) moveGame(key2dir[i][1]);
  }
}

