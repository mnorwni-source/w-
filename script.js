
const wandererWords = [

    "这世上没有纯粹的自由。风也会有吹到头的时候。",

    "寒暄就免了吧，没话找话的样子也太可笑了。",

    "我说话刻薄吗？只是实话实说罢了，接受不了的人才该自己反思原因。",

    "想用我的斗笠遮雨？亏你提得出这种要求。",

    "啧…烦心。",

    "「快醒醒——太阳要晒屁股咯——」…哈，你不会以为我会这么叫你起床吧？",

    "终于，无聊的一天就要结束了。",

    "在我身边睡不着吗？呵呵。",

    "烧掉一个人偶会留下灰烬。至于灰烬中会诞生什么…",

    "执着于注定不属于自己的事物只是在浪费时间，现在的我有更重要的事情要做。",

    "对你我以前的对峙耿耿于怀？哦。所以呢，你要怎么做？慢慢想，我不急。",

    "在想怎么才能把你甩掉，去胡作非为一番。——开玩笑的，你信了？",

    "我的伤口，我的软弱，我的沉默与妥协，都不需要向任何人解释...",

    "不赌蝼蚁",

    "把头低下",

    "就凭你也配直视我！"

];


const nightWords1 = [

    "……还在熬？",

    "真是够麻烦的。明明困得眼睛都快睁不开了，还非要硬撑。你是觉得自己很了不起？",

    "现在，关掉电脑，别跟我讨价还价。我不是来陪你耗到天亮的",

    "……真是个笨蛋。",

    "去睡。要是明天困得起不来，可别哭着说没人管你。"

];


const nightWords2 = [

    "在我身边睡不着吗......算了",

    "你不是不肯睡吗？那就随你。反正你这种固执的家伙，说再多也只会当耳旁风",

    "别误会。我可不是在陪你熬夜",

    "只是……免得某个笨蛋半夜把自己折腾得乱七八糟，还得有人收拾残局",

    "继续你的。我要看看你究竟能撑到什么时候。",

    "……困了就自己睡，别硬撑。",

    "......我可没说不陪你"

];


let nightIndex1 = 0;
let nightIndex2 = 0;
let currentNightPool = 1;
let wasNightTime = false;


function isNightTime() {

    const now = new Date();

    const hour = now.getHours();

    return hour >= 23 || hour < 5;

}


function sayHello() {

    const nightTime = isNightTime();


    if (nightTime && !wasNightTime) {

        nightIndex1 = 0;
        nightIndex2 = 0;
        currentNightPool = 1;

    }


    wasNightTime = nightTime;


    if (nightTime) {

        if (currentNightPool === 1) {

            document.getElementById("dialogue").innerText =
                nightWords1[nightIndex1];

            nightIndex1++;


            if (nightIndex1 >= nightWords1.length) {

                nightIndex1 = 0;
                currentNightPool = 2;

            }

        } else {

            document.getElementById("dialogue").innerText =
                nightWords2[nightIndex2];

            nightIndex2++;


            if (nightIndex2 >= nightWords2.length) {

                nightIndex2 = 0;
                currentNightPool = 1;

            }

        }

    } else {

        const randomIndex =
            Math.floor(Math.random() * wandererWords.length);


        document.getElementById("dialogue").innerText =
            wandererWords[randomIndex];

    }

}


/* ================================ */
/* 时钟 */
/* ================================ */


function updateClock() {

    let now = new Date();

    let time = now.toLocaleTimeString();

    document.getElementById("clock").textContent =
        time;

}


setInterval(updateClock, 1000);

updateClock();


/* ================================ */
/* GPU 信息 */
/* ================================ */


/*
    A界面：

    显示当前 GPU 温度。


    B界面：

    保存最近 60 秒的 GPU 温度，
    并绘制成一根持续向前移动的曲线。
*/


let gpuTemperatureHistory = [];


/* 最多保存 20 个数据 */

const MAX_TEMPERATURE_POINTS = 20;


/* ================================ */
/* A / B 模式 */
/* ================================ */


let currentDisplayMode = "normal";


function switchDisplayMode() {

    const normalStats =
        document.getElementById("normalStats");

    const graphStats =
        document.getElementById("graphStats");

    const dialogue =
        document.getElementById("dialogue");


    if (currentDisplayMode === "normal") {

        currentDisplayMode = "graph";


        normalStats.style.display = "none";

        graphStats.style.display = "block";

        dialogue.style.display = "none";


        drawTemperatureGraph();

    } else {

        currentDisplayMode = "normal";


        normalStats.style.display = "block";

        graphStats.style.display = "none";

        dialogue.style.display = "block";

    }

}


/* ================================ */
/* GPU 温度获取 */
/* ================================ */


async function updateSystemStats() {

    const gpu = await window.systemInfo.getStats();


    if (!gpu) {

        document.getElementById("gpuTemperature").innerText =
            "🎮 GPU: --";

        return;

    }


    const gpuTemp = gpu.temperature;

    let tempText = "--";


    if (gpuTemp !== null) {

        tempText = `${gpuTemp.toFixed(1)}°C`;


        /*
            保存温度历史
        */

        gpuTemperatureHistory.push(gpuTemp);


        /*
            超过一分钟的数据就删除
        */

        if (
            gpuTemperatureHistory.length >
            MAX_TEMPERATURE_POINTS
        ) {

            gpuTemperatureHistory.shift();

        }

    }


    /*
        A界面显示当前温度
    */

    document.getElementById("gpuTemperature").innerText =
        `🎮 GPU: ${tempText}`;


    /*
        B界面正在显示时，
        每次获得新温度就更新曲线
    */

    if (currentDisplayMode === "graph") {

        drawTemperatureGraph();

    }

}


