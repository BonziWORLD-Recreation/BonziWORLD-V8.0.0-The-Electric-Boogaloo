const socket = io();
const userSprites = {};
let bonziSprite, stage;

$('#join-btn').on('click', () => {
  const nickname = $('#nickname').val();
  const roomId = $('#room-id').val() || 'default';
  
  socket.emit('join', { nickname, roomId });
  $('#login-window').hide();
  $('#game-container').show();
  initBonzi(nickname);
});

function initBonzi(nickname) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  $('#bonzi-container').append(canvas);
  
  stage = new createjs.Stage(canvas);
  
  const spriteSheet = new createjs.SpriteSheet({
    images: ['https://raw.githubusercontent.com/Rafafrias2012/BonziWORLD-Rebooted/refs/heads/main/build/www/img/bonzi/purple.png'],
    frames: {
      width: 200,
      height: 160
    },
    animations: {
      idle: 0,
      enter: [277, 302, "idle", 0.25],
      leave: [16, 39, 40, 0.25]
    }
  });

  bonziSprite = new createjs.Sprite(spriteSheet, "idle");
  bonziSprite.x = 400;
  bonziSprite.y = 300;
  
  const nameTag = new createjs.Text(nickname, "12px Arial", "#000");
  nameTag.x = 10;
  nameTag.y = -20;
  
  bonziSprite.addChild(nameTag);
  stage.addChild(bonziSprite);
  
  createjs.Ticker.addEventListener("tick", stage);
  
  makeDraggable(bonziSprite);
}

function createSpeechBubble(message, bonziSprite) {
  // Remove any existing speech bubble
  if (bonziSprite.speechBubble) {
    stage.removeChild(bonziSprite.speechBubble);
  }

  // Create speech bubble container
  const bubbleContainer = new createjs.Container();
  bubbleContainer.x = bonziSprite.x + 50;  // Offset from Bonzi
  bubbleContainer.y = bonziSprite.y - 80;  // Above Bonzi

  // Create bubble background
  const bubble = new createjs.Shape();
  bubble.graphics.beginFill("#FFFFFF")
               .drawRoundRect(0, 0, 200, 50, 10);
  bubble.alpha = 0.9;

  // Create text
  const text = new createjs.Text(message, "14px Arial", "#000000");
  text.x = 10;
  text.y = 10;
  text.maxWidth = 180;

  // Add to container
  bubbleContainer.addChild(bubble);
  bubbleContainer.addChild(text);

  // Add to stage
  stage.addChild(bubbleContainer);
  bonziSprite.speechBubble = bubbleContainer;

  // Optional: Auto-remove after a few seconds
  setTimeout(() => {
    stage.removeChild(bubbleContainer);
    bonziSprite.speechBubble = null;
  }, 5000);

  // Text-to-Speech
  if (message.trim()) {
    const say = message.trim();
    const url = "https://www.tetyys.com/SAPI4/SAPI4?text=" + 
                encodeURIComponent(say) + 
                "&voice=" + encodeURIComponent("Adult Male #2, American English (TruVoice)") + 
                "&pitch=140&speed=157";
    const audio = new Audio(url);
    audio.play().catch(error => console.log("TTS Error:", error));
  }
}

function getUserSpriteById(id) {
  // Direct object lookup
  if (userSprites[id]) {
    return userSprites[id].sprite;
  }

  // Alternative lookup methods
  const sprite = Object.values(userSprites)
    .find(userObj => userObj.id === id)?.sprite;

  if (sprite) return sprite;

  // Fallback method using stage children
  const stageSprites = stage.children.filter(child => 
    child.userData && child.userData.id === id
  );

  return stageSprites.length > 0 ? stageSprites[0] : null;
}


function makeDraggable(sprite) { sprite.on("pressmove", (event) => {
    sprite.x = event.stageX - sprite.getBounds().width / 2;
    sprite.y = event.stageY - sprite.getBounds().height / 2;
    socket.emit('move', { x: sprite.x, y: sprite.y });
  });
}

socket.on('user_move', (data) => {
  // Update other users' positions
  // Assuming we have a way to track other users' sprites
  const otherUser Sprite = getUserSpriteById(data.id);
  if (otherUser Sprite) {
    otherUser Sprite.x = data.x;
    otherUser Sprite.y = data.y;
  }
});

socket.on('receive_message', (data) => {
  // If this is a different user's message, find their sprite and create bubble
  if (data.id !== socket.id) {
    const otherUserSprite = getUserSpriteById(data.id);
    if (otherUserSprite) {
      createSpeechBubble(data.message, otherUserSprite);
    }
  }
});

$('#send-btn').on('click', () => {
  const message = $('#chat-input').val();
  if (message.trim()) {
    socket.emit('send_message', { message });
    createSpeechBubble(message, bonziSprite);
    $('#chat-input').val('');
  }
});
