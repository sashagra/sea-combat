const record = document.getElementById('record'),
    shot = document.getElementById('shot'),
    hit = document.getElementById('hit'),
    dead = document.getElementById('dead'),
    enemy = document.getElementById('enemy'),
    again = document.getElementById('again'),
    header = document.querySelector('.header');

const play = {
    record: localStorage.getItem('seaBattleRecord') || 0,
    shot: 0,
    hit: 0,
    dead: 0,
    set updateData(data) {
        this[data]++;
        this.render();
    },
    render() {
        record.textContent = this.record;
        shot.textContent = this.shot;
        hit.textContent = this.hit;
        dead.textContent = this.dead;
    }
};

const game = {
    ships: [],
    shipCount: 0,
    optionShip: {
        count: [1, 2, 3, 4], // total ships with <size> elems
        size: [4, 3, 2, 1], // number of elems of ship
    },
    collision: new Set(),
    generateShips() {
        for ( let i = 0; i < this.optionShip.count.length; i++) {
            for (let j = 0; j < this.optionShip.count[i]; j++) {
                const size = this.optionShip.size[i];
                const ship = this.generateShip(size);
                this.ships.push(ship);
            }
        }
        this.shipCount = this.ships.length;       
    },
    generateShip(shipSize) {
        const ship = {
            hit: [],
            location: [],
        };

        let x, y;
        const direction = Math.random() < 0.5;

        if (direction) {
            x = Math.floor(Math.random() * 10), // 10 is the size of the field
            y = Math.floor(Math.random() * (10 - shipSize));
        } else {
            x = Math.floor(Math.random() * (10 - shipSize)),
            y = Math.floor(Math.random() * 10);
        }

        for (let i = 0; i < shipSize; i++) {
            if (direction) {
                ship.location.push(`${x}${y + i}`)
            } else {
                ship.location.push(`${x + i}${y}`)
            }
            ship.hit.push('');
        }

        if (this.chechCollision(ship.location)) {
            return this.generateShip(shipSize);
        }

        this.addCollision(ship.location);
        return ship;
    },

    chechCollision(location) {
        for (const coord of location) {
            if (this.collision.has(coord)) {
                return true;
            }
        }
    },
    addCollision(location) {
        for (let i = 0; i < location.length; i++) {
            const startCoordX = location[i][0] - 1;

            for (let j = startCoordX; j < startCoordX + 3; j++) {
                const startCoordY = location[i][1] - 1;
            
                for (let z = startCoordY; z < startCoordY + 3; z++) {

                    if (z >= 0 && z < 10 && j >= 0 && j < 10) {
                        const coord = j + '' + z;      
                        this.collision.add(coord);    
                    }
                }
            }
        }
    }
}

const show = {
    hit(elem) {
        this.changeClass(elem, 'hit');
    },
    miss(elem) {
        this.changeClass(elem, 'miss');
    },
    dead(elem) {
        this.changeClass(elem, 'dead');
    },
    changeClass(elem, value) {
        elem.className = value;
    } 
};

let shots = []; // Done shots

const fire = event => {
    const target = event.target;
    if (shots.indexOf(target.id) !== -1 || target.tagName !== 'TD') return
    show.miss(target);
    shots.push(target.id);
    play.updateData = 'shot';

    for (let i = 0; i < game.ships.length; i++) {
        const ship = game.ships[i];
        const index = ship.location.indexOf(target.id);
        if (index >= 0) {
            show.hit(target);
            play.updateData = "hit";
            ship.hit[index] = 'x';
            const life = ship.hit.indexOf('');

            if (life < 0) {
                play.updateData = 'dead';
                
                for (const id of ship.location) {
                    show.dead(document.getElementById(id));
                }

                game.shipCount--;

                if (game.shipCount < 1) {
                    header.textContent = 'Игра окончена!';
                    header.style.color = 'red';
                    enemy.removeEventListener('click', fire);

                    if (play.shot < play.record || play.record === 0) {
                        localStorage.setItem('seaBattleRecord', play.shot);
                        play.record = play.shot;
                        play.render();
                    }
                }
            }
        }
    }
};

function startNewGame() {
    // location.reload();
    play.shot = 0;
    play.hit = 0;
    play.dead = 0;
    shots = [];
    game.ships = [];
    game.collision = new Set();
    game.generateShips();
    document.querySelectorAll('TD').forEach(elem => elem.classList.remove('hit', 'dead', 'miss'));
    header.style = "";
    header.textContent = "sea battle"
    enemy.addEventListener('click', fire);
    play.render();
}

const init = () => {
    enemy.addEventListener('click', fire);
    play.render();
    game.generateShips();
    again.addEventListener('click', startNewGame)
    record.addEventListener('dblclick', () => {
        localStorage.clear();
        play.record = 0;
        play.render();
    })
};

init();