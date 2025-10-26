// Basic cart handling (in-memory + localStorage)
const CART_KEY='fpr_cart_v1';
function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch(e){return []}}
function saveCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c))}
function addToCart(item){const c=getCart();c.push(item);saveCart(c);alert('Added to cart');}
function renderCartCount(){const el=document.getElementById('cartCount'); if(el) el.innerText=getCart().length;}
function clearCart(){localStorage.removeItem(CART_KEY);renderCartCount();}
// Sell quote compute (40% base + condition adjustments)
function computeOffer(market,opts){
  let offer=market*0.40;
  if(!opts.power) offer*=0.6;
  if(opts.screen==='minor') offer*=0.85;
  if(opts.screen==='major') offer*=0.6;
  if(opts.locked) return 0;
  return Math.max(0, Math.round(offer*100)/100);
}
document.addEventListener('DOMContentLoaded',renderCartCount);
