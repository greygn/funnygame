const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const aliceSprites = new Image();   //картинка спрайта Алисы
aliceSprites.src = "sprites/aliceSprites.png"

const gravity = 1;
let score = 0; //счет убитых врагов
let ballDistance=0; //дистанция полета шара


class Player {   //объект игрока, хранит данные о нём
    constructor(x, y, width, height) {   //нужен для создания игрока с заданными свойствами
        this.position = {
            x: x,
            y: y,
        }

        this.velocity = {   //объект, хранящий ускорение игрока в двух осях
            x: 0,
            y: 3
        }

        this.width = width,
        this.height = height,

        this.isGameOver = false,    //флаг, говорящий о том, что произошёл проигрыш
        this.gameOverFrame = 0,
        this.turnToAttack="right"; //флаг, запоминающий последнее направление движения игрока
        this.hv = 5; //количество сеердечек у игрока

        this.currentState = "stand" //очень много флагов состояния игрока для анимации
        this.lastTurn = "right",
        this.lastState = "stand",
        this.animationTick = 0, //тик анимации (счётчик кадров)
        this.animationStage = 0,    //стадия анимации (картинки анимации)
        this.attackAnim = false,

        this.attackBox = { //поле атаки посохом
            position: this.position,
            width: 175,
            height: 50
        }
        this.ballBox = { //поле атаки шаром
            position: this.position,
            radius: 10,
        }

        this.isAttacking //атака посохом
        this.isBallAttack //атака шаром
        this.protection = false //защита щитом (пузырём)
        
    }

