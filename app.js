/* jshint browser: true */
/**
 * ACIIMirror
 * Carlos De Oliveira cardeol@gmail.com
 * 
 */

 (function() {
    'use strict';
 })();

var crcTable = [
    0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5,
    0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b,
    0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
    0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
    0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c,
    0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
    0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b,
    0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
    0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
    0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738,
    0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5,
    0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
    0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969,
    0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96,
    0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
    0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
    0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03,
    0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
    0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6,
    0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
    0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
    0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb,
    0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1,
    0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
    0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c,
    0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2,
    0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
    0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
    0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447,
    0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
    0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2,
    0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
    0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
    0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827,
    0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c,
    0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
    0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0,
    0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d,
    0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
    0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
    0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba,
    0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
    0x2e93, 0x3eb2, 0x0ed1, 0x1ef0];


function crc16(s) { // crc16 fast version
    var crc = 0xFFFF;
    var j, i, c;
    for (i = 0; i < s.length; i++) {
        c = s.charCodeAt(i);
        if (c > 255) continue;
        j = (c ^ (crc >> 8)) & 0xFF;
        crc = crcTable[j] ^ (crc << 8);
    }
    return ((crc ^ 0) & 0xFFFF);
}

function checkMobile() {    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);    
}

function Matrix(sizeX,sizeY) {
    
    this.mtc = {}; // coordinates in O(1)
    var i, j, matrixChars = "#£&%R38@0€".split("");    
    var maxStep = 6;

    this.init = function (x, y) {
        this.mtc = {};        
        this.mtc.mw = x;
        this.mtc.mh = y;
        for (j = 0; j < y; j++) {
            for (i = 0; i < x; i++) {
                if (j == 0) {
                    this.mtc[crc16(i + ".step")]  = this.getStep();
                    this.mtc[crc16(i + ".pos")]   = this.getStep() * 4;
                    this.mtc[crc16(i + ".count")] = 0;
                    this.mtc[crc16(i + ".maxt")]  = this.getMaxT();
                }
                this.mtc[i + ',' +j] = null;
            }
        }        
        if(x>70) maxStep = 6;
        if(x>80) maxStep = 3;
    };

    this.getChar = function(n) {
        if(n) {
            return matrixChars[ n % matrixChars.length];
        }
        return matrixChars[Math.floor(Math.random() * matrixChars.length)];
    };

    this.getMaxT = function () {
        return Math.floor(Math.random() * 6) + 3;
    };

    this.getStep = function () {
        return Math.floor(Math.random() * maxStep) + 1;
    };

    this.get = function(x,y) {
        if(this.mtc[crc16(x + "," + y)]) return this.mtc[crc16(x + "," + y)];
        return null;
    };
   
    this.step = function () {
        var count;
        var pos;
        var step;
        var c;
        var maxt;
        for (i = 0; i < this.mtc.mw; i++) {
            count = this.mtc[crc16(i + ".count")];
            pos = this.mtc[crc16(i + ".pos")];
            step = this.mtc[crc16(i + ".step")];
            maxt = this.mtc[crc16(i + ".maxt")];
            if (count++ > step) {
                count = 0;
                pos++;
            }
            if (pos > this.mtc.mh + maxt) {
                pos = this.getStep() * 4;
                count = 0;
                step = this.getStep();
                maxt = this.getMaxT();
            }
            this.mtc[crc16(i + ".count")] = count;
            this.mtc[crc16(i + ".step")] = step;
            this.mtc[crc16(i + ".pos")] = pos;
            this.mtc[crc16(i + ".maxt")] = maxt;
            for (j = 0; j < this.mtc.mh; j++) {
                c = null;
                if (j < pos && j >= pos - maxt) {
                    c = Math.floor(((maxt + 1) - (pos - j)) * 9 / maxt);
                }
                if (j == pos) c = "*";
                this.mtc[crc16(i + ','+ j)] = c
            }
        }
    }
    this.init(sizeX,sizeY);
};

