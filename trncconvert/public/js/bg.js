// =============================================
// TRNCConvert — Vivid Background System
// Meteor trails, pulsing nebula, constellation net,
// mouse-reactive aurora waves
// =============================================

(function () {
    var canvas = document.getElementById("bgCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    var W, H;
    var mouse = { x: -9999, y: -9999, active: false };
    var time = 0;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    document.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    document.addEventListener("mouseleave", function () {
        mouse.active = false;
    });

    // ---- COLOR PALETTE ----
    var C = {
        cyan:    function(a) { return "rgba(0,229,200," + a + ")"; },
        emerald: function(a) { return "rgba(0,210,140," + a + ")"; },
        blue:    function(a) { return "rgba(60,140,255," + a + ")"; },
        purple:  function(a) { return "rgba(140,80,255," + a + ")"; },
        pink:    function(a) { return "rgba(255,60,140," + a + ")"; },
        white:   function(a) { return "rgba(255,255,255," + a + ")"; }
    };

    // ---- 1. STARS (twinkling background) ----
    var stars = [];
    var STAR_COUNT = 120;

    function initStars() {
        stars = [];
        for (var i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.2 + 0.3,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.005,
                baseAlpha: Math.random() * 0.5 + 0.2
            });
        }
    }
    initStars();
    window.addEventListener("resize", initStars);

    function drawStars() {
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var twinkle = Math.sin(time * s.speed * 60 + s.phase);
            var a = s.baseAlpha + twinkle * 0.25;
            if (a < 0.05) a = 0.05;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r + twinkle * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = C.white(a);
            ctx.fill();
        }
    }

    // ---- 2. NEBULA CLOUDS (slow morphing) ----
    function drawNebula() {
        var cx1 = W * 0.3 + Math.sin(time * 0.3) * 80;
        var cy1 = H * 0.25 + Math.cos(time * 0.2) * 60;
        var r1 = 250 + Math.sin(time * 0.4) * 50;

        var g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, r1);
        g1.addColorStop(0, C.cyan(0.04));
        g1.addColorStop(0.5, C.emerald(0.02));
        g1.addColorStop(1, "transparent");
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, W, H);

        var cx2 = W * 0.7 + Math.cos(time * 0.25) * 100;
        var cy2 = H * 0.7 + Math.sin(time * 0.35) * 70;
        var r2 = 300 + Math.cos(time * 0.3) * 60;

        var g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
        g2.addColorStop(0, C.blue(0.035));
        g2.addColorStop(0.4, C.purple(0.02));
        g2.addColorStop(1, "transparent");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, W, H);

        // Third smaller accent cloud
        var cx3 = W * 0.5 + Math.sin(time * 0.5) * 120;
        var cy3 = H * 0.5 + Math.cos(time * 0.4) * 80;
        var r3 = 180 + Math.sin(time * 0.6) * 40;

        var g3 = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, r3);
        g3.addColorStop(0, C.pink(0.02));
        g3.addColorStop(1, "transparent");
        ctx.fillStyle = g3;
        ctx.fillRect(0, 0, W, H);
    }

    // ---- 3. CONSTELLATION NET (particles + connections) ----
    var nodes = [];
    var NODE_COUNT = 50;
    var CONNECT_DIST = 160;
    var MOUSE_RADIUS = 250;

    function initNodes() {
        nodes = [];
        for (var i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                r: Math.random() * 2 + 0.8,
                hue: Math.random() > 0.5 ? 0 : 1, // 0=cyan, 1=emerald
                baseAlpha: Math.random() * 0.4 + 0.15,
                alpha: 0
            });
        }
    }
    initNodes();
    window.addEventListener("resize", initNodes);

    function updateNodes() {
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < -20) n.x = W + 20;
            if (n.x > W + 20) n.x = -20;
            if (n.y < -20) n.y = H + 20;
            if (n.y > H + 20) n.y = -20;

            var targetAlpha = n.baseAlpha;

            if (mouse.active) {
                var dx = n.x - mouse.x;
                var dy = n.y - mouse.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS && dist > 0) {
                    var force = (1 - dist / MOUSE_RADIUS);
                    n.vx += (dx / dist) * force * 0.2;
                    n.vy += (dy / dist) * force * 0.2;
                    targetAlpha = n.baseAlpha + force * 0.6;
                }
            }

            n.alpha += (targetAlpha - n.alpha) * 0.08;
            n.vx *= 0.993;
            n.vy *= 0.993;
        }
    }

    function drawNodes() {
        // Connections
        for (var i = 0; i < nodes.length; i++) {
            for (var j = i + 1; j < nodes.length; j++) {
                var dx = nodes[i].x - nodes[j].x;
                var dy = nodes[i].y - nodes[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DIST) {
                    var lineAlpha = (1 - dist / CONNECT_DIST) * 0.1;

                    if (mouse.active) {
                        var mx = (nodes[i].x + nodes[j].x) / 2;
                        var my = (nodes[i].y + nodes[j].y) / 2;
                        var md = Math.sqrt((mx - mouse.x) * (mx - mouse.x) + (my - mouse.y) * (my - mouse.y));
                        if (md < MOUSE_RADIUS) {
                            lineAlpha += (1 - md / MOUSE_RADIUS) * 0.2;
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = C.cyan(lineAlpha);
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        // Mouse threads
        if (mouse.active) {
            for (var i = 0; i < nodes.length; i++) {
                var dx = nodes[i].x - mouse.x;
                var dy = nodes[i].y - mouse.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS) {
                    var a = (1 - dist / MOUSE_RADIUS) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(nodes[i].x, nodes[i].y);
                    ctx.strokeStyle = C.emerald(a);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Dots
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = n.hue === 0 ? C.cyan(n.alpha) : C.emerald(n.alpha);
            ctx.fill();

            // Glow ring on bright nodes
            if (n.alpha > 0.4) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
                ctx.strokeStyle = n.hue === 0 ? C.cyan((n.alpha - 0.4) * 0.3) : C.emerald((n.alpha - 0.4) * 0.3);
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    // ---- 4. SHOOTING STARS / METEORS ----
    var meteors = [];

    function spawnMeteor() {
        if (meteors.length > 4) return;
        if (Math.random() > 0.008) return; // ~0.8% chance per frame

        var startX = Math.random() * W * 0.8;
        var startY = Math.random() * H * 0.3;
        var angle = Math.PI * 0.15 + Math.random() * 0.2;
        var speed = 4 + Math.random() * 4;

        meteors.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.012 + Math.random() * 0.008,
            len: 40 + Math.random() * 60,
            width: 1 + Math.random() * 1.5,
            color: Math.random() > 0.3 ? 0 : 1 // 0=cyan, 1=white
        });
    }

    function updateMeteors() {
        for (var i = meteors.length - 1; i >= 0; i--) {
            var m = meteors[i];
            m.x += m.vx;
            m.y += m.vy;
            m.life -= m.decay;
            if (m.life <= 0 || m.x > W + 100 || m.y > H + 100) {
                meteors.splice(i, 1);
            }
        }
    }

    function drawMeteors() {
        for (var i = 0; i < meteors.length; i++) {
            var m = meteors[i];
            var tailX = m.x - (m.vx / Math.sqrt(m.vx * m.vx + m.vy * m.vy)) * m.len;
            var tailY = m.y - (m.vy / Math.sqrt(m.vx * m.vx + m.vy * m.vy)) * m.len;

            var grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            var headColor = m.color === 0 ? C.cyan(m.life * 0.8) : C.white(m.life * 0.8);
            grad.addColorStop(0, headColor);
            grad.addColorStop(1, "transparent");

            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = m.width;
            ctx.lineCap = "round";
            ctx.stroke();

            // Bright head dot
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.width + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = C.white(m.life * 0.9);
            ctx.fill();
        }
    }

    // ---- 5. AURORA WAVE (mouse-following) ----
    function drawAurora() {
        if (!mouse.active) return;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        for (var wave = 0; wave < 3; wave++) {
            ctx.beginPath();
            var yBase = mouse.y + (wave - 1) * 30;
            var amp = 20 + wave * 10;
            var freq = 0.008 - wave * 0.001;
            var phaseOff = wave * 1.2;

            ctx.moveTo(0, yBase);
            for (var x = 0; x <= W; x += 4) {
                var distFromMouse = Math.abs(x - mouse.x);
                var influence = Math.max(0, 1 - distFromMouse / 350);
                var y = yBase + Math.sin(x * freq + time * 2 + phaseOff) * amp * influence;
                ctx.lineTo(x, y);
            }

            var colors = [C.cyan, C.emerald, C.blue];
            ctx.strokeStyle = colors[wave](0.06 + wave * 0.01);
            ctx.lineWidth = 2 - wave * 0.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    // ---- 6. MOUSE GLOW ----
    function drawMouseGlow() {
        if (!mouse.active) return;

        var pulse = Math.sin(time * 3) * 0.5 + 0.5;

        // Soft radial glow
        var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120 + pulse * 30);
        g.addColorStop(0, C.cyan(0.04 + pulse * 0.02));
        g.addColorStop(0.5, C.emerald(0.015));
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - 180, mouse.y - 180, 360, 360);

        // Pulsing ring
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 25 + pulse * 15, 0, Math.PI * 2);
        ctx.strokeStyle = C.cyan(0.06 + pulse * 0.03);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // ---- MAIN LOOP ----
    function animate() {
        time += 0.016;
        ctx.clearRect(0, 0, W, H);

        drawNebula();
        drawStars();
        spawnMeteor();
        updateMeteors();
        drawMeteors();
        updateNodes();
        drawNodes();
        drawAurora();
        drawMouseGlow();

        requestAnimationFrame(animate);
    }

    setTimeout(animate, 150);
})();