    draw() {    //отрисовка игрока
        
        if (this.animationTick == 10){
            this.animationTick = 0;
            this.animationStage++;
            if (this.animationStage == 6){
                if (this.attackAnim){
                    this.attackAnim = false
                }
                this.animationStage = 0;
            }
        }
        this.animationTick++;

        if (this.currentState != this.lastState){
            if(this.attackAnim){
                this.currentState = "attack";
            }
            else if(!keys.right.pressed && !keys.left.pressed){
                this.lastState = "stand"
                this.currentState = "stand";
                this.animationStage = 0;
                this.animationTick = 0;
            }
        
        }
        
        console.log(this.currentState, keys.right.pressed)
        switch (this.currentState){
            case "stand":
                if (this.turnToAttack == "right"){
                    c.drawImage(aliceSprites, 100 * this.animationStage, 600, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(aliceSprites, 100 * this.animationStage, 750, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
            case "run":
                if (this.turnToAttack == "right"){
                    c.drawImage(aliceSprites, 100 * this.animationStage, 0, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(aliceSprites, 100 * this.animationStage, 150, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
            case "attack":
                if (this.turnToAttack == "right"){
                    c.drawImage(aliceSprites, 100 * this.animationStage, 300, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(aliceSprites, 100 * this.animationStage, 450, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
        }

       //защита щитом
       if (this.protection){
            c.beginPath();
            c.arc(this.position.x +  this.width/2 , this.position.y + this.height/2 + 5, Math.floor(this.height*(2/3)), Math.PI*(1/4), Math.PI*(3/4), true);
            c.fillStyle = "#8aeded8e";
            c.fill();
        }

        //поле атаки посохом
        if (this.isAttacking &&  !this.protection ){
            c.fillStyle = 'red';
            if (this.turnToAttack == "right"){
                c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
            }
            else{
                c.fillRect(this.attackBox.position.x - this.attackBox.width + this.width, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
            }
        }
        //поле атаки шаром
        if (this.isBallAttack && !this.protection){
            if (this.turnToAttack == "right"){
                c.beginPath();
                c.arc(this.ballBox.position.x + ballDistance + this.width + this.ballBox.radius , this.ballBox.position.y+50, this.ballBox.radius, 0, Math.PI*2, false);
                c.fillStyle = "orange";
                c.fill();
            }
            else{
                c.beginPath();
                c.arc(this.ballBox.position.x - ballDistance - this.ballBox.radius , this.ballBox.position.y+50, this.ballBox.radius, 0, Math.PI*2, false);
                c.fillStyle = "orange";
                c.fill();
            }
            ballDistance+=70;
        }
        //здоровье игрока
        c.fillStyle = '#f11b1b';
        c.font = "bold 30px Times New Roman";
        c.fillText("ЗДОРОВЬЕ: ", 800, 55);
        c.fillStyle='#f11b1b';
        c.fillRect(980, 25, 250, 40);

        c.fillStyle='#16ad13';
        c.fillRect(980, 25, 250 * this.hv / 5, 40);
    }

    update() {   //обновление местонвхождения игрока
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        this.draw();

        if(this.hv == 0){
            this.isGameOver = true; //поднятие флага проигрыша, если жизнь у игрока закончилась
        }

        if (this.position.y + this.height + this.velocity.y < canvas.height) {
            this.velocity.y += gravity;
        }
        else {
            this.isGameOver = true; //поднятие флага проигрыша, если игрок упал в яму и выпал за границы экрана
        }

    }
    attack(){ //метод атаки посохом
        this.isAttacking = true;
        setTimeout(()=> {
            this.isAttacking = false;
        }, 100);
    }

    magic(){ //метод атаки шарами
        this.isBallAttack = true;
        setTimeout(()=> {
            this.isBallAttack = false;
        }, 100);
    }

}


class Enemy {   //объект врага, хранит данные о нём
    constructor(x, y, width, height) {   //нужен для создания врага с заданными свойствами
        this.position = {
            x: x,
            y: y,
        }

        this.attackBox = { //поле атаки посохом
            position: this.position,
            width: 175,
            height: 50
        }
        
        this.attackCoolDown = 0;

        this.alert = false; // Флаг встревоженного врага

        this.isRight = true; // Флаг того, куда смотрит враг (право или лево)

        this.positionStartX = x;
        this.positionEndX = x + 100;

        this.velocity = {   //объект, хранящий ускорение врага в двух осях
            x: 0,
            y: 3
        }

        this.width = width,
        this.height = height,
        this.health = 90, //здоровье врага

        this.isAlive = true //флаг жизни врага
    }

    draw() {    //отрисовка врага
        c.fillStyle = 'purple';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        //ЗДОРОВЬЕ ВРАГА (линия)
        c.fillStyle='yellow';
        c.fillRect(this.position.x, this.position.y - 25, this.width, 10);

        c.fillStyle='brown';
        c.fillRect(this.position.x, this.position.y - 25, this.width * this.health / 90, 10);

    }



    update() {   //обновление местонахождения врага
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if(this.alert == false){ //Проверяем, зашёл ли игрок в зону видимости врага
            if(this.position.x <= this.positionEndX && this.isRight){ // Если у нас значение false, то враг находится в состоянии покоя и ходит 
                this.velocity.x = 1;
            }
    
            else if(this.position.x >= this.positionEndX && this.isRight){ 
                this.isRight = false;
    
            }
    
            else if(this.position.x >= this.positionStartX && !this.isRight){
                this.velocity.x = -1;
    
            }
    
            else if(this.position.x <= this.positionStartX && !this.isRight){
                this.isRight = true;
    
            }

            if(Math.abs(this.position.x - player.position.x) <= 200 && Math.abs(this.position.y - player.position.y) < 50){ // Если враг увидел игрока, то он становится встревоженным
                this.alert = true;
            }
        }

        else{  //Если врага встревожили, то он начинает следовать за игроком
            if(this.position.x < player.position.x){ //Если игрок справа, то враг идёт направо
                this.velocity.x = 1.5; //Ускорение перемещения врага
                this.isRight = true;

                if(Math.abs(this.position.x - player.position.x) < 100 && this.attackCoolDown == 0  && this.attackBox.position.y == player.position.y){
                    this.attackCoolDown = 120; //Задержка перед ударом
                    c.fillStyle = 'red';
                    c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
                    if(!player.isGameOver && (this.attackBox.position.x + this.attackBox.width) >= player.position.x && !player.protection){
                        player.hv--;
                        }
                }
            }

            else if(this.position.x > player.position.x){// Если игрок слева, то идёт налево
                this.velocity.x = -1.5; //Ускорение перемещения врага
                this.isRight = false;
                
                if(Math.abs(this.position.x - player.position.x) < 100 && this.attackCoolDown == 0 && this.attackBox.position.y == player.position.y){
                    this.attackCoolDown = 120; //Задержка перед ударом
                    c.fillStyle = 'red';
                    c.fillRect(this.attackBox.position.x - 100, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
                    if(!player.isGameOver && (this.attackBox.position.x - 100 - this.attackBox.width) <= player.position.x  && !player.protection){
                        player.hv--;
                        }
                }
            }

            else if(Math.abs(this.position.y - player.position.y) > 0){ //Если игрок стоит на платформе или под ней, то враг останавливается
                this.velocity.x = 0;
            }
            
        }

        if(this.position.y + this.height == canvas.height){ //Если враг упал в пропасть, то он умирает
            this.health = 0;
            this.isAlive = false;
        }

        if(this.attackCoolDown > 0){ //Таймер для атаки
            this.attackCoolDown--;
        }

        this.draw();
        

        if (this.position.y + this.height + this.velocity.y < canvas.height) {
            this.velocity.y += gravity;
        }
        else {
            this.velocity.y = 0;
        }
    }
}


class Platform {    //класс платформы
    constructor(x, y, width, height) {
        this.position = {
            x: x,
            y: y
        }

        this.width = width;
        this.height = height;
    }

    draw() {
        c.fillStyle = 'blue';
        c.shadowOffsetX = 0;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

let platforms = [];
let player;
let enemies = [];
let plat1 = new Image();
plat1.src = "images/37692.png"; //платформа для 1 уровня

function init(){    //функция инициализации (расставляет все объекты)
    platforms = [new Platform(350, 420, 500, 50), new Platform(0, 670, 420, 50),
        new Platform(780, 670, 500, 50)
    ]
    
    player = 0;
    player = new Player(50, 400, 100, 150);

    enemies= [new Enemy(380, 200, 100, 150)];

    score=0;
    c.fillStyle = '#f11b1b';
    c.font = "bold 40px Times New Roman";
    c.fillText(score, 140, 58);
}

init();

let keys = {    //объект для хранения состояния клавиш "вправо" и "влево"
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}


let fon1 = new Image(); 
fon1.src = "images/photo_2024-06-27_20-39-02.jpg"; //фон 1 уровня
let fon2 = new Image();
fon2.src = "images/fon2.png"; //фон 2 уровня
let fon3 = new Image();
fon3.src = "images/1653947325_64-furman-top-p-adskii-fon-krasivie-66.jpg"; //фон 3 уровня
let isfon1 = 1, isfon2 = 0, isfon3 = 0;

function animate() {
    requestAnimationFrame(animate)  //функция сообщает браузеру о том, что необходимо вызвать анимацию, используя рекурсивный вызов функции
    c.clearRect(0, 0, canvas.width, canvas.height); //очищаем canvas, чтобы предотвратить появление остаточного изображения
    
    if (isfon1 && !isfon2 && !isfon3){ //если 1 уровень, рисуем 1 фон
        c.drawImage(fon1, 0, 0, 1280, 720);
    }

    platforms.forEach((platform) => {
        platform.draw();
    })

    player.update();
    enemies.forEach((enemy) => {
        if (enemy.isAlive){
            enemy.update();
        }
    })
    
    platforms.forEach((plat) =>{ //визуальная отрисовка платформ
        c.drawImage(plat1, plat.position.x, plat.position.y - 30, plat.width, plat.height + 30);
    })
    

    if (!player.isGameOver){    //если не проиграл - игрок может двигаться
        if (keys.right.pressed) {    //если нажата кнопка "вправо" - двигаемся вправо с помощью горищонтального ускорения
            player.velocity.x = 5;
        }
        else if (keys.left.pressed) {    //если нажата кнопка "влево" - двигаемся влево с помощью отрицательного горищонтального ускорения
            player.velocity.x = -5;
        }
        else {   //если ни "вправо", ни "влево" не нажаты - обнуляем горизонтальное ускорение
            player.velocity.x = 0;
        }
    
        platforms.forEach((platform) => {
            if (player.position.y + player.height <= platform.position.y &&
                player.position.y + player.height + player.velocity.y >= platform.position.y && //если игрок находится на платформе относительно оси Y(координата Y + высота игрока равна координаты платформы)...
                player.position.x + player.width >= platform.position.x && player.position.x <= platform.position.x + platform.width) {  //...и относительно оси X...
                player.velocity.y = 0;  //...то ускорение по оси Y обнуляется и игрок прекращает падать
            }
        })

        //счет убитых врагов
        c.fillStyle = '#f11b1b';
        c.font = "bold 30px Times New Roman";
        c.fillText("СЧЁТ: ", 40, 55);
        c.fillStyle = '#f11b1b';
        c.font = "bold 40px Times New Roman";
        c.fillText(score, 140, 58);
    }
    else{   //анимация, появляющаяся при проигрыше
        if (player.gameOverFrame < 30){ //первые 30 кадров рисуется только затемнение экрана
            if (player.gameOverFrame == 0){
                canvas.addEventListener("click", (e) => {   //слушатель, проверяет нажатие кнопки "попробовать снова"
                    let offsetX = e.offsetX;
                    let offsetY = e.offsetY;
                    if (offsetX >= 400 && offsetX <=840 && offsetY >= 420 && offsetY <= 550){
                        init();
                    }
                })
            }
            c.fillStyle = `rgba(0, 0, 0, ${player.gameOverFrame * 0.03}`;
            c.fillRect(0, 0, canvas.width, canvas.height);
        }else{  // после 30 кадра появляется текст и кнопка
            c.fillStyle = `rgba(0, 0, 0, 1`;
            c.fillRect(0, 0, canvas.width, canvas.height);

            c.fillStyle = 'white';
            c.font = "40px PressStart";
            c.fillText("Вы проиграли!", 350, 190);

            c.fillStyle = ("rgb(72, 68, 78)");
            c.beginPath();
            c.roundRect(400, 420, 438, 127, 30);
            c.fill();
            c.closePath();

            c.fillStyle = 'white';
            c.font = "32px PressStart";
            c.fillText("Попробовать", 438, 472, 359);
            c.fillText("снова", 530, 522, 359);
        }
        player.gameOverFrame++;
    }


    platforms.forEach((platform) => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y && //если игрок находится на платформе относительно оси Y(координата Y + высота игрока равна координаты платформы)...
            player.position.x + player.width >= platform.position.x && player.position.x <= platform.position.x + platform.width) {  //...и относительно оси X...
            player.velocity.y = 0;  //...то ускорение по оси Y обнуляется и игрок прекращает падать
        }
        enemies.forEach((enemy) => {
            if (enemy.position.y + enemy.height <= platform.position.y &&
                enemy.position.y + enemy.height + enemy.velocity.y >= platform.position.y && //если враг находится на платформе относительно оси Y(координата Y + высота игрока равна координаты платформы)...
                enemy.position.x + enemy.width >= platform.position.x && enemy.position.x <= platform.position.x + platform.width) {  //...и относительно оси X...
                    enemy.velocity.y = 0;  //...то ускорение по оси Y обнуляется и вруг прекращает падать
                }
        })
    })
    
    enemies.forEach((enemy) =>  {
        if( player.attackBox.position.y + player.attackBox.height >= enemy.position.y && 
            player.attackBox.position.y <= enemy.position.y + enemy.height && 
            player.isAttacking && enemy.isAlive){ //если враг ещё жив + игрок атакует посохом
                if (player.turnToAttack == "right" && player.attackBox.position.x + player.attackBox.width >= enemy.position.x && 
                    player.attackBox.position.x <= enemy.position.x + enemy.width ) { //пока поле атаки хоть как-то касается врага и игрок повернут вправо
                        player.isAttacking = false; //возвращаем значение false
                        enemy.health-=30; //здоровье врага уменьшается при каждом ударе на 30
                        if (enemy.health <=0){  //если здоровье равно нулю
                            enemy.isAlive = false;  //враг считается убитым
                            score++; // +враг убит
                        }
                          
                }
                if (player.turnToAttack == "left" && player.attackBox.position.x >= enemy.position.x && 
                    player.attackBox.position.x - player.attackBox.width <= enemy.position.x + enemy.width ) { //пока поле атаки хоть как-то касается врага и игрок повернут влево
                        player.isAttacking = false; //возвращаем значение false
                        enemy.health-=30; //здоровье врага уменьшается при каждом ударе на 30
                        if (enemy.health <=0){  //если здоровье равно нулю
                            enemy.isAlive = false;  //враг считается убитым
                            score++; // +враг убит
                        }
                          
                }
            }
        
        if (player.ballBox.position.y + player.ballBox.radius >= enemy.position.y && 
            player.ballBox.position.y <= enemy.position.y + enemy.height && 
            player.isBallAttack && enemy.isAlive){ //если враг ещё жив + игрок атакует шарами
                if (player.turnToAttack == "right" && player.ballBox.position.x + player.width + 380 >= enemy.position.x && 
                    player.ballBox.position.x + player.width <= enemy.position.x + enemy.width ){ //пока поле атаки хоть как-то касается врага и игрок повернут вправо
                        player.isBallAttack = false; //возвращаем значение false
                        enemy.health-=18; //здоровье врага уменьшается при каждом ударе на 18
                        if (enemy.health <=0){  //если здоровье равно нулю
                            enemy.isAlive = false;  //враг считается убитым
                            score++; // +враг убит
                        }       
                }
                if (player.turnToAttack == "left" && player.ballBox.position.x >= enemy.position.x && 
                    player.ballBox.position.x  - 380 <= enemy.position.x + enemy.width ){ //пока поле атаки хоть как-то касается врага и игрок повернут влево
                        player.isBallAttack = false; //возвращаем значение false
                        enemy.health-=18; //здоровье врага уменьшается при каждом ударе на 18
                        if (enemy.health <=0){  //если здоровье равно нулю
                            enemy.isAlive = false;  //враг считается  убитым
                            score++; // +враг убит
                        }       
                }
            }
    })
        
}

animate();


addEventListener('keydown', ({ code }) => {   //обработчик события нажатия на кнопку
    if (!player.isGameOver){    //проверка на нажатие кнопок происходит только если не было проигрыша
        switch (code) {
            case 'KeyA':
                keys.left.pressed = true;
                player.turnToAttack = "left";
                player.currentState = "run"
                break;
            case 'KeyD':
                keys.right.pressed = true;
                player.turnToAttack = "right";
                player.currentState = "run"
                break;
            case 'KeyW':
                player.velocity.y -= 25;    //придания вертикального ускорения для создания видимости прыжка
                break;
            case 'KeyQ':
                player.attack();
                player.currentState = "attack";
                player.attackAnim = true;
            break;
            case 'KeyE':
                player.magic();
                player.currentState = "attack"
                player.attackAnim = true;
                ballDistance=0;
            break;
            case 'KeyR':
                player.protection = true;
            break;
        }
    }
})

addEventListener('keyup', ({ code }) => { //обработчик события отпускания кнопки
    switch (code) {
        case 'KeyA':
            keys.left.pressed = false;
            break;
        case 'KeyD':
            keys.right.pressed = false;
            break;
            case 'KeyR':
                player.protection = false;
            break;
    }
})