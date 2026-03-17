let shared; // 所有设备共享的数据对象
let bullets = []; // 本地显示的子弹
let lifeWords = ["LIFE", "FAMILY", "FUTURE", "HEALTH", "FRIENDS", "CAREER", "MORTGAGE"];
let myTargets = [];

function preload() {
    // 连接到 p5.party 服务器
    // 参数：服务器地址, 应用名称, 房间名称
    partyConnect("wss://deepstream-server-1.herokuapp.com", "erosion_game_2024", "main_room");
    
    // 加载共享数据，'bullets' 是我们要同步的数组
    shared = partyLoadShared("data", { bulletList: [] });
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // 初始化一些“生活词汇”目标
    for (let i = 0; i < 15; i++) {
        myTargets.push({
            text: random(lifeWords),
            x: random(width * 0.4, width * 0.9),
            y: random(height),
            hp: 100
        });
    }
    textAlign(CENTER, CENTER);
}

function draw() {
    background(0, 50); // 留下一丝残像

    // --- 1. 处理发射逻辑 (手机端交互) ---
    // 如果在手机上点击，就往共享数组里推入一个新子弹
    if (mouseIsPressed && frameCount % 10 === 0) {
        let newBullet = {
            text: "STRESS", // 这里可以改成让用户输入
            x: 0,
            y: mouseY,
            speed: random(5, 10),
            id: Math.random() // 给子弹一个唯一 ID
        };
        shared.bulletList.push(newBullet);
    }

    // --- 2. 渲染和移动子弹 ---
    // 我们从共享数组中读取数据并绘制
    for (let i = shared.bulletList.length - 1; i >= 0; i--) {
        let b = shared.bulletList[i];
        
        // 移动子弹
        b.x += b.speed;
        
        // 绘制子弹
        fill(255, 0, 0);
        textSize(20);
        text(b.text, b.x, b.y);

        // 检测碰撞 (针对本地的目标)
        for (let t of myTargets) {
            if (dist(b.x, b.y, t.x, t.y) < 50) {
                t.hp -= 2; // 撞击减血
            }
        }

        // 如果子弹飞出屏幕，从共享数组中删除（为了性能）
        if (b.x > width) {
            shared.bulletList.splice(i, 1);
        }
    }

    // --- 3. 绘制目标词汇 ---
    for (let i = myTargets.length - 1; i >= 0; i--) {
        let t = myTargets[i];
        if (t.hp > 0) {
            fill(255, t.hp * 2.5);
            textSize(25 + (100 - t.hp) / 2);
            text(t.text, t.x, t.y);
        } else {
            // 如果消失了，随机重生一个，模拟循环
            t.hp = 100;
            t.x = random(width * 0.4, width * 0.9);
            t.y = random(height);
        }
    }

    // UI 提示
    fill(255);
    textSize(14);
    text("MOBILE: Tap to shoot stressors  |  PC: Watch life erode", width/2, 30);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
