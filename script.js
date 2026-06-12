const ADMIN_PIN = "1234";

let isAdmin = false;

let products = JSON.parse(localStorage.getItem("products")) || [
    {name:"콜라",icon:"🥤",stock:10},
    {name:"사이다",icon:"🍋",stock:8},
    {name:"캔커피",icon:"☕",stock:5},
    {name:"물",icon:"💧",stock:12},
    {name:"핫식스",icon:"⚡",stock:3},
    {name:"몬스터",icon:"👹",stock:2}
];

function saveData(){
    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    updateStats();
}

function updateStats(){

    document.getElementById("productCount").textContent =
        products.length;

    document.getElementById("totalStock").textContent =
        products.reduce((sum,p)=>sum+p.stock,0);

    document.getElementById("soldOutCount").textContent =
        products.filter(p=>p.stock===0).length;
}

function renderProducts(){

    const keyword =
        document.getElementById("search")
        .value
        .toLowerCase();

    const container =
        document.getElementById("products");

    container.innerHTML = "";

    products.forEach((p,index)=>{

        if(
            !p.name
            .toLowerCase()
            .includes(keyword)
        ) return;

        const low =
            p.stock <= 3;

        const soldout =
            p.stock === 0;

        container.innerHTML += `
        <div class="card">

            <div class="product-header">

                <div class="icon">${p.icon}</div>

                <div>

                    <h3>${p.name}</h3>

                    <div class="${low ? "low" : ""}">
                        재고 ${p.stock}개
                    </div>

                    ${
                        soldout
                        ? `<div class="soldout">품절</div>`
                        : ""
                    }

                </div>

            </div>

            <div class="controls ${!isAdmin ? "locked" : ""}">

                <button on‍click="changeStock(${index},1)">+</button>

                <button on‍click="changeStock(${index},-1)">-</button>

                <input
                    type="number"
                    min="0"
                    value="${p.stock}"
                    onchange="setStock(${index},this.value)"
                >

            </div>

        </div>
        `;
    });

    updateStats();
}

function changeStock(index,value){

    if(!isAdmin) return;

    products[index].stock += value;

    if(products[index].stock < 0){
        products[index].stock = 0;
    }

    saveData();
    renderProducts();
}

function setStock(index,value){

    if(!isAdmin) return;

    products[index].stock =
        Math.max(0, parseInt(value)||0);

    saveData();
    renderProducts();
}

function adminLogin(){

    if(isAdmin){

        isAdmin = false;

        alert("관리자 모드 종료");

        renderProducts();

        return;
    }

    const pin =
        prompt("관리자 PIN 입력");

    if(pin === ADMIN_PIN){

        isAdmin = true;

        alert("관리자 모드 활성화");

        renderProducts();

    }else{

        alert("PIN 오류");
    }
}

function toggleTheme(){

    document.body.classList.toggle("dark");
}

function resetStock(){

    if(
        !confirm(
            "모든 재고를 초기화할까요?"
        )
    ) return;

    products.forEach(
        p=>p.stock=0
    );

    saveData();
    renderProducts();
}

function exportCSV(){

    let csv =
        "상품명,재고\n";

    products.forEach(p=>{

        csv +=
            `${p.name},${p.stock}\n`;
    });

    const blob =
        new Blob(
            [csv],
            {type:"text/csv"}
        );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        "stock.csv";

    a.click();
}

function importCSV(event){

    const file =
        event.target.files[0];

    if(!file) return;

    const reader =
        new FileReader();

    reader.onload = e=>{

        const rows =
            e.target.result
            .split("\n");

        rows.shift();

        rows.forEach(row=>{

            const [name,stock] =
                row.split(",");

            const item =
                products.find(
                    p=>p.name===name
                );

            if(item){

                item.stock =
                    parseInt(stock)||0;
            }
        });

        saveData();
        renderProducts();
    };

    reader.readAsText(file);
}

renderProducts();