import {createEle, setLocal, getLocal,formatNum} from './util1.js'
var bird = {
  skyPosition: 0, // 天空的初始位置
  skyStep: 2, //天空移动的速度
  birdTop: 220, // 小鸟的高度
  boundColor: 'blue',
  startFlag: false,  // 用来标识是否开始
  birdStepY: 0,  //小鸟下落的步长 
  minTop: 0,  // 边界最小值
  maxTop: 570, //边界最大值
  pipeLength: 7,
  pipeArr: [],  // 通过将柱子的数据存放起来，在柱子移动的时候可以直接取值操作
  score: 0,
  pipeLastIndex: 6,  //用来实现柱子循环
  /**
   * 初始化函数
   */
  init: function(){ 
    this.initData();
    this.animate();
    this.handle();
    if(sessionStorage.getItem('play')){
      this.start();
    }
  },
  /**
   * 获取页面元素
   */
  initData: function(){
    this.el = document.getElementById('game');
    this.oBird = this.el.getElementsByClassName('bird')[0];
    this.oStart = this.el.getElementsByClassName('start')[0];
    this.oScore = this.el.getElementsByClassName('score')[0];
    this.oMask = this.el.getElementsByClassName('mask')[0];
    this.oEnd = this.el.getElementsByClassName('end')[0];
    this.oFinalScore = this.oEnd.getElementsByClassName('final-score')[0];
    this.oRankList = this.el.getElementsByClassName('rank-list')[0];
    this.oRestart = this.el.getElementsByClassName('restart')[0];
    this.scoreArr = this.getScore();
    // console.log(this.scoreArr);
  },
  /**
   * 动画执行函数
   * 由于如果在每个函数中都添加定时器的话，会导致开启过多的定时器
   * 因此在执行函数中统一开启定时器
   */
  animate: function(){
    let count = 0;
    this.timer = setInterval(()=>{
      this.skyMove();
      count ++;
      // 如果游戏开始
      if(this.startFlag){
        this.birdDrop();
        this.pipeMove();
      }
      if(!this.startFlag){
        if(count % 10 === 0){
          this.birdJump();
          this.startBound();
          this.birdFly(count);
        }
      }
    },30)
  },
  /** 1
   * 小鸟上下移动
   */
  birdJump: function(){
    // setInterval(()=>{
      this.birdTop = this.birdTop === 220 ? 260 : 220;
      this.oBird.style.top = this.birdTop + 'px';
    // },300);
  },
  birdDrop: function(){
    this.birdStepY++;
    this.birdTop += this.birdStepY;
    this.oBird.style.top = this.birdTop + 'px';
    // 碰撞检测
    this.judgeKnock();
    this.addScore();
  },
  /**
   * 小鸟飞
   */
  birdFly: function(count){
    this.oBird.style.backgroundPositionX = count % 3 *30 + 'px';
  },
  /** 2
   * 天空移动
   */
  skyMove: function(){
    // setInterval(()=>{
      this.skyPosition -= this.skyStep;
      this.el.style.backgroundPositionX = this.skyPosition + 'px';
    // },30)
  },
  /**
   * 柱子移动，通过在创建柱子的时候保存柱子的信息，然后改变柱子的left值实现柱子的移动
   */
  pipeMove: function(){
    for(let i = 0; i < this.pipeLength; i++){
      let oUpPipe = this.pipeArr[i].up;
      let oDownPipe = this.pipeArr[i].down;
      let x = oUpPipe.offsetLeft - this.skyStep;
      // 因为柱子的width是52
      if(x < -52){
        let lastPipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
        oUpPipe.style.left = lastPipeLeft + 300 + 'px';
        oDownPipe.style.left = lastPipeLeft + 300 + 'px';
        // 由于是一个循环，每次拿到最后一个柱子的时候，pipeLastIndex应该改变
        this.pipeLastIndex ++;
        this.pipeLastIndex = this.pipeLastIndex % this.pipeLength;
        // 为了使每一轮循环的额柱子的高度是不同的，我们在这里调用getPipeHeight重新设置柱子的高度
        var newPipeHeight = this.getPipeHeight();
        // console.log(result);
        oUpPipe.style.height = newPipeHeight.up + 'px';
        oDownPipe.style.height = newPipeHeight.down + 'px';
        continue;
      }
      oUpPipe.style.left = x + 'px';
      oDownPipe.style.left = x + 'px';
    }
  },
  /**
   * 获取柱子的高度
   */
  getPipeHeight: function(){
    var upHieght = 50+ Math.floor(Math.random() * 175);
    var downHeight = 600 - 150 - upHieght;
    return {
      up: upHieght,
      down: downHeight
    }
  },
  /** 3
   * 文字放大缩小
   */
  startBound: function(){
    // setInterval(()=>{
      //保存开始的颜色
      let prevColor = this.boundColor;
      this.boundColor = prevColor === 'blue' ? 'white' : 'blue';
      this.oStart.classList.remove('start-' + prevColor);
      this.oStart.classList.add('start-' + this.boundColor);
    // },300)
  },
  /**
   * 碰撞检测
   */
  judgeKnock: function(){
    this.judgeBoundary();  //边界碰撞检测
    this.judgePipe();  //柱子碰撞检测
  },
  /**
   * 边界碰撞检测
   */
  judgeBoundary: function(){
    if(this.birdTop > this.maxTop || this.birdTop < this.minTop){
      this.failGame();  //游戏结束
    }
  },
  /**
   * 柱子的碰撞检测
   */
  judgePipe: function(){
    let index = this.score % this.pipeLength;
    let pipeX = this.pipeArr[index].up.offsetLeft;
    let pipeY = this.pipeArr[index].y;
    let birdY = this.birdTop;
    if((pipeX <= 95 && pipeX >= 13) && (birdY < pipeY[0] || birdY >= pipeY[1])){
      this.failGame();
    }
  },
  /**
   * 加分，通过小鸟和柱子的距离是否小于13来判断小鸟是否通过这个柱子
   */
  addScore: function(){
    let index = this.score % this.pipeLength;
    let pipeX = this.pipeArr[index].up.offsetLeft;
    if(pipeX < 13){
      this.score++;
      this.oScore.innerText = this.score;
    }
  },
  /**
   * 所有的点击函数的统一执行函数
   */
  handle: function(){
    this.handleStart();
    this.handleClick();
    this.handleRestart();
  },
  /** 4
   * 点击开始
   */
  handleStart: function(){
    this.oStart.onclick = ()=>{
      this.start();
    }
  },
  /**
   * 开始
   */
  start: function(){
      this.oStart.style.display = 'none';
      this.oScore.style.display = 'block';
      // 天空移动速度加快
      this.skyStep = 5;
      // 小鸟的初始位置变化
      this.oBird.style.left = '80px';
      // 取消小鸟的过渡动画
      this.oBird.style.transition = 'none';
      this.startFlag = true;
      // 创建柱子
      for(let i = 0; i < this.pipeLength; i++){
        this.createPipe(300 * (i+1));
      }
  },
  /**
   * 点击小鸟运动
   */
  handleClick: function(){
    this.el.onclick = (e)=>{
      if(!e.target.classList.contains('start')){
        this.birdStepY = -10;
      }
    }
  },
  /**
   * 点击重新开始
   */
  handleRestart: function(){
    this.oRestart.onclick = ()=>{
      // 通过play实现点击重新开始
      sessionStorage.setItem('play', true);
      window.location.reload(); //重新加载页面
    }
  },
  /**
   * 创建柱子
   * @param {*设置柱子的left值} x 
   */
  createPipe: function(x){
    var upHeight = 50 + Math.floor(Math.random() * 175);
    var downHeight = 600 - 150 -upHeight;
    // 创建上柱子
    var oUpPipe = createEle('div', ['pipe', 'pipe-up'],{
      height: upHeight + 'px',
      left: x + 'px'
    });
    // 创建下柱子
    var oDownPipe = createEle('div', ['pipe', 'pipe-bottom'],{
      height: downHeight + 'px',
      left: x + 'px'
    });
    // 将柱子插入页面
    this.el.appendChild(oUpPipe);
    this.el.appendChild(oDownPipe);
    // 保存柱子的信息
    this.pipeArr.push({
      up: oUpPipe,
      down: oDownPipe,
      y: [upHeight, upHeight+150]
    })
  },
  /**
   * 游戏结束
   */
  failGame: function(){
    // 清除动画
    clearInterval(this.timer);
    this.setScore();
    this.oMask.style.display = 'block';
    this.oEnd.style.display = 'block';
    this.oBird.style.display = 'none';
    this.oScore.style.display = 'none';
    this.oFinalScore.innerText = this.score;
    // 成绩展示
    this.renderRankList();
  },
  /**
   * 从本地获取分数
   */
  getScore: function(){
    var scoreArr = getLocal('score');  //键值不存在的时候为null，我们这里要求的是数组
    return scoreArr ? scoreArr : [];
  },
  /**
   * 设置分数
   */
  setScore: function(){
    this.scoreArr.push({
      score: this.score,
      // time
      time: this.getDate(),
    })
    // 排序
    this.scoreArr.sort((a,b)=>b.score - a.score)
    // 设置本地数据
    setLocal('score',this.scoreArr);
  },
  /**
   * 获取时间
   */
  getDate: function(){
    let d = new Date();
    let year = formatNum(d.getFullYear());
    let month = formatNum(d.getMonth()+1);
    let day = formatNum(d.getDate());
    let hour = formatNum(d.getHours());
    let minute = formatNum(d.getMinutes());
    let second = formatNum(d.getSeconds());
    let time = `${year}.${month}.${day} ${hour}:${minute}:${second}`
    return time;
  },
  /**
   * 成绩展示
   */
  renderRankList: function(){
    var template = '';
    for(var i = 0; i < 8; i++){
      console.log(this.scoreArr[i].score);
      console.log(this.scoreArr[i].time);
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
bird.init();
