from flask import Flask, request, render_template, jsonify, send_file, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
import io
import os
import datetime
import json
import requests
from telegram import Update
from telegram.ext import CommandHandler, CallbackContext, Updater
import time

# from dotenv import load_dotenv
# load_dotenv()

# ----------------------------------------------------- CREDENTIALS --------------------------------------------------------------- #
username = os.environ.get('DB_USERNAME')
password = os.environ.get('DB_PASSWORD')
hostname = os.environ.get('DB_HOST')
db_name = os.environ.get('DB_NAME')
telegram_api_token = os.environ.get('TELEGRAM_API_TOKEN')
port = 3306

# ------------------------------------- OBJECT INITIALIZATION AND DATABASE CONNECTION -------------------------------------------- #
app = Flask(__name__)
CORS(app) 
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{username}:{password}@{hostname}:{port}/{db_name}'
app.config['SECRET_KEY'] = "abcdefg"
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
bcrypt = Bcrypt(app)

# ---------------------------------------------DATABASE CLASSES INITIALIZATION --------------------------------------------------- #
class ReportSubscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.String(255), nullable=False)

class UsersData(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), unique=True, nullable=False)
    user_role = db.Column(db.String(250), unique=True, nullable=False)


class TwistingData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    datetime = db.Column(db.String(255), nullable=False)
    operator = db.Column(db.String(255))
    machine_number = db.Column(db.String(255))
    item_number = db.Column(db.String(255))
    rpm = db.Column(db.Integer)
    tpm = db.Column(db.Integer)
    stdTen = db.Column(db.Integer)
    devTen = db.Column(db.Integer)
    csv_file = db.Column(db.LargeBinary)

class WeavingData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    datetime = db.Column(db.String(255), nullable=False)
    operator = db.Column(db.String(255))
    machine_number = db.Column(db.String(255))
    production_order = db.Column(db.String(255))
    bale_number = db.Column(db.String(255))
    color_code = db.Column(db.String(255))
    style = db.Column(db.String(255))
    counter_number = db.Column(db.String(255))
    stdTen = db.Column(db.Integer)
    devTen = db.Column(db.Integer)
    csv_file = db.Column(db.LargeBinary)


def create_tables():
    with app.app_context():
        db.create_all()

# Use only for debugging db
def drop_tables():
    db.drop_all()

@login_manager.user_loader
def loader_user(user_id):
    return UsersData.query.get(user_id)


updater = Updater(token=telegram_api_token, use_context=True)
dispatcher = updater.dispatcher
webhook_url = "tension-data-recorder-luzikato-02.vercel.app/set-webhook"

def write_new_subs(chat_id):
    with app.app_context():  # Enter the application context
        new_data_entry = ReportSubscriber(
            chat_id=chat_id,
        )
        db.session.add(new_data_entry)
        db.session.commit()

def delete_subs(chat_id_rm):
    with app.app_context():
        record_to_remove = ReportSubscriber.query.filter_by(chat_id=chat_id_rm).first()
        if record_to_remove:
            db.session.delete(record_to_remove)
            db.session.commit()

# Define your handlers
def start(update: Update, context: CallbackContext) -> None:
    new_chat_id = update.message.chat_id
    existing_data = ReportSubscriber.query.filter_by(chat_id=new_chat_id).first()
    if not existing_data:
        write_new_subs(new_chat_id)
    update.message.reply_text("""
                              Hello! I am TeDaRe 🤖. I am your personal tension data reporter.\nBy receiving this message means you are already subscribed to my reports.
                              """)

def subs_detail(update: Update, context: CallbackContext) -> None:
    reply_text = f"This is your ID: {update.message.chat_id}"
    update.message.reply_text(reply_text)

def unsubs(update: Update, context: CallbackContext) -> None:
    delete_subs(update.message.chat_id)
    update.message.reply_text("You have successfully unsubscribed from my reports.\nGoodbye👋!")

