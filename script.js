(function () {
    var cursor = document.getElementById('cursor');
    var consoleLines = document.getElementById('consoleLines');

    // ---------- Cursor blink ----------
    var cursorHidden = false;
    var cursorBlinkInterval = setInterval(function () {
        if (!cursor) return;
        if (cursorHidden) {
            cursor.textContent = '_';
            cursor.style.color = '#00FF00';
            cursorHidden = false;
        } else {
            cursor.textContent = '⠀';
            cursor.style.color = '#111111';
            cursorHidden = true;
        }
    }, 500);

    // ---------- Terminal state ----------
    var enterCount = 0;
    var lineCount = 0;
    var messagePlaying = false;
    var meltdownActive = false;
    var prevMessageId = 'greeting';

    function newLine(isOutput) {
        messagePlaying = true;
        lineCount += 1;

        consoleLines.appendChild(document.createElement('br'));

        var wrapper = document.createElement('span');
        wrapper.id = 'wrapper' + lineCount;
        if (!isOutput) {
            wrapper.appendChild(document.createTextNode('$ '));
            if (cursor) cursor.style.display = 'inline';
        } else if (cursor) {
            cursor.style.display = 'none';
        }
        var message = document.createElement('span');
        message.id = 'message' + lineCount;
        wrapper.appendChild(message);
        consoleLines.appendChild(wrapper);

        if (cursor && !isOutput) wrapper.appendChild(cursor);

        if (lineCount > 1) {
            var prev = document.getElementById(prevMessageId);
            if (prev) {
                var space = document.createElement('span');
                space.className = 'endspace';
                space.textContent = '⠀';
                prev.appendChild(space);
            }
        }

        prevMessageId = 'message' + lineCount;
    }

    function typeMessage(message, callback) {
        var i = 0;
        function step() {
            var ch = message.charAt(i);
            var delay = 40;
            if (ch === ' ') delay = 50;
            else if (ch === '/') delay = 70;
            else if (ch === '-') delay = 60;
            else if (ch === '.') delay = 120;
            else if (ch === ',') delay = 200;

            var el = document.getElementById('message' + lineCount);
            if (el) el.append(ch);
            i += 1;
            if (i < message.length) {
                setTimeout(step, delay);
            } else {
                messagePlaying = false;
                if (callback) callback();
            }
        }
        step();
    }

    function outputLine(text, callback) {
        newLine(true);
        var el = document.getElementById('message' + lineCount);
        if (el) el.textContent = text;
        messagePlaying = false;
        if (callback) setTimeout(callback, 80);
    }

    function fadeRemove(selector, callback) {
        var el = document.querySelector(selector);
        if (!el) { if (callback) callback(); return; }
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-4px)';
        setTimeout(function () {
            el.remove();
            if (callback) callback();
        }, 320);
    }

    // ---------- Easter egg: realistic meltdown ----------
    function startMeltdown() {
        meltdownActive = true;

        // 1. Sudo prompt
        outputLine('[sudo] password for menear: ', function () {
            // Pretend to type 4 password dots
            var msg = document.getElementById('message' + lineCount);
            var dots = 0;
            (function dotStep() {
                if (dots >= 4) {
                    setTimeout(showPreserveRootError, 600);
                    return;
                }
                if (msg) msg.append('*');
                dots += 1;
                setTimeout(dotStep, 180);
            })();
        });
    }

    function showPreserveRootError() {
        outputLine("rm: it is dangerous to operate recursively on '/'", function () {
            outputLine("rm: use --no-preserve-root to override this failsafe", function () {
                setTimeout(function () {
                    newLine(false);
                    typeMessage('sudo rm -rf / --no-preserve-root', function () {
                        setTimeout(beginRemoval, 700);
                    });
                }, 1100);
            });
        });
    }

    function beginRemoval() {
        var steps = [
            { line: "removed '/var/www/menear.dev/about.html'", selector: '#about' },
            { line: "removed '/var/www/menear.dev/work/' (recursive)", selector: '#work' },
            { line: "removed '/var/www/menear.dev/experience.timeline'", selector: '#experience' },
            { line: "removed '/var/www/menear.dev/stack.toml'", selector: '#stack' },
            { line: "removed '/var/www/menear.dev/contact.json'", selector: '#contact' },
            { line: "removed '/etc/nginx/sites-enabled/menear.dev'", selector: '.site-footer' },
            { line: "removed '/etc/hosts'", selector: '.topnav' }
        ];

        var idx = 0;
        function nextStep() {
            if (idx >= steps.length) {
                setTimeout(finalize, 600);
                return;
            }
            var step = steps[idx++];
            outputLine(step.line, function () {
                fadeRemove(step.selector, function () {
                    setTimeout(nextStep, 280);
                });
            });
        }
        nextStep();
    }

    function finalize() {
        clearInterval(cursorBlinkInterval);
        if (cursor) cursor.style.display = 'none';

        setTimeout(function () {
            outputLine('bash: /bin/bash: No such file or directory', function () {
                setTimeout(function () {
                    outputLine('Connection to menear.dev closed.', function () {
                        setTimeout(function () {
                            window.location.replace('https://www.linkedin.com/in/dmenear/');
                        }, 1600);
                    });
                }, 900);
            });
        }, 400);
    }

    // ---------- Easter egg: Konami code → brickbreaker ----------
    var konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                  'b', 'a'];
    var konamiPos = 0;

    // ---------- Single keydown listener ----------
    document.body.addEventListener('keydown', function (e) {
        if (meltdownActive) return;

        // Konami progression
        var expected = konami[konamiPos];
        var key = e.key;
        if (key && key.toLowerCase() === expected.toLowerCase()) {
            konamiPos += 1;
            if (konamiPos === konami.length) {
                konamiPos = 0;
                window.location.href = 'brickbreaker/';
                return;
            }
        } else {
            // Reset, but allow the first key of the sequence to start fresh
            konamiPos = (key && key.toLowerCase() === konami[0].toLowerCase()) ? 1 : 0;
        }

        // Enter handler
        if (e.key !== 'Enter') return;
        if (messagePlaying) return;

        enterCount += 1;
        if (enterCount === 1) {
            newLine(false);
            typeMessage('sudo rm -rf /', null);
        } else if (enterCount === 2) {
            setTimeout(startMeltdown, 500);
        }
    });
})();
