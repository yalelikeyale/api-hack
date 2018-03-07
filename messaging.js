const chatMessages = [{
  name: "ms1",
  msg: "Hey! Let's get dinner tonight?",
  delay: 500,
  align: "right"
},
{
  name: "ms2",
  msg: "You know I can't say no to Food! How about Frankies!? ",
  delay: 1000,
  align: "left"
},
{
  name: "ms3",
  msg: "AHH I went there for lunch. hmm what are you in the mood for? Chinese?",
  delay: 400,
  align: "right"
},
{
  name: "ms4",
  msg: "Not really:( ",
  delay: 300,
  align: "left"
},
{
  name: "ms5",
  msg: "Ugh the struggle is too real sometimes",
  delay: 400,
  align: "right"
}];

let chatCount = 0;
function onRowAdded() {
  $('.chat-container').animate({
    scrollTop: $('.chat-container').prop('scrollHeight')
  });
};

function chatAnimation(){
  let chatDelay = 0;
  chatCount++
  console.log(chatCount)
  $('.chat-message-list').empty()
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
  })
}

$(chatAnimation)
setInterval(chatAnimation,10000);

$('.cd-testimonials-wrapper').flexslider({
    selector: ".cd-testimonials > li",
    animation: "slide",
    controlNav: true,
    slideshow: false,
    smoothHeight: true,
    start: function() {
      $('.cd-testimonials').children('li').css({
        'opacity': 1,
        'position': 'relative'
      });
    }
  });