def send_report(msg):
    url = f'https://api.telegram.org/bot{telegram_api_token}/sendMessage'  # Calling the Telegram API to reply to the message
    subs_data = ReportSubscriber.query.with_entities(ReportSubscriber.chat_id).all()
    chat_ids = [value for (value,) in subs_data]  # Extracting values from the result
    print(chat_ids)

    success_count = 0
    failure_reasons = {}

    for chat_id in chat_ids:
        time.sleep(0.5)
        payload = {
            'chat_id': chat_id,
            'text': msg
        }
        r = requests.post(url, json=payload)

        if r.status_code == 200:
            success_count += 1
        else:
            failure_reasons[chat_id] = r.text
            print(f"Failed to send report to chat ID {chat_id}. Reason: {r.text}")

    if success_count == len(chat_ids):
        return success_count, None, chat_ids
    else:
        return success_count, failure_reasons, chat_ids
        

# Add your handlers to the dispatcher
start_handler = CommandHandler('start', start)
dispatcher.add_handler(start_handler)

detail_handler = CommandHandler('mydetail', subs_detail)
dispatcher.add_handler(detail_handler)

unsub_handler = CommandHandler('unsub', unsubs)
dispatcher.add_handler(unsub_handler)

# Set up the Flask app to handle the webhook
@app.route('/set-webhook', methods=['POST'])
def telegram_webhook():
    try:
        json_str = request.get_data().decode('UTF-8')
        json_data = json.loads(json_str)
        
        update = Update.de_json(json_data, updater.bot)

        # Dispatch the update to the appropriate handlers
        dispatcher.process_update(update)

    except Exception as e:
        print(f"Error processing webhook: {str(e)}")

    return '', 200

# Set the webhook for your bot
updater.bot.setWebhook(url=webhook_url)

@app.route('/')
def index():
    return render_template('main.html')

@app.route('/twisting')
@login_required
def twisting():
    return render_template('twisting.html', user=current_user)

@app.route('/weaving')
@login_required
def weaving():
    return render_template('weaving.html', user=current_user)

@app.route('/showcase')
@login_required
def showcase():
    return render_template('showcase.html', user=current_user)

@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('login_page'))

@app.route('/login', methods=['GET'])
def login_page():
    if current_user.is_authenticated:
        return render_template(url_for('index'))
    else:
        return render_template('login.html', status=None)

@app.route('/user_login', methods=['POST'])
def auth_user():
    input_cred = request.get_json()
    username = input_cred['username']
    password = input_cred['password']
    user = UsersData.query.filter_by(username=username).first()
    print(f'Username: {username}')
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        return jsonify(success=True)
    else:
        return jsonify(success=False)

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("login_page"))


