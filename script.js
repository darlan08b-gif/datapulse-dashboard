const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const integer = new Intl.NumberFormat('pt-BR');
let allSales = [];
let charts = {};
const palette = ['#7862e8','#45a4df','#f0a45d','#54c99a'];

async function init(){
  try{
    const response = await fetch('data/vendas.csv');
    if(!response.ok) throw new Error('Não foi possível carregar data/vendas.csv');
    allSales = parseCSV(await response.text());
    populateFilters();
    bindEvents();
    updateDashboard();
  }catch(error){
    document.querySelector('.main-content').insertAdjacentHTML('afterbegin',
      `<div class="panel" style="padding:14px;margin-bottom:15px;color:#b64b4b">Erro ao carregar os dados. Abra o projeto por um servidor local ou pelo GitHub Pages. ${error.message}</div>`);
  }
}
function parseCSV(text){
  const lines=text.trim().split(/\r?\n/), headers=lines.shift().split(',');
  return lines.map(line=>{
    const values=line.split(',');
    return Object.fromEntries(headers.map((h,i)=>[h,values[i]]));
  }).map(r=>({...r,quantidade:Number(r.quantidade),preco_unitario:Number(r.preco_unitario),faturamento:Number(r.faturamento)}));
}
function populateFilters(){
  const months=[...new Map(allSales.map(r=>[r.mes,r.mes_label])).entries()];
  months.forEach(([value,label])=>monthFilter.add(new Option(label,value)));
  [...new Set(allSales.map(r=>r.categoria))].sort().forEach(v=>categoryFilter.add(new Option(v,v)));
  [...new Set(allSales.map(r=>r.regiao))].sort().forEach(v=>regionFilter.add(new Option(v,v)));
}
function bindEvents(){
  [monthFilter,categoryFilter,regionFilter].forEach(el=>el.addEventListener('change',updateDashboard));
  resetBtn.addEventListener('click',()=>{monthFilter.value=categoryFilter.value=regionFilter.value='all';updateDashboard();});
  exportBtn.addEventListener('click',exportCSV);
}
function filtered(){
  return allSales.filter(r=>(monthFilter.value==='all'||r.mes===monthFilter.value)&&
    (categoryFilter.value==='all'||r.categoria===categoryFilter.value)&&
    (regionFilter.value==='all'||r.regiao===regionFilter.value));
}
function sum(data,key){return data.reduce((a,r)=>a+r[key],0)}
function updateDashboard(){
  const data=filtered(), revenue=sum(data,'faturamento'), orders=data.length, units=sum(data,'quantidade');
  revenueKpi.textContent=money.format(revenue);
  ordersKpi.textContent=integer.format(orders);
  ticketKpi.textContent=money.format(orders?revenue/orders:0);
  unitsKpi.textContent=integer.format(units);
  recordCount.textContent=`${integer.format(orders)} registros`;
  renderCharts(data);renderTable(data);
}
function grouped(data,key,labelKey){
  const result={};
  data.forEach(r=>{const k=r[key];if(!result[k])result[k]={label:labelKey?r[labelKey]:k,value:0};result[k].value+=r.faturamento;});
  return result;
}
function chartOptions(){return {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#202338',padding:11,callbacks:{label:c=>` ${money.format(c.raw)}`}}}}}
function renderCharts(data){
  Object.values(charts).forEach(c=>c.destroy());charts={};
  const byMonth=grouped(data,'mes','mes_label');
  const monthKeys=Object.keys(byMonth).sort();
  charts.revenue=new Chart(document.getElementById('revenueChart'),{type:'line',data:{labels:monthKeys.map(k=>byMonth[k].label),datasets:[{data:monthKeys.map(k=>byMonth[k].value),borderColor:'#7862e8',backgroundColor:'rgba(120,98,232,.10)',fill:true,tension:.38,pointRadius:3,pointHoverRadius:5,borderWidth:2}]},options:{...chartOptions(),scales:{x:{grid:{display:false},ticks:{color:'#999cad',font:{size:9}}},y:{beginAtZero:true,grid:{color:'#f0f1f6'},ticks:{color:'#999cad',font:{size:9},callback:v=>`R$${Math.round(v)}`}}}}});
  const byCat=grouped(data,'categoria');
  const catNames=Object.keys(byCat).sort((a,b)=>byCat[b].value-byCat[a].value);
  charts.category=new Chart(document.getElementById('categoryChart'),{type:'doughnut',data:{labels:catNames,datasets:[{data:catNames.map(k=>byCat[k].value),backgroundColor:palette,borderWidth:3,borderColor:'#fff',hoverOffset:5}]},options:{...chartOptions(),cutout:'70%'}});
  categoryLegend.innerHTML=catNames.map((k,i)=>`<div class="legend-item"><span class="legend-dot" style="background:${palette[i%palette.length]}"></span>${k}<span class="legend-value">${(byCat[k].value/(sum(data,'faturamento')||1)*100).toFixed(0)}%</span></div>`).join('');
  const byRegion=grouped(data,'regiao');
  const regionNames=Object.keys(byRegion).sort((a,b)=>byRegion[b].value-byRegion[a].value);
  charts.region=new Chart(document.getElementById('regionChart'),{type:'bar',data:{labels:regionNames,datasets:[{data:regionNames.map(k=>byRegion[k].value),backgroundColor:'#8b78ed',borderRadius:5,maxBarThickness:34}]},options:{...chartOptions(),scales:{x:{grid:{display:false},ticks:{color:'#999cad',font:{size:9}}},y:{beginAtZero:true,grid:{color:'#f0f1f6'},ticks:{color:'#999cad',font:{size:9},callback:v=>`R$${Math.round(v)}`}}}}});
}
function renderTable(data){
  const sorted=[...data].sort((a,b)=>b.mes.localeCompare(a.mes)||b.pedido.localeCompare(a.pedido)).slice(0,10);
  salesTable.innerHTML=sorted.length?sorted.map(r=>`<tr><td>${r.pedido}</td><td>${r.mes_label}</td><td>${r.produto}</td><td><span class="category-pill">${r.categoria}</span></td><td>${r.regiao}</td><td>${r.quantidade}</td><td>${money.format(r.faturamento)}</td></tr>`).join(''):`<tr><td colspan="7" style="text-align:center;padding:24px">Nenhum registro encontrado para esses filtros.</td></tr>`;
}
function exportCSV(){
  const data=filtered(), headers=Object.keys(allSales[0]||{});
  const csv=[headers.join(';'),...data.map(r=>headers.map(h=>String(r[h]).replace('.',',')).join(';'))].join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vendas-filtradas.csv';a.click();URL.revokeObjectURL(url);
}
init();
