(function($) {

$(window).load(function(){

var keyCode = {
    LEFT : 37,
    UP : 38,
    RIGHT: 39,
    DOWN: 40,
    W: 87,
    D: 68,
    S: 83,
    A: 65
};

var NoticeBar = {
    elem: [],
    options: {
        elem: '#notice'
    }, 
    init: function(options) {
        this.options = $.extend({}, this.options, options);
        this.elem = $(this.options.elem);
        if (this.elem.length) {
        }
        return this;
    },
    sendMessage: function(msg) {
        this.elem.html(msg);
    }
};

var ChristmasHat = {
    canvas: null, // jQueryObj
    hatPosition: [0, 0], // x, y
    hatRotate: 0,
    hatCanMove: false,
    hatSize: [25, 25], // current hat width/height
    hatImgSize: [0, 0], // origin hat image size for slider 
    hatImgUrl: '',
    options: {
        canvasElem: '#canvas', 
        hatElems: ['#hat01', '#hat02'],
        background: 'images/fanfou.jpg' 
    },
    init: function(options) {
        this.options = $.extend({}, this.options, options);
        this.canvas = $("#canvas");
        this.bindMouseEventListener();
        this.bindKeyEventListener();
        this.bindHatsListener();
        this.draw();
        return this;
    },
    draw: function() {
        var ctx = this.getCTX();
        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height)
        this.drawBackground(this.options.background);
        this.drawHat(this.hatPosition[0], this.hatPosition[1],
                this.hatRotate);
    },
    drawBackground: function(imageUrl) {
        console.log('set background :' + imageUrl);
        var ctx = this.getCTX(), 
            img = new Image();
        img.src = imageUrl;
        try { 
            ctx.drawImage(img, 0, 0);
        } catch (e) {
            // some image you cann't draw
            alert(e.description);
            this.onError(e);
        }
    },
    drawHat: function(x, y, rotate) { 
        if (!this.hatImgUrl) 
            return; 
        console.log('draw hat on :' + x + ',' + y);
        var ctx = this.getCTX(), 
            img = new Image();
        ctx.save();
        img.src = this.hatImgUrl;
        if (rotate) { // TODO: 旋转
            //ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
            ctx.rotate(Math.PI/180*rotate);  // degrees
        }
        ctx.drawImage(img, x, y, this.hatSize[0], this.hatSize[1]);
        ctx.restore();
        this.setHatPosition(x, y);
    },
    getCTX: function() {
        return this.canvas[0].getContext("2d");
    },
    bindMouseEventListener: function() {
        var t = this,
            canvasX = t.canvas.position()['left'],
            canvasY = t.canvas.position()['top'];
        t.canvas.mousemove(function(e) {
            if (!t.hatCanMove)
                return false;
            x = e.pageX - canvasX,
            y = e.pageY - canvasY;
            console.log(x, y);
            t.setHatPosition(x - t.hatSize[0]/2, y - t.hatSize[1]/2);
            t.draw();
        });
        t.canvas.mousedown(function(e) {
            t.hatCanMove = true;
        }).mouseup(function(e) {
            t.hatCanMove = false;
        });
    },
    bindKeyEventListener: function() {
        var t = this;
        $(window).keydown(function(e){
            switch (e.keyCode) {
                case keyCode.UP:
                    console.log("UP");
                    t.setHatPosition(null, --t.hatPosition[1]);
                    t.draw();
                    break;
                case keyCode.DOWN:
                    console.log("DOWN");
                    t.setHatPosition(null, ++t.hatPosition[1]);
                    t.draw();
                    break;
                case keyCode.LEFT:
                    console.log("LEFT");
                    t.setHatPosition(--t.hatPosition[0], null);
                    t.draw();
                    break;
                case keyCode.RIGHT:
                    console.log("RIGHT");
                    t.setHatPosition(++t.hatPosition[0], null);
                    t.draw();
                    break;
                case keyCode.D:
                    console.log("D");
                    t.hatRotate++;
                    t.draw();
                    break;
                case keyCode.A:
                    console.log("A");
                    t.hatRotate--;
                    t.draw();
                    break;
            }
        });
    },
    setHatPosition: function(x, y) {
        this.hatPosition = this._XYHelper(x, y, this.hatPosition);
    },
    setHatSize: function(width, height) {
        console.log('change hat size to ' + width + 'x' + height);
        this.hatSize = this._XYHelper(width, height, this.hatSize);
    },
    _XYHelper: function(a, b, map) {
        if (a === null) { // just change b
            a = map[0];
        }
        if (b === null) {
            b = map[1];
        }
        return [a, b];
    },
    sliderHatSize: function(value) { 
        this.setHatSize(Math.abs(this.hatImgSize[0] + value),
                        Math.abs(this.hatImgSize[1] + value));
        this.draw();
    },
    setHatImg: function(url, width, height) {
        this.hatImgUrl = url;
        this.hatImgSize = [width, height]; // save origin size
        this.setHatSize(width, height); // set hat size 
    },
    setBackground: function(url) {
        this.options.background = url;
        this.draw();
    },
    bindHatsListener: function() {
        var t = this, hats = this.options.hatElems;
        for (i in hats) {
            $(hats[i]).click(function(){
                console.log('choose hat');
                t.hatCanMove = true;
                var $img = $(this).children('img'),
                    src = $img.attr('src'),
                    width = $img.width(),
                    height = $img.height();
                t.setHatImg(src, width, height);
                t.draw();
                return false;
            });
        }
    },
    saveToDataURL: function(format) {
        return this.getCTX().canvas.toDataURL(format);
    },
};

var options = null;
// background from upload
if (typeof LDS_settings != 'undefined' && LDS_settings.background) {
    options = { background: LDS_settings.background };
}
var hatApp = ChristmasHat.init(options);

// set profile photo background
$('#photoForm').submit(function(){
    var url = $(this).children("input[name='photo']").val();
    if (url.indexOf('http://') == 0) { // startWith
        console.log("set background with " + url);
        hatApp.setBackground(url);
    }
    return false;
});

$('#saveFile').button().click(function() {
    window.location = hatApp.saveToDataURL('image/png');
    return false;
});

// change hat size
$('#slider').slider({
    value: 50,
    change: function(event, ui) {
        console.log('on slider change', ui.value);
        hatApp.sliderHatSize(ui.value - 50);
    }
});
    
});

})(jQuery);


