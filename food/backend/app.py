from flask import Flask, render_template, request, jsonify,session
import pandas as pd
import os
import requests
app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.secret_key = "recipe_secret"

# CSV PATH FIX
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "..", "dataset", "recipes.csv")
data = pd.read_csv(csv_path)
users = {}   # username : password
@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    password = request.form.get("password")

    if username in users:
        return jsonify({"status": "exists"})

    users[username] = password
    return jsonify({"status": "created"})

# HOME → show all recipes first
@app.route("/")
def home():
    recipes = data.to_dict(orient="records")
    return render_template("index.html", recipes=recipes)

# SEARCH


@app.route("/search")
def search():
    query = request.args.get("q", "")

    url = f"https://www.themealdb.com/api/json/v1/1/search.php?s={query}"
    response = requests.get(url)
    data = response.json()

    recipes = []

    if data["meals"]:
        for meal in data["meals"]:
            ingredients = []

            for i in range(1, 21):
                ing = meal.get(f"strIngredient{i}")
                measure = meal.get(f"strMeasure{i}")

                if ing and ing.strip() != "":
                    ingredients.append(f"{ing} - {measure}")

            recipes.append({
                "name": meal["strMeal"],
                "ingredients": ", ".join(ingredients),
                "process": meal["strInstructions"],
                "image": meal["strMealThumb"]
            })

    return jsonify(recipes)
@app.route("/category")
def category():
    cat = request.args.get("c")

    url = f"https://www.themealdb.com/api/json/v1/1/filter.php?c={cat}"
    response = requests.get(url)
    data = response.json()

    recipes = []

    if data["meals"]:
        for meal in data["meals"]:
            recipes.append({
                "name": meal["strMeal"],
                "ingredients": "Click to view full recipe",
                "process": "Click search to see full process",
                "image": meal["strMealThumb"]
            })

    return jsonify(recipes)

@app.route("/country")
def country():
    area = request.args.get("a")

    url = f"https://www.themealdb.com/api/json/v1/1/filter.php?a={area}"
    response = requests.get(url)
    data = response.json()

    recipes = []

    if data["meals"]:
        for meal in data["meals"]:
            recipes.append({
                "name": meal["strMeal"],
                "ingredients": "Click search to see ingredients",
                "process": "Click search to see full process",
                "image": meal["strMealThumb"]
            })

    return jsonify(recipes)
# LOGIN
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")

    if username in users and users[username] == password:
        session["user"] = username
        return jsonify({"status": "success", "user": username})
    else:
        return jsonify({"status": "fail"})
@app.route("/logout")
def logout():
    session.pop("user", None)
    return jsonify({"status": "logout"})
@app.route("/current_user")
def current_user():
    user = session.get("user")
    return jsonify({"user": user})

if __name__ == "__main__":
    app.run(debug=True)
