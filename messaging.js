var chatMessages = [{
  name: "ms1",
  msg: "Hey! Let's get dinner tonight?",
  delay: 300,
  align: "right"
},
{
  name: "ms2",
  msg: "You know I can't say no to food!",
  delay: 400,
  align: "left"
},
{
  name: "ms3",
  msg: "How about our go to pizza place? It's been a whole 3 days since we've been!",
  delay: 200,
  align: "right"
},
{
  name: "ms4",
  msg: "Ahh!! I was going to keep this a secret, but I went for lunch :|",
  delay: 400,
  align: "left"
},
{
  name: "ms5",
  msg: "WOW",
  delay: 350,
  align: "right"
},
{
  name: "ms6",
  msg: "I know, I know. How about sushi! hehe",
  delay: 200,
  align: "left"
},
{
  name: "ms7",
  msg: "I don't have the stomach size of a baby. You know I like to eat a lot!",
  delay: 350,
  align: "right"
},
{
  name: "ms8",
  msg: "hmm well I feel like I'm making all of the recommondations here",
  delay: 400,
  align: "left"
},
{
  name: "ms9",
  msg: "Hey! I didn't go and cheat on our spot by taking other people there!",
  delay: 200,
  align: "right"
},
{
  name: "ms10",
  msg: "I'm going to yoga",
  delay: 800,
  align: "left"
}
                   ];
var chatDelay = 0;

function onRowAdded() {
  $('.chat-container').animate({
    scrollTop: $('.chat-container').prop('scrollHeight')
  });
};
$.each(chatMessages, function(index, obj) {
  if(index!==0){
    chatDelay = chatDelay + 1000;
    chatDelay += obj.delay;
  }
  msgname = "." + obj.name;
  msginner = ".messageinner-" + obj.name;
  spinner = ".sp-" + obj.name;
  $(".chat-message-list").append("<li class='message-" + obj.align + " " + obj.name + "' hidden><div class='messageinner-" + obj.name + "' hidden><span class='message-text'>" + obj.msg + "</span></div></li>");
  $(msgname).delay(chatDelay).fadeIn();
  scrollDelay = chatDelay;
  $(spinner).delay(chatDelay).hide(1);
  $(msginner).delay(chatDelay+10).fadeIn();
  setTimeout(onRowAdded, chatDelay);
});