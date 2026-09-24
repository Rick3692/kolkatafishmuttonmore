/* ============================================================
   KOLKATA MART — shared front-of-shop behaviour
   ============================================================ */

function showToast(msg){
  let t = document.getElementById("km-toast");
  if(!t){
    t = document.createElement("div");
    t.id = "km-toast";
    t.style.cssText = "position:fixed;bottom:22px;left:50%;transform:translateX(-50%);"
      + "background:#241A16;color:#F4EAD2;padding:12px 20px;border-radius:24px;"
      + "font-family:Karla,sans-serif;font-size:.9rem;z-index:999;box-shadow:0 4px 14px rgba(0,0,0,.25);";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(()=>{ t.style.opacity = "0"; }, 1800);
}

function fmtMoney(n){ return "₹" + Number(n).toFixed(2).replace(/\.00$/, ""); }

/* Is this a weight/volume item (kg, litre) where we want to offer
   sub-1-unit picks like 250g/500g, rather than a whole-number
   stepper (used for piece/pack/set items)? */
function isWeightUnit(unit){ return unit === "kg" || unit === "litre"; }

/* Formats a quantity for display, switching to grams/millilitres
   below 1 kg/litre so "0.25 kg" reads as "250 g" instead. */
function formatQtyLabel(qty, unit){
  if(isWeightUnit(unit) && qty < 1){
    const small = Math.round(qty * 1000);
    return small + (unit === "litre" ? " ml" : " g");
  }
  const rounded = Math.round(qty * 100) / 100;
  return rounded + " " + unit;
}

/* Builds the list of selectable quantities for a weight/volume item:
   step, 2×step, 3×step ... up to a sensible ceiling, so a 0.25 step
   offers 250g, 500g, 750g, 1kg, 1.25kg, ... */
function weightQtyOptions(step){
  const ceiling = step < 1 ? 5 : Math.max(5, step * 10);
  const opts = [];
  for(let v = step; v <= ceiling + 1e-9; v = +(v + step).toFixed(2)){
    opts.push(+v.toFixed(2));
  }
  return opts;
}

/* Renders the rate-board table for a single category onto the page.
   Call: renderCategory("fish", document.getElementById("rate-body")) */
function renderCategory(category, tbody){
  const products = getProducts(category);
  tbody.innerHTML = "";
  if(products.length === 0){
    tbody.innerHTML = `<tr><td colspan="4" style="padding:30px;color:var(--ink-soft);">No items yet — check back soon.</td></tr>`;
    return;
  }
  products.forEach(p=>{
    const tr = document.createElement("tr");
    tr.dataset.id = p.id;

    const cart = getCart();
    const inCart = cart.find(c=>c.id===p.id);
    const startQty = inCart ? inCart.qty : p.step;
    const displayName = pname(p);
    const weighted = isWeightUnit(p.unit);

    const qtyControlHtml = weighted
      ? `<select class="qty-select" data-role="qty" ${!p.inStock ? "disabled" : ""}
           style="padding:6px 10px;border-radius:8px;border:1px solid var(--ink-soft, #ccc);font-family:inherit;font-size:.9rem;min-width:90px;">
           ${weightQtyOptions(p.step).map(v=>`<option value="${v}" ${v===startQty?"selected":""}>${formatQtyLabel(v, p.unit)}</option>`).join("")}
         </select>`
      : `<div class="qty-stepper">
           <button type="button" data-act="minus" ${!p.inStock ? "disabled" : ""}>–</button>
           <input type="number" data-role="qty" value="${startQty}" step="${p.step}" min="${p.step}" ${!p.inStock ? "disabled" : ""}>
           <button type="button" data-act="plus" ${!p.inStock ? "disabled" : ""}>+</button>
         </div>`;

    tr.innerHTML = `
      <td>
        <div class="prod-name">
          <img class="prod-thumb" src="${p.image}" alt="${displayName}">
          <div class="txt">
            <strong>${displayName}</strong>
            <div class="unit">${p.inStock ? t("per_prefix") + " " + p.unit : ""} ${p.inStock ? "" : `<span class="out-tag">${t("out_of_stock")}</span>`}</div>
          </div>
        </div>
      </td>
      <td class="price-cell">
        <span class="now">${fmtMoney(p.price)}</span>
      </td>
      <td>${qtyControlHtml}</td>
      <td>
        <button class="btn small" data-act="add" ${!p.inStock ? "disabled" : ""}>${t("add_to_cart_btn")}</button>
      </td>
    `;
    tbody.appendChild(tr);

    const qtyInput = tr.querySelector('[data-role="qty"]');
    const step = p.step;

    if(!weighted){
      tr.querySelector('[data-act="minus"]').addEventListener("click", ()=>{
        let v = parseFloat(qtyInput.value) || step;
        v = Math.max(step, +(v - step).toFixed(2));
        qtyInput.value = v;
      });
      tr.querySelector('[data-act="plus"]').addEventListener("click", ()=>{
        let v = parseFloat(qtyInput.value) || step;
        v = +(v + step).toFixed(2);
        qtyInput.value = v;
      });
    }

    tr.querySelector('[data-act="add"]').addEventListener("click", ()=>{
      const qty = Math.max(step, parseFloat(qtyInput.value) || step);
      addToCart(p, qty);
      showToast(`${displayName} ${t("toast_added_suffix")} ${formatQtyLabel(qty, p.unit)}`);
    });
  });
}

/* Re-render the currently visible category table (if any) when the
   language changes, so product names switch immediately. */
document.addEventListener("kfm-lang-changed", ()=>{
  const tbody = document.getElementById("rate-body");
  if(tbody && typeof CURRENT_CATEGORY !== "undefined"){
    renderCategory(CURRENT_CATEGORY, tbody);
  }
});

document.addEventListener("DOMContentLoaded", updateCartBadge);
