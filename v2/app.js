/* Squnga'sihle v2 — minimal interactions */
(function(){
  "use strict";
  // mobile nav
  var t=document.querySelector('.nav-toggle'), m=document.querySelector('.mobile-nav');
  if(t&&m){t.addEventListener('click',function(){m.classList.toggle('open')});
    m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open')})});}

  // subtle pointer parallax on hero cards
  var stage=document.querySelector('.stage');
  if(stage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer:fine)').matches){
    var cards=[].slice.call(stage.querySelectorAll('.card-float'));
    stage.addEventListener('pointermove',function(e){
      var r=stage.getBoundingClientRect();
      var dx=(e.clientX-r.left)/r.width-0.5, dy=(e.clientY-r.top)/r.height-0.5;
      cards.forEach(function(c,i){
        var d=(i+1)*10;
        c.style.transform=c.dataset.base+' translate('+(dx*d).toFixed(1)+'px,'+(dy*d).toFixed(1)+'px)';
      });
    });
    cards.forEach(function(c){c.dataset.base=getComputedStyle(c).transform==='none'?'':'';});
  }

  // lightbox
  var lb=document.getElementById('lb');
  if(lb){var img=lb.querySelector('img'),cap=lb.querySelector('.cap');
    document.querySelectorAll('[data-full]').forEach(function(el){el.addEventListener('click',function(){
      img.src=el.getAttribute('data-full');cap.textContent=el.getAttribute('data-cap')||'';lb.classList.add('open');});});
    function close(){lb.classList.remove('open');img.src='';}
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('x'))close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});}

  // credential modal
  var modal=document.getElementById('modal');
  if(modal){var mt=modal.querySelector('h3'),mb=modal.querySelector('.body');
    window.openInfo=function(k){var d=window.CRED&&window.CRED[k];if(!d)return;mt.textContent=d.title;mb.innerHTML=d.body;modal.classList.add('open');};
    window.closeInfo=function(){modal.classList.remove('open');};
    modal.addEventListener('click',function(e){if(e.target===modal)window.closeInfo();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')window.closeInfo();});}

  var y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
})();
