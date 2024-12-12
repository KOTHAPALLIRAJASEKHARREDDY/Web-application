import re
import json
from doctest import debug

from flask import Flask, request, render_template, send_from_directory, redirect, url_for, flash, jsonify, session
from dbManager import DbManager
from validators import validate_input
from login import user_login
from dashboard import get_rentals_db
from appliances import get_appliances_db, update_appliance_db, add_appliance_db, delete_appliance_db, \
    find_appliances_by_id, get_appliance_by_id
from datetime import timedelta
from rentalagreement import get_products_by_ids_db

app = Flask(__name__)
app.secret_key = 'ABCD123'
app.permanent_session_lifetime = timedelta(minutes=30)


@app.route('/')
def index():
    collection = DbManager.get_appliances_collection()
    items_Data = collection.find()
    items_Data = list(items_Data)
    for item in items_Data:
        item['appliance_id'] = str(item['_id'])
    return render_template('homepage.html', product_data=items_Data)



@app.route('/login', methods=['GET', 'POST'])
@app.route('/login.html', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        isLogin, user = user_login(DbManager.get_users_collection())
        if isLogin:
            session.permanent = True
            session['email'] = request.form.get('username', '').strip()
            if session.get('redirect'):
                args = session.pop('redirect')
                user['type'] = 'redirect'
                user['redirect'] = args['redirect']
                if 'params' in args and args['params'] is not None:
                    user['params'] = args['params']
                return jsonify({'status': 'success', 'user_data': user})
            else:
                return jsonify({'status': 'success', 'user_data': user})
            # return redirect(url_for('user_dashboard'))
        else:
            # flash('Invalid username or password')
            return jsonify({'status': 'failure', 'message': 'Invalid username or password'})
            # return render_template('login.html')
    else:
        if 'email' in session:
            return redirect(url_for('user_dashboard'))
        return render_template('login.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        user_data = validate_input()
        (DbManager.get_users_collection()).insert_one(user_data)
        return render_template('login.html')
    else:
        return render_template('SignUp.html')


@app.route('/getrentals/<user_id>', methods=['GET'])
def get_rentals(user_id):
    rentals = get_rentals_db(user_id)
    return {'status': 'success', 'data': rentals}


@app.route('/getAllAppliances', methods=['GET'])
def get_appliances():
    appliances = get_appliances_db()
    return jsonify({'status': 'success', 'data': appliances})


@app.route("/updateAppliance/<appliance_id>", methods=['PATCH'])
def update_appliance(appliance_id):
    appliance = request.get_json()
    print(appliance)

    result = update_appliance_db(appliance_id, appliance)

    if result:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'failure'})


@app.route('/addAppliance', methods=['POST'])
def add_appliance():
    appliance = request.get_json()
    print(appliance)

    result = add_appliance_db(appliance)
    if result:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'failure'})


@app.route('/deleteAppliance/<appliance_id>', methods=['DELETE'])
def delete_appliance(appliance_id):
    result = delete_appliance_db(appliance_id)
    if result:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'failure'})


@app.route('/findProducts', methods=['POST'])
def find_appliances():
    appliancesList = request.get_json()
    print(appliancesList)
    print(appliancesList.get('products'))
    DbManager.add_to_cart(appliancesList.get('products'), DbManager.get_user_by_mail(session['email']))
    appliances = find_appliances_by_id(appliancesList.get('products'))
    if appliances:
        return jsonify({'status': 'success',  'data': appliances})
    else:
        return jsonify({'status': 'failure',  'data': []})


@app.route('/logout')
def logout():
    if 'email' in session:
        session.pop('email', None)
        return redirect(url_for('login'))
    else:
        return 'already logout'


@app.route('/dashboard')
def user_dashboard():
    if session.get('email') is None:
        session['redirect'] = {"redirect": "/dashboard"}
        return redirect(url_for('login'))
    user_details = (DbManager.get_users_collection()
                    ).find_one({'email': session['email']})
    usr_name = user_details['firstname']
    return render_template('userdashboard.html', name=usr_name)


@app.route('/admindashboard')
def admin_dashboard():
    if session.get('email') is None:
        return redirect(url_for('login'))
    return render_template('admindashboard.html')


@app.route('/cart')
def cart_page():
    if session.get('email') is None:
        return redirect(url_for('login'))
    return render_template('cart.html')


@app.route('/addtocart')
def add_to_cart():
    mail = session.get('email')
    user_data = DbManager.get_user_by_mail(mail)
    App_id = request.args.get('id')
    DbManager.addtocart(App_id, user_data)