updateSystemStats();

setInterval(updateSystemStats, 3000);


/* ================================ */
/* 绘制 GPU 温度曲线 */
/* ================================ */


function drawTemperatureGraph() {

    const line =
        document.getElementById("temperatureLine");


    if (!line) {

        return;

    }


    if (gpuTemperatureHistory.length === 0) {

        line.setAttribute("points", "");

        return;

    }


    /*
        图表实际绘制区域

        左边：35
        右边：310

        上边：10
        下边：145
    */


    const graphLeft = 35;
    const graphRight = 310;

    const graphTop = 10;
    const graphBottom = 145;


    const graphWidth =
        graphRight - graphLeft;

    const graphHeight =
        graphBottom - graphTop;


    /*
        温度范围：

        50°C
        ↓
        90°C

        这样温度越高，
        Y坐标越靠上。
    */


    const minTemperature = 40;
    const maxTemperature = 100;


    const points = [];


    /*
        数据之间的横向距离

        数据越多，
        整条曲线越向右铺开。
    */


    const pointSpacing =
        graphWidth /
        (MAX_TEMPERATURE_POINTS - 1);


    gpuTemperatureHistory.forEach(
        (temperature, index) => {


            /*
                防止温度超出坐标范围
            */

            const safeTemperature =
                Math.max(
                    minTemperature,
                    Math.min(
                        maxTemperature,
                        temperature
                    )
                );


            /*
                X：

                从左向右推进
            */

            const x =
                graphLeft +
                index * pointSpacing;


            /*
                Y：

                90°C → 上面

                50°C → 下面
            */

            const temperatureRatio =
                (
                    safeTemperature -
                    minTemperature
                ) /
                (
                    maxTemperature -
                    minTemperature
                );


            const y =
                graphBottom -
                temperatureRatio *
                graphHeight;


            points.push(
                `${x},${y}`
            );

        }
    );


    line.setAttribute(
        "points",
        points.join(" ")
    );

}


/* ================================ */
/* 右键菜单 */
/* ================================ */


const contextMenu =
    document.getElementById("contextMenu");


const switchMode =
    document.getElementById("switchMode");


/*
    右键桌宠
*/


document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();


        contextMenu.style.display =
            "block";


        /*
            防止菜单跑出窗口
        */


        const menuWidth =
            contextMenu.offsetWidth;

        const menuHeight =
            contextMenu.offsetHeight;


        let x = event.clientX;
        let y = event.clientY;


        if (
            x + menuWidth >
            window.innerWidth
        ) {

            x =
                window.innerWidth -
                menuWidth -
                5;

        }


        if (
            y + menuHeight >
            window.innerHeight
        ) {

            y =
                window.innerHeight -
                menuHeight -
                5;

        }


        contextMenu.style.left =
            `${x}px`;

        contextMenu.style.top =
            `${y}px`;

    }
);


/*
    点击“切换显示模式”
*/


switchMode.addEventListener(
    "click",
    function() {

        switchDisplayMode();

        contextMenu.style.display =
            "none";

    }
);


/*
    点击其他地方，
    关闭右键菜单
*/


document.addEventListener(
    "click",
    function(event) {

        if (
            !contextMenu.contains(event.target)
        ) {

            contextMenu.style.display =
                "none";

        }

    }
);


/*
    ESC 关闭菜单
*/


document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            contextMenu.style.display =
                "none";

        }

    }
);


/* ================================ */
/* B模式：小流浪者序列帧动画 */
/* ================================ */


const miniWanderer =
    document.getElementById("miniWanderer");


/*
    序列帧范围

    0129.png
    ↓
    0160.png
*/
const PET_FRAME_START = 129;
const PET_FRAME_END = 160;


/*
    动画播放速度

    12 FPS
*/
const PET_FPS = 12;

const PET_FRAME_INTERVAL =
    1000 / PET_FPS;


/*
    保存已经加载好的序列帧
*/
const petFrames = [];


/*
    当前播放到第几帧
*/
let currentPetFrame = 0;


/*
    动画是否已经准备完成
*/
let petAnimationReady = false;


/*
    预加载所有序列帧
*/
async function preloadPetFrames() {

    for (
        let i = PET_FRAME_START;
        i <= PET_FRAME_END;
        i++
    ) {

        const frameNumber =
            String(i).padStart(4, "0");


        const image =
            new Image();


        image.src =
            `images/pet/${frameNumber}.png`;


        /*
            等待图片真正完成解码
        */
        await image.decode();


        petFrames.push(image);

    }


    petAnimationReady = true;


    /*
        开始播放
    */
    playPetAnimation();

}


/*
    播放序列帧
*/
function playPetAnimation() {

    if (
        !petAnimationReady ||
        !miniWanderer
    ) {

        return;

    }


    miniWanderer.src =
        petFrames[currentPetFrame].src;


    currentPetFrame++;


    /*
        播放到 0160 后
        回到 0129
    */
    if (
        currentPetFrame >=
        petFrames.length
    ) {

        currentPetFrame = 0;

    }


    setTimeout(
        playPetAnimation,
        PET_FRAME_INTERVAL
    );

}


/*
    启动动画
*/
preloadPetFrames();
