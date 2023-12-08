from flask import Flask, request, render_template, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
import io
import os
import datetime
import json
import requests
from telegram import Update
from telegram.ext import CommandHandler, CallbackContext, MessageHandler, Filters, Updater

# from dotenv import load_dotenv
# load_dotenv()

username = os.environ.get('DB_USERNAME')
password = os.environ.get('DB_PASSWORD')
hostname = os.environ.get('DB_HOST')
db_name = os.environ.get('DB_NAME')
telegram_api_token = os.environ.get('TELEGRAM_API_TOKEN')

print(f"Database Host: {hostname}")
port = 3306

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{username}:{password}@{hostname}:{port}/{db_name}'
db = SQLAlchemy(app)

class ReportSubscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.String(255), nullable=False)

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
    db.create_all()

# Use only for debugging db
def drop_tables():
    db.drop_all()


updater = Updater(token=telegram_api_token, use_context=True)
dispatcher = updater.dispatcher
webhook_url = "tension-data-recorder-git-telebotrev-luzikato-02.vercel.app/set-webhook"

def write_new_subs(chat_id):
    with app.app_context():  # Enter the application context
        new_data_entry = ReportSubscriber(
            chat_id=chat_id,
        )
        db.session.add(new_data_entry)
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

def echo(update: Update, context: CallbackContext) -> None:
    update.message.reply_text(update.message.text)

def send_report(msg):
    url = f'https://api.telegram.org/bot{telegram_api_token}/sendMessage' # Calling the telegram API to reply the message  
    subs_data = ReportSubscriber.query.with_entities(ReportSubscriber.chat_id).all()
    chat_ids = [value for (value,) in subs_data]  # Extracting values from the result
    print(chat_ids)
    for id in chat_ids:
        payload = {
            'chat_id': id,
            'text': msg
        }
        r = requests.post(url, json=payload)

        if r.status_code == 200:
            return "Report successfully sent to all subscribers."
        else: 
            return "Failed to send reports to all subscribers."

# Add your handlers to the dispatcher
start_handler = CommandHandler('start', start)
dispatcher.add_handler(start_handler)

echo_handler = MessageHandler(Filters.text & ~Filters.command, echo)
dispatcher.add_handler(echo_handler)

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
def twisting_recorder():
    return render_template('twisting.html')

@app.route('/weaving')
def weaving_recorder():
    return render_template('weaving.html')

@app.route('/showcase')
def show_data():
    return render_template('showcase.html')


@app.route('/store_tw', methods=['POST'])
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
    
    msg = f"""[🚨ALERT FOR FIXERS🚨]
    
Machine Number: {machine_number}
Operator: {operator}

Detected abnormalities per spindle: 
Spd No --- Min Val --- Max Val --- Problems
{spindles_with_problems}

Kindly confirm the listed problems and act accordingly.

[END OF REPORT]
    """
    if spindles_with_problems:
        send_report(msg=msg)
    return jsonify({"message": "CSV data stored in the database."})


@app.route('/store_wv', methods=['POST'])
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

    tension_data = json_data.get("tension_data", {})

    # Loop through all IDs and append to csv_data
    for sd, sd_data in tension_data.items():
        print(sd)
        csv_data += f"{sd}\n"
        for rw, rw_data in sd_data.items():
            print(rw)
            for col, col_data in rw_data.items():
                minTensionVal = col_data.get("MIN", "")
                maxTensionVal = col_data.get("MAX", "")
                csv_data += f"{rw},{col},{maxTensionVal},{minTensionVal}\n"
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
    return jsonify({"message": "CSV data stored in the database."})

@app.route('/get_tw_data')
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
def download_tw(entry_id):
    # Retrieve the associated CSV data based on the entry_id
    # For example, assuming your database model has a 'data' column
    csv = TwistingData.query.get(entry_id).csv_file
    m_n = TwistingData.query.get(entry_id).machine_number
    op = TwistingData.query.get(entry_id).operator
    i_n = TwistingData.query.get(entry_id).item_number
    dt = TwistingData.query.get(entry_id).datetime

    # Create a response with the CSV data and set appropriate headers
    response = send_file(
        io.BytesIO(csv),
        mimetype='text/csv; charset=utf-8',
        as_attachment=True,
        download_name=f'[{m_n}] - [{i_n}] - [{op}] - [{dt}].csv'
    )
    return response

@app.route('/download_wv/<entry_id>')
def download_wv(entry_id):
    # Retrieve the associated CSV data based on the entry_id
    # For example, assuming your database model has a 'data' column
    csv = WeavingData.query.get(entry_id).csv_file
    m_n = WeavingData.query.get(entry_id).machine_number
    op = WeavingData.query.get(entry_id).operator
    p_o = WeavingData.query.get(entry_id).production_order
    dt = WeavingData.query.get(entry_id).datetime

    # Create a response with the CSV data and set appropriate headers
    response = send_file(
        io.BytesIO(csv),
        mimetype='text/csv; charset=utf-8',
        as_attachment=True,
        download_name=f'[{m_n}] - [{p_o}] - [{op}] - [{dt}].csv'
    )
    return response

if __name__ == '__main__':
    with app.app_context():  # Enter the application context
        # drop_tables()
        create_tables()
    app.run(debug=False)