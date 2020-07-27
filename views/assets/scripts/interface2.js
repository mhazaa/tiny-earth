var temporaryIcon;
var dom = {
  clock: document.getElementById("clock"),
  activeUsers: document.getElementById("activeUsers").getElementsByTagName("span")[0],
  coordinates: document.getElementById("coordinates"),
  backgrounds: document.getElementsByClassName("backgrounds"),
  iframesContainer: document.getElementById("iframesContainer")
}

class CenterTextControls {
  constructor(){
    this.dom = {
      centerText: document.getElementById("centerText").getElementsByTagName('p')
    }
  }
  tempMessage(index, message, duration){
    this.dom.centerText[index].innerHTML = message;
    var that = this;
    setTimeout(function(){
      that.clear(index);
    }, duration);
  }
  message(index, message){
    this.dom.centerText[index].innerHTML = message;
  }
  clear(index){
    if(typeof index != 'undefined'){
      this.dom.centerText[index].innerHTML = '';
    } else {
      for(var i=0; i<this.dom.centerText.length; i++){
        this.dom.centerText[i].innerHTML = '';
      }
    }
  }
}
var centerTextControls = new CenterTextControls();

class LobbyMenu {
  constructor(){
    var urlParams = new URLSearchParams(window.location.search);
    this.dom = {
      lobbyInterface: document.getElementById("lobbyInterface"),
      ingameInterface: document.getElementById("ingameInterface"),
      loginForm: document.getElementById("loginForm"),
      usernameInput: document.getElementById("usernameInput"),
      spawnxInput: document.getElementById("spawnxInput"),
      spawnyInput: document.getElementById("spawnyInput"),
      spawnColors: document.getElementById('colorSelectLobby').getElementsByTagName('div')
    }

    this.dom.spawnxInput.value = urlParams.get('x');
    this.dom.spawnyInput.value = urlParams.get('y');
    this.dom.spawnColors[2].classList.add('highlighted');
    this.spawnColor = this.dom.spawnColors[2].innerHTML;
    this.input();
  }
  input(){
    var that = this;
    for(var i=0; i<this.dom.spawnColors.length; i++){
      this.dom.spawnColors[i].addEventListener('click', function(){
        for(var x=0; x<that.dom.spawnColors.length; x++){
          that.dom.spawnColors[x].classList.remove('highlighted');
        }
        this.classList.add('highlighted');
        that.spawnColor = this.innerHTML;
      });
    }
    this.dom.loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      var obj = {
        username: that.dom.usernameInput.value,
        x: parseInt(that.dom.spawnxInput.value),
        y: parseInt(that.dom.spawnyInput.value),
        color: that.spawnColor
      }
      if (obj.username.length == 0) return;
      socket.emit('spawn', obj);
      //reset form
      that.dom.lobbyInterface.style.display = 'none';
      that.dom.ingameInterface.style.display = 'block';
    });
  }
}
new LobbyMenu();

class ChatControls {
  constructor(){
    this.dom = {
      chatForm: document.getElementById("chatForm"),
      chatInput: document.getElementById("chatInput")
    }
    this.input();
  }
  sendText(){
    var text = this.dom.chatInput.value;
    this.dom.chatInput.value = '';
    socket.emit('sendText', {text: text});
  }
  input(){
    var that = this;
    this.dom.chatForm.addEventListener('submit', function(e){
      e.preventDefault();
      that.sendText();
    });
  }
}
new ChatControls();

class ItemManager {
  constructor(){
    this.dom = {
      itemGrid: document.getElementById("itemGrid"),
      items: document.getElementsByClassName("item")
    }
    this.marker = null;
    this.drop = {x:0, y:0};

  /*  var i = 0;
    for(var item in pageData.items){
      new ItemUI(
        dom.items[i],
        document.getElementById(pageData.items[item].form.id),
        pageData.items[item].itemType
      )
      i++;
    }*/

    this.input();
  }
  input(){
    window.addEventListener('click', onClick);

    function onClick(e){
      this.dom.itemGrid.style.display = 'inline-block';
      optionsMenu.deactivate();

      that.drop = canvasToWorldLoc(e.clientX, e.clientY);
      that.drop.x = Math.round(that.drop.x*100)/100;
      that.drop.y = Math.round(that.drop.y*100)/100;

      this.marker = new Marker(that.drop.x, that.drop.y, 15, scenes[currentScene]);
    }

    window.addEventListener('mousedown', closeForm);
    window.addEventListener('touchstart', closeForm);
    function closeForm(e){
      if(that.dom.itemGrid.style.display=='none') return;
      if (that.dom.itemGrid.contains(e.target)){
        //nothing happens
      } else{
        that.remove();
      }
    }
  }
  remove(){
    if(this.marker){
      this.marker.destroy();
      this.marker = null;
    }
  }
}
class ItemUI {
  constructor(domElement, form, itemType){
    this.domElement = domElement;
    this.form = form;
    this.itemType = itemType;
    this.input();
  }


