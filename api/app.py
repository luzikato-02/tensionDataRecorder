from flask import Flask, request, render_template, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
import io
import os

username = os.environ.get('DB_USERNAME')
password = os.environ.get('DB_PASSWORD')
hostname = os.environ.get('DB_HOST')
db_name = os.environ.get('DB_NAME')

print(f"Database Host: {hostname}")
port = 3306

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{username}:{password}@{hostname}:{port}/{db_name}'
db = SQLAlchemy(app)

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
    csv_data = request.files["csv_data"].read()
    datetime = request.form["datetime"] 
    operator = request.form["operator"]
    machine_number = request.form["machine_number"]  
    item_number = request.form["item_number"]
    spd_rpm = request.form["rpm"]
    twm = request.form["tpm"]
    specTen = request.form["spec_tension"]
    devTens = request.form["dev_tension"]  

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
    return 'CSV data stored in the database.'

@app.route('/store_wv', methods=['POST'])
def store_wv():
    csv_data = request.files["csv_data"].read()
    datetime = request.form["datetime"] 
    operator = request.form["operator"]
    machine_number = request.form["machine_number"]  
    production_order = request.form["production_order"]
    bale_no = request.form["bale_number"]
    color_code = request.form["color_code"]
    style = request.form["style"]
    counter_number = request.form["counter_number"]
    specTen = request.form["spec_tension"]
    devTens = request.form["dev_tension"]  

    with app.app_context():  # Enter the application context
        new_data_entry = WeavingData(
            datetime=datetime,
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
    return 'CSV data stored in the database.'

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
        mimetype='text/csv',
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
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'[{m_n}] - [{p_o}] - [{op}] - [{dt}].csv'
    )
    return response

if __name__ == '__main__':
    with app.app_context():  # Enter the application context
        # drop_tables()
        create_tables()
    app.run(debug=True)