
const L={
  intro:"https://hpxkh.pse.is/hpxkh_intro",
  start:"https://hpxkh.pse.is/hpxkh_start",
  place:"https://hpxkh.pse.is/hpxkh_Place",
  cal:"https://hpxkh.pse.is/hpxkh_calendar",
  books:"https://hpxkh.pse.is/hpxkh_books",
  badge:"https://hpxkh.pse.is/apply_badge",
  post:"https://hpxkh.pse.is/apply_post",
  fb:"https://www.facebook.com/hpxkaohsiung",
  group:"https://www.facebook.com/groups/KaohsiungHPX",
  night:"https://reurl.cc/GpVY1A"
};


const TYPES=[
 {no:"01",zh:"新人小聚",en:"New Friends",d:"協助新成員快速了解讀書會理念、運作與參與方式，輕鬆融入並展開學習旅程。"},
 {no:"02",zh:"書聚",en:"Book Club",d:"以一本書為核心，透過章節導讀、交流討論與觀點分享，在數次聚會中逐步深入書中內容。"},
 {no:"03",zh:"R4A 月讀",en:"Read for Action",d:"由導讀者進行簡報與分享，並透過小組引導與合作等方式，共同討論與延伸書中內容。",note:"每月一聚一本書"},
 {no:"04",zh:"主題聚",en:"Theme Gathering",d:"以閱讀結合不同生活主題的聚會形式，例如「閱讀 × 美食」、「閱讀 × 運動」，讓閱讀不只停留在書本。"},
 {no:"05",zh:"十分鐘分享會",en:"10-Min Sharing",d:"用一段不長的時間，分享一本書、一個觀點或一次學習體悟，看見更多不同的視角與靈感。"},
 {no:"06",zh:"職人分享會",en:"Expert Sharing",d:"邀請讀書會成員中的專業人士交流實務經驗與洞見，拓展視野並深化彼此學習。"},
 {no:"07",zh:"TALK 講座",en:"Talk & Insight",d:"邀請外部講師／專家分享觀點，拓展視野，帶來多元思考與深度啟發。"},
 {no:"08",zh:"輕鬆聚",en:"Casual Fun",d:"以輕鬆交流與生活體驗為主，例如桌遊、野餐、密室逃脫、爬山、旅遊等互動體驗。",note:"每月僅限一次・社團預約報名"},
 {no:"09",zh:"大聚",en:"Annual Gathering",d:"串連各書聚與活動的年度盛會，提供成員專業交流、讀書分享與互動體驗的機會。",note:"年中或年末舉辦"}
];

const cardx=o=>{
  const inner='<div class="cardx__top">'+(o.n?'<span class="cardx__no">'+o.n+'</span>':'')+'<h4>'+o.h+'</h4></div>'+
    '<p>'+o.d+'</p><span class="cardx__go">'+(o.go||"開啟 →")+'</span>';
  if(o.soon)return '<div class="cardx" style="opacity:.55">'+inner+'</div>';
  const ext=o.u.startsWith("#")?"":' target="_blank" rel="noopener"';
  return '<a class="cardx" href="'+o.u+'"'+ext+'>'+inner+'</a>';
};






(document.getElementById("meetupForms")||{}).innerHTML=[
 {h:"如何開始一場書聚",d:"新手必看！帶您掌握書聚的流程與核心，輕鬆開始第一步。",go:"開啟簡報 →",u:L.start},
 {h:"常辦書聚地點",d:"整理常見書聚地點，方便您找到適合的場地與夥伴。推薦場地請私訊粉專。",go:"開啟列表 →",u:L.place},
 {h:"書聚徽章申請表",d:"完成書聚後，由主辦人為成員提出徽章申請。",go:"前往填寫 →",u:L.badge}
].map(cardx).join("");

(document.getElementById("docFiles")||{}).innerHTML=[
 {h:"認識 HPX",d:"社團的理念與歷程簡報。",u:L.intro},
 {h:"如何開始一場書聚",d:"書聚的流程與核心，新手必看。",u:L.start},
 {h:"常辦書聚地點",d:"常見書聚地點整理。",u:L.place},
 {h:"歷年活動清單索引",d:"歷年書聚、新人聚、輕鬆聚與各種活動講座的索引。",u:L.books}
].map(cardx).join("");

(document.getElementById("docForms")||{}).innerHTML=[
 {h:"書聚徽章申請表",d:"完成書聚後，由主辦人為成員提出徽章申請。",go:"前往填寫 →",u:L.badge},
 {h:"社團外廣告貼文申請表",d:"非書聚相關的宣傳貼文，需先申請並取得管理員或版主同意（版規第 6 條）。",go:"前往填寫 →",u:L.post}
].map(cardx).join("");

(document.getElementById("contactCards")||{}).innerHTML=[
 {h:"高雄讀會行事曆",d:"每月活動行程一覽，可訂閱至個人 Google 日曆。",go:"開啟行事曆 →",u:L.cal},
 {h:"LINE 官方帳號",d:"籌備中。上線後將成為活動報名與提問的主要窗口。",go:"即將開放",soon:true}
].map(cardx).join("");

(document.getElementById("footSocial")||{}).innerHTML='<h5>Community</h5><ul>'+
 '<li><a href="'+L.group+'" target="_blank" rel="noopener">臉書社團</a></li>'+
 '<li><a href="'+L.fb+'" target="_blank" rel="noopener">粉絲專頁 書香南國</a></li>'+
 '<li><a href="'+L.cal+'" target="_blank" rel="noopener">高雄讀會行事曆</a></li>'+
 '<li><a href="'+L.night+'" target="_blank" rel="noopener">HPX 高雄宵夜團</a></li>'+
 '<li><span class="off">LINE 官方帳號（籌備中）</span></li></ul>';

