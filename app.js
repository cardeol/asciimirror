"use strict";
var Utils = (function() {
    var methods = {
        "extend": function extend(a, b) {
            for(var key in b)
                if(b.hasOwnProperty(key))
                    a[key] = b[key];
            return a;        
        },
        hasClass: function(el, name) {
           return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
        },
        addClass: function(el, name)
        {
           if (!methods.hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
        },
        removeClass: function(el, name)
        {
           if (methods.hasClass(el, name)) {
              el.className=el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
           }
        }
    };
    return methods;
})();


(function() {
    var canvas = document.getElementById("q"),
    ctx = canvas.getContext('2d');
    var elemLeft;
    var elemTop;
    var defaultOptions = {
        iScale: 2,
        opt_motion: false,
        opt_block: false,
        opt_invert: false,
        opt_color: true,
        opt_matrix: false,
        width: 640,
        height: 480,
        fLetterSpacing: 0,
        strResolution: 'low',
        pause: false,
        refresh_rate: 0,
        restart: false        
    };
    
    // permanent objects
    var options, width, height;
    var defCharList = (" .:,;+ijtfLGDKW#").split("");
    var matrixMiddleCharLists = [(" .,:;i1tfLCG08").split(""), (" _,-;i1tPTEB0D").split("")];        
    var matrixBeginCharList = [String.fromCharCode(0x30D9), String.fromCharCode(0x30DA), String.fromCharCode(0x30DB), String.fromCharCode(0x30DB)];    
    var oCanvas = document.createElement("canvas");
    var oCtx = oCanvas.getContext("2d");        
    var aDefaultColorCharList = (" CGO08@").split("");
    var currentBackColor = '#FFFFFF';
    var video = document.getElementById('v');
    var fResolution;
    var imgHash = {};
    var matrixThreads = [];
    
    var elements = [];
    
    var offset = 15;
    for(var key in defaultOptions) {        
        if(key.indexOf("opt_")==0) {
            elements.push({
                colour: '#EEEEEE',
                id: key,
                width: 150,
                height: 30,
                left: offset,
                top: 20,
                state: defaultOptions[key]
            });        
            offset+=160;
        }
    };

    // listeners
    window.addEventListener('resize', resize, false);


    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({
            video: true,
            audio: false
        }, function(stream) {
            video.src = window.URL.createObjectURL(stream);
        }, function(e) {
            console.log("ERROR ", e);
        });
    } else {
        video.src = 'somevideo.webm';
    }    

    canvas.addEventListener('click', function(event) {
        var x = event.pageX - elemLeft,
            y = event.pageY - elemTop;
        var iselement = false;
        // Collision detection between clicked offset and element.
        elements.forEach(function(element) {
            if (y > element.top && y < element.top + element.height && x > element.left && x < element.left + element.width) {
                if(element.id.indexOf("opt_")===0) {
                    element.state = !options[element.id];
                    options[element.id] = element.state;
                }
                switch(element.id) {
                    case "opt_motion":
                        options.refresh_rate = element.state ? 250 : 0;
                        break;
                }
                iselement = true;
            }
        });
        if(!iselement) {
            console.log("PAUSE");
            options.pause = !options.pause;
        }
    }, false);

    function resize() {
        canvas.width = (window.innerWidth > 1280) ? 1280 : window.innerWidth;
        canvas.height = (window.innerHeight > 720) ? 720 : window.innerHeight;
        width = parseInt(Math.round(options.width * options.iScale));
        height = parseInt(Math.round(options.height * options.iScale));        
    }
    
    function onInit() {
        options = {};
        options = Utils.extend(options, defaultOptions);                        
        resize();
        elemLeft = canvas.offsetLeft;
        elemTop = canvas.offsetTop;
        fResolution =   options.strResolution == "low" ? 0.30
                      : options.strResolution == "medium" ? 0.40 : 0.7;
        initMatrixThreads();
        if( canvas.getContext ) Render();
    };

     function paint_text(x, y, w, h, text) {
        // The painting properties 
        // Normally I would write this as an input parameter
        var Paint = {
            RECTANGLE_STROKE_STYLE : 'black',
            RECTANGLE_LINE_WIDTH : 1,
            VALUE_FONT : '12px Arial',
            VALUE_FILL_STYLE : 'red'
        }
        
        // Obtains the context 2d of the canvas 
        // It may return null
        
        if (ctx) {
            // draw rectangular
            ctx.strokeStyle=Paint.RECTANGLE_STROKE_STYLE;
            ctx.lineWidth = Paint.RECTANGLE_LINE_WIDTH;
            ctx.strokeRect(x, y, w, h);
            
            // draw text (this.val)
            ctx.textBaseline = "middle";
            ctx.font = Paint.VALUE_FONT;
            ctx.fillStyle = Paint.VALUE_FILL_STYLE;
            // ctx2d.measureText(text).width/2 
            // returns the text width (given the supplied font) / 2
            var textX = x+w/2-ctx.measureText(text).width/2;
            var textY = y+h/2;
            ctx.fillText(text, textX, textY);
        } else {
            // Do something meaningful
        }
    }

    function generateThread(maxHeight) {
        var increment = Math.floor((Math.random() * 8 * fResolution) + 1);
        var index = Math.floor(-(Math.random() * 20 * fResolution));
        return {
            len: Math.floor((Math.random() * maxHeight) + 1),
            increment: increment,
            index: function() {
                return index;
            },
            step: function() {
                index += increment;
                if (index > maxHeight) {
                    index = 0;
                }
            }
        };
    };

    function initMatrixThreads() {
        var totalThreads = options.width * fResolution,
            i = 0;
        console.log(totalThreads);
        matrixThreads = [];
        for (i = 0; i < totalThreads; i++) {
            matrixThreads.push(generateThread(options.height));
        }
        console.log(matrixThreads);
    };

    function drawChar(c, x, y) {
        if (typeof c == "undefined") return;
        var cKey = x + "." + y;
        var old = "h";
        if (imgHash.hasOwnProperty(cKey)) {
            old = imgHash[cKey];
            if (c == old && options.opt_motion) {
                return false;
            }
            ctx.fillText(c, x, y);
        }
        imgHash[cKey] = c;
        ctx.fillText(c, x, y);
    };

    function onComplete() {
        setTimeout(function() {
            Render();
        }, options.refresh_rate);    
    };

    function Render() {        
        if(options.pause) return onComplete();
        var charSet = (options.opt_color ? aDefaultColorCharList : defCharList);
       
        var iWidth = parseInt(Math.round(options.width * fResolution));
        var iHeight = parseInt(Math.round(options.height * fResolution));
        var strThisChar;

        oCanvas.width = iWidth;
        oCanvas.height = iHeight;
        oCanvas.style.display = "none";
        oCanvas.style.width = iWidth;
        oCanvas.style.height = iHeight;
        oCtx.drawImage(video, 0, 0, iWidth, iHeight);


        var oImgData = oCtx.getImageData(0, 0, iWidth, iHeight).data;
        var fFontSize = (1.4 / fResolution) * options.iScale;
        var iOffset, iRed, iGreen, iBlue, iAlpha, luminance, cIndex;

        var fLineHeight = (1 / fResolution) * options.iScale;

        var charsetLengthMinusOne = (charSet.length - 1);

        if (options.opt_matrix) {
            for(var key in matrixThreads) {
                matrixThreads[key].step();
            };            
            ctx.fillStyle = 'rgba(0,0,0,.30)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#0F0';
        } else if (!options.opt_block) {
            ctx.fillStyle = currentBackColor;
            ctx.fillRect(0, 0, width, height);
        }

        // ctx.font = fFontSize + 'pt Courier New';
        ctx.font = fFontSize + "pt Ubuntu Mono";        

        for (var y = 0; y < iHeight; y += 2) {
            //for (var x = iWidth - 1; x >= 0; x--) {
            for (var x =0; x< iWidth; x++) {
                iOffset = (y * iWidth + x) * 4;
                iRed = oImgData[iOffset];
                iGreen = oImgData[iOffset + 1];
                iBlue = oImgData[iOffset + 2];
                iAlpha = oImgData[iOffset + 3];
                luminance = (0.299 * iRed + 0.587 * iGreen + 0.114 * iBlue);                
                
                cIndex = charsetLengthMinusOne - Math.round(luminance * charsetLengthMinusOne / 255);

                if (options.opt_invert) {
                    cIndex = charsetLengthMinusOne - cIndex;
                }
                strThisChar = charSet[cIndex];
                if (strThisChar === undefined)
                    continue;

                if (options.opt_block) {
                    ctx.fillStyle = 'rgba(' + iRed + ',' + iGreen + ',' + iBlue + ',' + iAlpha + ')';                    
                    ctx.fillRect((options.flipH ? x : iWidth - x) * fLineHeight, y * fLineHeight, fLineHeight, fLineHeight * 2);

                } else if (options.opt_matrix) {                    
                    var index = matrixThreads[x].index();
                    var len = matrixThreads[x].len;
                    if (index > y && index < y + 4) {
                        ctx.fillStyle = '#FFF';
                        drawChar(matrixBeginCharList[y % matrixBeginCharList.length], x * fLineHeight, y * fLineHeight);
                        // ctx.fillText(matrixBeginCharList[y % matrixBeginCharList.length], x * fLineHeight, y * fLineHeight);
                    } else if (index > y && index > 0 && ((index - len) < y)) {
                        if (options.opt_color) {
                            ctx.fillStyle = 'rgba(' + iRed + ',' + iGreen + ',' + iBlue + ',' + iAlpha + ')';
                        } else {
                            ctx.fillStyle = '#0F0';
                        }
                        strThisChar = matrixMiddleCharLists[index % matrixMiddleCharLists.length][cIndex];
                        drawChar(strThisChar, x * fLineHeight, y * fLineHeight);
                    }
                } else {
                    if (options.opt_color) {
                        ctx.fillStyle = 'rgba(' + iRed + ',' + iGreen + ',' + iBlue + ',1)';
                    } else {
                        luminance = 255 - luminance;
                        // ctx.fillStyle = 'rgba(' + luminance + ',' + luminance + ',' + luminance + ',1)';
                        ctx.fillStyle = "#000";
                    }

                    drawChar(strThisChar, (options.flipH ? x : iWidth - x) * fLineHeight, y * fLineHeight);
                }
            }
        }

        elements.forEach(function(e) {
            ctx.fillStyle = e.colour;
            ctx.fillRect(e.left, e.top, e.width, e.height);
            paint_text(e.left, e.top, e.width, e.height, e.id.substring(4));
        });

        if(options.restart) onInit(); else onComplete();
    };
    document.addEventListener("DOMContentLoaded", function(event) { 
       setTimeout(function() { 
            onInit();
        }, 0);
    });    
})();