  input(){
    var that = this;
    this.domElement.addEventListener('click', onClick);
    function onClick(){
      that.form.style.display = 'block';
      optionsMenu.deactivate();
    }

    this.form.addEventListener('submit', onSubmit);
    function onSubmit(e){
      e.preventDefault();
      var obj = {};

      var inputFields = this.getElementsByClassName('inputField');
      for(var i=0; i<inputFields.length; i++){
        if(inputFields[i].type=='number'){
          obj[inputFields[i].name] = parseInt(inputFields[i].value);
        } else {
          obj[inputFields[i].name] = inputFields[i].value;
        }
      }
      obj.x = itemManager.drop.x;
      obj.y = itemManager.drop.y;
      obj.itemType = that.itemType;
      obj.scene = currentScene.name;

      socket.emit('sendItem', obj);
      this.reset();
      that.remove();
    }

    /* closing form with x button */
    this.form.getElementsByClassName('exitForm')[0].addEventListener('click', function(){
      that.remove();
    });
    /* closing form when clicking anywhere outsisde it */
    window.addEventListener('mousedown', closeForm);
    window.addEventListener('touchstart', closeForm);
    function closeForm(e){
      if(that.form.style.display=='none') return;
      if (that.form.contains(e.target)){
        //nothing happens
      } else{
        that.remove();
      }
    }
  }
  remove(){
    this.form.style.display = 'none';
  }
}


class ItemUI {
  constructor(domElement, form, itemType){
    this.domElement = domElement;
    this.form = form;
    this.itemType = itemType;

    this.dropPositionX = 0;
    this.dropPositionY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.held;
    this.draggable();
    this.input();
  }
  input(){
    var that = this;

    this.form.addEventListener('submit', onSubmit);
    function onSubmit(e){
      e.preventDefault();
      var obj = {};

      var inputFields = this.getElementsByClassName('inputField');
      for(var i=0; i<inputFields.length; i++){
        if(inputFields[i].type=='number'){
          obj[inputFields[i].name] = parseInt(inputFields[i].value);
        } else {
          obj[inputFields[i].name] = inputFields[i].value;
        }
      }
      obj.x = that.dropPositionX;
      obj.y = that.dropPositionY;
      obj.itemType = that.itemType;
      obj.scene = currentScene.name;

      socket.emit('sendItem', obj);
      this.reset();
      that.remove();
    }

    /* closing form with x button */
    this.form.getElementsByClassName('exitForm')[0].addEventListener('click', function(){
      that.remove();
    });
    /* closing form when clicking anywhere outsisde it */
    window.addEventListener('mousedown', closeForm);
    window.addEventListener('touchstart', closeForm);
    function closeForm(e){
      if(that.form.style.display=='none') return;
      if (that.form.contains(e.target)){
        //nothing happens
      } else{
        that.remove();
      }
    }
  }
  remove(){
    this.form.style.display = 'none';
    if(temporaryIcon){
      temporaryIcon.destroy();
      temporaryIcon = null;
    }
  }
  setTranslate(xPos, yPos){
    this.domElement.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)"
  }
  draggable(){
    var that = this;
    var touchendX=0, touchendY=0;
    this.domElement.addEventListener("touchstart", dragStart);
    this.domElement.addEventListener("mousedown", dragStart);
    window.addEventListener("mousemove", drag);
    window.addEventListener("touchmove", drag);
    window.addEventListener("touchend", dragEnd);
    window.addEventListener("mouseup", dragEnd);

    function dragStart(e){
      that.held = true;
      new domAudio('assets/soundfiles/pick_item.wav').play();
      if (e.type === "touchstart"){
        that.initialX = e.touches[0].clientX;
        that.initialY = e.touches[0].clientY;
      } else {
        e.preventDefault();
        that.initialX = e.clientX;
        that.initialY = e.clientY;
      }
    }
    function drag(e){
      if(!that.held) return;
      var clientX, clientY;
      if (e.type === "touchmove"){
        clientX = e.touches[0].clientX - that.initialX;
        clientY = e.touches[0].clientY - that.initialY;
        touchendX = e.touches[0].clientX;
        touchendY = e.touches[0].clientY;
      } else {
        e.preventDefault();
        clientX = e.clientX - that.initialX;
        clientY = e.clientY - that.initialY;
      }
      that.setTranslate(clientX, clientY);
    }

    function dragEnd(e){
      if(!that.held) return;
      new domAudio('assets/soundfiles/drop_item.wav').play();
      var clientX, clientY;
      if (e.type === "touchend"){
        clientX = touchendX;
        clientY = touchendY;
      } else {
        e.preventDefault();
        clientX = e.clientX;
        clientY = e.clientY;
      }

      that.held = false;
      that.initialX = 0;
      that.initialY = 0;
      that.setTranslate(0, 0);
      that.remove();
      that.form.style.display = 'block';
      optionsMenu.deactivate();

      var drop = canvasToWorldLoc(clientX, clientY);
      that.dropPositionX = Math.round(drop.x*100)/100;
      that.dropPositionY = Math.round(drop.y*100)/100;

      temporaryIcon = new Sprite(that.domElement.src, 50);
      currentScene.add(temporaryIcon);
      temporaryIcon.position.set(that.dropPositionX, that.dropPositionY, 0);
    }
  }
}


