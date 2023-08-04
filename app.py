from flask import Flask, render_template, request
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import InputRequired

app = Flask(__name__)
app.config["SECRET_KEY"] = "your-secret-key"  # Replace with a secret key of your choice

# Create a list to store the submitted data as tuples (ID number, submitted number)
submitted_data = {}

class NumberForm(FlaskForm):
    number_input = StringField("Number", validators=[InputRequired()])
    submit_button = SubmitField("Submit")


@app.route("/", methods=["GET", "POST"])
def numpad_input():
    form = NumberForm()

    if form.validate_on_submit():
        number = form.number_input.data
        id_number = request.form.get("id_number", "")
        submitted_data[id_number] = number  # Store data in the dictionary
        form.number_input.data = ""
        print("Submitted data:")
        for id_number, number in submitted_data.items():
            print(f"ID: {id_number}, Number: {number}")
        print(submitted_data)
    return render_template("numpad_input.html", form=form)

if __name__ == "__main__":
    app.run(debug=True)
