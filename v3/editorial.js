/* Squnga'sihle — editorial hover-reveal interaction */
(function(){
  "use strict";
  var list = document.getElementById('list');
  var floater = document.getElementById('floater');
  if(!list || !floater) return;

  var items = [].slice.call(list.querySelectorAll('li'));
  var fine = window.matchMedia('(pointer:fine)').matches;

  // Mobile/touch: show each line's photo inline (set via CSS var), skip hover engine.
  items.forEach(function(li){
    var src = li.getAttribute('data-img');
    li.style.setProperty('--thumb', "url('"+src+"')");
  });

  if(!fine) return;

  // Preload images so the reveal is instant
  items.forEach(function(li){ var i=new Image(); i.src=li.getAttribute('data-img'); });

  var raf=null, tx=0, ty=0;
  function place(){ floater.style.left=tx+'px'; floater.style.top=ty+'px'; raf=null; }

  items.forEach(function(li){
    li.addEventListener('pointerenter', function(){
      floater.src = li.getAttribute('data-img');
      floater.classList.add('on');
      list.classList.add('hovering');
      items.forEach(function(x){ x.classList.toggle('active', x===li); });
    });
  });

  list.addEventListener('pointermove', function(e){
    // float the image to the side of the cursor, biased toward open space
    var offset = (e.clientX < window.innerWidth/2) ? 230 : -230;
    tx = e.clientX + offset;
    ty = e.clientY;
    // keep within viewport
    tx = Math.max(180, Math.min(window.innerWidth-180, tx));
    ty = Math.max(160, Math.min(window.innerHeight-160, ty));
    if(!raf) raf = requestAnimationFrame(place);
  });

  list.addEventListener('pointerleave', function(){
    floater.classList.remove('on');
    list.classList.remove('hovering');
    items.forEach(function(x){ x.classList.remove('active'); });
  });
})();