var i = 0;
for(var item in pageData.items){
  new ItemUI(
    dom.items[i],
    document.getElementById(pageData.items[item].form.id),
    pageData.items[item].itemType
  )
  i++;
}

/* change color */
class ColorChanger {
  constructor(){
    this.dom = {
      colorSelectIngame: document.getElementById("colorSelectIngame")
    }
    this.dom.colors = this.dom.colorSelectIngame.getElementsByTagName("div");
    this.input();
  }
  input(){
    var that = this;
    for(var i=0; i<this.dom.colors.length; i++){
      (function(i){
        that.dom.colors[i].addEventListener('click', function(e){
          var color = that.dom.colors[i].innerHTML;
          clientPlayer.changeColor(color);
          socket.emit('updateColor', {color: color})
          that.dom.colorSelectIngame.style.display = 'none';
        });
      })(i);
    }
  }
}
var colorChanger = new ColorChanger();

/* options mneu */
class OptionsMenu {
  constructor(){
    this.dom = {
      optionsMenu: document.getElementById("optionsMenu"),
      optionsTitle: document.getElementById("optionsTitle"),
      optionsMenuChoices: document.getElementById("optionsMenu").getElementsByTagName("a")
    }
    this.onOption = [];
    this.input();
  }
  input(){
    var that = this;
    for(var i=0; i<this.dom.optionsMenuChoices.length; i++){
      (function(i){
        that.dom.optionsMenuChoices[i].addEventListener('click', function(){
          if(typeof that.onOption[i] == 'function') that.onOption[i]();
          that.deactivate();
        });
      })(i);
    }
    /*closing menu*/
    window.addEventListener('mousedown', closeForm);
    window.addEventListener('touchstart', closeForm);
    function closeForm(e){
      if(that.dom.optionsMenu.style.display=='none') return;
      if (that.dom.optionsMenu.contains(e.target)){
        //nothing happens
      } else{
        that.deactivate();
      }
    }
  }
  activate(title, options){
    var that = this;
    this.dom.optionsTitle.innerHTML = title;
    for(var i=0; i<options.length; i++){
      this.dom.optionsMenuChoices[i].innerHTML = options[i].text;
      this.dom.optionsMenuChoices[i].style.display = 'block';
      this.onOption[i] = options[i].function;
    }
    this.dom.optionsMenu.style.display = 'block';
  }
  deactivate(){
    this.dom.optionsMenu.style.display = 'none';
    for(var i=0; i<this.dom.optionsMenuChoices.length; i++){
      this.dom.optionsMenuChoices[i].style.display = 'none';
      this.dom.optionsMenuChoices[i].style.innerHTML = '';
    }
    for(var i=0; i<this.onOption.length; i++){
      this.onOption[i] = function(){};
    }
  }
}
var optionsMenu = new OptionsMenu();

