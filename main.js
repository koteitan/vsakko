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
var gamestate_init = 0;
var gamestate_proc = 1;
var gamestate_end  = 2;
var gamestate = gamestate_init;
var gamecount     = 0;
var gamecount_max = 0.3; // operation interval
var cantmove;
var score;
var maxrp;
//world
var size=9;
var ww=[size,size,2]; //world width
var map;
//players
var human   = 0;
var com     = 1;
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
      map[x][y]=[-1,-1,-1]; //akko, doggo, player index
    }
  }

  //players
  pp=[
    [0      ,         Math.floor((ww[1]-1)/2)],
    [ww[0]-1, ww[1]-1-Math.floor((ww[1]-1)/2)]
  ];
  dp=[[+1,0],[-1,0]];
  ccolor=["Black","RebeccaPurple"];    //color of copied akko
  pcolor=["Red"  ,"Magenta"]; //color of akko
  dcolor=["Green","Purple"];  //color of doggo
  rcolor=["Blue" ,"Cyan"];    //color of replie
  movstack    =new Array(players);
  movstacki   =new Array(players);
  isope       =new Array(players);
  isdrawreplie=new Array(players);
  rp          =new Array(players);
  cantmove    =new Array(players);
  score       =new Array(players);
  maxrp       =new Array(players);
  for(var p=0;p<players;p++){
    map[pp[p][0]][pp[p][1]][0]=3;
    map[pp[p][0]][pp[p][1]][1]=3;
    map[pp[p][0]][pp[p][1]][2]=p;
    movstack [p]=new Array(ww[0]*ww[1]*2);
    movstacki[p]=0;
    movstack[p][movstacki]=pp[p]; //save now
    isope       [p]= true;
    isdrawreplie[p]=false;
    cantmove    [p]=false;
    score       [p]= 0;
    rp          [p]= 3;
    maxrp       [p]= 3;
  }
  gamecount = gamecount_max;
  gamestate = gamestate_init;
  isdraw   = true;
}
var gameover=function(){
  gamestate = gamestate_end;
  isdraw = true;
}
//proc Game
var procGame = function(){
  if(gamestate==gamestate_proc){
    gamecount-=1/frameRate;
    if(gamecount<=0){
      gamecount = gamecount_max;
      procNpc();
      for(var p=0;p<players;p++){
        moveGame(p);
      }
    }
  }
}
//move
var moveGame=function(p){
  if(!isope[p]) return;
  
  var pp1=add(pp[p],dp[p]);
  var _dpperm=dpperm[Math.floor(Math.random()*24)]; //try pattern
  //check wall
  var t;
  if(!(pp1[0]>=0 && pp1[1]>=0 && pp1[0]<ww[0] && pp1[1]<ww[1] && map[pp1[0]][pp1[1]][0]==-1)){
    //can't move in the direction
    for(t=0;t<4;t++){
      //find next direction
      _dp=dplist[_dpperm[t]];
      pp1=add(pp[p],_dp);
      if(pp1[0]>=0 && pp1[1]>=0 && pp1[0]<ww[0] && pp1[1]<ww[1] && map[pp1[0]][pp1[1]][0]==-1){ //can move in the direction
        break;
      }
    }
    if(t==4){//4-men soka
      cantmove[p]=true;
      if(cantmove[human]&&cantmove[com]){//both
        gameover(p);//end game
      }
      return;
    }
  }

  //move
  score[p] += 10;

  map[pp1[0]][pp1[1]][0]=map[pp[p][0]][pp[p][1]][0]; //new.akko
  map[pp1[0]][pp1[1]][1]=map[pp[p][0]][pp[p][1]][1]; //new.doggo
  map[pp1[0]][pp1[1]][2]=p;                          //new.playerindex
  map[pp[p][0]][pp[p][1]][1]--; //old.doggo <- reduced
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
var moveEater=function(p){
  if(map[pp[p][0]][pp[p][1]][1]==0){ // middo is still zero
    if(map[pp[p][0]][pp[p][1]][0]==0){ // parent is zero too
      //eat zeros
      map[pp[p][0]][pp[p][1]][0]=-1;
      map[pp[p][0]][pp[p][1]][1]=-1;
      map[pp[p][0]][pp[p][1]][2]=-1;
      rp[p]++;//recover
      maxrp[p]=[rp[p], maxrp[p]].max();
      score[p]+=maxrp[p]*100;
      //undo motion
      movstacki[p]--;
      movstacki[p]+=movstack[p].length;
      movstacki[p]%=movstack[p].length;
      pp[p] = movstack[p][movstacki[p]].clone();
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
  isdraw = true;
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
  ctx.fillStyle  ="black";
  var sx=Math.floor(sw[0]/(ww[0]+2)); // size of cube
  var sy=Math.floor(sw[1]/(ww[1]+2)); // size of cube
  for(var xi=0;xi<ww[0];xi++){
    for(var yi=0;yi<ww[1];yi++){
      var x=Math.floor(sx*(xi+1));
      var y=Math.floor(sy*(yi+1));
      ctx.beginPath();
      ctx.strokeRect(x,y,sx,sy);
      ctx.stroke();
    }
  }

  //draw score
  for(var p=0;p<players;p++){
    var fx = ctx.measureText(score[p]).width;
    var fy = sw[1]/(ww[1]+2)/3;
    var x = sx+p*(sx*ww[0]-fx);
    var y = sy-sy*0.1;
    ctx.strokeStyle=pcolor[p];
    ctx.fillStyle  =pcolor[p];
    ctx.font = String(Math.floor(fy))+'px Segoe UI';
    ctx.fillText(score[p],x,y);
    if(gamestate==gamestate_end){
      ctx.fillText(score[p]>score[p^1]?"I WIN!!":"I lose..",x,y-sy/3);
    }
  }

  var rpr = 0.7; //size ratio of replie
  //draw text
  for(var xi=0;xi<ww[0];xi++){
    for(var yi=0;yi<ww[1];yi++){
      var p;
      for(p=0;p<players;p++){
        if(xi==pp[p][0] && yi==pp[p][1])break;
      }
      if(map[xi][yi][0]!=-1||isdrawreplie[p]){
        var strmap0=String(map[xi][yi][0]);
        var strmap1=String(map[xi][yi][1]);
        var fy=Math.floor(sw[1]/(ww[1]+2)/2);
        ctx.font = String(fy)+'px Segoe UI';
        var fx=[    ctx.measureText(strmap0).width,
                    ctx.measureText(strmap1).width*rpr,
                p<2?ctx.measureText(String(rp[p])).width*rpr*rpr:0];
        var rx=fx.sum()>sx?sx/fx.sum():1;
        var ry=fy      >sy?sy/fy      :1;
        var r=[rx,ry].min();
        fx =mulkv(r,fx);
        fy =      r*fy;
        //parent
        if(p<2){
          ctx.fillStyle  = pcolor[p];
          ctx.strokeStyle= pcolor[p];
        }else{
          _p=map[xi][yi][2];
          ctx.fillStyle  = ccolor[_p];
          ctx.strokeStyle= ccolor[_p];
        }
        ctx.font = String(fy)+'px Segoe UI';
        var x=Math.floor(sx*(xi+1.5)-fx.sum()/2);
        var y=Math.floor(sy*(yi+1.5)+fy      /2);
        if(map[xi][yi][0]!=-1) ctx.fillText(strmap0,x,y);
        //middo
        ctx.fillStyle  = dcolor[p];
        ctx.strokeStyle= dcolor[p];
        ctx.font = String(fy*rpr)+'px Segoe UI';
        var x=Math.floor(sx*(xi+1.5)-fx.sum()/2+fx[0]);
        var y=Math.floor(sy*(yi+1.5)+fy/2-fy*0.5);
        if(map[xi][yi][0]!=-1) ctx.fillText(strmap1,x,y);
        if(p<2){
          //replie
          ctx.fillStyle  =rcolor[p];
          ctx.strokeStyle=rcolor[p];
          var x=Math.floor(sx*(xi+1.5)-fx.sum()/2+fx[0]+fx[1]);
          var y=Math.floor(sy*(yi+1.5)+fy/2-fy);
          ctx.font = String(fy*rpr*rpr)+'px Segoe UI';
          ctx.fillText(String(rp[p]),x,y);
        }
      }
    }
  }
  
}
//event---------------------
var handleMouseDown = function(){
  switch(gamestate){
    case gamestate_init:
      gamestate=gamestate_proc;
      return;
    case gamestate_end:
      setTimeout(initGame,10);
      gamestate=gamestate_proc;
      return;
    default:
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
    dp[human]=sgndir.clone();
    nodraggingmove = false;
  }
}
var handleMouseWheel = function(){
}
var handleKeyDown = function(e){
  switch(gamestate){
    case gamestate_init:
      gamestate=gamestate_proc;
      return;
    case gamestate_end:
      setTimeout(initGame,10);
      gamestate=gamestate_proc;
      return;
    default:
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
    if(k==key2dir[i][0]) dp[human]=key2dir[i][1].clone();
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
    pp1=add(pp[com],_dp);
    if(pp1[0]<0 || pp1[1]<0 || pp1[0]>=ww[0] || pp1[1]>=ww[1])continue;
    if(map[pp1[0]][pp1[1]]==-1)break;
  }
  dp[com]=_dp.clone();
};