@app.route('/placeorder', methods=['POST'])
def place_order():
    is_success, display_info = DbManager.add_order_to_db(
        request.args.get('product_id'), session.get('email'))
    if is_success:
        # return redirect('/conform?product_id=' + request.args.get('product_id'))
        # return render_template('conformation.html', display_data=display_info)
        display_info['order_id'] = str(display_info['order_id'])
        session['order_info'] = display_info
        return redirect(url_for('payment'))
    else:
        return "failed"


@app.route('/checkout', methods=['POST'])
def checkout_page():
    if session.get('email') is None:
        return redirect(url_for('login'))

    user = request.get_json().get('user')
    print(user)
    products = request.get_json().get('products')
    print(products)
    paymentData = request.get_json().get('paymentData')

    saved_data = []
    for product in products:
        is_data_saved, saved_product = DbManager.add_order_to_db_cart(
            product, user)
        if not is_data_saved:
            break
        saved_data.append(saved_product)

    if saved_data.__len__() == products.__len__():
        is_success = DbManager.add_cart_payment_details_to_db(
            saved_data, paymentData)
        if is_success:
            return {'status': 'success', 'message': 'Order placed successfully', 'data': {'user': user, 'products': saved_data}}
        else:
            return {'status': 'failure', 'message': 'Failed to save payment details'}
    else:
        return {'status': 'failure', 'message': 'Failed to place order'}


@app.route('/payment', methods=['GET', 'POST'])
def payment():
    data = session.get('order_info')
    if request.method == 'GET':
        return render_template('payment.html', order_data=data)
    else:
        is_success = DbManager.add_payment_details_to_db(data)
        if is_success:
            if data:
                session.pop('order_info', None)
                data["date"] = data["date"].date()
            return render_template('conformation.html', display_data=data)
        else:
            return "Issue Happened try again later"


@app.route('/cartpayment', methods=['GET'])
@app.route('/cartpayment.html', methods=['GET'])
def cart_payment():
    if session.get('email') is None:
        return redirect(url_for('login'))
    return render_template('cartpayment.html')


@app.route('/conform')
def conform():
    return render_template('conformation.html')


@app.route('/getProductsByIds', methods=['POST'])
def fetch_products_by_ids():
    user = request.get_json().get('user')
    productIds = request.get_json().get('productIds')

    products_data = get_products_by_ids_db(productIds, user)
    print(products_data)
    return jsonify({'status': 'success', 'data': products_data})


@app.route('/checkoutConfirmation')
@app.route('/checkoutConfirmation.html')
def checkout_confirmation():
    return render_template('checkoutConfirmation.html')


@app.route('/order')
def order_page():
    if session.get('email') is None:
        session['redirect'] = {
            "redirect": "/order", "params": {'product_id': request.args.get('product_id')}}
        return redirect(url_for('login'))
    else:
        return render_template('order.html', item_Details=DbManager.get_Appliances_Details_WithId(request.args.get('product_id')))


@app.route('/orderreturn')
def order_return():
    customer = DbManager.get_customers_details_by_mail(session.get('email'))
    order_data = DbManager.get_rentals_by_customer_id(customer['customer_id'])
    product_Data = []
    for item in DbManager.get_rentals_by_customer_id(customer['customer_id']):
        product_Data.append(DbManager.get_Appliances_Details_WithId(item['appliance_id']))
    combined_data = zip(order_data, product_Data)
    return render_template('orderstatus.html', orders_data=combined_data)


@app.route('/maintence')
def maintenance():
    return render_template('maintenance.html')


@app.route('/contact')
def contact():
    return render_template('contact-us.html')


@app.route('/orderapprove')
def order_approve():
    pending_orders = DbManager.get_all_pending_orders()
    return render_template('order_approved_change.html', pending=pending_orders)

@app.route('/return-product', methods=['POST'])
def return_product():
    id = request.args.get('id')
    is_success = DbManager.change_return_status(id)
    if is_success:
        return redirect(url_for('user_dashboard'))
    else:
        return "Something is issue"

@app.route('/changestatus', methods=['POST'])
def change_status():
    id = request.args.get('id')
    is_success = DbManager.request_change_status(id, request.form.get('order-status'))
    if is_success:
        return redirect(url_for('order_approve'))
    else:
        return "failed try later"

@app.route('/css/<path:filename>')
def send_css(filename):
    return send_from_directory('./css/', filename)


@app.route('/script/<path:filename>')
def send_javascript(filename):
    return send_from_directory('./script/', filename)


@app.route('/images/<path:filename>')
def send_imagesfile(filename):
    return send_from_directory('./images/', filename)


if __name__ == '__main__':
    app.run(debug=True)
