// fields--------------------
//entry point--------------------
window.onload = function(){
  initGame(); //use local option
  initDraw();
  initEvent(can);
  window.onresize(); //after loading maps
  setInterval(procAll, 1000/frameRate); //enter gameloop
}
//game loop ------------------
var procAll=function(){
  procEvent();
  procDragEvent();
  procGame();
  if(isdraw){
    procDraw();
    isdraw = false;
  }
}
//game-------------------
//controls
var gamecount     = 0;
var gamecount_max = 0.1; // operation interval
//world
var size=9;
var ww=[size,size,2]; //world width
var map;
//players
var players = 2;//player vs com
//commons
var pp; //player position
var rp; //hit point of replie
var movstack;//motion stack
var movstacki;//motion stack index
var isope;
var isdrawreplie;//replie is drawn or not in this turn
var dp; //direction of p
//init
var initGame=function(){
  //map
  map=new Array(ww[0]);
  for(var x=0;x<ww[0];x++){
    map[x]=new Array(ww[1]);
    for(var y=0;y<ww[1];y++){
      map[x][y]=[-1,-1];
    }
  }

  //players
  pp=[
    [0      ,         Math.floor((ww[1]-1)/2)],
    [ww[0]-1, ww[1]-1-Math.floor((ww[1]-1)/2)]
  ];
  dp=[[+1,0],[-1,0]];
  pcolor=["red"  ,"magenta"]; //color of akko
  dcolor=["green","purple"];  //color of doggo
  rcolor=["blue" ,"cyan"];    //color of replie
  movstack    =new Array(players);
  movstacki   =new Array(players);
  isope       =new Array(players);
  isdrawreplie=new Array(players);
  rp          =new Array(players);
  for(var p=0;p<players;p++){
    map[pp[p][0]][pp[p][1]][0]=3;
    map[pp[p][0]][pp[p][1]][1]=3;
    movstack [p]=new Array(ww[0]*ww[1]*2);
    movstacki[p]=0;
    movstack[p][movstacki]=pp[p]; //save now
    isope       [p]= true;
    isdrawreplie[p]=false;
    rp[p]=3;
  }
  gamecount = gamecount_max;
  isdraw   = true;
  reqretry = false;
}
var gameover=function(){
  isdraw=true;
  reqretry=true;
}
//proc Game
var procGame = function(){
  gamecount-=1/frameRate;
  if(gamecount<=0){
    gamecount = gamecount_max;
    procNpc();
    for(var p=0;p<players;p++){
      moveGame(p,dp[p]);
    }
  }
}
//move
var moveGame=function(p, dir){
  if(!isope) return;
  
  var pp1;
  var rotcount = 0;
  while(true){
    pp1=add(dir,pp[p]);
    //check wall
    if(pp1[0]>=0 && pp1[1]>=0 && pp1[0]<ww[0] && pp1[1]<ww[1] && map[pp1[0]][pp1[1]][0]==-1){
      break;
    }else{
      dp[p]=mulxv([[0,-1],[+1,0]],dp[p]); //rotate
      rotcount++;
      if(rotcount>=4){
        gameover(p); //4men soka
        return;
      }
    }
  }

  //move
  map[pp1[0]][pp1[1]][0]=map[pp[p][0]][pp[p][1]][0];
  map[pp1[0]][pp1[1]][1]=map[pp[p][0]][pp[p][1]][1];
  map[pp[p][0]][pp[p][1]]--;
  rp[p]--;
  pp[p]=pp1.clone();

  //save motion
  movstacki[p]++;
  movstacki[p]%=movstack[p].length;
  movstack[p][movstacki[p]]=pp1.clone();

  //check zeros
  if(map[pp[p][0]][pp[p][1]][1]==0){
    setTimeout(moveEater, 50, p);
    isope[p] = false;
    return;
  }

  //check replie HP
  if(rp[p]==0){
    isope[p] = false;
    setTimeout(feedReplie, 100, p);
  }else{
    isope[p] = true;
  }
  isdraw = true;
}

