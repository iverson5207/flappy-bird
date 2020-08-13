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
  // 初始化函数
  init: function(){
    this.initData();
    this.animate();
    this.handle();
  },
  initData: function(){
    this.el = document.getElementById('game');
    this.oBird = this.el.getElementsByClassName('bird')[0];
    this.oStart = this.el.getElementsByClassName('start')[0];
    this.oScore = this.el.getElementsByClassName('score')[0];
    this.oMask = this.el.getElementsByClassName('mask')[0];
    this.oEnd = this.el.getElementsByClassName('end')[0];
  },
  animate: function(){
    // 为了避免开辟过多的定时器，我们在animate中统一定义定时器。
    var count = 0;
    this.timer = setInterval(()=>{
      this.skyMove();
      // 点击开始了执行birdDrop
      if(this.startFlag){
        this.birdDrop();
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
  judgePipe: function(){},

  // 所有关于事件的函数
  handle: function(){
    this.handleStart();
  },
  handleStart: function(){
    var self = this;
    this.oStart.onclick = function(){
      // console.log('XXXX');
      self.oStart.style.display = 'none';
      self.oScore.style.display = 'block';  // 分数显示
      self.skyStep = 5;  //天空移动加快
      self.oBird.style.left = '80px'; //小鸟位置变化
      self.startFlag = true;  //更改是否开始的状态 
    }
  },
  failGame: function(){
    clearInterval(this.timer);
    this.oMask.style.display = 'block';
    this.oEnd.style.display = 'block';
    this.oBird.style.display = 'none';
    this.oScore.style.display = 'none';
  }
}
