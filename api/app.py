from flask import Flask, render_template

app = Flask(__name__)

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



if __name__ == '__main__':
    app.run(debug=True)