// feed replie
var feedReplie=function(p){
  map[pp[p][0]][pp[p][1]][1]--; //reduce middo
  rp[p]++;
  if(map[pp[p][0]][pp[p][1]][1]==0){
    setTimeout(moveEater, 50, p);
    isope[p] = false;
  }else{
    isope[p] = true;
  }
  isdraw = true;
}
// move zero eater
var moveEater=function(){
  if(map[pp[p][0]][pp[p][1]][1]==0){ // middo is still zero
    if(map[pp[p][0]][pp[p][1]][0]==0){ // parent is zero too
      //eat zeros
      map[pp[p][0]][pp[p][1]][0]=-1;
      map[pp[p][0]][pp[p][1]][1]=-1;
      rp[p]++;//recover
      //undo motion
      movstacki--;
      movstacki+=movstack.length;
      movstacki%=movstack.length;
      pp[p] = movstack[movstacki].clone();
      setTimeout(moveEater,50,p);
    }else{ // middo is nonzero
      map[pp[p][0]][pp[p][1]][0]--; // reduce parent
      map[pp[p][0]][pp[p][1]][1]=rp[p]; // replie is copied into middo
      isope[p] = true;
    }
  }else{
    //sanity
    if(map[pp[p][0]][pp[p][1]][0]==-1){
      gameover(p);
    }
    isope[p] = true;
  }
  isdraw[p] = true;
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

  var rpr = 0.7; //size ratio of replie
  var sx=Math.floor(sw[0]/(ww[0]+2)); // size of cube
  var sy=Math.floor(sw[1]/(ww[1]+2)); // size of cube
  for(var p=0;p<players;p++){
    //draw text
    var strrp=String(rp[p]);
    for(var xi=0;xi<ww[0];xi++){
      for(var yi=0;yi<ww[1];yi++){
        var isplayer = xi==pp[p][0] && yi==pp[p][1];
        var rpx;
        if(map[xi][yi][0]!=-1||isdrawreplie){
          var strmap0=String(map[xi][yi][0]);
          var strmap1=String(map[xi][yi][1]);
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
          if(isplayer){
            ctx.fillStyle  = pcolor[p];
            ctx.strokeStyle= pcolor[p];
          }
          ctx.font = String(fy)+'px Segoe UI';
          var x=Math.floor(sx*(xi+1.5)-fx.sum()/2);
          var y=Math.floor(sy*(yi+1.5)+fy      /2);
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
}
//event---------------------
var reqretry = false;  // after game over
var handleMouseDown = function(){
  if(reqretry){
    //return
    setTimeout(initGame, 10);
  }
}
var handleMouseDragging = function(){
}
var procDragEvent = function(){
  if(isDragging){
    switch(dragstate){
      case 0: // first move
        var dir = sub(mousePos, mouseDownPos);
        var absdir = [Math.abs(dir[0]), Math.abs(dir[1])];
        if(absdir.max()>10){
          handleMouseUp(); //move immediately
          nodraggingmove = true;
          dragcount = dragcount_long;
          dragstate = 1;
        }
        break;
      case 1: // second move
        if(dragcount <= 0){
          handleMouseUp();
          nodraggingmove = true;
          dragcount = dragcount_short;
        }else{
          dragcount -= 1/frameRate;
        }
        break;
      default:
        break;
    }
  }else{
    dragstate = 0;
  }
}
var dragstate = 0;
var dragcount_short = 0.2;
var dragcount_long  = 0.7;
var nodraggingmove = false;
var dragcount;

var handleMouseUp = function(){
  var dir = sub(mousePos, mouseDownPos);
  var absdir = [Math.abs (dir[0]), Math.abs (dir[1])];
  var sgndir = [Math.sign(dir[0]), Math.sign(dir[1])];
  var eraseindex = absdir[0]>absdir[1]?1:0;
  sgndir[eraseindex] = 0;
  if(absdir.max()>10 && nodraggingmove){
    dp[0]=sgndir.clone();
    nodraggingmove = false;
  }
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
    if(k==key2dir[i][0]) dp[0]=key2dir[i][1].clone();
  }
}
//proc NPC
var dplist=[[-1,0],[+1,0],[0,-1],[0,+1]];
var dpperm=[[0,1,2,3],[0,1,3,2],[0,2,1,3],[0,2,3,1],[0,3,1,2],[0,3,2,1],
            [1,0,2,3],[1,0,3,2],[1,2,0,3],[1,2,3,0],[1,3,0,2],[1,3,2,0],
            [2,0,1,3],[2,0,3,1],[2,1,0,3],[2,1,3,0],[2,3,0,1],[2,3,1,0],
            [3,0,1,2],[3,0,2,1],[3,1,0,2],[3,1,2,0],[3,2,0,1],[3,2,1,0]];
//NPC calculate own direction
var procNpc = function(){
  //select permutation by random
  var _dpperm=dpperm[Math.floor(Math.random()*24)];
  //find direction
  for(var p=0;p<4;p++){
    _dp=dplist[_dpperm[p]];
    pp1=add(pp[1],_dp);
    if(pp1[0]<0 || pp1[1]<0 || pp1[0]>=ww[0] || pp1[1]>=ww[1])continue;
    if(map[pp1[0]][pp1[1]]==-1)break;
  }
  dp=_dp.clone();
};

