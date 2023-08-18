from flask import Flask, request, render_template
from flask_sqlalchemy import SQLAlchemy
import uuid

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


if __name__ == '__main__':
    with app.app_context():  # Enter the application context
        create_tables()
    app.run(debug=True)