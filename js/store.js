/* ============================================================
   KOLKATA FISH, MUTTON & MORE — data layer
   Everything lives in the browser's localStorage. This is the
   free, zero-server way to make the site "dynamic": the admin
   panel writes here, the shop pages read from here.
   IMPORTANT (read the README): localStorage is per-browser, per
   device. See README.md for how to sync across devices/staff.
   ============================================================ */

const KM_KEYS = {
  products: "kfm_products_v1",
  orders: "kfm_orders_v1",
  cart: "kfm_cart_v1",
  customer: "kfm_customer_v1",
  settings: "kfm_settings_v1",
  adminAuth: "kfm_admin_auth_v1"
};

const CATEGORIES = {
  fish:      { name: "Fish Market",        icon: "\uD83D\uDC1F", tagline: "Fresh off the boat — today's bazaar rate vs our price." },
  meat:      { name: "Mutton & Chicken",   icon: "\uD83C\uDF57", tagline: "Cut fresh to order, weighed in front of you." },
  grocery:   { name: "Bengali Grocery",    icon: "\uD83D\uDED2", tagline: "Daily rice, dal, spice and every store-cupboard staple." },
  vegetables:{ name: "Vegetables",         icon: "\uD83E\uDD66", tagline: "Farm-fresh sabzi, picked and weighed the same morning." },
  sweets:    { name: "Bengali Sweets",     icon: "\uD83E\uDDC1", tagline: "Fresh sandesh, roshogolla and mishti made the traditional way." },
  pooja:     { name: "Puja Items",         icon: "\uD83E\uDE94", tagline: "Everything for the thala — flowers, dhoop, and shongshar essentials." },
  achar:     { name: "Achar & Hajmi",      icon: "\uD83C\uDF6B", tagline: "Tangy pickles and after-meal digestives, the old-school way." }
};

const DEFAULT_SETTINGS = {
  storeName: "Kolkata Fish, Mutton & More",
  whatsappNumber: "917670944063", // country code + number, digits only
  adminPassword: "kolkata123",
  address: "Hafeezpet, Hyderabad, Telangana",
  email: "kolkatafishmuttonmore@gmail.com",
  openHours: "6:30 AM – 9:00 PM, all days"
};

