from flask import request
import bcrypt


def flask(param):
    pass


admin = {
    'user_id': 'admin',
    'username': 'admin',
    'firstname': 'Admin',
    'lastname': 'Admin',
}


def user_login(collection):
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()

    if username and password:
        # if username.lower() == 'admin' and password == 'Admin.123':
        #     return True, admin
        # else:
        isLogin, user = check_for_user_credentials(
            username, password, collection)

        return isLogin, user
        # if isLogin:
        #     print("redirecting to dashboard")
        #     # return redirect(url_for('user_dashboard'))
        #     return True, user
        # else:
        #     return "false", None
    return False, None


def check_for_user_credentials(username, password, collection):
    user = collection.find_one({'email': username})
    print(user)
    #if user and user['password'] == password:
    if user and (user['password'] == password or bcrypt.checkpw(password.encode('utf-8'), user['password'])):
        user_data = {
            'user_id': str(user['_id']),
            'username': user['email'],
            'firstname': user['firstname'],
            'lastname': user['lastname'],
            'address': user['address'],
            'type': user['type'] if 'type' in user else 'user',
        }
        return True, user_data
    return False, None
