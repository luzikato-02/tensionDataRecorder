from flask import Flask, render_template, request
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import InputRequired

app = Flask(__name__)
app.config["SECRET_KEY"] = "your-secret-key"  # Replace with a secret key of your choice

# Create a dictionary to store submitted data (ID number as key, number as value)
submitted_data = {}
id_numbers = list(range(1, 85))
current_id_index = 0  # Index of the current ID in the list

class NumberForm(FlaskForm):
    number_input = StringField("Number")
    submit_button = SubmitField("Submit")


@app.route("/", methods=["GET", "POST"])
def numpad_input():
    form = NumberForm()
    global current_id_index

    if form.validate_on_submit():
        number = form.number_input.data
        id_number = id_numbers[current_id_index]
        submitted_data[id_number] = number
        form.number_input.data = ""
        print("Submitted data:")
        for id_number, number in submitted_data.items():
            print(f"ID: {id_number}, Number: {number}")
    
    if request.method == "POST" and "change_id" in request.form:
        direction = request.form["change_id"]
        if direction == "previous" and current_id_index > 0:
            current_id_index -= 1
        elif direction == "next" and current_id_index < len(id_numbers) - 1:
            current_id_index += 1

    return render_template("numpad_input.html", form=form, current_id=id_numbers[current_id_index])

if __name__ == "__main__":
    app.run(debug=True)
