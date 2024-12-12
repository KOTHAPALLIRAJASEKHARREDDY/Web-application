import re
from flask import abort, request
import bcrypt


def validate_input():
    firstname = request.form.get('firstname', '').strip()
    lastname = request.form.get('lastname', '').strip()
    address = request.form.get('address', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    ssn = request.form.get('ssn', '').strip()
    password = request.form.get('password', '').strip()

    if not firstname or not lastname:
        abort(400, "Firstname and Lastname are required.")

    if not re.match("^[A-Za-z '-]+$", firstname) or not re.match("^[A-Za-z '-]+$", lastname):
        abort(400, "Firstname and Lastname can only contain letters, spaces, and hyphens.")

    if not address:
        abort(400, "Address is required.")

    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        abort(400, "Invalid email format.")

    phone_regex = r'^(?:\+?1?\d{9,15}|[0-9]{3}-[0-9]{3}-[0-9]{4})$'
    if not re.match(phone_regex, phone):
        abort(400, "Invalid phone number format.")

    ssn_regex = r'^\d{3}-\d{2}-\d{4}$'
    if not re.match(ssn_regex, ssn):
        abort(400, "Invalid SSN format. Expected format: XXX-XX-XXXX")

    if len(password) < 8:
        abort(400, "Password must be at least 8 characters long.")

    return {
        'firstname': firstname,
        'lastname': lastname,
        'address': address,
        'email': email,
        'phone': phone,
        'ssn': ssn,
        'password': get_encripted_password(password),
    }

def get_encripted_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())