//Console.log('Earthly-Start');
// Detect what page customer is on and add the message to the relevant block
var earthlyBadge=document.querySelector('#earthly-badge');
if (window.location.href.indexOf("product") != -1){document.querySelector('product-form').after(earthlyBadge);}
else if (window.location.href.indexOf("cart") != -1){document.querySelector('.js-contents').after(earthlyBadge);}