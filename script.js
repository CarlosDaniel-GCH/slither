const canvas = document.getElementById('canvas');

// Nos permite realizar operaciones de dibujo dentro del canvas
const ctx = canvas.getContext('2d');

canvas.width = 850;
canvas.height = 570;

class Apple{
    constructor(position,radio,color,context){
        this.position = position;
        this.radio = radio;
        this.color = color;
        this.context = context;
    }

    draw(){
        this.context.save();
        this.context.beginPath();

        // Dibujaremos la cabeza(un circulo)
        // Parametros: posicion en x, y, el radio, el angulo inicial y el angulo final(360) que se trabaja en radianes 
        this.context.arc(this.position.x, this.position.y, this.radio, 0, Math.PI*2);

        this.context.fillStyle = this.color; //Indicamos el color
        this.context.shadowColor = this.color;
        this.context.shadowBlur = 10; // Grosor del efecto de sombra
        this.context.fill() // Pintamos el circulo

        this.context.closePath(); //Terminamos el dibujo final
        this.context.restore();
    }
    collision(snake){
        let v1 = {
            x: this.position.x - snake.position.x,
            y: this.position.y - snake.position.y
        }
        let distance = Math.sqrt(
            (v1.x*v1.x) + (v1.y*v1.y)
        );

        if(distance < snake.radio + this.radio){
            this.position = {
                x: Math.floor(Math.random() * ((canvas.width - this.radio) - this.radio +1)) + this.radio,
                y: Math.floor(Math.random() * ((canvas.height - this.radio) - this.radio +1)) + this.radio
            }
            snake.createBody();
        }
    }
}

class SnakeBody{
    constructor(radio,color,context,path){
        this.radio = radio;
        this.color = color;
        this.context = context;
        this.path = path;
        this.transparency = 1;
    }

    drawCircle(x,y,radio,color){
        this.context.save();
        this.context.beginPath();

        // Dibujaremos la cabeza(un circulo)
        // Parametros: posicion en x, y, el radio, el angulo inicial y el angulo final(360) que se trabaja en radianes 
        this.context.arc(x, y, radio, 0, Math.PI*2);

        this.context.fillStyle = color; //Indicamos el color
        
        this.context.globalAlpha = this.transparency; //Indicamos la transparencia del color
        this.context.shadowColor = color;
        this.context.shadowBlur = 10; // Grosor del efecto de sombra
        this.context.fill() // Pintamos el circulo

        this.context.closePath(); //Terminamos el dibujo final
        this.context.restore();
    }

    draw(){
        this.drawCircle(this.path.slice(-1)[0].x, this.path.slice(-1)[0].y,
                        this.radio, this.color);
    }
}

class Snake{
    constructor(position, radio, color, velocity, context){
        this.position = position;
        this.radio = radio;
        this.color = color;
        this.velocity = velocity;
        this.context = context;
        this.rotation = 0;
        this.transparency = 1;
        this.body = [];
        this.isDeath = false;
        this.keys = {
            A: false,
            D: false,
            enable: true
        }  
        this.keyboard();
    }

    initBody(){
        for(let i = 0; i < 3; i++){
            let path = [];
            for(let k = 0; k < 12; k++){
                path.push({
                    x: this.position.x,
                    y: this.position.y 
                });
            }

            this.body.push(new SnakeBody(this.radio, this.color, this.context, path));
        }
    }

    createBody(){
        let path = [];
            for(let k = 0; k < 12; k++){
                path.push({
                    x: this.body.slice(-1)[0].path.slice(-1)[0].x,
                    y: this.body.slice(-1)[0].path.slice(-1)[0].y
                });
            }

            this.body.push(new SnakeBody(this.radio, this.color, this.context, path));
    }

    drawCircle(x,y,radio,color,shadowColor){
        this.context.save();
        this.context.beginPath();

        // Dibujaremos la cabeza(un circulo)
        // Parametros: posicion en x, y, el radio, el angulo inicial y el angulo final(360) que se trabaja en radianes 
        this.context.arc(x, y, radio, 0, Math.PI*2);

        this.context.fillStyle = color; //Indicamos el color
        
        this.context.globalAlpha = this.transparency // globalAlpha = 1 es vivisble y 0 es opaco
        this.context.shadowColor = shadowColor;
        this.context.shadowBlur = 10; // Grosor del efecto de sombra
        this.context.fill() // Pintamos el circulo

        this.context.closePath(); //Terminamos el dibujo final
        this.context.restore();
    }

