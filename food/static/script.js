// ---------- LOAD ALL RECIPES ON START ----------
window.onload = function () {
    loadHome();
};

// ---------- LOAD HOME (ALL RECIPES) ----------
function loadHome() {
    fetch("/search?q=")
        .then(res => res.json())
        .then(data => showRecipes(data));
}

// ---------- SEARCH ----------
function searchRecipe() {
    let q = document.getElementById("search").value || "";

    fetch("/search?q=" + encodeURIComponent(q))
        .then(res => res.json())
        .then(data => showRecipes(data))
        .catch(err => {
            console.log(err);
            alert("Search Error");
        });
}


// ---------- DISPLAY RECIPES ----------

let currentRecipes = [];


function showRecipes(recipes) {

    currentRecipes = recipes;   // store globally

    let container = document.getElementById("recipes");
    container.innerHTML = "";

    if (recipes.length === 0) {
        container.innerHTML = "<h3>No recipes found</h3>";
        return;
    }

    recipes.forEach((r, index) => {

        let img = r.image && r.image !== "nan"
            ? r.image
            : "https://via.placeholder.com/250x180?text=No+Image";

        let card = `
        <div class="card">
            <img src="${img}" class="food-img">
            <h2>${r.name}</h2>
            <p><b>Ingredients:</b> ${r.ingredients}</p>

            <button onclick="toggleProcess(${index})">
                👀 View Process
            </button>

            <div id="process-${index}" style="display:none; margin-top:10px;">
                <p><b>Process:</b> ${r.process}</p>
            </div>

            <button onclick="addFav(${index})">
                ❤️ Add to Favorites
            </button>
        </div>
        `;

        container.innerHTML += card;
    });
}
function toggleProcess(id){
    let box = document.getElementById("process-" + id);

    if(box.style.display === "none"){
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

// ---------- SHOW LOGIN BOX ----------
function showLogin() {
    document.getElementById("loginBox").style.display = "block";
}

// ---------- LOGIN ----------
function loginUser() {
    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;

    fetch("/login", {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded"},
        body: `username=${u}&password=${p}`
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status==="success"){
            alert("Login Success");
            document.getElementById("loginBox").style.display="none";
            document.getElementById("welcomeUser").innerText = "Welcome, " + data.user;
        }else{
            alert("Wrong Details");
        }
    });
}

// ---------- ADD FAVORITE ----------
function addFav(index){

    let recipe = currentRecipes[index];

    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (favs.find(f => f.name === recipe.name)) {
        alert("Already in Favorites ❤️");
        return;
    }

    favs.push(recipe);

    localStorage.setItem("favorites", JSON.stringify(favs));

    alert("Added to Favorites ❤️");
}

// ---------- SHOW FAVORITES ----------
function showFav() {

    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");

    let box = document.getElementById("recipes");
    box.innerHTML = "<h2 style='text-align:center;'>❤️ Your Favorites</h2>";

    if (favs.length === 0) {
        box.innerHTML += "<h3 style='text-align:center;'>No Favorites Yet</h3>";
        return;
    }
    favs.forEach(r => {
        box.innerHTML += `
        <div class="card">
            <img src="${r.image}" class="food-img">
            <h2>${r.name}</h2>
            <p><b>Ingredients:</b> ${r.ingredients}</p>
        </div>`;
    }); 
}
function removeFav(name){

    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");

    favs = favs.filter(f => f.name !== name);

    localStorage.setItem("favorites", JSON.stringify(favs));

    showFav(); // refresh list
}
function registerUser(){
    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;

    fetch("/register",{
        method:"POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded"},
        body:`username=${u}&password=${p}`
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status==="created"){
            alert("Account Created! Now Login");
        }else{
            alert("User already exists");
        }
    });
}
function logoutUser(){
    fetch("/logout")
    .then(()=>location.reload());
}
function showHome(){
    location.reload();
}

function showLogin(){
    document.getElementById("loginBox").style.display="block";
}


function showProfile(){
    fetch("/current_user")
    .then(res=>res.json())
    .then(data=>{
        if(data.user){
            alert("Logged in as: " + data.user);
        }else{
            alert("Not logged in");
        }
    });
}
function loadCategory(cat){
    fetch("/category?c=" + cat)
        .then(res => res.json())
        .then(data => showRecipes(data));
}
function loadCountry(area){
    if(area === "") return;

    fetch("/country?a=" + area)
        .then(res => res.json())
        .then(data => showRecipes(data));
}