@app.route('/store_tw', methods=['POST'])
@login_required
def store_tw():
    json_data = request.get_json()
    datetime = json_data["datetime"]
    operator = json_data["operator"]
    machine_number = json_data["machineNumber"]  
    item_number = json_data["itemNum"]
    dtex = json_data["dtex"]
    spd_rpm = json_data["rpm"]
    twm = json_data["tpm"]
    specTen = json_data["stdTens"]
    devTens = json_data["devTens"]

    csv_data = f"Machine No.,{machine_number},Item Number,{item_number}\n"
    csv_data += f"RPM, {spd_rpm},D-tex,{dtex},Operator Name,{operator}\n"
    csv_data += f"TPM,{twm}\n"
    csv_data += f"Spec STD,{specTen}\n"
    csv_data += f"±,{devTens}\n"
    csv_data += "Spindle Number,MIN Value,MAX Value,Stated Problem(s)\n"

    ids = list(json_data.keys())
    numIdsToDelete = 9
    required_keys_id = ["MIN", "MAX", "Problems"]
    spindles_with_problems = ""

    # Loop through all IDs except the last few and append to csv_data
    for i in range(len(ids) - numIdsToDelete):
        id = ids[i]
        spd_data = {}
        for key_id in required_keys_id:
                try:
                    spd_data[key_id] = json_data[id][key_id]
                except KeyError:
                    # Handle the case when the key is not present, e.g., set a default value
                    spd_data[key_id] = ""
        for val in spd_data['MIN']:
            if val.isdigit():
                if int(spd_data["MIN"][0]) != 0 and int(spd_data["MIN"][0]) < int(specTen) - int(devTens):
                    spd_data["Problems"].append("Tension Rendah")
            break
        for val in spd_data['MAX']:
            if val.isdigit():
                if int(spd_data["MAX"][0]) != 0 and int(spd_data["MAX"][0]) > int(specTen) + int(devTens):
                    spd_data["Problems"].append("Tension Tinggi")
            break
        csv_data += f"{id},{spd_data['MIN']},{spd_data['MAX']},{spd_data['Problems']}\n"
        if spd_data['Problems'] and any(spd_data['Problems']):  # Check if the list is not empty
            problems_str = ', '.join(filter(lambda x: x.strip(), map(str, spd_data['Problems'])))
            spindles_with_problems += f"{id} --- {spd_data['MIN'][0]} --- {spd_data['MAX'][0]} --- {problems_str}\n"
    
    csv_data = csv_data.encode("utf-8")

    with app.app_context():  # Enter the application context
        new_data_entry = TwistingData(
            datetime=datetime,
            operator=operator,
            machine_number=machine_number,
            item_number=item_number,
            rpm = int(spd_rpm),
            tpm = int(twm),
            stdTen = int(specTen),
            devTen = int(devTens),
            csv_file=csv_data
        )

        db.session.add(new_data_entry)
        db.session.commit()
    
    msg = f"""[🚨ALERT FOR **TWISTING** FIXERS🚨]
    
Machine Number: {machine_number}
Operator: {operator}

Detected abnormalities per spindle: 
Spd No --- Min Val --- Max Val --- Problems
{spindles_with_problems}

Kindly confirm the listed problems and act accordingly.

[END OF REPORT]
    """
    if spindles_with_problems:
        success_count, failure_reasons, chat_ids = send_report(msg=msg)
        if success_count == len(chat_ids):
            response_message = "Report successfully sent to all subscribers."
        else:
            response_message = (
                f"Failed to send reports to some subscribers. "
                f"Successfully sent to {success_count} out of {len(chat_ids)} subscribers. "
                f"Failure reasons: {failure_reasons}"
            )
    else:
        response_message = "CSV data stored in the database."

    return jsonify({"message": response_message})


@app.route('/store_wv', methods=['POST'])
@login_required
def store_wv():
    json_data = request.get_json()
    operator = json_data["operator"]
    machine_number = json_data["machineNumber"]  
    production_order = json_data["productionOrder"]
    bale_no = json_data["baleNo"]
    color_code = json_data["colorCode"]
    style = json_data["style"]
    counter_number = json_data["counterNo"]
    specTen = json_data["stdTens"]
    devTens = json_data["devTens"]

    csv_data = ""
    current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Get current date and time
    csv_data += f"Tanggal,{current_datetime}\n"
    csv_data += f"Style,{style}\n"
    csv_data += f"PO,{production_order}\n\n"
    csv_data += f"Color,{color_code}\n"
    csv_data += f"Bale Ke,{bale_no}\n"
    csv_data += f"Loom,{machine_number}\n"
    csv_data += f"Meter,{counter_number}\n"
    csv_data += f"Date,{current_datetime}\n"
    csv_data += f"Operator,{operator}\n"

    tension_data = json_data.get("tensionData", {})
    problem_list = ""

    # Loop through all IDs and append to csv_data
    for sd, sd_data in tension_data.items():
        csv_data += f"{sd}\n"
        for rw, rw_data in sd_data.items():
            for col, col_data in rw_data.items():
                minTensionVal = col_data.get("MIN", "")
                maxTensionVal = col_data.get("MAX", "")
                problems = col_data.get("Problems", "")
                csv_data += f"{rw},{col},{maxTensionVal},{minTensionVal},{problems}\n"

                if problems and any(problems):
                    problems_str = ', '.join(filter(lambda x: x.strip(), map(str, problems)))
                    problem_list += f"{sd} --- {rw} --- {col} --- {minTensionVal[0]} --- {maxTensionVal[0]} --- {problems_str}\n"

    csv_data = csv_data.encode("utf-8")
    with app.app_context():  # Enter the application context
        new_data_entry = WeavingData(
            datetime=current_datetime,
            operator=operator,
            machine_number=machine_number,
            production_order = production_order,
            bale_number = bale_no,
            color_code = color_code,
            style = style,
            counter_number = counter_number,
            stdTen = specTen,
            devTen = devTens,
            csv_file=csv_data
        )

        db.session.add(new_data_entry)
        db.session.commit()
    msg = f"""[🚨ALERT FOR **WEAVING** FIXERS🚨]
    
Machine Number: {machine_number}
Operator: {operator}

Detected abnormalities per column: 
Side --- Row --- Col --- Min --- Max --- Problems
{problem_list}

Kindly confirm the listed problems and act accordingly.

[END OF REPORT]
    """
    if problem_list:
        success_count, failure_reasons, chat_ids = send_report(msg=msg)
        if success_count == len(chat_ids):
            response_message = "Report successfully sent to all subscribers."
        else:
            response_message = (
                f"Failed to send reports to some subscribers. "
                f"Successfully sent to {success_count} out of {len(chat_ids)} subscribers. "
                f"Failure reasons: {failure_reasons}"
            )
    else:
        response_message = "CSV data stored in the database."

    return jsonify({"message": response_message})

