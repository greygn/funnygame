const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const gravity = 1

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
        this.gameOverFrame = 0
    }

    draw() {    //отрисовка игрока
        c.fillStyle = 'purple';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
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

function init(){    //функция инициализации (расставляет все объекты)
    platforms = [new Platform(270, 400, 300, 50), new Platform(0, 670, 300, 50),
        new Platform(300, 670, 300, 50)
    ]
    
    player = 0;
    player = new Player(200, 480, 75, 150);
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