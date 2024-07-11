const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const aliceSprites = new Image();   //картинка спрайта Алисы
aliceSprites.src = "sprites/aliceSprites.png"
const enemySprites = new Image();   //картинка спрайта врага
enemySprites.src = "sprites/enemySprites.png"
const dragonSprites = new Image();
dragonSprites.src = "sprites/dragonSprites.png";
let apple = new Image();
apple.src = "images/apple.png"; //картинка яблока
const bottleImg = new Image();
bottleImg.src = "images/bottle.png"
const menuImg = new Image();
menuImg.src = "images/menuBackground.png"

const  heart = new Image();   //сердце (здоровье игрока)
heart.src = "images/heart.png";
const flameImg = new Image();
flameImg.src = "images/flameTexture.JPG";
const diamondImg = new Image();
diamondImg.src = "images/diamond.png";

let arrayOfHearts = []; //массив, хранящий сердца игрока

const gravity = 1;
let score = 0; //счет убитых врагов
let ballDistance=0; //дистанция полета шара
let isMenu = true;

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
        this.countHv = 5; //количество сердечек у игрока

        this.currentState = "stand" //очень много флагов состояния игрока для анимации
        this.lastTurn = "right",
        this.lastState = "stand",
        this.animationTick = 0, //тик анимации (счётчик кадров)
        this.animationStage = 0,    //стадия анимации (картинки анимации)
        this.attackAnim = false,

        this.jumped = false;  //флаг того, что игрок прыгнул

        this.distance = 0;

        this.menuSpawned = false;
        this.isWin = false;

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
        
        if (this.animationTick == 10){  //считаем кадры анимации
            this.animationTick = 0;
            this.animationStage++;  //переключаем картинки
            if (this.animationStage == 6){
                if (this.attackAnim){
                    this.attackAnim = false
                }
                this.animationStage = 0;
            }
        }
        this.animationTick++;

        if (this.currentState != this.lastState){   //смена состояния 
            if(this.attackAnim){
                this.currentState = "attack";   //при этом анимация атаки не должна прерываться
            }
            else if(!keys.right.pressed && !keys.left.pressed){ //если ничего не нажато - Алиса стоит
                this.lastState = "stand"
                this.currentState = "stand";
                this.animationStage = 0;
                this.animationTick = 0;
            }
        
        }
        
        switch (this.currentState){
            case "stand":   //анимация стойки
                if (this.turnToAttack == "right"){
                    c.drawImage(aliceSprites, 100 * this.animationStage, 600, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(aliceSprites, 100 * this.animationStage, 750, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
            case "run": //анимация бега
                if (this.turnToAttack == "right"){
                    c.drawImage(aliceSprites, 100 * this.animationStage, 0, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(aliceSprites, 100 * this.animationStage, 150, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
            case "attack":  //анимация атаки
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

        //поле атаки посохом (условие ненужное)
        if (this.isAttacking &&  !this.protection ){
            c.fillStyle = 'red';
            if (this.turnToAttack == "right"){
                // c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
            }
            else{
                // c.fillRect(this.attackBox.position.x - this.attackBox.width + this.width, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
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

    }

    update() {   //обновление местонвхождения игрока
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        this.draw();

        if(this.countHv == 0){
            this.isGameOver = true; //поднятие флага проигрыша, если жизнь у игрока закончилась
        }

        if (this.position.y < canvas.height) {
            this.velocity.y += gravity;
        }
        else {
            this.isGameOver = true; //поднятие флага проигрыша, если игрок упал в яму и выпал за границы экрана
        }

        if (this.position.x >= (bottle.position.x - 20) && this.position.x <= (bottle.position.x + bottle.width + 20) &&
            this.position.y >= (bottle.position.y - 20) && this.position.y <= (bottle.position.y + bottle.height + 20) && !dragon.isAlive){
                this.isWin = true;
                canvas.addEventListener("click", function toMenu(e){   //слушатель, проверяет нажатие кнопки "на главный экран"
                    let offsetX = e.offsetX;
                    let offsetY = e.offsetY;
                    if (offsetX >= 380 && offsetX <=730 && offsetY >= 480 && offsetY <= 600){
                        player.isWin = false;
                        backX = 0;
                        isMenu = true;
                        canvas.removeEventListener("click", toMenu);
                        canvas.addEventListener("click", function startGame(e){   //слушатель, проверяет нажатие кнопки "начать игру"
                            let offsetX = e.offsetX;
                            let offsetY = e.offsetY;
                            if (offsetX >= 380 && offsetX <=840 && offsetY >= 415 && offsetY <= 525){
                                isMenu = false;
                                backX = 0;
                                init();
                                canvas.removeEventListener("click", startGame)
                            }
                        })
                    }
                })
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

        this.positionStartX = x - 100;
        this.positionEndX = x + 100;

        this.velocity = {   //объект, хранящий ускорение врага в двух осях
            x: 0,
            y: 3
        }

        this.width = width,
        this.height = height,
        this.health = 90, //здоровье врага

        this.isAlive = true //флаг жизни врага

        this.currentState = "run" //очень много флагов состояния врага для анимации
        this.lastTurn = "right",
        this.lastState = "stand",
        this.animationTick = 0, //тик анимации (счётчик кадров)
        this.animationStage = 0,    //стадия анимации (картинки анимации)
        this.attackAnim = false
    }

    draw() {    //отрисовка врага

        if (this.animationTick == 10){  //считаем кадры анимации
            this.animationTick = 0;
            this.animationStage++;  //переключаем картинки
            if (this.animationStage == 6){
                if (this.attackAnim){
                    this.attackAnim = false
                    
                }
                this.animationStage = 0;
                this.currentState = "run";
            }
        }
        this.animationTick++;


        if (this.currentState != this.lastState){   //смена состояния 
            if(this.attackAnim){
                this.currentState = "attack";   //при этом анимация атаки не должна прерываться
            }
            
        }
        
        switch (this.currentState){
            case "stand":   //анимация стойки
                if (this.isRight){
                    c.drawImage(enemySprites, 100 * this.animationStage, 600, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(enemySprites, 100 * this.animationStage, 750, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
            case "run": //анимация бега
                if (this.isRight){
                    c.drawImage(enemySprites, 100 * this.animationStage, 0, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(enemySprites, 100 * this.animationStage, 150, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
            case "attack":  //анимация атаки
                if (this.isRight){
                    c.drawImage(enemySprites, 100 * this.animationStage, 300, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                else{
                    c.drawImage(enemySprites, 100 * this.animationStage, 450, 100, 150, this.position.x, this.position.y, 100, 150);
                }
                break;
        }

        //ЗДОРОВЬЕ ВРАГА (линия)
        c.fillStyle='yellow';
        c.fillRect(this.position.x, this.position.y - 10, this.width, 10);

        c.fillStyle='brown';
        c.fillRect(this.position.x, this.position.y - 10, this.width * this.health / 90, 10);

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
                if (this.position.y == player.position.y){
                    this.isRight = true;
                }

                if(Math.abs(this.position.x - player.position.x) < 100 && this.attackCoolDown == 0  && this.attackBox.position.y == player.position.y){
                    this.attackCoolDown = 120; //Задержка перед ударом
                    this.currentState = "attack";
                    if(!player.isGameOver && (this.attackBox.position.x + this.attackBox.width) >= player.position.x && !player.protection){
                        player.countHv--;
                        }
                }
            }

            else if(this.position.x > player.position.x){// Если игрок слева, то идёт налево
                this.velocity.x = -1.5; //Ускорение перемещения врага

                if (this.position.y == player.position.y){
                    this.isRight = false;
                }
                
                
                if(Math.abs(this.position.x - player.position.x) < 100 && this.attackCoolDown == 0 && this.attackBox.position.y == player.position.y){
                    this.attackCoolDown = 120; //Задержка перед ударом
                    this.currentState = "attack";
                    if(!player.isGameOver && (this.attackBox.position.x - 100 - this.attackBox.width) <= player.position.x  && !player.protection){
                        player.countHv--;
                    }
                }
            }

            else if(Math.abs(this.position.y - player.position.y) > 0){ //Если игрок стоит на платформе или под ней, то враг останавливается
                this.velocity.x = 0;
            }
            
        }

        if((this.position.y - 40) >= canvas.height){ //Если враг упал в пропасть, то он умирает
            this.health = 0;
            this.isAlive = false;
            score+=50;
        }

        if(this.attackCoolDown > 0){ //Таймер для атаки
            this.attackCoolDown--;
        }

        this.draw();
        

        if (this.position.y + this.height + this.velocity.y < canvas.height) {
            this.velocity.y += gravity;
        }
    }
}

class Dragon {
    constructor(x, y, width, height) {   //нужен для создания врага с заданными свойствами
        this.position = {
            x: x,
            y: y,
        }
        

        this.attackZone = { //поле атаки
            x: 50,
            y: 200,
            width: 1100,
            height: 220
        }

        this.attackCoolDown = 180;

        this.alert = false; // Флаг встревоженного врага

        this.width = width,
        this.height = height,
        this.health = 300, //здоровье врага

        this.isAlive = true //флаг жизни врага

        this.currentState = "stand" //очень много флагов состояния врага для анимации
        this.lastState = "stand",
        this.animationTick = 0, //тик анимации (счётчик кадров)
        this.animationStage = 0,    //стадия анимации (картинки анимации)
        this.attackAnim = false,

        this.attackTop = true
    }

    draw(){

        if (this.animationTick == 10){  //считаем кадры анимации
            this.animationTick = 0;
            this.animationStage++;  //переключаем картинки
            if (this.animationStage == 6){
                if (this.attackAnim){
                    this.attackAnim = false
                    
                }
                this.animationStage = 0;
                this.currentState = "stand";
            }
        }
        this.animationTick++;

        if (this.currentState != this.lastState){   //смена состояния 
            if(this.attackAnim){
                this.currentState = "attack";   //при этом анимация атаки не должна прерываться
            }
            
        }

        if (this.alert){
            //ЗДОРОВЬЕ ВРАГА (линия)
            c.fillStyle='yellow';
            c.fillRect(290, 100, 700, 50);

            c.fillStyle='brown';
            c.fillRect(290, 100, 700 * this.health / 300, 50);

            if (this.attackCoolDown <=60){
                c.fillStyle = "rgba(255, 0, 0, 0.4)";   //рисуем предупреждение
                c.fillRect( this.attackZone.x, this.attackZone.y, this.attackZone.width, this.attackZone.height);
            }
            if (this.attackCoolDown <=15){  //рисуем огонь
                c.drawImage(flameImg, 0, 0, this.attackZone.width, this.attackZone.height, this.attackZone.x, this.attackZone.y, this.attackZone.width, this.attackZone.height)
            }
        }

        switch (this.currentState){
            case "stand":   //анимация стойки
                c.drawImage(dragonSprites, 480 * this.animationStage, 350, 480, 350, this.position.x, this.position.y, 480, 450);
                break;
            case "attack":  //анимация атаки
                c.drawImage(dragonSprites, 480 * this.animationStage, 0, 480, 350, this.position.x, this.position.y, 480, 350);
                break;
        }

    }

    update(){
        this.draw();

        if (!this.alert){
            if (this.position.x - player.position.x < 400){ //если игрок приблизился - переходим в состояние сражения
                this.alert = true;
            }
        }
        else{
            if( player.attackBox.position.y + player.attackBox.height >= this.position.y && 
                player.attackBox.position.y <= this.position.y + this.height && 
                player.isAttacking && this.isAlive){ //если враг ещё жив + игрок атакует посохом
                    if (player.turnToAttack == "right" && player.attackBox.position.x + player.attackBox.width >= this.position.x && 
                        player.attackBox.position.x <= this.position.x + this.width ) { //пока поле атаки хоть как-то касается врага и игрок повернут вправо
                            player.isAttacking = false; //возвращаем значение false
                            this.health-=30; //здоровье врага уменьшается при каждом ударе на 30
                            if (this.health <=0){  //если здоровье равно нулю
                                this.isAlive = false;  //враг считается убитым
                                score+= 500; // +враг убит
                            }
                              
                    }
                    if (player.turnToAttack == "left" && player.attackBox.position.x >= this.position.x && 
                        player.attackBox.position.x - player.attackBox.width <= this.position.x + this.width ) { //пока поле атаки хоть как-то касается врага и игрок повернут влево
                            player.isAttacking = false; //возвращаем значение false
                            this.health-=30; //здоровье врага уменьшается при каждом ударе на 30
                            if (this.health <=0){  //если здоровье равно нулю
                                this.isAlive = false;  //враг считается убитым
                                score+=500; // +враг убит
                            }
                              
                    }
                }
            
            if (player.ballBox.position.y + player.ballBox.radius >= this.position.y && 
                player.ballBox.position.y <= this.position.y + this.height && 
                player.isBallAttack && this.isAlive){ //если враг ещё жив + игрок атакует шарами
                    if (player.turnToAttack == "right" && player.ballBox.position.x + player.width + 380 >= this.position.x && 
                        player.ballBox.position.x + player.width <= this.position.x + this.width ){ //пока поле атаки хоть как-то касается врага и игрок повернут вправо
                            player.isBallAttack = false; //возвращаем значение false
                            this.health-=18; //здоровье врага уменьшается при каждом ударе на 18
                            if (this.health <=0){  //если здоровье равно нулю
                                this.isAlive = false;  //враг считается убитым
                                score+=500; // +враг убит
                            }       
                    }
                    if (player.turnToAttack == "left" && player.ballBox.position.x >= this.position.x && 
                        player.ballBox.position.x  - 380 <= this.position.x + this.width ){ //пока поле атаки хоть как-то касается врага и игрок повернут влево
                            player.isBallAttack = false; //возвращаем значение false
                            this.health-=18; //здоровье врага уменьшается при каждом ударе на 18
                            if (this.health <=0){  //если здоровье равно нулю
                                this.isAlive = false;  //враг считается  убитым
                                score+=500; // +враг убит
                            }       
                    }
                }

            if(this.attackCoolDown == 50){  //запускаем анимацию атаки
                this.currentState = "attack";
                this.animationStage = 0;
                this.animationTick = 0;
            }
                
            if(this.attackCoolDown == 0){
                this.attackCoolDown = 180; //Задержка перед ударом
                if(!player.isGameOver && (this.attackZone.x + this.attackZone.width) >= player.position.x && this.attackZone.x < player.position.x && 
                (this.attackZone.y + this.attackZone.height) >= player.position.y && this.attackZone.y <= player.position.y && !player.protection){
                    player.countHv--;   //снижаем здоровье игрока, если он оказался в огне 
                }

                //выбираем, где будет следующая атака
                if (Math.random() <= 0.5){  //атака будет сверху
                    this.attackTop = true;
                    this.attackZone.x = 50;
                    this.attackZone.y = 200;
                }
                else{
                    this.attackTop = false; //атака будет снизу
                    this.attackZone.x = 50;
                    this.attackZone.y = 470;
                }
            }
            else{
                this.attackCoolDown--;
            }
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

class Diamond {
    constructor(x, y){
        this.position = {
            x: x,
            y: y
        }

        this.width = 100;
        this.height = 75;

        this.isCollected = false;   //флаг того, что алмазы собраны
    }

    draw(){ //отрисовка алмазов
        if (!this.isCollected){
            c.drawImage(diamondImg, this.position.x, this.position.y, this.width, this.height)
        }
        
    }

    update(){
        if (player.position.x >= (this.position.x - 20) && player.position.x <= (this.position.x + this.width + 20) &&
            player.position.y >= (this.position.y - 20) && player.position.y <= (this.position.y + this.height + 20) && !this.isCollected){
                this.isCollected = true;    //отмечаем то, что они собраны
                score += 50;
            }
            
        this.draw();
    }
}

class Apple{ //класс яблок
    constructor(x, y, width, height) {
        this.position = {
            x: x,
            y: y
        }
        this.have = true;
        this.width = width;
        this.height = height;
    }

    draw() {
        c.drawImage(apple, this.position.x, this.position.y , this.width, this.height);
    }
}

class Bottle{
    constructor(x, y) {
        this.position = {
            x: x,
            y: y
        }
        this.width = 45;
        this.height = 75;
    }

    draw() {
        c.drawImage(bottleImg, this.position.x, this.position.y , this.width, this.height);
    }
}


let apples = []; //массив яблок
let platforms = [];
let player;
let enemies = [];
let diamonds = [];
let dragon;
let bottle;
let plat1 = new Image();
plat1.src = "images/37692.png"; //платформа для 1 уровня
let plat2 = new Image();
plat2.src = "images/37693.png"; //платформа для 2 уровня
let plat3 = new Image();
plat3.src = "images/37694.png"; //платформа для 3 уровня

function init(){    //функция инициализации (расставляет все объекты)
    platforms = [new Platform(350, 420, 500, 50), new Platform(0, 670, 420, 50),
        new Platform(780, 670, 650, 50), new Platform(1430, 670, 300, 50),
        new Platform(1700, 450, 300, 50), new Platform(1980, 250, 300, 50),
        new Platform(2280, 670, 750, 50), new Platform(2480, 450, 300, 50),
        new Platform(3030, 670, 1578, 50), new Platform(3450, 420, 500, 50)
    ]

    diamonds = [new Diamond(100, 100), new Diamond(1000, 100), new Diamond(1450, 300),
        new Diamond(1600, 200), new Diamond(1850, 100), new Diamond(2480, 100),
        new Diamond(2580, 100), new Diamond(2680, 100)
    ]

    apples = [new Apple(1080, 620, 45, 50), new Apple(2550, 400, 45, 50),
        new Apple(3650, 370, 45, 50)];
    
    bottle = new Bottle(4300, 520)
    player = 0;
    player = new Player(50, 400, 100, 150);

    enemies= [new Enemy(580, 200, 100, 150), new Enemy(1000, 400, 100, 150),
        new Enemy(1800, 50, 100, 150), new Enemy(2600, 400, 100, 150), 
        new Enemy(3700, 200, 100, 150), new Enemy(3800, 400, 100, 150)];

    dragon = new Dragon(4100, 320, 480, 350);

    score=0;
    c.fillStyle = 'white';
    c.font = "30px PressStart";
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
fon1.src = "images/photo_back.png"; //фон
let backX = 0; //позиция фона

let circleArray = []

let colorArray = [
    'rgba(255, 190, 11, 0.8)',
    'rgba(251, 86, 7, 0.8)',
    'rgba(255, 0, 110, 0.8)',
    'rgba(131, 56, 236, 0.8)',
    'rgba(58, 134, 255, 0.8)'
]

function Circle(x, y, dx, dy, radius, color){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.firstX = false;
    this.firstY = false;

    this.draw = function() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    this.update = function(){
        if(this.x - this.radius > 0){
            this.firstX = true;
        }
        if(this.x + this.radius < canvas.height){
            this.firstY = true;
        }
        if ((this.x + this.radius > innerWidth || this.x - this.radius < -200) && this.firstX){
            this.dx = -this.dx;
        }
        if ((this.y + this.radius > innerHeight || this.y - this.radius < -200) && this.firstY){
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

for (let i = 0; i < 40; i++){
    let radius = Math.random() * 40 + 50;
    let x = Math.random() * -200;
    let y = canvas.height + Math.random() * 200;
    let dx = Math.random() * 1;
    let dy = Math.random() * -1;
    let color = colorArray[Math.floor(Math.random() * (colorArray.length - 0.1))];
    circleArray.push(new Circle(x, y, dx, dy, radius, color));
}

function animate() {
    requestAnimationFrame(animate)  //функция сообщает браузеру о том, что необходимо вызвать анимацию, используя рекурсивный вызов функции
    c.clearRect(0, 0, canvas.width, canvas.height); //очищаем canvas, чтобы предотвратить появление остаточного изображения


    if(isMenu){
        if(!player.menuSpawned){
            canvas.addEventListener("click", function startGame(e){   //слушатель, проверяет нажатие кнопки "начать игру"
                let offsetX = e.offsetX;
                let offsetY = e.offsetY;
                if (offsetX >= 380 && offsetX <=840 && offsetY >= 415 && offsetY <= 525){
                    isMenu = false;
                    init();
                    canvas.removeEventListener("click", startGame);
                }
            })
        }
        c.drawImage(menuImg, 0, 0, canvas.width, canvas.height);
        c.fillStyle = 'white';
        c.font = "40px PressStart";
        c.fillText("Побег из Страны Чудес", 211, 191, 860, 46);

        c.fillStyle = ("rgba(111, 45, 20, 0.8)");
        c.beginPath();
        c.roundRect(382, 415, 455, 110, 30);
        c.fill();
        c.closePath();
        c.fillStyle = 'white';
        c.font = "32px PressStart";
        c.fillText("Начать игру", 433, 480, 354, 46);

        c.font = "24px SofiaSans";
        c.fillText("Управление:", 13, 548, 354, 24);
        c.fillText("W - прыжок", 13, 572, 354, 24);
        c.fillText("A - движение влево", 13, 596, 354, 24);
        c.fillText("D - движение вправо", 13, 620, 354, 24);
        c.fillText("J - ближняя атака", 13, 644, 354, 24);
        c.fillText("K - дальняя атака", 13, 668, 354, 24);
        c.fillText("L - щит", 13, 692, 354, 24);

        c.drawImage(diamondImg, 887, 514, 78, 58);
        c.fillText("Собирайте алмазы, чтобы", 971, 535, 354, 24);
        c.fillText("увеличить счёт", 971, 559, 354, 24);

        c.drawImage(apple, 905, 571, 48, 60);
        c.fillText("Яблоки восстанавливают", 971, 598, 354, 24);
        c.fillText("здоровье", 971, 622, 354, 24);

        c.drawImage(bottleImg, 911, 634, 40, 77);
        c.fillText("Найдите зелье, чтобы ", 971, 664, 354, 24);
        c.fillText("проснуться", 971, 688, 354, 24);
    }
    else if (!isMenu){
        c.drawImage(fon1, backX, 0); //отрисовка фона

        platforms.forEach((platform) => {
            platform.draw();
        })

        diamonds.forEach((diamond) => {
            diamond.update()
        })

        enemies.forEach((enemy) => {
            if (enemy.isAlive){
                enemy.update();
            }
        })

        bottle.draw();

        if (dragon.isAlive){
            dragon.update();
        }
        
        player.update();

        for (let i = 0; i < 3; i++){ //визуальная отрисовка платформ 1 локации
            c.drawImage(plat1, platforms[i].position.x, platforms[i].position.y - 30, platforms[i].width, platforms[i].height + 30);
        }
        
        for (let i = 3; i < 8; i++){ //визуальная отрисовка платформ 2 локации
            c.drawImage(plat2, platforms[i].position.x, platforms[i].position.y - 30, platforms[i].width, platforms[i].height + 30);
        }

        for (let i = 8; i < 10; i++){ //визуальная отрисовка платформ 2 локации
            c.drawImage(plat3, platforms[i].position.x, platforms[i].position.y - 30, platforms[i].width, platforms[i].height + 30);
        }

        for( let i=0; i<apples.length; i++){ //отрисовка яблок
            if(apples[i].have){
                apples[i].draw();
            }
        }
        
        if (player.isGameOver){
            player.velocity.x = 0;
        }
        
        if (!player.isGameOver && !player.isWin){    //если не проиграл - игрок может двигаться
            if (keys.right.pressed && player.position.x < 600) { //если нажата кнопка "вправо" - двигаемся вправо с помощью горищонтального ускорения
                player.velocity.x = 5;
            }
            else if (keys.left.pressed && player.position.x > 50) { //если нажата кнопка "влево" - двигаемся влево с помощью отрицательного горищонтального ускорения
                player.velocity.x = -5;
            }
            else {   //если ни "вправо", ни "влево" не нажаты - обнуляем горизонтальное ускорение
                player.velocity.x = 0;
                if (backX <= -fon1.width){ //если доходим до конца фона
                    backX = 0;
                }
                if (keys.right.pressed && player.distance < 3150){
                    platforms.forEach((platform) =>{
                        platform.position.x -= 5;
                    })
                    diamonds.forEach((diamond) => {
                        diamond.position.x -=5;
                    })
                    apples.forEach((apple) =>{
                        apple.position.x -= 5;
                    })
                    enemies.forEach((enemy) =>{ //сдвигаем врага, а также его путевые точки
                        enemy.position.x -= 5;
                        enemy.positionStartX -= 5;
                        enemy.positionEndX -= 5;
                    })
                    dragon.position.x -= 5;
                    player.distance += 5;
                    backX -= 5;
                    bottle.position.x -=5;
                }
                else if (keys.left.pressed && player.position.x > 0){
                    player.velocity.x = -5;
                }
                else if (keys.left.pressed && player.distance > 0 && player.distance != 3150){
                    platforms.forEach((platform) =>{
                        platform.position.x += 5;
                    })
                    diamonds.forEach((diamond) => {
                        diamond.position.x +=5;
                    })
                    apples.forEach((apple) =>{
                        apple.position.x += 5;
                    })
                    enemies.forEach((enemy) =>{ //сдвигаем врага, а также его путевые точки
                        enemy.position.x += 5;
                        enemy.positionStartX += 5;
                        enemy.positionEndX += 5;
                    })
                    dragon.position.x += 5;
                    player.distance -= 5;
                    backX += 5;
                    bottle.position.x +=5;
                }
                else if (keys.right.pressed && (player.position.x + player.width) < canvas.width){
                    player.velocity.x = 5;
                }
            }
        
            platforms.forEach((platform) => {
                if (player.position.y + player.height <= platform.position.y &&
                    player.position.y + player.height + player.velocity.y >= platform.position.y && //если игрок находится на платформе относительно оси Y(координата Y + высота игрока равна координаты платформы)...
                    player.position.x + player.width >= platform.position.x && player.position.x <= platform.position.x + platform.width) {  //...и относительно оси X...
                    player.velocity.y = 0;  //...то ускорение по оси Y обнуляется и игрок прекращает падать
                    player.jumped = false;  //игрок может снова прыгнуть
                }
            })

            apples.forEach((apple) => { //если координаты игрока совпали с координатами ябллока, + сердечко к здоровью игрока
                if (player.position.x + player.width >= apple.position.x && player.position.x <= apple.position.x + apple.width &&
                    player.position.y + player.height >= apple.position.y && 
                    player.position.y <= apple.position.y + apple.height && apple.have){
                    if (player.countHv < 5){
                        player.countHv++;
                    }
                    apple.have = false; 
                }
            })

            //счет убитых врагов
            c.fillStyle = 'white';
            c.font = "20px PressStart";
            c.fillText("СЧЕТ: ", 40, 55);
            c.fillStyle = 'white';
            c.font = "30px PressStart";
            c.fillText(score, 140, 58);

            //здоровье игрока
            c.fillStyle = 'white';
            c.font = "20px PressStart";
            c.fillText("ЗДОРОВЬЕ: ", 800, 55);
            for (let i = 0; i < player.countHv; i++) { 
                arrayOfHearts[i] = heart;
            }
            for (let i = 0; i < player.countHv; i++) { 
                    arrayOfHearts[i].onload = function(n){
                    c.drawImage(arrayOfHearts[n], 980 + 50*n, 20 , 50, 50);
                }(i);
            }
        }
        else if (player.isGameOver && !player.isWin){   //анимация, появляющаяся при проигрыше
            if (player.gameOverFrame < 30){ //первые 30 кадров рисуется только затемнение экрана
                if (player.gameOverFrame == 0){
                    canvas.addEventListener("click", function restart(e) {   //слушатель, проверяет нажатие кнопки "попробовать снова"
                        let offsetX = e.offsetX;
                        let offsetY = e.offsetY;
                        if (offsetX >= 400 && offsetX <=840 && offsetY >= 420 && offsetY <= 550){
                            init();
                            canvas.removeEventListener("click", restart)
                        }
                    })
                }
                c.fillStyle = `rgba(0, 0, 0, ${player.gameOverFrame * 0.03}`;
                c.fillRect(0, 0, canvas.width, canvas.height);
            }else{  // после 30 кадра появляется текст и кнопка
                backX = 0;
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
        else if(player.isWin){
            c.fillStyle = "black"
            c.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < circleArray.length; i++){
                circleArray[i].update();
            }

            c.fillStyle = 'white';
            c.font = "40px PressStart";
            c.fillText("Вы победили!", 376, 189, 482, 46);
            c.font = "32px PressStart";
            c.fillText("спасибо за игру", 366, 242, 487, 46);
            c.fillText(`ваш счет:${score}`, 399, 427, 450, 46);

            c.fillStyle = ("rgb(72, 68, 78)");
            c.beginPath();
            c.roundRect(382, 480, 455, 110, 30);
            c.fill();
            c.closePath();

            c.fillStyle = 'white';
            c.font = "32px PressStart";
            c.fillText("На главный", 443, 533, 344, 46);
            c.fillText("экран", 510, 572, 344, 46);
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
                                score+=100; // +враг убит
                            }
                            
                    }
                    if (player.turnToAttack == "left" && player.attackBox.position.x >= enemy.position.x && 
                        player.attackBox.position.x - player.attackBox.width <= enemy.position.x + enemy.width ) { //пока поле атаки хоть как-то касается врага и игрок повернут влево
                            player.isAttacking = false; //возвращаем значение false
                            enemy.health-=30; //здоровье врага уменьшается при каждом ударе на 30
                            if (enemy.health <=0){  //если здоровье равно нулю
                                enemy.isAlive = false;  //враг считается убитым
                                score+=100; // +враг убит
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
                                score+=100; // +враг убит
                            }       
                    }
                    if (player.turnToAttack == "left" && player.ballBox.position.x >= enemy.position.x && 
                        player.ballBox.position.x  - 380 <= enemy.position.x + enemy.width ){ //пока поле атаки хоть как-то касается врага и игрок повернут влево
                            player.isBallAttack = false; //возвращаем значение false
                            enemy.health-=18; //здоровье врага уменьшается при каждом ударе на 18
                            if (enemy.health <=0){  //если здоровье равно нулю
                                enemy.isAlive = false;  //враг считается  убитым
                                score+=100; // +враг убит
                            }       
                    }
                }
        })
        }
    
        
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
                if (!player.jumped){    //прыгнуть можно только один раз
                    player.velocity.y -= 25;    //придания вертикального ускорения для создания видимости прыжка
                    player.jumped = true;   //игрок прыгнул
                }
                
                break;
            case 'KeyJ':
                player.attack();
                player.currentState = "attack";
                player.attackAnim = true;
            break;
            case 'KeyK':
                player.magic();
                player.currentState = "attack"
                player.attackAnim = true;
                ballDistance=0;
            break;
            case 'KeyL':
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
            case 'KeyL':
                player.protection = false;
            break;
    }
})