/* ingame form controls */
class IngameForm {
  constructor(){
    this.dom = {
      ingameForm: document.getElementById('ingameForm'),
      inputs: document.getElementById('ingameForm').getElementsByTagName('input')
    }
    this.input();
  }
  onSubmit(){}
  input(){
    var that = this;
    this.dom.ingameForm.addEventListener('submit', function(e){
      e.preventDefault();
      that.onSubmit();
      that.deactivate();
    });
  }
  activate(onSubmit){
    this.dom.ingameForm.style.display = 'block';
    this.onSubmit = onSubmit;
  }
  deactivate(){
    this.dom.ingameForm.style.display = 'none';
    this.onSubmit = function(){};
  }
}
var ingameForm = new IngameForm();

/*audio controls*/
class AudioControls {
  constructor(){
    this.dom = {
      audioControls: document.getElementById("audioControls")
    }
    this.input();
  }
  input(){
    this.dom.audioControls.style.opacity = 1;
    this.dom.audioControls.addEventListener('click', function(){
      if(this.style.opacity == 1){
        this.style.opacity = 0.5;
        bgmusic.pause();
      } else {
        this.style.opacity = 1;
        bgmusic.play();
      }
    });
  }
}
new AudioControls();

/*tutorial screen*/
class TutorialControls {
  constructor(){
    this.dom = {
      tutorialButton: document.getElementById('tutorialButton'),
      tutorialSceen: document.getElementById('tutorialSceen')
    }
    this.input();
  }
  input(){
    var that = this;
    this.dom.tutorialButton.addEventListener('click', function(){
      if(that.dom.tutorialSceen.style.display == 'block'){
        that.dom.tutorialSceen.style.display = 'none';
      } else {
        that.dom.tutorialSceen.style.display = 'block';
      }
    });
  }
}
new TutorialControls();

/*share loc*/
class ShareLocControls {
  constructor(){
    this.dom = {
      shareLocButton: document.getElementById('shareLocButton')
    }
    this.input();
  }
  copyToClipboard(text){
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  }
  shareLoc(x, y){
    var url = window.location.host + '/?x=' + x + '&y=' + y;
    this.copyToClipboard(url);
  }
  input(){
    var that = this;
    this.dom.shareLocButton.addEventListener('click', function(){
      that.shareLoc(
        ingameCoors(clientPlayer.position.x),
        ingameCoors(clientPlayer.position.y)
      );
    });
  }
}
var shareLocControls = new ShareLocControls();

class DragNdrop {
  constructor(){
    this.input();
  }
  input(){
    document.body.addEventListener('dragover', function(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    document.body.addEventListener('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      var url = e.dataTransfer.getData('Text');
      var files = e.dataTransfer.files;

      if(files.length==0){
        var obj = {};
        var drop = canvasToWorldLoc(e.clientX, e.clientY);
        drop.x = Math.round(drop.x*100)/100;
        drop.y = Math.round(drop.y*100)/100;
        obj.x = drop.x;
        obj.y = drop.y;
        obj.itemType = 'image';
        obj.scene = currentScene.name;
        obj.remoteFile = url;
        socket.emit('sendItem', obj);
      } else {
        for (var i=0, file; file=files[i]; i++){
          if (file.type.match(/image.*/)) {
            var reader = new FileReader();

            reader.onload = function(e2){
              // finished reading file data.
              var img = document.createElement('img');
              img.src= e2.target.result;
              document.body.appendChild(img);
            }

            reader.readAsDataURL(file); // start reading the file data.
          }
        }
      }
    });
  }
}
new DragNdrop();

class DrawingMode {
  constructor(){
    this.input();
    this.active = false;
    this.startPoint = null;
    this.points = [];
  }
  activate(){
    this.active = true;
    document.getElementById('canvas').style.opacity = 0.5;
  }
  deactivate(){
    if(this.points.length>=2){
      new BongoShape(this.startPoint.x, this.startPoint.y, this.points, currentScene.name);
    }
    this.active = false;
    this.startPoint = null;
    this.points = [];
    document.getElementById('canvas').style.opacity = 1;
  }
  input(){
    var that = this;
    document.addEventListener('keyup', function(e){
      var keyCode = e.keyCode;
      if(keyCode==77){
        if(that.active){
          that.deactivate();
        } else {
          that.activate();
        }
      }
    });

    document.body.addEventListener('click', click);
    function click(e){
      if(!that.active) return;

      var loc = canvasToWorldLoc(e.clientX, e.clientY);
      if(!that.startPoint){
        that.startPoint = loc;
      } else {
        var point = {x:0,y:0};
        point.x = loc.x - that.startPoint.x;
        point.y = loc.y - that.startPoint.y;
        that.points.push({
          x: point.x,
          y: point.y
        });
      }
    }
  }
}
var drawingMode = new DrawingMode();