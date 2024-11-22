from flask import Flask, request, render_template, send_from_directory, redirect, url_for, flash, jsonify
from pymongo import MongoClient
from validators import validate_input
from login import user_login
from dashboard import get_rentals_db

app = Flask(__name__)
app.secret_key = 'ABCD123'

client = MongoClient(
    'mongodb+srv://rxk40660:Admin123@cluster0.oxjxd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['project']
collection = db['users']


@app.route('/')
def index():
    return render_template('login.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        isLogin, user = user_login(collection)
        if isLogin:
            return jsonify({'status': 'success', 'user_data': user})
            # return redirect(url_for('user_dashboard'))
        else:
            # flash('Invalid username or password')
            return jsonify({'status': 'failure', 'message': 'Invalid username or password'})
            # return render_template('login.html')
    else:
        return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        print(request.form)
        user_data = validate_input()
        collection.insert_one(user_data)
        return "Account created successfully!"
    else:
        return render_template('signup.html')


@app.route('/getrentals/<user_id>', methods=['GET'])
def get_rentals(user_id):
    rentals = get_rentals_db(user_id)
    return jsonify(rentals)


def admin():
    pass


@app.route('/css/<path:filename>')
def send_css(filename):
    return send_from_directory('./css/', filename)


@app.route('/script/<path:filename>')
def send_javascript(filename):
    return send_from_directory('./script/', filename)


@app.route('/dashboard')
def user_dashboard():
    return render_template('userdashboard.html')


@app.route('/logout')
def user_logout():
    return render_template('login.html')


if __name__ == '__main__':
    app.run(debug=True)