function ASCIIMirror() {
    
    var charList = [
        ("#WKDGLftji+;,:. ").split("")       
    ];   

    var i = 0;
    var DISPLAY_MODE = {
        "Default": i++,
        "TextInColor": i++,
        "Classic": i++,
        "Hercules": i++,
        "MSDOS": i++,
        "BackColor": i++,
        "Matrix" : i++,
        "Inverted": i++
    };

    var FONT_TYPE = {
        "Inconsolata": i++,
        "Lucida": i++,
        "Monaco": i++,
        "Monospace": i++,
        "Terminal": i++
    };
    
    this.Alpha = 1.0;
    this.charPalette = 0;
    this.displayMode = DISPLAY_MODE.Default;
    this.FontFamily = FONT_TYPE.Inconsolata;
    this.BoldFont = true;
    this.horizontalFlip = true;
    this.winSize = 0.7;
    this.terminalSize = checkMobile() ? 55 : 80;
    this.fpsHandler = null;

    var lastState = null;
    var tcanvas = null;
    var fps = 0;    
    var imgcanvas = null;
    var p = {};
    var matrix;    
    
    var display = {
        width: 0,
        height: 0
    };

    var terminal = {
        width: this.terminalSize,
        height: 0
    };
    
    var fpsTimestamp = 0;
    var divWarning;
    var warningMessage = 'This site uses the webcam for rendering. Please Enable it and reload the page. Google Chrome recommended.';

    var container;
    var video_elem;
    var video_context;
    var g_ctx = null;
    var fontsize;
    
    var video_ratio = 1.3;
    var self;
    var isStreaming = false;
    var selfId = "0";
    var img_cache = {};
    
    var signature =["      _            __ __         _                      ",
                    "     /_\\  ___  ___(_ | _)  /\\/\\ (_)_ __ _ __ ___  _ __ ",
                    "    //_\\\\/ __|/  __| | |  /    \\| | '__| '__/ _ \\| '__|",
                    "   /  _  \\__ \\  (__| | | / /\\/\\ \\ | |  | | | (_) | |   ",
                    "   \\_/ \\_/___/\\____|_|_| \\/    \\/_|_|  |_|  \\___/|_|   ",
                    "   by: Carlos De Oliveira"];
    
    var task = null;

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    this.checksum = function(s) {
        var chk = 0x12345678;
        for (var i = 0; i < s.length; i++) chk += (s.charCodeAt(i) * (i + 1));
        return (chk & 0xffffffff).toString(16);
    };

    this.getDisplayModes = function() {
        return DISPLAY_MODE;
    };

    this.getFontTypes = function() {
        return FONT_TYPE;
    };

    this.toHex = function(r,g,b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    this.toInverseHex = function(r,g,b) {
        return '#' + componentToHex(255 - r) + componentToHex(255 - g) + componentToHex(255 - b);
    };

    this.resizeHandler = function(event) {        
        var menusize = document.getElementById("menubar").offsetHeight + 10; 
        var mw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var mh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - menusize;
        display.height = Math.ceil(Math.min(mw, mh) * (checkMobile() ? 1 : 0.9));                
        fontsize = display.height / terminal.height;     
        display.width = Math.ceil(terminal.width * fontsize);
        container.style.width = display.width + "px";
        container.style.height = display.height + "px";        
        self.generateCanvas();
    };

       
    this.generateCanvas = function() {        
        if(imgcanvas !== null) imgcanvas.remove();
        imgcanvas = document.createElement("canvas");        
        imgcanvas.width = display.width;
        imgcanvas.height = display.height;        
        container.insertBefore(imgcanvas, container.firstChild);
        g_ctx = imgcanvas.getContext("2d");
        g_ctx.textBaseline = 'middle';
        g_ctx.textAlign = "center";
        g_ctx.font = self.getFont();
    };

    this.getFont = function() {
        var f = {};        
        f[FONT_TYPE.Inconsolata] = "Inconsolata";
        f[FONT_TYPE.Lucida] = "Lucida Console";
        f[FONT_TYPE.Monaco] = "Monaco";
        f[FONT_TYPE.Monospace] ="Monospace";
        f[FONT_TYPE.Terminal] = "Terminal";
        var fsize = Math.floor(fontsize * 1);
        var ret = [f[self.FontFamily], fsize + "px"];
        if(self.BoldFont) ret.push("Bold");        
        return ret.reverse().join(" ");
    };

    this.setTerminal = function () {
        this.terminalSize = Math.floor(this.terminalSize);
        terminal.height = Math.floor(this.terminalSize / video_ratio);
        terminal.width = Math.floor(terminal.height * video_ratio);
        oldterminal = self.terminalSize;
        matrix = new Matrix(Math.floor(terminal.width / 3), terminal.height);
        tcanvas.width = terminal.width;
        tcanvas.height = terminal.height;
        tcanvas.style.display = "none";
        video_context = tcanvas.getContext("2d");
        for (var k in img_cache) delete img_cache[k]; 
    };

 
    this.getVideoFrame = function() {
        video_context.drawImage(video_elem, 0, 0, terminal.width, terminal.height);
        return video_context.getImageData(0, 0, terminal.width, terminal.height).data;
    };

    this.getLuminance = function(r,g,b) {
        return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
        //return Math.round(0.299 * r + 0.587 * g + 0.114 * b);                
    };

    this.drawChar = function (c,ci, currentState) {
        var cKey,bgColor, foreColor, ma, mc;
        var a = this.alpha;
        var cx = (p.x * fontsize) + (fontsize / 2); 
        var cy = ((p.y * fontsize) + (fontsize / 2));        
        var cacheLoop = Math.floor(this.terminalSize  / 12);
        
        foreColor = 'rgba(' + p.lum + ',' + p.lum + ',' + p.lum + ',' + this.Alpha + ')';
        bgColor = "#FFFFFF";

        if (this.displayMode == DISPLAY_MODE.Matrix) {         
            if (p.x == 0 && p.y == 0) matrix.step();
            c = ci;   
            bgColor = "#000000";                        
            //foreColor = "#31FF00";
            foreColor = this.toHex(0, p.lum, 0);
            mc = matrix.get(p.x / 3, p.y);            
            if (p.x % 3 == 0 && mc !== null) {
                c = mc;
                if (mc == "*") {                                        
                    foreColor = "#00FF00";
                    c = matrix.getChar();                    
                } else {
                    ma = mc * 0.2;
                    foreColor = 'rgba(0,255,0,' + ma + ')';
                    c = matrix.getChar(p.y);                                        
                }   
            } 
        }
        
        if (this.displayMode == DISPLAY_MODE.BackColor) {
            foreColor = bgColor;
            bgColor = this.toHex(p.r, p.g, p.b);
            c = ci;
        } 

        if (this.displayMode == DISPLAY_MODE.Inverted) {
            foreColor = bgColor;
            bgColor = this.toHex(p.r, p.g, p.b);
            c = ci;
        } 

        if (this.displayMode == DISPLAY_MODE.TextInColor) {
            foreColor = this.toHex(p.r, p.g, p.b);
        }

        if (this.displayMode == DISPLAY_MODE.Classic) {
            foreColor = '#000000';            
        }

        if (this.displayMode == DISPLAY_MODE.Hercules) {
            foreColor = '#FF7F00';
            // foreColor = foreColor = this.toHex(255, Math.round((p.r + p.g + p.g) / 6), 0);
            bgColor = '#000000';
            c = ci;
        }

        if (this.displayMode == DISPLAY_MODE.MSDOS) {
            foreColor = '#FFFFFF';
            bgColor = '#0000FF';
            c = ci;
        }

        if (this.displayMode == DISPLAY_MODE.Inverted) {
            bgColor = "#000000";
            foreColor = this.toHex(p.r, p.g, p.b);
            c = ci;
        }

        cKey = crc16([c, foreColor, bgColor].join(".")); 

        if (img_cache[cKey]) return --img_cache[cKey]; else img_cache[cKey] = cacheLoop;

        if (lastState != currentState) {
            for(var k in img_cache) delete img_cache[k]; 
            g_ctx.fillStyle = bgColor;
            g_ctx.fillRect(0, 0, display.width, display.height);
            lastState = currentState;
        }

        g_ctx.fillStyle = bgColor;
        g_ctx.fillRect(p.x * fontsize, p.y * fontsize, fontsize, fontsize); 
        g_ctx.fillStyle = foreColor;
        g_ctx.fillText(c, cx, cy); 
    };

    this.getState = function() {
        return crc16([ this.terminalSize, this.FontFamily, this.BoldFont, this.displayMode ].join("."));
    };

    this.ProcessImage = function() {          
        var x, y, iOffset, cIndex, cData, cslength, c, ci;
        var charSet = charList[self.charPalette];
        var currentState = this.getState();

        var now = Math.floor(new Date().getTime() / 1000);
        fps++;        
        if (now != fpsTimestamp) {
            fpsTimestamp = now;
            if(this.fpsHandler) this.fpsHandler(Math.round(fps));
            fps = 0;
        }         
                               
        if(lastState != currentState) {
            this.setTerminal();
            this.resizeHandler();            
        }        
        
        cData = this.getVideoFrame();
        cslength = charSet.length;        

        for (y = 0; y < terminal.height; y++) {
            for (x = 0; x < terminal.width; x++) {
                iOffset = (y * terminal.width + (this.horizontalFlip ? terminal.width - x - 1: x)) * 4;
                p.x = x;
                p.y = y;
                p.r = cData[iOffset];
                p.g = cData[iOffset + 1];
                p.b = cData[iOffset + 2];
                p.alpha = cData[iOffset + 3];                
                p.lum = this.getLuminance(p.r, p.g, p.b);
                cIndex = Math.round((p.lum / 255) * (cslength - 1));                   
                c = charSet[cIndex]; 
                ci = charSet[cslength - 1 - cIndex];                              
                self.drawChar(c, ci, currentState);                  
            }
        }     
                       
        return true;
    };

    var render = function(t) {                
        self.ProcessImage();        
        task = window.requestAnimationFrame(render);
    };

    var playHandler = function (ev) {
            if(divWarning) divWarning.remove();
            divWarning = null;
            video_ratio = video_elem.videoWidth / video_elem.videoHeight;            
            self.setTerminal();
            console.log(signature.join("\n"));
            self.resizeHandler();                      
            self.startStop();                        
    };

    this.init = function(){
        var video_options = { video: true };
        self = this;                
        divWarning = document.createElement("div");
        divWarning.className = "warningMessage";
        divWarning.innerHTML = warningMessage;
        
        selfId = "ascii_" + new Date().getTime();        
        container = document.createElement("div");
        container.id = selfId + "_container";
        container.className = "asciicontainer";
        document.body.insertBefore(container, document.body.firstChild);        
        video_elem = document.getElementById("ascii_videoin");
        tcanvas = document.getElementById("ascii_tcanvas");
        
        if(video_elem == null) {
            video_elem = document.createElement("video");    
            video_elem.id = "ascii_videoin";
            video_elem.style.display = "none";
            video_elem.id = "ascii_videoin";
            video_elem.style.display = "none";            
        }

        if (tcanvas == null) {
            tcanvas = document.createElement("canvas");
            tcanvas.id = "ascii_tcanvas";
            tcanvas.style.display = "none";                     
        }

        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(video_options)
            .then(function(stream) {
               video_elem.srcObject = stream;
               video_elem.onloadedmetadata = playHandler;
            })
            .catch(function(err) {
                window.alert('Please enable your webcam');
                return;
            });
        } else {
            // fallback other browsers
            try {
                navigator.getUserMedia =
                    navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;
            } catch (e) {
                window.alert('Browser not compatible with WebVideo');
                return;
            }        
            if (navigator.getUserMedia) {
                navigator.getUserMedia(video_options, function (stream) {
                    video_elem.srcObject = stream;
                }, function (e) {
                    window.alert('Please enable your webcam');
                    return;
                });
            } else {
                window.alert('getUserMedia Error');
                return;
            }    
            video_elem.addEventListener('canplay', playHandler, false);
        }

        setTimeout(function() {
            if(divWarning) document.body.appendChild(divWarning);
        }, 5000);
        // resize events
        window.addEventListener('resize', self.resizeHandler, true);        
        if("onorientationchange" in window) {
            window.addEventListener('onorientationchange', self.resizeHandler, false);        
        }
    };

    this.onFpsChange = function(callback) {
        this.fpsHandler = callback;
    };

    this.startStop = function() {
        if(!isStreaming) {
            isStreaming = true;
            video_elem.play();
            task = requestAnimationFrame(render);
        } else {
            video_elem.pause();
            cancelAnimationFrame(task);
            isStreaming = false;
        }
    };

    this.saveImage = function() {
        var f = "ascii_img_" + new Date().getTime() + ".jpeg";
        var e = document.createElement("a");
        e.setAttribute("href", imgcanvas.toDataURL("image/jpeg"));
        e.setAttribute("download", f);
        e.click();
    };

    this.init();
}

window.onload = function() {
    var mirror = new ASCIIMirror();
    var gui = new dat.GUI({ autoPlace: false });
    var datContainer = document.getElementById("dat-container");
    var elemfps = document.getElementById("elemfps");
    mirror.onFpsChange(function(data) {
        elemfps.innerHTML = data + " fps";
    });  
    datContainer.appendChild(gui.domElement);
    
    gui.add(mirror, "terminalSize", 40, 120);
    gui.add(mirror, "FontFamily", mirror.getFontTypes());
    gui.add(mirror, "BoldFont");
    gui.add(mirror, "displayMode", mirror.getDisplayModes());    
    gui.add(mirror, "horizontalFlip");
    gui.add(mirror,"saveImage");
    gui.add(mirror,"startStop");
    if (checkMobile()) {
        gui.close();
    }    
};