    drawHead(){
        this.drawCircle(this.position.x, this.position.y, this.radio, this.color,this.color);       
        
        // Dibujamos lo ojos
        this.drawCircle(this.position.x, this.position.y-9, this.radio-4, "white","transparent");
        this.drawCircle(this.position.x+1, this.position.y-9, this.radio-6, "black","transparent");
        this.drawCircle(this.position.x+3, this.position.y-8, this.radio-9, "white","transparent");

        this.drawCircle(this.position.x, this.position.y+9, this.radio-4, "white","transparent");
        this.drawCircle(this.position.x+1, this.position.y+9, this.radio-6, "black","transparent");
        this.drawCircle(this.position.x+3, this.position.y+8, this.radio-9, "white","transparent");
    }

    drawBody(){
        this.body[0].path.unshift({
            x: this.position.x,
            y: this.position.y
        });  // Con unshift agregamos un elemento en la primera posicion del array

        this.body[0].draw();    

        for(let i = 1; i < this.body.length; i++){
            this.body[i].path.unshift(this.body[i-1].path.pop());
            this.body[i].draw();
        }

        this.body[this.body.length-1].path.pop();
    }

    draw(){
        this.context.save();

        this.context.translate(this.position.x, this.position.y);
        this.context.rotate(this.rotation);
        this.context.translate(-this.position.x, -this.position.y);

        this.drawHead();
        this.context.restore();
    }

    update(){
        if(this.isDeath){
            this.transparency = Math.max(0, this.transparency - 0.02);
            this.body.forEach(b => b.transparency = this.transparency);
            this.drawBody();
            this.draw();
            if(this.transparency <= 0){
                return;
            }
            return;
        }

        this.drawBody();
        this.draw();
        if(this.keys.A && this.keys.enable){
            this.rotation -= 0.04;
        }

        if(this.keys.D && this.keys.enable){
            this.rotation += 0.04;
        }
        // Dandonle movimiento a la serpiente
        this.position.x += Math.cos(this.rotation);
        this.position.y += Math.sin(this.rotation);

        this.collision();
    }

    collision(){
        if(this.position.x-this.radio <= 0 ||
            this.position.x+this.radio >= canvas.width ||
            this.position.y-this.radio <= 0 ||
            this.position.y+this.radio >= canvas.height){

            this.death();
        }
    }

    death(){
        this.velocity = 0;
        this.keys.enable = false;
        this.isDeath = true;
        this.body.forEach((b) =>{
            let lastItem = b.path[b.path.length-1];
            for(let i = 0; i < b.path.length; i++){
                b.path[i] = lastItem;
            }
            b.transparency = this.transparency;
        });
    }

    keyboard(){
        // Dandole direccion a nuestra serpiente
        document.addEventListener("keydown",(evt) => {
            if(evt.key == "a" || evt.key == "A"){
                this.keys.A = true;
            }

            if(evt.key == "d" || evt.key == "D"){
                this.keys.D = true;
            }
        })

        document.addEventListener("keyup",(evt) => {
            if(evt.key == "a" || evt.key == "A"){
                this.keys.A = false;
            }

            if(evt.key == "d" || evt.key == "D"){
                this.keys.D = false;
            }
        })
    }
}

// Creando un objeto, en este caso es una serpiente
const snake = new Snake({x:200, y:200}, 11, "#FEBA39", 1.5, ctx);
snake.initBody();
const apple = new Apple({x: 300, y:300}, 8, "red", ctx);

function background(){
    // Le damos un color
    ctx.fillStyle = "#1B1C30";

    // Recibe como parametros la posicion en x, y, el ancho y el alto
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujaremos varios cuadros pequeños tanto en vertical como en horizontal
    for(let i=0; i < canvas.height; i+=80){
        for(let j=0; j<canvas.width; j+=80){
            ctx.fillStyle = "#23253C";
            ctx.fillRect(j+10, i+10, 70, 70);
        }
    }
}

background();
snake.draw();

function update(){
    background();
    snake.update();
    apple.draw();
    apple.collision(snake);
    requestAnimationFrame(update);
}
update();