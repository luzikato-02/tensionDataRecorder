from flask import Flask, g, request, send_file
import sqlite3
import io

app = Flask(__name__)

DATABASE = 'production_database.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def create_tables():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS production_data (
            id INTEGER PRIMARY KEY,
            session_id TEXT NOT NULL,
            datetime TEXT NOT NULL,
            operator TEXT,
            machine_number INTEGER,
            item_number INTEGER,
            production_order TEXT,
            csv_file BLOB
        )
    ''')
    conn.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/store_csv', methods=['POST'])
def store_csv():
    csv_data = request.data  # Get raw binary data from the request
    conn = get_db()
    cursor = conn.cursor()
    
    # Insert the CSV data into the database
    cursor.execute('''
        INSERT INTO production_data (csv_file)
        VALUES (?)
    ''', (sqlite3.Binary(csv_data),))

    conn.commit()
    return 'CSV data stored in the database.'

if __name__ == '__main__':
    app.run(debug=True)