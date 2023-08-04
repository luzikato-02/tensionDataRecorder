from flask import Flask, render_template, request
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import InputRequired

app = Flask(__name__)
app.config["SECRET_KEY"] = "your-secret-key"  # Replace with a secret key of your choice

# Create a list to store the submitted data as a dictionary with ID as key and value as value
data_ID = list(range(1, 85))
data_values = [0] * len(data_ID)
submitted_values = dict(zip(data_ID, data_values))

class NumberForm(FlaskForm):
    number_input = StringField("Number", validators=[InputRequired()])
    submit_button = SubmitField("Submit")

@app.route("/", methods=["GET", "POST"])
def numpad_input():
    form = NumberForm()

    if form.validate_on_submit():
        number = form.number_input.data
        id_number = int(request.form.get("id_number", ""))
        submitted_values[id_number] = number
        form.number_input.data = ""
        print("Submitted values:")
        for id_num, value in submitted_values.items():
            print(f"ID: {id_num}, Value: {value}")
    return render_template("numpad_input.html", 
                           form=form, 
                           current_id=1, 
                           current_value=submitted_values.get(1, ""), 
                           submitted_values=submitted_values)

@app.route("/get_submitted_values", methods=["GET"])
def get_submitted_values():
    return jsonify(submitted_values)

if __name__ == "__main__":
    app.run(debug=True)
