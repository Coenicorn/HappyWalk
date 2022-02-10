import { Renderer, Camera } from "./rendering/renderer.js";
import { Player } from "./player.js";
import { Level } from "./level.js";
export class Game extends Renderer {
    fps;
    running;
    currentInstruction;
    player;
    camera;
    level;
    theme;
    constructor() {
        super();
        this.theme = "water";
        this.running = false;
    }
    async init() {
        await this.loadAssets("./img", [
            "bridge_horizontal",
            "bridge_vertical",
            "broken_death",
            "broken",
            "checkpoint",
            "cracked",
            "end",
            "enter",
            "loading",
            "nowalk",
            "piranha",
            "play",
            "player_idle_left",
            "player_idle_right",
            "player_water",
            "player_won",
            "spikes_death",
            "spikes",
            "start",
            "walk1",
            "walk2",
            "walk3",
            "water_death",
            "water"
        ]);
        this.camera = new Camera(0, 0);
        this.running = true;
        this.player = new Player({ x: 0, y: 0 });
        this.level = new Level(10, 10, this, this.theme);
        this.loop();
    }
    loop() {
        let last = Date.now();
        let now = 0;
        let lag = 0;
        this.fps = 1000 / 60;
        function run() {
            now = Date.now();
            lag = now - last;
            last = now;
            while (lag > 0) {
                this.update();
                lag -= this.fps;
            }
            this.render(this.context);
            if (this.running)
                requestAnimationFrame(run.bind(this));
        }
        requestAnimationFrame(run.bind(this));
    }
    update() {
    }
    render(ctx) {
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.level.canvas, this.camera.x, this.camera.y);
        ctx.drawImage(this.Pic(this.player.getSprite()), this.center.x - this.tileSize / 2, this.center.y - this.tileSize / 2);
    }
}
