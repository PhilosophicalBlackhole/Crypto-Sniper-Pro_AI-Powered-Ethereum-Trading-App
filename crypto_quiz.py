import tkinter as tk
from tkinter import messagebox

# Quiz data: list of dictionaries
quiz_data = [
    {
        "question": "What does 'HODL' mean in crypto trading?",
        "options": ["Hold On for Dear Life", "Hourly Dollar Limit", "High Order Deadline", "Help Our Digital Ledger"],
        "answer": "Hold On for Dear Life"
    },
    {
        "question": "What is a 'whale' in cryptocurrency?",
        "options": ["A newbie trader", "A large holder of cryptocurrency", "A mining computer", "A fraudulent coin"],
        "answer": "A large holder of cryptocurrency"
    },
    {
        "question": "What does 'FOMO' stand for?",
        "options": ["Fear of Missing Out", "Funding of Market Orders", "Future Options Market Order", "Fast Operational Market Offering"],
        "answer": "Fear of Missing Out"
    },
    # Add more questions here...
]

class QuizApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Crypto Trading Quiz")
        self.score = 0
        self.question_index = 0

        self.question_label = tk.Label(root, text="", wraplength=400, font=("Arial", 14))
        self.question_label.pack(pady=20)

        self.var = tk.StringVar()

        self.option_buttons = []
        for _ in range(4):
            btn = tk.Radiobutton(root, text="", variable=self.var, value="", font=("Arial", 12), anchor='w', justify='left')
            btn.pack(fill='x', padx=20, pady=5)
            self.option_buttons.append(btn)

        self.submit_btn = tk.Button(root, text="Submit Answer", command=self.submit_answer)
        self.submit_btn.pack(pady=20)

        self.load_question()

    def load_question(self):
        if self.question_index < len(quiz_data):
            q = quiz_data[self.question_index]
            self.question_label.config(text=f"Q{self.question_index + 1}: {q['question']}")
            self.var.set(None)  # Clear previous selection
            for i, option in enumerate(q["options"]):
                self.option_buttons[i].config(text=option, value=option)
        else:
            self.show_result()

    def submit_answer(self):
        selected = self.var.get()
        if not selected:
            messagebox.showwarning("No selection", "Please select an answer before submitting.")
            return
        correct_answer = quiz_data[self.question_index]["answer"]
        if selected == correct_answer:
            self.score += 1

        self.question_index += 1
        self.load_question()

    def show_result(self):
        messagebox.showinfo("Quiz Completed", f"You scored {self.score} out of {len(quiz_data)}!")
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    root.geometry("500x350")
    app = QuizApp(root)
    root.mainloop()