function ph(label, bg){
  // inline placeholder image (SVG data-uri) so the site works with zero image assets
  const txt = encodeURIComponent(label.slice(0,2).toUpperCase());
  const c = bg || "%23E3D6B8";
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='${c}'/%3E%3Ctext x='50' y='58' font-size='34' text-anchor='middle' font-family='Georgia' fill='%23241A16'%3E${txt}%3C/text%3E%3C/svg%3E`;
}

const DEFAULT_PRODUCTS = [
  // FISH — priced per 1 Kg
  { id:"fish-01", category:"fish", name:"Rui (Rohu)", name_bn:"রুই মাছ", unit:"kg", step:1, price:240, image:ph("Rui","%23C9D6DE"), inStock:true },
  { id:"fish-02", category:"fish", name:"Katla", name_bn:"কাতলা মাছ", unit:"kg", step:1, price:280, image:ph("Ka","%23C9D6DE"), inStock:true },
  { id:"fish-03", category:"fish", name:"Ilish (Hilsa)", name_bn:"ইলিশ মাছ", unit:"kg", step:1, price:1450, image:ph("Il","%23C9D6DE"), inStock:true },
  { id:"fish-04", category:"fish", name:"Chingri (Prawns)", name_bn:"চিংড়ি মাছ", unit:"kg", step:1, price:580, image:ph("Ch","%23C9D6DE"), inStock:true },
  { id:"fish-05", category:"fish", name:"Pabda", name_bn:"পাবদা মাছ", unit:"kg", step:1, price:450, image:ph("Pa","%23C9D6DE"), inStock:true },
  { id:"fish-06", category:"fish", name:"Bata", name_bn:"বাটা মাছ", unit:"kg", step:1, price:190, image:ph("Ba","%23C9D6DE"), inStock:false },

  // MUTTON & CHICKEN — priced per 1 Kg
  { id:"mea-01", category:"meat", name:"Mutton (Curry Cut)", name_bn:"খাসির মাংস (কারি কাট)", unit:"kg", step:1, price:760, image:ph("Mu","%23E9CFC4"), inStock:true },
  { id:"mea-02", category:"meat", name:"Chicken (Curry Cut)", name_bn:"মুরগির মাংস (কারি কাট)", unit:"kg", step:1, price:195, image:ph("Ch","%23E9CFC4"), inStock:true },
  { id:"mea-03", category:"meat", name:"Chicken Breast (Boneless)", name_bn:"মুরগির বুকের মাংস (হাড় ছাড়া)", unit:"kg", step:1, price:290, image:ph("Br","%23E9CFC4"), inStock:true },
  { id:"mea-04", category:"meat", name:"Country Chicken (Deshi)", name_bn:"দেশি মুরগি", unit:"kg", step:1, price:390, image:ph("De","%23E9CFC4"), inStock:true },

  // GROCERY — priced per 1 Kg (oil per 1 litre, since it's liquid)
  { id:"gro-01", category:"grocery", name:"Gobindobhog Rice", name_bn:"গোবিন্দভোগ চাল", unit:"kg", step:1, price:105, image:ph("Ri","%23E7DCC0"), inStock:true },
  { id:"gro-02", category:"grocery", name:"Masoor Dal", name_bn:"মসুর ডাল", unit:"kg", step:1, price:98, image:ph("Da","%23E7DCC0"), inStock:true },
  { id:"gro-03", category:"grocery", name:"Mustard Oil (Kachi Ghani)", name_bn:"সরিষার তেল (কাঁচি ঘানি)", unit:"litre", step:1, price:175, image:ph("Oi","%23E7DCC0"), inStock:true },
  { id:"gro-04", category:"grocery", name:"Panch Phoron", name_bn:"পাঁচ ফোড়ন", unit:"kg", step:1, price:520, image:ph("PP","%23E7DCC0"), inStock:true },
  { id:"gro-05", category:"grocery", name:"Ghee (Cow)", name_bn:"ঘি (গরুর)", unit:"kg", step:1, price:960, image:ph("Gh","%23E7DCC0"), inStock:true },

  // VEGETABLES — priced per 1 Kg
  { id:"veg-01", category:"vegetables", name:"Potato (Aloo)", name_bn:"আলু", unit:"kg", step:1, price:28, image:ph("Po","%23DCE7C8"), inStock:true },
  { id:"veg-02", category:"vegetables", name:"Onion (Peyaj)", name_bn:"পেঁয়াজ", unit:"kg", step:1, price:38, image:ph("On","%23DCE7C8"), inStock:true },
  { id:"veg-03", category:"vegetables", name:"Tomato", name_bn:"টমেটো", unit:"kg", step:1, price:32, image:ph("To","%23DCE7C8"), inStock:true },
  { id:"veg-04", category:"vegetables", name:"Brinjal (Begun)", name_bn:"বেগুন", unit:"kg", step:1, price:42, image:ph("Br","%23DCE7C8"), inStock:true },
  { id:"veg-05", category:"vegetables", name:"Cauliflower (Fulkopi)", name_bn:"ফুলকপি", unit:"kg", step:1, price:70, image:ph("Ca","%23DCE7C8"), inStock:true },
  { id:"veg-06", category:"vegetables", name:"Spinach (Palak Shak)", name_bn:"পালং শাক", unit:"kg", step:1, price:40, image:ph("Sp","%23DCE7C8"), inStock:true },
  { id:"veg-07", category:"vegetables", name:"Green Chilli (Kacha Lonka)", name_bn:"কাঁচা লঙ্কা", unit:"kg", step:1, price:70, image:ph("Ch","%23DCE7C8"), inStock:true },

  // SWEETS — priced per 1 Kg
  { id:"swt-01", category:"sweets", name:"Roshogolla", name_bn:"রসগোল্লা", unit:"kg", step:1, price:260, image:ph("Ro","%23F0DCE3"), inStock:true },
  { id:"swt-02", category:"sweets", name:"Sandesh (Kora)", name_bn:"সন্দেশ (কোরা)", unit:"kg", step:1, price:480, image:ph("Sa","%23F0DCE3"), inStock:true },
  { id:"swt-03", category:"sweets", name:"Mishti Doi", name_bn:"মিষ্টি দই", unit:"kg", step:1, price:150, image:ph("Do","%23F0DCE3"), inStock:true },
  { id:"swt-04", category:"sweets", name:"Chomchom", name_bn:"চমচম", unit:"kg", step:1, price:380, image:ph("Ch","%23F0DCE3"), inStock:true },

  // POOJA — sold by piece/pack/set, not by weight
  { id:"poo-01", category:"pooja", name:"Dhoop Kathi", name_bn:"ধূপ কাঠি", unit:"pack", step:1, price:45, image:ph("Dh","%23E4E9D8"), inStock:true },
  { id:"poo-02", category:"pooja", name:"Ghee Diya (set of 12)", name_bn:"ঘি প্রদীপ (১২টি সেট)", unit:"set", step:1, price:80, image:ph("Di","%23E4E9D8"), inStock:true },
  { id:"poo-03", category:"pooja", name:"Fresh Flower Mala", name_bn:"তাজা ফুলের মালা", unit:"piece", step:1, price:50, image:ph("Ma","%23E4E9D8"), inStock:true },
  { id:"poo-04", category:"pooja", name:"Camphor (Karpoor)", name_bn:"কর্পূর", unit:"pack", step:1, price:35, image:ph("Ca","%23E4E9D8"), inStock:true },

  // ACHAR & HAJMI — pickles priced per 1 Kg, small candies stay per pack
  { id:"ach-01", category:"achar", name:"Mango Achar (Aam)", name_bn:"আমের আচার", unit:"kg", step:1, price:320, image:ph("Aa","%23F0E2C4"), inStock:true },
  { id:"ach-02", category:"achar", name:"Mixed Vegetable Achar", name_bn:"মিশ্র সবজির আচার", unit:"kg", step:1, price:300, image:ph("Mi","%23F0E2C4"), inStock:true },
  { id:"ach-03", category:"achar", name:"Lime Achar (Lebu)", name_bn:"লেবুর আচার", unit:"kg", step:1, price:300, image:ph("Le","%23F0E2C4"), inStock:true },
  { id:"ach-04", category:"achar", name:"Hajmi Goli", name_bn:"হজমি গুলি", unit:"pack", step:1, price:25, image:ph("Ha","%23F0E2C4"), inStock:true },
  { id:"ach-05", category:"achar", name:"Aam Papad", name_bn:"আম পাপড়", unit:"kg", step:1, price:250, image:ph("AP","%23F0E2C4"), inStock:true },
  { id:"ach-06", category:"achar", name:"Chatpata Jeera Goli", name_bn:"চটপটা জিরা গুলি", unit:"pack", step:1, price:180, image:ph("Je","%23F0E2C4"), inStock:true }
];

function kmRead(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){ return fallback; }
}
function kmWrite(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function initStore(){
  if(!localStorage.getItem(KM_KEYS.products)) kmWrite(KM_KEYS.products, DEFAULT_PRODUCTS);
  if(!localStorage.getItem(KM_KEYS.orders)) kmWrite(KM_KEYS.orders, []);
  if(!localStorage.getItem(KM_KEYS.cart)) kmWrite(KM_KEYS.cart, []);
  if(!localStorage.getItem(KM_KEYS.settings)) kmWrite(KM_KEYS.settings, DEFAULT_SETTINGS);
}

/* ---------- products ---------- */
function getAllProducts(){ return kmRead(KM_KEYS.products, DEFAULT_PRODUCTS); }
function getProducts(category){ return getAllProducts().filter(p => p.category === category); }
function saveAllProducts(list){ kmWrite(KM_KEYS.products, list); }
function upsertProduct(prod){
  const list = getAllProducts();
  const i = list.findIndex(p => p.id === prod.id);
  if(i >= 0) list[i] = prod; else list.push(prod);
  saveAllProducts(list);
}
function deleteProduct(id){
  saveAllProducts(getAllProducts().filter(p => p.id !== id));
}

/* ---------- cart ---------- */
function getCart(){ return kmRead(KM_KEYS.cart, []); }
function saveCart(cart){ kmWrite(KM_KEYS.cart, cart); updateCartBadge(); }
function addToCart(product, qty){
  const cart = getCart();
  const i = cart.findIndex(c => c.id === product.id);
  if(i >= 0){ cart[i].qty = qty; }
  else{
    cart.push({
      id: product.id, category: product.category, name: product.name, name_bn: product.name_bn || product.name,
      unit: product.unit, price: product.price, qty: qty
    });
  }
  saveCart(cart);
}
function removeFromCart(id){ saveCart(getCart().filter(c => c.id !== id)); }
function clearCart(){ saveCart([]); }
function cartTotal(){ return getCart().reduce((s,c)=> s + c.price * c.qty, 0); }
function cartCount(){ return getCart().reduce((s,c)=> s + c.qty, 0); }
function updateCartBadge(){
  document.querySelectorAll(".cart-badge").forEach(el=>{
    const n = cartCount();
    el.textContent = n;
    el.style.display = n > 0 ? "flex" : "none";
  });
}

/* ---------- customer (simple client login, no password server) ---------- */
function getCustomer(){ return kmRead(KM_KEYS.customer, null); }
function saveCustomer(c){ kmWrite(KM_KEYS.customer, c); }
function logoutCustomer(){ localStorage.removeItem(KM_KEYS.customer); }

/* ---------- settings ---------- */
function getSettings(){ return kmRead(KM_KEYS.settings, DEFAULT_SETTINGS); }
function saveSettings(s){ kmWrite(KM_KEYS.settings, s); }

/* ---------- orders ---------- */
function getOrders(){ return kmRead(KM_KEYS.orders, []); }
function addOrder(order){
  const orders = getOrders();
  orders.unshift(order);
  kmWrite(KM_KEYS.orders, orders);
}
function updateOrderStatus(orderId, status){
  const orders = getOrders();
  const o = orders.find(x=>x.id===orderId);
  if(o){ o.status = status; kmWrite(KM_KEYS.orders, orders); }
}

/* run on every page */
initStore();
document.addEventListener("DOMContentLoaded", updateCartBadge);
