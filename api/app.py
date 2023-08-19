from flask import Flask, request, render_template, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
import uuid
import io

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///production_database.db'
db = SQLAlchemy(app)

class ProductionData(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=str(uuid.uuid4()))
    datetime = db.Column(db.String, nullable=False)
    operator = db.Column(db.String)
    machine_number = db.Column(db.Integer)
    item_number = db.Column(db.Integer)
    rpm = db.Column(db.Integer)
    tpm = db.Column(db.Integer)
    stdTen = db.Column(db.Integer)
    devTen = db.Column(db.Integer)
    csv_file = db.Column(db.LargeBinary)

def create_tables():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/store_csv', methods=['POST'])
def store_csv():
    csv_data = request.files["csv_data"].read()
    datetime = request.form["datetime"] 
    operator = request.form["operator"]
    machine_number = request.form["machine_number"]  
    item_number = request.form["item_number"]
    spd_rpm = request.form["RPM"]
    twm = request.form["TPM"]
    specTen = request.form["Spec. Tension"]
    devTens = request.form["Allow. Tens. Deviation"]  

    with app.app_context():  # Enter the application context
        new_data_entry = ProductionData(
            datetime=datetime,
            operator=operator,
            machine_number=machine_number,
            item_number=item_number,
            rpm = spd_rpm,
            tpm = twm,
            stdTen = specTen,
            devTen = devTens,
            csv_file=csv_data
        )

        db.session.add(new_data_entry)
        db.session.commit()
    return 'CSV data stored in the database.'

@app.route('/showcase')
def showcase():
    return render_template('showcase.html')

@app.route('/get_data')
def get_data():
    data = ProductionData.query.all()
    return jsonify([{'id': ten_data.id, 
                     'datetime': ten_data.datetime, 
                     'operator': ten_data.operator, 
                     'machine_number': ten_data.machine_number} for ten_data in data])

@app.route('/download/<entry_id>')
def download(entry_id):
    # Retrieve the associated CSV data based on the entry_id
    # For example, assuming your database model has a 'data' column
    csv = ProductionData.query.get(entry_id).csv_file
    m_n = ProductionData.query.get(entry_id).machine_number
    op = ProductionData.query.get(entry_id).operator
    it_n = ProductionData.query.get(entry_id).item_number
    dt = ProductionData.query.get(entry_id).datetime

    # Create a response with the CSV data and set appropriate headers
    response = send_file(
        io.BytesIO(csv),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'[{m_n}] - [{it_n}] - [{op}] - [{dt}].csv'
    )
    return response

if __name__ == '__main__':
    with app.app_context():  # Enter the application context
        create_tables()
    app.run(debug=True)