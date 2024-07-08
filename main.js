const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');


const gravity = 1;
let countAttace = 0; //счетчик ударов
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
        
    }

    draw() {    //отрисовка игрока
        c.fillStyle = 'purple';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        //поле атаки посохом
        if (this.isAttacking){
            c.fillStyle = 'red';
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);
        }
        //поле атаки шаром
        if (this.isBallAttack){
            c.beginPath();
            c.arc(this.ballBox.position.x + ballDistance + this.width + this.ballBox.radius , this.ballBox.position.y+50, this.ballBox.radius, 0, Math.PI*2, false);
            c.fillStyle = 'orange';
            c.stroke();
            c.fill();
            ballDistance+=50;
        }
    }

    update() {   //обновление местонвхождения игрока
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        this.draw();

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

        this.velocity = {   //объект, хранящий ускорение врага в двух осях
            x: 0,
            y: 3
        }

        this.width = width,
        this.height = height,
        this.health = 90, //здоровье врага

        this.isAlive = true
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
        c.fillStyle = 'blue'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

let platforms = [];
let player;
let enemies = [];

function init(){    //функция инициализации (расставляет все объекты)
    platforms = [new Platform(270, 400, 300, 50), new Platform(0, 670, 300, 50),
        new Platform(300, 670, 300, 50)
    ]
    
    player = 0;
    player = new Player(200, 400, 100, 150);

    enemies= [new Enemy(500, 200, 100, 150)];
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




function animate() {
    requestAnimationFrame(animate)  //функция сообщает браузеру о том, что необходимо вызвать анимацию, используя рекурсивный вызов функции
    c.clearRect(0, 0, canvas.width, canvas.height); //очищаем canvas, чтобы предотвратить появление остаточного изображения
    
    platforms.forEach((platform) => {
        platform.draw();
    })
    player.update();
    enemies.forEach((enemy) => {
        if (enemy.isAlive){
            enemy.update();
        }
    })
    if (!player.isGameOver){    //если не проиграл - игрок может двигаться
        if (keys.right.pressed) {    //если нажата кнопка "вправо" - двигаемся вправо с помощью горищонтального ускорения
            player.velocity.x = 5;
        }
        else if (keys.left.pressed) {    //если нажата кнопка "влево" - двигаемся влево с помощью отрицательного горищонтального ускорения
            player.velocity.x = -5
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
        if (player.attackBox.position.x + player.attackBox.width >= enemy.position.x && 
            player.attackBox.position.x <= enemy.position.x + enemy.width && 
            player.attackBox.position.y + player.attackBox.height >= enemy.position.y &&
            player.attackBox.position.y <= enemy.position.y + enemy.height && 
            player.isAttacking && enemy.isAlive){ //пока поле атаки хоть как-то касается врага
                player.isAttacking = false; //возвращаем значение false
                enemy.health-=30; //здоровье врага уменьшается при каждом ударе на 30
                countAttace++; //считаем количество ударов
                if (enemy.health <=0){  //если здоровье равно нулю
                    enemy.isAlive = false;  //враг сичтается убитым
                    score++; // +враг убит
                    document.querySelector('#lineScore').innerText = "";
                    document.querySelector('#lineScore').innerText += score;
                    countAttace=0;
                }
                  
        }

    if (player.ballBox.position.x + player.width + 400 >= enemy.position.x && 
        player.ballBox.position.x + player.width <= enemy.position.x + enemy.width &&
        player.ballBox.position.y + player.ballBox.radius >= enemy.position.y && 
        player.ballBox.position.y <= enemy.position.y + enemy.height && 
        player.isBallAttack && enemy.isAlive){ //пока поле атаки хоть как-то касается врага
            player.isBallAttack = false; //возвращаем значение false
            enemy.health-=18; //здоровье врага уменьшается при каждом ударе на 18
            countAttace++; //считаем количество ударов
            if (enemy.health <=0){  //если здоровье равно нулю
                enemy.isAlive = false;  //враг сичтается убитым
                score++; // +враг убит
                document.querySelector('#lineScore').innerText = "";
                document.querySelector('#lineScore').innerText += score;
                countAttace=0;
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
                break;
            case 'KeyD':
                keys.right.pressed = true;
                break;
            case 'KeyW':
                player.velocity.y -= 25;    //придания вертикального ускорения для создания видимости прыжка
                break;
            case 'Digit1':
                player.attack();
            break;
            case 'Digit2':
                player.magic();
                ballDistance=0;
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
    }
})