@app.route('/get_tw_data')
@login_required
def get_data():
    data = TwistingData.query.all()
    return jsonify([{'id': ten_data.id, 
                     'datetime': ten_data.datetime, 
                     'operator': ten_data.operator, 
                     'machine_number': ten_data.machine_number,
                     'item_number': ten_data.item_number,
                     'rpm': ten_data.rpm,
                     'tpm': ten_data.tpm,
                     'stdTen': ten_data.stdTen,
                     'devTen' : ten_data.devTen} for ten_data in data])

@app.route('/get_wv_data')
@login_required
def get_wv_data():
    data = WeavingData.query.all()
    return jsonify([{'id': ten_data.id, 
                     'datetime': ten_data.datetime, 
                     'operator': ten_data.operator, 
                     'machine_number': ten_data.machine_number,
                     'production_order': ten_data.production_order,
                     'bale_num': ten_data.bale_number,
                     'stdTen': ten_data.stdTen,
                     'devTen' : ten_data.devTen} for ten_data in data])

@app.route('/download_tw/<entry_id>')
@login_required
def download_tw(entry_id):
    # Retrieve the associated CSV data based on the entry_id
    # For example, assuming your database model has a 'data' column
    csv = TwistingData.query.get(entry_id).csv_file
    m_n = TwistingData.query.get(entry_id).machine_number
    op = TwistingData.query.get(entry_id).operator
    i_n = TwistingData.query.get(entry_id).item_number

    # Create a response with the CSV data and set appropriate headers
    response = send_file(
        io.BytesIO(csv),
        mimetype='text/csv; charset=utf-8',
        as_attachment=True,
        download_name=f'[{m_n}] - [{i_n}] - [{op}].csv'
    )
    return response

@app.route('/download_wv/<entry_id>')
@login_required
def download_wv(entry_id):
    # Retrieve the associated CSV data based on the entry_id
    # For example, assuming your database model has a 'data' column
    csv = WeavingData.query.get(entry_id).csv_file
    m_n = WeavingData.query.get(entry_id).machine_number
    op = WeavingData.query.get(entry_id).operator
    p_o = WeavingData.query.get(entry_id).production_order

    # Create a response with the CSV data and set appropriate headers
    response = send_file(
        io.BytesIO(csv),
        mimetype='text/csv; charset=utf-8',
        as_attachment=True,
        download_name=f'[{m_n}] - [{p_o}] - [{op}].csv'
    )
    return response

if __name__ == '__main__':
    with app.app_context():  # Enter the application context
        # drop_tables()
        updater.start_polling(timeout=600)
        create_tables()
    app.run(debug=False)