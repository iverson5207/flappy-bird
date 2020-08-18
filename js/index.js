// 利用对象收编变量
// initData存储拿到的元素
// 动画 animate 去管理所有动画函数
var bird = {
  skyPosition: 0,
  skyStep:2, //天空移动的速度
  birdTop: 220,
  birdStepY: 0, //小鸟下落的步长
  startColor: 'blue',
  startFlag: false,  // 用来标识是否开始
  minTop: 0,  //边界最小值
  maxTop: 570, //边界最大值（小鸟有30的高度）
  pipeLength: 7, //柱子的个数
  pipeArr: [], //存放的是一对一对的柱子
  pipeLastIndex: 6,
  score: 0,

  // 初始化函数
  init: function(){
    this.initData();
    this.animate();
    this.handle();
    if(sessionStorage.getItem('play')){
      this.start();
    }
  },
  initData: function(){
    this.el = document.getElementById('game');
    this.oBird = this.el.getElementsByClassName('bird')[0];
    this.oStart = this.el.getElementsByClassName('start')[0];
    this.oScore = this.el.getElementsByClassName('score')[0];
    this.oMask = this.el.getElementsByClassName('mask')[0];
    this.oEnd = this.el.getElementsByClassName('end')[0];
    this.oFinalScore = this.oEnd.getElementsByClassName('final-score')[0];
    this.scoreArr = this.getScore();
    this.oRankList = this.el.getElementsByClassName('rank-list')[0];
    this.oRestart = this.el.getElementsByClassName('restart')[0];
  },
  getScore: function(){
    var scoreArr = getLocal('score'); //键值不存在值为null
    return scoreArr ? scoreArr : [];
  },
  animate: function(){
    // 为了避免开辟过多的定时器，我们在animate中统一定义定时器。
    var count = 0;
    this.timer = setInterval(()=>{
      this.skyMove();
      // 点击开始了执行birdDrop
      if(this.startFlag){
        this.birdDrop();
        this.pipeMove();
      }
      count++;
      if(!this.startFlag){
        if(count % 10 === 0){
          this.birdJump();
          this.startBound();
          this.birdFly(count);
        }
      }
    },30)
    // 此时的this指向的是bird
    this.birdFly();
    this.startBound();
  },
  // 天空移动
  skyMove: function(){
    // 使用箭头函数，避免this指向错误
    // setInterval(()=>{
      this.skyPosition -= this.skyStep;
      this.el.style.backgroundPositionX = this.skyPosition + 'px'
    // },30)
  },

  // 小鸟上下跳
  birdJump: function(){
    // setInterval(()=>{
      this.birdTop = this.birdTop === 220 ? 260 : 220;
      this.oBird.style.top = this.birdTop + 'px'
    // },300)
  },
  // 小鸟飞
  birdFly: function(count){
    this.oBird.style.backgroundPositionX = count % 3 * -30 + 'px';
  },

  // 小鸟下落
  birdDrop: function(){
    this.birdTop += ++this.birdStepY;
    this.oBird.style.top = this.birdTop + 'px';
    this.judgeKnock()  //碰撞检测
    this.addScore()  //增加分数
  },

  // 柱子移动
  pipeMove: function(){
    for(let i = 0; i < this.pipeLength; i++){
      var oUpPipe = this.pipeArr[i].up;
      var oDownPipe = this.pipeArr[i].down;
      var x = oUpPipe.offsetLeft - this.skyStep; 
      if(x < -52){
        var lastPipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
        oUpPipe.style.left = lastPipeLeft + 300 +'px';
        oDownPipe.style.left = lastPipeLeft + 300 + 'px';
        this.pipeLastIndex ++;
        this.pipeLastIndex = this.pipeLastIndex % this.pipeLength;
        oUpPipe.style.height = upHieght + 'px';
        oDownPipe.style.height = downHieght + 'px';
        continue;
      }
      oUpPipe.style.left = x + 'px';
      oDownPipe.style.left = x + 'px';
    }
  },
  getPipeHeight: function(){
    var upHieght = 50+ Math.floor(Math.random() * 175);
    var downHeight = 600 - 150 - upHieght;
    return {
      up: upHieght,
      down: downHeight
    }
  },

  // 文字放大缩小
  startBound: function(){
    // var color;
    // if(this.startColor === 'blue'){
    //   color = 'white';
    // }else{
    //   color = 'blue'
    // }
    // // 移除当前的类名
    // classList.remove('start-' + this.startColor);
    // // 添加新的类名
    // classList.add('start-' + color);
    // // 重置当前的类名
    // this.startColor = color;
    var prevColor = this.startColor;
    this.startColor = prevColor === 'blue' ? 'white' : 'blue';
    this.oStart.classList.remove('start-' + prevColor);
    this.oStart.classList.add('start-' + this.startColor);
  },

  // 碰撞检测
  judgeKnock: function(){
    this.judgeBoundary();
    this.judgePipe();
  },
  // 进行边界碰撞检测
  judgeBoundary: function(){
    if(this.birdTop < this.minTop || this.birdTop > this.maxTop){
      // 游戏结束
      this.failGame();
    }
  },
  // 进行柱子碰撞检测
  judgePipe: function(){
    // 相遇的是pipeX = 95  离开时pipeX=13
    var index = this.score % this.pipeLength;
    var pipeX = this.pipeArr[index].up.offsetLeft;
    var pipeY = this.pipeArr[index].y;
    var birdY = this.birdTop;
    if((pipeX <= 95 && pipeX >= 13)&& (birdY <pipeY[0] || birdY >= pipeY[1])){
      this.failGame();
    }
  },

  // 加分
  addScore: function(){
    var index = this.score % this.pipeLength;
    var pipeX = this.pipeArr[index].up.offsetLeft;
    if(pipeX < 13){
      this.score ++;
      this.oScore.innerText = this.score;
    }
  },
  // 所有关于事件的函数
  handle: function(){
    this.handleStart();
    this.handleClick();
    this.handleRestart();
  },
  handleStart: function(){
    this.oStart.onclick = this.start.bind(this);
  },
  start: function(){
    this.oStart.style.display = 'none';
    this.oScore.style.display = 'block';  // 分数显示
    this.skyStep = 5;  //天空移动加快
    this.oBird.style.left = '80px'; //小鸟位置变化
    this.oBird.style.transition = 'none';  //点击开始后让小鸟的过渡动画取消
    this.startFlag = true;  //更改是否开始的状态 

    // 创建柱子
    for(let i = 0; i< this.pipeLength; i++){
      // 创建柱子
      this.createPipe(300 * (i + 1));
    }

  },
  handleClick: function(){
    var self = this;
    this.el.onclick = function(e){
      if(!e.target.classList.contains('start')){
        // e.target 触发事件的那个元素
        self.birdStepY = -10;
      }
      
    }
  },
  handleRestart: function(){
    this.oRestart.onclick = function(){
      sessionStorage.setItem('play', true);
      window.location.reload();//页面重新开始

    }
  },
  createPipe: function(x){
    // var pipeHeight
    // 600-150 = 450/2 =225
    // 0-225小数
    // 柱子最短50
    // 50-275
    var upHieght = 50+ Math.floor(Math.random() * 175);
    var downHeight = 600 - 150 - upHieght;
    // var oDiv = document.createElement('div');
    // oDiv.classList.add('pipe');
    // oDiv.classList.add('pipe-up');
    // oDiv.style.height = upHieght + 'px';
    // this.el.appendChild(oDiv);

    // 创建上柱子
    var oUpPipe = createEle('div', ['pipe', 'pipe-up'],{
      height: upHieght + 'px',
      // 通过传入的x来设置left值
      left: x + 'px'
    })
    // 创建下柱子
    var oDownPipe = createEle('div', ['pipe','pipe-bottom'], {
      height: downHeight + 'px',
      left: x + 'px'
    })
    this.el.appendChild(oUpPipe);
    this.el.appendChild(oDownPipe);
    this.pipeArr.push({
     up: oUpPipe,
     down: oDownPipe,
     y : [upHieght, upHieght + 150],
    })
  },
  setScore: function(){
    this.scoreArr.push({
      score: this.score,
      // time
      time: this.getDate(),
    })
    this.scoreArr.sort((a,b)=>{
      return b.score - a.score;
    })
    setLocal('score',this.scoreArr);
  },
  getDate: function(){
    var d = new Date();
    var year = formatNum(d.getFullYear());
    var month = formatNum(d.getMonth() + 1);
    var day = formatNum(d.getDate());
    var hour = formatNum(d.getHours());
    var minute = formatNum(d.getMinutes());
    var second = formatNum(d.getSeconds());
    return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
  },
  failGame: function(){
    clearInterval(this.timer);
    this.setScore();
    this.oMask.style.display = 'block';
    this.oEnd.style.display = 'block';
    this.oBird.style.display = 'none';
    this.oScore.style.display = 'none';
    this.oFinalScore.innerText = this.score;
    this.renderRankList();
  },
  renderRankList: function(){
    var template = '';
    for(var i = 0; i < 8; i++){
      var degreeClass = '';
      switch (i) {
        case 0: 
          degreeClass = 'first';
          break;
        case 1:
          degreeClass = 'second';
          break;
        case 2:
          degreeClass = 'third';
          break;
      }
      template += `
        <li class="rank-item">
            <span class="rank-degree ${degreeClass}">${i+1}</span>
            <span class="rank-score">${this.scoreArr[i].score}</span>
            <span class="time">${this.scoreArr[i].time}</span>
        </li>
      `
    }
    this.oRankList.innerHTML = template;
  }
}