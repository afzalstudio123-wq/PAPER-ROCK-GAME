/**
 * Magical Stone, Paper, Scissors Garden
 * Core Gameplay & Aesthetic Engine
 * Design & Idea by: Afzal Ehsan
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // DOM Elements
    // ==========================================
    const cardStone = document.getElementById('cardStone');
    const cardPaper = document.getElementById('cardPaper');
    const cardScissors = document.getElementById('cardScissors');
    const choiceCards = [cardStone, cardPaper, cardScissors];
    
    const computerCard = document.getElementById('computerCard');
    const computerIllustration = document.getElementById('computerIllustration');
    const computerTitle = document.getElementById('computerTitle');
    
    const playerScoreEl = document.getElementById('playerScore');
    const computerScoreEl = document.getElementById('computerScore');
    const resultText = document.getElementById('resultText');
    const resetButton = document.getElementById('resetButton');
    
    const petalContainer = document.getElementById('petalContainer');
    const soundToggle = document.getElementById('soundToggle');
    const soundOnIcon = soundToggle.querySelector('.sound-on');
    const soundOffIcon = soundToggle.querySelector('.sound-off');

    // ==========================================
    // Game State Variables
    // ==========================================
    let playerScore = parseInt(localStorage.getItem('garden_player_score')) || 0;
    let computerScore = parseInt(localStorage.getItem('garden_computer_score')) || 0;
    let isSoundEnabled = localStorage.getItem('garden_sound_enabled') !== 'false'; // defaults to true
    let isRoundActive = false;

    // Initialize scoreboard text
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;

    // ==========================================
    // Web Audio API Synthesizer (Zero-Cost SFX)
    // ==========================================
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Custom sound synthesizer functions
    const playSound = {
        click: () => {
            if (!isSoundEnabled) return;
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
            
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.16);
        },
        
        shuffle: () => {
            if (!isSoundEnabled) return;
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, audioCtx.currentTime);
            
            // Wobble sound to mimic card shuffling
            for (let i = 0; i < 8; i++) {
                const time = audioCtx.currentTime + (i * 0.1);
                osc.frequency.setValueAtTime(i % 2 === 0 ? 120 : 80, time);
            }
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.8);
        },
        
        win: () => {
            if (!isSoundEnabled) return;
            initAudio();
            const now = audioCtx.currentTime;
            
            // Play a magical arpeggio (C Major: C5 -> E5 -> G5 -> C6)
            const notes = [523.25, 659.25, 783.99, 1046.50];
            
            notes.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + (index * 0.08));
                
                gain.gain.setValueAtTime(0.12, now + (index * 0.08));
                gain.gain.exponentialRampToValueAtTime(0.005, now + (index * 0.08) + 0.4);
                
                osc.start(now + (index * 0.08));
                osc.stop(now + (index * 0.08) + 0.45);
            });
        },
        
        lose: () => {
            if (!isSoundEnabled) return;
            initAudio();
            const now = audioCtx.currentTime;
            
            // Warm minor sliding down chord
            const notes = [392.00, 311.13, 261.63]; // G4, Eb4, C4
            
            notes.forEach((freq) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.linearRampToValueAtTime(freq * 0.8, now + 0.5);
                
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.5);
                
                osc.start(now);
                osc.stop(now + 0.55);
            });
        },
        
        draw: () => {
            if (!isSoundEnabled) return;
            initAudio();
            const now = audioCtx.currentTime;
            
            // Gentle neutral dual-tone
            const freqs = [349.23, 392.00]; // F4 & G4
            
            freqs.forEach((freq) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
                
                osc.start(now);
                osc.stop(now + 0.4);
            });
        },
        
        reset: () => {
            if (!isSoundEnabled) return;
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.4);
            
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }
    };

    // ==========================================
    // Sound Settings Handling
    // ==========================================
    function updateSoundIcons() {
        if (isSoundEnabled) {
            soundOnIcon.classList.remove('hidden');
            soundOffIcon.classList.add('hidden');
        } else {
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
        }
    }

    soundToggle.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        localStorage.setItem('garden_sound_enabled', isSoundEnabled);
        updateSoundIcons();
        if (isSoundEnabled) {
            initAudio();
            playSound.click();
        }
    });

    // Initial icon state
    updateSoundIcons();

    // ==========================================
    // Aesthetic Enhancements: Floating Petals
    // ==========================================
    const PETAL_COUNT = window.innerWidth < 768 ? 15 : 25;
    
    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        // Randomize size, starting position, transparency, speed
        const size = Math.random() * 8 + 8; // 8px to 16px
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 8 + 6; // 6s to 14s
        const delay = Math.random() * 5;
        const rotate = Math.random() * 360;
        
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${startX}px`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.transform = `rotate(${rotate}deg)`;
        
        // Add random slight hues of sakura pinks/peach
        const opacity = Math.random() * 0.4 + 0.5; // 0.5 to 0.9
        const pinkHue = Math.floor(Math.random() * 20) + 340; // 340 to 360
        petal.style.backgroundColor = `hsla(${pinkHue}, 60%, 80%, ${opacity})`;
        
        petalContainer.appendChild(petal);
        
        // Remove from DOM when animation finishes and spawn a new one
        setTimeout(() => {
            petal.remove();
            if (petalContainer.childElementCount < PETAL_COUNT) {
                createPetal();
            }
        }, (duration + delay) * 1000);
    }

    // Initialize petals
    for (let i = 0; i < PETAL_COUNT; i++) {
        createPetal();
    }

    // ==========================================
    // Core Gameplay Logic
    // ==========================================
    const choices = ['stone', 'paper', 'scissors'];
    
    const choiceMeta = {
        stone: {
            title: 'STONE',
            img: 'assets/stone.png',
            class: 'card-stone'
        },
        paper: {
            title: 'PAPER',
            img: 'assets/paper.png',
            class: 'card-paper'
        },
        scissors: {
            title: 'SCISSORS',
            img: 'assets/scissors.png',
            class: 'card-scissors'
        }
    };

    const rules = {
        stone: 'scissors',   // Stone beats scissors
        paper: 'stone',      // Paper beats stone
        scissors: 'paper'    // Scissors beats paper
    };

    function playRound(playerChoice) {
        if (isRoundActive) return;
        isRoundActive = true;

        // Play click & shuffle sounds
        playSound.click();
        
        // 1. Highlight chosen card and disable all cards
        choiceCards.forEach(card => {
            card.classList.add('disabled');
            if (card.dataset.choice === playerChoice) {
                card.classList.add('selected-active');
            }
        });

        // 2. Start computer card shuffle animation
        computerCard.classList.add('shaking');
        resultText.classList.remove('win', 'lose', 'draw');
        resultText.textContent = 'VS';
        
        // Play ambient shuffle sound
        playSound.shuffle();

        // 3. Anticipation delay (1200ms)
        setTimeout(() => {
            // Stop shake
            computerCard.classList.remove('shaking');
            
            // Determine computer choice
            const randIndex = Math.floor(Math.random() * choices.length);
            const computerChoice = choices[randIndex];
            
            // Load computer choice details into computer card front side
            const meta = choiceMeta[computerChoice];
            computerIllustration.src = meta.img;
            computerTitle.textContent = meta.title;
            
            // Stylize the computer card front border color based on the selected choice
            const frontSide = computerCard.querySelector('.card-front');
            // Reset existing themes
            frontSide.classList.remove('card-stone', 'card-paper', 'card-scissors');
            frontSide.classList.add(meta.class);
            
            // Flip computer card
            computerCard.classList.add('flipped');

            // 4. Calculate round result
            determineWinner(playerChoice, computerChoice);
            
            // 5. End round cooldown - reset after 3 seconds
            setTimeout(() => {
                resetRoundUI();
            }, 2800);
            
        }, 1200);
    }

    function determineWinner(player, computer) {
        let statusText = '';
        let statusClass = '';

        if (player === computer) {
            statusText = 'DRAW';
            statusClass = 'draw';
            playSound.draw();
        } else if (rules[player] === computer) {
            statusText = 'YOU WIN!';
            statusClass = 'win';
            playerScore++;
            bumpScoreboard(playerScoreEl, playerScore);
            playSound.win();
        } else {
            statusText = 'GARDEN WINS';
            statusClass = 'lose';
            computerScore++;
            bumpScoreboard(computerScoreEl, computerScore);
            playSound.lose();
        }

        // Save to Local Storage
        localStorage.setItem('garden_player_score', playerScore);
        localStorage.setItem('garden_computer_score', computerScore);

        // Update Wreath text box
        resultText.textContent = statusText;
        resultText.classList.add(statusClass);
    }

    function bumpScoreboard(element, newValue) {
        element.classList.add('bump');
        setTimeout(() => {
            element.textContent = newValue;
        }, 150);
        setTimeout(() => {
            element.classList.remove('bump');
        }, 400);
    }

    function resetRoundUI() {
        // Flip computer card back
        computerCard.classList.remove('flipped');
        
        // Re-enable choice cards
        choiceCards.forEach(card => {
            card.classList.remove('disabled', 'selected-active');
        });
        
        // Reset Wreath Text
        resultText.classList.remove('win', 'lose', 'draw');
        resultText.textContent = 'RESULT';
        
        isRoundActive = false;
    }

    // ==========================================
    // Event Listeners
    // ==========================================
    choiceCards.forEach(card => {
        card.addEventListener('click', () => {
            const choice = card.dataset.choice;
            playRound(choice);
        });
    });

    resetButton.addEventListener('click', () => {
        if (isRoundActive) return;
        
        // Reset scores
        playerScore = 0;
        computerScore = 0;
        
        localStorage.setItem('garden_player_score', 0);
        localStorage.setItem('garden_computer_score', 0);
        
        // Play reset sound
        playSound.reset();
        
        // Animate elements reset
        bumpScoreboard(playerScoreEl, 0);
        bumpScoreboard(computerScoreEl, 0);
        
        resultText.classList.add('draw');
        resultText.textContent = 'RESET!';
        setTimeout(() => {
            resultText.classList.remove('draw');
            resultText.textContent = 'RESULT';
        }, 1200);
    });
});
